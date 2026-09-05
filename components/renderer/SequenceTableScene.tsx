"use client";

import { motion } from "framer-motion";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import type { SequenceTableContent } from "@/lib/types";

interface SequenceTableSceneProps {
  content: SequenceTableContent;
}

// Detect if a row looks like code (has symbols, keywords)
function isCodeRow(row: string): boolean {
  return /[{}();=<>!]|def |class |return |if |for |while |#include|cout|int |void /.test(row);
}

// A brutalist dark syntax theme matching the yellow/black palette
const brutalistTheme: { [key: string]: React.CSSProperties } = {
  'code[class*="language-"]': {
    color: "#FFE500",
    background: "#000",
    fontFamily: "monospace",
    fontSize: "0.9rem",
    fontWeight: 700,
  },
  'pre[class*="language-"]': {
    background: "#000",
    padding: 0,
    margin: 0,
    overflow: "auto",
    border: "none",
  },
  comment: { color: "#888" },
  keyword: { color: "#FFE500", fontWeight: 900 },
  string: { color: "#98c379" },
  number: { color: "#d19a66" },
  function: { color: "#61aeee" },
  operator: { color: "#FFE500" },
  punctuation: { color: "#abb2bf" },
  "class-name": { color: "#e5c07b" },
  boolean: { color: "#d19a66" },
  builtin: { color: "#e5c07b" },
  plain: { color: "#FFE500" },
};

export function SequenceTableScene({ content }: SequenceTableSceneProps) {
  const hasCode = content.rows.some(isCodeRow);

  return (
    <div
      className="flex flex-col items-center justify-center min-h-[220px] p-6 w-full"
      style={{ fontFamily: "'Times New Roman', Times, serif" }}
    >
      <div className="w-full max-w-2xl flex flex-col gap-2.5">
        {content.rows.map((row, index) => {
          const isHighlighted = content.highlight_row_index === index;
          const looksLikeCode = isCodeRow(row);

          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1, duration: 0.35, ease: "easeOut" }}
              style={{
                border: "2.5px solid #000",
                boxShadow: isHighlighted ? "5px 5px 0 #000" : "2px 2px 0 #000",
                background: looksLikeCode ? "#000" : isHighlighted ? "#FFE500" : "#fff",
                overflow: "hidden",
              }}
            >
              {/* Row number badge */}
              <div
                style={{
                  display: "flex",
                  alignItems: "stretch",
                }}
              >
                <div
                  style={{
                    minWidth: 32,
                    background: isHighlighted ? "#000" : looksLikeCode ? "#FFE500" : "#000",
                    color: isHighlighted ? "#FFE500" : looksLikeCode ? "#000" : "#FFE500",
                    fontWeight: 900,
                    fontSize: "0.78rem",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "0.5rem 0.4rem",
                    flexShrink: 0,
                    borderRight: "2px solid",
                    borderRightColor: looksLikeCode ? "#FFE500" : "#000",
                    letterSpacing: "-0.02em",
                  }}
                >
                  {index + 1}
                </div>

                {/* Content area */}
                <div style={{ flex: 1, padding: looksLikeCode ? "0.5rem 0.75rem" : "0.65rem 0.9rem" }}>
                  {looksLikeCode ? (
                    <SyntaxHighlighter
                      language="cpp"
                      style={brutalistTheme as any}
                      customStyle={{
                        background: "transparent",
                        padding: 0,
                        margin: 0,
                        fontSize: "0.9rem",
                        fontWeight: 700,
                      }}
                      wrapLongLines
                    >
                      {row}
                    </SyntaxHighlighter>
                  ) : (
                    <span
                      style={{
                        fontSize: "1rem",
                        fontWeight: isHighlighted ? 900 : 600,
                        color: "#000",
                        lineHeight: 1.4,
                      }}
                    >
                      {row}
                    </span>
                  )}
                </div>

                {/* Highlighted indicator */}
                {isHighlighted && !looksLikeCode && (
                  <div
                    style={{
                      width: 6,
                      background: "#000",
                      flexShrink: 0,
                    }}
                  />
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
