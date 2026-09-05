"use client";

import { motion } from "framer-motion";
import type { NumberLineContent } from "@/lib/types";

interface NumberLineSceneProps {
  content: NumberLineContent;
}

const SVG_WIDTH = 520;
const SVG_HEIGHT = 120;
const AXIS_Y = 60;
const PADDING_X = 40;

function toSvgX(value: number, min: number, max: number): number {
  const range = max - min || 1;
  return PADDING_X + ((value - min) / range) * (SVG_WIDTH - 2 * PADDING_X);
}

export function NumberLineScene({ content }: NumberLineSceneProps) {
  const { min, max, points } = content;

  const range = max - min;
  const tickStep = range <= 10 ? 1 : range <= 50 ? 5 : Math.ceil(range / 10);
  const ticks: number[] = [];
  for (let t = Math.ceil(min); t <= max; t += tickStep) {
    ticks.push(t);
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[220px] gap-4 p-6 w-full" style={{ fontFamily: "'Times New Roman', Times, serif" }}>
      <div className="w-full max-w-2xl">
        <svg
          viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
          className="w-full"
          aria-label="Number line"
        >
          {/* Axis line */}
          <line
            x1={PADDING_X}
            y1={AXIS_Y}
            x2={SVG_WIDTH - PADDING_X}
            y2={AXIS_Y}
            stroke="#000"
            strokeWidth={3}
          />

          {/* Arrowheads */}
          <polygon
            points={`${SVG_WIDTH - PADDING_X},${AXIS_Y} ${SVG_WIDTH - PADDING_X - 10},${AXIS_Y - 6} ${SVG_WIDTH - PADDING_X - 10},${AXIS_Y + 6}`}
            fill="#000"
          />
          <polygon
            points={`${PADDING_X},${AXIS_Y} ${PADDING_X + 10},${AXIS_Y - 6} ${PADDING_X + 10},${AXIS_Y + 6}`}
            fill="#000"
          />

          {/* Tick marks */}
          {ticks.map((tick) => {
            const x = toSvgX(tick, min, max);
            return (
              <g key={tick}>
                <line
                  x1={x}
                  y1={AXIS_Y - 8}
                  x2={x}
                  y2={AXIS_Y + 8}
                  stroke="#000"
                  strokeWidth={2}
                />
                <text
                  x={x}
                  y={AXIS_Y + 26}
                  textAnchor="middle"
                  fill="#000"
                  fontSize={14}
                  fontWeight={700}
                  fontFamily="'Times New Roman', serif"
                >
                  {tick}
                </text>
              </g>
            );
          })}

          {/* Points */}
          {points.map((point, i) => {
            const x = toSvgX(point.value, min, max);
            return (
              <g key={point.value}>
                <motion.circle
                  cx={x}
                  cy={AXIS_Y}
                  r={9}
                  fill="#FFE500"
                  stroke="#000"
                  strokeWidth={3}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.3 + i * 0.2, type: "spring" }}
                />
                <text
                  x={x}
                  y={AXIS_Y - 18}
                  textAnchor="middle"
                  fill="#000"
                  fontSize={14}
                  fontWeight={900}
                  fontFamily="'Times New Roman', serif"
                >
                  {point.label}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Legend */}
      <div className="flex gap-3 flex-wrap justify-center">
        {points.map((point) => (
          <div
            key={point.value}
            style={{
              border: "2px solid #000",
              boxShadow: "2px 2px 0 #000",
              background: "#FFE500",
              padding: "0.25rem 0.75rem",
              fontWeight: 900,
              fontSize: "0.85rem",
            }}
          >
            {point.label} = {point.value}
          </div>
        ))}
      </div>
    </div>
  );
}
