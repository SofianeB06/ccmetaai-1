import OpenAI from 'openai';
import { MarketingFramework, MetadataProposal, DetectedFrameworkInfo } from '../types';
import { MAX_TITLE_LENGTH, MAX_META_DESC_LENGTH, ALL_MARKETING_FRAMEWORKS_FOR_DETECTION } from '../constants';
import { truncateAtWord, truncateAtSentence } from '../utils/textHelpers';

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
if (!OPENAI_API_KEY || OPENAI_API_KEY === "YOUR_OPENAI_API_KEY") {
  console.error('OpenAI API Key is not configured. Please set the OPENAI_API_KEY environment variable.');
}

let ai: OpenAI | null = null;
const getAIClient = (): OpenAI => {
  if (!ai) {
    if (!OPENAI_API_KEY || OPENAI_API_KEY === 'YOUR_OPENAI_API_KEY') {
      throw new Error('OpenAI API Key not configured.');
    }
    ai = new OpenAI({ apiKey: OPENAI_API_KEY });
  }
  return ai;
};

// Allows injecting a custom OpenAI client (e.g. for tests)
export const setOpenAIClient = (client: OpenAI) => {
  ai = client;
};
const modelName = 'gpt-4o';

function parseJsonFromOpenAIResponse(text: string): any {
  try {
    return JSON.parse(text.trim());
  } catch (e) {
    console.error('Failed to parse JSON response from OpenAI:', e);
    console.error('Original text from OpenAI:', text);
    throw new Error(`Invalid JSON response from AI: ${(e as Error).message}. Original text: ${text.substring(0,100)}...`);
  }
}

export const detectLanguage = async (textContent: string): Promise<string> => {
  if (!OPENAI_API_KEY || OPENAI_API_KEY === 'YOUR_OPENAI_API_KEY') throw new Error('OpenAI API Key not configured.');
  const prompt = `Identify the primary language of the text below and respond ONLY in JSON with the ISO 639-1 code under the key "language".\n\n---\n${textContent.substring(0, 1000)}\n---`;
  try {
    const client = getAIClient();
    const response = await client.chat.completions.create({
      model: modelName,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0,
      response_format: { type: 'json_object' }
    });
    const parsed = parseJsonFromOpenAIResponse(response.choices[0].message?.content || '');
    const code = String(parsed.language || '').trim().toLowerCase();
    if (!/^[a-z]{2}$/.test(code)) {
      throw new Error('Invalid language code received from AI');
    }
    return code;
  } catch (error) {
    console.error('Error detecting language:', error);
    throw error;
  }
};

export const detectFramework = async (textContent: string): Promise<DetectedFrameworkInfo> => {
  if (!OPENAI_API_KEY || OPENAI_API_KEY === 'YOUR_OPENAI_API_KEY') throw new Error('OpenAI API Key not configured.');
  const frameworksList = ALL_MARKETING_FRAMEWORKS_FOR_DETECTION.map(f => `- ${f.name}: ${f.description}`).join('\n');
  const prompt = `
Analyse le contenu de la page ci-dessous et d\u00e9termine le cadre marketing le plus pertinent.
Si aucun cadre n'est clairement identifiable ou si le texte est g\u00e9n\u00e9rique, indique "NONE".

Extrait du contenu de la page (1500 premiers caract\u00e8res) :
---
${textContent.substring(0, 1500)}
---

Cadres marketing possibles :
${frameworksList}
- NONE : pour un contenu g\u00e9n\u00e9ral ou lorsqu'aucun cadre sp\u00e9cifique ne s'applique.

Quel cadre marketing est le plus pr\u00e9sent ou serait le plus efficace pour ce contenu ?
Donne uniquement le nom du cadre (ex. AIDA, PAS, STDC, BAB, FAB, QUEST, NONE) ainsi qu'une phrase concise (20 mots maximum) justifiant ton choix.

R\u00e9ponds UNIQUEMENT en JSON au format :
{"framework": "NOM_DU_CADRE", "justification": "Ta justification concise ici."}`;
  try {
    const client = getAIClient();
    const response = await client.chat.completions.create({
      model: modelName,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
      response_format: { type: 'json_object' }
    });
    const parsedJson = parseJsonFromOpenAIResponse(response.choices[0].message?.content || '');
    if (!parsedJson.framework || !parsedJson.justification) {
      throw new Error('Invalid framework detection response structure from AI.');
    }
    let detectedFrameworkKey = parsedJson.framework.toUpperCase().replace(/\s+/g, '_');
    if (!Object.values(MarketingFramework).includes(detectedFrameworkKey as MarketingFramework)) {
      console.warn(`Detected framework "${parsedJson.framework}" is not in predefined list. Treating as custom or defaulting.`);
      const knownFramework = Object.keys(MarketingFramework).find(key => key === detectedFrameworkKey);
      if(!knownFramework) {
        const matchedFramework = ALL_MARKETING_FRAMEWORKS_FOR_DETECTION.find(f => f.name.toUpperCase() === parsedJson.framework.toUpperCase());
        if(matchedFramework) {
          detectedFrameworkKey = matchedFramework.name.toUpperCase() as MarketingFramework;
        } else {
          detectedFrameworkKey = parsedJson.framework;
        }
      }
    }
    return {
      framework: detectedFrameworkKey as MarketingFramework | string,
      justification: parsedJson.justification,
    };
  } catch (error) {
    console.error('Error detecting framework:', error);
    throw error;
  }
};

