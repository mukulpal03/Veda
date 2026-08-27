"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  useAssessmentProgress,
  useAssessmentResults,
  useDocumentUpload,
} from "./index";
import { AssessmentResult } from "../types/assessment";

export interface ExtractionStage {
  id: number;
  label: string;
  subtext: string;
  targetPercent: number;
  durationMs: number;
}

export const EXTRACTION_STAGES: ExtractionStage[] = [
  {
    id: 1,
    label: "Parsing Question Paper structure...",
    subtext: "Detecting question numbers, sections, and mark allocations",
    targetPercent: 22,
    durationMs: 6000,
  },
  {
    id: 2,
    label: "Transcribing student handwritten answers...",
    subtext: "Applying AI Vision OCR to transcribe handwriting",
    targetPercent: 55,
    durationMs: 18000,
  },
  {
    id: 3,
    label: "Mapping student answers to questions...",
    subtext: "Aligning handwritten blocks with corresponding question numbers",
    targetPercent: 78,
    durationMs: 16000,
  },
  {
    id: 4,
    label: "Grading and evaluating answers...",
    subtext: "Applying rubric criteria and scoring answers",
    targetPercent: 94,
    durationMs: 20000,
  },
  {
    id: 5,
    label: "Finalizing assessment...",
    subtext: "Preparing side-by-side review dashboard",
    targetPercent: 100,
    durationMs: 600,
  },
];

export function useExtractionProcess() {
  const router = useRouter();
  const {
    progressStep,
    progressPercentage,
    updateProgress,
    status,
    setStatus,
    failAssessment,
    resetProgress,
  } = useAssessmentProgress();
  const { setResults } = useAssessmentResults();
  const {
    questionPaperPages,
    answerSheetPages,
    questionPaperTexts = [],
    answerSheetTexts = [],
  } = useDocumentUpload();

  const [currentStageIndex, setCurrentStageIndex] = useState(0);
  const [isCancelled, setIsCancelled] = useState(false);
  const isStartedRef = useRef(false);
  const isFetchingRef = useRef(false);
  const isCancelledRef = useRef(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  const startPipeline = useCallback(async () => {
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;

    // Smooth, continuous realistic progress ticker
    let currentPercent = 5;
    let elapsedMs = 0;
    const intervalMs = 300;

    const progressTimer = setInterval(() => {
      elapsedMs += intervalMs;
      const elapsedSec = elapsedMs / 1000;

      if (elapsedSec < 6) {
        // Stage 0: 5% -> 22%
        currentPercent = Math.min(22, 5 + (elapsedSec / 6) * 17);
        setCurrentStageIndex(0);
        updateProgress(EXTRACTION_STAGES[0].label, Math.round(currentPercent));
      } else if (elapsedSec < 24) {
        // Stage 1: 22% -> 55%
        currentPercent = Math.min(55, 22 + ((elapsedSec - 6) / 18) * 33);
        setCurrentStageIndex(1);
        updateProgress(EXTRACTION_STAGES[1].label, Math.round(currentPercent));
      } else if (elapsedSec < 40) {
        // Stage 2: 55% -> 78%
        currentPercent = Math.min(78, 55 + ((elapsedSec - 24) / 16) * 23);
        setCurrentStageIndex(2);
        updateProgress(EXTRACTION_STAGES[2].label, Math.round(currentPercent));
      } else if (elapsedSec < 65) {
        // Stage 3: 78% -> 94%
        currentPercent = Math.min(94, 78 + ((elapsedSec - 40) / 25) * 16);
        setCurrentStageIndex(3);
        updateProgress(EXTRACTION_STAGES[3].label, Math.round(currentPercent));
      } else {
        // If taking longer, keep smoothly creeping forward by 0.1% per sec (never freezes)
        currentPercent = Math.min(98, 94 + (elapsedSec - 65) * 0.1);
        setCurrentStageIndex(3);
        updateProgress(EXTRACTION_STAGES[3].label, Math.round(currentPercent));
      }
    }, intervalMs);

    let isTimeoutAborted = false;

    try {
      // Allow up to 180s for high-accuracy multimodal model generation
      const controller = new AbortController();
      abortControllerRef.current = controller;
      const timeoutId = setTimeout(() => {
        isTimeoutAborted = true;
        controller.abort();
      }, 180000);

      const response = await fetch("/api/assess", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          questionPaperPages,
          answerSheetPages,
          questionPaperTexts,
          answerSheetTexts,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      clearInterval(progressTimer);

      if (response && response.ok) {
        const realAssessmentData: AssessmentResult = await response.json();
        if (
          realAssessmentData &&
          realAssessmentData.questions &&
          realAssessmentData.questions.length > 0
        ) {
          setResults(realAssessmentData);

          // Finish progress animation to 100%
          setCurrentStageIndex(4);
          updateProgress("Extraction complete!", 100);
          setStatus("completed");

          // Navigate cleanly to results
          setTimeout(() => {
            router.push("/results");
          }, 300);
          return;
        } else {
          console.warn("API returned empty questions");
          failAssessment(
            "Could not extract questions or answers from the provided documents. Please check your uploaded files.",
          );
          return;
        }
      } else {
        const errJson = response ? await response.json().catch(() => ({})) : {};
        const errorMsg =
          errJson.error ||
          `API error (Status ${response?.status || "Unknown"}). Please verify API keys.`;
        console.warn("API returned non-OK status:", response?.status, errorMsg);
        failAssessment(errorMsg);
        return;
      }
    } catch (err: any) {
      clearInterval(progressTimer);
      if (err?.name === "AbortError") {
        if (isCancelledRef.current) {
          console.log("Assessment fetch cancelled by user.");
          return;
        }
        if (isTimeoutAborted) {
          failAssessment("Assessment request timed out after 180 seconds.");
          return;
        }
        console.warn("Transient fetch abort detected, ignoring false-positive error:", err);
        return;
      }
      console.error("Error during extraction pipeline:", err);
      failAssessment(err?.message || "An unexpected error occurred during extraction.");
    }
  }, [
    router,
    updateProgress,
    setStatus,
    failAssessment,
    setResults,
    questionPaperPages,
    answerSheetPages,
    questionPaperTexts,
    answerSheetTexts,
  ]);

  useEffect(() => {
    if (isStartedRef.current) return;

    // If navigating directly to /extracting without files, bounce back to home
    if (!questionPaperPages.length || !answerSheetPages.length) {
      router.replace("/");
      return;
    }

    isStartedRef.current = true;
    startPipeline();
  }, [questionPaperPages.length, answerSheetPages.length, router, startPipeline]);

  const cancelExtraction = useCallback(() => {
    isCancelledRef.current = true;
    setIsCancelled(true);
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    resetProgress();
    router.push("/");
  }, [resetProgress, router]);

  return {
    currentStage: EXTRACTION_STAGES[currentStageIndex] || EXTRACTION_STAGES[0],
    currentStageIndex,
    totalStages: EXTRACTION_STAGES.length,
    progressStep,
    progressPercentage,
    cancelExtraction,
    isCancelled,
  };
}
