"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import { 
  LayoutGrid, 
  Library, 
  FileText, 
  ClipboardList, 
  Settings, 
  Sparkles, 
  Sidebar as SidebarIcon, 
  BookOpen,
  ChevronsRight
} from 'lucide-react';

export default function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <aside
      className={`hidden lg:flex flex-col justify-between bg-white rounded-[22px] lg:rounded-[24px] z-20 shrink-0 shadow-[0px_4px_24px_rgba(0,0,0,0.04)] border border-white/60 transition-all duration-300 ease-in-out overflow-hidden ${
        isCollapsed ? 'w-[76px] items-center px-0 py-4 lg:py-5' : 'w-[280px] xl:w-[290px] p-4 lg:p-5'
      } h-full min-h-[680px]`}
    >
      {/* Top Section */}
      <div className="w-full flex flex-col items-center">
        {/* Header Logo & Collapse Button */}
        <div className={`w-full flex items-center mb-5 ${isCollapsed ? 'justify-center px-0' : 'justify-between'}`}>
          <div 
            onClick={() => isCollapsed && setIsCollapsed(false)}
            className={`flex items-center ${isCollapsed ? 'justify-center cursor-pointer' : 'gap-[9px]'}`}
            title={isCollapsed ? "Click to expand" : "VedaAI"}
          >
            <div className="w-[40px] h-[40px] min-w-[40px] min-h-[40px] rounded-[12px] flex items-center justify-center overflow-hidden shrink-0 shadow-xs border border-gray-100 bg-white mx-auto">
              <Image 
                src="/veda.avif" 
                alt="VedaAI Logo" 
                width={40} 
                height={40} 
                className="w-full h-full object-contain"
                priority
              />
            </div>
            {!isCollapsed && (
              <span className="font-bold text-xl tracking-tight text-[#2C2C2C] whitespace-nowrap">
                VedaAI
              </span>
            )}
          </div>
          
          {!isCollapsed && (
            <button
              onClick={() => setIsCollapsed(true)}
              className="text-gray-400 hover:text-gray-700 p-1.5 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer shrink-0"
              title="Collapse sidebar"
            >
              <SidebarIcon size={19} strokeWidth={1.5} />
            </button>
          )}
        </div>

        {/* AI Toolkit Button */}
        <div className="w-full pb-5 flex justify-center items-center">
          <button
            onClick={() => isCollapsed && setIsCollapsed(false)}
            style={{
              width: isCollapsed ? '42px' : '251px',
              height: '42px',
              minWidth: isCollapsed ? '42px' : undefined,
              minHeight: '42px',
              borderRadius: '100px',
              paddingTop: isCollapsed ? '0px' : '8px',
              paddingRight: isCollapsed ? '0px' : '43px',
              paddingBottom: isCollapsed ? '0px' : '8px',
              paddingLeft: isCollapsed ? '0px' : '43px',
              gap: isCollapsed ? '0px' : '10px',
              background: 'linear-gradient(#272727, #272727) padding-box, linear-gradient(180deg, #FF7950 0%, #C0350A 100%) border-box',
              border: '4px solid transparent',
              boxShadow: '0px 32px 48px 0px rgba(255, 255, 255, 0.2), 0px 16px 48px 0px rgba(255, 255, 255, 0.12), 0px 0px 34.5px 0px rgba(255, 255, 255, 0.25) inset, 0px -1px 3.5px 0px rgba(177, 177, 177, 0.6) inset',
            }}
            className={`flex items-center justify-center text-white text-xs font-semibold whitespace-nowrap cursor-pointer transition-all duration-300 ease-in-out overflow-hidden mx-auto shrink-0 ${
              isCollapsed
                ? 'w-[42px] h-[42px] hover:scale-105'
                : 'w-[251px] hover:opacity-95'
            }`}
            title={isCollapsed ? "AI Teacher's Toolkit (Click to expand)" : "AI Teacher's Toolkit"}
          >
            <Sparkles size={16} className="text-white fill-white shrink-0" />
            {!isCollapsed && (
              <span className="whitespace-nowrap overflow-hidden">
                AI Teacher&apos;s Toolkit
              </span>
            )}
          </button>
        </div>

        {/* Navigation */}
        <nav className="w-full space-y-1.5 flex flex-col items-center justify-center">
          <NavItem 
            icon={<LayoutGrid size={20} strokeWidth={1.5} />} 
            label="Home" 
            isCollapsed={isCollapsed} 
          />
          <NavItem 
            icon={<Library size={20} strokeWidth={1.5} />} 
            label="My Classroom" 
            isCollapsed={isCollapsed} 
          />
          <NavItem 
            icon={<FileText size={20} strokeWidth={1.5} />} 
            label="Assignments" 
            isCollapsed={isCollapsed} 
          />
          <NavItem 
            icon={<ClipboardList size={20} strokeWidth={1.5} />} 
            label="Exams" 
            active 
            isCollapsed={isCollapsed} 
          />
          <NavItem 
            icon={<BookOpen size={20} strokeWidth={1.5} />} 
            label="My Library" 
            isCollapsed={isCollapsed} 
          />
        </nav>
      </div>

      {/* Footer Area */}
      <div className="w-full flex flex-col items-center pt-4">
        {!isCollapsed && (
          <div className="w-full flex items-center gap-3 text-gray-500 hover:text-gray-900 cursor-pointer text-sm font-medium py-2 px-3 mb-3">
            <Settings size={20} strokeWidth={1.5} className="shrink-0" />
            <span className="whitespace-nowrap">Settings</span>
          </div>
        )}

        {/* School Profile Card / Badge */}
        {isCollapsed ? (
          <div className="flex flex-col items-center gap-3 mx-auto">
            <div 
              className="w-10 h-10 min-w-10 min-h-10 bg-[#F0F0F0] rounded-full flex items-center justify-center shadow-xs border border-gray-200 shrink-0 cursor-pointer hover:border-gray-300 transition-all mx-auto"
              onClick={() => setIsCollapsed(false)}
              title="Delhi Public School • Bokaro Steel City"
            >
              <span className="text-green-700 font-bold text-xs">DPS</span>
            </div>

            {/* Reopen Sidebar Double-Arrow Button */}
            <button
              onClick={() => setIsCollapsed(false)}
              className="w-9 h-9 flex items-center justify-center rounded-xl bg-gray-100 hover:bg-[#FFF0EB] text-[#4A4A4A] hover:text-[#FF5623] transition-all cursor-pointer shadow-2xs hover:scale-105 active:scale-95 mx-auto"
              title="Expand sidebar"
            >
              <ChevronsRight size={18} strokeWidth={2.5} />
            </button>
          </div>
        ) : (
          <div className="w-full bg-[#F0F0F0] rounded-[16px] p-2.5 sm:p-3 flex items-center gap-3">
            <div className="w-10 h-10 min-w-10 min-h-10 bg-white rounded-full flex items-center justify-center shadow-xs border border-gray-100 shrink-0">
              <span className="text-green-700 font-bold text-xs">DPS</span>
            </div>
            <div className="flex flex-col justify-center min-w-0 flex-1 overflow-hidden">
              <span className="text-sm font-semibold text-gray-900 truncate leading-tight">Delhi Public School</span>
              <span className="text-xs text-gray-500 truncate leading-tight mt-0.5">Bokaro Steel City</span>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}

function NavItem({ 
  icon, 
  label, 
  active = false, 
  isCollapsed = false 
}: { 
  icon: React.ReactNode; 
  label: string; 
  active?: boolean; 
  isCollapsed?: boolean; 
}) {
  return (
    <a
      href="#"
      title={label}
      className={`flex items-center rounded-xl transition-all duration-200 ${
        isCollapsed 
          ? 'w-10 h-10 min-w-10 min-h-10 justify-center items-center p-0 mx-auto' 
          : 'w-full px-4 py-2.5 gap-3 text-sm font-medium'
      } ${
        active 
          ? 'bg-[#F2F2F2] text-[#1E1E1E] font-semibold shadow-2xs' 
          : 'text-[#8A8A8A] hover:bg-gray-50 hover:text-gray-900'
      }`}
    >
      <span className="shrink-0 flex items-center justify-center w-5 h-5">{icon}</span>
      {!isCollapsed && (
        <span className="whitespace-nowrap overflow-hidden truncate">
          {label}
        </span>
      )}
    </a>
  );
}
