"use client";

import React, { useState } from 'react';
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
      className={`hidden lg:flex flex-col justify-between bg-white rounded-[22px] lg:rounded-[24px] p-4 lg:p-5 z-20 shrink-0 shadow-[0px_4px_24px_rgba(0,0,0,0.04)] border border-white/60 transition-all duration-300 ${
        isCollapsed ? 'w-[76px] items-center px-3' : 'w-[280px] xl:w-[290px]'
      } h-full min-h-[680px]`}
    >
      {/* Top Section */}
      <div className="w-full flex flex-col items-center">
        {/* Header Logo & Collapse Button */}
        <div className={`w-full flex items-center justify-between mb-5 ${isCollapsed ? 'justify-center' : ''}`}>
          <div 
            onClick={() => isCollapsed && setIsCollapsed(false)}
            className={`flex items-center gap-2.5 ${isCollapsed ? 'cursor-pointer' : ''}`}
            title={isCollapsed ? "Click to expand" : "VedaAI"}
          >
            <div className="w-9 h-9 bg-[#2C2C2C] rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-sm shrink-0">
              V
            </div>
            {!isCollapsed && (
              <span className="font-bold text-xl tracking-tight text-[#2C2C2C]">
                VedaAI
              </span>
            )}
          </div>
          
          <button
            onClick={() => setIsCollapsed((prev) => !prev)}
            className="text-gray-400 hover:text-gray-700 p-1.5 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
            title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            <SidebarIcon size={19} strokeWidth={1.5} />
          </button>
        </div>

        {/* AI Toolkit Button */}
        <div className="w-full pb-5 flex justify-center">
          {isCollapsed ? (
            <button 
              onClick={() => setIsCollapsed(false)}
              className="w-10 h-10 rounded-full bg-[#242424] border-2 border-[#FF5623] flex items-center justify-center text-[#FF5623] shadow-md hover:scale-105 transition-transform cursor-pointer"
              title="AI Teacher's Toolkit"
            >
              <Sparkles size={18} className="fill-[#FF5623]" />
            </button>
          ) : (
            <button className="w-full bg-gradient-to-r from-[#2a2a2a] to-[#3a3a3a] hover:from-[#202020] hover:to-[#2a2a2a] text-white rounded-full py-2.5 px-4 flex items-center justify-center gap-2 text-sm font-medium transition-colors shadow-md border border-[#E96A44] cursor-pointer">
              <Sparkles size={16} className="text-white fill-white" />
              AI Teacher&apos;s Toolkit
            </button>
          )}
        </div>

        {/* Navigation */}
        <nav className="w-full space-y-1 flex flex-col items-center">
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
          <div className="w-full mb-3 flex items-center gap-3 text-gray-500 hover:text-gray-900 cursor-pointer py-2 px-3 text-sm transition-colors font-medium">
            <Settings size={20} strokeWidth={1.5} />
            <span>Settings</span>
          </div>
        )}

        {/* School Profile Card / Badge */}
        {isCollapsed ? (
          <div className="flex flex-col items-center gap-2.5">
            <div 
              className="w-10 h-10 bg-[#F0F0F0] rounded-full flex items-center justify-center shadow-xs border border-gray-200 overflow-hidden cursor-pointer"
              title="Delhi Public School • Bokaro Steel City"
              onClick={() => setIsCollapsed(false)}
            >
              <span className="text-green-700 font-bold text-[10px]">DPS</span>
            </div>

            {/* Expand Toggle Button */}
            <button
              onClick={() => setIsCollapsed(false)}
              className="text-gray-400 hover:text-gray-700 p-1 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
              title="Expand sidebar"
            >
              <ChevronsRight size={17} />
            </button>
          </div>
        ) : (
          <div className="w-full bg-[#F0F0F0] rounded-[16px] p-3 flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-xs border border-gray-100 shrink-0">
              <span className="text-green-700 font-bold text-xs">DPS</span>
            </div>
            <div className="flex flex-col overflow-hidden">
              <span className="text-sm font-semibold text-gray-900 truncate">Delhi Public School</span>
              <span className="text-xs text-gray-500 truncate">Bokaro Steel City</span>
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
      className={`flex items-center gap-3 rounded-xl transition-all ${
        isCollapsed 
          ? 'w-10 h-10 justify-center' 
          : 'w-full px-4 py-2.5 text-sm font-medium'
      } ${
        active 
          ? 'bg-[#F2F2F2] text-[#1E1E1E] font-semibold' 
          : 'text-[#8A8A8A] hover:bg-gray-50 hover:text-gray-900'
      }`}
    >
      <span className="shrink-0">{icon}</span>
      {!isCollapsed && <span className="truncate">{label}</span>}
    </a>
  );
}
