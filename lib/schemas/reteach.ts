import { z } from "zod";
import { VisualSchema } from "./scene";

export const ReTeachSchema = z.object({
  narration: z.string().min(10).max(600),
  visual: VisualSchema,
  encouragement: z.string().min(5).max(200),
});

export const ExtractionResultSchema = z.object({
  problem: z.string().max(2000),
  confidence: z.enum(["high", "medium", "low"]),
  raw_text: z.string(),
});

export type ReTeachSchemaType = z.infer<typeof ReTeachSchema>;
export type ExtractionResultSchemaType = z.infer<typeof ExtractionResultSchema>;
