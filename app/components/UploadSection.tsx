"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import UploadCard from './UploadCard';
import { ArrowRight } from 'lucide-react';
import Image from 'next/image';

export default function UploadSection() {
  const router = useRouter();
  const [questionPaperFile, setQuestionPaperFile] = useState<File | null>(null);
  const [answerSheetFile, setAnswerSheetFile] = useState<File | null>(null);

  const isReady = questionPaperFile && answerSheetFile;

  const handleStartMapping = () => {
    if (isReady) {
      router.push('/extracting');
    }
  };

  return (
    <div className="w-full lg:w-[1103px] h-auto lg:min-h-[694px] flex flex-col items-center pt-[30px] lg:pt-[50px] pb-[20px] lg:pb-[40px] px-4 lg:px-8 overflow-visible z-10 relative gap-6 lg:gap-[36px]">
      {/* Headings */}
      <div className="text-center px-2">
        <h1 className="font-[family-name:var(--font-bricolage)] font-bold text-3xl lg:text-[40px] leading-[1.2] tracking-[-0.04em] text-[#2B2B2B] align-middle mb-2">
          Upload <span className="text-[#FF5623] border-b-[3px] lg:border-b-4 border-[#FCD2C6] pb-1 block lg:inline">Question Paper & Answer Sheets</span>
        </h1>
        <p className="text-gray-500 font-medium text-base lg:text-lg mt-4">Upload both files to get started</p>
      </div>

      {/* Center Illustration */}
      <div className="relative flex items-center justify-center transform scale-90 lg:scale-100">
        <div className="w-[120px] h-[120px] lg:w-[140px] lg:h-[140px] flex items-center justify-center relative">
          <Image 
            src="/fdadf59d77be69f6cf33cea431ae7b6872c093fe.png" 
            alt="Illustration" 
            width={139} 
            height={139}
            className="object-contain"
          />
        </div>
      </div>

      {/* Upload Cards */}
      <div className="flex flex-col lg:flex-row gap-6 w-full bg-white/40 p-4 rounded-[30px] lg:rounded-[40px]">
        <UploadCard 
          titlePrefix="Upload" 
          titleHighlight="Question Paper" 
          file={questionPaperFile}
          onFileSelect={(file) => setQuestionPaperFile(file)}
          onRemove={() => setQuestionPaperFile(null)}
        />
        <UploadCard 
          titlePrefix="Upload" 
          titleHighlight="Answer Sheet" 
          file={answerSheetFile}
          onFileSelect={(file) => setAnswerSheetFile(file)}
          onRemove={() => setAnswerSheetFile(null)}
        />
      </div>

      {/* Footer Actions */}
      <div className="text-center">
        <button 
          onClick={handleStartMapping}
          disabled={!isReady}
          className={`${
            isReady 
              ? 'bg-[#2C2C2C] text-white cursor-pointer hover:bg-black' 
              : 'bg-[#AFAFAF] text-white cursor-not-allowed opacity-80'
          } px-8 py-3 rounded-full font-semibold flex items-center justify-center gap-2 mx-auto mb-4 transition-colors`}
        >
          Start Mapping <ArrowRight size={18} />
        </button>
        <p className="text-sm text-gray-400 font-medium">
          Once both files are uploaded, you'll able to map answers with questions
        </p>
      </div>
    </div>
  );
}
