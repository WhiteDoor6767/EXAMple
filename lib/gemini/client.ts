/**
 * server-only Gemini client
 * Uses @google/genai v2 with multi-model automatic fallback cascade
 */
import { GoogleGenAI } from "@google/genai";

if (!process.env.GEMINI_API_KEY) {
  throw new Error(
    "GEMINI_API_KEY environment variable is not set. " +
      "Create a .env.local file with GEMINI_API_KEY=your-key"
  );
}

export const genai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export const MODELS_CASCADE = [
  "gemini-3.5-flash-lite",
  "gemini-3.1-flash-lite",
  "gemini-3.5-flash",
  "gemini-3.6-flash",
];

export const MODEL = MODELS_CASCADE[0];

export async function callGeminiWithCascade(params: {
  contents: any;
  config?: any;
}) {
  let lastError: any = null;

  for (const model of MODELS_CASCADE) {
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const response = await genai.models.generateContent({
          model,
          contents: params.contents,
          config: params.config,
        });
        if (response.text) return response;
      } catch (err: any) {
        lastError = err;
        const msg = err?.message || String(err);
        const status = err?.status;
        console.warn(
          `[Gemini Cascade] Model ${model} (attempt ${attempt + 1}) failed (${status}): ${msg.slice(0, 120)}`
        );

        if (status === 404 || msg.includes("404")) break;
        await new Promise((r) => setTimeout(r, 500));
      }
    }
  }

  throw lastError || new Error("All AI models are currently busy.");
}
