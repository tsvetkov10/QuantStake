import React from 'react';
import Logo from './Logo';

export default function BrandLogo({ size = 36, animated = false, className = '' }) {
  // Calculate relative sizes to ensure perfect alignment at any scale
  const fontSize = size * 0.75;
  const overlap = size * 0.15; // Negative margin to pull the 'u' close to the 'Q'

  return (
    <div className={`flex items-center ${className} ${animated ? 'brand-logo-animated' : ''}`} style={{ userSelect: 'none', cursor: 'pointer', position: 'relative' }}>
      <div style={{ marginRight: `-${overlap}px`, zIndex: 10 }}>
        <Logo size={size} animated={false} />
      </div>
      <span 
        className="text-gradient" 
        style={{ 
          fontSize: `${fontSize}px`, 
          fontWeight: '800', 
          margin: 0, 
          letterSpacing: '0.5px',
          lineHeight: 1,
          fontFamily: 'var(--font-primary, sans-serif)',
          zIndex: 1,
          transform: 'translateY(3%)' // Optical alignment adjustment
        }}
      >
        uantStake
      </span>
    </div>
  );
}
