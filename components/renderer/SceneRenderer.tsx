"use client";

import type { VisualContent } from "@/lib/types";
import { EquationScene } from "./EquationScene";
import { SequenceTableScene } from "./SequenceTableScene";
import { NumberLineScene } from "./NumberLineScene";
import { GraphScene } from "./GraphScene";
import { ShapeTransformScene } from "./ShapeTransformScene";
import { TextHighlightScene } from "./TextHighlightScene";

interface SceneRendererProps {
  visual: VisualContent;
  /** Scene key — change this to trigger re-mount / re-animation */
  sceneKey: string | number;
}

/**
 * SceneRenderer — dispatches to the correct visual component based on visual.type.
 * Each component receives fully-typed content via the discriminated union.
 * If an unknown type is encountered, renders a graceful fallback.
 */
export function SceneRenderer({ visual, sceneKey }: SceneRendererProps) {
  switch (visual.type) {
    case "equation":
      return <EquationScene key={sceneKey} content={visual.content} />;

    case "sequence_table":
      return <SequenceTableScene key={sceneKey} content={visual.content} />;

    case "number_line":
      return <NumberLineScene key={sceneKey} content={visual.content} />;

    case "graph":
      return <GraphScene key={sceneKey} content={visual.content} />;

    case "shape_transform":
      return <ShapeTransformScene key={sceneKey} content={visual.content} />;

    case "text_highlight":
      return <TextHighlightScene key={sceneKey} content={visual.content} />;

    default: {
      // TypeScript will catch unknown visual types at compile time,
      // but this provides runtime safety for any future model outputs.
      const exhaustiveCheck: never = visual;
      console.warn("[SceneRenderer] Unknown visual type:", (exhaustiveCheck as VisualContent).type);
      return (
        <div className="flex items-center justify-center h-48 rounded-xl bg-slate-800/50 border border-slate-700">
          <p className="text-slate-400 text-sm">
            Visual type not supported in this version.
          </p>
        </div>
      );
    }
  }
}
