"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import UploadCard from './UploadCard';
import { ArrowRight, Sparkles } from 'lucide-react';
import Image from 'next/image';
import { useDocumentUpload, useAssessmentProgress } from '../hooks';

export default function UploadSection() {
  const router = useRouter();
  const { 
    questionPaperFile, 
    setQuestionPaperFile, 
    answerSheetFile, 
    setAnswerSheetFile,
    removeQuestionPaper,
    removeAnswerSheet,
    isUploadReady 
  } = useDocumentUpload();
  const { startAssessment } = useAssessmentProgress();

  const handleStartMapping = () => {
    if (isUploadReady) {
      startAssessment();
      router.push('/extracting');
    }
  };

  const handleLoadSampleFiles = () => {
    const sampleQP = new File(["Sample Question Paper Content"], "Class_10_maths_unit_test.pdf", { type: "application/pdf" });
    const sampleAS = new File(["Sample Student Answer Sheet Content"], "student_1_answer_sheet.pdf", { type: "application/pdf" });
    setQuestionPaperFile(sampleQP);
    setAnswerSheetFile(sampleAS);
  };

  return (
    <div className="w-full flex-1 flex flex-col items-center justify-center relative min-h-[580px] lg:min-h-[640px] px-2 py-4">
      
      {/* Top Heading Area - All in One Line */}
      <div className="text-center max-w-3xl mb-4">
        <h1 className="font-[family-name:var(--font-bricolage)] font-bold text-2xl sm:text-3xl lg:text-[34px] leading-tight text-[#1E1E1E] flex items-center justify-center gap-2 flex-wrap text-center">
          <span>Upload</span>
          <span className="bg-[#FFE5DC] text-[#FF5623] px-3.5 py-0.5 rounded-xl inline-block">
            Question Paper &amp; Answer Sheets
          </span>
        </h1>
        <p className="text-[#7A7A7A] font-medium text-xs sm:text-sm mt-2">
          Upload both files to get started
        </p>
      </div>

      {/* Center 3D Teacher Avatar Illustration with Ambient Halo */}
      <div className="relative my-4 flex items-center justify-center">
        {/* Soft Ambient Rings */}
        <div className="absolute w-[150px] h-[150px] rounded-full border border-orange-200/50 -z-10 animate-pulse" />
        <div className="w-[110px] h-[110px] sm:w-[125px] sm:h-[125px] rounded-full bg-gradient-to-b from-[#FFF5F0] to-[#FFE8DE] border-[3px] border-[#FFDFD3] flex items-center justify-center relative shadow-[0_8px_20px_rgba(255,86,35,0.12)] overflow-hidden">
          <Image 
            src="/fdadf59d77be69f6cf33cea431ae7b6872c093fe.png" 
            alt="AI Assessment Teacher" 
            width={125} 
            height={125}
            priority
            className="object-cover object-top scale-110 translate-y-1"
          />
        </div>
      </div>

      {/* Upload Dropzones Container - Blended with background */}
      <div className="w-full max-w-[800px] bg-white/40 backdrop-blur-xs border border-white/80 rounded-[28px] lg:rounded-[32px] p-3 sm:p-4 flex flex-col sm:flex-row gap-3 sm:gap-4 shadow-xs my-2">
        <UploadCard 
          titlePrefix="Upload" 
          titleHighlight="Question Paper" 
          file={questionPaperFile}
          onFileSelect={(file) => setQuestionPaperFile(file)}
          onRemove={removeQuestionPaper}
        />
        <UploadCard 
          titlePrefix="Upload" 
          titleHighlight="Answer Sheet" 
          file={answerSheetFile}
          onFileSelect={(file) => setAnswerSheetFile(file)}
          onRemove={removeAnswerSheet}
        />
      </div>

      {/* Bottom CTA Actions */}
      <div className="text-center mt-4 flex flex-col items-center">
        <button 
          onClick={handleStartMapping}
          disabled={!isUploadReady}
          className={`${
            isUploadReady 
              ? 'bg-[#242424] text-white hover:bg-black cursor-pointer shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]' 
              : 'bg-[#C5C5C5] text-white cursor-not-allowed opacity-90'
          } px-8 py-3 rounded-full font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all duration-200`}
        >
          Start Mapping <ArrowRight size={16} strokeWidth={2} />
        </button>

        <p className="text-[11px] sm:text-xs text-[#8C8C8C] font-medium mt-2.5">
          Once both files are uploaded, you&apos;ll able to map answers with questions
        </p>

        {/* Quick Sample Files Button */}
        {!isUploadReady && (
          <button
            type="button"
            onClick={handleLoadSampleFiles}
            className="mt-2.5 text-xs text-[#FF5623] hover:text-[#e04513] font-semibold flex items-center gap-1.5 underline underline-offset-4 decoration-[#FF5623]/30 hover:decoration-[#FF5623] transition-colors cursor-pointer"
          >
            <Sparkles size={12} />
            Try with sample assessment files
          </button>
        )}
      </div>

    </div>
  );
}