export const generateMetadata = async (
  textContent: string,
  framework: MarketingFramework | string,
  justification: string,
  language: string = 'fr'
): Promise<MetadataProposal[]> => {
  if (!OPENAI_API_KEY || OPENAI_API_KEY === 'YOUR_OPENAI_API_KEY') throw new Error('OpenAI API Key not configured.');
  const frameworkDescription = ALL_MARKETING_FRAMEWORKS_FOR_DETECTION.find(f => f.name === framework)?.description || justification;
  const prompt = `
Tu es un r\u00e9dacteur SEO expert. \u00c0 partir du contenu de la page ci-dessous et du cadre marketing identifi\u00e9, g\u00e9n\u00e8re 3 propositions uniques et convaincantes optimis\u00e9es pour le SEO.

Extrait du contenu de la page (premiers 2000 caract\u00e8res) :
---
${textContent.substring(0, 2000)}
---

Cadre marketing identifi\u00e9 : ${framework} (${frameworkDescription})

Pour chacune des 3 propositions, fournis :
1. un 'title' (maximum strict de ${MAX_TITLE_LENGTH} caract\u00e8res),
2. une 'metaDescription' (maximum strict de ${MAX_META_DESC_LENGTH} caract\u00e8res).
Les titres et les meta descriptions doivent \u00eatre r\u00e9dig\u00e9s en ${language}.

Assure-toi que les propositions sont :
- uniques entre elles,
- tr\u00e8s engageantes pour maximiser le taux de clic,
- conformes aux limites de caract\u00e8res,
- int\u00e9grant naturellement les mots-cl\u00e9s principaux du contenu,
- fid\u00e8les au ton et \u00e0 l'objectif de la page.

Rends ta r\u00e9ponse UNIQUEMENT sous la forme d'un tableau JSON de 3 objets poss\u00e9dant les propri\u00e9t\u00e9s "title" et "metaDescription".
Exemple :
[
  {"title": "Exemple de titre 1 (Max ${MAX_TITLE_LENGTH} caract\u00e8res)", "metaDescription": "Exemple de m\u00e9ta description 1... (Max ${MAX_META_DESC_LENGTH} caract\u00e8res)"},
  {"title": "Exemple de titre 2 (Max ${MAX_TITLE_LENGTH} caract\u00e8res)", "metaDescription": "Exemple de m\u00e9ta description 2... (Max ${MAX_META_DESC_LENGTH} caract\u00e8res)"},
  {"title": "Exemple de titre 3 (Max ${MAX_TITLE_LENGTH} caract\u00e8res)", "metaDescription": "Exemple de m\u00e9ta description 3... (Max ${MAX_META_DESC_LENGTH} caract\u00e8res)"}
]
N'inclus aucun autre texte ou explication en dehors du tableau JSON.`;
  try {
    const client = getAIClient();
    const response = await client.chat.completions.create({
      model: modelName,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      response_format: { type: 'json_object' }
    });
    const parsedJson = parseJsonFromOpenAIResponse(response.choices[0].message?.content || '');
    if (!Array.isArray(parsedJson) || parsedJson.length === 0 || !parsedJson[0].title || !parsedJson[0].metaDescription) {
      throw new Error('Invalid metadata proposals response structure from AI.');
    }
    return parsedJson.slice(0,3).map((p: any) => ({
      title: truncateAtWord(String(p.title || ''), MAX_TITLE_LENGTH),
      metaDescription: truncateAtSentence(String(p.metaDescription || ''), MAX_META_DESC_LENGTH),
    }));
  } catch (error) {
    console.error('Error generating metadata:', error);
    throw error;
  }
};
