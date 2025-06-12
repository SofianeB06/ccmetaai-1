// OpenAI service for metadata generation

import OpenAI from "openai";
import { MarketingFramework, MetadataProposal } from '../types';
import { MAX_TITLE_LENGTH, MAX_META_DESC_LENGTH, ALL_MARKETING_FRAMEWORKS_FOR_DETECTION } from '../constants';
import { truncateAtWord, truncateAtSentence } from '../utils/textHelpers';

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
if (!OPENAI_API_KEY || OPENAI_API_KEY === "YOUR_OPENAI_API_KEY") {
  console.error("OpenAI API Key is not configured. Please set the OPENAI_API_KEY environment variable.");
  // Potentially throw an error or handle this state in the UI
}

export const openai = new OpenAI({ apiKey: OPENAI_API_KEY! });
const modelName = 'gpt-3.5-turbo';

function parseJsonFromOpenAIResponse(text: string): any {
  let jsonStr = text.trim();
  const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
  const match = jsonStr.match(fenceRegex);
  if (match && match[2]) {
    jsonStr = match[2].trim();
  }
  try {
    return JSON.parse(jsonStr);
  } catch (e) {
    console.error("Failed to parse JSON response from OpenAI:", e);
    console.error("Original text from OpenAI:", text);
    throw new Error(`Invalid JSON response from AI: ${(e as Error).message}. Original text: ${text.substring(0,100)}...`);
  }
}

export const generateMetadataOpenAI = async (
  textContent: string,
  framework: MarketingFramework | string,
  justification: string,
  language: string = 'fr'
): Promise<MetadataProposal[]> => {
  if (!OPENAI_API_KEY || OPENAI_API_KEY === "YOUR_OPENAI_API_KEY") throw new Error("OpenAI API Key not configured.");

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
N'inclus aucun autre texte ou explication en dehors du tableau JSON.`;

  try {
    const response = await openai.chat.completions.create({
      model: modelName,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7
    });

    const aiMessage = response.choices[0]?.message?.content || '';
    const parsedJson = parseJsonFromOpenAIResponse(aiMessage);

    if (!Array.isArray(parsedJson) || parsedJson.length === 0 || !parsedJson[0].title || !parsedJson[0].metaDescription) {
      throw new Error('Invalid metadata proposals response structure from AI.');
    }

    return parsedJson.slice(0,3).map((p: any) => ({
      title: truncateAtWord(String(p.title || ""), MAX_TITLE_LENGTH),
      metaDescription: truncateAtSentence(String(p.metaDescription || ""), MAX_META_DESC_LENGTH),
    }));
  } catch (error) {
    console.error("Error generating metadata with OpenAI:", error);
    throw error;
  }
};
