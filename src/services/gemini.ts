import { GoogleGenAI } from "@google/genai";

// Standard prompt for Math Exercise Analysis
const SYSTEM_PROMPT = `You are an objective, expert Math Tutor. 
Your goal is to provide concise, direct, and level-appropriate guidance based on the images provided.

Instructions:
1. **Objective Identification**: Identify the problem from Image 1.
2. **Level-Appropriate Feedback**: Adjust the complexity of your explanations to the mathematical level of the problem (e.g., simpler terms for basic math, rigorous notation for advanced math).
3. **Conciseness**: Be extremely brief. Provide facts, hints, or step-corrections without conversational filler.
4. **Markdown Formatting**: Use LaTeX ($ math $) for expressions. 
5. **No Immediate Answers**: Guide the student to the solution rather than providing it immediately.

Respond only in structured Markdown.`;

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
