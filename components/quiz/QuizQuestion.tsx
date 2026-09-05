"use client";

import { motion, AnimatePresence } from "framer-motion";
import type { QuizQuestion, QuizOption } from "@/lib/types";
import { CheckCircle2, XCircle } from "lucide-react";

interface QuizQuestionProps {
  question: QuizQuestion;
  selectedOptionId: string | null;
  submitted: boolean;
  isCorrect: boolean | null;
  onSelect: (optionId: string) => void;
  onSubmit: () => void;
}

const OPTION_LETTERS: Record<string, string> = {
  a: "A",
  b: "B",
  c: "C",
  d: "D",
};

export function QuizQuestionCard({
  question,
  selectedOptionId,
  submitted,
  isCorrect,
  onSelect,
  onSubmit,
}: QuizQuestionProps) {
  function getOptionStyle(option: QuizOption) {
    if (!submitted) {
      if (selectedOptionId === option.id) {
        return {
          background: "#FFE500",
          border: "3px solid #000",
          boxShadow: "4px 4px 0 #000",
          transform: "translate(-2px, -2px)",
        };
      }
      return {
        background: "#fff",
        border: "2px solid #000",
        boxShadow: "2px 2px 0 #000",
      };
    }

    if (option.id === question.correct_option_id) {
      return {
        background: "#bbf7d0",
        border: "3px solid #000",
        boxShadow: "4px 4px 0 #000",
      };
    }
    if (option.id === selectedOptionId) {
      return {
        background: "#fecaca",
        border: "3px solid #000",
        boxShadow: "4px 4px 0 #000",
      };
    }
    return {
      background: "#f5f5f5",
      border: "2px solid #aaa",
      color: "#666",
    };
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem", fontFamily: "'Times New Roman', Times, serif" }}>
      {/* Question Header */}
      <div>
        <div style={{ background: "#FFE500", border: "2px solid #000", display: "inline-block", padding: "0.2rem 0.6rem", fontWeight: 900, fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "0.6rem" }}>
          QUESTION
        </div>
        <h3 style={{ fontSize: "1.25rem", fontWeight: 900, color: "#000", lineHeight: 1.4 }}>
          {question.question}
        </h3>
      </div>

      {/* Options list */}
      <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
        {question.options.map((option, i) => {
          const style = getOptionStyle(option);
          return (
            <button
              key={option.id}
              onClick={() => !submitted && onSelect(option.id)}
              disabled={submitted}
              style={{
                ...style,
                padding: "0.85rem 1.1rem",
                textAlign: "left",
                fontFamily: "'Times New Roman', serif",
                fontSize: "1rem",
                fontWeight: 600,
                cursor: submitted ? "default" : "pointer",
                display: "flex",
                alignItems: "center",
                gap: "0.85rem",
                transition: "all 0.1s",
              }}
            >
              {/* Option Letter Badge */}
              <span
                style={{
                  width: 28,
                  height: 28,
                  border: "2px solid #000",
                  background: selectedOptionId === option.id ? "#000" : "#fff",
                  color: selectedOptionId === option.id ? "#FFE500" : "#000",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 900,
                  fontSize: "0.85rem",
                  flexShrink: 0,
                }}
              >
                {OPTION_LETTERS[option.id] ?? option.id.toUpperCase()}
              </span>

              <span style={{ flex: 1 }}>{option.text}</span>

              {/* Status icons */}
              {submitted && option.id === question.correct_option_id && (
                <CheckCircle2 style={{ width: 20, height: 20, color: "#16a34a", flexShrink: 0 }} />
              )}
              {submitted && option.id === selectedOptionId && option.id !== question.correct_option_id && (
                <XCircle style={{ width: 20, height: 20, color: "#dc2626", flexShrink: 0 }} />
              )}
            </button>
          );
        })}
      </div>

      {/* Submit button */}
      <AnimatePresence>
        {!submitted && (
          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "0.5rem" }}>
            <button
              onClick={onSubmit}
              disabled={!selectedOptionId}
              className="brut-btn"
              style={{
                opacity: selectedOptionId ? 1 : 0.4,
                cursor: selectedOptionId ? "pointer" : "not-allowed",
              }}
            >
              Submit Answer →
            </button>
          </div>
        )}
      </AnimatePresence>

      {/* Feedback banner */}
      <AnimatePresence>
        {submitted && isCorrect === true && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              border: "3px solid #000",
              boxShadow: "4px 4px 0 #000",
              background: "#bbf7d0",
              padding: "0.85rem 1.25rem",
              fontWeight: 900,
              fontSize: "0.95rem",
              display: "flex",
              alignItems: "center",
              gap: "0.6rem",
            }}
          >
            <CheckCircle2 style={{ width: 20, height: 20 }} />
            CORRECT! Great understanding.
          </motion.div>
        )}
        {submitted && isCorrect === false && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              border: "3px solid #000",
              boxShadow: "4px 4px 0 #000",
              background: "#FFE500",
              padding: "0.85rem 1.25rem",
              fontWeight: 900,
              fontSize: "0.95rem",
            }}
          >
            NOT QUITE — Identifying gap and preparing a targeted explanation…
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
