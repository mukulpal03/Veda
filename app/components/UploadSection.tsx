"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import UploadCard from "./UploadCard";
import { ArrowRight, Sparkles, Clock, Settings, ListChecks, Cloud } from "lucide-react";
import Image from "next/image";
import { useDocumentUpload, useAssessmentProgress, useAssessment } from "../hooks";

export default function UploadSection() {
  const router = useRouter();
  const {
    questionPaperFile,
    setQuestionPaperFile,
    answerSheetFile,
    setAnswerSheetFile,
    questionPaperPages,
    answerSheetPages,
    removeQuestionPaper,
    removeAnswerSheet,
    clearAllDocuments,
    isUploadReady,
  } = useDocumentUpload();
  const { startAssessment, status } = useAssessmentProgress();
  const { resetAssessment } = useAssessment();

  const [isLoadingSample, setIsLoadingSample] = useState(false);

  const handleStartMapping = () => {
    if (isUploadReady) {
      startAssessment();
      router.push("/extracting");
    }
  };

  const handleLoadSampleFiles = async () => {
    setIsLoadingSample(true);
    try {
      const [qpRes, asRes] = await Promise.all([
        fetch("/demo_exam_question_paper.pdf"),
        fetch("/student_answer_sheet.pdf"),
      ]);
      if (qpRes.ok && asRes.ok) {
        const [qpBlob, asBlob] = await Promise.all([
          qpRes.blob(),
          asRes.blob(),
        ]);
        const sampleQP = new File([qpBlob], "demo_exam_question_paper.pdf", {
          type: "application/pdf",
        });
        const sampleAS = new File([asBlob], "student_answer_sheet.pdf", {
          type: "application/pdf",
        });
        setQuestionPaperFile(sampleQP);
        setAnswerSheetFile(sampleAS);
        setIsLoadingSample(false);
        return;
      }
    } catch (e) {
      console.warn("Could not fetch sample PDF files from public folder:", e);
    }

    const fallbackQP = new File(
      ["Sample Question Paper Content\nClass 10 Mathematics Unit Test"],
      "demo_exam_question_paper.pdf",
      { type: "application/pdf" },
    );
    const fallbackAS = new File(
      ["Sample Student Answer Sheet Content\nStudent: Mukul Pal"],
      "student_answer_sheet.pdf",
      { type: "application/pdf" },
    );
    setQuestionPaperFile(fallbackQP);
    setAnswerSheetFile(fallbackAS);
    setIsLoadingSample(false);
  };

  return (
    <div className="w-full flex-1 flex flex-col items-center justify-center relative min-h-[580px] lg:min-h-[640px] px-2 py-4">
      {/* Top Heading Area - All in One Line */}
      <div className="text-center max-w-3xl mb-4">
        <h1 className="font-[family-name:var(--font-bricolage)] font-bold text-2xl sm:text-3xl lg:text-[34px] leading-tight text-[#1E1E1E] flex items-center justify-center gap-2 flex-wrap text-center">
          <span>Upload</span>
          <span 
            style={{ backgroundColor: '#FF935026' }}
            className="text-[#FF5623] px-3.5 py-0.5 rounded-xl inline-block"
          >
            Question Paper &amp; Answer Sheets
          </span>
        </h1>
        <p className="text-[#7A7A7A] font-medium text-xs sm:text-sm mt-2">
          Upload both files to get started
        </p>
      </div>

      {/* Center 3D Teacher Avatar with Dual Concentric Spheres & 4 Floating Badges */}
      <div className="relative my-2 flex items-center justify-center select-none">
        {/* Outer Ring Sphere (Layer 2) */}
        <div 
          style={{
            width: '109.6px',
            height: '110.4px',
            paddingTop: '10.56px',
            paddingRight: '9.6px',
            paddingBottom: '10.56px',
            paddingLeft: '9.6px',
          }}
          className="rounded-full bg-[#FF9350]/15 flex items-center justify-center relative shrink-0"
        >
          {/* Inner Ring Sphere (Layer 1) */}
          <div className="w-[74px] h-[74px] rounded-full bg-[#FF9350]/30 flex items-center justify-center relative shrink-0">
            
            {/* Center Pure White Circle with Teacher */}
            <div className="w-[50px] h-[50px] rounded-full bg-white flex items-center justify-center relative shadow-[0_2px_8px_rgba(0,0,0,0.06)] overflow-hidden shrink-0">
              <Image
                src="/fdadf59d77be69f6cf33cea431ae7b6872c093fe.png"
                alt="AI Assessment Teacher"
                width={50}
                height={50}
                priority
                className="object-cover object-top scale-115 translate-y-0.5"
              />
            </div>

            {/* Badge 1: Top-Right (Clock / Timer) */}
            <div 
              className="absolute -top-1.5 right-5.5 w-[15px] h-[15px] rounded-full bg-gradient-to-b from-[#FF7E4A] to-[#FF4B18] flex items-center justify-center text-white shadow-[0_2px_5px_rgba(255,86,35,0.35)] border border-white/60"
              title="Time Tracking"
            >
              <Clock size={8} strokeWidth={2.5} />
            </div>

            {/* Badge 2: Right-Bottom (Cloud / AI Sparkle) */}
            <div 
              className="absolute top-[56%] -right-1 w-[15px] h-[15px] rounded-full bg-gradient-to-b from-[#FF7E4A] to-[#FF4B18] flex items-center justify-center text-white shadow-[0_2px_5px_rgba(255,86,35,0.35)] border border-white/60"
              title="AI Cloud Processing"
            >
              <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z" />
              </svg>
            </div>

            {/* Badge 3: Bottom Center (Settings) */}
            <div 
              className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-[15px] h-[15px] rounded-full bg-gradient-to-b from-[#FF7E4A] to-[#FF4B18] flex items-center justify-center text-white shadow-[0_2px_5px_rgba(255,86,35,0.35)] border border-white/60"
              title="Rubric Settings"
            >
              <Settings size={8} strokeWidth={2.5} />
            </div>

            {/* Badge 4: Left (Checklist) */}
            <div 
              className="absolute top-[38%] -left-1 w-[15px] h-[15px] rounded-full bg-gradient-to-b from-[#FF7E4A] to-[#FF4B18] flex items-center justify-center text-white shadow-[0_2px_5px_rgba(255,86,35,0.35)] border border-white/60"
              title="Question Paper Checklist"
            >
              <ListChecks size={8} strokeWidth={2.5} />
            </div>

          </div>

        </div>
      </div>

      {/* Upload Dropzones Container - Blended with background */}
      <div className="w-full max-w-[800px] bg-white/40 backdrop-blur-xs border border-white/80 rounded-[28px] lg:rounded-[32px] p-3 sm:p-4 flex flex-col sm:flex-row gap-3 sm:gap-4 shadow-xs my-2">
        <UploadCard
          titlePrefix="Upload"
          titleHighlight="Question Paper"
          file={questionPaperFile}
          pageCount={
            questionPaperPages?.length > 0
              ? questionPaperPages.length
              : undefined
          }
          onFileSelect={(file) => setQuestionPaperFile(file)}
          onRemove={removeQuestionPaper}
        />
        <UploadCard
          titlePrefix="Upload"
          titleHighlight="Answer Sheet"
          file={answerSheetFile}
          pageCount={
            answerSheetPages?.length > 0 ? answerSheetPages.length : undefined
          }
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
              ? "bg-[#242424] text-white hover:bg-black cursor-pointer shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]"
              : "bg-[#C5C5C5] text-white cursor-not-allowed opacity-90"
          } px-8 py-3 rounded-full font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all duration-200`}
        >
          Start Mapping <ArrowRight size={16} strokeWidth={2} />
        </button>

        <p className="text-[11px] sm:text-xs text-[#8C8C8C] font-medium mt-2.5">
          Once both files are uploaded, you&apos;ll able to map answers with
          questions
        </p>

        {/* Quick Sample Files Button */}
        {!isUploadReady && (
          <button
            type="button"
            onClick={handleLoadSampleFiles}
            disabled={isLoadingSample}
            className="mt-2.5 text-xs text-[#FF5623] hover:text-[#e04513] disabled:opacity-50 font-semibold flex items-center gap-1.5 underline underline-offset-4 decoration-[#FF5623]/30 hover:decoration-[#FF5623] transition-colors cursor-pointer"
          >
            <Sparkles
              size={12}
              className={isLoadingSample ? "animate-spin" : ""}
            />
            {isLoadingSample
              ? "Loading sample assessment files..."
              : "Try with sample assessment files"}
          </button>
        )}
      </div>
    </div>
  );
}
