import { z } from "zod";

export const QuizOptionSchema = z.object({
  id: z.string().min(1),
  text: z.string().min(1),
});

export const MisconceptionMapSchema = z.record(z.string(), z.string());

export const QuizQuestionSchema = z.object({
  id: z.number().int().min(1),
  question: z.string().min(10).max(500),
  options: z.array(QuizOptionSchema).length(4),
  correct_option_id: z.string().min(1),
  tests_scene_id: z.number().int().min(1),
  misconception_if_wrong: MisconceptionMapSchema,
});

export const QuizSchema = z.object({
  questions: z.array(QuizQuestionSchema).min(1).max(5),
});

export type QuizSchemaType = z.infer<typeof QuizSchema>;
export type QuizQuestionSchemaType = z.infer<typeof QuizQuestionSchema>;
