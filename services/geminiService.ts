
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

    // Highly directive prompt to force the model into "Editor Mode" rather than "Generator Mode"
    const enhancedPrompt = `
      ACT AS A PROFESSIONAL PHOTO EDITOR AND LANDSCAPE ARCHITECT.
      
      YOUR GOAL: Modify the attached input image EXACTLY according to the user's instruction.

      USER INSTRUCTION: "${instruction}"

      STRICT EDITING RULES:
      1. **Targeted Action**: Identify the specific element mentioned in the instruction (e.g., "pond", "patio", "tree") and apply the change ONLY to that element.
      2. **Size & Scale**: If the user asks to make something "smaller", "larger", "wider", or "narrower", you MUST visibly and significantly alter its proportions.
         - If making "smaller": Shrink the object and fill the empty space with appropriate background (grass, gravel, paving) that matches the surroundings.
         - If making "larger": Expand the object realistically, displacing surrounding elements if necessary.
      3. **Removal & Addition**: 
         - "Remove": Erase the object completely and seamless inpaint the background.
         - "Add": Place the new object in a perspective-correct position that fits the scene's depth and lighting.
      4. **Preservation**: Do NOT regenerate the house, the sky, or unrelated existing features. Keep the original camera angle, lighting, and style. The output must look like the SAME photo, just edited.
      5. **Realism**: The final result must be indistinguishable from a real photograph.

      Execute this edit now.
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
