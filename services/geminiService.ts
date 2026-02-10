import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { GameDesign } from "../types";

const getApiKey = () => process.env.API_KEY || '';

// Helper to handle Paid API Key requirement
export const checkPaidApiKey = async (): Promise<boolean> => {
  if ((window as any).aistudio) {
    return await (window as any).aistudio.hasSelectedApiKey();
  }
  return true; 
};

export const requestPaidApiKey = async () => {
  if ((window as any).aistudio) {
    await (window as any).aistudio.openSelectKey();
  }
};

const SYSTEM_INSTRUCTION = `
You are an expert educational board game designer specializing in creating fun, challenging, and solution-oriented games for children aged 8-14.
Your goal is to take a "Problem" (e.g., "Plastic Pollution", "Math Fractions", "Bullying") and design a complete board game concept around it.

The design must be:
1. **Fun & Creative**: Engaging mechanics, not just a quiz.
2. **Challenging**: Requires strategy or skill.
3. **Solution-Oriented**: The gameplay should teach how to solve the problem.
4. **Age Appropriate**: Simple enough for 8-year-olds but deep enough for 14-year-olds.

Output Format:
Return ONLY a JSON object. The structure must match exactly the fields requested in the schema.
For 'tileTypes', suggest 4-6 distinct types of spaces on the board.
For 'cardTypes', suggest 2-3 types of cards (e.g., "Event Cards", "Trivia Cards").
For 'color' in tileTypes, use a valid hex code string (e.g., "#FF5733").
`;

export const generateGameConcept = async (problem: string): Promise<GameDesign> => {
  const ai = new GoogleGenAI({ apiKey: getApiKey() });
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Design a board game to solve the problem: "${problem}".`,
      config: {
        tools: [{ googleSearch: {} }],
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            overview: { type: Type.STRING },
            goal: { type: Type.STRING },
            story: { type: Type.STRING },
            boardDesign: { type: Type.STRING, description: "A vivid visual description of what the board looks like." },
            tileTypes: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  effect: { type: Type.STRING },
                  color: { type: Type.STRING }
                },
                required: ["name", "effect", "color"]
              }
            },
            components: { type: Type.ARRAY, items: { type: Type.STRING } },
            cardTypes: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  type: { type: Type.STRING },
                  description: { type: Type.STRING },
                  examples: { type: Type.ARRAY, items: { type: Type.STRING } }
                },
                required: ["type", "description", "examples"]
              }
            },
            rules: { type: Type.ARRAY, items: { type: Type.STRING } },
            gameplay: { type: Type.ARRAY, items: { type: Type.STRING } },
            winningCondition: { type: Type.STRING },
            reward: { type: Type.STRING },
            learningOutcomes: { type: Type.ARRAY, items: { type: Type.STRING } }
          },
          required: ["title", "overview", "story", "boardDesign", "tileTypes", "cardTypes", "rules", "gameplay", "winningCondition", "learningOutcomes"]
        }
      }
    });

    const sources: { title: string; uri: string }[] = [];
    if (response.candidates?.[0]?.groundingMetadata?.groundingChunks) {
        response.candidates[0].groundingMetadata.groundingChunks.forEach((chunk: any) => {
            if (chunk.web?.uri) {
                sources.push({ title: chunk.web.title || "Source", uri: chunk.web.uri });
            }
        });
    }

    const text = response.text;
    if (!text) throw new Error("No response from Gemini");
    
    const design = JSON.parse(text) as GameDesign;
    design.sources = sources;
    return design;
  } catch (error) {
    console.error("Game concept generation failed:", error);
    throw error;
  }
};

export const generateBoardImage = async (description: string, title: string): Promise<string | null> => {
  try {
    const ai = new GoogleGenAI({ apiKey: getApiKey() });
    const prompt = `A top-down view of a board game board for a game called "${title}". 
    The style should be colorful, educational illustration, suitable for kids 8-14. 
    Details: ${description}. 
    The image should be a clear game board layout with a path, spaces, and central theme elements.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [{ text: prompt }]
      },
      config: {
        // Nano banana models do not support outputMimeType or responseSchema
      }
    });

    return extractImage(response);
  } catch (error) {
    console.error("Board image generation failed:", error);
    return null; 
  }
};

export const generateProBoardImage = async (description: string, title: string, size: '1K' | '2K' | '4K'): Promise<string | null> => {
    // Pro model requires Paid Key check
    const ai = new GoogleGenAI({ apiKey: getApiKey() });
    const prompt = `A top-down view of a board game board for a game called "${title}". 
    High quality, detailed educational illustration. 
    Details: ${description}.`;
    
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3-pro-image-preview',
            contents: { parts: [{ text: prompt }] },
            config: {
                imageConfig: { imageSize: size, aspectRatio: "1:1" }
            }
        });
        return extractImage(response);
    } catch (e) {
        console.error("Pro image generation failed:", e);
        throw e;
    }
};

export const editBoardImage = async (base64Image: string, instruction: string): Promise<string | null> => {
    try {
        const ai = new GoogleGenAI({ apiKey: getApiKey() });
        // Clean base64 header if present
        const imageData = base64Image.includes('base64,') ? base64Image.split('base64,')[1] : base64Image;
        
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: {
                parts: [
                    { inlineData: { mimeType: 'image/png', data: imageData } },
                    { text: instruction }
                ]
            }
        });
        return extractImage(response);
    } catch (e) {
        console.error("Image edit failed:", e);
        throw e;
    }
};

export const generateVeoVideo = async (base64Image: string): Promise<string | null> => {
    // Veo requires Paid Key check
    const ai = new GoogleGenAI({ apiKey: getApiKey() });
    const imageData = base64Image.includes('base64,') ? base64Image.split('base64,')[1] : base64Image;

    try {
        let operation = await ai.models.generateVideos({
            model: 'veo-3.1-fast-generate-preview',
            prompt: "Cinematic, magical animation of this game board environment coming to life, smooth motion.",
            image: {
                imageBytes: imageData,
                mimeType: 'image/png',
            },
            config: {
                numberOfVideos: 1,
                resolution: '720p',
                aspectRatio: '16:9'
            }
        });

        // Polling loop
        while (!operation.done) {
            await new Promise(resolve => setTimeout(resolve, 5000));
            operation = await ai.operations.getVideosOperation({operation: operation});
        }

        const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
        if (!downloadLink) return null;

        // Fetch the video content using the API key
        const response = await fetch(`${downloadLink}&key=${getApiKey()}`);
        const blob = await response.blob();
        return URL.createObjectURL(blob);
    } catch (e) {
        console.error("Veo video generation failed:", e);
        throw e;
    }
};

const extractImage = (response: GenerateContentResponse): string | null => {
    if (response.candidates?.[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData && part.inlineData.data) {
           return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
        }
      }
    }
    return null;
}