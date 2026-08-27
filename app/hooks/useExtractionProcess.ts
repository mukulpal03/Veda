"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAssessmentProgress, useAssessmentResults } from './index';
import { SAMPLE_ASSESSMENT_RESULTS } from '../data/sampleAssessmentData';

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
    label: 'Parsing Question Paper structure...',
    subtext: 'Detecting question numbers, sections, and mark allocations',
    targetPercent: 25,
    durationMs: 900,
  },
  {
    id: 2,
    label: 'Transcribing student handwritten answers...',
    subtext: 'Applying OCR and visual handwriting recognition',
    targetPercent: 55,
    durationMs: 1100,
  },
  {
    id: 3,
    label: 'Mapping student answers to questions...',
    subtext: 'Aligning handwritten blocks with corresponding question numbers',
    targetPercent: 80,
    durationMs: 1000,
  },
  {
    id: 4,
    label: 'Grading and calculating coordinates...',
    subtext: 'Generating bounding boxes and evaluation scores',
    targetPercent: 95,
    durationMs: 900,
  },
  {
    id: 5,
    label: 'Finalizing assessment...',
    subtext: 'Preparing side-by-side review dashboard',
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
    resetProgress 
  } = useAssessmentProgress();
  const { setResults } = useAssessmentResults();

  const [currentStageIndex, setCurrentStageIndex] = useState(0);
  const [isCancelled, setIsCancelled] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const startPipeline = useCallback(() => {
    let stageIdx = 0;

    const runStage = () => {
      if (stageIdx >= EXTRACTION_STAGES.length) {
        // Complete extraction
        updateProgress('Extraction complete!', 100);
        setStatus('completed');
        setResults(SAMPLE_ASSESSMENT_RESULTS);
        
        // Navigate to results
        timerRef.current = setTimeout(() => {
          router.push('/results');
        }, 500);
        return;
      }

      const stage = EXTRACTION_STAGES[stageIdx];
      setCurrentStageIndex(stageIdx);
      updateProgress(stage.label, stage.targetPercent);

      timerRef.current = setTimeout(() => {
        stageIdx++;
        runStage();
      }, stage.durationMs);
    };

    runStage();
  }, [router, updateProgress, setStatus, setResults]);

  useEffect(() => {
    startPipeline();

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [startPipeline]);

  const cancelExtraction = useCallback(() => {
    setIsCancelled(true);
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    resetProgress();
    router.push('/');
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
