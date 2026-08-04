import React from 'react';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  showText?: boolean;
  layout?: 'horizontal' | 'vertical' | 'badge-only';
}

export const Logo: React.FC<LogoProps> = ({
  className = '',
  size = 'md',
  showText = true,
  layout = 'horizontal',
}) => {
  // Dimensions for badge
  const sizeMap = {
    sm: { badge: 'w-8 h-8', font: 'text-sm' },
    md: { badge: 'w-12 h-12', font: 'text-lg' },
    lg: { badge: 'w-16 h-16', font: 'text-2xl' },
    xl: { badge: 'w-24 h-24', font: 'text-3xl' },
    '2xl': { badge: 'w-36 h-36', font: 'text-4xl' },
  };

  const badgeSize = sizeMap[size].badge;

  if (layout === 'badge-only') {
    return (
      <div className={`relative flex items-center justify-center ${badgeSize} ${className}`}>
        <LogoBadge />
      </div>
    );
  }

  if (layout === 'vertical') {
    return (
      <div className={`flex flex-col items-center text-center gap-3 ${className}`}>
        <div className={`relative flex items-center justify-center ${badgeSize}`}>
          <LogoBadge />
        </div>
        {showText && (
          <div className="flex flex-col items-center">
            <div className="flex items-center text-2xl sm:text-3xl font-black tracking-tight drop-shadow-md">
              <span className="text-amber-500">NTR-</span>
              <span className="text-emerald-400">Digi</span>
              <span className="text-white">Class</span>
            </div>
            <div className="flex items-center gap-2 text-[10px] sm:text-xs font-bold text-amber-400 uppercase tracking-widest mt-1">
              <span>LEARN</span>
              <span className="text-emerald-400">|</span>
              <span>KNOW</span>
              <span className="text-emerald-400">|</span>
              <span>GROW</span>
            </div>
            <div className="mt-1.5 px-3 py-0.5 rounded-full bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-slate-950 font-black text-[9px] sm:text-[10px] uppercase tracking-wider shadow-sm">
              DSC • APPSC • ALL COMPETITIVE
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className={`relative flex-shrink-0 flex items-center justify-center ${badgeSize}`}>
        <LogoBadge />
      </div>

      {showText && (
        <div className="flex flex-col">
          <div className="flex items-center font-black tracking-tight leading-none text-lg sm:text-2xl drop-shadow-md">
            <span className="text-amber-500">NTR-</span>
            <span className="text-emerald-400">Digi</span>
            <span className="text-white">Class</span>
          </div>
          <div className="flex items-center gap-1.5 text-[9px] sm:text-[10px] font-bold text-amber-300 uppercase tracking-wider mt-1">
            <span>LEARN</span>
            <span className="text-emerald-400 font-extrabold">•</span>
            <span>KNOW</span>
            <span className="text-emerald-400 font-extrabold">•</span>
            <span>GROW</span>
          </div>
        </div>
      )}
    </div>
  );
};

// Vector Badge SVG reproducing the logo artwork with precision
export const LogoBadge: React.FC<{ className?: string }> = ({ className = 'w-full h-full' }) => {
  return (
    <svg
      viewBox="0 0 200 200"
      className={`drop-shadow-xl ${className}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        {/* Outer Ring Gradients */}
        <linearGradient id="goldRing" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#F59E0B" />
          <stop offset="50%" stopColor="#FBBF24" />
          <stop offset="100%" stopColor="#D97706" />
        </linearGradient>

        <linearGradient id="innerGlow" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#1E293B" />
          <stop offset="100%" stopColor="#0F172A" />
        </linearGradient>

        <linearGradient id="capGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#F97316" />
          <stop offset="100%" stopColor="#D97706" />
        </linearGradient>

        <linearGradient id="bookGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FBBF24" />
          <stop offset="100%" stopColor="#F59E0B" />
        </linearGradient>

        <linearGradient id="textOrange" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#F97316" />
          <stop offset="100%" stopColor="#F59E0B" />
        </linearGradient>
      </defs>

      {/* Dark background circle */}
      <circle cx="100" cy="100" r="95" fill="url(#innerGlow)" stroke="#1E293B" strokeWidth="2" />

      {/* Outer Golden Ring */}
      <circle cx="100" cy="100" r="92" stroke="url(#goldRing)" strokeWidth="6" />
      <circle cx="100" cy="100" r="86" stroke="url(#goldRing)" strokeWidth="1.5" strokeDasharray="4 2" opacity="0.6" />

      {/* --- Floating Icons --- */}
      {/* Lightbulb (top-left) */}
      <g transform="translate(42, 38) scale(0.65)">
        <path d="M9 18h6m-5 3h4m-7-8a6 6 0 1110 0c0 2-1 3-2 4a3 3 0 01-2 2H10a3 3 0 01-2-2c-1-1-2-2-2-4z" stroke="#FBBF24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <line x1="12" y1="2" x2="12" y2="4" stroke="#FBBF24" strokeWidth="2" strokeLinecap="round" />
        <line x1="4" y1="8" x2="6" y2="9" stroke="#FBBF24" strokeWidth="2" strokeLinecap="round" />
      </g>

      {/* Microscope (middle-left) */}
      <g transform="translate(38, 72) scale(0.65)">
        <path d="M6 18h12M12 18v-4M8 14a4 4 0 014-4h2M12 6l3 3M10 4l5 5M12 2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V4a2 2 0 012-2z" stroke="#FBBF24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </g>

      {/* Globe Wireframe (top-right) */}
      <g transform="translate(138, 38) scale(0.65)">
        <circle cx="12" cy="12" r="9" stroke="#10B981" strokeWidth="2" />
        <ellipse cx="12" cy="12" rx="9" ry="4" stroke="#10B981" strokeWidth="1.5" />
        <line x1="12" y1="3" x2="12" y2="21" stroke="#10B981" strokeWidth="1.5" />
      </g>

      {/* University Columns (middle-right) */}
      <g transform="translate(142, 72) scale(0.65)">
        <path d="M4 22h16M2 6h20M12 2L2 6h20L12 2zM6 10v9M10 10v9M14 10v9M18 10v9" stroke="#FBBF24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </g>

      {/* --- Center Graphic: Graduation Cap, Globe, Book --- */}
      {/* Globe Center */}
      <circle cx="100" cy="80" r="22" fill="#10B981" opacity="0.9" />
      {/* Earth Continents (Stylized) */}
      <path d="M85 75c2-4 6-5 10-3 3 2 7 1 9-2 2 3 5 4 8 2 2 4 0 7-3 8-4 1-5 4-8 4-4 0-7-2-9-5z" fill="#047857" />
      <path d="M92 92c3-1 6 1 8 3 3 0 5-2 7-1 1 2-1 4-3 5-3 1-6 0-8-2-2 0-3-3-4-5z" fill="#047857" />
      {/* Globe Orbit Rings */}
      <circle cx="100" cy="80" r="26" stroke="#EF4444" strokeWidth="2.5" strokeDasharray="30 15" />
      <circle cx="100" cy="80" r="28" stroke="#FBBF24" strokeWidth="2" />

      {/* Graduation Cap (Mortarboard) */}
      <g id="gradCap">
        <path d="M100 42L138 56L100 70L62 56Z" fill="url(#capGrad)" stroke="#FBBF24" strokeWidth="1.5" />
        <path d="M78 63v12c0 4 10 8 22 8s22-4 22-8V63" fill="none" stroke="#D97706" strokeWidth="3" />
        {/* Tassel */}
        <path d="M66 58v18" stroke="#FBBF24" strokeWidth="2" strokeLinecap="round" />
        <circle cx="66" cy="78" r="2.5" fill="#FBBF24" />
      </g>

      {/* Open Book */}
      <g id="openBook">
        <path d="M100 115c-15-8-32-6-42 2v-16c10-8 27-10 42-2 15-8 32-6 42 2v16c-10-8-27-10-42-2z" fill="url(#bookGrad)" />
        <path d="M100 99v16" stroke="#B45309" strokeWidth="2" />
      </g>

      {/* --- Text Section --- */}
      {/* Main Text: NTR-DigiClass */}
      <g transform="translate(100, 138)" textAnchor="middle">
        <text fontFamily="sans-serif" fontWeight="900" fontSize="18" letterSpacing="-0.5">
          <tspan fill="url(#textOrange)">NTR-</tspan>
          <tspan fill="#10B981">Digi</tspan>
          <tspan fill="#FFFFFF">Class</tspan>
        </text>
      </g>

      {/* Slogan: LEARN | KNOW | GROW */}
      <path id="sloganArc" d="M 40 154 Q 100 162 160 154" fill="none" />
      <text fontSize="7.5" fontWeight="800" fill="#FBBF24" letterSpacing="1.2">
        <textPath href="#sloganArc" startOffset="50%" textAnchor="middle">
          LEARN  |  KNOW  |  GROW
        </textPath>
      </text>

      {/* Bottom Ribbon Banner: DSC • APPSC • ALL COMPETITIVE */}
      <g transform="translate(0, 10)">
        <path d="M 46 150 Q 100 178 154 150 Q 100 188 46 150 Z" fill="url(#goldRing)" stroke="#D97706" strokeWidth="1" />
        <path id="bannerArc" d="M 50 158 Q 100 182 150 158" fill="none" />
        <text fontSize="7" fontWeight="900" fill="#0F172A" letterSpacing="0.8">
          <textPath href="#bannerArc" startOffset="50%" textAnchor="middle">
            DSC • APPSC • ALL COMPETITIVE
          </textPath>
        </text>
      </g>
    </svg>
  );
};
