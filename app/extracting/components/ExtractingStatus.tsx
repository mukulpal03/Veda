"use client";

import React from 'react';

interface ExtractingStatusProps {
  heading?: string;
  subtext?: string;
  stageName?: string;
}

export default function ExtractingStatus({ 
  heading = "Extracting...", 
  subtext = "This may take a while",
  stageName
}: ExtractingStatusProps) {
  return (
    <div className="text-center max-w-md px-4">
      {/* Primary Bold Title */}
      <h2 className="font-[family-name:var(--font-bricolage)] font-bold text-2xl sm:text-3xl lg:text-4xl text-[#1E1E1E] tracking-tight mb-2">
        {heading}
      </h2>

      {/* Dynamic Stage Information */}
      {stageName && (
        <p className="text-xs sm:text-sm font-semibold text-[#FF5623] mb-1">
          {stageName}
        </p>
      )}

      {/* Subtext */}
      <p className="text-xs sm:text-sm text-[#8C8C8C] font-medium">
        {subtext}
      </p>
    </div>
  );
}
