import { describe, it, expect } from "vitest";
import {
  SceneSchema,
  SceneScriptSchema,
  EquationContentSchema,
  SequenceTableContentSchema,
  NumberLineContentSchema,
  GraphContentSchema,
  ShapeTransformContentSchema,
  TextHighlightContentSchema,
} from "@/lib/schemas/scene";

// ── Equation ────────────────────────────────────────────────────────────────
describe("EquationContentSchema", () => {
  it("accepts valid equation with highlight", () => {
    const result = EquationContentSchema.safeParse({
      expression: "f(x) = x^2",
      highlight_part: "x^2",
    });
    expect(result.success).toBe(true);
  });

  it("accepts equation without highlight", () => {
    const result = EquationContentSchema.safeParse({ expression: "2 + 2 = 4" });
    expect(result.success).toBe(true);
  });

  it("rejects empty expression", () => {
    const result = EquationContentSchema.safeParse({ expression: "" });
    expect(result.success).toBe(false);
  });
});

// ── SequenceTable ─────────────────────────────────────────────────────────────
describe("SequenceTableContentSchema", () => {
  it("accepts valid rows", () => {
    const result = SequenceTableContentSchema.safeParse({
      rows: ["Step 1: x = 5", "Step 2: 2x = 10"],
      highlight_row_index: 1,
    });
    expect(result.success).toBe(true);
  });

  it("rejects empty rows array", () => {
    const result = SequenceTableContentSchema.safeParse({ rows: [] });
    expect(result.success).toBe(false);
  });
});

// ── NumberLine ───────────────────────────────────────────────────────────────
describe("NumberLineContentSchema", () => {
  it("accepts valid number line", () => {
    const result = NumberLineContentSchema.safeParse({
      min: 0,
      max: 10,
      points: [{ value: 5, label: "x = 5" }],
    });
    expect(result.success).toBe(true);
  });

  it("rejects empty points array", () => {
    const result = NumberLineContentSchema.safeParse({
      min: 0,
      max: 10,
      points: [],
    });
    expect(result.success).toBe(false);
  });
});

// ── Graph ─────────────────────────────────────────────────────────────────────
describe("GraphContentSchema", () => {
  it("accepts valid graph", () => {
    const result = GraphContentSchema.safeParse({
      x_label: "x",
      y_label: "f(x)",
      points: [
        { x: 0, y: 0 },
        { x: 1, y: 1 },
        { x: 2, y: 4 },
      ],
      function_description: "f(x) = x²",
    });
    expect(result.success).toBe(true);
  });

  it("rejects fewer than 2 points", () => {
    const result = GraphContentSchema.safeParse({
      x_label: "x",
      y_label: "y",
      points: [{ x: 0, y: 0 }],
    });
    expect(result.success).toBe(false);
  });
});

// ── ShapeTransform ────────────────────────────────────────────────────────────
describe("ShapeTransformContentSchema", () => {
  it("accepts valid shapes", () => {
    for (const shape of ["circle", "square", "triangle", "line"] as const) {
      const result = ShapeTransformContentSchema.safeParse({
        shape,
        transform_description: "The shape doubles in size",
      });
      expect(result.success).toBe(true);
    }
  });

  it("rejects unknown shape types", () => {
    const result = ShapeTransformContentSchema.safeParse({
      shape: "hexagon",
      transform_description: "...",
    });
    expect(result.success).toBe(false);
  });
});

// ── TextHighlight ─────────────────────────────────────────────────────────────
describe("TextHighlightContentSchema", () => {
  it("accepts valid text", () => {
    const result = TextHighlightContentSchema.safeParse({
      text: "The derivative measures the rate of change.",
    });
    expect(result.success).toBe(true);
  });

  it("rejects empty text", () => {
    const result = TextHighlightContentSchema.safeParse({ text: "" });
    expect(result.success).toBe(false);
  });
});

// ── SceneSchema ───────────────────────────────────────────────────────────────
describe("SceneSchema", () => {
  it("validates a complete scene with equation visual", () => {
    const result = SceneSchema.safeParse({
      id: 1,
      narration: "This is the narration for this scene.",
      duration_sec: 8,
      visual: {
        type: "equation",
        content: { expression: "f(x) = x^2", highlight_part: "x^2" },
      },
    });
    expect(result.success).toBe(true);
  });

  it("rejects unknown visual types", () => {
    const result = SceneSchema.safeParse({
      id: 1,
      narration: "Some narration text that is long enough.",
      duration_sec: 8,
      visual: {
        type: "pie_chart", // not allowed
        content: { slices: [1, 2, 3] },
      },
    });
    expect(result.success).toBe(false);
  });

  it("rejects scenes with narration too short", () => {
    const result = SceneSchema.safeParse({
      id: 1,
      narration: "Hi", // too short
      duration_sec: 5,
      visual: {
        type: "text_highlight",
        content: { text: "Some text" },
      },
    });
    expect(result.success).toBe(false);
  });
});

// ── SceneScript ───────────────────────────────────────────────────────────────
describe("SceneScriptSchema", () => {
  it("rejects scene scripts with fewer than 2 scenes", () => {
    const result = SceneScriptSchema.safeParse({
      problem: "A math problem",
      scenes: [
        {
          id: 1,
          narration: "A narration that is long enough.",
          duration_sec: 5,
          visual: { type: "text_highlight", content: { text: "Key fact" } },
        },
      ],
    });
    expect(result.success).toBe(false);
  });
});
