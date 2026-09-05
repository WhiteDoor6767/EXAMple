/**
 * STAGE 3 — Quiz Generation Prompt
 *
 * Role: Assessment designer grounded strictly in the provided lesson.
 * Task: Generate exactly 3 multiple-choice questions based ONLY on what was taught in the scenes.
 * Input: { problem: string, scenes: Scene[] }
 * Constraints:
 *   - Questions may ONLY test concepts introduced in the provided scenes.
 *   - Each question must reference a tests_scene_id matching one of the provided scene IDs.
 *   - Incorrect answers must represent REALISTIC common misconceptions — not nonsense.
 *   - The correct_option_id must match one of the option IDs in the options array.
 *   - misconception_if_wrong maps each INCORRECT option id to a description of the misconception.
 *   - The correct option's misconception_if_wrong value must be an empty string "".
 * Forbidden: Testing concepts not in the scenes, nonsense distractors, revealing answers in options.
 */

import type { Scene } from "@/lib/types";

export const QUIZ_GENERATION_SCHEMA = {
  type: "OBJECT",
  properties: {
    questions: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: {
          id: { type: "INTEGER" },
          question: { type: "STRING" },
          options: {
            type: "ARRAY",
            items: {
              type: "OBJECT",
              properties: {
                id: { type: "STRING" },
                text: { type: "STRING" },
              },
              required: ["id", "text"],
            },
          },
          correct_option_id: { type: "STRING" },
          tests_scene_id: { type: "INTEGER" },
          misconception_if_wrong: {
            type: "OBJECT",
            description:
              "Maps each option id to a misconception string. Correct option maps to empty string.",
          },
        },
        required: [
          "id",
          "question",
          "options",
          "correct_option_id",
          "tests_scene_id",
          "misconception_if_wrong",
        ],
      },
      minItems: 3,
      maxItems: 3,
    },
  },
  required: ["questions"],
};

export function buildQuizGenerationPrompt(
  problem: string,
  scenes: Scene[]
): string {
  const scenesSummary = scenes
    .map(
      (s) =>
        `Scene ${s.id} (visual type: ${s.visual.type}): ${s.narration.slice(0, 200)}`
    )
    .join("\n");

  return `You are designing a quiz for a visual interactive lesson.

ORIGINAL PROBLEM: ${problem}

LESSON SCENES (these contain EVERYTHING the learner was taught):
${scenesSummary}

TASK: Generate exactly 3 multiple-choice quiz questions.

RULES:
1. Only test concepts that were explicitly taught in the scenes above.
2. Each question must have exactly 4 options with IDs: "a", "b", "c", "d".
3. Each incorrect option must represent a REALISTIC, COMMON misconception a student might have.
4. Do NOT use nonsense, irrelevant, or obviously wrong distractors.
5. tests_scene_id must be one of the scene IDs listed above: [${scenes.map((s) => s.id).join(", ")}]
6. misconception_if_wrong must have an entry for every option ID (a, b, c, d).
   - Correct option → ""
   - Each incorrect option → a 1-2 sentence description of what misconception leads to that choice.
7. Do NOT make questions trivially easy or unfairly tricky.
8. Cover different scenes where possible — don't test only one scene.

OUTPUT FORMAT:
{
  "questions": [
    {
      "id": 1,
      "question": "...",
      "options": [
        {"id": "a", "text": "..."},
        {"id": "b", "text": "..."},
        {"id": "c", "text": "..."},
        {"id": "d", "text": "..."}
      ],
      "correct_option_id": "b",
      "tests_scene_id": 3,
      "misconception_if_wrong": {
        "a": "Description of misconception for option a...",
        "b": "",
        "c": "Description of misconception for option c...",
        "d": "Description of misconception for option d..."
      }
    }
  ]
}

Return ONLY valid JSON. No markdown fences. No prose. No explanation.`;
}
