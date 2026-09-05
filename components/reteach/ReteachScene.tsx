"use client";

import { motion } from "framer-motion";
import type { ReTeach } from "@/lib/types";
import { SceneRenderer } from "@/components/renderer/SceneRenderer";
import { MisconceptionAlert } from "./MisconceptionAlert";
import { Repeat2 } from "lucide-react";

interface ReteachSceneProps {
  reteach: ReTeach;
  misconception: string;
  onRetry: () => void;
}

export function ReteachScene({
  reteach,
  misconception,
  onRetry,
}: ReteachSceneProps) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem", fontFamily: "'Times New Roman', Times, serif" }}>
      <MisconceptionAlert misconception={misconception} />

      {/* Visual */}
      <div style={{ border: "3px solid #000", boxShadow: "5px 5px 0 #000", background: "#fff", minHeight: 240, overflow: "hidden" }}>
        <SceneRenderer visual={reteach.visual} sceneKey="reteach" />
      </div>

      {/* Narration */}
      <div style={{ border: "3px solid #000", boxShadow: "4px 4px 0 #000", background: "#FFFEF5", padding: "1.25rem 1.5rem" }}>
        <div style={{ background: "#FFE500", border: "2px solid #000", display: "inline-block", padding: "0.15rem 0.5rem", fontWeight: 900, fontSize: "0.75rem", textTransform: "uppercase", marginBottom: "0.5rem" }}>
          Targeted Re-explanation
        </div>
        <p style={{ fontSize: "1.05rem", lineHeight: 1.6, color: "#000" }}>
          {reteach.narration}
        </p>
      </div>

      {/* Encouragement */}
      <div style={{ textAlign: "center", fontSize: "0.95rem", fontStyle: "italic", fontWeight: 700 }}>
        “{reteach.encouragement}”
      </div>

      {/* Retry button */}
      <div style={{ display: "flex", justifyContent: "center", marginTop: "0.5rem" }}>
        <button onClick={onRetry} className="brut-btn" style={{ fontSize: "1rem", padding: "0.85rem 2rem" }}>
          <Repeat2 style={{ width: 18, height: 18 }} />
          Try the Question Again →
        </button>
      </div>
    </div>
  );
}
