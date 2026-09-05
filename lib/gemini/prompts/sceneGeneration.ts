/**
 * STAGE 2 — Scene Generation Prompt
 *
 * Role: Educational visual lesson designer.
 * Task: Convert an academic problem into a structured sequence of 4–7 visual scenes
 *       that teach the concept step-by-step.
 * Input: { problem: string }
 * Output: SceneScript JSON.
 * Constraints:
 *   - Each scene introduces EXACTLY ONE meaningful idea.
 *   - First scene must establish an intuitive anchor (connect to something familiar).
 *   - Final scene must clearly communicate the key result/insight.
 *   - Visual types are STRICTLY LIMITED to the allowed set.
 *   - Narration must be concise (10–150 words per scene).
 *   - Do NOT skip foundational steps.
 *   - Do NOT use jargon without explaining it.
 *   - Do NOT solve the problem and present the answer without explanation.
 * Forbidden: Prose responses, extra keys, types not in the allowed visual type list.
 */

export const ALLOWED_VISUAL_TYPES = [
  "equation",
  "sequence_table",
  "number_line",
  "graph",
  "shape_transform",
  "text_highlight",
] as const;

export const SCENE_GENERATION_SCHEMA = {
  type: "OBJECT",
  properties: {
    problem: { type: "STRING" },
    scenes: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: {
          id: { type: "INTEGER" },
          narration: { type: "STRING" },
          duration_sec: { type: "NUMBER" },
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
        },
        required: ["id", "narration", "duration_sec", "visual"],
      },
      minItems: 3,
      maxItems: 8,
    },
  },
  required: ["problem", "scenes"],
};

export const SCENE_GENERATION_SYSTEM_PROMPT = `You are an expert educational content designer who creates visual, step-by-step lesson scripts for an interactive learning application.

Your task: Given an academic problem, produce a structured lesson in JSON format.

OUTPUT FORMAT — SceneScript:
{
  "problem": "<the exact input problem>",
  "scenes": [
    {
      "id": 1,
      "narration": "<concise explanation, 20–150 words>",
      "duration_sec": <5 to 15>,
      "visual": {
        "type": "<one of the allowed types>",
        "content": { <type-specific fields> }
      }
    }
  ]
}

ALLOWED VISUAL TYPES AND THEIR CONTENT SCHEMAS:

1. "equation"
   content: { "expression": "string (LaTeX or plain math)", "highlight_part": "optional string" }

2. "sequence_table"
   content: { "rows": ["string", ...], "highlight_row_index": optional_integer }
   Use for step-by-step processes, tables of values, numbered sequences.

3. "number_line"
   content: { "min": number, "max": number, "points": [{ "value": number, "label": "string" }] }
   Use for numerical comparisons, ranges, intervals.

4. "graph"
   content: { "x_label": "string", "y_label": "string", "points": [{"x": number, "y": number}], "function_description": "optional string" }
   Use for relationships between variables, function behavior, trends.

5. "shape_transform"
   content: {
     "before_svg": "string (raw HTML <svg> tag)",
     "after_svg": "string (raw HTML <svg> tag)",
     "transform_description": "string (what changed)"
   }
   Use for ANY geometric concept: transformations, area, perimeter, angles, intersections, etc.
   SVG Guidelines:
   - Must use <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
   - Use brutalist colors: #FFE500 (yellow), #000000 (black) or #111111 (dark background).
   - Usually, you will draw shapes using yellow strokes or fills on a dark transparent background, since this SVG will be placed on a dark (#111) canvas.
   - Example style for a shape: fill="#FFE500" fill-opacity="0.1" stroke="#FFE500" stroke-width="3"
   - You can add <text>, <path>, <g transform="...">, etc.
   - Do NOT wrap the string in markdown code blocks. Just output the raw <svg> tag.

6. "text_highlight"
   content: { "text": "string" }
   Use for key definitions, important statements, summaries.

RULES:
- Produce 4–7 scenes (use 7 only for complex multi-step problems).
- Scene 1: Always start with an intuitive anchor — what does the learner already know that relates to this?
- Each scene: Introduce exactly ONE new idea.
- Final scene: Clearly state the key result or insight.
- Pick visual types that MATCH the content — use equations for math expressions, graphs for relationships, tables for step sequences, etc.
- NEVER write programming code (like C++, Python, or pseudocode) unless the user's problem is explicitly about programming or computer science! For physics, math, and general logic, use equations, tables, and concept text.
- Narration must be direct, clear, and free of unexplained jargon.
- Do NOT just restate the problem — explain and build understanding.
- NEVER produce a visual type not in the allowed list.
- NEVER add extra JSON keys not in the schema.
- Return ONLY valid JSON — no markdown, no fences, no prose.`;

export function buildSceneGenerationPrompt(problem: string, subjectMode: string = "general"): string {
  let modeGuidance = "";
  if (subjectMode === "coding") {
    modeGuidance = "\nMODE: CODING / COMPUTER SCIENCE. You MUST provide FULL, COMPLETE, COMPILEABLE C++ CODE implementations (including all #include <iostream>, #include <vector>, #include <algorithm>, using namespace std;, and full int main() code logic). Do NOT use LaTeX commands (like \\text{}) inside C++ code snippets.";
  } else {
    modeGuidance = "\nMODE: GENERAL ACADEMIC (Math, Physics, Chemistry, Logic). Use conceptual reasoning, equations, tables, and SVG diagrams. ABSOLUTELY NO PROGRAMMING CODE (no C++, Java, Python, etc.) unless explicitly requested.";
  }

  return `Generate a visual lesson for the following academic problem:

PROBLEM: ${problem}
${modeGuidance}

Requirements:
- 4 to 7 scenes
- Each scene teaches exactly one idea
- Start with an intuitive anchor that connects to familiar knowledge
- End with a clear statement of the key insight or result
- Choose visual types that best match the educational content
- Use real mathematical values in graphs and number lines — not placeholders

Return ONLY valid JSON. No markdown fences. No explanation. No prose.`;
}
