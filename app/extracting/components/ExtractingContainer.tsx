"use client";

import React from 'react';
import ExtractingAnimation from './ExtractingAnimation';
import ExtractingStatus from './ExtractingStatus';
import ExtractingProgressTracker from './ExtractingProgressTracker';
import { useExtractionProcess, useAssessmentProgress } from '../../hooks';
import { X, AlertTriangle, ArrowLeft } from 'lucide-react';

export default function ExtractingContainer() {
  const { 
    currentStage, 
    currentStageIndex, 
    progressPercentage,
    cancelExtraction 
  } = useExtractionProcess();

  const { isError, error } = useAssessmentProgress();

  if (isError) {
    return (
      <div className="w-full flex-1 flex flex-col items-center justify-center relative min-h-[580px] lg:min-h-[640px] px-4 py-8">
        <div className="max-w-md w-full bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-red-100 flex flex-col items-center text-center">
          <div className="w-14 h-14 rounded-2xl bg-red-50 text-red-500 flex items-center justify-center mb-4">
            <AlertTriangle size={28} />
          </div>
          <h2 className="font-bold text-xl sm:text-2xl text-gray-900 mb-2">
            Assessment Failed
          </h2>
          <p className="text-xs sm:text-sm text-gray-600 mb-6 bg-red-50/80 p-3.5 rounded-xl border border-red-100 text-left font-mono break-words w-full">
            {error || "An unknown error occurred while processing the document."}
          </p>
          <div className="flex gap-3 w-full">
            <button
              onClick={cancelExtraction}
              className="flex-1 py-3 px-4 rounded-xl border border-gray-200 text-gray-700 text-sm font-semibold hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <ArrowLeft size={16} />
              <span>Back to Upload</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full flex-1 flex flex-col items-center justify-center relative min-h-[580px] lg:min-h-[640px] px-2 py-4">
      
      {/* Cancel Action (Top Right) */}
      <button
        type="button"
        onClick={cancelExtraction}
        title="Cancel extraction"
        className="absolute top-2 right-2 text-[#8A8A8A] hover:text-[#1E1E1E] hover:bg-white/60 p-2 rounded-full transition-colors flex items-center gap-1.5 text-xs font-medium cursor-pointer"
      >
        <X size={16} />
        <span className="hidden sm:inline">Cancel</span>
      </button>

      {/* Main Extracting Animation & Status */}
      <div className="flex flex-col items-center justify-center my-auto">
        <ExtractingAnimation />
        
        <ExtractingStatus 
          heading="Extracting..."
          stageName={currentStage.label}
          subtext="This may take a while"
        />

        <ExtractingProgressTracker 
          progressPercentage={progressPercentage}
          currentStageIndex={currentStageIndex}
        />

        {/* Free-Tier Model Notice */}
        <div className="mt-4 px-3.5 py-1.5 rounded-full bg-orange-50/90 border border-orange-200/70 text-[11px] sm:text-xs text-orange-900/85 flex items-center justify-center gap-2 shadow-xs max-w-sm text-center">
          <span className="w-1.5 h-1.5 rounded-full bg-[#FF5623] animate-pulse shrink-0" />
          <span>Processing via free-tier vision model — may take 30–60s for full handwriting OCR.</span>
        </div>
      </div>

      {/* Subtle Bottom Note */}
      <div className="mt-auto pt-4 text-center">
        <p className="text-[11px] sm:text-xs text-[#A0A0A0] font-medium">
          {currentStage.subtext}
        </p>
      </div>

    </div>
  );
}
