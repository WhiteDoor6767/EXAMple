"use client";

import { motion, AnimatePresence } from "framer-motion";
import type { TextHighlightContent } from "@/lib/types";

interface TextHighlightSceneProps {
  content: TextHighlightContent;
}

// Words to always bold-highlight in any text
const ALWAYS_HIGHLIGHT = new Set([
  "note", "important", "key", "remember", "warning", "tip",
  "therefore", "because", "always", "never", "must", "critical",
  "result", "output", "answer", "solution", "step",
]);

export function TextHighlightScene({ content }: TextHighlightSceneProps) {
  const text = content?.text ?? "";
  const lines = text.split("\n").filter(Boolean);
  const highlightWords = (content as any)?.highlight_words as string[] | undefined;

  const highlightSet = new Set([
    ...(highlightWords ?? []).map((w) => w.toLowerCase()),
  ]);

  function renderWords(line: string, lineIndex: number) {
    const words = line.split(" ");
    return words.map((word, i) => {
      const clean = word.replace(/[^a-zA-Z0-9]/g, "").toLowerCase();
      const isKeyword = highlightSet.has(clean) || ALWAYS_HIGHLIGHT.has(clean);
      const isNumber = /^\d+([.,]\d+)?[%]?$/.test(word);

      return (
        <motion.span
          key={`${lineIndex}-${i}`}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            delay: lineIndex * 0.08 + i * 0.035,
            duration: 0.22,
            ease: "easeOut",
          }}
          style={{
            display: "inline-block",
            marginRight: "0.3rem",
            fontWeight: isKeyword || isNumber ? 900 : 700,
            background: isKeyword
              ? "#FFE500"
              : isNumber
              ? "#000"
              : "transparent",
            color: isNumber ? "#FFE500" : "#000",
            padding: isKeyword || isNumber ? "0 0.2rem" : undefined,
            border: isKeyword ? "1px solid #000" : isNumber ? "none" : "none",
          }}
        >
          {word}
        </motion.span>
      );
    });
  }

  return (
    <div
      className="flex flex-col items-center justify-center min-h-[220px] gap-5 p-6 w-full"
      style={{ fontFamily: "'Times New Roman', Times, serif" }}
    >
      {/* ✦ KEY INSIGHT badge */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        style={{
          border: "2px solid #000",
          boxShadow: "3px 3px 0 #000",
          background: "#FFE500",
          padding: "0.3rem 1rem",
          fontWeight: 900,
          fontSize: "0.78rem",
          textTransform: "uppercase",
          letterSpacing: "0.12em",
        }}
      >
        ✦ KEY INSIGHT
      </motion.div>

      {/* Main text card */}
      <div
        style={{
          border: "3px solid #000",
          boxShadow: "6px 6px 0 #000",
          background: "#FFFEF5",
          padding: "1.75rem 2rem",
          maxWidth: "600px",
          width: "100%",
          position: "relative",
        }}
      >
        {/* Yellow accent bar top-left */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: 6,
            height: "100%",
            background: "#FFE500",
            borderRight: "2px solid #000",
          }}
        />

        <div style={{ paddingLeft: "0.5rem" }}>
          {lines.map((line, lineIndex) => (
            <p
              key={lineIndex}
              style={{
                fontSize: "1.15rem",
                lineHeight: 1.7,
                color: "#000",
                marginBottom: lineIndex < lines.length - 1 ? "0.75rem" : 0,
              }}
            >
              {renderWords(line, lineIndex)}
            </p>
          ))}
        </div>
      </div>

      {/* Highlight legend if there are custom highlight words */}
      {highlightWords && highlightWords.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", justifyContent: "center" }}
        >
          {highlightWords.map((w) => (
            <span
              key={w}
              style={{
                background: "#FFE500",
                border: "2px solid #000",
                boxShadow: "2px 2px 0 #000",
                padding: "0.15rem 0.65rem",
                fontWeight: 900,
                fontSize: "0.78rem",
                textTransform: "uppercase",
              }}
            >
              {w}
            </span>
          ))}
        </motion.div>
      )}
    </div>
  );
}
