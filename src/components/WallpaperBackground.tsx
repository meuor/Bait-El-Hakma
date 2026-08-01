import { useState, useEffect } from 'react';
import { useTheme } from '@/context/ThemeContext';

const wallpapers = [
  'https://w.wallhaven.cc/full/rq/wallhaven-rq215j.png',
  'https://w.wallhaven.cc/full/5g/wallhaven-5gqpx8.png',
  'https://w.wallhaven.cc/full/nz/wallhaven-nzy5rw.jpg',
  'https://w.wallhaven.cc/full/73/wallhaven-73rppe.jpg',
  'https://w.wallhaven.cc/full/l8/wallhaven-l8og6p.png',
  'https://w.wallhaven.cc/full/1q/wallhaven-1q13w3.png',
  'https://w.wallhaven.cc/full/je/wallhaven-je15pp.png',
  'https://w.wallhaven.cc/full/nz/wallhaven-nzee1o.jpg',
];

export { wallpapers };

interface WallpaperBackgroundProps {
  overlay?: boolean;
  overlayOpacity?: number;
}

export function WallpaperBackground({ overlay = true, overlayOpacity = 0.85 }: WallpaperBackgroundProps) {
  const { theme } = useTheme();
  const [index, setIndex] = useState(0);
  const isDark = theme === 'dark' || theme === 'dracula' || theme === 'monokai';

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex(prev => (prev + 1) % wallpapers.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div style={{
      position: 'absolute',
      inset: 0,
      zIndex: 0,
      overflow: 'hidden',
    }}>
      {isDark && wallpapers.map((url, i) => (
        <div
          key={url}
          style={{
            position: 'absolute',
            inset: 0,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            opacity: i === index ? 1 : 0,
            transition: 'opacity 1.5s ease-in-out',
            backgroundImage: `url(${url})`,
          }}
        />
      ))}
      {overlay && (
        <div style={{
          position: 'absolute',
          inset: 0,
          background: isDark
            ? `linear-gradient(180deg, rgba(7, 3, 18, ${overlayOpacity}) 0%, rgba(7, 3, 18, ${overlayOpacity * 0.5}) 30%, rgba(7, 3, 18, ${overlayOpacity * 0.4}) 60%, rgba(7, 3, 18, ${overlayOpacity}) 100%)`
            : `linear-gradient(180deg, hsl(var(--surface-base) / 0.6) 0%, hsl(var(--surface-base) / 0.3) 30%, hsl(var(--surface-base) / 0.2) 60%, hsl(var(--surface-base) / 0.6) 100%)`,
          zIndex: 1,
        }} />
      )}
    </div>
  );
}
