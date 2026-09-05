"use client";

import { ChevronLeft, ChevronRight, RotateCcw } from "lucide-react";

interface SceneControlsProps {
  onNext: () => void;
  onPrev: () => void;
  onReplay: () => void;
  canNext: boolean;
  canPrev: boolean;
  isLast: boolean;
}

export function SceneControls({
  onNext,
  onPrev,
  onReplay,
  canNext,
  canPrev,
  isLast,
}: SceneControlsProps) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "0.75rem" }}>
      {/* Prev */}
      <button
        onClick={onPrev}
        disabled={!canPrev}
        className={canPrev ? "brut-btn-outline" : ""}
        style={
          !canPrev
            ? {
                border: "2px solid #aaa",
                background: "#f0f0f0",
                color: "#888",
                padding: "0.5rem 1rem",
                fontFamily: "'Times New Roman', serif",
                fontWeight: 700,
                fontSize: "0.9rem",
                cursor: "not-allowed",
                display: "inline-flex",
                alignItems: "center",
                gap: "0.4rem",
                textTransform: "uppercase",
              }
            : { fontSize: "0.9rem", padding: "0.55rem 1.2rem" }
        }
      >
        <ChevronLeft style={{ width: 16, height: 16 }} />
        Previous
      </button>

      {/* Replay */}
      <button
        onClick={onReplay}
        title="Replay scene animation"
        className="brut-btn-outline"
        style={{ padding: "0.55rem", minWidth: 42, justifyContent: "center" }}
      >
        <RotateCcw style={{ width: 16, height: 16 }} />
      </button>

      {/* Next / Start Quiz */}
      <button
        onClick={onNext}
        disabled={!canNext}
        className="brut-btn"
        style={{ fontSize: "0.9rem", padding: "0.55rem 1.4rem" }}
      >
        {isLast ? "Start Quiz" : "Next Scene"}
        <ChevronRight style={{ width: 16, height: 16 }} />
      </button>
    </div>
  );
}
