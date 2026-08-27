"use client";

import React, { useMemo } from 'react';
import BoundingBoxOverlay from './BoundingBoxOverlay';
import { Question, AnswerMapping, BoundingBox } from '../../types/assessment';

interface DocumentPageCanvasProps {
  currentPage: number;
  zoom: number;
  selectedQuestionId: string | null;
  showBoundingBoxes: boolean;
  onSelectQuestion: (id: string) => void;
  pageImageUrl?: string | null;
  questions?: Question[];
  answers?: AnswerMapping[];
}

export default function DocumentPageCanvas({
  currentPage,
  zoom,
  selectedQuestionId,
  showBoundingBoxes,
  onSelectQuestion,
  pageImageUrl,
  questions = [],
  answers = [],
}: DocumentPageCanvasProps) {
  // Build a fast lookup map of questions by ID
  const questionMap = useMemo(() => {
    const map = new Map<string, Question>();
    questions.forEach((q) => map.set(q.id, q));
    return map;
  }, [questions]);

  // Extract all bounding boxes located on the current page
  const pageBoxes = useMemo(() => {
    const boxes: {
      box: BoundingBox;
      questionId: string;
      question?: Question;
      answer: AnswerMapping;
    }[] = [];

    answers.forEach((ans) => {
      ans.boundingBoxes?.forEach((box) => {
        if (box.pageNumber === currentPage) {
          boxes.push({
            box,
            questionId: ans.questionId,
            question: questionMap.get(ans.questionId),
            answer: ans,
          });
        }
      });
    });

    return boxes;
  }, [answers, currentPage, questionMap]);

  return (
    <div
      style={{
        transform: `scale(${zoom / 100})`,
        transformOrigin: 'top center',
        transition: 'transform 0.2s cubic-bezier(0.2, 0, 0, 1)',
      }}
      className="w-full max-w-[680px] flex flex-col gap-6 select-none transition-all pb-12"
    >
      {/* Real Document Sheet Container */}
      <div className="w-full bg-white rounded-xl shadow-[0px_4px_24px_rgba(0,0,0,0.08)] border border-gray-300 relative overflow-hidden">
        
        {pageImageUrl ? (
          /* Render Real Uploaded Document Image */
          <div className="relative w-full min-h-[750px] bg-neutral-100 flex items-center justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={pageImageUrl}
              alt={`Answer Sheet Page ${currentPage}`}
              className="w-full h-auto block rounded-xl select-none"
            />

            {/* Bounding Box Overlays Superimposed Directly Over Image */}
            {showBoundingBoxes && (
              <div className="absolute inset-0 pointer-events-auto">
                {pageBoxes.map(({ box, questionId, question }, idx) => (
                  <BoundingBoxOverlay
                    key={`${questionId}-${box.pageNumber}-${idx}`}
                    box={box}
                    question={question}
                    isSelected={selectedQuestionId === questionId}
                    onSelect={() => onSelectQuestion(questionId)}
                  />
                ))}
              </div>
            )}
          </div>
        ) : (
          /* High-Fidelity Lined Paper Document Canvas for Assessment Answers */
          <div
            className="w-full min-h-[860px] relative p-6 pl-14 text-[#1E3A8A] font-serif"
            style={{
              backgroundColor: '#FAF8F5',
              backgroundImage: 'linear-gradient(to bottom, #dbe4f0 1px, transparent 1px)',
              backgroundSize: '100% 32px',
              backgroundPosition: '0 32px',
            }}
          >
            {/* Red Margin Line */}
            <div className="absolute left-[46px] top-0 bottom-0 w-[1.5px] bg-red-400/40" />

            {/* Page Header (Sheet Top) */}
            <div className="flex items-center justify-between pb-3 mb-2 border-b border-blue-900/20 text-xs text-blue-950 font-sans">
              <span className="font-semibold">Student Answer Sheet</span>
              <span className="bg-blue-100 text-blue-900 px-2 py-0.5 rounded text-[11px] font-bold">
                Page {currentPage}
              </span>
            </div>

            {/* Render Answers on this Page */}
            <div className="space-y-6 pt-2">
              {pageBoxes.length > 0 ? (
                pageBoxes.map(({ questionId, question, answer }) => {
                  const isSelected = selectedQuestionId === questionId;
                  return (
                    <div
                      key={questionId}
                      onClick={() => onSelectQuestion(questionId)}
                      className={`relative rounded-xl p-3 transition-all duration-200 cursor-pointer ${
                        showBoundingBoxes
                          ? isSelected
                            ? 'border-2 border-[#10B981] bg-[#10B981]/10 ring-2 ring-[#10B981]/25'
                            : 'border border-[#10B981]/50 bg-[#10B981]/5 hover:border-[#10B981]'
                          : 'p-1'
                      }`}
                    >
                      {/* Floating Green Tag */}
                      {showBoundingBoxes && (
                        <div
                          className={`absolute -top-3 left-2 flex items-center justify-center px-2 py-0.5 rounded text-[10px] font-bold shadow-xs transition-transform ${
                            isSelected ? 'bg-[#10B981] text-white scale-105' : 'bg-[#10B981] text-white'
                          }`}
                        >
                          Q{question?.number || ''}
                        </div>
                      )}

                      {/* Question Answer Header */}
                      <div className="flex items-start gap-2">
                        <span className="font-bold text-[#1E3A8A] text-sm shrink-0">
                          Q{question?.number || ''}.
                        </span>
                        <p className="text-[14px] sm:text-[14.5px] leading-[30px] font-normal whitespace-pre-line text-[#1E3A8A]">
                          {answer.studentAnswerText || 'No handwritten answer text detected.'}
                        </p>
                      </div>
                    </div>
                  );
                })
              ) : (
                /* Empty Page State */
                <div className="flex flex-col items-center justify-center min-h-[300px] text-center text-blue-900/60 font-sans">
                  <p className="text-sm font-semibold">No answers mapped on Page {currentPage}</p>
                  <p className="text-xs text-gray-500 mt-1">Navigate to other pages using the toolbar above.</p>
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
