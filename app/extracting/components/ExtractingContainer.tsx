"use client";

import React from 'react';
import ExtractingAnimation from './ExtractingAnimation';
import ExtractingStatus from './ExtractingStatus';
import ExtractingProgressTracker from './ExtractingProgressTracker';
import { useExtractionProcess } from '../../hooks';
import { X } from 'lucide-react';

export default function ExtractingContainer() {
  const { 
    currentStage, 
    currentStageIndex, 
    progressPercentage,
    cancelExtraction 
  } = useExtractionProcess();

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
