/**
 * POST /api/reteach
 * Accepts reteach context (problem, scene, question, selected answer, misconception, correct answer).
 * Returns ReTeach or { error }.
 */
import { NextRequest, NextResponse } from "next/server";
import { callGeminiWithCascade } from "@/lib/gemini/client";
import { buildReteachPrompt } from "@/lib/gemini/prompts/reteach";
import { ReTeachSchema } from "@/lib/schemas/reteach";
import { SceneSchema } from "@/lib/schemas/scene";
import { QuizQuestionSchema } from "@/lib/schemas/quiz";
import { safeParseGeminiJSON } from "@/lib/utils/json";
import type { Scene, QuizQuestion } from "@/lib/types";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      problem,
      scene,
      question,
      selectedOptionId,
      selectedOptionText,
      misconception,
      correctOptionId,
      correctOptionText,
    } = body;

    if (!problem || typeof problem !== "string") {
      return NextResponse.json({ error: "Invalid problem." }, { status: 400 });
    }

    const sceneValidation = SceneSchema.safeParse(scene);
    if (!sceneValidation.success) {
      return NextResponse.json({ error: "Invalid scene data." }, { status: 400 });
    }

    const questionValidation = QuizQuestionSchema.safeParse(question);
    if (!questionValidation.success) {
      return NextResponse.json({ error: "Invalid question data." }, { status: 400 });
    }

    if (
      typeof selectedOptionId !== "string" ||
      typeof misconception !== "string" ||
      typeof correctOptionId !== "string"
    ) {
      return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
    }

    const response = await callGeminiWithCascade({
      contents: [
        {
          role: "user",
          parts: [
            {
              text: buildReteachPrompt({
                problem,
                originalScene: sceneValidation.data as unknown as Scene,
                question: questionValidation.data as unknown as QuizQuestion,
                selectedOptionId,
                selectedOptionText: selectedOptionText || selectedOptionId,
                misconception,
                correctOptionId,
                correctOptionText: correctOptionText || correctOptionId,
              }),
            },
          ],
        },
      ],
      config: {
        responseMimeType: "application/json",
        temperature: 0.5,
      },
    });

    const raw = response.text ?? "";
    const parsed = safeParseGeminiJSON(raw);

    if (!parsed) {
      return NextResponse.json(
        { error: "Failed to generate re-explanation. Please try again." },
        { status: 422 }
      );
    }

    const validation = ReTeachSchema.safeParse(parsed);
    if (!validation.success) {
      console.error("[/api/reteach] Validation errors:", JSON.stringify(validation.error.issues, null, 2));
      return NextResponse.json(
        { error: "The re-explanation returned an unexpected format. Please try again." },
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

    console.error("[/api/reteach] Error:", err);
    return NextResponse.json(
      { error: "An unexpected error occurred while generating the re-explanation." },
      { status: 500 }
    );
  }
}
