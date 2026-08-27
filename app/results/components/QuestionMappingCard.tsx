"use client";

import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Question, AnswerMapping } from '../../types/assessment';

interface QuestionMappingCardProps {
  question: Question;
  answer?: AnswerMapping;
  isSelected: boolean;
  onSelect: () => void;
  isExpandedControlled?: boolean;
}

export default function QuestionMappingCard({
  question,
  answer,
  isSelected,
  onSelect,
  isExpandedControlled,
}: QuestionMappingCardProps) {
  const [userToggled, setUserToggled] = useState<boolean | null>(null);
  const [prevSelected, setPrevSelected] = useState<boolean>(isSelected);
  const [prevExpandedControlled, setPrevExpandedControlled] = useState<boolean | undefined>(isExpandedControlled);

  // Sync with expand all button
  if (isExpandedControlled !== prevExpandedControlled) {
    setPrevExpandedControlled(isExpandedControlled);
    setUserToggled(isExpandedControlled ?? null);
  }

  // Reset toggle override when selection state changes
  if (isSelected !== prevSelected) {
    setPrevSelected(isSelected);
    setUserToggled(null);
  }

  const isExpanded = userToggled ?? isSelected;

  const marksAwarded = answer?.marksAwarded ?? 0;
  const maxMarks = answer?.maxMarks ?? question.maxMarks ?? 2;

  // Determine mark pill color scheme based on score
  const getMarksPill = () => {
    if (marksAwarded === maxMarks && maxMarks > 0) {
      return (
        <span className="bg-[#E8F8F0] text-[#10B981] font-bold text-xs px-2.5 py-1 rounded-full whitespace-nowrap">
          {marksAwarded}/{maxMarks}
        </span>
      );
    }
    if (marksAwarded > 0) {
      return (
        <span className="bg-[#FFF3EB] text-[#FF5623] font-bold text-xs px-2.5 py-1 rounded-full whitespace-nowrap">
          {marksAwarded}/{maxMarks}
        </span>
      );
    }
    return (
      <span className="bg-[#FEECEC] text-[#EF4444] font-bold text-xs px-2.5 py-1 rounded-full whitespace-nowrap">
        {marksAwarded}/{maxMarks}
      </span>
    );
  };

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setUserToggled(!isExpanded);
    if (!isSelected && !isExpanded) {
      onSelect();
    }
  };

  const handleClickCard = () => {
    onSelect();
    if (!isSelected) {
      setUserToggled(true);
    }
  };

  // Check if number contains subpart like "11 a." or "11 b."
  const isSubpart = question.number.includes(' ');
  const [mainNum, subpart] = isSubpart ? question.number.split(' ') : [question.number, ''];

  return (
    <div
      onClick={handleClickCard}
      className={`w-full rounded-2xl p-4 transition-all duration-200 cursor-pointer ${
        isSelected
          ? 'bg-white border-2 border-[#FF5623] shadow-[0_4px_16px_rgba(255,86,35,0.08)]'
          : 'bg-white border border-gray-200/90 hover:border-gray-300 shadow-[0_2px_8px_rgba(0,0,0,0.02)]'
      }`}
    >
      {/* Top Main Question Row */}
      <div className="flex items-start gap-3">
        {/* Question Number Badge */}
        {isSubpart ? (
          <div className="flex items-center gap-1.5 shrink-0 pt-0.5">
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs transition-colors ${
                isSelected ? 'bg-[#FF5623] text-white' : 'bg-[#4A4A4A] text-white'
              }`}
            >
              {mainNum}
            </div>
            <span className="text-xs font-bold text-[#4A4A4A]">{subpart}</span>
          </div>
        ) : (
          <div
            className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs shrink-0 transition-colors pt-0.5 ${
              isSelected ? 'bg-[#FF5623] text-white' : 'bg-[#4A4A4A] text-white'
            }`}
          >
            {question.number}
          </div>
        )}

        {/* Question Text */}
        <p className="text-[13px] sm:text-[13.5px] font-medium text-[#1E1E1E] flex-1 leading-snug pt-0.5 pr-2">
          {question.text}
        </p>

        {/* Right Marks Pill & Expand Chevron */}
        <div className="flex items-center gap-2 shrink-0 pt-0.5">
          {getMarksPill()}

          <button
            type="button"
            onClick={handleToggle}
            className="text-gray-400 hover:text-gray-700 p-0.5 hover:bg-gray-100 rounded-md transition-colors cursor-pointer"
          >
            {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        </div>
      </div>

      {/* Expanded Student Answer & AI Feedback Section */}
      {isExpanded && answer && (
        <div className="mt-3.5 pt-1 space-y-2.5">
          {/* Student Transcribed Answer */}
          {answer.studentAnswerText && (
            <div className="bg-[#F8FAFC] border border-slate-200/80 rounded-xl p-3">
              <span className="font-bold text-[11px] uppercase tracking-wider text-slate-500 block mb-1">
                Student&apos;s Answer
              </span>
              <p className="text-xs text-slate-800 leading-relaxed font-sans">
                {answer.studentAnswerText}
              </p>
            </div>
          )}

          {/* AI Pedagogical Feedback */}
          <div className="bg-[#FFF8F5] border border-[#FFE8DF] rounded-xl p-3">
            <span className="font-bold text-[11px] uppercase tracking-wider text-[#FF5623] block mb-1">
              AI Feedback
            </span>
            <p className="text-xs text-[#525252] leading-relaxed">
              {answer.feedback ||
                (answer.evaluationStatus === 'UNANSWERED' || !answer.isAnswered || !answer.studentAnswerText?.trim()
                  ? 'You did not attempt this question. Be mindful to answer all questions in future assessments!'
                  : 'Answer evaluated and mapped successfully.')}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
