"use client";

import React from 'react';
import { EXTRACTION_STAGES } from '../../hooks/useExtractionProcess';

interface ExtractingProgressTrackerProps {
  progressPercentage: number;
  currentStageIndex: number;
}

export default function ExtractingProgressTracker({
  progressPercentage,
  currentStageIndex
}: ExtractingProgressTrackerProps) {
  return (
    <div className="w-full max-w-[420px] mt-6 flex flex-col items-center gap-3">
      {/* Progress Bar Container */}
      <div className="w-full h-2 bg-[#F0F0F0] rounded-full overflow-hidden relative shadow-inner">
        <div 
          className="h-full bg-gradient-to-r from-[#FF855E] via-[#FF5623] to-[#E04513] rounded-full transition-all duration-300 ease-out relative"
          style={{ width: `${Math.min(Math.max(progressPercentage, 5), 100)}%` }}
        >
          {/* Shimmer Light on Progress Bar */}
          <div className="absolute top-0 right-0 bottom-0 w-8 bg-white/30 skew-x-12 animate-pulse" />
        </div>
      </div>

      {/* Percentage & Quick Stage Counter */}
      <div className="w-full flex items-center justify-between text-xs font-semibold text-[#888888] px-1">
        <span>Step {currentStageIndex + 1} of {EXTRACTION_STAGES.length}</span>
        <span className="text-[#FF5623] font-bold">{progressPercentage}%</span>
      </div>

      {/* Mini Step Bubbles */}
      <div className="flex items-center justify-center gap-2 mt-1">
        {EXTRACTION_STAGES.map((stage, idx) => {
          const isDone = idx < currentStageIndex;
          const isCurrent = idx === currentStageIndex;

          return (
            <div 
              key={stage.id} 
              title={stage.label}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                isDone 
                  ? 'bg-emerald-500 scale-100' 
                  : isCurrent 
                    ? 'bg-[#FF5623] scale-125 ring-2 ring-[#FF5623]/25' 
                    : 'bg-[#E0E0E0] scale-90'
              }`}
            />
          );
        })}
      </div>
    </div>
  );
}
