import { describe, it, expect } from "vitest";
import { stripMarkdownFences, parseGeminiJSON, safeParseGeminiJSON } from "@/lib/utils/json";

describe("stripMarkdownFences", () => {
  it("strips ```json fences", () => {
    const input = "```json\n{\"key\": \"value\"}\n```";
    expect(stripMarkdownFences(input)).toBe('{"key": "value"}');
  });

  it("strips ``` fences without language tag", () => {
    const input = "```\n{\"key\": \"value\"}\n```";
    expect(stripMarkdownFences(input)).toBe('{"key": "value"}');
  });

  it("returns untouched string when no fences", () => {
    const input = '{"key": "value"}';
    expect(stripMarkdownFences(input)).toBe('{"key": "value"}');
  });

  it("strips fences with trailing whitespace", () => {
    const input = "```json\n{\"a\": 1}\n```   ";
    expect(stripMarkdownFences(input.trim())).toBe('{"a": 1}');
  });

  it("handles multiline JSON inside fences", () => {
    const input = '```json\n{\n  "a": 1,\n  "b": 2\n}\n```';
    const result = stripMarkdownFences(input);
    expect(result).toContain('"a": 1');
    expect(result).toContain('"b": 2');
  });
});

describe("parseGeminiJSON", () => {
  it("parses clean JSON", () => {
    const result = parseGeminiJSON<{ key: string }>('{"key": "value"}');
    expect(result.key).toBe("value");
  });

  it("parses fence-wrapped JSON", () => {
    const result = parseGeminiJSON<{ x: number }>('```json\n{"x": 42}\n```');
    expect(result.x).toBe(42);
  });

  it("throws on invalid JSON", () => {
    expect(() => parseGeminiJSON("not json at all")).toThrow(SyntaxError);
  });
});

describe("safeParseGeminiJSON", () => {
  it("returns null for invalid JSON", () => {
    const result = safeParseGeminiJSON("totally broken {{{{");
    expect(result).toBeNull();
  });

  it("returns parsed object for valid JSON", () => {
    const result = safeParseGeminiJSON<{ ok: boolean }>('{"ok": true}');
    expect(result?.ok).toBe(true);
  });

  it("returns parsed object for fence-wrapped JSON", () => {
    const result = safeParseGeminiJSON<{ n: number }>(
      "```json\n{\"n\": 99}\n```"
    );
    expect(result?.n).toBe(99);
  });
});
