"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import type { EquationContent } from "@/lib/types";

interface EquationSceneProps {
  content: EquationContent;
}

/**
 * Strips LaTeX command wrappers and returns clean human-readable text.
 * e.g. \text{Low Interest Rate} → "Low Interest Rate"
 *      \frac{a}{b}             → "a / b"
 *      \times                  → "×"
 */
function stripLatex(raw: string): string {
  return raw
    // \text{...} → content
    .replace(/\\text\{([^}]*)\}/gi, "$1")
    // \mathrm{...}, \mathbf{...}, \mathit{...} → content
    .replace(/\\math(?:rm|bf|it|sf|tt|cal|scr|bb|frak)\{([^}]*)\}/gi, "$1")
    // \operatorname{...} → content
    .replace(/\\operatorname\{([^}]*)\}/gi, "$1")
    // \frac{a}{b} → a/b
    .replace(/\\frac\{([^}]*)\}\{([^}]*)\}/gi, "$1/$2")
    // \sqrt{x} → √x
    .replace(/\\sqrt\{([^}]*)\}/gi, "√$1")
    // Named commands
    .replace(/\\times/g, "×")
    .replace(/\\cdot/g, "·")
    .replace(/\\div/g, "÷")
    .replace(/\\pm/g, "±")
    .replace(/\\leq/g, "≤")
    .replace(/\\geq/g, "≥")
    .replace(/\\neq/g, "≠")
    .replace(/\\approx/g, "≈")
    .replace(/\\infty/g, "∞")
    .replace(/\\alpha/g, "α")
    .replace(/\\beta/g, "β")
    .replace(/\\pi/g, "π")
    .replace(/\\sigma/g, "σ")
    .replace(/\\sum/g, "Σ")
    .replace(/\\int/g, "∫")
    // Remove remaining backslash commands
    .replace(/\\[a-zA-Z]+/g, "")
    // Remove stray braces
    .replace(/[{}]/g, "")
    .trim();
}

export function EquationScene({ content }: EquationSceneProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [rendered, setRendered] = useState(false);

  const cleanFocusLabel = content.highlight_part
    ? stripLatex(content.highlight_part)
    : null;

  useEffect(() => {
    let cancelled = false;

    async function render() {
      const katex = (await import("katex")).default;
      await import("katex/dist/katex.min.css");

      if (cancelled || !containerRef.current) return;

      try {
        let expression = content.expression;

        // Wrap the highlight_part with fcolorbox for inline yellow highlight
        if (content.highlight_part) {
          const rawHighlight = content.highlight_part.trim();
          // Escape special regex chars
          const escaped = rawHighlight.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

          if (expression.includes(rawHighlight)) {
            expression = expression.replace(
              new RegExp(`(${escaped})`),
              `\\fcolorbox{black}{#FFE500}{$\\displaystyle $1$}`
            );
          }
        }

        katex.render(expression, containerRef.current, {
          throwOnError: false,
          displayMode: true,
          strict: false,
        });
      } catch {
        if (containerRef.current) {
          containerRef.current.textContent = content.expression;
        }
      }

      if (!cancelled) setRendered(true);
    }

    render();
    return () => {
      cancelled = true;
    };
  }, [content.expression, content.highlight_part]);

  return (
    <div
      className="flex flex-col items-center justify-center min-h-[220px] gap-5 p-4 w-full"
      style={{ fontFamily: "'Times New Roman', Times, serif" }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        style={{ width: "100%", maxWidth: "100%", display: "flex", justifyContent: "center" }}
      >
        <div
          style={{
            border: "3px solid #000",
            boxShadow: "5px 5px 0 #000",
            background: "#FFFEF5",
            padding: "1.75rem 1.5rem",
            textAlign: "center",
            opacity: rendered ? 1 : 0,
            transition: "opacity 0.2s",
            width: "100%",
            maxWidth: "100%",
            // Let long equations scroll horizontally within the box instead of clipping
            overflowX: "auto",
            overflowY: "hidden",
            boxSizing: "border-box",
          }}
        >
          <div
            ref={containerRef}
            className="katex-equation"
            style={{ fontSize: "1.6rem", color: "#000", minWidth: 0 }}
          />
        </div>
      </motion.div>

      {/* FOCUS badge — shows clean human-readable text, not raw LaTeX */}
      {cleanFocusLabel && (
        <motion.div
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.25 }}
          style={{
            border: "2px solid #000",
            boxShadow: "2px 2px 0 #000",
            background: "#FFE500",
            padding: "0.4rem 1rem",
            fontSize: "0.85rem",
            fontWeight: 900,
            textTransform: "uppercase",
            letterSpacing: "0.05em",
          }}
        >
          FOCUS: {cleanFocusLabel}
        </motion.div>
      )}

      <style>{`
        .katex-equation .katex { color: #000 !important; }
        .katex-equation .katex-display { margin: 0 !important; overflow-x: auto !important; }
        .katex-equation .fcolorbox { font-weight: bold; border-width: 2px !important; }
      `}</style>
    </div>
  );
}
