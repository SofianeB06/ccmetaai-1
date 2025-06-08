
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { MarketingFramework, MetadataProposal, DetectedFrameworkInfo } from '../types';
import { MAX_TITLE_LENGTH, MAX_META_DESC_LENGTH, ALL_MARKETING_FRAMEWORKS_FOR_DETECTION } from '../constants';
import { truncateAtWord } from '../utils/textHelpers';

const API_KEY = process.env.API_KEY;
if (!API_KEY || API_KEY === "YOUR_GEMINI_API_KEY") {
  console.error("Gemini API Key is not configured. Please set the API_KEY environment variable.");
  // Potentially throw an error or handle this state in the UI
}
const ai = new GoogleGenAI({ apiKey: API_KEY! });
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
  if (!API_KEY || API_KEY === "YOUR_GEMINI_API_KEY") throw new Error("API Key not configured for Gemini.");
  const frameworksList = ALL_MARKETING_FRAMEWORKS_FOR_DETECTION.map(f => `- ${f.name}: ${f.description}`).join('\n');

  const prompt = `
Analyze the following webpage content and determine the most suitable marketing framework.
If no specific framework is strongly evident or if the content is generic, suggest 'NONE'.

Webpage Content Snippet (first 1500 characters):
---
${textContent.substring(0, 1500)}
---

Consider these marketing frameworks:
${frameworksList}
- NONE: For general content or when no specific framework is clearly applicable.

Which marketing framework is most prominently used or would be most effective for this content?
Provide the name of the framework (e.g., AIDA, PAS, STDC, BAB, FAB, QUEST, NONE) and a single, concise sentence (max 20 words) justifying your choice.

Return your answer ONLY in JSON format like this:
{"framework": "FRAMEWORK_NAME", "justification": "Your concise justification here."}
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
    justification: string
): Promise<MetadataProposal[]> => {
    if (!API_KEY || API_KEY === "YOUR_GEMINI_API_KEY") throw new Error("API Key not configured for Gemini.");

    const frameworkDescription = ALL_MARKETING_FRAMEWORKS_FOR_DETECTION.find(f => f.name === framework)?.description || justification;

    const prompt = `
You are an expert SEO copywriter. Based on the following webpage content and the identified marketing approach, generate 3 unique and compelling SEO-optimized suggestions.

Webpage Content Snippet (first 2000 characters):
---
${textContent.substring(0, 2000)}
---

Identified Marketing Approach: ${framework} (${frameworkDescription})

For each of the 3 suggestions, provide:
1. A 'title' (strict maximum ${MAX_TITLE_LENGTH} characters).
2. A 'metaDescription' (strict maximum ${MAX_META_DESC_LENGTH} characters).

Ensure the suggestions are:
- Unique from each other.
- Highly engaging to maximize click-through rate (CTR).
- Strictly adhere to the character limits.
- Incorporate primary keywords from the content naturally.
- Reflect the tone and purpose of the webpage content.

Return your answer ONLY as a JSON array of 3 objects, where each object has "title" and "metaDescription" properties.
Example:
[
  {"title": "Example Title 1 (Max ${MAX_TITLE_LENGTH} chars)", "metaDescription": "Example meta description 1... (Max ${MAX_META_DESC_LENGTH} chars)"},
  {"title": "Example Title 2 (Max ${MAX_TITLE_LENGTH} chars)", "metaDescription": "Example meta description 2... (Max ${MAX_META_DESC_LENGTH} chars)"},
  {"title": "Example Title 3 (Max ${MAX_TITLE_LENGTH} chars)", "metaDescription": "Example meta description 3... (Max ${MAX_META_DESC_LENGTH} chars)"}
]
Do not include any other text or explanations outside the JSON array.
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
            metaDescription: truncateAtWord(String(p.metaDescription || ""), MAX_META_DESC_LENGTH),
        }));
    } catch (error) {
        console.error("Error generating metadata:", error);
        throw error;
    }
};
