import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI, Type } from "@google/genai";
import OpenAI from "openai";
import { zodTextFormat } from "openai/helpers/zod";
import { z } from "zod";

export const maxDuration = 120; // Allow up to 120 seconds

// ── Model selection ─────────────────────────────────────────────
// Stage 2: Gemini 3.5 Flash for handwriting vision (free tier, best quality)
const VISION_MODEL = "gemini-3.5-flash";
// Stage 1 & 3: OpenAI gpt-4o-mini for text reasoning (cheap, $0.001-0.003)
const GRADING_MODEL = "gpt-4o-mini";

// Retry helper for Gemini free tier rate limits (429 errors)
async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries = 3,
  label = "API call",
): Promise<T> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (err: any) {
      const status = err?.status || err?.httpStatusCode || 0;
      if (status === 429 && attempt < maxRetries) {
        const delay = Math.min(2000 * Math.pow(2, attempt - 1), 15000);
        console.warn(
          `[Retry] ${label} rate-limited (429). Waiting ${delay / 1000}s before attempt ${attempt + 1}/${maxRetries}...`,
        );
        await new Promise((r) => setTimeout(r, delay));
      } else {
        throw err;
      }
    }
  }
  throw new Error(`${label} failed after ${maxRetries} retries`);
}

// ═══════════════════════════════════════════════════════════════
// STAGE 2 SCHEMA — Extraction only (no grading)
// ═══════════════════════════════════════════════════════════════
const ExtractedBoundingBoxSchema = z.object({
  pageNumber: z.number().describe("1-based page number"),
  x: z.number().describe("Left offset percentage (0-100)"),
  y: z.number().describe("Top offset percentage (0-100)"),
  width: z.number().describe("Width percentage (0-100)"),
  height: z.number().describe("Height percentage (0-100)"),
});

const ExtractedBlockSchema = z.object({
  blockId: z.string().describe('Unique block id e.g. "b1", "b2"'),
  transcribedText: z
    .string()
    .describe("Verbatim transcription of the handwritten content"),
  possibleQuestionNumber: z
    .string()
    .describe(
      'Best guess of which question number this answers, e.g. "1", "2a". Use "unknown" if unclear.',
    ),
  boundingBoxes: z
    .array(ExtractedBoundingBoxSchema)
    .describe("Bounding boxes enclosing this handwritten block"),
});

const StudentHeaderSchema = z.object({
  name: z.string().describe("Student name if visible, else empty string"),
  rollNumber: z
    .string()
    .describe("Roll/registration number if visible, else empty string"),
  className: z
    .string()
    .describe("Class/grade if visible, else empty string"),
  subject: z.string().describe("Subject if visible, else empty string"),
  examDate: z.string().describe("Exam date if visible, else empty string"),
});

const ExtractionResultSchema = z.object({
  studentHeader: StudentHeaderSchema,
  blocks: z
    .array(ExtractedBlockSchema)
    .describe("All distinct handwritten answer blocks found"),
});

// ═══════════════════════════════════════════════════════════════
// STAGE 3 SCHEMA — Full graded assessment
// ═══════════════════════════════════════════════════════════════
const BoundingBoxSchema = z.object({
  pageNumber: z
    .number()
    .describe(
      "1-based page number of the student answer sheet (e.g. 1, 2, 3)",
    ),
  x: z
    .number()
    .describe("Left offset percentage coordinate (0 to 100) on the page"),
  y: z
    .number()
    .describe("Top offset percentage coordinate (0 to 100) on the page"),
  width: z
    .number()
    .describe(
      "Width percentage of the handwritten answer bounding box (0 to 100)",
    ),
  height: z
    .number()
    .describe(
      "Height percentage of the handwritten answer bounding box (0 to 100)",
    ),
});

