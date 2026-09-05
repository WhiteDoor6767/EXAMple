/**
 * POST /api/generate-scenes
 * Accepts { problem: string }.
 * Returns SceneScript or { error }.
 */
import { NextRequest, NextResponse } from "next/server";
import { callGeminiWithCascade } from "@/lib/gemini/client";
import {
  SCENE_GENERATION_SYSTEM_PROMPT,
  SCENE_GENERATION_SCHEMA,
  buildSceneGenerationPrompt,
} from "@/lib/gemini/prompts/sceneGeneration";
import { SceneScriptSchema } from "@/lib/schemas/scene";
import { safeParseGeminiJSON } from "@/lib/utils/json";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const problem = body?.problem;
    const subjectMode = typeof body?.subjectMode === "string" ? body.subjectMode : "general";

    if (!problem || typeof problem !== "string" || problem.trim().length < 3) {
      return NextResponse.json(
        { error: "Please provide a valid problem (at least 3 characters)." },
        { status: 400 }
      );
    }

    const trimmedProblem = problem.trim().slice(0, 2000);

    const response = await callGeminiWithCascade({
      contents: [
        {
          role: "user",
          parts: [
            { text: SCENE_GENERATION_SYSTEM_PROMPT },
            { text: buildSceneGenerationPrompt(trimmedProblem, subjectMode) },
          ],
        },
      ],
      config: {
        responseMimeType: "application/json",
        temperature: 0.4,
      },
    });

    const raw = response.text ?? "";
    const parsed = safeParseGeminiJSON(raw);

    if (!parsed) {
      // Retry once with a stricter prompt
      const retryResponse = await callGeminiWithCascade({
        contents: [
          {
            role: "user",
            parts: [
              { text: SCENE_GENERATION_SYSTEM_PROMPT },
              {
                text:
                  buildSceneGenerationPrompt(trimmedProblem, subjectMode) +
                  "\n\nCRITICAL: Your previous response was not valid JSON. Return ONLY valid JSON, nothing else.",
              },
            ],
          },
        ],
        config: {
          responseMimeType: "application/json",
          temperature: 0.1,
        },
      });

      const retryParsed = safeParseGeminiJSON(retryResponse.text ?? "");
      if (!retryParsed) {
        return NextResponse.json(
          { error: "Failed to generate a lesson. Please try again." },
          { status: 422 }
        );
      }

      const validation = SceneScriptSchema.safeParse(retryParsed);
      if (!validation.success) {
        return NextResponse.json(
          {
            error:
              "The lesson generation returned an invalid format. Please try again.",
          },
          { status: 422 }
        );
      }

      return NextResponse.json(validation.data);
    }

    const validation = SceneScriptSchema.safeParse(parsed);
    if (!validation.success) {
      console.error("[/api/generate-scenes] Validation errors:", validation.error.flatten());
      return NextResponse.json(
        {
          error:
            "The lesson generation returned an unexpected format. Please try again.",
        },
        { status: 422 }
      );
    }

    return NextResponse.json(validation.data);
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

    console.error("[/api/generate-scenes] Error:", err);
    return NextResponse.json(
      { error: "An unexpected error occurred while generating the lesson." },
      { status: 500 }
    );
  }
}
