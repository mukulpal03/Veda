"use client";

import { useState, useCallback, useRef } from 'react';
import { useAssessmentResults } from './useAssessmentResults';

export interface DocumentViewerState {
  currentPage: number;
  totalPages: number;
  zoom: number;
  showBoundingBoxes: boolean;
  showTranscriptions: boolean;
  activeHighlightedBoxIndex: number | null;
}

export function useDocumentViewer(defaultTotalPages: number = 1) {
  const { results, selectedQuestionId, selectedAnswerMapping } = useAssessmentResults();
  
  const totalPages = results?.totalPages || defaultTotalPages || 1;
  const [manualPage, setManualPage] = useState<number | null>(null);
  const [prevSelectedId, setPrevSelectedId] = useState<string | null>(selectedQuestionId);
  const [zoom, setZoom] = useState<number>(100);
  const [showBoundingBoxes, setShowBoundingBoxes] = useState<boolean>(true);
  const [showTranscriptions, setShowTranscriptions] = useState<boolean>(false);
  const canvasContainerRef = useRef<HTMLDivElement | null>(null);

  // Sync page when selected question changes without useEffect cascading renders
  if (selectedQuestionId !== prevSelectedId) {
    setPrevSelectedId(selectedQuestionId);
    setManualPage(null);
  }

  const targetBoxPage = selectedAnswerMapping?.boundingBoxes?.[0]?.pageNumber;
  const currentPage = manualPage ?? (targetBoxPage || 1);

  const goToNextPage = useCallback(() => {
    setManualPage((prev) => {
      const current = prev ?? (selectedAnswerMapping?.boundingBoxes?.[0]?.pageNumber || 1);
      return Math.min(current + 1, totalPages);
    });
  }, [totalPages, selectedAnswerMapping]);

  const goToPrevPage = useCallback(() => {
    setManualPage((prev) => {
      const current = prev ?? (selectedAnswerMapping?.boundingBoxes?.[0]?.pageNumber || 1);
      return Math.max(current - 1, 1);
    });
  }, [selectedAnswerMapping]);

  const goToPage = useCallback((page: number) => {
    if (page >= 1 && page <= totalPages) {
      setManualPage(page);
    }
  }, [totalPages]);

  const zoomIn = useCallback(() => {
    setZoom((prev) => Math.min(prev + 15, 200));
  }, []);

  const zoomOut = useCallback(() => {
    setZoom((prev) => Math.max(prev - 15, 60));
  }, []);

  const resetZoom = useCallback(() => {
    setZoom(100);
  }, []);

  const toggleBoundingBoxes = useCallback(() => {
    setShowBoundingBoxes((prev) => !prev);
  }, []);

  const toggleTranscriptions = useCallback(() => {
    setShowTranscriptions((prev) => !prev);
  }, []);

  return {
    currentPage,
    totalPages,
    zoom,
    showBoundingBoxes,
    showTranscriptions,
    activeHighlightedBoxIndex: 0,
    canvasContainerRef,
    goToNextPage,
    goToPrevPage,
    goToPage,
    zoomIn,
    zoomOut,
    resetZoom,
    setZoom,
    toggleBoundingBoxes,
    toggleTranscriptions,
  };
}
