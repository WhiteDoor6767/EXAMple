"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLearningSession } from "@/lib/state/useLearningSession";
import { SceneRenderer } from "@/components/renderer/SceneRenderer";
import { SceneProgress } from "@/components/lesson/SceneProgress";
import { NarrationPanel } from "@/components/lesson/NarrationPanel";
import { SceneControls } from "@/components/lesson/SceneControls";
import { LoadingState } from "@/components/lesson/LoadingState";
import { QuizQuestionCard } from "@/components/quiz/QuizQuestion";
import { QuizResults } from "@/components/quiz/QuizResults";
import { ReteachScene } from "@/components/reteach/ReteachScene";
import { MagicCard } from "@/components/ui/magic-card";
import { BlurFade } from "@/components/ui/blur-fade";
import { BorderBeam } from "@/components/ui/border-beam";
import { HistoryDrawer } from "@/components/history/HistoryDrawer";
import { saveToHistory } from "@/lib/utils/history";
import type {
  SceneScript,
  Quiz,
  ReTeach,
  WrongAnswerContext,
  AppError,
} from "@/lib/types";
import { AlertTriangle, ArrowLeft } from "lucide-react";

interface LearnPageClientProps {
  onReset: () => void;
  initialProblem: string;
  initialImageFile?: File | null;
  initialSubjectMode?: string;
}

