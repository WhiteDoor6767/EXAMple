"use client";

interface SceneProgressProps {
  current: number; // 1-indexed
  total: number;
}

export function SceneProgress({ current, total }: SceneProgressProps) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1rem" }}>
      {/* Box step indicators */}
      <div style={{ display: "flex", gap: 6, flex: 1 }}>
        {Array.from({ length: total }, (_, i) => {
          const isDone = i < current - 1;
          const isCurrent = i === current - 1;
          return (
            <div
              key={i}
              style={{
                flex: 1,
                height: 10,
                border: "2px solid #000",
                background: isCurrent ? "#FFE500" : isDone ? "#000" : "#fff",
                transition: "all 0.2s",
                boxShadow: isCurrent ? "2px 2px 0 #000" : "none",
              }}
            />
          );
        })}
      </div>

      <span
        style={{
          fontFamily: "'Times New Roman', serif",
          fontWeight: 900,
          fontSize: "0.85rem",
          textTransform: "uppercase",
          letterSpacing: "0.05em",
          background: "#FFE500",
          border: "2px solid #000",
          boxShadow: "2px 2px 0 #000",
          padding: "0.25rem 0.6rem",
          whiteSpace: "nowrap",
        }}
      >
        Scene {current} / {total}
      </span>
    </div>
  );
}
