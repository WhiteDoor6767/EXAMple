"use client";

import { useReducer, useCallback } from "react";
import type {
  LearningSession,
  Phase,
  SceneScript,
  Quiz,
  ReTeach,
  AppError,
  WrongAnswerContext,
} from "@/lib/types";

// ─────────────────────────────────────────────────────────────────────────────
// Actions
// ─────────────────────────────────────────────────────────────────────────────

type Action =
  | { type: "SET_INPUT"; input: string; imageFile?: File | null }
  | { type: "START_EXTRACTING" }
  | { type: "EXTRACTION_DONE"; problem: string }
  | { type: "START_GENERATING" }
  | { type: "SCENES_GENERATED"; sceneScript: SceneScript }
  | { type: "NEXT_SCENE" }
  | { type: "PREV_SCENE" }
  | { type: "REPLAY_SCENE" }
  | { type: "START_QUIZ_GENERATING" }
  | { type: "QUIZ_GENERATED"; quiz: Quiz }
  | { type: "SELECT_ANSWER"; questionId: number; optionId: string }
  | { type: "SUBMIT_CORRECT"; questionId: number }
  | { type: "SUBMIT_WRONG"; questionId: number; context: WrongAnswerContext }
  | { type: "RETEACH_GENERATED"; reteach: ReTeach }
  | { type: "RETRY_QUESTION" }
  | { type: "NEXT_QUESTION" }
  | { type: "COMPLETE" }
  | { type: "SET_ERROR"; error: AppError }
  | { type: "CLEAR_ERROR" }
  | { type: "RESET" };

// ─────────────────────────────────────────────────────────────────────────────
// Initial State
// ─────────────────────────────────────────────────────────────────────────────

const initialState: LearningSession = {
  phase: "landing",
  originalInput: null,
  imageFile: null,
  extractedProblem: null,
  normalizedProblem: null,
  sceneScript: null,
  currentSceneIndex: 0,
  quiz: null,
  currentQuestionIndex: 0,
  answers: {},
  correctness: {},
  reteachData: null,
  wrongAnswerContext: null,
  retryQuestionId: null,
  error: null,
};

// ─────────────────────────────────────────────────────────────────────────────
// Reducer
// ─────────────────────────────────────────────────────────────────────────────

