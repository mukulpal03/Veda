import React from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { Sparkles } from 'lucide-react';

export default function ExtractingPage() {
  return (
    <div className="flex flex-col lg:flex-row min-h-screen lg:h-screen bg-gradient-to-br from-[#EAEAEA] to-[#D5D5D5] p-4 lg:p-[12px] gap-4 lg:gap-[12px] overflow-auto font-sans font-geist-sans">
      <Sidebar />
      <main className="flex-1 flex flex-col relative overflow-auto min-h-full lg:h-full gap-4 lg:gap-[12px]">
        <Header />
        
        {/* Extracting UI */}
        <div className="flex-1 w-full lg:w-[1103px] h-auto lg:min-h-[694px] bg-white rounded-[30px] lg:rounded-[40px] flex flex-col items-center justify-center p-8 z-10 relative shadow-sm">
          <div className="flex flex-col items-center justify-center animate-pulse">
            <div className="relative mb-6 flex items-center justify-center">
              {/* Custom styled sparkles matching screenshot */}
              <div className="absolute top-0 right-[-10px] transform translate-x-2 -translate-y-2">
                <Sparkles size={24} strokeWidth={0} className="text-[#FF9D7A] fill-[#FF9D7A]" />
              </div>
              <Sparkles 
                size={80} 
                strokeWidth={0}
                className="text-[#FF5B22] fill-[#FF5B22]" 
              />
              <div className="absolute bottom-[-10px] left-[-10px] transform -translate-x-4 translate-y-2">
                <Sparkles size={36} strokeWidth={0} className="text-[#FF7D4A] fill-[#FF7D4A]" />
              </div>
            </div>
            
            <h2 className="text-2xl font-bold text-gray-900 tracking-tight mb-2">
              Extracting...
            </h2>
            <p className="text-gray-400 font-medium">
              This may take a while
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
