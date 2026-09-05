import { z } from "zod";

// ─────────────────────────────────────────────────────────────────────────────
// Visual Content Schemas
// ─────────────────────────────────────────────────────────────────────────────

export const EquationContentSchema = z.object({
  expression: z.string().catch(""),
  highlight_part: z.string().optional(),
});

export const SequenceTableContentSchema = z.object({
  rows: z.array(z.string()).catch([]),
  highlight_row_index: z.number().int().min(0).optional(),
});

export const NumberLineContentSchema = z.object({
  min: z.number().catch(0),
  max: z.number().catch(10),
  points: z
    .array(
      z.object({
        value: z.number().catch(0),
        label: z.string().catch(""),
      })
    )
    .catch([]),
});

export const GraphContentSchema = z.object({
  x_label: z.string().catch("x"),
  y_label: z.string().catch("y"),
  points: z
    .array(
      z.object({
        x: z.number().catch(0),
        y: z.number().catch(0),
      })
    )
    .catch([]),
  function_description: z.string().optional(),
});

export const ShapeTransformContentSchema = z.object({
  before_svg: z.string().optional(),
  after_svg: z.string().optional(),
  shape: z.enum(["circle", "square", "triangle", "line"]).optional(),
  transform_description: z.string().catch("Geometric transformation"),
});

export const TextHighlightContentSchema = z.object({
  text: z.string().catch(""),
});

// ─────────────────────────────────────────────────────────────────────────────
// Visual Union Schema (discriminated)
// ─────────────────────────────────────────────────────────────────────────────

export const VisualSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("equation"), content: EquationContentSchema }),
  z.object({
    type: z.literal("sequence_table"),
    content: SequenceTableContentSchema,
  }),
  z.object({
    type: z.literal("number_line"),
    content: NumberLineContentSchema,
  }),
  z.object({ type: z.literal("graph"), content: GraphContentSchema }),
  z.object({
    type: z.literal("shape_transform"),
    content: ShapeTransformContentSchema,
  }),
  z.object({
    type: z.literal("text_highlight"),
    content: TextHighlightContentSchema,
  }),
]);

// ─────────────────────────────────────────────────────────────────────────────
// Scene Schema
// ─────────────────────────────────────────────────────────────────────────────

export const SceneSchema = z.object({
  id: z.number().int().catch(1),
  narration: z.string().catch(""),
  duration_sec: z.number().catch(8),
  visual: VisualSchema,
});

export const SceneScriptSchema = z.object({
  problem: z.string().catch(""),
  scenes: z.array(SceneSchema).catch([]),
});

export type SceneSchemaType = z.infer<typeof SceneSchema>;
export type SceneScriptSchemaType = z.infer<typeof SceneScriptSchema>;

