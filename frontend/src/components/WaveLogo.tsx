// frontend/src/components/WaveLogo.tsx
import React from 'react';

export const WaveLogo: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => {
  return (
    <div className={`relative overflow-hidden flex items-center justify-center ${className}`}>
      <svg
        viewBox="0 0 100 60"
        className="w-full h-full text-[#6c6c6c]"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Animated Background Sine Wave */}
        <path
          d="M -20 30 Q 5 15, 30 30 T 80 30 T 130 30"
          stroke="currentColor"
          strokeWidth="6"
          strokeLinecap="round"
          opacity="0.4"
          className="animate-wave-motion"
        />
        {/* Animated Foreground Main Wave */}
        <path
          d="M -20 30 Q 5 45, 30 30 T 80 30 T 130 30"
          stroke="#ffffff"
          strokeWidth="7"
          strokeLinecap="round"
          className="animate-wave-motion"
          style={{ animationDelay: '-1.5s' }}
        />
      </svg>
    </div>
  );
};
