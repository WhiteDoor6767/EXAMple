"use client";

import { useState, useCallback } from "react";
import dynamic from "next/dynamic";
import { LearnPageClient } from "@/components/learn/LearnPageClient";

const Hero = dynamic(() => import("@/components/landing/Hero").then(m => m.Hero), { ssr: false });

type AppPhase = "landing" | "learning";

export default function Home() {
  const [appPhase, setAppPhase] = useState<AppPhase>("landing");
  const [problem, setProblem] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [subjectMode, setSubjectMode] = useState("general");

  const handleStart = useCallback((inputProblem: string, file?: File | null, mode?: string) => {
    setProblem(inputProblem);
    setImageFile(file ?? null);
    setSubjectMode(mode ?? "general");
    setAppPhase("learning");
  }, []);

  const handleReset = useCallback(() => {
    setAppPhase("landing");
    setProblem("");
    setImageFile(null);
    setSubjectMode("general");
  }, []);

  if (appPhase === "learning") {
    return (
      <LearnPageClient
        initialProblem={problem}
        initialImageFile={imageFile}
        initialSubjectMode={subjectMode}
        onReset={handleReset}
      />
    );
  }

  return (
    <main className="min-h-screen bg-white">
      <Hero onStart={handleStart} />
    </main>
  );
}
