"use client";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  Dot,
} from "recharts";
import { motion } from "framer-motion";
import type { GraphContent } from "@/lib/types";

interface GraphSceneProps {
  content: GraphContent;
}

// Custom animated dot in brutalist style
function CustomDot(props: any) {
  const { cx, cy } = props;
  return (
    <g>
      <rect
        x={cx - 7}
        y={cy - 7}
        width={14}
        height={14}
        fill="#FFE500"
        stroke="#000"
        strokeWidth={2.5}
      />
    </g>
  );
}

// Custom styled tooltip
function CustomTooltip({ active, payload, label, xLabel, yLabel }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div
      style={{
        background: "#000",
        color: "#FFE500",
        border: "2px solid #FFE500",
        padding: "0.5rem 0.85rem",
        fontFamily: "'Times New Roman', serif",
        fontWeight: 900,
        fontSize: "0.85rem",
        boxShadow: "3px 3px 0 #FFE500",
      }}
    >
      <div>
        {xLabel}: <span style={{ color: "#fff" }}>{label}</span>
      </div>
      <div>
        {yLabel}: <span style={{ color: "#fff" }}>{payload[0].value}</span>
      </div>
    </div>
  );
}

export function GraphScene({ content }: GraphSceneProps) {
  const { points, x_label, y_label, function_description } = content;

  if (!points || points.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-black font-semibold text-sm">
        No data points provided.
      </div>
    );
  }

  const sorted = [...points].sort((a, b) => a.x - b.x);
  const data = sorted.map((p) => ({ x: p.x, y: p.y }));

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col items-center gap-4 p-6 w-full"
      style={{ fontFamily: "'Times New Roman', Times, serif" }}
    >
      {/* Chart title */}
      {function_description && (
        <div
          style={{
            border: "2px solid #000",
            boxShadow: "3px 3px 0 #000",
            background: "#FFE500",
            padding: "0.3rem 1rem",
            fontSize: "0.85rem",
            fontWeight: 900,
            textTransform: "uppercase",
            letterSpacing: "0.05em",
          }}
        >
          {function_description}
        </div>
      )}

      <div style={{ width: "100%", maxWidth: 520, height: 280 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 30 }}>
            <CartesianGrid
              strokeDasharray="4 4"
              stroke="#ddd"
              strokeWidth={1}
            />
            <XAxis
              dataKey="x"
              label={{
                value: x_label,
                position: "insideBottom",
                offset: -10,
                fontFamily: "'Times New Roman', serif",
                fontWeight: 900,
                fontSize: 13,
                fill: "#000",
              }}
              tick={{
                fontFamily: "'Times New Roman', serif",
                fontWeight: 700,
                fontSize: 12,
                fill: "#000",
              }}
              axisLine={{ stroke: "#000", strokeWidth: 2.5 }}
              tickLine={{ stroke: "#000", strokeWidth: 1.5 }}
              type="number"
              domain={["auto", "auto"]}
            />
            <YAxis
              label={{
                value: y_label,
                angle: -90,
                position: "insideLeft",
                offset: 10,
                fontFamily: "'Times New Roman', serif",
                fontWeight: 900,
                fontSize: 13,
                fill: "#000",
              }}
              tick={{
                fontFamily: "'Times New Roman', serif",
                fontWeight: 700,
                fontSize: 12,
                fill: "#000",
              }}
              axisLine={{ stroke: "#000", strokeWidth: 2.5 }}
              tickLine={{ stroke: "#000", strokeWidth: 1.5 }}
              width={48}
            />
            <Tooltip
              content={<CustomTooltip xLabel={x_label} yLabel={y_label} />}
              cursor={{ stroke: "#FFE500", strokeWidth: 2, strokeDasharray: "4 4" }}
            />
            <ReferenceLine y={0} stroke="#000" strokeWidth={1} strokeDasharray="0" />
            <Line
              type="monotone"
              dataKey="y"
              stroke="#000"
              strokeWidth={3.5}
              dot={<CustomDot />}
              activeDot={{ r: 8, fill: "#FFE500", stroke: "#000", strokeWidth: 3 }}
              isAnimationActive={true}
              animationDuration={900}
              animationEasing="ease-out"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}
