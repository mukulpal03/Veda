"use client";

import React, { useState } from 'react';
import QuestionMappingList from './QuestionMappingList';
import DocumentViewer from './DocumentViewer';
import { useAssessmentResults } from '../../hooks';
import { ListChecks, FileText, FileSpreadsheet, Upload, AlertTriangle } from 'lucide-react';
import Link from 'next/link';

export default function ResultsContainer() {
  const { results, selectedQuestionId, selectQuestion } = useAssessmentResults();
  const [mobileTab, setMobileTab] = useState<'questions' | 'document'>('questions');

  if (!results || !results.questions || results.questions.length === 0) {
    return (
      <div className="w-full flex-1 flex flex-col items-center justify-center min-h-0 bg-white rounded-[24px] lg:rounded-[32px] p-6 lg:p-12 shadow-[0px_4px_30px_rgba(0,0,0,0.03)] border border-white/60 text-center">
        <div className="w-16 h-16 rounded-3xl bg-[#FF5623]/10 text-[#FF5623] flex items-center justify-center mb-5 shadow-xs">
          <FileSpreadsheet size={32} />
        </div>
        <h2 className="font-[family-name:var(--font-bricolage)] font-bold text-2xl sm:text-3xl text-gray-900 mb-2">
          No Active Assessment
        </h2>
        <p className="text-xs sm:text-sm text-gray-500 max-w-md mb-6 leading-relaxed">
          You haven&apos;t evaluated an assessment paper yet. Upload a Question Paper and Answer Sheet to begin AI grading.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3 bg-[#1E1E1E] hover:bg-black text-white text-sm font-semibold rounded-2xl transition-all shadow-sm hover:shadow cursor-pointer"
        >
          <Upload size={16} />
          <span>Upload Assessment Documents</span>
        </Link>
      </div>
    );
  }

  const { questions, answers, totalPages = 4 } = results;

  // Initialize selected question to first question in results if none selected
  const activeQuestionId = selectedQuestionId || questions[0]?.id || 'q1';

  return (
    <div className="w-full flex-1 flex flex-col min-h-0 overflow-hidden bg-white rounded-[24px] lg:rounded-[32px] p-3 sm:p-4 lg:p-5 shadow-[0px_4px_30px_rgba(0,0,0,0.03)] border border-white/60">
      
      {/* Warning banner when vision model was unavailable */}
      {results.isVisionFallback && (
        <div className="mb-3 px-4 py-2.5 bg-amber-50 border border-amber-200/90 rounded-2xl flex items-center gap-2.5 text-xs text-amber-900 shrink-0 shadow-xs">
          <AlertTriangle size={17} className="text-amber-600 shrink-0" />
          <span className="font-semibold">
            {results.warningMessage || "Our main vision model is down so visual box highlighting won't be available."}
          </span>
        </div>
      )}
      
      {/* Mobile Tab Switcher (Visible only on mobile/tablet < lg) */}
      <div className="flex lg:hidden items-center bg-gray-100 p-1 rounded-2xl mb-3 shrink-0">
        <button
          onClick={() => setMobileTab('questions')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-bold rounded-xl transition-all ${
            mobileTab === 'questions'
              ? 'bg-white text-gray-900 shadow-xs'
              : 'text-gray-500 hover:text-gray-900'
          }`}
        >
          <ListChecks size={15} className="text-[#FF5623]" />
          <span>Extracted Questions ({questions.length})</span>
        </button>

        <button
          onClick={() => setMobileTab('document')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-bold rounded-xl transition-all ${
            mobileTab === 'document'
              ? 'bg-white text-gray-900 shadow-xs'
              : 'text-gray-500 hover:text-gray-900'
          }`}
        >
          <FileText size={15} className="text-[#FF5623]" />
          <span>Answer Sheet ({totalPages} Pgs)</span>
        </button>
      </div>

      {/* Main Split Screen Area */}
      <div className="w-full flex-1 flex flex-col lg:flex-row gap-4 min-h-0 overflow-hidden">
        
        {/* Left Column: Question Mapping List */}
        <div className={`h-full min-h-0 ${mobileTab === 'questions' ? 'flex' : 'hidden lg:flex'} w-full lg:w-[460px] xl:w-[500px] shrink-0`}>
          <QuestionMappingList
            questions={questions}
            answers={answers}
            selectedQuestionId={activeQuestionId}
            onSelectQuestion={selectQuestion}
          />
        </div>

        {/* Right Column: Interactive Document Viewer */}
        <div className={`flex-1 h-full min-h-0 ${mobileTab === 'document' ? 'flex' : 'hidden lg:flex'}`}>
          <DocumentViewer
            selectedQuestionId={activeQuestionId}
            onSelectQuestion={selectQuestion}
            totalPages={totalPages}
          />
        </div>

      </div>

    </div>
  );
}
