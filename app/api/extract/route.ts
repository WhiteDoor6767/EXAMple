/**
 * POST /api/extract
 * Accepts a multipart form with an "image" field.
 * Returns { problem, confidence, raw_text } or { error }.
 */
import { NextRequest, NextResponse } from "next/server";
import { callGeminiWithCascade } from "@/lib/gemini/client";
import {
  EXTRACTION_SYSTEM_PROMPT,
  buildExtractionPrompt,
} from "@/lib/gemini/prompts/extraction";
import { ExtractionResultSchema } from "@/lib/schemas/reteach";
import { safeParseGeminiJSON } from "@/lib/utils/json";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/heic",
];

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("image");

    if (!file || typeof file === "string") {
      return NextResponse.json({ error: "No image file provided." }, { status: 400 });
    }

    // Validate MIME type
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return NextResponse.json(
        {
          error: `Unsupported file type: ${file.type}. Please upload a JPEG, PNG, WebP, or GIF image.`,
        },
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "Image is too large. Maximum size is 10MB." },
        { status: 400 }
      );
    }

    // Convert to base64 for Gemini inline_data
    const arrayBuffer = await file.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString("base64");

    const response = await callGeminiWithCascade({
      contents: [
        {
          role: "user",
          parts: [
            { text: EXTRACTION_SYSTEM_PROMPT },
            {
              inlineData: {
                mimeType: file.type,
                data: base64,
              },
            },
            { text: buildExtractionPrompt() },
          ],
        },
      ],
      config: {
        responseMimeType: "application/json",
      },
    });

    const raw = response.text ?? "";
    const parsed = safeParseGeminiJSON(raw);

    if (!parsed) {
      return NextResponse.json(
        { error: "Failed to parse the AI response. Please try again." },
        { status: 422 }
      );
    }

    const validation = ExtractionResultSchema.safeParse(parsed);
    if (!validation.success) {
      console.error("[/api/extract] Validation errors:", JSON.stringify(validation.error.issues, null, 2), "raw:", raw);
      return NextResponse.json(
        { error: "The AI returned an unexpected response format. Please try again." },
        { status: 422 }
      );
    }

    const result = validation.data;

    if (result.confidence === "low") {
      return NextResponse.json(
        {
          error:
            "Could not reliably extract a problem from this image. The text may be too small, blurry, or unclear. Please try typing the problem instead.",
          extractionFailed: true,
        },
        { status: 422 }
      );
    }

    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";

    if (message.includes("429") || message.toLowerCase().includes("quota")) {
      return NextResponse.json(
        {
          error:
            "The AI service is currently busy. Please wait a moment and try again.",
        },
        { status: 429 }
      );
    }

    console.error("[/api/extract] Error:", err);
    return NextResponse.json(
      { error: "An unexpected error occurred. Please try again." },
      { status: 500 }
    );
  }
}