const QuestionSchema = z.object({
  id: z.string().describe('Unique question id, e.g. "q1", "q2", "q3"'),
  number: z
    .string()
    .describe('Question label / numbering, e.g. "1", "2", "3"'),
  text: z.string().describe("Full text of the question"),
  maxMarks: z.number().describe("Maximum marks allocated for this question"),
});

const QuestionsListSchema = z.object({
  questions: z.array(QuestionSchema),
});

const AnswerMappingSchema = z.object({
  questionId: z
    .string()
    .describe("Matching question id from the questions list"),
  isAnswered: z
    .boolean()
    .describe("True if student answered/attempted the question"),
  studentAnswerText: z
    .string()
    .describe("Verbatim transcription of the student handwritten answer"),
  evaluationStatus: z.enum([
    "CORRECT",
    "PARTIALLY_CORRECT",
    "INCORRECT",
    "UNANSWERED",
  ]),
  marksAwarded: z.number().describe("Marks awarded"),
  maxMarks: z.number().describe("Max marks"),
  feedback: z.string().describe("Constructive teacher feedback"),
  confidence: z.number().describe("Confidence score 0.0 to 1.0"),
  boundingBoxes: z
    .array(BoundingBoxSchema)
    .describe("Bounding boxes enclosing the response"),
});

const StudentInfoSchema = z.object({
  name: z.string(),
  rollNumber: z.string(),
  className: z.string(),
  subject: z.string(),
  examDate: z.string(),
  totalQuestions: z.number(),
});

const SummarySchema = z.object({
  totalMarksObtained: z.number(),
  totalMaxMarks: z.number(),
  percentage: z.number(),
  grade: z.string(),
  overallFeedback: z.string(),
  strengths: z.array(z.string()),
  areasForImprovement: z.array(z.string()),
});

const UnmatchedAnswerSchema = z.object({
  id: z
    .string()
    .describe("Unique identifier for unmatched handwritten snippet"),
  studentAnswerText: z
    .string()
    .describe(
      "Extracted text for handwritten content that did not match any question",
    ),
  boundingBoxes: z
    .array(BoundingBoxSchema)
    .describe("Bounding box regions of the unmatched handwriting"),
  note: z
    .string()
    .describe(
      "AI explanation why this handwriting could not be mapped to any question",
    ),
});

const AssessmentResultSchema = z.object({
  student: StudentInfoSchema,
  questions: z.array(QuestionSchema),
  answers: z.array(AnswerMappingSchema),
  unmatchedAnswers: z
    .array(UnmatchedAnswerSchema)
    .describe("Any orphan handwritten notes"),
  summary: SummarySchema,
  totalPages: z.number().describe("Total pages in the student answer sheet"),
});

