import React from 'react';

const COLORS = {
  'TAP': '#0cf3c7',
  'ADS': '#22c55e',
  'TON': '#3b82f6',
  'STARS': '#eab308',
  'REF_ADS': '#a855f7'
};

export function CloudWidget({ liveScore, animations }) {
  return (
    <div className="relative flex flex-col items-center justify-center z-20">
      <div 
        className="relative flex items-center justify-center select-none animate-breathe"
        style={{ width: '140px', height: '80px', filter: 'drop-shadow(0 10px 20px rgba(12, 243, 199, 0.15))' }}
      >
        <svg viewBox="0 0 200 130" className="absolute inset-0 w-full h-full drop-shadow-[0_0_8px_rgba(255,182,193,0.2)]" fill="none">
          <defs>
            <linearGradient id="cloud-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#d1d5db" />
              <stop offset="40%" stopColor="#9ca3af" />
              <stop offset="41%" stopColor="#fbcfe8" />
              <stop offset="100%" stopColor="#f472b6" />
            </linearGradient>
          </defs>
          <path d="M 50 95 C 30 95, 18 80, 22 60 C 12 45, 25 25, 48 30 C 58 12, 85 14, 95 28 C 110 10, 145 10, 155 32 C 172 26, 188 42, 182 62 C 192 78, 175 95, 155 95 Z" fill="#fafafa" stroke="url(#cloud-grad)" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none mt-1 z-10">
          <span className="text-center font-extrabold font-mono tracking-tighter text-[#ff5c84] leading-none" style={{ fontSize: '17px' }}>
            {Number(liveScore).toFixed(3)}
          </span>
          <span className="text-[8px] font-extrabold font-mono text-[#00f3c7] leading-none mt-1 uppercase tracking-widest">
            LIVE SCORE
          </span>
        </div>
      </div>

      <div className="absolute top-full mt-1 flex flex-col items-center pointer-events-none">
        {animations.map(anim => (
          <div 
            key={anim.id} 
            className="text-[13px] font-black font-mono animate-float-up drop-shadow-md whitespace-nowrap"
            style={{ color: COLORS[anim.type] || '#0cf3c7', textShadow: `0 0 8px ${COLORS[anim.type] || '#0cf3c7'}80` }}
          >
            {anim.val}
          </div>
        ))}
      </div>
    </div>
  );
}
