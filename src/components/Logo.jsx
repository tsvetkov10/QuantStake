import React from 'react';

export default function Logo({ size = 32, animated = false }) {
  return (
    <div className="logo-container" style={{ width: size, height: size, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <svg viewBox="0 0 100 100" width="100%" height="100%" fill="none" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round" style={{ overflow: 'visible' }}>
        <defs>
          <linearGradient id="logo-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="100%" stopColor="#94A3B8" />
          </linearGradient>
        </defs>
        {/* Deep Violet Gradient Background Circle */}
        <circle cx="50" cy="50" r="46" fill="url(#logo-grad)" stroke="#ffffff" strokeWidth="4" />
        
        {/* 4-Pointed Sparkle Star */}
        <path d="M50 15 C55 40 60 45 85 50 C60 55 55 60 50 85 C45 60 40 55 15 50 C40 45 45 40 50 15 Z" fill="#ffffff" />
      </svg>
    </div>
  );
}
