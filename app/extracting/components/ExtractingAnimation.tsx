"use client";

import React from 'react';

export default function ExtractingAnimation() {
  return (
    <div className="relative mb-6 lg:mb-8 flex items-center justify-center">
      {/* Background Soft Ambient Glow */}
      <div className="absolute w-32 h-32 lg:w-40 lg:h-40 rounded-full bg-[#FF5623]/8 blur-2xl animate-pulse -z-10" />

      {/* Standalone Sparkle Cluster */}
      <div className="relative flex items-center justify-center">
        
        {/* Top-Right Small Floating Sparkle */}
        <div className="absolute -top-3 -right-3 animate-bounce [animation-duration:2.5s]">
          <svg 
            width="28" 
            height="28" 
            viewBox="0 0 24 24" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
            className="text-[#FFA88B] drop-shadow-sm"
          >
            <path 
              d="M12 0C12 6.62742 17.3726 12 24 12C17.3726 12 12 17.3726 12 24C12 17.3726 6.62742 12 0 12C6.62742 12 12 6.62742 12 0Z" 
              fill="currentColor"
            />
          </svg>
        </div>

        {/* Center Primary Large Sparkle */}
        <div className="relative animate-[pulse_2s_cubic-bezier(0.4,0,0.6,1)_infinite]">
          <svg 
            width="88" 
            height="88" 
            viewBox="0 0 24 24" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
            className="drop-shadow-[0_8px_20px_rgba(255,86,35,0.35)]"
          >
            <defs>
              <linearGradient id="sparkleGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FF7A4D" />
                <stop offset="100%" stopColor="#FF4A11" />
              </linearGradient>
            </defs>
            <path 
              d="M12 0C12 6.62742 17.3726 12 24 12C17.3726 12 12 17.3726 12 24C12 17.3726 6.62742 12 0 12C6.62742 12 12 6.62742 12 0Z" 
              fill="url(#sparkleGradient)"
            />
          </svg>
        </div>

        {/* Bottom-Left Medium Sparkle */}
        <div className="absolute -bottom-3 -left-3 animate-pulse [animation-duration:1.8s]">
          <svg 
            width="36" 
            height="36" 
            viewBox="0 0 24 24" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
            className="text-[#FF855E] drop-shadow-sm"
          >
            <path 
              d="M12 0C12 6.62742 17.3726 12 24 12C17.3726 12 12 17.3726 12 24C12 17.3726 6.62742 12 0 12C6.62742 12 12 6.62742 12 0Z" 
              fill="currentColor"
            />
          </svg>
        </div>

      </div>
    </div>
  );
}
