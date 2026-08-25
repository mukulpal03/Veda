"use client";

import React, { useRef } from 'react';
import { Upload, X } from 'lucide-react';

interface UploadCardProps {
  titlePrefix: string;
  titleHighlight: string;
  file: File | null;
  onFileSelect: (file: File) => void;
  onRemove: () => void;
}

export default function UploadCard({ 
  titlePrefix, 
  titleHighlight, 
  file, 
  onFileSelect, 
  onRemove 
}: UploadCardProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleClick = () => {
    if (!file) {
      fileInputRef.current?.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      onFileSelect(selectedFile);
    }
    // Reset input so the same file can be uploaded again if removed
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + sizes[i];
  };

  return (
    <div 
      onClick={handleClick}
      className={`flex-1 min-w-0 w-full h-[180px] lg:h-[240px] bg-white border-2 border-dashed border-gray-200 rounded-[30px] lg:rounded-[40px] p-6 lg:p-10 flex flex-col items-center justify-center transition-all shadow-sm relative ${
        !file ? 'cursor-pointer hover:border-[#E96A44]/50 hover:bg-[#FFF6F4]' : ''
      }`}
    >
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        className="hidden" 
        accept=".pdf"
      />

      {file ? (
        // Uploaded State
        <div className="w-full bg-[#F6F6F6] rounded-[24px] p-5 flex items-center justify-center gap-4 relative">
          {/* PDF Icon */}
          <div className="bg-[#EB4C4C] text-white w-10 h-12 rounded-lg rounded-tr-2xl flex items-end pb-1 justify-center flex-shrink-0 relative">
             {/* Folded corner illusion */}
             <div className="absolute top-0 right-0 w-3 h-3 bg-white/30 rounded-bl-lg"></div>
             <span className="text-[10px] font-bold tracking-wider">PDF</span>
          </div>
          
          {/* File Info */}
          <div className="flex flex-col items-start min-w-0 pr-2">
            <span className="text-gray-900 font-bold text-[15px] truncate max-w-[200px]">{file.name}</span>
            <span className="text-gray-500 text-xs font-medium mt-0.5">{formatFileSize(file.size)} • 2 Pages</span>
          </div>

          {/* Remove Button */}
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
            className="absolute -top-3 -right-3 bg-[#545454] hover:bg-[#2C2C2C] text-white rounded-full p-1.5 transition-colors border-[3px] border-white shadow-sm"
          >
            <X size={14} strokeWidth={2.5} />
          </button>
        </div>
      ) : (
        // Empty State
        <>
          <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mb-6 text-gray-700">
            <Upload size={24} strokeWidth={2} />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">
            {titlePrefix} <span className="text-[#E96A44]">{titleHighlight}</span>
          </h3>
          <p className="text-sm text-gray-400 font-medium">Max 10MB</p>
        </>
      )}
    </div>
  );
}
