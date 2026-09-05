// ─────────────────────────────────────────────────────────────────────────────
// Visual Types
// ─────────────────────────────────────────────────────────────────────────────

export type VisualType =
  | "equation"
  | "sequence_table"
  | "number_line"
  | "graph"
  | "shape_transform"
  | "text_highlight";

export interface EquationContent {
  expression: string;
  highlight_part?: string;
}

export interface SequenceTableContent {
  rows: string[];
  highlight_row_index?: number;
}

export interface NumberLinePoint {
  value: number;
  label: string;
}

export interface NumberLineContent {
  min: number;
  max: number;
  points: NumberLinePoint[];
}

export interface GraphPoint {
  x: number;
  y: number;
}

export interface GraphContent {
  x_label: string;
  y_label: string;
  points: GraphPoint[];
  function_description?: string;
}

export interface ShapeTransformContent {
  before_svg: string;   // AI-generated SVG for the "before" state
  after_svg: string;    // AI-generated SVG for the "after" state
  transform_description: string;
}

export interface TextHighlightContent {
  text: string;
}

export type VisualContent =
  | { type: "equation"; content: EquationContent }
  | { type: "sequence_table"; content: SequenceTableContent }
  | { type: "number_line"; content: NumberLineContent }
  | { type: "graph"; content: GraphContent }
  | { type: "shape_transform"; content: ShapeTransformContent }
  | { type: "text_highlight"; content: TextHighlightContent };

// ─────────────────────────────────────────────────────────────────────────────
// Scene
// ─────────────────────────────────────────────────────────────────────────────

export interface Scene {
  id: number;
  narration: string;
  duration_sec: number;
  visual: VisualContent;
}

export interface SceneScript {
  problem: string;
  scenes: Scene[];
}

// ─────────────────────────────────────────────────────────────────────────────
// Quiz
// ─────────────────────────────────────────────────────────────────────────────

export interface QuizOption {
  id: string;
  text: string;
}

/** Maps incorrect option IDs to misconception descriptions. Correct option maps to "". */
export type MisconceptionMap = Record<string, string>;

export interface QuizQuestion {
  id: number;
  question: string;
  options: QuizOption[];
  correct_option_id: string;
  tests_scene_id: number;
  misconception_if_wrong: MisconceptionMap;
}

export interface Quiz {
  questions: QuizQuestion[];
}

// ─────────────────────────────────────────────────────────────────────────────
// Re-teach
// ─────────────────────────────────────────────────────────────────────────────

export interface ReTeach {
  narration: string;
  visual: VisualContent;
  encouragement: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Extraction
// ─────────────────────────────────────────────────────────────────────────────

export type ExtractionConfidence = "high" | "medium" | "low";

export interface ExtractionResult {
  problem: string;
  confidence: ExtractionConfidence;
  raw_text: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Learning Session State
// ─────────────────────────────────────────────────────────────────────────────

export type Phase =
  | "landing"
  | "extracting"
  | "generating"
  | "lesson"
  | "quiz_generating"
  | "quiz"
  | "reteaching"
  | "retry"
  | "complete";

export interface AppError {
  type:
    | "EXTRACTION_FAILED"
    | "GENERATION_FAILED"
    | "QUIZ_FAILED"
    | "RETEACH_FAILED"
    | "NETWORK_ERROR"
    | "VALIDATION_ERROR"
    | "UPLOAD_ERROR"
    | "RATE_LIMIT"
    | "UNKNOWN";
  message: string;
  recoverable: boolean;
}

export interface WrongAnswerContext {
  questionId: number;
  selectedOptionId: string;
  misconception: string;
  correctOptionId: string;
  testedSceneId: number;
}

export interface LearningSession {
  phase: Phase;
  originalInput: string | null;
  imageFile: File | null;
  extractedProblem: string | null;
  normalizedProblem: string | null;
  sceneScript: SceneScript | null;
  currentSceneIndex: number;
  quiz: Quiz | null;
  currentQuestionIndex: number;
  /** questionId → selectedOptionId */
  answers: Record<number, string>;
  /** questionId → boolean */
  correctness: Record<number, boolean>;
  reteachData: ReTeach | null;
  wrongAnswerContext: WrongAnswerContext | null;
  retryQuestionId: number | null;
  error: AppError | null;
}
