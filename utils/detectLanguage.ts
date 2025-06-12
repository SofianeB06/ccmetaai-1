export interface LLMLike {
  models: {
    generateContent: (opts: any) => Promise<{ text: string }>
  };
}

export const detectLanguage = async (
  text: string,
  genAI: LLMLike
): Promise<string> => {
  const prompt = `Identify the primary language of the text below. Reply only with the ISO 639-1 code.\n\n${text}`;
  const response = await genAI.models.generateContent({ contents: prompt });
  return response.text.trim();
};
