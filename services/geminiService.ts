
import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

export const generateBiography = async (
  name: string,
  keywords: string,
  lang: 'pl' | 'en' = 'pl'
): Promise<string> => {
  if (!apiKey) {
    console.warn("API Key is missing for Gemini");
    return "Proszę skonfigurować klucz API, aby skorzystać z generatora biografii.";
  }

  try {
    const prompt = `
      Napisz pełną szacunku, wzruszającą, ale stonowaną biografię na stronę pamiątkową (wirtualny cmentarz) dla osoby o imieniu: ${name}.
      
      Wykorzystaj te słowa kluczowe i informacje o życiu: ${keywords}.
      
      Styl: Poważny, elegancki, literacki. Długość: około 200-300 słów.
      Język: Polski.
      Nie dodawaj nagłówków typu "Biografia", po prostu zacznij tekst.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text || "Nie udało się wygenerować tekstu.";
  } catch (error) {
    console.error("Error generating biography:", error);
    return "Wystąpił błąd podczas generowania biografii. Spróbuj ponownie później.";
  }
};
