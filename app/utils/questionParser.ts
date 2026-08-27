/**
 * questionParser.ts — Regex-based question extractor
 *
 * Parses structured question text (from PDF text layers) into
 * Question[] without any LLM call. Handles common exam formats:
 *   Q1. / Q.1 / 1. / 1) / Question 1 / Q1: etc.
 *   Marks patterns: [5 marks] / (5M) / (5 Marks) / [5] / 5 marks
 *
 * Works with both newline-separated text AND space-joined text
 * (pdfjs getTextContent().items.join(' ') output).
 *
 * Returns null when it cannot confidently parse (caller should
 * proceed without questions — the LLM can infer from answer sheets).
 */

export interface ParsedQuestion {
  id: string;
  number: string;
  text: string;
  maxMarks: number;
}

// ── Marks patterns ──────────────────────────────────────────────
const MARKS_PATTERNS = [
  /\[(\d+)\s*(?:marks?|m)\]/i,
  /\((\d+)\s*(?:marks?|m)\)/i,
  /\[(\d+)\]/,
  /\((\d+)\)/,
  /(\d+)\s*marks?\b/i,
];

function extractMarks(text: string): number {
  for (const pattern of MARKS_PATTERNS) {
    const match = text.match(pattern);
    if (match) {
      const val = parseInt(match[1], 10);
      if (val >= 1 && val <= 100) return val;
    }
  }
  return 0;
}

function stripMarks(text: string): string {
  let cleaned = text;
  cleaned = cleaned.replace(/\[(\d+)\s*(?:marks?|m)?\]/gi, "");
  cleaned = cleaned.replace(/\((\d+)\s*(?:marks?|m)\)/gi, "");
  cleaned = cleaned.replace(/\((\d+)\)\s*$/gm, (match, num) => {
    const n = parseInt(num, 10);
    return n >= 1 && n <= 100 ? "" : match;
  });
  cleaned = cleaned.replace(/(\d+)\s*marks?\s*$/gim, "");
  return cleaned.trim();
}

// ── Question boundary detection ─────────────────────────────────
// Matches question starts in both newline-separated and space-joined text.
// Handles: 1. / 1) / Q1. / Q1) / Q.1 / Question 1: / Q 1 - etc.
// The lookbehind (?:^|\n|(?<=\s)) allows matching at line starts or
// after whitespace (for space-joined pdfjs output).
const QUESTION_BOUNDARY_RE =
  /(?:^|\n|\s)(?:Q(?:uestion)?[\s.:-]*)?(\d+[a-z]?(?:\.\d+)?)\s*[.):\-]\s/gi;

/**
 * Attempt to parse question text into structured questions.
 * Returns null if fewer than 2 questions are found (not confident enough).
 */
export function parseQuestions(rawText: string): ParsedQuestion[] | null {
  if (!rawText || rawText.trim().length < 20) return null;

  const text = rawText
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .replace(/\n{3,}/g, "\n\n");

  // Find all question boundary positions
  const boundaries: {
    index: number;
    matchEnd: number;
    number: string;
  }[] = [];

  const re = new RegExp(QUESTION_BOUNDARY_RE.source, QUESTION_BOUNDARY_RE.flags);
  let match: RegExpExecArray | null;

  while ((match = re.exec(text)) !== null) {
    const qNum = match[1];
    // Skip numbers that look like years or very large values
    if (parseInt(qNum, 10) > 50) continue;
    boundaries.push({
      index: match.index,
      matchEnd: match.index + match[0].length,
      number: qNum,
    });
  }

  if (boundaries.length < 2) return null;

  const questions: ParsedQuestion[] = [];

  for (let b = 0; b < boundaries.length; b++) {
    const start = boundaries[b].matchEnd;
    const end =
      b + 1 < boundaries.length ? boundaries[b + 1].index : text.length;

    const qText = text.substring(start, end).trim();
    const marks = extractMarks(qText);
    const cleanText = stripMarks(qText);
    const qNum = boundaries[b].number;

    questions.push({
      id: `q${qNum}`,
      number: qNum,
      text: cleanText || qText,
      maxMarks: marks || 5, // Default to 5 if marks not found
    });
  }

  return questions.length >= 2 ? questions : null;
}
