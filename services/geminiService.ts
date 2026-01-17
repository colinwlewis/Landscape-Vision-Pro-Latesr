
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const fileToPart = async (file: File): Promise<{ inlineData: { data: string; mimeType: string } }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (reader.result && typeof reader.result === 'string') {
        const base64Data = reader.result.split(',')[1];
        resolve({
          inlineData: {
            data: base64Data,
            mimeType: file.type,
          },
        });
      } else {
        reject(new Error("Failed to read file"));
      }
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

const base64ToPart = (base64String: string): { inlineData: { data: string; mimeType: string } } => {
  const match = base64String.match(/^data:([^;]+);base64,(.+)$/);
  if (!match || match.length !== 3) {
    throw new Error("Invalid image data format");
  }
  return {
    inlineData: {
      mimeType: match[1],
      data: match[2],
    },
  };
};

export const generateLandscapeVisualization = async (
  imageSource: File | string,
  instruction: string
): Promise<string> => {
  try {
    let imagePart;
    if (imageSource instanceof File) {
      imagePart = await fileToPart(imageSource);
    } else {
      imagePart = base64ToPart(imageSource);
    }

    const enhancedPrompt = `
      You are an expert landscape architect and photo editor. 
      Your task is to modify the attached property image according to this specific instruction: "${instruction}".

      CRITICAL EXECUTION GUIDELINES:
      1. **Strict Adherence**: Follow the instruction exactly. If asked to resize an object (e.g., "make the pond smaller"), adjust its scale significantly and naturally fill the surrounding space. If asked to remove something, erase it completely and reconstruct the background.
      2. **Preservation**: Do NOT modify the house structure, windows, roof, or background sky unless explicitly told to. Keep the perspective and camera angle identical to the original.
      3. **Photorealism**: The result must look like a real photograph. Match the lighting, shadows, and color grading of the original input image.
      4. **Contextual Blending**: Ensure any new or modified elements (plants, hardscape, water features) blend seamlessly with the existing environment.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [imagePart, { text: enhancedPrompt }],
      },
    });

    const parts = response.candidates?.[0]?.content?.parts;
    if (!parts) throw new Error("No content generated");

    for (const part of parts) {
      if (part.inlineData?.data) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    throw new Error("No image data found");
  } catch (error) {
    console.error("Gemini Generation Error:", error);
    throw error;
  }
};
