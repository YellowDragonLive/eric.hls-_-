import { GoogleGenAI, Modality } from "@google/genai";

export class GeminiService {
  private ai: GoogleGenAI | null = null;

  constructor(apiKey: string) {
    if (apiKey) {
      this.ai = new GoogleGenAI({ apiKey });
    }
  }

  async analyzeImage(base64Data: string, mimeType: string): Promise<string> {
    if (!this.ai) {
      throw new Error("API Key not configured");
    }

    try {
      // Using the lighter model for speed
      const response = await this.ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: {
          parts: [
            {
              inlineData: {
                data: base64Data,
                mimeType: mimeType
              }
            },
            {
              text: "请分析这张图片，用中文提供一句简短有力的描述，概括主体或氛围，像一句诗或画名。不要使用markdown。"
            }
          ]
        },
        config: {
          responseModalities: [Modality.TEXT],
          thinkingConfig: { thinkingBudget: 0 } // Disable thinking for speed
        }
      });

      return response.text || "暂无描述";
    } catch (error) {
      console.error("Gemini Analysis Error:", error);
      return "无法分析图片";
    }
  }
}

export const blobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      // Remove data:image/xxx;base64, prefix
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};