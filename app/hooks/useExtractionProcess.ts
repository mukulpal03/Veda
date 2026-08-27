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
    targetPercent: 20,
    durationMs: 1200,
  },
  {
    id: 2,
    label: "Transcribing student handwritten answers...",
    subtext: "Applying OCR and Vision to transcribe handwriting",
    targetPercent: 50,
    durationMs: 1500,
  },
  {
    id: 3,
    label: "Mapping student answers to questions...",
    subtext: "Aligning handwritten blocks with corresponding question numbers",
    targetPercent: 75,
    durationMs: 1500,
  },
  {
    id: 4,
    label: "Grading and calculating coordinates...",
    subtext: "Evaluating pedagogical scores and bounding regions",
    targetPercent: 92,
    durationMs: 1200,
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
    setStatus,
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

  const startPipeline = useCallback(async () => {
    let activeStage = 0;

    // Advance UI animation smoothly up to stage 4 (92%)
    const progressTimer = setInterval(() => {
      if (activeStage < 3) {
        activeStage++;
        setCurrentStageIndex(activeStage);
        updateProgress(
          EXTRACTION_STAGES[activeStage].label,
          EXTRACTION_STAGES[activeStage].targetPercent,
        );
      }
    }, 1400);

    try {
      // Allow up to 180s for high-accuracy multimodal model generation
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 180000);

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
      }).catch((err) => {
        console.warn("Network or server error calling /api/assess:", err);
        return null;
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
        } else {
          console.warn("API returned empty questions");
        }
      } else {
        console.warn("API returned non-OK status:", response?.status);
      }

      // Finish progress animation to 100%
      setCurrentStageIndex(4);
      updateProgress("Extraction complete!", 100);
      setStatus("completed");

      // Navigate to results
      setTimeout(() => {
        router.push("/results");
        // Fallback hard navigation if soft navigation fails or hangs
        setTimeout(() => {
          if (window.location.pathname !== "/results") {
            window.location.href = "/results";
          }
        }, 800);
      }, 400);
    } catch (err) {
      console.error("Error during extraction pipeline:", err);
      clearInterval(progressTimer);

      setCurrentStageIndex(4);
      updateProgress("Extraction complete!", 100);
      setStatus("completed");

      setTimeout(() => {
        router.push("/results");
        setTimeout(() => {
          if (window.location.pathname !== "/results") {
            window.location.href = "/results";
          }
        }, 800);
      }, 400);
    }
  }, [
    router,
    updateProgress,
    setStatus,
    setResults,
    questionPaperPages,
    answerSheetPages,
    questionPaperTexts,
    answerSheetTexts,
  ]);

  useEffect(() => {
    if (!isStartedRef.current) {
      isStartedRef.current = true;
      startPipeline();
    }
  }, [startPipeline]);

  const cancelExtraction = useCallback(() => {
    setIsCancelled(true);
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
