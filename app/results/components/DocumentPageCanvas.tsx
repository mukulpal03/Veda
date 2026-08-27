"use client";

import React from 'react';

interface DocumentPageCanvasProps {
  zoom: number;
  selectedQuestionId: string | null;
  showBoundingBoxes: boolean;
  onSelectQuestion: (id: string) => void;
}

export default function DocumentPageCanvas({
  zoom,
  selectedQuestionId,
  showBoundingBoxes,
  onSelectQuestion,
}: DocumentPageCanvasProps) {
  return (
    <div
      style={{
        transform: `scale(${zoom / 100})`,
        transformOrigin: 'top center',
        transition: 'transform 0.2s cubic-bezier(0.2, 0, 0, 1)',
      }}
      className="w-full max-w-[680px] flex flex-col gap-6 select-none"
    >
      {/* Page Sheet Container */}
      <div className="w-full bg-[#FAF8F5] rounded-xl shadow-[0px_4px_24px_rgba(0,0,0,0.06)] border border-gray-300 relative overflow-hidden">
        {/* Lined Notebook Paper Background */}
        <div
          className="w-full min-h-[820px] relative p-6 pl-14 text-[#1E3A8A] font-serif"
          style={{
            backgroundImage: 'linear-gradient(to bottom, #dbe4f0 1px, transparent 1px)',
            backgroundSize: '100% 32px',
            backgroundPosition: '0 32px',
          }}
        >
          {/* Red Margin Line */}
          <div className="absolute left-[46px] top-0 bottom-0 w-[1.5px] bg-red-400/40" />

          {/* Section 1: Question 1 */}
          <div className="relative pt-1">
            <span className="absolute -left-10 font-bold text-[#1E3A8A] text-sm">Q1.</span>
            <p className="text-[14px] sm:text-[14.5px] leading-[32px] font-normal pl-1">
              Photosynthesis is the process used by green plants and some other organisms to convert light energy into chemical energy.
            </p>

            {/* Chemical Equation Box */}
            <div className="my-3 mx-auto max-w-[440px] border border-blue-900/70 rounded-md py-1.5 px-3 text-center bg-white/30 font-mono text-[13px] leading-[26px]">
              <div className="flex items-center justify-center gap-2">
                <span>6CO₂ + 6H₂O</span>
                <div className="flex flex-col items-center px-1 text-[10px] leading-tight">
                  <span className="text-[11px]">Light</span>
                  <span className="w-16 h-[1px] bg-blue-900 my-0.5"></span>
                  <span className="text-[11px]">Chlorophyll</span>
                </div>
                <span>→</span>
                <span>C₆H₁₂O₆ + 6O₂</span>
              </div>
            </div>

            {/* Hand-drawn Plant Diagram SVG */}
            <div className="my-4 flex items-center justify-center">
              <svg
                width="300"
                height="160"
                viewBox="0 0 300 160"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="text-[#1E3A8A]"
              >
                {/* Sun */}
                <circle cx="70" cy="30" r="14" stroke="#1E3A8A" strokeWidth="1.5" strokeDasharray="3 2" />
                <path
                  d="M70 10V4M70 50V56M50 30H44M90 30H96M56 16L52 12M84 44L88 48M56 44L52 48M84 16L88 12"
                  stroke="#1E3A8A"
                  strokeWidth="1.5"
                />
                <text x="94" y="34" fill="#1E3A8A" fontSize="12" fontFamily="serif">
                  Sunlight
                </text>

                {/* Carbon Dioxide Arrow */}
                <text x="15" y="80" fill="#1E3A8A" fontSize="12" fontFamily="serif">
                  Carbon
                </text>
                <text x="15" y="96" fill="#1E3A8A" fontSize="12" fontFamily="serif">
                  dioxide
                </text>
                <path d="M58 88C75 88 95 78 110 74" stroke="#1E3A8A" strokeWidth="1.2" />
                <path d="M110 74L102 71M110 74L103 79" stroke="#1E3A8A" strokeWidth="1.2" />

                {/* Oxygen Arrow */}
                <path d="M175 74C190 78 210 88 225 88" stroke="#1E3A8A" strokeWidth="1.2" />
                <path d="M225 88L217 84M225 88L217 92" stroke="#1E3A8A" strokeWidth="1.2" />
                <text x="233" y="92" fill="#1E3A8A" fontSize="12" fontFamily="serif">
                  Oxygen
                </text>

                {/* Stem & Leaves */}
                <path d="M145 50V115" stroke="#1E3A8A" strokeWidth="2" />
                {/* Leaf 1 */}
                <path d="M145 68C125 50 110 68 145 84" stroke="#1E3A8A" strokeWidth="1.5" fill="none" />
                {/* Leaf 2 */}
                <path d="M145 62C165 44 180 62 145 78" stroke="#1E3A8A" strokeWidth="1.5" fill="none" />
                {/* Leaf 3 */}
                <path d="M145 84C120 72 115 88 145 98" stroke="#1E3A8A" strokeWidth="1.5" fill="none" />
                {/* Leaf 4 */}
                <path d="M145 80C170 68 175 84 145 94" stroke="#1E3A8A" strokeWidth="1.5" fill="none" />

                {/* Ground Line */}
                <path d="M100 115H190" stroke="#1E3A8A" strokeWidth="1.5" />

                {/* Roots */}
                <path d="M145 115C140 130 130 140 125 150" stroke="#1E3A8A" strokeWidth="1.5" />
                <path d="M145 115C150 130 160 140 165 150" stroke="#1E3A8A" strokeWidth="1.5" />
                <path d="M145 115V145" stroke="#1E3A8A" strokeWidth="1.5" />

                {/* Water Arrow */}
                <path d="M175 135H205" stroke="#1E3A8A" strokeWidth="1.2" />
                <path d="M175 135L182 131M175 135L182 139" stroke="#1E3A8A" strokeWidth="1.2" />
                <text x="213" y="139" fill="#1E3A8A" fontSize="12" fontFamily="serif">
                  Water
                </text>
              </svg>
            </div>
          </div>

          {/* Section 2: Question 2 with Green Bounding Box Overlay */}
          <div
            onClick={() => onSelectQuestion('q2')}
            className={`relative mt-4 mb-2 rounded-xl transition-all duration-200 cursor-pointer ${
              showBoundingBoxes
                ? selectedQuestionId === 'q2'
                  ? 'border-2 border-[#10B981] bg-[#10B981]/10 ring-2 ring-[#10B981]/25 p-3.5'
                  : 'border border-[#10B981] bg-[#10B981]/5 p-3.5'
                : 'p-1'
            }`}
          >
            {/* Green Tag Badge on Top-Left */}
            {showBoundingBoxes && (
              <div className="absolute -top-3 left-2 bg-[#10B981] text-white text-[11px] font-bold px-2 py-0.5 rounded shadow-xs">
                Q2
              </div>
            )}

            <div className="relative">
              <span className="font-bold text-[#1E3A8A] text-sm mr-2">Q2.</span>
              <span className="text-[14px] sm:text-[14.5px] leading-[32px] font-normal">
                The process mainly occurs in the chloroplast of the plant cell. It has two main stages:
              </span>
            </div>

            <div className="pl-6 mt-1 space-y-0.5 text-[14px] sm:text-[14.5px] leading-[32px]">
              <p>1. Light reaction — Captures light energy.</p>
              <p>2. Dark reaction — Uses energy to make glucose.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Repeated / Continuous Sheet Segment matching bottom of screenshot */}
      <div className="w-full bg-[#FAF8F5] rounded-xl shadow-[0px_4px_24px_rgba(0,0,0,0.06)] border border-gray-300 relative overflow-hidden">
        <div
          className="w-full min-h-[820px] relative p-6 pl-14 text-[#1E3A8A] font-serif"
          style={{
            backgroundImage: 'linear-gradient(to bottom, #dbe4f0 1px, transparent 1px)',
            backgroundSize: '100% 32px',
            backgroundPosition: '0 32px',
          }}
        >
          {/* Red Margin Line */}
          <div className="absolute left-[46px] top-0 bottom-0 w-[1.5px] bg-red-400/40" />

          {/* Section 1: Question 1 repeat */}
          <div className="relative pt-1">
            <span className="absolute -left-10 font-bold text-[#1E3A8A] text-sm">Q1.</span>
            <p className="text-[14px] sm:text-[14.5px] leading-[32px] font-normal pl-1">
              Photosynthesis is the process used by green plants and some other organisms to convert light energy into chemical energy.
            </p>

            {/* Chemical Equation Box */}
            <div className="my-3 mx-auto max-w-[440px] border border-blue-900/70 rounded-md py-1.5 px-3 text-center bg-white/30 font-mono text-[13px] leading-[26px]">
              <div className="flex items-center justify-center gap-2">
                <span>6CO₂ + 6H₂O</span>
                <div className="flex flex-col items-center px-1 text-[10px] leading-tight">
                  <span className="text-[11px]">Light</span>
                  <span className="w-16 h-[1px] bg-blue-900 my-0.5"></span>
                  <span className="text-[11px]">Chlorophyll</span>
                </div>
                <span>→</span>
                <span>C₆H₁₂O₆ + 6O₂</span>
              </div>
            </div>

            {/* Diagram */}
            <div className="my-4 flex items-center justify-center">
              <svg
                width="300"
                height="160"
                viewBox="0 0 300 160"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="text-[#1E3A8A]"
              >
                <circle cx="70" cy="30" r="14" stroke="#1E3A8A" strokeWidth="1.5" strokeDasharray="3 2" />
                <path
                  d="M70 10V4M70 50V56M50 30H44M90 30H96M56 16L52 12M84 44L88 48M56 44L52 48M84 16L88 12"
                  stroke="#1E3A8A"
                  strokeWidth="1.5"
                />
                <text x="94" y="34" fill="#1E3A8A" fontSize="12" fontFamily="serif">
                  Sunlight
                </text>
                <text x="15" y="80" fill="#1E3A8A" fontSize="12" fontFamily="serif">
                  Carbon
                </text>
                <text x="15" y="96" fill="#1E3A8A" fontSize="12" fontFamily="serif">
                  dioxide
                </text>
                <path d="M58 88C75 88 95 78 110 74" stroke="#1E3A8A" strokeWidth="1.2" />
                <path d="M110 74L102 71M110 74L103 79" stroke="#1E3A8A" strokeWidth="1.2" />
                <path d="M175 74C190 78 210 88 225 88" stroke="#1E3A8A" strokeWidth="1.2" />
                <path d="M225 88L217 84M225 88L217 92" stroke="#1E3A8A" strokeWidth="1.2" />
                <text x="233" y="92" fill="#1E3A8A" fontSize="12" fontFamily="serif">
                  Oxygen
                </text>
                <path d="M145 50V115" stroke="#1E3A8A" strokeWidth="2" />
                <path d="M145 68C125 50 110 68 145 84" stroke="#1E3A8A" strokeWidth="1.5" fill="none" />
                <path d="M145 62C165 44 180 62 145 78" stroke="#1E3A8A" strokeWidth="1.5" fill="none" />
                <path d="M100 115H190" stroke="#1E3A8A" strokeWidth="1.5" />
                <path d="M145 115C140 130 130 140 125 150" stroke="#1E3A8A" strokeWidth="1.5" />
                <path d="M145 115C150 130 160 140 165 150" stroke="#1E3A8A" strokeWidth="1.5" />
                <path d="M175 135H205" stroke="#1E3A8A" strokeWidth="1.2" />
                <text x="213" y="139" fill="#1E3A8A" fontSize="12" fontFamily="serif">
                  Water
                </text>
              </svg>
            </div>
          </div>

          {/* Section 2: Question 2 with Green Bounding Box Overlay */}
          <div
            onClick={() => onSelectQuestion('q2')}
            className={`relative mt-4 mb-2 rounded-xl transition-all duration-200 cursor-pointer ${
              showBoundingBoxes
                ? selectedQuestionId === 'q2'
                  ? 'border-2 border-[#10B981] bg-[#10B981]/10 ring-2 ring-[#10B981]/25 p-3.5'
                  : 'border border-[#10B981] bg-[#10B981]/5 p-3.5'
                : 'p-1'
            }`}
          >
            {showBoundingBoxes && (
              <div className="absolute -top-3 left-2 bg-[#10B981] text-white text-[11px] font-bold px-2 py-0.5 rounded shadow-xs">
                Q2
              </div>
            )}

            <div className="relative">
              <span className="font-bold text-[#1E3A8A] text-sm mr-2">Q2.</span>
              <span className="text-[14px] sm:text-[14.5px] leading-[32px] font-normal">
                The process mainly occurs in the chloroplast of the plant cell. It has two main stages:
              </span>
            </div>

            <div className="pl-6 mt-1 space-y-0.5 text-[14px] sm:text-[14.5px] leading-[32px]">
              <p>1. Light reaction — Captures light energy.</p>
              <p>2. Dark reaction — Uses energy to make glucose.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
