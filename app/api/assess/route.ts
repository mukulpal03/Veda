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
  maxRetries = 2,
  label = "API call",
): Promise<T> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (err: any) {
      const status = err?.status || err?.httpStatusCode || 0;
      if (status === 429 && attempt < maxRetries) {
        const delay = 800; // Fast retry delay (800ms)
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
  className: z.string().describe("Class/grade if visible, else empty string"),
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
    .describe("1-based page number of the student answer sheet (e.g. 1, 2, 3)"),
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
  number: z.string().describe('Question label / numbering, e.g. "1", "2", "3"'),
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

    if (!openaiApiKey) {
      return NextResponse.json(
        {
          error: "OpenAI API key is missing. Set OPENAI_API_KEY in .env.local.",
          code: "MISSING_API_KEY",
        },
        { status: 400 },
      );
    }

    if (
      (!questionPaperPages || questionPaperPages.length === 0) &&
      (!answerSheetPages || answerSheetPages.length === 0) &&
      (!questionPaperTexts || questionPaperTexts.length === 0)
    ) {
      return NextResponse.json(
        { error: "No document pages provided for assessment." },
        { status: 400 },
      );
    }

    const openai = new OpenAI({ apiKey: openaiApiKey });
    const gemini = geminiApiKey
      ? new GoogleGenAI({ apiKey: geminiApiKey })
      : null;
    const totalDocPages =
      answerSheetPages.length || questionPaperPages.length || 2;

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
      console.log(
        `[Stage 1] Extracting questions from PDF text (${qpTextContent.length} chars) using ${GRADING_MODEL}...`,
      );

      try {
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
        console.log(
          `[Stage 1] ✅ Extracted ${extractedQuestions.length} questions (~$0.001)`,
        );
      } catch (err) {
        console.warn("[Stage 1] Failed to extract questions from text:", err);
      }
    } else if (questionPaperPages.length > 0) {
      console.log(
        `[Stage 1] Extracting questions from ${questionPaperPages.length} Question Paper images via gpt-4o-mini...`,
      );
      try {
        const qpImages: any[] = [];
        for (const dataUrl of questionPaperPages) {
          const parsed = parseDataUrl(dataUrl);
          if (parsed) {
            qpImages.push({
              type: "input_image",
              image_url: dataUrl,
              detail: "low",
            });
          }
        }
        const qpResponse = await openai.responses.parse({
          model: GRADING_MODEL,
          input: [
            {
              role: "system",
              content:
                "Extract all exam questions from these images, preserving question numbers and max marks.",
            },
            {
              role: "user",
              content: [
                {
                  type: "input_text",
                  text: "Extract questions from these question paper pages:",
                },
                ...qpImages,
              ],
            },
          ],
          text: {
            format: zodTextFormat(QuestionsListSchema, "questions_list"),
          },
        });
        extractedQuestions = qpResponse.output_parsed?.questions || [];
        console.log(
          `[Stage 1] ✅ Extracted ${extractedQuestions.length} questions from images`,
        );
      } catch (err) {
        console.warn("[Stage 1] Failed image extraction:", err);
      }
    }

    let extractionResult: { studentHeader: any; blocks: any[] } | null = null;
    let isVisionFallback = false;
    let warningMessage = "";

    // --- Primary attempt: Gemini 3.5 Flash ---
    if (gemini) {
      try {
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
          `[Stage 2] 🔍 Sending ${answerSheetPages.length} answer pages to ${VISION_MODEL} (Gemini)...`,
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
          2,
          "Gemini handwriting extraction",
        );

        const responseText = geminiResponse.text || "{}";
        extractionResult = JSON.parse(responseText);
        if (extractionResult?.blocks?.length) {
          console.log(
            `[Stage 2] ✅ Gemini extracted ${extractionResult.blocks.length} handwritten blocks`,
          );
        }
      } catch (geminiErr: any) {
        console.warn(
          `[Stage 2] ⚠️ Gemini vision failed (${geminiErr?.message || geminiErr}). Falling back to gpt-4o-mini vision (text-only)...`,
        );
        extractionResult = null;
      }
    }

    // --- Fallback attempt: OpenAI vision fallback ---
    if (!extractionResult || !extractionResult.blocks?.length) {
      console.log(
        `[Stage 2] ⚡ Running OpenAI vision fallback for text & bounding box extraction...`,
      );
      isVisionFallback = true;
      warningMessage =
        "The Gemini model hit an error/rate limit. A lighter fallback model was used, so the visual highlighting won't be as accurate as Gemini. Please try again after some time.";

      const answerImageContents: any[] = [];
      let pageNum = 1;
      for (const dataUrl of answerSheetPages) {
        const parsed = parseDataUrl(dataUrl);
        if (parsed) {
          answerImageContents.push({
            type: "input_image",
            image_url: dataUrl,
            detail: "high",
          });
          answerImageContents.push({
            type: "input_text",
            text: `[This is Page ${pageNum}]`,
          });
          pageNum++;
        }
      }

      try {
        const fallbackResponse = await openai.responses.parse({
          model: "gpt-5-mini",
          input: [
            {
              role: "system",
              content: `You are a precision handwriting extraction and spatial locating engine. Your ONLY job is to:
1. Scan EVERY page thoroughly from top to bottom and extract ALL handwritten answers across all sections and pages.
2. Transcribe each block verbatim (preserve original text, spelling, and grammar).
3. Provide accurate bounding box coordinates (percentage coordinates 0-100: pageNumber, x, y, width, height) enclosing each handwritten answer block on the page so it can be highlighted in green on the document canvas.
4. Extract student header info if visible (name, roll number, class, subject, date).
5. Identify and attach the corresponding question number for each block (e.g., "1", "2a", "Q3", etc.).

CRITICAL: Provide precise bounding box coordinates (percentage 0 to 100) for every detected handwritten block so visual boundary highlighting is active.`,
            },
            {
              role: "user",
              content: [
                {
                  type: "input_text",
                  text: "Transcribe all handwritten text and provide bounding box coordinates from these answer sheet pages:",
                },
                ...answerImageContents,
              ],
            },
          ],
          text: {
            format: zodTextFormat(ExtractionResultSchema, "extraction_result"),
          },
        });

        extractionResult = fallbackResponse.output_parsed;
        if (extractionResult?.blocks?.length) {
          const hasBoxes = extractionResult.blocks.some((b: any) => b.boundingBoxes && b.boundingBoxes.length > 0);
          console.log(
            `[Stage 2] ✅ OpenAI fallback extracted ${extractionResult.blocks.length} handwritten blocks (bounding boxes: ${hasBoxes ? 'YES' : 'NO'})`,
          );
        }
      } catch (oaiErr: any) {
        console.error(
          "[Stage 2] OpenAI fallback vision extraction failed:",
          oaiErr,
        );
      }
    }

    // --- Non-LLM Fallback if even gpt-4o-mini fails ---
    if (!extractionResult || !extractionResult.blocks?.length) {
      console.log(
        `[Stage 2] ⚡ Non-LLM fallback: Extracting answer text from text layer...`,
      );
      isVisionFallback = true;
      warningMessage =
        "Our primary vision model is currently down, so bounding box highlighting will not be available.";

      const fallbackBlocks: any[] = [];
      let bIdx = 1;

      if (
        Array.isArray(answerSheetTexts) &&
        answerSheetTexts.some((t) => t.trim())
      ) {
        answerSheetTexts.forEach((pageText) => {
          if (pageText && pageText.trim()) {
            fallbackBlocks.push({
              blockId: `b${bIdx++}`,
              transcribedText: pageText.trim(),
              possibleQuestionNumber: "unknown",
              boundingBoxes: [],
            });
          }
        });
      }

      extractionResult = {
        studentHeader: {
          name: "",
          rollNumber: "",
          className: "",
          subject: "",
          examDate: "",
        },
        blocks: fallbackBlocks,
      };
    }

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
- Every question should have a corresponding answer entry. If a question was not attempted, set isAnswered=false, evaluationStatus="UNANSWERED", marksAwarded=0, and feedback="You did not attempt this question. Be mindful to answer all questions in future assessments!".

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
      if (isVisionFallback) {
        (finalAssessment as any).isVisionFallback = true;
        (finalAssessment as any).warningMessage = warningMessage;
      }
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
