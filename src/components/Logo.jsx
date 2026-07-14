import React from 'react';

export default function Logo({ size = 32, animated = false }) {
  return (
    <div className="logo-container" style={{ width: size, height: size, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <svg viewBox="0 0 100 100" width="100%" height="100%" fill="none" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round" style={{ overflow: 'visible' }}>
        <defs>
          <linearGradient id="logo-grad" x1="0%" y1="0%" x2="200%" y2="0%">
            <stop offset="0%" stopColor="#00f3ff" />
            <stop offset="25%" stopColor="#a13bf7" />
            <stop offset="50%" stopColor="#ff00ea" />
            <stop offset="75%" stopColor="#00f3ff" />
            <stop offset="100%" stopColor="#a13bf7" />
            {animated && (
              <animate attributeName="x1" values="0%;-200%" dur="4s" repeatCount="indefinite" linear="true" />
            )}
            {animated && (
              <animate attributeName="x2" values="200%;0%" dur="4s" repeatCount="indefinite" linear="true" />
            )}
          </linearGradient>
        </defs>
        <g stroke="url(#logo-grad)">
          {/* Outer Circle of Q */}
          <circle cx="45" cy="45" r="28" />
          {/* Inner Circle of Q */}
          <circle cx="45" cy="45" r="12" />
          {/* Connecting Tail (Outer) */}
          <path d="M 64 64 Q 78 72 85 85" />
          {/* Connecting Tail (Inner) */}
          <path d="M 53 53 Q 59 58 64 64" />
        </g>
      </svg>
    </div>
  );
}
