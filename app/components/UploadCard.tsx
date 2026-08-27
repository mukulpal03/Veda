"use client";

import React, { useRef, useState } from 'react';
import { Upload, X, FileText, ImageIcon } from 'lucide-react';

interface UploadCardProps {
  titlePrefix: string;
  titleHighlight: string;
  file: File | null;
  pageCount?: number;
  onFileSelect: (file: File) => void;
  onRemove: () => void;
  acceptTypes?: string;
}

export default function UploadCard({ 
  titlePrefix, 
  titleHighlight, 
  file, 
  pageCount,
  onFileSelect, 
  onRemove,
  acceptTypes = ".pdf,image/png,image/jpeg,image/jpg,image/webp"
}: UploadCardProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [internalPageCount, setInternalPageCount] = useState<number | null>(null);
  const [isCalculatingPages, setIsCalculatingPages] = useState<boolean>(false);

  const isPDF = file ? (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) : false;

  // Dynamically resolve actual page count for uploaded files
  React.useEffect(() => {
    if (!file) {
      setInternalPageCount(null);
      setIsCalculatingPages(false);
      return;
    }

    // If explicit page count passed and positive, use it
    if (typeof pageCount === 'number' && pageCount > 0) {
      setInternalPageCount(pageCount);
      setIsCalculatingPages(false);
      return;
    }

    // Images are always 1 single page
    if (!isPDF) {
      setInternalPageCount(1);
      setIsCalculatingPages(false);
      return;
    }

    // PDF files: fetch actual page count using PDF.js metadata
    let isMounted = true;
    setIsCalculatingPages(true);

    import('../lib/pdfRenderer')
      .then(({ getDocumentPageCount }) => getDocumentPageCount(file))
      .then((count) => {
        if (isMounted) {
          setInternalPageCount(count);
          setIsCalculatingPages(false);
        }
      })
      .catch((err) => {
        console.warn('Could not determine PDF page count:', err);
        if (isMounted) {
          setInternalPageCount(1);
          setIsCalculatingPages(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [file, pageCount, isPDF]);

  const handleClick = () => {
    if (!file) {
      fileInputRef.current?.click();
    }
  };

  const validateAndSelect = (selectedFile: File) => {
    setErrorMsg(null);
    if (selectedFile.size > 15 * 1024 * 1024) {
      setErrorMsg('File exceeds 15MB limit');
      return;
    }
    onFileSelect(selectedFile);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      validateAndSelect(selectedFile);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDragging) setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) {
      validateAndSelect(droppedFile);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === undefined || bytes === null || isNaN(bytes) || bytes <= 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.min(Math.floor(Math.log(bytes) / Math.log(k)), sizes.length - 1);
    const val = bytes / Math.pow(k, i);
    const formatted = i === 0 ? Math.round(val).toString() : val.toFixed(1).replace(/\.0$/, '');
    return `${formatted} ${sizes[i]}`;
  };

  const resolvedPages = internalPageCount ?? (typeof pageCount === 'number' && pageCount > 0 ? pageCount : null);

  return (
    <div 
      onClick={handleClick}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`group flex-1 min-w-0 w-full h-[180px] lg:h-[200px] bg-white border-2 border-dashed rounded-[24px] lg:rounded-[28px] p-4 lg:p-6 flex flex-col items-center justify-center transition-all duration-200 shadow-xs relative select-none ${
        file 
          ? 'border-[#D9D9D9] cursor-default' 
          : isDragging 
            ? 'border-[#FF5623] bg-[#FFF5F0] ring-4 ring-[#FF5623]/15 scale-[1.01] cursor-copy' 
            : 'border-[#D9D9D9] hover:border-[#FF5623]/70 hover:bg-[#FFFBF9] cursor-pointer'
      }`}
    >
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        className="hidden" 
        accept={acceptTypes}
      />

      {file ? (
        // Uploaded State matching actual design
        <div className="relative bg-[#FAFAFA] border border-[#EEEEEE] rounded-[18px] p-3 px-4 flex items-center gap-3.5 shadow-xs max-w-[90%]">
          {/* File Icon Badge */}
          {isPDF ? (
            <div className="w-9 h-11 bg-[#FF4B4B] text-white rounded-md flex flex-col items-center justify-center shrink-0 shadow-2xs">
              <FileText size={14} className="mb-0.5 opacity-90" />
              <span className="text-[9px] font-black tracking-wider leading-none">PDF</span>
            </div>
          ) : (
            <div className="w-9 h-11 bg-[#3B82F6] text-white rounded-md flex flex-col items-center justify-center shrink-0 shadow-2xs">
              <ImageIcon size={14} className="mb-0.5 opacity-90" />
              <span className="text-[9px] font-black tracking-wider leading-none">IMG</span>
            </div>
          )}
          
          {/* File Details */}
          <div className="flex flex-col items-start min-w-0 pr-2">
            <span className="text-[#1E1E1E] font-bold text-xs sm:text-[13px] truncate max-w-[160px] sm:max-w-[200px]">
              {file.name}
            </span>
            <div className="flex items-center gap-1.5 text-[11px] text-[#7A7A7A] font-medium mt-0.5">
              <span>{formatFileSize(file.size)}</span>
              <span>•</span>
              {isCalculatingPages && resolvedPages === null ? (
                <span className="animate-pulse text-[#FF5623]">Reading pages...</span>
              ) : (
                <span>
                  {resolvedPages !== null
                    ? `${resolvedPages} ${resolvedPages === 1 ? 'Page' : 'Pages'}`
                    : (isPDF ? 'PDF' : '1 Page')}
                </span>
              )}
            </div>
          </div>

          {/* Remove (x) Button placed at top-right corner of pill */}
          <button 
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
            title="Remove file"
            className="absolute -top-2.5 -right-2.5 bg-[#4A4A4A] hover:bg-[#1E1E1E] text-white rounded-full w-5 h-5 flex items-center justify-center transition-all shrink-0 shadow-sm hover:scale-110 active:scale-95 cursor-pointer"
          >
            <X size={11} strokeWidth={3} />
          </button>
        </div>
      ) : (
        // Empty State matching actual Figma design Image 1
        <div className="flex flex-col items-center justify-center text-center">
          {/* Upload Icon Container */}
          <div 
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '8px',
              padding: '4px',
              gap: '10px',
              backgroundColor: '#F3F3F3',
            }}
            className="group-hover:bg-[#FFF0EB] text-[#4A4A4A] group-hover:text-[#FF5623] flex items-center justify-center mb-2.5 transition-colors duration-200"
          >
            <Upload size={20} strokeWidth={2} />
          </div>

          <h3 
            style={{ 
              fontFamily: 'var(--font-bricolage), sans-serif',
              fontWeight: 600,
              fontSize: '20px',
              lineHeight: '22px',
              letterSpacing: '-0.06em',
              verticalAlign: 'middle',
            }}
            className="text-[#1E1E1E] mb-1"
          >
            {titlePrefix} <span className="text-[#FF5623]">{titleHighlight}</span>
          </h3>

          <p className="text-[11px] text-[#8E8E8E] font-medium">
            {errorMsg ? (
              <span className="text-red-500 font-semibold">{errorMsg}</span>
            ) : (
              'PDF or Images • Max 15MB'
            )}
          </p>
        </div>
      )}
    </div>
  );
}
