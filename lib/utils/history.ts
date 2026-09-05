export interface HistoryItem {
  id: string;
  timestamp: string;
  problem: string;
  isCoding: boolean;
  solution: string;
}

const STORAGE_KEY = "visualizer_solution_history";

/**
 * Extracts ONLY pure C++ code for coding problems, or clean formula expressions for math.
 * Completely eliminates English explanation sentences.
 */
function cleanLatex(str: string): string {
  return str
    .replace(/\\text\{([^}]*)\}/g, "$1")
    .replace(/\\frac\{([^}]*)\}\{([^}]*)\}/g, "($1)/($2)")
    .replace(/\\le/g, "<=")
    .replace(/\\ge/g, ">=")
    .replace(/\\times/g, "*")
    .replace(/\\cdot/g, "*")
    .replace(/\\/g, "");
}

export function extractConciseSolution(
  problem: string,
  scenes: Array<{ visual: any }>,
  subjectMode: string = "general"
): { solution: string; isCoding: boolean } {
  // Explicit check based on selected button OR explicit code regex
  const isCoding =
    subjectMode === "coding" ||
    /\b(c\+\+|cpp|python|java|javascript|typescript|leetcode|codeforces|write a program|implementation in c\+\+)\b/i.test(
      problem
    ) ||
    scenes.some(
      (s) =>
        s.visual?.type === "equation" &&
        /#include\s*<|std::|int main\(|void main\(|#include\s*<iostream>/i.test(
          s.visual?.content?.expression || ""
        )
    );

  const codeLines: string[] = [];
  const mathLines: string[] = [];

  for (const scene of scenes) {
    const v = scene.visual;
    if (!v) continue;

    const extractFromText = (text: string) => {
      const cleaned = cleanLatex(text.trim());
      if (!cleaned) return;

      // Ignore English meta labels
      if (/^(Goal|State|Transition|Condition|Key Insight|Problem):/i.test(cleaned)) {
        return;
      }

      // Check if it's C++ code syntax
      if (
        /#include|cin|cout|std::|int main|void |vector<|string |using namespace|return |for\s*\(|while\s*\(|if\s*\(|dp\[|[{};]/.test(
          cleaned
        )
      ) {
        codeLines.push(cleaned);
      } else {
        mathLines.push(cleaned);
      }
    };

    if (v.type === "equation" && v.content?.expression) {
      extractFromText(v.content.expression);
    } else if (v.type === "sequence_table" && Array.isArray(v.content?.rows)) {
      for (const row of v.content.rows) {
        extractFromText(row);
      }
    } else if (v.type === "text_highlight" && v.content?.text) {
      for (const line of v.content.text.split("\n")) {
        extractFromText(line);
      }
    }
  }

  if (isCoding) {
    let rawCode = codeLines.join("\n").trim();

    // If code lines are squished into one line, split common C++ keywords onto separate lines
    if (rawCode && !rawCode.includes("\n")) {
      rawCode = rawCode
        .replace(/(#include\s*<[^>]+>)/g, "$1\n")
        .replace(/(using namespace std;)/g, "$1\n")
        .replace(/(int main\(\)\s*\{)/g, "$1\n    ")
        .replace(/(return 0;\s*\})/g, "\n    $1");
    }

    if (!rawCode.includes("#include")) {
      const body = codeLines.length > 0 ? codeLines.join("\n    ") : "// Algorithm implementation";
      rawCode = `#include <iostream>
#include <string>
#include <vector>
using namespace std;

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);

    ${body}

    return 0;
}`;
    }

    return {
      solution: rawCode,
      isCoding: true,
    };
  }

  // Math/Physics problem: return clean step-by-step formulas
  const cleanMath = mathLines.length > 0 ? mathLines.join("\n") : cleanLatex(problem);
  return {
    solution: cleanMath,
    isCoding: false,
  };
}

export function getHistory(): HistoryItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveToHistory(problem: string, scenes: Array<{ visual: any }>, subjectMode: string = "general"): HistoryItem | null {
  if (typeof window === "undefined" || !problem) return null;
  try {
    const { solution, isCoding } = extractConciseSolution(problem, scenes, subjectMode);
    const existing = getHistory();

    const filtered = existing.filter((item) => item.problem.toLowerCase().trim() !== problem.toLowerCase().trim());

    const newItem: HistoryItem = {
      id: Date.now().toString(),
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", month: "short", day: "numeric" }),
      problem,
      isCoding,
      solution,
    };

    const updated = [newItem, ...filtered].slice(0, 30);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return newItem;
  } catch {
    return null;
  }
}

export function deleteHistoryItem(id: string): HistoryItem[] {
  if (typeof window === "undefined") return [];
  try {
    const existing = getHistory();
    const updated = existing.filter((item) => item.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch {
    return [];
  }
}

export function clearHistory(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {}
}
