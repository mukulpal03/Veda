"use client";

import React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ClipboardList,
  HelpCircle,
  Bell,
  Sparkles,
  ChevronDown,
  Menu,
} from "lucide-react";

export default function Header() {
  const router = useRouter();

  return (
    <header className="flex items-center justify-between px-4 lg:px-6 bg-white rounded-[18px] lg:rounded-[20px] shadow-xs w-full h-[56px] shrink-0 relative z-10 border border-white/60">
      <div className="flex items-center gap-2 lg:gap-4 text-gray-500">
        <button
          onClick={() => router.push("/")}
          className="hover:bg-gray-100 p-2 rounded-full transition-colors cursor-pointer"
          title="Back"
        >
          <ArrowLeft size={20} strokeWidth={1.5} />
        </button>
        {/* Mobile Logo */}
        <div className="flex lg:hidden items-center gap-[9px]">
          <div className="w-[40px] h-[40px] rounded-[12px] flex items-center justify-center overflow-hidden shrink-0 border border-gray-100 bg-white shadow-xs">
            <Image 
              src="/veda.avif" 
              alt="VedaAI Logo" 
              width={40} 
              height={40} 
              className="w-full h-full object-contain"
            />
          </div>
          <span className="font-bold text-lg tracking-tight text-[#2C2C2C]">
            VedaAI
          </span>
        </div>
        {/* Desktop Breadcrumb */}
        <div className="hidden lg:flex items-center gap-2">
          <ClipboardList size={18} strokeWidth={1.5} />
          <span className="font-medium text-gray-600">Exams</span>
        </div>
      </div>

      <div className="flex items-center gap-3 lg:gap-5">
        <div className="flex items-center gap-3 lg:gap-4 text-gray-600">
          <button className="hidden lg:block hover:text-gray-900 transition-colors cursor-pointer">
            <HelpCircle size={22} strokeWidth={1.5} />
          </button>

          <button className="hover:text-gray-900 transition-colors relative cursor-pointer">
            <Bell size={22} strokeWidth={1.5} />
            <span className="absolute top-0 right-0.5 w-2 h-2 bg-[#E96A44] rounded-full border border-white"></span>
          </button>

          <button className="hidden lg:block hover:text-gray-900 transition-colors cursor-pointer">
            <Sparkles size={22} strokeWidth={1.5} />
          </button>
        </div>

        <div className="hidden lg:block h-6 w-px bg-gray-200 mx-1"></div>

        <button className="flex items-center gap-3 hover:bg-gray-50 px-1 lg:px-2 py-1.5 rounded-full transition-colors cursor-pointer">
          <div className="w-8 h-8 bg-gray-200 rounded-full overflow-hidden flex items-center justify-center border border-white shadow-sm shrink-0">
            <div className="w-full h-full bg-orange-100 flex items-center justify-center text-orange-800 font-bold text-xs">
              MR
            </div>
          </div>
          <span className="hidden lg:block text-sm font-semibold text-gray-800 whitespace-nowrap">
            Mukul Pal
          </span>
          <ChevronDown
            size={16}
            className="hidden lg:block text-gray-500"
            strokeWidth={2}
          />
        </button>

        {/* Mobile Hamburger Menu */}
        <button className="block lg:hidden hover:bg-gray-100 p-1.5 rounded-full transition-colors text-gray-600 cursor-pointer">
          <Menu size={22} strokeWidth={1.5} />
        </button>
      </div>
    </header>
  );
}
