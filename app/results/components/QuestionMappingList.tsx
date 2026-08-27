"use client";

import React, { useState, useMemo } from 'react';
import QuestionMappingCard from './QuestionMappingCard';
import { Question, AnswerMapping } from '../../types/assessment';

interface QuestionMappingListProps {
  questions: Question[];
  answers: AnswerMapping[];
  selectedQuestionId: string | null;
  onSelectQuestion: (id: string) => void;
}

export default function QuestionMappingList({
  questions,
  answers,
  selectedQuestionId,
  onSelectQuestion,
}: QuestionMappingListProps) {
  const [expandAll, setExpandAll] = useState<boolean>(false);

  // Map answers by questionId with flexible key matching (q1, 1, Q1)
  const answerMap = useMemo(() => {
    const map = new Map<string, AnswerMapping>();
    answers.forEach((ans) => {
      map.set(ans.questionId, ans);
      map.set(ans.questionId.toLowerCase(), ans);
      map.set(ans.questionId.toUpperCase(), ans);
      const digits = ans.questionId.replace(/\D/g, '');
      if (digits) {
        map.set(`q${digits}`, ans);
        map.set(digits, ans);
      }
    });
    return map;
  }, [answers]);

  const toggleExpandAll = () => {
    setExpandAll((prev) => !prev);
  };

  return (
    <div className="w-full flex flex-col h-full overflow-hidden">
      
      {/* Top Header Bar */}
      <div className="flex items-center justify-between pb-3 pt-1 px-1 shrink-0">
        <h2 className="font-bold text-sm sm:text-base text-[#1E1E1E]">
          Extracted Questions <span className="text-[#7A7A7A] font-normal text-xs sm:text-sm">(from question paper)</span>
        </h2>

        <button
          type="button"
          onClick={toggleExpandAll}
          className="bg-[#F7F7F7] hover:bg-[#EFEFEF] border border-gray-200 text-xs font-semibold px-3 py-1 rounded-full text-gray-700 transition-colors cursor-pointer"
        >
          {expandAll ? 'Collapse All' : 'Expand All'}
        </button>
      </div>

      {/* Scrollable Questions List */}
      <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col gap-2.5 pr-2 pb-6 pt-1">
        {questions.map((q) => (
          <QuestionMappingCard
            key={q.id}
            question={q}
            answer={answerMap.get(q.id)}
            isSelected={selectedQuestionId === q.id}
            onSelect={() => onSelectQuestion(q.id)}
            isExpandedControlled={expandAll}
          />
        ))}
      </div>

    </div>
  );
}
