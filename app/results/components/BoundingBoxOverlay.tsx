"use client";

import React, { useEffect, useRef } from 'react';
import { BoundingBox, Question } from '../../types/assessment';

interface BoundingBoxOverlayProps {
  box: BoundingBox;
  question?: Question;
  isSelected: boolean;
  onSelect: () => void;
}

export default function BoundingBoxOverlay({
  box,
  question,
  isSelected,
  onSelect,
}: BoundingBoxOverlayProps) {
  const boxRef = useRef<HTMLDivElement | null>(null);

  // Smooth scroll bounding box into center view when active
  useEffect(() => {
    if (isSelected && boxRef.current) {
      boxRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
        inline: 'nearest',
      });
    }
  }, [isSelected]);

  const qLabel = `Q${question?.number || ''}`;

  return (
    <div
      ref={boxRef}
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
      }}
      style={{
        left: `${box.x}%`,
        top: `${box.y}%`,
        width: `${box.width}%`,
        height: `${box.height}%`,
      }}
      className={`absolute rounded-xl transition-all duration-200 cursor-pointer select-none z-20 ${
        isSelected
          ? 'border-2 border-[#10B981] bg-[#10B981]/8 ring-2 ring-[#10B981]/25'
          : 'border border-[#10B981]/60 bg-[#10B981]/4 hover:border-[#10B981] hover:bg-[#10B981]/10'
      }`}
    >
      {/* Green Floating Tag Badge on top-left */}
      <div
        className={`absolute -top-3.5 left-2 flex items-center justify-center px-2 py-0.5 rounded text-[10px] font-bold shadow-xs transition-transform ${
          isSelected
            ? 'bg-[#10B981] text-white scale-105'
            : 'bg-[#10B981] text-white'
        }`}
      >
        <span>{qLabel}</span>
      </div>
    </div>
  );
}
