"use client";

import React from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Minus, 
  Plus 
} from 'lucide-react';
import DocumentPageCanvas from './DocumentPageCanvas';
import { useDocumentViewer } from '../../hooks';

interface DocumentViewerProps {
  selectedQuestionId: string | null;
  onSelectQuestion: (id: string) => void;
  totalPages?: number;
}

export default function DocumentViewer({
  selectedQuestionId,
  onSelectQuestion,
  totalPages = 4,
}: DocumentViewerProps) {
  const {
    currentPage,
    zoom,
    showBoundingBoxes,
    goToNextPage,
    goToPrevPage,
    zoomIn,
    zoomOut,
  } = useDocumentViewer(totalPages);

  return (
    <div className="flex-1 flex flex-col h-full bg-[#E5E5E5]/60 rounded-2xl overflow-hidden relative border border-gray-200 shadow-inner">
      
      {/* Dark Top Toolbar */}
      <div className="w-full bg-[#2C2C2C] px-4 py-2 flex items-center justify-between gap-3 shrink-0 select-none z-20">
        
        {/* Left: Title */}
        <span className="text-white font-bold text-xs tracking-tight">
          Answer Sheet
        </span>

        {/* Right: Zoom & Page Controls */}
        <div className="flex items-center gap-2.5">
          
          {/* Zoom Pill */}
          <div className="flex items-center bg-[#3D3D3D] text-white rounded-md px-2 py-0.5 text-xs font-semibold gap-2">
            <button
              onClick={zoomOut}
              disabled={zoom <= 60}
              className="text-gray-300 hover:text-white transition-colors cursor-pointer p-0.5"
              title="Zoom Out"
            >
              <Minus size={13} strokeWidth={2.5} />
            </button>
            <span className="min-w-[36px] text-center text-[11px] font-bold">
              {zoom}%
            </span>
            <button
              onClick={zoomIn}
              disabled={zoom >= 200}
              className="text-gray-300 hover:text-white transition-colors cursor-pointer p-0.5"
              title="Zoom In"
            >
              <Plus size={13} strokeWidth={2.5} />
            </button>
          </div>

          {/* Page Navigator Pill */}
          <div className="flex items-center bg-[#3D3D3D] text-white rounded-md px-2 py-0.5 text-xs font-semibold gap-2">
            <button
              onClick={goToPrevPage}
              disabled={currentPage <= 1}
              className="text-gray-300 hover:text-white disabled:opacity-40 transition-colors cursor-pointer p-0.5"
              title="Previous Page"
            >
              <ChevronLeft size={13} strokeWidth={2.5} />
            </button>
            <span className="text-[11px] font-bold whitespace-nowrap">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={goToNextPage}
              disabled={currentPage >= totalPages}
              className="text-gray-300 hover:text-white disabled:opacity-40 transition-colors cursor-pointer p-0.5"
              title="Next Page"
            >
              <ChevronRight size={13} strokeWidth={2.5} />
            </button>
          </div>

        </div>

      </div>

      {/* Main Canvas Document Scroll Area */}
      <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col items-center p-3 lg:p-4 relative">
        <DocumentPageCanvas
          zoom={zoom}
          selectedQuestionId={selectedQuestionId}
          showBoundingBoxes={showBoundingBoxes}
          onSelectQuestion={onSelectQuestion}
        />
      </div>

    </div>
  );
}
