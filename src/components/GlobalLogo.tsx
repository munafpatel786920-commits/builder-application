import React from 'react';
import { motion } from 'motion/react';

interface GlobalLogoProps {
  className?: string;       // Outer container styles
  iconClassName?: string;   // Sizing class for the SVG icon (defaults to w-9 h-9)
  iconOnly?: boolean;       // If true, render ONLY the globe icon
  textColor?: 'dark' | 'light' | 'original'; // Text color variant
  onLightBg?: boolean;      // Optimize styling for light or dark backgrounds
}

export const GlobalLogo: React.FC<GlobalLogoProps> = ({
  className = '',
  iconClassName = 'w-10 h-10',
  iconOnly = false,
  textColor = 'original',
  onLightBg = true,
}) => {
  // Compute text color based on props
  const getTitleColor = () => {
    if (textColor === 'original') return onLightBg ? 'text-slate-900' : 'text-white';
    if (textColor === 'light') return 'text-white';
    return 'text-slate-900';
  };

  const getSubTitleColor = () => {
    if (textColor === 'original') return onLightBg ? 'text-slate-800' : 'text-slate-200';
    if (textColor === 'light') return 'text-slate-200';
    return 'text-slate-850';
  };

  const getSloganColor = () => {
    return onLightBg ? 'text-slate-500' : 'text-slate-400';
  };

  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      {/* Globe SVG Graphic */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className={`relative shrink-0 flex items-center justify-center ${iconClassName}`}
      >
        <svg 
          viewBox="0 0 100 100" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
        >
          <defs>
            {/* Bright cyan/teal to deep navy/royal blue linear gradient representing modern global software */}
            <linearGradient id="global-s-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#02f2fe" />
              <stop offset="50%" stopColor="#0072ff" />
              <stop offset="100%" stopColor="#0b2454" />
            </linearGradient>
            <linearGradient id="global-globe-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#00E5FF" />
              <stop offset="100%" stopColor="#0072ff" />
            </linearGradient>
          </defs>

          {/* Spherical grid patterns */}
          <circle 
            cx="50" 
            cy="50" 
            r="43" 
            fill="none" 
            stroke="url(#global-globe-grad)" 
            strokeWidth="1.5" 
            strokeOpacity="0.3" 
          />
          <circle 
            cx="50" 
            cy="50" 
            r="36" 
            fill="none" 
            stroke="url(#global-globe-grad)" 
            strokeWidth="1" 
            strokeDasharray="2 1.5" 
            strokeOpacity="0.25" 
          />
          
          {/* Longitude / Network Arcs */}
          <ellipse 
            cx="50" 
            cy="50" 
            rx="43" 
            ry="18" 
            fill="none" 
            stroke="url(#global-globe-grad)" 
            strokeWidth="1" 
            strokeOpacity="0.4" 
            transform="rotate(35 50 50)" 
          />
          <ellipse 
            cx="50" 
            cy="50" 
            rx="43" 
            ry="18" 
            fill="none" 
            stroke="url(#global-globe-grad)" 
            strokeWidth="1" 
            strokeOpacity="0.4" 
            transform="rotate(-35 50 50)" 
          />
          <ellipse 
            cx="50" 
            cy="50" 
            rx="43" 
            ry="26" 
            fill="none" 
            stroke="url(#global-globe-grad)" 
            strokeWidth="1" 
            strokeOpacity="0.4" 
            transform="rotate(75 50 50)" 
          />
          <ellipse 
            cx="50" 
            cy="50" 
            rx="43" 
            ry="26" 
            fill="none" 
            stroke="url(#global-globe-grad)" 
            strokeWidth="1" 
            strokeOpacity="0.4" 
            transform="rotate(-75 50 50)" 
          />

          {/* Node intersections style */}
          <circle cx="21" cy="30" r="2.2" fill="#00E5FF" />
          <circle cx="79" cy="30" r="2.2" fill="#0072ff" />
          <circle cx="12" cy="46" r="2.2" fill="#02f2fe" />
          <circle cx="88" cy="46" r="2.2" fill="#0072ff" />
          <circle cx="21" cy="70" r="2.2" fill="#0072ff" />
          <circle cx="79" cy="70" r="2.2" fill="#02f2fe" />
          <circle cx="34" cy="85" r="2.2" fill="#00E5FF" />
          <circle cx="66" cy="15" r="2.2" fill="#0072ff" />
          <circle cx="50" cy="8" r="2.5" fill="#02f2fe" />
          <circle cx="50" cy="92" r="2.5" fill="#0072ff" />

          {/* Inner mesh lines joining central 'S' */}
          <path d="M50 8 L50 25 M50 75 L50 92 M12 46 L30 46 M70 54 L88 46" stroke="url(#global-globe-grad)" strokeWidth="0.8" strokeOpacity="0.25" />

          {/* Smooth bezier anchor-points stylized 'S' curve overlay */}
          <path 
            d="M 52,22 
               C 33,21 24,34 33,46 
               C 39,54 59,51 64,59 
               C 71,69 59,79 47,79 
               C 35,79 30,73 30,73 
               L 35,68 
               C 35,68 39,73 47,73 
               C 55,73 63,66 58,59 
               C 53,52 35,55 29,46 
               C 22,35 33,16 52,16 
               C 63,16 69,24 69,24 
               L 64,28 
               C 64,28 59,22 52,22 Z" 
            fill="url(#global-s-grad)" 
          />
        </svg>
      </motion.div>

      {/* Corporate Typography Segment matching: "GLOBAL SOFTWARE Empowering Your Digital World" */}
      {!iconOnly && (
        <div className="flex flex-col select-none text-left leading-normal">
          <span 
            className={`font-black tracking-wider uppercase ${getTitleColor()}`} 
            style={{ 
              fontSize: '1.25rem', 
              fontFamily: '"Space Grotesk", "Outfit", "Inter", sans-serif',
              letterSpacing: '0.05em',
              lineHeight: '1.1'
            }}
          >
            GLOBAL
          </span>
          <span 
            className={`font-bold uppercase ${getSubTitleColor()}`} 
            style={{ 
              fontSize: '0.85rem', 
              fontFamily: '"Space Grotesk", "Outfit", "Inter", sans-serif',
              letterSpacing: '0.24em',
              lineHeight: '1.1',
              marginTop: '1.5px'
            }}
          >
            SOFTWARE
          </span>
          <span 
            className={`text-[8px] font-semibold tracking-wide whitespace-nowrap mt-1 ${getSloganColor()}`} 
            style={{ 
              fontFamily: '"Inter", sans-serif',
              letterSpacing: '0.03em'
            }}
          >
            Empowering Your Digital World
          </span>
        </div>
      )}
    </div>
  );
};
