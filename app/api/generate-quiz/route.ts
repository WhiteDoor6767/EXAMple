/**
 * POST /api/generate-quiz
 * Accepts { problem: string, scenes: Scene[] }.
 * Returns Quiz or { error }.
 */
import { NextRequest, NextResponse } from "next/server";
import { callGeminiWithCascade } from "@/lib/gemini/client";
import { buildQuizGenerationPrompt } from "@/lib/gemini/prompts/quizGeneration";
import { SceneSchema } from "@/lib/schemas/scene";
import { QuizSchema } from "@/lib/schemas/quiz";
import { safeParseGeminiJSON } from "@/lib/utils/json";
import { z } from "zod";
import type { Scene } from "@/lib/types";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { problem, scenes } = body;

    if (!problem || typeof problem !== "string") {
      return NextResponse.json({ error: "Invalid problem." }, { status: 400 });
    }

    if (!Array.isArray(scenes) || scenes.length === 0) {
      return NextResponse.json({ error: "No scenes provided." }, { status: 400 });
    }

    // Validate incoming scenes
    const validatedScenes = z.array(SceneSchema).safeParse(scenes);
    if (!validatedScenes.success) {
      return NextResponse.json(
        { error: "Invalid scene data provided." },
        { status: 400 }
      );
    }

    const validScenes = validatedScenes.data as unknown as Scene[];

    const response = await callGeminiWithCascade({
      contents: [
        {
          role: "user",
          parts: [
            { text: buildQuizGenerationPrompt(problem, validScenes) },
          ],
        },
      ],
      config: {
        responseMimeType: "application/json",
        temperature: 0.3,
      },
    });

    const raw = response.text ?? "";
    const parsed = safeParseGeminiJSON(raw);

    if (!parsed) {
      return NextResponse.json(
        { error: "Failed to generate the quiz. Please try again." },
        { status: 422 }
      );
    }

    const validation = QuizSchema.safeParse(parsed);
    if (!validation.success) {
      console.error("[/api/generate-quiz] Validation errors:", validation.error.flatten());
      return NextResponse.json(
        { error: "The quiz generation returned an unexpected format. Please try again." },
        { status: 422 }
      );
    }

    return NextResponse.json(validation.data);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";

    if (message.includes("429") || message.toLowerCase().includes("quota")) {
      return NextResponse.json(
        { error: "The AI service is currently busy. Please wait a moment and try again." },
        { status: 429 }
      );
    }

    console.error("[/api/generate-quiz] Error:", err);
    return NextResponse.json(
      { error: "An unexpected error occurred while generating the quiz." },
      { status: 500 }
    );
  }
}
