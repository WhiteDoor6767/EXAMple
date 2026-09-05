/**
 * STAGE 1 — Image Extraction Prompt
 *
 * Role: Academic problem transcription and understanding layer.
 * Task: Extract the main academic problem from an image.
 * Constraints:
 *   - Transcribe ONLY what is visible in the image.
 *   - Do NOT solve the problem.
 *   - Do NOT add information not present in the image.
 *   - Preserve all mathematical notation as accurately as possible.
 *   - If the image does not contain a clear academic problem, return low confidence.
 * Output: Strict JSON matching ExtractionResult schema.
 * Forbidden: Prose responses, solving the problem, hallucinating content.
 */

export const EXTRACTION_SCHEMA = {
  type: "OBJECT",
  properties: {
    problem: {
      type: "STRING",
      description:
        "The academic problem extracted from the image, exactly as stated, preserving all math notation.",
    },
    confidence: {
      type: "STRING",
      enum: ["high", "medium", "low"],
      description:
        "high = problem clearly readable; medium = mostly readable but some uncertainty; low = cannot reliably extract a problem",
    },
    raw_text: {
      type: "STRING",
      description: "All text visible in the image, verbatim.",
    },
  },
  required: ["problem", "confidence", "raw_text"],
};

export const EXTRACTION_SYSTEM_PROMPT = `You are an academic problem transcription system.

Your ONLY job is to identify and extract the main academic problem from the provided image.

Rules:
1. Transcribe exactly what you see — do not solve, do not interpret beyond what is written.
2. Preserve all mathematical notation: fractions, exponents, subscripts, symbols.
3. If the image contains multiple problems, extract the most prominent one.
4. If the text is mostly unreadable, set confidence to "low" and problem to an empty string.
5. Never add information that is not visible in the image.
6. Never attempt to solve the problem.

Your response MUST be valid JSON matching exactly this structure:
{
  "problem": "<the extracted problem text>",
  "confidence": "high" | "medium" | "low",
  "raw_text": "<all visible text in the image>"
}`;

export function buildExtractionPrompt(): string {
  return `Please extract the academic problem from this image. Follow all rules in the system prompt exactly.

Return ONLY valid JSON — no markdown fences, no explanation, no prose.`;
}