function parseDataUrl(dataUrl: string) {
  const matches = dataUrl.match(
    /^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,(.+)$/,
  );
  if (!matches || matches.length !== 3) {
    return null;
  }
  return {
    mimeType: matches[1],
    data: matches[2],
  };
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      questionPaperPages = [],
      answerSheetPages = [],
      questionPaperTexts = [],
      answerSheetTexts = [],
    } = body;

    const openaiApiKey = process.env.OPENAI_API_KEY;
    const geminiApiKey = body.apiKey || process.env.GEMINI_API_KEY;

    if (!openaiApiKey || !geminiApiKey) {
      return NextResponse.json(
        {
          error:
            "API keys missing. Set both OPENAI_API_KEY and GEMINI_API_KEY in .env.local.",
          code: "MISSING_API_KEY",
        },
        { status: 400 },
      );
    }

    const openai = new OpenAI({ apiKey: openaiApiKey });
    const gemini = new GoogleGenAI({ apiKey: geminiApiKey });
    const totalDocPages =
      answerSheetPages.length || questionPaperPages.length || 2;

    // ═══════════════════════════════════════════════════════════════
    // STAGE 1: Extract questions from question paper TEXT
    // Model: gpt-4o-mini text-only (~$0.001 — negligible)
    // Text already extracted client-side by pdfjs
    // ═══════════════════════════════════════════════════════════════
    let extractedQuestions: {
      id: string;
      number: string;
      text: string;
      maxMarks: number;
    }[] = [];

    const qpTextContent = Array.isArray(questionPaperTexts)
      ? questionPaperTexts.filter(Boolean).join("\n\n")
      : "";

    if (qpTextContent.trim().length > 20) {
      console.log(`[Stage 1] Extracting questions from PDF text (${qpTextContent.length} chars) using ${GRADING_MODEL}...`);

      const qpResponse = await openai.responses.parse({
        model: GRADING_MODEL,
        input: [
          {
            role: "system",
            content:
              "You are an expert at extracting exam questions. Extract all questions from the provided text, preserving numbering and max marks. If marks are not specified, estimate based on question complexity.",
          },
          { role: "user", content: qpTextContent },
        ],
        text: {
          format: zodTextFormat(QuestionsListSchema, "questions_list"),
        },
      });

      extractedQuestions = qpResponse.output_parsed?.questions || [];
      console.log(`[Stage 1] ✅ Extracted ${extractedQuestions.length} questions (~$0.001)`);
    } else {
      console.warn(
        `[Stage 1] ⚠️ No usable text from question paper. Stage 2 will infer question numbers from answer sheet.`,
      );
    }

    // ═══════════════════════════════════════════════════════════════
    // STAGE 2: Handwriting extraction + bounding boxes
    // Model: Gemini 3.5 Flash (free tier — best handwriting vision)
    // With retry logic for free-tier 429 rate limits
    // ═══════════════════════════════════════════════════════════════
    const geminiContents: any[] = [
      {
        text: `You are a precision handwriting extraction engine. Your ONLY job is to:
1. Find ALL distinct handwritten content blocks on the answer sheet pages.
2. Transcribe each block verbatim (preserve spelling, grammar as-is).
3. Provide accurate bounding box coordinates (percentage 0-100) for each block.
4. Extract student header info (name, roll number, class, subject, date) if visible.
5. For each block, guess which question number it answers based on any visible numbering.

Do NOT grade or evaluate the answers. Just extract and locate them.
Page numbers are 1-indexed based on image order.`,
      },
    ];

    let pageNum = 1;
    for (const dataUrl of answerSheetPages) {
      const parsed = parseDataUrl(dataUrl);
      if (parsed) {
        geminiContents.push({ inlineData: parsed });
        geminiContents.push({ text: `[This is Page ${pageNum}]` });
        pageNum++;
      }
    }

    console.log(
      `[Stage 2] 🔍 Sending ${answerSheetPages.length} answer pages to ${VISION_MODEL} (Gemini) for handwriting extraction...`,
    );

    const geminiResponse = await withRetry(
      () =>
        gemini.models.generateContent({
          model: VISION_MODEL,
          contents: geminiContents,
          config: {
            responseMimeType: "application/json",
            temperature: 0.1,
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                studentHeader: {
                  type: Type.OBJECT,
                  properties: {
                    name: { type: Type.STRING },
                    rollNumber: { type: Type.STRING },
                    className: { type: Type.STRING },
                    subject: { type: Type.STRING },
                    examDate: { type: Type.STRING },
                  },
                },
                blocks: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      blockId: { type: Type.STRING },
                      transcribedText: { type: Type.STRING },
                      possibleQuestionNumber: { type: Type.STRING },
                      boundingBoxes: {
                        type: Type.ARRAY,
                        items: {
                          type: Type.OBJECT,
                          properties: {
                            pageNumber: { type: Type.INTEGER },
                            x: { type: Type.NUMBER },
                            y: { type: Type.NUMBER },
                            width: { type: Type.NUMBER },
                            height: { type: Type.NUMBER },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        }),
      3,
      "Gemini handwriting extraction",
    );

    let extractionResult: { studentHeader: any; blocks: any[] } | null = null;
    try {
      const responseText = geminiResponse.text || "{}";
      extractionResult = JSON.parse(responseText);
    } catch (e) {
      console.error("[Stage 2] Failed to parse Gemini JSON response", e);
    }

    if (!extractionResult || !extractionResult.blocks?.length) {
      console.warn("[Stage 2] ⚠️ No handwritten blocks extracted");
    } else {
      console.log(
        `[Stage 2] ✅ Extracted ${extractionResult.blocks.length} handwritten blocks with bounding boxes`,
      );
    }

    // ═══════════════════════════════════════════════════════════════
    // STAGE 3: Mapping + Grading + Feedback
    // Model: gpt-4o-mini (text-only, very cheap)
    // Input: questions + extracted blocks (pure text, no images)
    // ═══════════════════════════════════════════════════════════════
    const studentHeader = extractionResult?.studentHeader || {};
    const extractedBlocks = extractionResult?.blocks || [];

    const gradingPrompt = `You are a strict but fair AI Assessment Engine for school teachers.

I am providing you with:
1. A structured list of questions from an exam
2. A list of transcribed handwritten blocks from a student's answer sheet (with bounding boxes already extracted)

Your job is to:
1. Map each handwritten block to the correct question it answers (use possibleQuestionNumber as a hint).
2. Grade the mapped answer with STRICT FACTUAL ACCURACY checking.
3. Award marks based on the question's maxMarks.
4. Write constructive teacher feedback pointing out specific errors.
5. Identify any "unmatchedAnswers" — blocks that don't correspond to any question.
6. Provide an overall grading summary.

CRITICAL GRADING RULES:
- VERIFY FACTUAL CORRECTNESS: If a student swaps definitions, confuses concepts, or states incorrect facts, mark it INCORRECT or PARTIALLY_CORRECT even if they use the right keywords. For example, if asked to "differentiate A and B" and the student describes A's properties under B and vice versa, that is INCORRECT.
- Check for CONCEPTUAL ACCURACY, not just keyword presence. A response that mentions relevant terms but gets the core concept wrong should NOT receive full marks.
- Deduct marks proportionally: minor errors = slight deduction, fundamental conceptual errors = significant deduction or zero marks.
- Award full marks ONLY when the answer is factually correct AND adequately addresses the question.
- In feedback, clearly state WHAT is wrong and WHAT the correct answer should be.

OTHER RULES:
- You MUST include the EXACT boundingBoxes from the extracted blocks — do not modify coordinates.
- Incorporate this student header info: ${JSON.stringify(studentHeader)}
- Every question should have a corresponding answer entry (use isAnswered=false and evaluationStatus="UNANSWERED" if not attempted).

=== EXAM QUESTIONS ===
${JSON.stringify(extractedQuestions, null, 2)}

=== EXTRACTED HANDWRITTEN BLOCKS (with bounding boxes) ===
${JSON.stringify(extractedBlocks, null, 2)}`;

    console.log(
      `[Stage 3] 📝 Sending ${extractedQuestions.length} questions + ${extractedBlocks.length} blocks to ${GRADING_MODEL} for grading (text-only)...`,
    );

    const gradingResponse = await openai.responses.parse({
      model: GRADING_MODEL,
      input: [
        {
          role: "system",
          content:
            "You are an expert pedagogical grader and mapping engine. Grade fairly and provide constructive feedback.",
        },
        { role: "user", content: gradingPrompt },
      ],
      text: {
        format: zodTextFormat(AssessmentResultSchema, "assessment_result"),
      },
    });

    const finalAssessment = gradingResponse.output_parsed;

    if (finalAssessment) {
      finalAssessment.totalPages = totalDocPages;
      (finalAssessment as any).processedAt = new Date().toISOString();
    }

    console.log(`[Stage 3] ✅ Assessment complete`);

    return NextResponse.json(finalAssessment);
  } catch (error: unknown) {
    console.error("Error in assessment pipeline:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Failed to process assessment";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
