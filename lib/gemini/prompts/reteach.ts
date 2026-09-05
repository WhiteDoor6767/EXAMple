/**
 * STAGE 4 — Adaptive Re-Teach Prompt
 *
 * Role: Targeted misconception-aware re-explainer.
 * Task: Given a specific misconception a learner demonstrated, produce a SHORT,
 *       targeted re-explanation of ONLY the misunderstood concept — using a different
 *       approach, analogy, or visual type than the original explanation.
 */

import type { Scene, QuizQuestion } from "@/lib/types";

export const RETEACH_SCHEMA = {
  type: "OBJECT",
  properties: {
    narration: { type: "STRING" },
    visual: {
      type: "OBJECT",
      properties: {
        type: {
          type: "STRING",
          enum: [
            "equation",
            "sequence_table",
            "number_line",
            "graph",
            "shape_transform",
            "text_highlight",
          ],
        },
        content: { type: "OBJECT" },
      },
      required: ["type", "content"],
    },
    encouragement: { type: "STRING" },
  },
  required: ["narration", "visual", "encouragement"],
};

export function buildReteachPrompt(args: {
  problem: string;
  originalScene: Scene;
  question: QuizQuestion;
  selectedOptionId: string;
  selectedOptionText: string;
  misconception: string;
  correctOptionId: string;
  correctOptionText: string;
}): string {
  const {
    problem,
    originalScene,
    question,
    selectedOptionText,
    misconception,
    correctOptionText,
  } = args;

  return `You are an adaptive learning tutor. A student has misunderstood a specific concept and you need to re-explain it.

ORIGINAL PROBLEM: ${problem}

THE SCENE BEING TESTED (scene ${originalScene.id}):
"${originalScene.narration}"
(Visual type used: ${originalScene.visual.type})

THE QUIZ QUESTION: ${question.question}

WHAT THE STUDENT ANSWERED: "${selectedOptionText}"
CORRECT ANSWER: "${correctOptionText}"
IDENTIFIED MISCONCEPTION: ${misconception}

YOUR TASK:
Generate a SHORT, targeted re-explanation that directly addresses this specific misconception.

ALLOWED VISUAL TYPES AND THEIR REQUIRED CONTENT SCHEMAS:
1. "equation": content: { "expression": "string", "highlight_part": "optional string" }
2. "sequence_table": content: { "rows": ["string", ...], "highlight_row_index": optional_number }
3. "number_line": content: { "min": number, "max": number, "points": [{ "value": number, "label": "string" }] }
4. "graph": content: { "x_label": "string", "y_label": "string", "points": [{"x": number, "y": number}], "function_description": "optional string" }
5. "shape_transform": content: { "shape": "circle"|"square"|"triangle"|"line", "transform_description": "string" }
6. "text_highlight": content: { "text": "string" }

RULES:
1. Target ONLY the specific misunderstanding — do NOT re-teach the entire lesson.
2. Use a DIFFERENT approach than the original scene — a new analogy, different visual type, or different framing.
   - Original scene used: "${originalScene.visual.type}" — prefer a different visual type if appropriate.
3. NEVER write programming code (like C++, Python, or pseudocode) unless the original problem is explicitly about programming or computer science! For math/physics, use equations, tables, and concept text.
4. Narration: 2–5 sentences. Be clear, direct, and kind.
5. Visual: Choose the most effective type for this targeted explanation. Provide complete, valid content fields.
6. Encouragement: A short, genuine motivational message (1 sentence).

OUTPUT FORMAT:
{
  "narration": "Targeted re-explanation narration...",
  "visual": {
    "type": "equation",
    "content": { "expression": "..." }
  },
  "encouragement": "Great effort! You've got this."
}

Return ONLY valid JSON. No markdown fences. No prose.`;
}
