import { useState, useEffect } from 'react';
import { useTheme } from '@/context/ThemeContext';

interface IslamicWallpaperProps {
  className?: string;
  variant?: 'hero' | 'section' | 'subtle';
}

// High-quality Islamic wallpaper images from wallhaven.cc
const wallpaperImages = [
  'https://w.wallhaven.cc/full/rq/wallhaven-rq215j.png',  // Arabic calligraphy, black bg
  'https://w.wallhaven.cc/full/5g/wallhaven-5gqpx8.png',  // Quran calligraphy, black bg
  'https://w.wallhaven.cc/full/nz/wallhaven-nzy5rw.jpg',  // Yemen mosque at dusk
  'https://w.wallhaven.cc/full/73/wallhaven-73rppe.jpg',  // Iranian architecture
  'https://w.wallhaven.cc/full/l8/wallhaven-l8og6p.png',  // Mountains + Arabic text
  'https://w.wallhaven.cc/full/1q/wallhaven-1q13w3.png',  // Islamic quote calligraphy
  'https://w.wallhaven.cc/full/je/wallhaven-je15pp.png',  // Minimalist Arabic art
  'https://w.wallhaven.cc/full/nz/wallhaven-nzee1o.jpg',  // Allah verse digital art
];

// Islamic 8-pointed star pattern
function StarPattern({ size = 200, opacity = 0.06, color = '#d4a853' }: { size?: number; opacity?: number; color?: string }) {
  const half = size / 2;
  const r = size * 0.35;
  const points8 = Array.from({ length: 8 }, (_, i) => {
    const angle = (i * Math.PI * 2) / 8 - Math.PI / 2;
    const outerR = i % 2 === 0 ? r : r * 0.5;
    return `${half + outerR * Math.cos(angle)},${half + outerR * Math.sin(angle)}`;
  }).join(' ');

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ opacity }}>
      <polygon points={points8} fill="none" stroke={color} strokeWidth="1" />
      <circle cx={half} cy={half} r={r * 0.15} fill={color} fillOpacity="0.3" />
      <circle cx={half} cy={half} r={r * 0.4} fill="none" stroke={color} strokeWidth="0.5" strokeDasharray="2,4" />
    </svg>
  );
}

// Interlocking hexagonal pattern
function HexPattern({ size = 120, opacity = 0.04, color = '#a78bfa' }: { size?: number; opacity?: number; color?: string }) {
  const hex = (cx: number, cy: number, r: number) => {
    return Array.from({ length: 6 }, (_, i) => {
      const angle = (i * Math.PI) / 3;
      return `${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`;
    }).join(' ');
  };

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ opacity }}>
      <polygon points={hex(size / 2, size / 2, size * 0.4)} fill="none" stroke={color} strokeWidth="0.8" />
      <polygon points={hex(size / 2, size / 2, size * 0.25)} fill="none" stroke={color} strokeWidth="0.5" />
      <circle cx={size / 2} cy={size / 2} r={size * 0.08} fill={color} fillOpacity="0.2" />
    </svg>
  );
}

// Geometric rosette
function Rosette({ size = 300, opacity = 0.05, color = '#c4a8fa' }: { size?: number; opacity?: number; color?: string }) {
  const cx = size / 2;
  const cy = size / 2;
  const petals = 12;
  const outerR = size * 0.4;
  const innerR = size * 0.15;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ opacity }}>
      {Array.from({ length: petals }, (_, i) => {
        const angle = (i * Math.PI * 2) / petals;
        const x1 = cx + outerR * Math.cos(angle);
        const y1 = cy + outerR * Math.sin(angle);
        const mx = cx + innerR * Math.cos(angle + Math.PI / petals);
        const my = cy + innerR * Math.sin(angle + Math.PI / petals);
        return (
          <path
            key={i}
            d={`M${cx},${cy} Q${mx},${my} ${x1},${y1}`}
            fill="none"
            stroke={color}
            strokeWidth="0.8"
          />
        );
      })}
      <circle cx={cx} cy={cy} r={innerR * 0.4} fill={color} fillOpacity="0.15" />
      <circle cx={cx} cy={cy} r={outerR} fill="none" stroke={color} strokeWidth="0.5" />
    </svg>
  );
}

