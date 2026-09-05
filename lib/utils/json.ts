/**
 * JSON utility functions for cleaning/repairing Gemini responses.
 *
 * Gemini sometimes wraps JSON in markdown code fences even when told not to.
 * These utilities strip that wrapper before parsing.
 */

/**
 * Strip markdown code fences from a string, e.g.:
 *   ```json\n{...}\n``` → {...}
 */
export function stripMarkdownFences(raw: string): string {
  // Match opening fence (```json or ```), optional whitespace, content, closing fence
  const fenceMatch = raw.match(/^```(?:json|JSON)?\s*\n?([\s\S]*?)\n?```\s*$/);
  if (fenceMatch) {
    return fenceMatch[1].trim();
  }
  return raw.trim();
}

/**
 * Attempt to parse JSON from a potentially fence-wrapped string.
 * Throws SyntaxError if parsing fails after stripping.
 */
export function parseGeminiJSON<T = unknown>(raw: string): T {
  const cleaned = stripMarkdownFences(raw);
  return JSON.parse(cleaned) as T;
}

/**
 * Safe parse — returns null instead of throwing.
 */
export function safeParseGeminiJSON<T = unknown>(raw: string): T | null {
  try {
    return parseGeminiJSON<T>(raw);
  } catch {
    return null;
  }
}
