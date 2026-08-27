"use client";

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  ReactNode,
} from 'react';
import {
  AssessmentContextType,
  AssessmentResult,
  AssessmentStatus,
  DocumentUploadContextType,
  AssessmentProgressContextType,
  AssessmentResultsContextType,
  Question,
  AnswerMapping,
} from '../types/assessment';

// Domain Contexts
export const DocumentUploadContext = createContext<DocumentUploadContextType | undefined>(undefined);
export const AssessmentProgressContext = createContext<AssessmentProgressContextType | undefined>(undefined);
export const AssessmentResultsContext = createContext<AssessmentResultsContextType | undefined>(undefined);
export const AssessmentContext = createContext<AssessmentContextType | undefined>(undefined);

export function AssessmentProvider({ children }: { children: ReactNode }) {
  // 1. Document Upload Domain State
  const [questionPaperFile, setQuestionPaperFile] = useState<File | null>(null);
  const [answerSheetFile, setAnswerSheetFile] = useState<File | null>(null);
  const [questionPaperPages, setQuestionPaperPages] = useState<string[]>([]);
  const [answerSheetPages, setAnswerSheetPages] = useState<string[]>([]);
  const [questionPaperTexts, setQuestionPaperTexts] = useState<string[]>([]);
  const [answerSheetTexts, setAnswerSheetTexts] = useState<string[]>([]);

  // 2. Assessment Progress Domain State
  const [status, setStatus] = useState<AssessmentStatus>('idle');
  const [progressStep, setProgressStep] = useState<string>('Ready to start');
  const [progressPercentage, setProgressPercentage] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);

  // 3. Assessment Results Domain State
  const [results, setResults] = useState<AssessmentResult | null>(null);
  const [selectedQuestionId, setSelectedQuestionId] = useState<string | null>(null);

  // Document Upload Actions with Async Page Rendering & Text Extraction
  const handleSetQuestionPaperFile = useCallback(async (file: File | null) => {
    setQuestionPaperFile(file);
    if (file && typeof window !== 'undefined') {
      try {
        const { processUploadedDocumentWithText } = await import('../lib/pdfRenderer');
        const docResult = await processUploadedDocumentWithText(file);
        setQuestionPaperPages(docResult.pageImageUrls);
        setQuestionPaperTexts(docResult.pageTexts);
        try {
          sessionStorage.setItem('veda_question_paper_pages', JSON.stringify(docResult.pageImageUrls));
        } catch {}
      } catch (err) {
        console.warn('Could not extract question paper pages preview:', err);
      }
    } else {
      setQuestionPaperPages([]);
      setQuestionPaperTexts([]);
      try {
        sessionStorage.removeItem('veda_question_paper_pages');
      } catch {}
    }
  }, []);

  const handleSetAnswerSheetFile = useCallback(async (file: File | null) => {
    setAnswerSheetFile(file);
    if (file && typeof window !== 'undefined') {
      try {
        const { processUploadedDocumentWithText } = await import('../lib/pdfRenderer');
        const docResult = await processUploadedDocumentWithText(file);
        setAnswerSheetPages(docResult.pageImageUrls);
        setAnswerSheetTexts(docResult.pageTexts);
        try {
          sessionStorage.setItem('veda_answer_sheet_pages', JSON.stringify(docResult.pageImageUrls));
        } catch {}
      } catch (err) {
        console.warn('Could not extract answer sheet pages preview:', err);
      }
    } else {
      setAnswerSheetPages([]);
      setAnswerSheetTexts([]);
      try {
        sessionStorage.removeItem('veda_answer_sheet_pages');
      } catch {}
    }
  }, []);

  const removeQuestionPaper = useCallback(() => {
    setQuestionPaperFile(null);
    setQuestionPaperPages([]);
    setQuestionPaperTexts([]);
    try {
      sessionStorage.removeItem('veda_question_paper_pages');
    } catch {}
  }, []);

  const removeAnswerSheet = useCallback(() => {
    setAnswerSheetFile(null);
    setAnswerSheetPages([]);
    setAnswerSheetTexts([]);
    try {
      sessionStorage.removeItem('veda_answer_sheet_pages');
    } catch {}
  }, []);

  const clearAllDocuments = useCallback(() => {
    removeQuestionPaper();
    removeAnswerSheet();
  }, [removeQuestionPaper, removeAnswerSheet]);

  // Assessment Progress Actions
  const startAssessment = useCallback(() => {
    setStatus('processing');
    setProgressStep('Starting extraction...');
    setProgressPercentage(5);
    setError(null);
  }, []);

  const updateProgress = useCallback((step: string, percentage: number) => {
    setProgressStep(step);
    setProgressPercentage(percentage);
  }, []);

  const failAssessment = useCallback((errorMessage: string) => {
    setStatus('error');
    setError(errorMessage);
    setProgressStep('Failed');
  }, []);

  const resetProgress = useCallback(() => {
    setStatus('idle');
    setProgressStep('Ready to start');
    setProgressPercentage(0);
    setError(null);
  }, []);

  // Assessment Results Actions
  const handleSetResults = useCallback((newResults: AssessmentResult | null) => {
    setResults(newResults);
    if (newResults && newResults.questions.length > 0) {
      setSelectedQuestionId((prev) => prev || newResults.questions[0].id);
      try {
        sessionStorage.setItem('veda_assessment_results', JSON.stringify(newResults));
      } catch (e) {
        console.warn('Could not cache assessment results in sessionStorage:', e);
      }
    } else {
      setSelectedQuestionId(null);
      try {
        sessionStorage.removeItem('veda_assessment_results');
      } catch {}
    }
  }, []);

  const selectQuestion = useCallback((id: string | null) => {
    setSelectedQuestionId(id);
  }, []);

  const clearResults = useCallback(() => {
    setResults(null);
    setSelectedQuestionId(null);
    try {
      sessionStorage.removeItem('veda_assessment_results');
    } catch {}
  }, []);

  // Full Assessment Reset
  const resetAssessment = useCallback(() => {
    clearAllDocuments();
    resetProgress();
    clearResults();
    try {
      sessionStorage.removeItem('veda_assessment_results');
      sessionStorage.removeItem('veda_answer_sheet_pages');
      sessionStorage.removeItem('veda_question_paper_pages');
    } catch {}
  }, [clearAllDocuments, resetProgress, clearResults]);

  // Derived / Computed values
  const isUploadReady = Boolean(questionPaperFile && answerSheetFile);
  const isProcessing = status === 'processing' || status === 'uploading';
  const isCompleted = status === 'completed';
  const isError = status === 'error';
  const hasResults = Boolean(results && results.questions.length > 0);

  const selectedQuestion: Question | null = useMemo(() => {
    if (!results || !selectedQuestionId) return null;
    return results.questions.find((q) => q.id === selectedQuestionId) || null;
  }, [results, selectedQuestionId]);

  const selectedAnswerMapping: AnswerMapping | null = useMemo(() => {
    if (!results || !selectedQuestionId) return null;
    return results.answers.find((a) => a.questionId === selectedQuestionId) || null;
  }, [results, selectedQuestionId]);

  // Memoized Domain Context Values
  const documentUploadValue = useMemo<DocumentUploadContextType>(() => ({
    questionPaperFile,
    setQuestionPaperFile: handleSetQuestionPaperFile,
    answerSheetFile,
    setAnswerSheetFile: handleSetAnswerSheetFile,
    questionPaperPages,
    setQuestionPaperPages,
    answerSheetPages,
    setAnswerSheetPages,
    questionPaperTexts,
    answerSheetTexts,
    removeQuestionPaper,
    removeAnswerSheet,
    clearAllDocuments,
    isUploadReady,
  }), [
    questionPaperFile,
    handleSetQuestionPaperFile,
    answerSheetFile,
    handleSetAnswerSheetFile,
    questionPaperPages,
    answerSheetPages,
    questionPaperTexts,
    answerSheetTexts,
    removeQuestionPaper,
    removeAnswerSheet,
    clearAllDocuments,
    isUploadReady,
  ]);

  const assessmentProgressValue = useMemo<AssessmentProgressContextType>(() => ({
    status,
    setStatus,
    progressStep,
    setProgressStep,
    progressPercentage,
    setProgressPercentage,
    error,
    setError,
    startAssessment,
    updateProgress,
    failAssessment,
    resetProgress,
    isProcessing,
    isCompleted,
    isError,
  }), [
    status,
    progressStep,
    progressPercentage,
    error,
    startAssessment,
    updateProgress,
    failAssessment,
    resetProgress,
    isProcessing,
    isCompleted,
    isError,
  ]);

  const assessmentResultsValue = useMemo<AssessmentResultsContextType>(() => ({
    results,
    setResults: handleSetResults,
    selectedQuestionId,
    setSelectedQuestionId,
    selectQuestion,
    clearResults,
    selectedQuestion,
    selectedAnswerMapping,
    hasResults,
  }), [
    results,
    handleSetResults,
    selectedQuestionId,
    selectQuestion,
    clearResults,
    selectedQuestion,
    selectedAnswerMapping,
    hasResults,
  ]);

  // Unified Facade Context Value
  const assessmentValue = useMemo<AssessmentContextType>(() => ({
    ...documentUploadValue,
    ...assessmentProgressValue,
    ...assessmentResultsValue,
    resetAssessment,
  }), [
    documentUploadValue,
    assessmentProgressValue,
    assessmentResultsValue,
    resetAssessment,
  ]);

  return (
    <DocumentUploadContext.Provider value={documentUploadValue}>
      <AssessmentProgressContext.Provider value={assessmentProgressValue}>
        <AssessmentResultsContext.Provider value={assessmentResultsValue}>
          <AssessmentContext.Provider value={assessmentValue}>
            {children}
          </AssessmentContext.Provider>
        </AssessmentResultsContext.Provider>
      </AssessmentProgressContext.Provider>
    </DocumentUploadContext.Provider>
  );
}

// Hook Implementations
export function useDocumentUpload(): DocumentUploadContextType {
  const context = useContext(DocumentUploadContext);
  if (!context) {
    throw new Error('useDocumentUpload must be used within an AssessmentProvider');
  }
  return context;
}

export function useAssessmentProgress(): AssessmentProgressContextType {
  const context = useContext(AssessmentProgressContext);
  if (!context) {
    throw new Error('useAssessmentProgress must be used within an AssessmentProvider');
  }
  return context;
}

export function useAssessmentResults(): AssessmentResultsContextType {
  const context = useContext(AssessmentResultsContext);
  if (!context) {
    throw new Error('useAssessmentResults must be used within an AssessmentProvider');
  }
  return context;
}

export function useAssessment(): AssessmentContextType {
  const context = useContext(AssessmentContext);
  if (!context) {
    throw new Error('useAssessment must be used within an AssessmentProvider');
  }
  return context;
}
