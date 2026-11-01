import { GoogleGenAI } from '@google/genai';

const MODEL = 'gemini-3.5-flash-lite';

let client: GoogleGenAI | null = null;

// Create the client lazily so dotenv has already loaded GEMINI_API_KEY
const getClient = (): GoogleGenAI => {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY is missing from server/.env');
  }
  if (!client) {
    client = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }
  return client;
};

export const generateText = async (prompt: string): Promise<string> => {
  const response = await getClient().models.generateContent({
    model: MODEL,
    contents: prompt,
  });

  return response.text ?? '';
};
