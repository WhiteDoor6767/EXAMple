import { describe, it, expect } from "vitest";
import { QuizSchema, QuizQuestionSchema } from "@/lib/schemas/quiz";

describe("QuizQuestionSchema", () => {
  const validQuestion = {
    id: 1,
    question: "What is the derivative of x squared?",
    options: [
      { id: "a", text: "x" },
      { id: "b", text: "2x" },
      { id: "c", text: "x/2" },
      { id: "d", text: "2" },
    ],
    correct_option_id: "b",
    tests_scene_id: 3,
    misconception_if_wrong: {
      a: "Confusing derivative with the original function.",
      b: "",
      c: "Dividing instead of multiplying by the exponent.",
      d: "Forgetting that x has a coefficient.",
    },
  };

  it("accepts a valid question", () => {
    const result = QuizQuestionSchema.safeParse(validQuestion);
    expect(result.success).toBe(true);
  });

  it("rejects questions with wrong number of options", () => {
    const bad = { ...validQuestion, options: validQuestion.options.slice(0, 3) };
    const result = QuizQuestionSchema.safeParse(bad);
    expect(result.success).toBe(false);
  });

  it("rejects questions with empty text", () => {
    const bad = { ...validQuestion, question: "" };
    const result = QuizQuestionSchema.safeParse(bad);
    expect(result.success).toBe(false);
  });
});

describe("QuizSchema", () => {
  const makeQuestion = (id: number) => ({
    id,
    question: `Question ${id} — this is long enough?`,
    options: [
      { id: "a", text: "Option A" },
      { id: "b", text: "Option B" },
      { id: "c", text: "Option C" },
      { id: "d", text: "Option D" },
    ],
    correct_option_id: "b",
    tests_scene_id: id,
    misconception_if_wrong: { a: "Misconception A", b: "", c: "Misconception C", d: "Misconception D" },
  });

  it("accepts a valid quiz with 3 questions", () => {
    const result = QuizSchema.safeParse({
      questions: [makeQuestion(1), makeQuestion(2), makeQuestion(3)],
    });
    expect(result.success).toBe(true);
  });

  it("rejects a quiz with 0 questions", () => {
    const result = QuizSchema.safeParse({ questions: [] });
    expect(result.success).toBe(false);
  });

  it("rejects a quiz with more than 5 questions", () => {
    const result = QuizSchema.safeParse({
      questions: [1, 2, 3, 4, 5, 6].map(makeQuestion),
    });
    expect(result.success).toBe(false);
  });
});
