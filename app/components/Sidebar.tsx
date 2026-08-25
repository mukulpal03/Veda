import React from 'react';
import { LayoutGrid, Library, FileText, ClipboardList, Settings, Sparkles, Sidebar as SidebarIcon, BookOpen } from 'lucide-react';
import Image from 'next/image';

export default function Sidebar() {
  return (
    <aside className="hidden lg:flex w-[304px] h-[763px] bg-white flex-col justify-between rounded-[16px] p-6 z-20 shrink-0 shadow-[0px_32px_48px_0px_rgba(0,0,0,0.2),0px_16px_48px_0px_rgba(0,0,0,0.12)]">
      {/* Header Logo */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          {/* Logo Icon */}
          <div className="w-8 h-8 bg-[#2C2C2C] rounded-lg flex items-center justify-center text-white font-bold text-lg">
            V
          </div>
          <span className="font-bold text-xl tracking-tight text-[#2C2C2C]">VedaAI</span>
        </div>
        <button className="text-gray-400 hover:text-gray-600 transition-colors">
          <SidebarIcon size={20} strokeWidth={1.5} />
        </button>
      </div>

      {/* AI Toolkit Button */}
      <div className="pb-6">
        <button className="w-full bg-gradient-to-r from-[#2a2a2a] to-[#3a3a3a] hover:from-[#202020] hover:to-[#2a2a2a] text-white rounded-full py-2.5 px-4 flex items-center justify-center gap-2 text-sm font-medium transition-colors shadow-md border border-[#E96A44]">
          <Sparkles size={16} className="text-white fill-white" />
          AI Teacher's Toolkit
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1">
        <NavItem icon={<LayoutGrid size={20} strokeWidth={1.5} />} label="Home" />
        <NavItem icon={<Library size={20} strokeWidth={1.5} />} label="My Classroom" />
        <NavItem icon={<FileText size={20} strokeWidth={1.5} />} label="Assignments" />
        <NavItem icon={<ClipboardList size={20} strokeWidth={1.5} />} label="Exams" active />
        <NavItem icon={<BookOpen size={20} strokeWidth={1.5} />} label="My Library" />
      </nav>

      {/* Footer Area */}
      <div className="mt-auto pt-6">
        <div className="mb-4 flex items-center gap-3 text-gray-500 hover:text-gray-900 cursor-pointer py-2 text-sm transition-colors font-medium">
          <Settings size={20} strokeWidth={1.5} />
          <span>Settings</span>
        </div>
        
        {/* School Profile Card */}
        <div className="w-[256px] h-[84px] bg-[#F0F0F0] rounded-[16px] p-[12px] flex items-center gap-[16px] shrink-0">
          <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm overflow-hidden border border-gray-100 flex-shrink-0">
            {/* Placeholder for school logo */}
            <div className="text-green-700 font-bold flex flex-col items-center">
              <span className="text-[10px] leading-tight">DPS</span>
            </div>
          </div>
          <div className="flex flex-col overflow-hidden">
            <span className="text-sm font-semibold text-gray-900 truncate">Delhi Public School</span>
            <span className="text-xs text-gray-500 truncate">Bokaro Steel City</span>
          </div>
        </div>
      </div>
    </aside>
  );
}

function NavItem({ icon, label, active = false }: { icon: React.ReactNode; label: string; active?: boolean }) {
  return (
    <a
      href="#"
      className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
        active 
          ? 'bg-[#F2F2F2] text-gray-900' 
          : 'text-[#8A8A8A] hover:bg-gray-50 hover:text-gray-900'
      }`}
    >
      {icon}
      <span>{label}</span>
    </a>
  );
}