export function IslamicWallpaper({ className = '', variant = 'hero' }: IslamicWallpaperProps) {
  const { theme } = useTheme();
  const [currentBg, setCurrentBg] = useState(0);
  const [currentImage, setCurrentImage] = useState(Math.floor(Math.random() * wallpaperImages.length));
  const [imageLoaded, setImageLoaded] = useState(false);

  const isDark = theme === 'dark' || theme === 'dracula' || theme === 'monokai';

  if (!isDark) return null;

  const backgrounds = [
    'linear-gradient(135deg, #06020f 0%, #0d0520 30%, #0a0318 60%, #110828 100%)',
    'linear-gradient(135deg, #08030f 0%, #100525 30%, #0c0420 60%, #0e0622 100%)',
    'linear-gradient(135deg, #05020d 0%, #0b041e 30%, #080315 60%, #0f0726 100%)',
  ];

  useEffect(() => {
    if (variant !== 'hero') return;
    const interval = setInterval(() => {
      setCurrentBg((prev) => (prev + 1) % backgrounds.length);
      setCurrentImage((prev) => (prev + 1) % wallpaperImages.length);
      setImageLoaded(false);
    }, 12000);
    return () => clearInterval(interval);
  }, [variant, backgrounds.length]);

  const patternOpacity = variant === 'subtle' ? 0.02 : variant === 'section' ? 0.04 : 0.06;

  return (
    <div
      className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}
      style={{
        background: backgrounds[currentBg],
        transition: 'background 2s ease-in-out',
      }}
    >
      {/* Wallpaper background image */}
      {variant === 'hero' && (
        <div
          className="absolute inset-0 transition-opacity duration-[3000ms]"
          style={{
            backgroundImage: `url(${wallpaperImages[currentImage]})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            opacity: imageLoaded ? 0.35 : 0,
          }}
        >
          <img
            src={wallpaperImages[currentImage]}
            alt=""
            className="hidden"
            onLoad={() => setImageLoaded(true)}
          />
        </div>
      )}

      {/* Dark gradient overlay for readability */}
      <div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(180deg, rgba(6,2,15,0.7) 0%, rgba(6,2,15,0.5) 40%, rgba(6,2,15,0.8) 100%)',
        }}
      />

      {/* Floating geometric elements */}
      <div className="absolute inset-0">
        {/* Large rosette - top left */}
        <div className="absolute" style={{ top: '-5%', left: '-5%', transform: 'rotate(15deg)' }}>
          <Rosette size={500} opacity={patternOpacity * 0.8} color="#d4a853" />
        </div>

        {/* Star pattern - top right */}
        <div className="absolute" style={{ top: '10%', right: '-3%', transform: 'rotate(-10deg)' }}>
          <StarPattern size={400} opacity={patternOpacity} color="#a78bfa" />
        </div>

        {/* Hex pattern - center left */}
        <div className="absolute" style={{ top: '40%', left: '5%', transform: 'rotate(30deg)' }}>
          <HexPattern size={250} opacity={patternOpacity * 0.7} color="#c4a8fa" />
        </div>

        {/* Rosette - bottom right */}
        <div className="absolute" style={{ bottom: '-10%', right: '10%', transform: 'rotate(-20deg)' }}>
          <Rosette size={600} opacity={patternOpacity * 0.6} color="#818cf8" />
        </div>

        {/* Star - bottom left */}
        <div className="absolute" style={{ bottom: '15%', left: '15%', transform: 'rotate(45deg)' }}>
          <StarPattern size={200} opacity={patternOpacity * 0.5} color="#fbbf24" />
        </div>

        {/* Additional floating elements */}
        <div className="absolute" style={{ top: '60%', right: '25%', transform: 'rotate(60deg)' }}>
          <HexPattern size={180} opacity={patternOpacity * 0.4} color="#6366f1" />
        </div>

        <div className="absolute" style={{ top: '20%', left: '40%', transform: 'rotate(-30deg)' }}>
          <StarPattern size={150} opacity={patternOpacity * 0.3} color="#f59e0b" />
        </div>
      </div>

      {/* Radial glow overlays */}
      <div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse at 20% 30%, rgba(139, 92, 246, 0.08) 0%, transparent 50%)',
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse at 80% 70%, rgba(212, 168, 83, 0.05) 0%, transparent 50%)',
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse at 50% 50%, rgba(99, 102, 241, 0.04) 0%, transparent 60%)',
        }}
      />
    </div>
  );
}

// Export individual patterns for reuse
export { StarPattern, HexPattern, Rosette };
