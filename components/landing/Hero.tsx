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

  return (
    <div
      className="relative min-h-screen overflow-hidden"
      style={{ background: "#fff", fontFamily: "'Times New Roman', Times, serif" }}
    >
      {/* ── Magic UI Interactive Particles Background (Brutalist High-Contrast Yellow) ── */}
      <Particles
        className="absolute inset-0 pointer-events-none z-0"
        quantity={100}
        ease={40}
        color="#FFE500"
        strokeColor="#000000"
        size={3.5}
      />
      <Particles
        className="absolute inset-0 pointer-events-none z-0"
        quantity={50}
        ease={30}
        color="#FFCC00"
        strokeColor="#000000"
        size={5.5}
      />
      {/* ── Top nav bar ── */}
      <div
        className="anim-fade-down relative z-10 flex items-center justify-between px-6 py-4"
        style={{ borderBottom: "3px solid #000", background: "#FFE500" }}
      >
        <div style={{ fontWeight: 900, fontSize: "1.5rem", letterSpacing: "-0.02em", textTransform: "uppercase" }}>
          EXAMPLE
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <div style={{ fontSize: "0.8rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em" }}>
            AI × LEARNING
          </div>
          <HistoryDrawer onSelectProblem={(p) => handleExample(p)} />
        </div>
      </div>

      {/* ── Hero grid ── */}
      <div className="relative z-10 max-w-5xl mx-auto px-6 py-12 md:py-20">

        {/* Big headline */}
        <div className="anim-fade-up-1 mb-10">
          <div
            style={{
              display: "inline-block",
              background: "#FFE500",
              border: "3px solid #000",
              boxShadow: "6px 6px 0 #000",
              padding: "0.3rem 0.8rem",
              fontSize: "0.75rem",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.15em",
              marginBottom: "1.2rem",
            }}
          >
            ✦ Powered by Gemini AI
          </div>
          <h1
            style={{
              fontSize: "clamp(2.5rem, 7vw, 5.5rem)",
              fontWeight: 900,
              lineHeight: 1.0,
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
                boxShadow: "4px 4px 0 #000",
              }}
            >
              A LESSON.
            </span>
          </h1>
          <p
            style={{
              marginTop: "1.5rem",
              fontSize: "1.1rem",
              color: "#000",
              maxWidth: "42rem",
              lineHeight: 1.6,
              fontStyle: "italic",
            }}
          >
            Type or photograph any academic problem. Select your subject mode. Watch it become animated scenes.
          </p>
        </div>

        {/* ── Input + sidebar grid ── */}
        <div className="anim-fade-up-2 grid md:grid-cols-5 gap-0" style={{ border: "3px solid #000", boxShadow: "6px 6px 0 #000" }}>

          {/* Left: text input */}
          <div className="md:col-span-3" style={{ borderRight: "3px solid #000" }}>
            {/* Subject Selector Bar */}
            <div style={{ borderBottom: "2px solid #000", padding: "0.6rem 0.8rem", background: "#FFFEF5", display: "flex", alignItems: "center", gap: "0.35rem", flexWrap: "wrap" }}>
              <span style={{ fontWeight: 900, fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: "0.08em", marginRight: "0.15rem" }}>
                SUBJECT:
              </span>
              {SUBJECT_MODES.map((mode) => (
                <button
                  key={mode.id}
                  type="button"
                  onClick={() => setSubjectMode(mode.id)}
                  style={{
                    border: "2px solid #000",
                    boxShadow: subjectMode === mode.id ? "2px 2px 0 #000" : "none",
                    background: subjectMode === mode.id ? "#FFE500" : "#fff",
                    color: "#000",
                    padding: "0.2rem 0.65rem",
                    fontSize: "0.75rem",
                    fontWeight: 900,
                    textTransform: "uppercase",
                    cursor: "pointer",
                    transition: "all 0.1s",
                    transform: subjectMode === mode.id ? "translate(-1px, -1px)" : "none",
                  }}
                >
                  <span>{mode.label}</span>
                </button>
              ))}
            </div>

            <div style={{ borderBottom: "3px solid #000", padding: "0.6rem 1rem", background: "#FFE500", fontWeight: 700, fontSize: "0.8rem", textTransform: "uppercase", letterSpacing: "0.1em" }}>
              ▶ Type your problem
            </div>
            <div style={{ padding: "1rem" }}>
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
                rows={5}
                style={{
                  width: "100%",
                  fontFamily: "'Times New Roman', Times, serif",
                  fontSize: "1rem",
                  border: "2px solid #000",
                  padding: "0.75rem",
                  background: "#FFFEF5",
                  resize: "none",
                  outline: "none",
                  lineHeight: 1.6,
                }}
                onFocus={(e) => { e.target.style.boxShadow = "3px 3px 0 #000"; }}
                onBlur={(e) => { e.target.style.boxShadow = "none"; }}
              />
            </div>
          </div>

          {/* Right: image upload */}
          <div className="md:col-span-2">
            <div style={{ borderBottom: "3px solid #000", padding: "0.75rem 1rem", background: "#fff", fontWeight: 700, fontSize: "0.8rem", textTransform: "uppercase", letterSpacing: "0.1em", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span>▶ Upload / Paste Image</span>
              <span style={{ fontSize: "0.7rem", color: "#666" }}>Ctrl+V / ⌘V</span>
            </div>
            <div style={{ padding: "1rem" }}>
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
                    <img src={imagePreview} alt="Uploaded problem" style={{ width: "100%", maxHeight: "180px", objectFit: "contain", background: "#f5f5f5" }} />
                    <button
                      onClick={clearImage}
                      style={{ position: "absolute", top: 6, right: 6, background: "#FFE500", border: "2px solid #000", width: 28, height: 28, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", boxShadow: "2px 2px 0 #000" }}
                    >
                      <X style={{ width: 14, height: 14 }} />
                    </button>
                    <div style={{ padding: "0.4rem 0.6rem", background: "#FFE500", borderTop: "2px solid #000", fontSize: "0.75rem", fontWeight: 700 }}>
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
                      padding: "1.5rem 1rem",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: "0.6rem",
                      cursor: "pointer",
                      transition: "background 0.15s",
                    }}
                  >
                    <Upload style={{ width: 24, height: 24 }} />
                    <p style={{ fontSize: "0.8rem", fontWeight: 700, textAlign: "center", textTransform: "uppercase" }}>
                      Drop, browse, or Paste (Ctrl+V)
                    </p>

                    <button
                      onClick={handleClipboardClick}
                      style={{
                        border: "2px solid #000",
                        boxShadow: "2px 2px 0 #000",
                        background: "#FFE500",
                        padding: "0.3rem 0.75rem",
                        fontSize: "0.75rem",
                        fontWeight: 900,
                        textTransform: "uppercase",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "0.4rem",
                        marginTop: "0.2rem",
                      }}
                    >
                      <Clipboard style={{ width: 12, height: 12 }} />
                      Paste from Clipboard
                    </button>

                    <p style={{ fontSize: "0.7rem", color: "#555" }}>JPEG, PNG, WebP — max 10MB</p>
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
              style={{ marginTop: "0.75rem", border: "2px solid #000", background: "#FFE500", padding: "0.6rem 1rem", fontWeight: 700, fontSize: "0.875rem", boxShadow: "3px 3px 0 #000" }}
            >
              ⚠ {error}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Generate button */}
        <div className="anim-fade-up-3 flex items-center gap-4 mt-6">
          <button
            onClick={handleStart}
            disabled={!canStart}
            className="brut-btn"
            style={{
              fontSize: "1rem",
              padding: "0.85rem 2rem",
              opacity: canStart ? 1 : 0.4,
              cursor: canStart ? "pointer" : "not-allowed",
              boxShadow: canStart ? "var(--shadow-lg)" : "none",
            }}
          >
            <Sparkles style={{ width: 16, height: 16 }} />
            Generate Lesson
            <ArrowRight style={{ width: 16, height: 16 }} />
          </button>
          <span style={{ fontSize: "0.8rem", color: "#666", fontStyle: "italic" }}>Ctrl + Enter / ⌘ + Enter to generate</span>
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
        <div className="anim-fade-up-3 mt-14">
          <div style={{ fontWeight: 900, fontSize: "0.8rem", textTransform: "uppercase", letterSpacing: "0.15em", borderBottom: "3px solid #000", paddingBottom: "0.5rem", marginBottom: "1rem" }}>
            How it works
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-0" style={{ border: "3px solid #000", boxShadow: "4px 4px 0 #000" }}>
            {[
              { num: "01", label: "INPUT", desc: "Type or photograph a problem" },
              { num: "02", label: "LEARN", desc: "Watch animated visual scenes" },
              { num: "03", label: "QUIZ", desc: "Answer grounded questions" },
              { num: "04", label: "ADAPT", desc: "Gaps get re-taught directly" },
            ].map((item, i) => (
              <div
                key={item.num}
                style={{
                  padding: "1.25rem 1rem",
                  borderRight: i < 3 ? "3px solid #000" : "none",
                  background: i % 2 === 0 ? "#fff" : "#FFFEF5",
                }}
              >
                <div style={{ fontWeight: 900, fontSize: "1.8rem", lineHeight: 1, color: "#FFE500", WebkitTextStroke: "2px #000" }}>
                  {item.num}
                </div>
                <div style={{ fontWeight: 900, fontSize: "0.85rem", marginTop: "0.4rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  {item.label}
                </div>
                <div style={{ fontSize: "0.8rem", color: "#444", marginTop: "0.25rem", fontStyle: "italic" }}>
                  {item.desc}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Example problems ── */}
        <div className="anim-fade-up-4 mt-12">
          <div style={{ fontWeight: 900, fontSize: "0.8rem", textTransform: "uppercase", letterSpacing: "0.15em", borderBottom: "3px solid #000", paddingBottom: "0.5rem", marginBottom: "1rem" }}>
            Try an example
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.6rem" }}>
            {EXAMPLE_PROBLEMS.map((example, i) => (
              <button
                key={i}
                onClick={() => handleExample(example)}
                className="anim-chip"
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
                  padding: "0.4rem 0.9rem",
                  fontSize: "0.82rem",
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
        className="anim-fade-up-4"
        style={{ borderTop: "3px solid #000", padding: "1rem 1.5rem", display: "flex", justifyContent: "space-between", alignItems: "center", background: "#000", color: "#FFE500", fontWeight: 700, fontSize: "0.8rem", textTransform: "uppercase", letterSpacing: "0.1em" }}
      >
        <span>EXAMPLE © 2026</span>
        <span>BUILT WITH GEMINI AI</span>
      </div>
    </div>
  );
}
