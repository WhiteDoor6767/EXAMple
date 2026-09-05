"use client";

import { motion } from "framer-motion";
import DOMPurify from "dompurify";
import { useEffect, useState } from "react";
import type { ShapeTransformContent } from "@/lib/types";

interface ShapeTransformSceneProps {
  content: ShapeTransformContent;
}

// ── Fallback SVG generation for old data ───────────────────────────────────────
function getFallbackSvg(shape?: string) {
  const Y = "#FFE500";
  const DIM = 0.15;
  const stroke = `stroke="${Y}" stroke-width="3"`;
  const fill = `fill="${Y}" fill-opacity="${DIM}"`;
  
  let inner = "";
  if (shape === "circle") {
    inner = `<circle cx="100" cy="100" r="70" ${fill} ${stroke} />`;
  } else if (shape === "triangle") {
    inner = `<polygon points="100,30 30,170 170,170" ${fill} ${stroke} />`;
  } else if (shape === "line") {
    inner = `<line x1="30" y1="100" x2="170" y2="100" ${stroke} />`;
  } else {
    // Default square
    inner = `<rect x="30" y="30" width="140" height="140" ${fill} ${stroke} />`;
  }
  return `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">${inner}</svg>`;
}

// ── Neutral diagram box wrapper ────────────────────────────────────────────────
function DiagramBox({ children, isAfter }: { children: React.ReactNode; isAfter: boolean }) {
  return (
    <div
      style={{
        border: "3px solid #000",
        boxShadow: isAfter ? "6px 6px 0 #000" : "3px 3px 0 #000",
        background: isAfter ? "#FFE500" : "#fff",
        padding: 6,
        position: "relative",
      }}
    >
      {/* Neutral inner viewport — SVG renders freely on dark bg */}
      <div
        style={{
          background: "#111",
          border: "1px solid rgba(255,255,255,0.07)",
          borderRadius: 2,
          overflow: "hidden",
          lineHeight: 0,
          width: 200,
          height: 200,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {children}
      </div>
      {/* Corner accent */}
      <div style={{
        position: "absolute", top: -2, right: -2,
        width: 10, height: 10,
        background: isAfter ? "#000" : "#FFE500",
        border: "1.5px solid #000",
      }} />
    </div>
  );
}

// ── Main export ────────────────────────────────────────────────────────────────
export function ShapeTransformScene({ content }: ShapeTransformSceneProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // For older data without SVGs, fallback to simple static shapes
  const beforeSvgRaw = content.before_svg || getFallbackSvg((content as any).shape);
  const afterSvgRaw = content.after_svg || getFallbackSvg((content as any).shape);

  // Sanitize SVGs on the client
  const beforeSvg = mounted ? DOMPurify.sanitize(beforeSvgRaw, { USE_PROFILES: { svg: true } }) : "";
  const afterSvg = mounted ? DOMPurify.sanitize(afterSvgRaw, { USE_PROFILES: { svg: true } }) : "";

  return (
    <div
      className="flex flex-col items-center justify-center min-h-[220px] gap-6 p-6"
      style={{ fontFamily: "'Times New Roman', Times, serif" }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "1.5rem", flexWrap: "wrap", justifyContent: "center" }}>
        {/* Before */}
        <motion.div
          initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.6rem" }}
        >
          <DiagramBox isAfter={false}>
            {mounted ? <div dangerouslySetInnerHTML={{ __html: beforeSvg }} style={{ width: "100%", height: "100%" }} /> : null}
          </DiagramBox>
          <span style={{ fontSize: "0.7rem", fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.12em", background: "#fff", color: "#000", border: "2px solid #000", padding: "0.15rem 0.6rem" }}>BEFORE</span>
        </motion.div>

        {/* Arrow */}
        <motion.div
          initial={{ opacity: 0, scaleX: 0 }} animate={{ opacity: 1, scaleX: 1 }}
          transition={{ delay: 0.3, duration: 0.4 }}
          style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.4rem" }}
        >
          <svg width={52} height={20} viewBox="0 0 52 20">
            <line x1={0} y1={10} x2={37} y2={10} stroke="#000" strokeWidth={3} />
            <polygon points="37,3 52,10 37,17" fill="#000" />
          </svg>
          <span style={{ fontSize: "0.6rem", fontWeight: 900, textTransform: "uppercase", background: "#FFE500", border: "1.5px solid #000", padding: "0.1rem 0.4rem", letterSpacing: "0.08em" }}>
            TRANSFORM
          </span>
        </motion.div>

        {/* After */}
        <motion.div
          initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.4 }}
          style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.6rem" }}
        >
          <DiagramBox isAfter={true}>
            {mounted ? <div dangerouslySetInnerHTML={{ __html: afterSvg }} style={{ width: "100%", height: "100%" }} /> : null}
          </DiagramBox>
          <span style={{ fontSize: "0.7rem", fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.12em", background: "#000", color: "#FFE500", border: "2px solid #000", padding: "0.15rem 0.6rem" }}>AFTER</span>
        </motion.div>
      </div>

      {/* Description */}
      <motion.div
        initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.35 }}
        style={{
          border: "2.5px solid #000", boxShadow: "4px 4px 0 #000",
          background: "#FFFEF5", padding: "0.75rem 1.5rem",
          maxWidth: "420px", textAlign: "center",
          fontWeight: 700, fontSize: "0.95rem", lineHeight: 1.5,
          position: "relative",
        }}
      >
        <div style={{ position: "absolute", bottom: -3, left: -3, width: 14, height: 14, background: "#FFE500", border: "2px solid #000" }} />
        {content.transform_description}
      </motion.div>
    </div>
  );
}
