"use client";

import { Brain } from "lucide-react";

interface MisconceptionAlertProps {
  misconception: string;
  encouragement?: string;
}

export function MisconceptionAlert({
  misconception,
}: MisconceptionAlertProps) {
  return (
    <div
      style={{
        border: "3px solid #000",
        boxShadow: "5px 5px 0 #000",
        background: "#FFE500",
        padding: "1.25rem 1.5rem",
        fontFamily: "'Times New Roman', Times, serif",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.5rem" }}>
        <div style={{ background: "#000", color: "#FFE500", padding: "0.2rem 0.5rem", fontWeight: 900, fontSize: "0.75rem", textTransform: "uppercase", display: "inline-flex", alignItems: "center", gap: "0.3rem" }}>
          <Brain style={{ width: 14, height: 14 }} />
          Gap Identified
        </div>
      </div>
      <p style={{ fontSize: "1.05rem", fontWeight: 700, color: "#000", lineHeight: 1.4 }}>
        {misconception}
      </p>
    </div>
  );
}
