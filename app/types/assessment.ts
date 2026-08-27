export interface BoundingBox {
  /** Page number (1-based index) where the answer/content is located */
  pageNumber: number;
  /** Normalized coordinates (0 - 100 percentage) */
  x: number; // Left coordinate (% of page width)
  y: number; // Top coordinate (% of page height)
  width: number; // Width (% of page width)
  height: number; // Height (% of page height)
}

export interface Question {
  /** Unique identifier e.g. "q1", "q2", "q3", "q4" */
  id: string;
  /** Printed question number e.g. "1", "2", "3", "4" */
  number: string;
  /** Full text of the question */
  text: string;
  /** Maximum marks allocated to this question */
  maxMarks?: number;
  /** Optional section e.g. "Section A", "Section B" */
  section?: string;
}

export type EvaluationStatus = 'CORRECT' | 'INCORRECT' | 'PARTIALLY_CORRECT' | 'UNANSWERED' | 'NOT_EVALUATED';

export type FilterStatus = 'ALL' | 'CORRECT' | 'PARTIALLY_CORRECT' | 'INCORRECT' | 'UNANSWERED';

export interface AnswerMapping {
  /** ID of the question this answer corresponds to */
  questionId: string;
  /** Whether the student attempted/answered this question */
  isAnswered: boolean;
  /** Extracted student's answer text from handwritten sheet */
  studentAnswerText: string;
  /** Bounding box regions on the student answer sheet */
  boundingBoxes: BoundingBox[];
  /** AI evaluation status */
  evaluationStatus: EvaluationStatus;
  /** Marks awarded to student */
  marksAwarded?: number;
  /** Maximum possible marks */
  maxMarks?: number;
  /** Detailed feedback / rationale for the marks given */
  feedback?: string;
  /** Confidence score of AI extraction/mapping (0.0 to 1.0) */
  confidence?: number;
}

export interface UnmatchedAnswer {
  id: string;
  /** Extracted text for content that did not match any question */
  studentAnswerText: string;
  /** Bounding box regions */
  boundingBoxes: BoundingBox[];
  /** AI explanation or note why it could not be mapped */
  note?: string;
}

export interface OverallGradingSummary {
  totalMarksObtained: number;
  totalMaxMarks: number;
  percentage: number;
  grade?: string;
  overallFeedback: string;
  strengths: string[];
  areasForImprovement: string[];
}

export interface StudentInfo {
  name: string;
  rollNumber: string;
  className: string;
  subject: string;
  examDate: string;
  totalQuestions: number;
}

export interface AssessmentResult {
  student?: StudentInfo;
  questions: Question[];
  answers: AnswerMapping[];
  unmatchedAnswers: UnmatchedAnswer[];
  summary?: OverallGradingSummary;
  totalPages?: number;
  processedAt: string;
}

export type AssessmentStatus = 'idle' | 'uploading' | 'processing' | 'completed' | 'error';

/** Document Upload Domain State & Actions */
export interface DocumentUploadState {
  questionPaperFile: File | null;
  answerSheetFile: File | null;
  questionPaperPages: string[];
  answerSheetPages: string[];
}

export interface DocumentUploadActions {
  setQuestionPaperFile: (file: File | null) => void;
  setAnswerSheetFile: (file: File | null) => void;
  setQuestionPaperPages: (pages: string[]) => void;
  setAnswerSheetPages: (pages: string[]) => void;
  removeQuestionPaper: () => void;
  removeAnswerSheet: () => void;
  clearAllDocuments: () => void;
}

export interface DocumentUploadContextType extends DocumentUploadState, DocumentUploadActions {
  isUploadReady: boolean;
}

/** Assessment Progress Domain State & Actions */
export interface AssessmentProgressState {
  status: AssessmentStatus;
  progressStep: string;
  progressPercentage: number;
  error: string | null;
}

export interface AssessmentProgressActions {
  setStatus: (status: AssessmentStatus) => void;
  setProgressStep: (step: string) => void;
  setProgressPercentage: (percentage: number) => void;
  setError: (error: string | null) => void;
  startAssessment: () => void;
  updateProgress: (step: string, percentage: number) => void;
  failAssessment: (errorMessage: string) => void;
  resetProgress: () => void;
}

export interface AssessmentProgressContextType extends AssessmentProgressState, AssessmentProgressActions {
  isProcessing: boolean;
  isCompleted: boolean;
  isError: boolean;
}

/** Assessment Results Domain State & Actions */
export interface AssessmentResultsState {
  results: AssessmentResult | null;
  selectedQuestionId: string | null;
}

export interface AssessmentResultsActions {
  setResults: (results: AssessmentResult | null) => void;
  setSelectedQuestionId: (id: string | null) => void;
  selectQuestion: (id: string | null) => void;
  clearResults: () => void;
}

export interface AssessmentResultsContextType extends AssessmentResultsState, AssessmentResultsActions {
  selectedQuestion: Question | null;
  selectedAnswerMapping: AnswerMapping | null;
  hasResults: boolean;
}

/** Combined Assessment Context (Facade) */
export interface AssessmentContextType
  extends DocumentUploadContextType,
    AssessmentProgressContextType,
    AssessmentResultsContextType {
  resetAssessment: () => void;
}
