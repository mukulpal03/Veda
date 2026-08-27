"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  RotateCcw, 
  Download, 
  Printer, 
  CheckCircle2, 
  Sparkles
} from 'lucide-react';
import { useAssessmentResults, useAssessment } from '../../hooks';

export default function ResultsHeader() {
  const router = useRouter();
  const { results } = useAssessmentResults();
  const { resetAssessment } = useAssessment();

  const handleStartNew = () => {
    resetAssessment();
    router.push('/');
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExportJson = () => {
    if (!results) return;
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(results, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `assessment_results_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const student = results?.student;
  const summary = results?.summary;

  return (
    <div className="w-full bg-white/95 backdrop-blur-md rounded-[20px] lg:rounded-[24px] p-4 lg:px-6 lg:py-3.5 border border-white/60 shadow-[0px_4px_24px_rgba(0,0,0,0.03)] flex flex-col md:flex-row items-start md:items-center justify-between gap-3 shrink-0">
      
      {/* Left side: Back button & Assessment Title */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={() => router.push('/')}
          className="p-2 hover:bg-gray-100 rounded-full text-gray-500 hover:text-gray-900 transition-colors cursor-pointer shrink-0"
          title="Back to Upload"
        >
          <ArrowLeft size={19} />
        </button>

        <div className="flex flex-col min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="font-[family-name:var(--font-bricolage)] font-bold text-lg lg:text-xl text-[#1E1E1E] truncate">
              {student?.subject || 'Physics Mid-Term Assessment'}
            </h1>
            <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold px-2.5 py-0.5 rounded-full">
              <CheckCircle2 size={12} className="text-emerald-600" />
              Evaluated & Mapped
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs text-[#7A7A7A] font-medium mt-0.5 flex-wrap">
            {student && (
              <>
                <span className="font-semibold text-gray-800">{student.name}</span>
                <span>•</span>
                <span>Roll No: {student.rollNumber}</span>
                <span>•</span>
                <span>{student.className}</span>
                <span>•</span>
              </>
            )}
            <span>4 Questions Mapped</span>
          </div>
        </div>
      </div>

      {/* Right side: Score badge & Action Buttons */}
      <div className="flex items-center gap-2.5 self-end md:self-auto flex-wrap">
        {/* Score Quick Pill */}
        {summary && (
          <div className="hidden sm:flex items-center gap-2 bg-[#FFF0EB] border border-[#FFD9CD] px-3.5 py-1.5 rounded-full text-xs font-bold text-[#FF5623]">
            <Sparkles size={14} />
            <span>{summary.totalMarksObtained} / {summary.totalMaxMarks} Marks ({summary.percentage}%)</span>
          </div>
        )}

        {/* Print Button */}
        <button
          onClick={handlePrint}
          className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors cursor-pointer"
          title="Print Assessment Summary"
        >
          <Printer size={14} />
          <span>Print</span>
        </button>

        {/* Export JSON / PDF Button */}
        <button
          onClick={handleExportJson}
          className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors cursor-pointer"
          title="Export JSON Data"
        >
          <Download size={14} />
          <span className="hidden sm:inline">Export</span>
        </button>

        {/* New Assessment Button */}
        <button
          onClick={handleStartNew}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#1E1E1E] hover:bg-black rounded-full transition-colors shadow-sm cursor-pointer"
          title="Upload New Assessment"
        >
          <RotateCcw size={14} />
          <span>New Upload</span>
        </button>
      </div>

    </div>
  );
}
