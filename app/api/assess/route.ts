import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI, Type } from '@google/genai';
import OpenAI from 'openai';
import { zodTextFormat } from 'openai/helpers/zod';
import { z } from 'zod';

export const maxDuration = 120; // Allow up to 120 seconds

// Zod Schemas for OpenAI (Stage 1 & 3)
const BoundingBoxSchema = z.object({
  pageNumber: z.number().describe('1-based page number of the student answer sheet (e.g. 1, 2, 3)'),
  x: z.number().describe('Left offset percentage coordinate (0 to 100) on the page'),
  y: z.number().describe('Top offset percentage coordinate (0 to 100) on the page'),
  width: z.number().describe('Width percentage of the handwritten answer bounding box (0 to 100)'),
  height: z.number().describe('Height percentage of the handwritten answer bounding box (0 to 100)'),
});

const QuestionSchema = z.object({
  id: z.string().describe('Unique question id, e.g. "q1", "q2", "q3"'),
  number: z.string().describe('Question label / numbering, e.g. "1", "2", "3"'),
  text: z.string().describe('Full text of the question'),
  maxMarks: z.number().describe('Maximum marks allocated for this question'),
});

const AnswerMappingSchema = z.object({
  questionId: z.string().describe('Matching question id from the questions list'),
  isAnswered: z.boolean().describe('True if student answered/attempted the question'),
  studentAnswerText: z.string().describe('Verbatim transcription of the student handwritten answer'),
  evaluationStatus: z.enum(['CORRECT', 'PARTIALLY_CORRECT', 'INCORRECT', 'UNANSWERED']),
  marksAwarded: z.number().describe('Marks awarded'),
  maxMarks: z.number().describe('Max marks'),
  feedback: z.string().describe('Constructive teacher feedback'),
  confidence: z.number().describe('Confidence score 0.0 to 1.0'),
  boundingBoxes: z.array(BoundingBoxSchema).describe('Bounding boxes enclosing the response'),
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
  id: z.string().describe('Unique identifier for unmatched handwritten snippet'),
  studentAnswerText: z.string().describe('Extracted text for handwritten content that did not match any question'),
  boundingBoxes: z.array(BoundingBoxSchema).describe('Bounding box regions of the unmatched handwriting'),
  note: z.string().describe('AI explanation why this handwriting could not be mapped to any question'),
});

const AssessmentResultSchema = z.object({
  student: StudentInfoSchema,
  questions: z.array(QuestionSchema),
  answers: z.array(AnswerMappingSchema),
  unmatchedAnswers: z.array(UnmatchedAnswerSchema).describe('Any orphan handwritten notes'),
  summary: SummarySchema,
  totalPages: z.number().describe('Total pages in the student answer sheet'),
});

const QuestionsListSchema = z.object({
  questions: z.array(QuestionSchema)
});

