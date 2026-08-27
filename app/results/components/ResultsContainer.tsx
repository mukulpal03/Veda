"use client";

import React, { useState } from 'react';
import QuestionMappingList from './QuestionMappingList';
import DocumentViewer from './DocumentViewer';
import { useAssessmentResults } from '../../hooks';
import { SAMPLE_ASSESSMENT_RESULTS } from '../../data/sampleAssessmentData';
import { ListChecks, FileText } from 'lucide-react';

export default function ResultsContainer() {
  const { results: rawResults, selectedQuestionId, selectQuestion } = useAssessmentResults();
  
  // Use current results or fallback to sample dataset
  const results = rawResults || SAMPLE_ASSESSMENT_RESULTS;
  const [mobileTab, setMobileTab] = useState<'questions' | 'document'>('questions');

  const { questions, answers, totalPages = 4 } = results;

  // Initialize selected question to first question in results if none selected
  const activeQuestionId = selectedQuestionId || questions[0]?.id || 'q1';

  return (
    <div className="w-full flex-1 flex flex-col min-h-0 overflow-hidden bg-white rounded-[24px] lg:rounded-[32px] p-3 sm:p-4 lg:p-5 shadow-[0px_4px_30px_rgba(0,0,0,0.03)] border border-white/60">
      
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
