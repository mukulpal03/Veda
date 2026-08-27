"use client";

import React, { useState } from 'react';
import { 
  Trophy, 
  CheckCircle2, 
  AlertCircle, 
  XCircle, 
  Sparkles, 
  ChevronDown, 
  ChevronUp,
  TrendingUp,
  Target
} from 'lucide-react';
import { OverallGradingSummary, AnswerMapping } from '../../types/assessment';

interface GradingSummaryCardProps {
  summary?: OverallGradingSummary;
  answers: AnswerMapping[];
}

export default function GradingSummaryCard({ summary, answers }: GradingSummaryCardProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  if (!summary) return null;

  const correctCount = answers.filter(a => a.evaluationStatus === 'CORRECT').length;
  const partialCount = answers.filter(a => a.evaluationStatus === 'PARTIALLY_CORRECT').length;
  const incorrectCount = answers.filter(a => a.evaluationStatus === 'INCORRECT').length;

  return (
    <div className="w-full bg-gradient-to-br from-[#FFF9F6] via-white to-[#FDF8F5] border border-[#FFD9CD]/80 rounded-[20px] lg:rounded-[24px] p-4 lg:p-5 shadow-[0px_4px_20px_rgba(255,86,35,0.04)] transition-all">
      
      {/* Top Banner with Score & Grade */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#FF7A4D] to-[#FF4A11] text-white flex items-center justify-center shadow-md shadow-[#FF5623]/20 shrink-0">
            <Trophy size={24} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-[family-name:var(--font-bricolage)] font-bold text-2xl lg:text-3xl text-[#1E1E1E] tracking-tight">
                {summary.totalMarksObtained}
                <span className="text-sm font-semibold text-[#8A8A8A]"> / {summary.totalMaxMarks}</span>
              </span>
              <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-2.5 py-0.5 rounded-full border border-emerald-300">
                {summary.grade || 'Grade A+'}
              </span>
            </div>
            <p className="text-xs font-semibold text-[#FF5623]">
              Overall Score: {summary.percentage}% • Performance Excellent
            </p>
          </div>
        </div>

        {/* Toggle Expand / Collapse */}
        <button
          onClick={() => setIsExpanded(prev => !prev)}
          className="text-gray-400 hover:text-gray-700 p-1.5 hover:bg-gray-100/80 rounded-full transition-colors cursor-pointer"
          title={isExpanded ? "Collapse feedback" : "Expand feedback"}
        >
          {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </button>
      </div>

      {/* Quick Metrics Badges Bar */}
      <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-[#FFD9CD]/50">
        <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-xl p-2 text-center">
          <div className="flex items-center justify-center gap-1 text-emerald-700 text-xs font-bold">
            <CheckCircle2 size={13} />
            <span>{correctCount} Correct</span>
          </div>
        </div>

        <div className="bg-amber-50/70 border border-amber-200/80 rounded-xl p-2 text-center">
          <div className="flex items-center justify-center gap-1 text-amber-700 text-xs font-bold">
            <AlertCircle size={13} />
            <span>{partialCount} Partial</span>
          </div>
        </div>

        <div className="bg-rose-50/70 border border-rose-200/80 rounded-xl p-2 text-center">
          <div className="flex items-center justify-center gap-1 text-rose-700 text-xs font-bold">
            <XCircle size={13} />
            <span>{incorrectCount} Incorrect</span>
          </div>
        </div>
      </div>

      {/* Expanded AI Insights & Feedback */}
      {isExpanded && (
        <div className="mt-4 pt-3 border-t border-gray-100 space-y-3 animate-fadeIn text-xs">
          {/* AI Overall Feedback Note */}
          <div className="bg-white/80 border border-gray-100 rounded-xl p-3 shadow-xs">
            <div className="flex items-center gap-1.5 font-bold text-gray-800 mb-1 text-xs">
              <Sparkles size={13} className="text-[#FF5623]" />
              <span>AI Evaluation Feedback</span>
            </div>
            <p className="text-gray-600 leading-relaxed">
              {summary.overallFeedback}
            </p>
          </div>

          {/* Strengths and Improvements 2-Column */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {/* Strengths */}
            {summary.strengths && summary.strengths.length > 0 && (
              <div className="bg-emerald-50/50 border border-emerald-100 rounded-xl p-2.5">
                <span className="font-bold text-emerald-800 flex items-center gap-1 mb-1.5">
                  <TrendingUp size={12} className="text-emerald-600" />
                  Key Strengths
                </span>
                <ul className="space-y-1 text-gray-700">
                  {summary.strengths.map((strength, i) => (
                    <li key={i} className="flex items-start gap-1.5 leading-snug">
                      <span className="text-emerald-500 font-bold">•</span>
                      <span>{strength}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Areas for Improvement */}
            {summary.areasForImprovement && summary.areasForImprovement.length > 0 && (
              <div className="bg-amber-50/50 border border-amber-100 rounded-xl p-2.5">
                <span className="font-bold text-amber-800 flex items-center gap-1 mb-1.5">
                  <Target size={12} className="text-amber-600" />
                  Areas to Improve
                </span>
                <ul className="space-y-1 text-gray-700">
                  {summary.areasForImprovement.map((area, i) => (
                    <li key={i} className="flex items-start gap-1.5 leading-snug">
                      <span className="text-amber-500 font-bold">•</span>
                      <span>{area}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