export function LearnPageClient({
  onReset,
  initialProblem,
  initialImageFile,
  initialSubjectMode = "general",
}: LearnPageClientProps) {
  const {
    session,
    currentScene,
    currentQuestion,
    totalScenes,
    totalQuestions,
    score,
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
  } = useLearningSession();

  const [replayNonce, setReplayNonce] = useState(0);
  const handleReplay = useCallback(() => setReplayNonce((n) => n + 1), []);
  const hasStarted = useRef(false);

  // ── Kick off the pipeline on mount ─────────────────────────────────────────
  useEffect(() => {
    if (hasStarted.current) return;
    hasStarted.current = true;

    if (initialImageFile) {
      runExtraction(initialImageFile);
    } else {
      runSceneGeneration(initialProblem);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Auto smooth scroll to top on phase/scene/question transition ──
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [session.phase, session.currentSceneIndex, session.currentQuestionIndex]);

  // ── Auto-save solution to history when scenes are generated ──
  useEffect(() => {
    if (session.sceneScript && session.sceneScript.scenes?.length > 0) {
      saveToHistory(session.sceneScript.problem, session.sceneScript.scenes, initialSubjectMode);
    }
  }, [session.sceneScript, initialSubjectMode]);

  // ── Watch for quiz_generating phase ────────────────────────────────────────
  useEffect(() => {
    if (session.phase === "quiz_generating" && session.sceneScript) {
      runQuizGeneration(
        session.sceneScript.problem,
        session.sceneScript
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session.phase]);

  // ─────────────────────────────────────────────────────────────────────────────
  // Pipeline functions
  // ─────────────────────────────────────────────────────────────────────────────

  const runExtraction = useCallback(
    async (file: File) => {
      startExtracting();
      try {
        const formData = new FormData();
        formData.append("image", file);
        const res = await fetch("/api/extract", { method: "POST", body: formData });
        const data = await res.json();
        if (!res.ok || data.error) {
          setError({
            type: "EXTRACTION_FAILED",
            message: data.error ?? "Failed to read image.",
            recoverable: true,
          });
          return;
        }
        extractionDone(data.problem);
        runSceneGeneration(data.problem);
      } catch {
        setError({
          type: "NETWORK_ERROR",
          message: "Network error. Please check your connection and try again.",
          recoverable: true,
        });
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [startExtracting, extractionDone, setError]
  );

  const runSceneGeneration = useCallback(
    async (problem: string) => {
      startGenerating();
      try {
        const res = await fetch("/api/generate-scenes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ problem, subjectMode: initialSubjectMode }),
        });
        const data = await res.json();
        if (!res.ok || data.error) {
          setError({
            type: "GENERATION_FAILED",
            message: data.error ?? "Failed to generate lesson.",
            recoverable: true,
          });
          return;
        }
        scenesGenerated(data as SceneScript);
      } catch {
        setError({
          type: "NETWORK_ERROR",
          message: "Network error. Please check your connection and try again.",
          recoverable: true,
        });
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [startGenerating, scenesGenerated, setError]
  );

  const runQuizGeneration = useCallback(
    async (problem: string, sceneScript: SceneScript) => {
      try {
        const res = await fetch("/api/generate-quiz", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ problem, scenes: sceneScript.scenes }),
        });
        const data = await res.json();
        if (!res.ok || data.error) {
          setError({
            type: "QUIZ_FAILED",
            message: data.error ?? "Failed to generate quiz.",
            recoverable: false,
          });
          return;
        }
        quizGenerated(data as Quiz);
      } catch {
        setError({
          type: "NETWORK_ERROR",
          message: "Network error. Please check your connection and try again.",
          recoverable: false,
        });
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [quizGenerated, setError]
  );

  const runReteach = useCallback(
    async (context: WrongAnswerContext) => {
      if (!session.sceneScript || !session.quiz) return;

      const scene = session.sceneScript.scenes.find(
        (s) => s.id === context.testedSceneId
      );
      const question = session.quiz.questions.find(
        (q) => q.id === context.questionId
      );

      if (!scene || !question) return;

      const selectedOption = question.options.find(
        (o) => o.id === context.selectedOptionId
      );
      const correctOption = question.options.find(
        (o) => o.id === context.correctOptionId
      );

      try {
        const res = await fetch("/api/reteach", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            problem: session.sceneScript.problem,
            scene,
            question,
            selectedOptionId: context.selectedOptionId,
            selectedOptionText: selectedOption?.text ?? context.selectedOptionId,
            misconception: context.misconception,
            correctOptionId: context.correctOptionId,
            correctOptionText: correctOption?.text ?? context.correctOptionId,
          }),
        });
        const data = await res.json();
        if (!res.ok || data.error) {
          setError({
            type: "RETEACH_FAILED",
            message: data.error ?? "Failed to generate re-explanation.",
            recoverable: true,
          });
          return;
        }
        reteachGenerated(data as ReTeach);
      } catch {
        setError({
          type: "NETWORK_ERROR",
          message: "Network error.",
          recoverable: true,
        });
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [session.sceneScript, session.quiz, reteachGenerated, setError]
  );

  // ── Quiz submission handler ─────────────────────────────────────────────────
  const handleSubmitAnswer = useCallback(() => {
    if (!currentQuestion) return;
    const selectedId = session.answers[currentQuestion.id];
    if (!selectedId) return;

    const isCorrect = selectedId === currentQuestion.correct_option_id;

    if (isCorrect) {
      submitCorrect(currentQuestion.id);
    } else {
      const misconception =
        currentQuestion.misconception_if_wrong[selectedId] ??
        "Incorrect answer selected.";

      const context: WrongAnswerContext = {
        questionId: currentQuestion.id,
        selectedOptionId: selectedId,
        misconception,
        correctOptionId: currentQuestion.correct_option_id,
        testedSceneId: currentQuestion.tests_scene_id,
      };

      submitWrong(currentQuestion.id, context);
      runReteach(context);
    }
  }, [
    currentQuestion,
    session.answers,
    submitCorrect,
    submitWrong,
    runReteach,
  ]);

  // ── After retry — move to next question ────────────────────────────────────
  const handleAfterRetry = useCallback(() => {
    nextQuestion();
  }, [nextQuestion]);

  // ─────────────────────────────────────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────────────────────────────────────

  const { phase } = session;

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#fff", fontFamily: "'Times New Roman', Times, serif" }}>
      {/* Top bar */}
      <div style={{ borderBottom: "3px solid #000", background: "#FFE500", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0.75rem 1.5rem" }}>
        <button
          onClick={onReset}
          style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontWeight: 700, fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: "0.08em", background: "#000", color: "#FFE500", border: "2px solid #000", padding: "0.4rem 1rem", cursor: "pointer", boxShadow: "2px 2px 0 #000", fontFamily: "'Times New Roman', serif" }}
        >
          <ArrowLeft style={{ width: 14, height: 14 }} />
          Back
        </button>
        <span style={{ fontWeight: 900, fontSize: "1.1rem", textTransform: "uppercase", letterSpacing: "-0.01em" }}>EXAMPLE</span>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <div style={{ fontSize: "0.8rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>
            {phase === "lesson" && `Scene ${session.currentSceneIndex + 1} / ${totalScenes}`}
            {(phase === "quiz" || phase === "retry") && `Q${session.currentQuestionIndex + 1} / ${totalQuestions}`}
          </div>
          <HistoryDrawer onSelectProblem={(p) => { onReset(); }} />
        </div>
      </div>

      {/* Main content */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", padding: "2rem 1rem", maxWidth: 700, margin: "0 auto", width: "100%" }}>
        <AnimatePresence mode="wait">
          {/* ── Loading states ── */}
          {(phase === "extracting" ||
            phase === "generating" ||
            phase === "quiz_generating") && (
            <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ width: "100%" }}>
              <LoadingState phase={phase} />
            </motion.div>
          )}

          {/* ── Lesson ── */}
          {phase === "lesson" && currentScene && (
            <motion.div
              key={`scene-${currentScene.id}-${replayNonce}`}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.35 }}
              style={{ width: "100%", display: "flex", flexDirection: "column", gap: "1.25rem" }}
            >
              <SceneProgress current={session.currentSceneIndex + 1} total={totalScenes} />

              <div style={{ border: "3px solid #000", boxShadow: "5px 5px 0 #000", background: "#fff", minHeight: 240, overflow: "hidden" }}>
                <SceneRenderer visual={currentScene.visual} sceneKey={`${currentScene.id}-${replayNonce}`} />
              </div>

              <NarrationPanel narration={currentScene.narration} sceneId={currentScene.id} />
              <SceneControls
                onNext={nextScene}
                onPrev={prevScene}
                onReplay={handleReplay}
                canNext={true}
                canPrev={session.currentSceneIndex > 0}
                isLast={session.currentSceneIndex === totalScenes - 1}
              />
            </motion.div>
          )}

          {/* ── Quiz ── */}
          {(phase === "quiz" || phase === "retry") && currentQuestion && (
            <motion.div
              key={`quiz-${currentQuestion.id}-${phase}`}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.35 }}
              style={{ width: "100%", display: "flex", flexDirection: "column", gap: "1rem" }}
            >
              {/* Progress bar — brutalist */}
              <div style={{ display: "flex", gap: 4 }}>
                {Array.from({ length: totalQuestions }, (_, i) => {
                  const q = session.quiz?.questions[i];
                  const answered = q && session.correctness[q.id] !== undefined;
                  const correct = q && session.correctness[q.id] === true;
                  return (
                    <div
                      key={i}
                      style={{
                        flex: 1,
                        height: 8,
                        border: "2px solid #000",
                        background: answered ? (correct ? "#22c55e" : "#ef4444") : i === session.currentQuestionIndex ? "#FFE500" : "#fff",
                        transition: "background 0.2s",
                      }}
                    />
                  );
                })}
              </div>

              <div style={{ fontSize: "0.8rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                Question {session.currentQuestionIndex + 1} of {totalQuestions}
              </div>

              <div style={{ border: "3px solid #000", boxShadow: "5px 5px 0 #000", background: "#fff", padding: "1.5rem", overflow: "hidden" }}>
                <QuizQuestionCard
                  question={currentQuestion}
                  selectedOptionId={session.answers[currentQuestion.id] ?? null}
                  submitted={session.correctness[currentQuestion.id] !== undefined}
                  isCorrect={session.correctness[currentQuestion.id] ?? null}
                  onSelect={(optionId) => selectAnswer(currentQuestion.id, optionId)}
                  onSubmit={handleSubmitAnswer}
                />
              </div>

              <AnimatePresence>
                {session.correctness[currentQuestion.id] === true && (
                  <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} style={{ display: "flex", justifyContent: "flex-end" }}>
                    <button
                      onClick={() => nextQuestion()}
                      className="brut-btn"
                    >
                      {session.currentQuestionIndex === totalQuestions - 1 ? "See results →" : "Next question →"}
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}

          {/* ── Re-teaching ── */}
          {phase === "reteaching" && (
            <motion.div
              key="reteaching"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.4 }}
              className="w-full"
            >
              {session.reteachData ? (
                <ReteachScene
                  reteach={session.reteachData}
                  misconception={
                    session.wrongAnswerContext?.misconception ?? ""
                  }
                  onRetry={retryQuestion}
                />
              ) : (
                <LoadingState phase="reteaching" />
              )}
            </motion.div>
          )}

          {/* ── Complete ── */}
          {phase === "complete" && session.quiz && (
            <motion.div
              key="complete"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, type: "spring" }}
              className="w-full"
            >
              <div className="relative rounded-2xl border border-slate-700/60 bg-slate-900/60 p-6 overflow-hidden">
                <BorderBeam size={250} duration={8} colorFrom="#10b981" colorTo="#8b5cf6" />
                <QuizResults
                  quiz={session.quiz}
                  correctness={session.correctness}
                  onRetry={() => {
                    reset();
                    if (initialImageFile) {
                      runExtraction(initialImageFile);
                    } else {
                      runSceneGeneration(initialProblem);
                    }
                  }}
                  onNewProblem={onReset}
                />
              </div>
            </motion.div>
          )}

          {/* ── Error state ── */}
          {session.error && phase === "landing" && (
            <motion.div key="error" initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ width: "100%" }}>
              <div style={{ border: "3px solid #000", boxShadow: "5px 5px 0 #000", background: "#FFE500", padding: "2rem", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: "1rem" }}>
                <div style={{ fontWeight: 900, fontSize: "1.2rem", textTransform: "uppercase" }}>⚠ Something went wrong</div>
                <p style={{ fontSize: "0.9rem", fontStyle: "italic" }}>{session.error.message}</p>
                <button onClick={onReset} className="brut-btn">Try again</button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