function parseDataUrl(dataUrl: string) {
  const matches = dataUrl.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,(.+)$/);
  if (!matches || matches.length !== 3) {
    return null;
  }
  return {
    mimeType: matches[1],
    data: matches[2]
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
      apiKey 
    } = body;

    const openaiApiKey = process.env.OPENAI_API_KEY;
    const geminiApiKey = apiKey || process.env.GEMINI_API_KEY;

    if (!openaiApiKey || !geminiApiKey) {
      return NextResponse.json(
        { error: 'API keys are missing in .env.local', code: 'MISSING_API_KEY' },
        { status: 400 }
      );
    }

    const openai = new OpenAI({ apiKey: openaiApiKey });
    const gemini = new GoogleGenAI({ apiKey: geminiApiKey });
    const totalDocPages = answerSheetPages.length || questionPaperPages.length || 2;

    let extractedQuestions: any[] = [];
    const qpTextContent = Array.isArray(questionPaperTexts) ? questionPaperTexts.filter(Boolean).join('\n\n') : '';

    if (qpTextContent.trim().length > 50) {
      const qpResponse = await openai.responses.parse({
        model: 'gpt-4o-mini',
        input: [
          { role: 'system', content: 'You are an expert at extracting exam questions. Extract all questions from the provided text, preserving numbering and max marks.' },
          { role: 'user', content: qpTextContent }
        ],
        text: {
          format: zodTextFormat(QuestionsListSchema, 'questions_list'),
        }
      });
      extractedQuestions = qpResponse.output_parsed?.questions || [];
    } else {
      const geminiQpContents: any[] = [{ text: 'Extract all questions from this question paper, preserving numbering and max marks. Output JSON.' }];
      for (const dataUrl of questionPaperPages) {
        const parsed = parseDataUrl(dataUrl);
        if (parsed) geminiQpContents.push({ inlineData: parsed });
      }
      
      const qpResponse = await gemini.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: geminiQpContents,
        config: {
           responseMimeType: 'application/json',
           temperature: 0.1,
           responseSchema: {
             type: Type.OBJECT,
             properties: {
               questions: {
                 type: Type.ARRAY,
                 items: {
                   type: Type.OBJECT,
                   properties: {
                     id: { type: Type.STRING },
                     number: { type: Type.STRING },
                     text: { type: Type.STRING },
                     maxMarks: { type: Type.NUMBER }
                   }
                 }
               }
             }
           }
        }
      });
      
      try {
        const qpJson = JSON.parse(qpResponse.text || '{}');
        extractedQuestions = qpJson.questions || [];
      } catch (e) {
        console.warn("Failed to parse Gemini question JSON", e);
      }
    }

    const geminiAsContents: any[] = [{ text: `You are a handwriting extraction engine. 
Extract every distinct handwritten block/answer you see in these images. Also extract any student header info if visible.
For each block, provide the transcribed text and the exact bounding box coordinates in percentage (0-100) for x, y, width, and height. 
Note: The pageNumber is 1-indexed based on the order of the images provided.` }];
    
    let pageNum = 1;
    for (const dataUrl of answerSheetPages) {
      const parsed = parseDataUrl(dataUrl);
      if (parsed) {
        geminiAsContents.push({ inlineData: parsed });
        geminiAsContents.push({ text: `[This is Page ${pageNum}]` });
        pageNum++;
      }
    }

    const asResponse = await gemini.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: geminiAsContents,
      config: {
        responseMimeType: 'application/json',
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
              }
            },
            blocks: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  transcribedText: { type: Type.STRING },
                  boundingBoxes: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        pageNumber: { type: Type.INTEGER },
                        x: { type: Type.NUMBER },
                        y: { type: Type.NUMBER },
                        width: { type: Type.NUMBER },
                        height: { type: Type.NUMBER }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    });

    let extractedBlocks: any[] = [];
    let studentHeaderInfo = {};
    try {
      const asText = asResponse.text || '{}';
      console.log("=== GEMINI RAW ANSWER SHEET OUTPUT ===");
      console.log(asText.substring(0, 500) + '...'); 
      const asJson = JSON.parse(asText);
      extractedBlocks = asJson.blocks || [];
      studentHeaderInfo = asJson.studentHeader || {};
      
      console.log(`Extracted ${extractedBlocks.length} handwritten blocks from Gemini.`);
    } catch(e) {
      console.warn("Failed to parse Gemini answer blocks JSON", e);
    }

    const finalPrompt = `You are an expert AI Assessment Engine for school teachers.
I am providing you with a structured list of questions from an exam, and a list of transcribed handwritten blocks from a student's answer sheet.

Your job is to:
1. Map each handwritten block to the correct question it answers.
2. Grade the mapped answer pedagogically.
3. Award marks based on the question's maxMarks.
4. Write constructive teacher feedback.
5. Identify any "unmatchedAnswers".
6. Provide an overall grading summary.

IMPORTANT RULES: 
- When mapping an answer to a question, you MUST include the EXACT boundingBoxes from the original handwritten block.
- Incorporate this student header info if missing: ${JSON.stringify(studentHeaderInfo)}

=== EXAM QUESTIONS ===
${JSON.stringify(extractedQuestions, null, 2)}

=== EXTRACTED HANDWRITTEN BLOCKS ===
${JSON.stringify(extractedBlocks, null, 2)}
`;

    const finalResponse = await openai.responses.parse({
      model: 'gpt-4o-mini',
      input: [
        { role: 'system', content: 'You are an expert pedagogical grader and mapping engine.' },
        { role: 'user', content: finalPrompt }
      ],
      text: {
        format: zodTextFormat(AssessmentResultSchema, 'assessment_result')
      }
    });

    const finalAssessment = finalResponse.output_parsed;

    if (finalAssessment) {
       finalAssessment.totalPages = totalDocPages;
       (finalAssessment as any).processedAt = new Date().toISOString();
    }

    return NextResponse.json(finalAssessment);

  } catch (error: unknown) {
    console.error('Error in multi-agent pipeline:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to process assessment';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
