"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Copy, Check, Trash2, Code2, Calculator, Sparkles } from "lucide-react";
import { getHistory, deleteHistoryItem, clearHistory, HistoryItem } from "@/lib/utils/history";

interface HistoryDrawerProps {
  onSelectProblem?: (problem: string) => void;
}

export function HistoryDrawer({ onSelectProblem }: HistoryDrawerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [historyItems, setHistoryItems] = useState<HistoryItem[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const loadHistory = () => {
    setHistoryItems(getHistory());
  };

  useEffect(() => {
    if (isOpen) {
      loadHistory();
    }
  }, [isOpen]);

  const handleCopy = async (id: string, text: string) => {
    let copied = false;
    if (typeof navigator !== "undefined" && navigator.clipboard && typeof navigator.clipboard.writeText === "function") {
      try {
        await navigator.clipboard.writeText(text);
        copied = true;
      } catch {}
    }

    if (!copied && typeof document !== "undefined") {
      try {
        const textarea = document.createElement("textarea");
        textarea.value = text;
        textarea.style.position = "fixed";
        textarea.style.left = "-9999px";
        textarea.style.top = "-9999px";
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        copied = document.execCommand("copy");
        document.body.removeChild(textarea);
      } catch {}
    }

    if (copied) {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = deleteHistoryItem(id);
    setHistoryItems(updated);
  };

  const handleClearAll = () => {
    clearHistory();
    setHistoryItems([]);
  };

  const drawerContent = (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              width: "100vw",
              height: "100vh",
              background: "rgba(0, 0, 0, 0.6)",
              backdropFilter: "blur(3px)",
              zIndex: 99998,
            }}
          />

          {/* Right Drawer Panel */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 26, stiffness: 260 }}
            style={{
              position: "fixed",
              top: 0,
              right: 0,
              width: "min(440px, 92vw)",
              height: "100vh",
              background: "#fff",
              borderLeft: "4px solid #000",
              boxShadow: "-10px 0 0 rgba(0,0,0,0.25)",
              zIndex: 99999,
              display: "flex",
              flexDirection: "column",
              fontFamily: "'Times New Roman', Times, serif",
            }}
          >
            {/* Drawer Header */}
            <div
              style={{
                background: "#FFE500",
                borderBottom: "3px solid #000",
                padding: "1rem 1.25rem",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flexShrink: 0,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <div
                  style={{
                    background: "#000",
                    color: "#FFE500",
                    padding: "0.2rem 0.5rem",
                    fontWeight: 900,
                    fontSize: "0.75rem",
                    letterSpacing: "0.1em",
                  }}
                >
                  SOLUTIONS
                </div>
                <span style={{ fontWeight: 900, fontSize: "1.1rem", textTransform: "uppercase" }}>
                  HISTORY
                </span>
              </div>

              <button
                onClick={() => setIsOpen(false)}
                style={{
                  background: "#fff",
                  border: "2px solid #000",
                  boxShadow: "2px 2px 0 #000",
                  width: 32,
                  height: 32,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                }}
                title="Close Menu"
              >
                <X style={{ width: 18, height: 18, strokeWidth: 2.5 }} />
              </button>
            </div>

            {/* Drawer Controls Bar */}
            <div
              style={{
                padding: "0.6rem 1.25rem",
                borderBottom: "2px solid #000",
                background: "#FFFEF5",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                fontSize: "0.8rem",
                fontWeight: 700,
                flexShrink: 0,
              }}
            >
              <span style={{ textTransform: "uppercase", letterSpacing: "0.05em" }}>
                {historyItems.length} {historyItems.length === 1 ? "Solution Saved" : "Solutions Saved"}
              </span>
              {historyItems.length > 0 && (
                <button
                  onClick={handleClearAll}
                  style={{
                    background: "transparent",
                    border: "none",
                    color: "#d97706",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.25rem",
                    fontWeight: 700,
                    fontSize: "0.75rem",
                  }}
                >
                  <Trash2 style={{ width: 12, height: 12 }} />
                  Clear All
                </button>
              )}
            </div>

            {/* History Items Body */}
            <div style={{ flex: 1, overflowY: "auto", padding: "1rem" }}>
              {historyItems.length === 0 ? (
                <div
                  style={{
                    padding: "3rem 1.5rem",
                    textAlign: "center",
                    border: "2px dashed #000",
                    background: "#FFFEF5",
                    marginTop: "1rem",
                  }}
                >
                  <Sparkles style={{ width: 32, height: 32, margin: "0 auto 0.75rem", color: "#666" }} />
                  <div style={{ fontWeight: 900, fontSize: "1rem", textTransform: "uppercase" }}>
                    No Saved Solutions Yet
                  </div>
                  <p style={{ fontSize: "0.85rem", color: "#555", marginTop: "0.4rem", fontStyle: "italic" }}>
                    Generate a lesson to see clean code & formula solutions automatically stored here.
                  </p>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                  {historyItems.map((item) => (
                    <div
                      key={item.id}
                      style={{
                        border: "2px solid #000",
                        boxShadow: "4px 4px 0 #000",
                        background: "#fff",
                        overflow: "hidden",
                      }}
                    >
                      {/* Item Card Header */}
                      <div
                        style={{
                          background: item.isCoding ? "#FFE500" : "#f4f4f5",
                          borderBottom: "2px solid #000",
                          padding: "0.5rem 0.75rem",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                          {item.isCoding ? (
                            <Code2 style={{ width: 14, height: 14 }} />
                          ) : (
                            <Calculator style={{ width: 14, height: 14 }} />
                          )}
                          <span
                            style={{
                              fontWeight: 900,
                              fontSize: "0.7rem",
                              textTransform: "uppercase",
                              letterSpacing: "0.08em",
                            }}
                          >
                            {item.isCoding ? "C++ Code Solution" : "Math Solution"}
                          </span>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                          <span style={{ fontSize: "0.7rem", color: "#444", fontWeight: 600 }}>
                            {item.timestamp}
                          </span>
                          <button
                            onClick={(e) => handleDelete(item.id, e)}
                            style={{ background: "none", border: "none", cursor: "pointer", color: "#000" }}
                            title="Delete entry"
                          >
                            <X style={{ width: 14, height: 14 }} />
                          </button>
                        </div>
                      </div>

                      {/* Problem Title */}
                      <div style={{ padding: "0.6rem 0.75rem 0.3rem", fontWeight: 800, fontSize: "0.9rem" }}>
                        {item.problem}
                      </div>

                      {/* Solution Block (ONLY PURE CODE / FORMULA — NO WRITTEN PROSE) */}
                      <div style={{ padding: "0 0.75rem 0.75rem" }}>
                        <pre
                          style={{
                            background: "#000",
                            color: "#FFE500",
                            border: "2px solid #000",
                            padding: "0.65rem 0.75rem",
                            fontSize: "0.82rem",
                            fontFamily: item.isCoding ? "monospace" : "'Times New Roman', serif",
                            whiteSpace: "pre-wrap",
                            wordBreak: "break-word",
                            maxHeight: "220px",
                            overflowY: "auto",
                            margin: 0,
                          }}
                        >
                          {item.solution}
                        </pre>

                        {/* Action Buttons */}
                        <div
                          style={{
                            display: "flex",
                            gap: "0.5rem",
                            marginTop: "0.6rem",
                            justifyContent: "space-between",
                          }}
                        >
                          <button
                            onClick={() => handleCopy(item.id, item.solution)}
                            style={{
                              flex: 1,
                              border: "2px solid #000",
                              boxShadow: "2px 2px 0 #000",
                              background: copiedId === item.id ? "#86efac" : "#FFE500",
                              padding: "0.36rem 0.6rem",
                              fontSize: "0.75rem",
                              fontWeight: 900,
                              textTransform: "uppercase",
                              cursor: "pointer",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              gap: "0.35rem",
                            }}
                          >
                            {copiedId === item.id ? (
                              <>
                                <Check style={{ width: 12, height: 12 }} />
                                Copied C++ Code
                              </>
                            ) : (
                              <>
                                <Copy style={{ width: 12, height: 12 }} />
                                {item.isCoding ? "Copy C++ Code" : "Copy Solution"}
                              </>
                            )}
                          </button>

                          {onSelectProblem && (
                            <button
                              onClick={() => {
                                onSelectProblem(item.problem);
                                setIsOpen(false);
                              }}
                              style={{
                                border: "2px solid #000",
                                boxShadow: "2px 2px 0 #000",
                                background: "#fff",
                                padding: "0.36rem 0.6rem",
                                fontSize: "0.75rem",
                                fontWeight: 900,
                                textTransform: "uppercase",
                                cursor: "pointer",
                              }}
                            >
                              Re-Open
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );

  return (
    <>
      {/* ── Hamburger Menu Button ── */}
      <button
        onClick={() => setIsOpen(true)}
        aria-label="Open Solutions History Menu"
        style={{
          background: "#FFE500",
          border: "2px solid #000",
          boxShadow: "3px 3px 0 #000",
          padding: "0.4rem 0.65rem",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          gap: "0.4rem",
          fontWeight: 900,
          fontSize: "0.85rem",
          textTransform: "uppercase",
          fontFamily: "'Times New Roman', Times, serif",
          transition: "transform 0.1s, box-shadow 0.1s",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = "translate(-1px, -1px)";
          e.currentTarget.style.boxShadow = "4px 4px 0 #000";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "none";
          e.currentTarget.style.boxShadow = "3px 3px 0 #000";
        }}
      >
        <Menu style={{ width: 20, height: 20, strokeWidth: 2.5 }} />
        <span>HISTORY</span>
      </button>

      {/* ── Render Drawer using React Portal directly onto document.body ── */}
      {mounted ? createPortal(drawerContent, document.body) : null}
    </>
  );
}
