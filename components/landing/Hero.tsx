"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, Sparkles, X, ImageIcon, ArrowRight, Clipboard } from "lucide-react";
import { Particles } from "@/components/ui/particles";

const EXAMPLE_PROBLEMS = [
  "Why is the derivative of x² equal to 2x?",
  "Solve 2x + 5 = 17 and explain every step",
  "What is the Pythagorean theorem and why does it work?",
  "Explain how compound interest grows over time",
  "What happens when you multiply two negative numbers?",
];

import { HistoryDrawer } from "@/components/history/HistoryDrawer";

export type SubjectMode = "general" | "coding";

const SUBJECT_MODES: { id: SubjectMode; label: string }[] = [
  { id: "general", label: "GENERAL (MATH, PHYSICS, CHEM)" },
  { id: "coding", label: "CODING" },
];

interface HeroProps {
  onStart: (problem: string, imageFile?: File | null, subjectMode?: SubjectMode) => void;
}

export function Hero({ onStart }: HeroProps) {
  const [subjectMode, setSubjectMode] = useState<SubjectMode>("general");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasContent, setHasContent] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageFile = useCallback((file: File) => {
    if (!file.type.startsWith("image/")) {
      setError("Please upload an image file (JPEG, PNG, WebP, etc.)");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError("Image must be smaller than 10MB");
      return;
    }
    setError(null);
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  }, []);

  // ── Clipboard Paste Event Listener (Ctrl+V / Cmd+V) ──
  const handlePaste = useCallback(
    (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (item.type.startsWith("image/")) {
          const file = item.getAsFile();
          if (file) {
            e.preventDefault();
            handleImageFile(file);
            return;
          }
        }
      }
    },
    [handleImageFile]
  );

  useEffect(() => {
    window.addEventListener("paste", handlePaste);
    return () => window.removeEventListener("paste", handlePaste);
  }, [handlePaste]);

  const handleClipboardClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      if (navigator.clipboard && navigator.clipboard.read) {
        const items = await navigator.clipboard.read();
        for (const item of items) {
          const imageType = item.types.find((t) => t.startsWith("image/"));
          if (imageType) {
            const blob = await item.getType(imageType);
            const file = new File([blob], "pasted-image.png", { type: imageType });
            handleImageFile(file);
            return;
          }
        }
      }
      setError("No image found in clipboard. Copy an image and press Ctrl+V / ⌘V.");
    } catch {
      setError("Please press Ctrl+V / ⌘V to paste the image from your clipboard.");
    }
  };

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file) handleImageFile(file);
    },
    [handleImageFile]
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleImageFile(file);
    },
    [handleImageFile]
  );

  const clearImage = useCallback(() => {
    setImageFile(null);
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, [imagePreview]);

  const handleStart = () => {
    const inputValue = textareaRef.current?.value.trim() ?? "";
    if (!inputValue && !imageFile) {
      setError("Please enter a problem or upload an image.");
      return;
    }
    setError(null);
    onStart(inputValue, imageFile, subjectMode);
  };

  const handleExample = (example: string) => {
    if (textareaRef.current) {
      textareaRef.current.value = example;
      setHasContent(true);
    }
    clearImage();
    setError(null);
  };

  const canStart = hasContent || imageFile !== null;

  // Detect mobile viewport for particle density optimization
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 640);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  return (
    <div
      className="relative min-h-screen overflow-hidden"
      style={{ background: "#fff", fontFamily: "'Times New Roman', Times, serif" }}
    >
      {/* ── Magic UI Interactive Particles Background ── */}
      <Particles
        className="absolute inset-0 pointer-events-none z-0"
        quantity={isMobile ? 20 : 100}
        ease={40}
        color="#FFE500"
        strokeColor="#000000"
        size={isMobile ? 2.5 : 3.5}
      />
      <Particles
        className="absolute inset-0 pointer-events-none z-0"
        quantity={isMobile ? 10 : 50}
        ease={30}
        color="#FFCC00"
        strokeColor="#000000"
        size={isMobile ? 4.0 : 5.5}
      />
      {/* ── Top nav bar ── */}
      <div
        className="anim-fade-down relative z-10 flex items-center justify-between px-3 sm:px-6 py-2.5 sm:py-3.5"
        style={{ borderBottom: "3px solid #000", background: "#FFE500" }}
      >
        <div style={{ fontWeight: 900, fontSize: "1.2rem", letterSpacing: "-0.02em", textTransform: "uppercase" }}>
          EXAMPLE
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <div className="hidden sm:block" style={{ fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em" }}>
            AI × LEARNING
          </div>
          <HistoryDrawer onSelectProblem={(p) => handleExample(p)} />
        </div>
      </div>

      {/* ── Hero grid ── */}
      <div className="relative z-10 max-w-5xl mx-auto px-3 sm:px-6 py-6 sm:py-12 md:py-20">

        {/* Big headline */}
        <div className="anim-fade-up-1 mb-6 sm:mb-10">
          <div
            style={{
              display: "inline-block",
              background: "#FFE500",
              border: "3px solid #000",
              boxShadow: "3px 3px 0 #000",
              padding: "0.25rem 0.65rem",
              fontSize: "0.7rem",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.12em",
              marginBottom: "0.85rem",
            }}
          >
            Powered by Gemini AI
          </div>
          <h1
            style={{
              fontSize: "clamp(2.0rem, 7vw, 5.5rem)",
              fontWeight: 900,
              lineHeight: 1.05,
              letterSpacing: "-0.03em",
              textTransform: "uppercase",
              color: "#000",
            }}
          >
            TURN ANY<br />
            PROBLEM INTO<br />
            <span
              style={{
                background: "#FFE500",
                paddingLeft: "0.2em",
                paddingRight: "0.2em",
                display: "inline-block",
                border: "3px solid #000",
                boxShadow: "3px 3px 0 #000",
                marginTop: "0.2rem",
              }}
            >
              A LESSON.
            </span>
          </h1>
          <p
            style={{
              marginTop: "1rem",
              fontSize: "0.95rem",
              color: "#000",
              maxWidth: "42rem",
              lineHeight: 1.45,
              fontStyle: "italic",
            }}
          >
            Type or photograph any academic problem. Select your subject mode. Watch it become animated scenes.
          </p>
        </div>

        {/* ── Input + sidebar grid ── */}
        <div className="anim-fade-up-2 grid md:grid-cols-5 gap-0" style={{ border: "3px solid #000", boxShadow: "4px 4px 0 #000" }}>

          {/* Left: text input */}
          <div className="md:col-span-3 border-b-3 md:border-b-0 md:border-r-3 border-black">
            {/* Subject Selector Bar */}
            <div style={{ borderBottom: "2px solid #000", padding: "0.4rem 0.5rem", background: "#FFFEF5" }}>
              <div className="flex items-center gap-1.5 w-full">
                <span className="hidden md:inline" style={{ fontWeight: 900, fontSize: "0.7rem", textTransform: "uppercase", letterSpacing: "0.08em", whiteSpace: "nowrap" }}>
                  SUBJECT:
                </span>
                <div className="grid grid-cols-2 gap-1.5 w-full">
                  {SUBJECT_MODES.map((mode) => (
                    <button
                      key={mode.id}
                      type="button"
                      onClick={() => setSubjectMode(mode.id)}
                      style={{
                        textAlign: "center",
                        justifyContent: "center",
                        border: "2px solid #000",
                        boxShadow: subjectMode === mode.id ? "2px 2px 0 #000" : "none",
                        background: subjectMode === mode.id ? "#FFE500" : "#fff",
                        color: "#000",
                        padding: "0.35rem 0.25rem",
                        fontSize: "0.7rem",
                        fontWeight: 900,
                        textTransform: "uppercase",
                        cursor: "pointer",
                        transition: "all 0.1s",
                        transform: subjectMode === mode.id ? "translate(-1px, -1px)" : "none",
                      }}
                    >
                      <span className="truncate">
                        {mode.id === "general" ? (isMobile ? "GENERAL" : mode.label) : mode.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div style={{ borderBottom: "3px solid #000", padding: "0.5rem 0.75rem", background: "#FFE500", fontWeight: 700, fontSize: "0.78rem", textTransform: "uppercase", letterSpacing: "0.1em" }}>
              Type your problem
            </div>
            <div style={{ padding: "0.75rem" }}>
              <textarea
                ref={textareaRef}
                id="problem-input"
                defaultValue=""
                onInput={(e) => {
                  setHasContent((e.target as HTMLTextAreaElement).value.trim().length > 0);
                  if (error) setError(null);
                }}
                onKeyDown={(e) => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleStart(); }}
                placeholder="e.g. Why does x² differentiate to 2x?"
                rows={4}
                style={{
                  width: "100%",
                  fontFamily: "'Times New Roman', Times, serif",
                  fontSize: "0.95rem",
                  border: "2px solid #000",
                  padding: "0.65rem",
                  background: "#FFFEF5",
                  resize: "none",
                  outline: "none",
                  lineHeight: 1.45,
                }}
                onFocus={(e) => { e.target.style.boxShadow = "2px 2px 0 #000"; }}
                onBlur={(e) => { e.target.style.boxShadow = "none"; }}
              />
            </div>
          </div>

          {/* Right: image upload */}
          <div className="md:col-span-2">
            <div style={{ borderBottom: "3px solid #000", padding: "0.5rem 0.75rem", background: "#fff", fontWeight: 700, fontSize: "0.78rem", textTransform: "uppercase", letterSpacing: "0.1em", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span>Upload / Paste Image</span>
              <span className="hidden sm:inline" style={{ fontSize: "0.7rem", color: "#666" }}>Ctrl+V / ⌘V</span>
            </div>
            <div style={{ padding: "0.75rem" }}>
              <AnimatePresence mode="wait">
                {imagePreview ? (
                  <motion.div
                    key="preview"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    style={{ position: "relative", border: "2px solid #000" }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={imagePreview} alt="Uploaded problem" style={{ width: "100%", maxHeight: "140px", objectFit: "contain", background: "#f5f5f5" }} />
                    <button
                      onClick={clearImage}
                      style={{ position: "absolute", top: 6, right: 6, background: "#FFE500", border: "2px solid #000", width: 28, height: 28, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", boxShadow: "2px 2px 0 #000" }}
                    >
                      <X style={{ width: 14, height: 14 }} />
                    </button>
                    <div style={{ padding: "0.4rem 0.6rem", background: "#FFE500", borderTop: "2px solid #000", fontSize: "0.72rem", fontWeight: 700 }}>
                      <ImageIcon style={{ width: 12, height: 12, display: "inline", marginRight: 4 }} />
                      {imageFile?.name ?? "Pasted Image"}
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="dropzone"
                    initial={{ opacity: 1 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onDrop={handleDrop}
                    onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                    onDragLeave={() => setDragOver(false)}
                    onClick={() => fileInputRef.current?.click()}
                    style={{
                      border: `2px ${dragOver ? "solid" : "dashed"} #000`,
                      background: dragOver ? "#FFE500" : "#FFFEF5",
                      padding: "1rem 0.5rem",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: "0.4rem",
                      cursor: "pointer",
                      transition: "background 0.15s",
                    }}
                  >
                    <Upload style={{ width: 20, height: 20 }} />
                    <p style={{ fontSize: "0.75rem", fontWeight: 700, textAlign: "center", textTransform: "uppercase" }}>
                      Drop, browse, or Paste Image
                    </p>

                    <button
                      onClick={handleClipboardClick}
                      style={{
                        border: "2px solid #000",
                        boxShadow: "2px 2px 0 #000",
                        background: "#FFE500",
                        padding: "0.3rem 0.65rem",
                        fontSize: "0.7rem",
                        fontWeight: 900,
                        textTransform: "uppercase",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "0.35rem",
                      }}
                    >
                      <Clipboard style={{ width: 12, height: 12 }} />
                      Paste Image
                    </button>

                    <p style={{ fontSize: "0.65rem", color: "#555" }}>JPEG, PNG, WebP — max 10MB</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Error */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              style={{ marginTop: "0.75rem", border: "2px solid #000", background: "#FFE500", padding: "0.5rem 0.85rem", fontWeight: 700, fontSize: "0.8rem", boxShadow: "3px 3px 0 #000" }}
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Generate button */}
        <div className="anim-fade-up-3 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mt-5">
          <button
            onClick={handleStart}
            disabled={!canStart}
            className="w-full sm:w-auto justify-center"
            style={{
              border: "3px solid #000",
              background: canStart ? "#FFE500" : "#E5E5E5",
              color: canStart ? "#000000" : "#777777",
              boxShadow: canStart ? "4px 4px 0 #000" : "none",
              opacity: 1, // Keep 100% solid opacity so floating particles do NOT bleed through!
              fontSize: "0.95rem",
              fontWeight: 900,
              fontFamily: "'Times New Roman', Times, serif",
              padding: "0.75rem 1.75rem",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              cursor: canStart ? "pointer" : "not-allowed",
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
              transition: "all 0.1s",
            }}
          >
            <Sparkles style={{ width: 16, height: 16 }} />
            Generate Lesson
            <ArrowRight style={{ width: 16, height: 16 }} />
          </button>
          <span className="hidden sm:inline" style={{ fontSize: "0.78rem", color: "#666", fontStyle: "italic" }}>Ctrl + Enter / ⌘ + Enter to generate</span>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileInput}
          className="hidden"
          id="image-upload"
        />

        {/* ── How it works ── */}
        <div className="anim-fade-up-3 mt-10">
          <div style={{ fontWeight: 900, fontSize: "0.78rem", textTransform: "uppercase", letterSpacing: "0.15em", borderBottom: "3px solid #000", paddingBottom: "0.4rem", marginBottom: "0.85rem" }}>
            How it works
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-0 border-3 border-black shadow-[4px_4px_0_#000]">
            {[
              { num: "01", label: "INPUT", desc: "Type or photograph a problem", borderClass: "border-r-3 border-b-3 md:border-b-0 border-black bg-white" },
              { num: "02", label: "LEARN", desc: "Watch animated visual scenes", borderClass: "border-b-3 md:border-b-0 md:border-r-3 border-black bg-[#FFFEF5]" },
              { num: "03", label: "QUIZ", desc: "Answer grounded questions", borderClass: "border-r-3 md:border-r-3 border-black bg-white" },
              { num: "04", label: "ADAPT", desc: "Gaps get re-taught directly", borderClass: "bg-[#FFFEF5]" },
            ].map((item) => (
              <div
                key={item.num}
                className={`p-3 sm:p-4 ${item.borderClass}`}
              >
                <div style={{ fontWeight: 900, fontSize: "1.5rem", lineHeight: 1, color: "#FFE500", WebkitTextStroke: "2px #000" }}>
                  {item.num}
                </div>
                <div style={{ fontWeight: 900, fontSize: "0.8rem", marginTop: "0.3rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  {item.label}
                </div>
                <div style={{ fontSize: "0.75rem", color: "#444", marginTop: "0.2rem", fontStyle: "italic" }}>
                  {item.desc}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Example problems ── */}
        <div className="anim-fade-up-4 mt-9">
          <div style={{ fontWeight: 900, fontSize: "0.78rem", textTransform: "uppercase", letterSpacing: "0.15em", borderBottom: "3px solid #000", paddingBottom: "0.4rem", marginBottom: "0.85rem" }}>
            Try an example
          </div>
          <div className="flex flex-col sm:flex-row sm:flex-wrap gap-2">
            {EXAMPLE_PROBLEMS.map((example, i) => (
              <button
                key={i}
                onClick={() => handleExample(example)}
                className="anim-chip w-full sm:w-auto text-left max-w-full"
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.background = "#FFE500";
                  (e.currentTarget as HTMLButtonElement).style.boxShadow = "3px 3px 0 #000";
                  (e.currentTarget as HTMLButtonElement).style.transform = "translate(-1px, -1px)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.background = "#fff";
                  (e.currentTarget as HTMLButtonElement).style.boxShadow = "2px 2px 0 #000";
                  (e.currentTarget as HTMLButtonElement).style.transform = "none";
                }}
                style={{
                  ["--chip-i" as string]: i,
                  border: "2px solid #000",
                  background: "#fff",
                  boxShadow: "2px 2px 0 #000",
                  padding: "0.45rem 0.75rem",
                  fontSize: "0.8rem",
                  fontFamily: "'Times New Roman', Times, serif",
                  fontWeight: 600,
                  cursor: "pointer",
                  transition: "all 0.1s",
                }}
              >
                {example}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Footer bar ── */}
      <div
        className="anim-fade-up-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-center px-4 py-3"
        style={{ borderTop: "3px solid #000", background: "#000", color: "#FFE500", fontWeight: 700, fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.1em" }}
      >
        <span>EXAMPLE © 2026</span>
        <span>BUILT WITH GEMINI AI</span>
      </div>
    </div>
  );
}
