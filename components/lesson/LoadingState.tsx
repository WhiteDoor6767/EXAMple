"use client";

import { motion } from "framer-motion";
import { Sparkles, BookOpen } from "lucide-react";

type LoadingPhase = "extracting" | "generating" | "quiz_generating" | "reteaching";

interface LoadingStateProps {
  phase: LoadingPhase;
}

const MESSAGES: Record<LoadingPhase, { title: string; subtitle: string; icon: React.ReactNode }> = {
  extracting: {
    title: "Reading your image…",
    subtitle: "Extracting the problem from your upload",
    icon: <BookOpen style={{ width: 24, height: 24, color: "#000" }} />,
  },
  generating: {
    title: "Building visual lesson…",
    subtitle: "Designing step-by-step scenes with Gemini AI",
    icon: <Sparkles style={{ width: 24, height: 24, color: "#000" }} />,
  },
  quiz_generating: {
    title: "Preparing your quiz…",
    subtitle: "Creating targeted questions from the lesson",
    icon: <Sparkles style={{ width: 24, height: 24, color: "#000" }} />,
  },
  reteaching: {
    title: "Identifying the gap…",
    subtitle: "Generating a fresh re-explanation for you",
    icon: <Sparkles style={{ width: 24, height: 24, color: "#000" }} />,
  },
};

export function LoadingState({ phase }: LoadingStateProps) {
  const msg = MESSAGES[phase];

  return (
    <div
      style={{
        border: "3px solid #000",
        boxShadow: "6px 6px 0 #000",
        background: "#FFE500",
        padding: "3rem 2rem",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "1.5rem",
        textAlign: "center",
        fontFamily: "'Times New Roman', Times, serif",
      }}
    >
      <motion.div
        animate={{
          scale: [1, 1.15, 1],
          rotate: [0, 5, -5, 0],
        }}
        transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
        style={{
          width: 56,
          height: 56,
          background: "#fff",
          border: "3px solid #000",
          boxShadow: "4px 4px 0 #000",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {msg.icon}
      </motion.div>

      <div>
        <h3
          style={{
            fontSize: "1.4rem",
            fontWeight: 900,
            textTransform: "uppercase",
            letterSpacing: "-0.01em",
            color: "#000",
          }}
        >
          {msg.title}
        </h3>
        <p
          style={{
            fontSize: "0.95rem",
            fontStyle: "italic",
            color: "#222",
            marginTop: "0.4rem",
          }}
        >
          {msg.subtitle}
        </p>
      </div>

      <div style={{ display: "flex", gap: 8 }}>
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            animate={{
              y: [0, -8, 0],
              background: ["#000", "#fff", "#000"],
            }}
            transition={{
              duration: 0.8,
              repeat: Infinity,
              delay: i * 0.15,
            }}
            style={{
              width: 12,
              height: 12,
              border: "2px solid #000",
              background: "#000",
            }}
          />
        ))}
      </div>
    </div>
  );
}
