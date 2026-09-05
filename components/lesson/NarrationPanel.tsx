"use client";

import { motion, AnimatePresence } from "framer-motion";

interface NarrationPanelProps {
  narration: string;
  sceneId: number;
}

export function NarrationPanel({ narration, sceneId }: NarrationPanelProps) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={sceneId}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.25 }}
        style={{
          border: "3px solid #000",
          boxShadow: "4px 4px 0 #000",
          background: "#FFFEF5",
          padding: "1.25rem 1.5rem",
          fontFamily: "'Times New Roman', Times, serif",
        }}
      >
        <div style={{ display: "flex", gap: "0.75rem", alignItems: "flex-start" }}>
          <div
            style={{
              background: "#FFE500",
              border: "2px solid #000",
              padding: "0.15rem 0.5rem",
              fontWeight: 900,
              fontSize: "0.75rem",
              textTransform: "uppercase",
              flexShrink: 0,
              marginTop: 2,
            }}
          >
            EXPLANATION
          </div>
          <p style={{ fontSize: "1.05rem", lineHeight: 1.6, color: "#000" }}>
            {narration}
          </p>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
