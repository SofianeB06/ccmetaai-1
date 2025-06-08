
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { MarketingFramework, MetadataProposal, DetectedFrameworkInfo } from '../types';
import { MAX_TITLE_LENGTH, MAX_META_DESC_LENGTH, ALL_MARKETING_FRAMEWORKS_FOR_DETECTION } from '../constants';
import { truncateAtWord, truncateAtSentence } from '../utils/textHelpers';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
if (!GEMINI_API_KEY || GEMINI_API_KEY === "YOUR_GEMINI_API_KEY") {
  console.error("Gemini API Key is not configured. Please set the GEMINI_API_KEY environment variable.");
  // Potentially throw an error or handle this state in the UI
}
const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY! });
const modelName = 'gemini-2.5-flash-preview-04-17';

function parseJsonFromGeminiResponse(text: string): any {
  let jsonStr = text.trim();
  const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s; // Matches ```json ... ``` or ``` ... ```
  const match = jsonStr.match(fenceRegex);
  if (match && match[2]) {
    jsonStr = match[2].trim();
  }
  try {
    return JSON.parse(jsonStr);
  } catch (e) {
    console.error("Failed to parse JSON response from Gemini:", e);
    console.error("Original text from Gemini:", text);
    throw new Error(`Invalid JSON response from AI: ${ (e as Error).message }. Original text: ${text.substring(0,100)}...`);
  }
}

export const detectFramework = async (textContent: string): Promise<DetectedFrameworkInfo> => {
  if (!GEMINI_API_KEY || GEMINI_API_KEY === "YOUR_GEMINI_API_KEY") throw new Error("Gemini API Key not configured.");
  const frameworksList = ALL_MARKETING_FRAMEWORKS_FOR_DETECTION.map(f => `- ${f.name}: ${f.description}`).join('\n');

  const prompt = `
Analyse le contenu de la page ci-dessous et détermine le cadre marketing le plus pertinent.
Si aucun cadre n'est clairement identifiable ou si le texte est générique, indique "NONE".

Extrait du contenu de la page (1500 premiers caractères) :
---
${textContent.substring(0, 1500)}
---

Cadres marketing possibles :
${frameworksList}
- NONE : pour un contenu général ou lorsqu'aucun cadre spécifique ne s'applique.

Quel cadre marketing est le plus présent ou serait le plus efficace pour ce contenu ?
Donne uniquement le nom du cadre (ex. AIDA, PAS, STDC, BAB, FAB, QUEST, NONE) ainsi qu'une phrase concise (20 mots maximum) justifiant ton choix.

Réponds UNIQUEMENT en JSON au format :
{"framework": "NOM_DU_CADRE", "justification": "Ta justification concise ici."}
`;

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
        model: modelName,
        contents: prompt,
        config: {
            responseMimeType: "application/json", // Request JSON output directly if model supports it well with prompt
            temperature: 0.3, // Lower temperature for more deterministic framework detection
        }
    });
    const parsedJson = parseJsonFromGeminiResponse(response.text);

    if (!parsedJson.framework || !parsedJson.justification) {
        throw new Error('Invalid framework detection response structure from AI.');
    }
    
    let detectedFrameworkKey = parsedJson.framework.toUpperCase().replace(/\s+/g, '_');
    if (!Object.values(MarketingFramework).includes(detectedFrameworkKey as MarketingFramework)) {
        // If it's not one of the predefined enums, treat it as custom or default to NONE
        console.warn(`Detected framework "${parsedJson.framework}" is not in predefined list. Treating as custom or defaulting.`);
        // You might want to map common variations here or default to CUSTOM / NONE
        const knownFramework = Object.keys(MarketingFramework).find(key => key === detectedFrameworkKey);
        if(!knownFramework) {
            // Check if the name is one of the known names but not matching enum key (e.g. "Problem Agitate Solution" for PAS)
            const matchedFramework = ALL_MARKETING_FRAMEWORKS_FOR_DETECTION.find(f => f.name.toUpperCase() === parsedJson.framework.toUpperCase());
            if(matchedFramework) {
                detectedFrameworkKey = matchedFramework.name.toUpperCase() as MarketingFramework;
            } else {
                 // Fallback if truly unknown or very custom; could be handled as MarketingFramework.CUSTOM
                 // For now, let's keep the string value as detected by AI if it's not mapping to enum.
                 // The UI will handle it with a generic "Custom" tag if needed or display the string.
                 detectedFrameworkKey = parsedJson.framework; // keep as string
            }
        }
    }


    return {
        framework: detectedFrameworkKey as MarketingFramework | string,
        justification: parsedJson.justification,
    };
  } catch (error) {
    console.error("Error detecting framework:", error);
    throw error;
  }
};


