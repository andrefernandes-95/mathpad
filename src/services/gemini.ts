import { GoogleGenAI } from "@google/genai";

// Standard prompt for Math Exercise Analysis
const SYSTEM_PROMPT = `You are an expert Math Tutor and Assistant. You will be provided with images:
1. An image of a mathematical exercise or textbook problem.
2. Optional: An image of a student's handwritten attempt to solve the problem.

Your goal is to provide a premium educational experience:
- **OCR & Problem Identification**: Clearly state the problem you've identified from the first image.
- **Solution Verification**: If a second image (handwritten work) is provided, meticulously check each step.
- **Educational Feedback**: 
    - Do NOT just give the final answer immediately.
    - If there are mistakes, point them out gently and explain *why* they might have happened.
    - Provide a "Hint" first, then a "Step-by-Step Guidance".
    - Use clear Markdown formatting with headers, lists, and potentially LaTeX (using $ symbols) for math expressions.
- **Encouragement**: Be supportive and professional.

Return your analysis in structured Markdown.`;

/**
 * Service to interact with the new Gemini 3 Flash Preview via @google/genai
 */
export class GeminiService {
  private client: GoogleGenAI;

  constructor(apiKey: string) {
    if (!apiKey || apiKey === "YOUR_GEMINI_API_KEY_HERE") {
      throw new Error("Invalid API Key. Please provide a valid Gemini API Key.");
    }
    // The new SDK takes apiKey in the initialization options
    this.client = new GoogleGenAI({ apiKey });
  }

  /**
   * Analyze an exercise and/or solution images using Gemini 3
   * @param imageBase64s Array of base64 encoded images
   */
  async analyzeExercise(imageBase64s: string[]): Promise<string> {
    if (imageBase64s.length === 0) {
      throw new Error("No images provided for analysis.");
    }

    try {
      console.log("Analyzing with Gemini 3 Flash Preview...");
      
      const imageParts = imageBase64s.map(b64 => {
        const cleanBase64 = b64.includes(",") ? b64.split(",")[1] : b64;
        return {
          inlineData: {
            data: cleanBase64,
            mimeType: "image/jpeg",
          },
        };
      });

      const response = await this.client.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [
          {
            role: "user",
            parts: [
              { text: SYSTEM_PROMPT },
              { text: "Please analyze this math problem and provide helpful tutoring feedback." },
              ...imageParts as any,
            ],
          },
        ],
        config: {
          maxOutputTokens: 2048,
          temperature: 0.1,
        },
      });

      const text = response.text;
      
      if (!text) {
        throw new Error("Gemini 3 returned an empty response.");
      }
      
      return text;
    } catch (error: any) {
      console.error("Gemini 3 Analysis Error:", error);
      
      if (error.message?.includes("API_KEY_INVALID")) {
        throw new Error("Invalid API Key. Please check your Gemini API settings.");
      }
      
      throw new Error(error.message || "Failed to analyze exercise with Gemini 3.");
    }
  }
}