function reducer(state: LearningSession, action: Action): LearningSession {
  switch (action.type) {
    case "SET_INPUT":
      return {
        ...state,
        originalInput: action.input,
        imageFile: action.imageFile ?? null,
        error: null,
      };

    case "START_EXTRACTING":
      return { ...state, phase: "extracting", error: null };

    case "EXTRACTION_DONE":
      return {
        ...state,
        extractedProblem: action.problem,
        normalizedProblem: action.problem,
      };

    case "START_GENERATING":
      return {
        ...state,
        phase: "generating",
        normalizedProblem: state.extractedProblem ?? state.originalInput,
        error: null,
      };

    case "SCENES_GENERATED":
      return {
        ...state,
        phase: "lesson",
        sceneScript: action.sceneScript,
        currentSceneIndex: 0,
        error: null,
      };

    case "NEXT_SCENE": {
      const scenes = state.sceneScript?.scenes ?? [];
      const nextIndex = state.currentSceneIndex + 1;
      if (nextIndex >= scenes.length) {
        return { ...state, phase: "quiz_generating" };
      }
      return { ...state, currentSceneIndex: nextIndex };
    }

    case "PREV_SCENE":
      return {
        ...state,
        currentSceneIndex: Math.max(0, state.currentSceneIndex - 1),
      };

    case "REPLAY_SCENE":
      return { ...state };

    case "START_QUIZ_GENERATING":
      return { ...state, phase: "quiz_generating", error: null };

    case "QUIZ_GENERATED":
      return {
        ...state,
        phase: "quiz",
        quiz: action.quiz,
        currentQuestionIndex: 0,
        answers: {},
        correctness: {},
        error: null,
      };

    case "SELECT_ANSWER":
      return {
        ...state,
        answers: { ...state.answers, [action.questionId]: action.optionId },
      };

    case "SUBMIT_CORRECT":
      return {
        ...state,
        correctness: { ...state.correctness, [action.questionId]: true },
      };

    case "SUBMIT_WRONG":
      return {
        ...state,
        correctness: { ...state.correctness, [action.questionId]: false },
        wrongAnswerContext: action.context,
        phase: "reteaching",
      };

    case "RETEACH_GENERATED":
      return {
        ...state,
        reteachData: action.reteach,
        retryQuestionId: state.wrongAnswerContext?.questionId ?? null,
      };

    case "RETRY_QUESTION":
      return {
        ...state,
        phase: "retry",
        reteachData: null,
        // Clear the wrong answer so learner can pick again
        answers: Object.fromEntries(
          Object.entries(state.answers).filter(
            ([k]) => Number(k) !== state.retryQuestionId
          )
        ),
        correctness: Object.fromEntries(
          Object.entries(state.correctness).filter(
            ([k]) => Number(k) !== state.retryQuestionId
          )
        ),
      };

    case "NEXT_QUESTION": {
      const quiz = state.quiz;
      if (!quiz) return state;
      const nextIndex = state.currentQuestionIndex + 1;
      if (nextIndex >= quiz.questions.length) {
        return { ...state, phase: "complete" };
      }
      return {
        ...state,
        phase: "quiz",
        currentQuestionIndex: nextIndex,
        wrongAnswerContext: null,
        retryQuestionId: null,
        reteachData: null,
      };
    }

    case "COMPLETE":
      return { ...state, phase: "complete" };

    case "SET_ERROR":
      return { ...state, error: action.error, phase: "landing" };

    case "CLEAR_ERROR":
      return { ...state, error: null };

    case "RESET":
      return { ...initialState };

    default:
      return state;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Hook
// ─────────────────────────────────────────────────────────────────────────────

export function useLearningSession() {
  const [session, dispatch] = useReducer(reducer, initialState);

  // ── Derived state ────────────────────────────────────────────────────────────
  const currentScene =
    session.sceneScript?.scenes[session.currentSceneIndex] ?? null;

  const currentQuestion =
    session.quiz?.questions[session.currentQuestionIndex] ?? null;

  const totalScenes = session.sceneScript?.scenes.length ?? 0;
  const totalQuestions = session.quiz?.questions.length ?? 0;

  const score = Object.values(session.correctness).filter(Boolean).length;

  // ── Action creators ──────────────────────────────────────────────────────────
  const setInput = useCallback((input: string, imageFile?: File | null) => {
    dispatch({ type: "SET_INPUT", input, imageFile });
  }, []);

  const startExtracting = useCallback(() => {
    dispatch({ type: "START_EXTRACTING" });
  }, []);

  const extractionDone = useCallback((problem: string) => {
    dispatch({ type: "EXTRACTION_DONE", problem });
  }, []);

  const startGenerating = useCallback(() => {
    dispatch({ type: "START_GENERATING" });
  }, []);

  const scenesGenerated = useCallback((sceneScript: SceneScript) => {
    dispatch({ type: "SCENES_GENERATED", sceneScript });
  }, []);

  const nextScene = useCallback(() => {
    dispatch({ type: "NEXT_SCENE" });
  }, []);

  const prevScene = useCallback(() => {
    dispatch({ type: "PREV_SCENE" });
  }, []);

  const startQuizGenerating = useCallback(() => {
    dispatch({ type: "START_QUIZ_GENERATING" });
  }, []);

  const quizGenerated = useCallback((quiz: Quiz) => {
    dispatch({ type: "QUIZ_GENERATED", quiz });
  }, []);

  const selectAnswer = useCallback((questionId: number, optionId: string) => {
    dispatch({ type: "SELECT_ANSWER", questionId, optionId });
  }, []);

  const submitCorrect = useCallback((questionId: number) => {
    dispatch({ type: "SUBMIT_CORRECT", questionId });
  }, []);

  const submitWrong = useCallback(
    (questionId: number, context: WrongAnswerContext) => {
      dispatch({ type: "SUBMIT_WRONG", questionId, context });
    },
    []
  );

  const reteachGenerated = useCallback((reteach: ReTeach) => {
    dispatch({ type: "RETEACH_GENERATED", reteach });
  }, []);

  const retryQuestion = useCallback(() => {
    dispatch({ type: "RETRY_QUESTION" });
  }, []);

  const nextQuestion = useCallback(() => {
    dispatch({ type: "NEXT_QUESTION" });
  }, []);

  const setError = useCallback((error: AppError) => {
    dispatch({ type: "SET_ERROR", error });
  }, []);

  const clearError = useCallback(() => {
    dispatch({ type: "CLEAR_ERROR" });
  }, []);

  const reset = useCallback(() => {
    dispatch({ type: "RESET" });
  }, []);

  return {
    session,
    currentScene,
    currentQuestion,
    totalScenes,
    totalQuestions,
    score,
    // Actions
    setInput,
    startExtracting,
    extractionDone,
    startGenerating,
    scenesGenerated,
    nextScene,
    prevScene,
    startQuizGenerating,
    quizGenerated,
    selectAnswer,
    submitCorrect,
    submitWrong,
    reteachGenerated,
    retryQuestion,
    nextQuestion,
    setError,
    clearError,
    reset,
  };
}
