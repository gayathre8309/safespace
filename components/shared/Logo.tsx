
import React from 'react';

interface LogoProps {
  className?: string;
}

const Logo: React.FC<LogoProps> = ({ className = 'h-12 w-auto' }) => {
  return (
    <div className="flex items-center space-x-2">
      <svg
        className={className}
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style={{ stopColor: '#3b82f6', stopOpacity: 1 }} />
            <stop offset="100%" style={{ stopColor: '#60a5fa', stopOpacity: 1 }} />
          </linearGradient>
        </defs>
        <path
          d="M24 4C14.059 4 6 11.432 6 20.692c0 6.44 3.75 12.11 9.18 14.892l7.636 3.818a2 2 0 001.368 0l7.636-3.818C40.25 32.802 44 27.132 44 20.692 44 11.432 35.941 4 24 4z"
          fill="url(#logoGradient)"
        />
        <path
          d="M24 16v16m8-8H16"
          stroke="white"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <span className="text-2xl font-bold text-slate-700">SafeSpace+</span>
    </div>
  );
};

export default Logo;
