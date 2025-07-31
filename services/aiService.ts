import { GoogleGenAI } from "@google/genai";

const fileToGenerativePart = async (file: File) => {
  const base64EncodedDataPromise = new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
    reader.readAsDataURL(file);
  });
  return {
    inlineData: { data: await base64EncodedDataPromise, mimeType: file.type },
  };
};

export const generateNameFromImage = async (imageFile: File): Promise<string> => {
    if (!process.env.API_KEY) {
        throw new Error("API_KEY is not set in environment variables.");
    }
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    const imagePart = await fileToGenerativePart(imageFile);
    const textPart = {
        text: `Describe this image with a short, descriptive, file-safe name in English. Use 3-5 words separated by hyphens. For example: 'a-cute-cat-sleeping'. Do not include file extensions, quotes, or any other explanatory text. Only provide the name string.`
    };

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: { parts: [imagePart, textPart] },
    });

    const text = response.text.trim();

    const sanitizedName = text
        .toLowerCase()
        .replace(/['"`]/g, '') // Remove quotes
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-');

    if (!sanitizedName) {
        throw new Error("AI failed to generate a valid name.");
    }
    
    return sanitizedName;
};