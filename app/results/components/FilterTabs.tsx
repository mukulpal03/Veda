"use client";

import React from 'react';
import { FilterStatus, AnswerMapping } from '../../types/assessment';

interface FilterTabsProps {
  currentFilter: FilterStatus;
  onFilterChange: (filter: FilterStatus) => void;
  answers: AnswerMapping[];
}

export default function FilterTabs({
  currentFilter,
  onFilterChange,
  answers
}: FilterTabsProps) {
  const totalCount = answers.length;
  const correctCount = answers.filter(a => a.evaluationStatus === 'CORRECT').length;
  const partialCount = answers.filter(a => a.evaluationStatus === 'PARTIALLY_CORRECT').length;
  const incorrectCount = answers.filter(a => a.evaluationStatus === 'INCORRECT').length;

  const tabs: { id: FilterStatus; label: string; count: number }[] = [
    { id: 'ALL', label: 'All Questions', count: totalCount },
    { id: 'CORRECT', label: 'Correct', count: correctCount },
    { id: 'PARTIALLY_CORRECT', label: 'Partial', count: partialCount },
    { id: 'INCORRECT', label: 'Incorrect', count: incorrectCount },
  ];

  return (
    <div className="flex items-center gap-1.5 overflow-x-auto py-1 no-scrollbar select-none">
      {tabs.map((tab) => {
        const isActive = currentFilter === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onFilterChange(tab.id)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-150 flex items-center gap-1.5 cursor-pointer ${
              isActive
                ? 'bg-[#1E1E1E] text-white shadow-xs'
                : 'bg-[#F2F2F2] text-[#6A6A6A] hover:bg-[#E5E5E5] hover:text-[#1E1E1E]'
            }`}
          >
            <span>{tab.label}</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                isActive
                  ? 'bg-white/20 text-white'
                  : 'bg-white text-[#7A7A7A]'
              }`}
            >
              {tab.count}
            </span>
          </button>
        );
      })}
    </div>
  );
}