export const generateMetadata = async (
    textContent: string,
    framework: MarketingFramework | string,
    justification: string,
    language: string = 'fr'
): Promise<MetadataProposal[]> => {
    if (!GEMINI_API_KEY || GEMINI_API_KEY === "YOUR_GEMINI_API_KEY") throw new Error("Gemini API Key not configured.");

    const frameworkDescription = ALL_MARKETING_FRAMEWORKS_FOR_DETECTION.find(f => f.name === framework)?.description || justification;

    const prompt = `
Tu es un rédacteur SEO expert. À partir du contenu de la page ci-dessous et du cadre marketing identifié, génère 3 propositions uniques et convaincantes optimisées pour le SEO.

Extrait du contenu de la page (premiers 2000 caractères) :
---
${textContent.substring(0, 2000)}
---

Cadre marketing identifié : ${framework} (${frameworkDescription})

Pour chacune des 3 propositions, fournis :
1. un 'title' (maximum strict de ${MAX_TITLE_LENGTH} caractères),
2. une 'metaDescription' (maximum strict de ${MAX_META_DESC_LENGTH} caractères).
Les titres et les meta descriptions doivent être rédigés en ${language}.

Assure-toi que les propositions sont :
- uniques entre elles,
- très engageantes pour maximiser le taux de clic,
- conformes aux limites de caractères,
- intégrant naturellement les mots-clés principaux du contenu,
- fidèles au ton et à l'objectif de la page.

Rends ta réponse UNIQUEMENT sous la forme d'un tableau JSON de 3 objets possédant les propriétés "title" et "metaDescription".
Exemple :
[
  {"title": "Exemple de titre 1 (Max ${MAX_TITLE_LENGTH} caractères)", "metaDescription": "Exemple de méta description 1... (Max ${MAX_META_DESC_LENGTH} caractères)"},
  {"title": "Exemple de titre 2 (Max ${MAX_TITLE_LENGTH} caractères)", "metaDescription": "Exemple de méta description 2... (Max ${MAX_META_DESC_LENGTH} caractères)"},
  {"title": "Exemple de titre 3 (Max ${MAX_TITLE_LENGTH} caractères)", "metaDescription": "Exemple de méta description 3... (Max ${MAX_META_DESC_LENGTH} caractères)"}
]
N'inclus aucun autre texte ou explication en dehors du tableau JSON.
`;

    try {
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: modelName,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                temperature: 0.7, // Higher temperature for more creative metadata
            }
        });

        const parsedJson = parseJsonFromGeminiResponse(response.text);

        if (!Array.isArray(parsedJson) || parsedJson.length === 0 || !parsedJson[0].title || !parsedJson[0].metaDescription) {
            throw new Error('Invalid metadata proposals response structure from AI.');
        }

        // Validate and truncate if necessary (though the prompt is strict)
        return parsedJson.slice(0,3).map((p: any) => ({
            title: truncateAtWord(String(p.title || ""), MAX_TITLE_LENGTH),
            metaDescription: truncateAtSentence(String(p.metaDescription || ""), MAX_META_DESC_LENGTH),
        }));
    } catch (error) {
        console.error("Error generating metadata:", error);
        throw error;
    }
};
