"use client";

import { motion } from "framer-motion";
import type { Quiz } from "@/lib/types";
import { CheckCircle2, AlertCircle, RotateCcw, Plus } from "lucide-react";

interface QuizResultsProps {
  quiz: Quiz;
  correctness: Record<number, boolean>;
  onRetry: () => void;
  onNewProblem: () => void;
}

export function QuizResults({
  quiz,
  correctness,
  onRetry,
  onNewProblem,
}: QuizResultsProps) {
  const total = quiz.questions.length;
  const correct = Object.values(correctness).filter(Boolean).length;
  const percent = Math.round((correct / total) * 100);

  const getMessage = () => {
    if (percent === 100) return "PERFECT SCORE! You mastered this concept.";
    if (percent >= 66) return "GREAT JOB! You understood most of the material.";
    if (percent >= 33) return "GOOD EFFORT! Review the re-explanations to reinforce.";
    return "KEEP PRACTICING! The re-explanations are here to help.";
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.75rem", fontFamily: "'Times New Roman', Times, serif" }}>
      {/* Big score box */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        style={{
          border: "3px solid #000",
          boxShadow: "6px 6px 0 #000",
          background: "#FFE500",
          padding: "2rem",
          textAlign: "center",
        }}
      >
        <div
          style={{
            fontSize: "4rem",
            fontWeight: 900,
            lineHeight: 1,
            color: "#000",
            letterSpacing: "-0.04em",
          }}
        >
          {percent}%
        </div>
        <div style={{ fontSize: "1.2rem", fontWeight: 900, marginTop: "0.5rem", textTransform: "uppercase" }}>
          {correct} / {total} Correct Answers
        </div>
        <div style={{ fontSize: "0.95rem", fontStyle: "italic", marginTop: "0.4rem", color: "#111" }}>
          {getMessage()}
        </div>
      </motion.div>

      {/* Breakdown */}
      <div>
        <div style={{ fontWeight: 900, fontSize: "0.8rem", textTransform: "uppercase", letterSpacing: "0.1em", borderBottom: "2px solid #000", paddingBottom: "0.4rem", marginBottom: "0.75rem" }}>
          Question Breakdown
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          {quiz.questions.map((q, i) => {
            const isCorrect = correctness[q.id];
            return (
              <div
                key={q.id}
                style={{
                  border: "2px solid #000",
                  boxShadow: "2px 2px 0 #000",
                  background: isCorrect ? "#bbf7d0" : "#fecaca",
                  padding: "0.75rem 1rem",
                  fontSize: "0.95rem",
                  fontWeight: 700,
                  display: "flex",
                  alignItems: "center",
                  gap: "0.75rem",
                }}
              >
                {isCorrect ? (
                  <CheckCircle2 style={{ width: 18, height: 18, flexShrink: 0 }} />
                ) : (
                  <AlertCircle style={{ width: 18, height: 18, flexShrink: 0 }} />
                )}
                <span>{q.question}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Action buttons */}
      <div style={{ display: "flex", gap: "1rem" }}>
        <button
          onClick={onRetry}
          className="brut-btn-outline"
          style={{ flex: 1, justifyContent: "center" }}
        >
          <RotateCcw style={{ width: 16, height: 16 }} />
          Retry Lesson
        </button>
        <button
          onClick={onNewProblem}
          className="brut-btn"
          style={{ flex: 1, justifyContent: "center" }}
        >
          <Plus style={{ width: 16, height: 16 }} />
          New Problem
        </button>
      </div>
    </div>
  );
}
