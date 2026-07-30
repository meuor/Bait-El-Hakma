import { useState, useRef, useEffect } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import {
  BookOpen, Timer, LayoutGrid, Library,
  Cloud, Sparkles, ArrowRight, ChevronRight, X,
  Star, Headphones, Brain, Heart,
} from 'lucide-react';
import { WallpaperBackground } from './WallpaperBackground';
import './LandingPage.css';

interface LandingPageProps {
  onLogin: () => void;
  onRegister: () => void;
}

const features = [
  {
    icon: <BookOpen className="w-6 h-6" />,
    title: 'Full Quran Reader',
    titleAr: 'المصحف الشريف',
    desc: 'Read the entire Quran with Mushaf themes, verse bookmarks, inline audio with 13 reciters, memorization mode, and daily reading tracker.',
    accent: 'gold',
  },
  {
    icon: <Headphones className="w-6 h-6" />,
    title: 'Audio & Recitation',
    titleAr: 'الصوت والتلاوة',
    desc: 'Tap any ayah to play with auto-advance. Choose from Alafasy, Minshawi, Husary & more. Repeat modes help with memorization.',
    accent: 'emerald',
  },
  {
    icon: <Timer className="w-6 h-6" />,
    title: 'Pomodoro Timer',
    titleAr: 'مؤقت التركيز',
    desc: 'Stay focused with customizable intervals, session tracking, and a floating mini-player across all tabs.',
    accent: 'sapphire',
  },
  {
    icon: <LayoutGrid className="w-6 h-6" />,
    title: 'Kanban Board',
    titleAr: 'لوحة المهام',
    desc: 'Organize tasks visually with drag-and-drop columns. Perfect for GTD and project management.',
    accent: 'ruby',
  },
  {
    icon: <Library className="w-6 h-6" />,
    title: 'Book Library',
    titleAr: 'مكتبة الكتب',
    desc: 'Track your reading with covers, progress bars, tags, and personal notes per page.',
    accent: 'amber',
  },
  {
    icon: <Brain className="w-6 h-6" />,
    title: 'Challenge Tracker',
    titleAr: 'تحديات يومية',
    desc: 'Build habits with custom day-based challenges. Visual grids, streaks, and progress tracking.',
    accent: 'amethyst',
  },
  {
    icon: <Cloud className="w-6 h-6" />,
    title: 'Cloud Sync',
    titleAr: 'مزامنة سحابية',
    desc: 'All data syncs securely. Access your workspace from any device, zero setup.',
    accent: 'teal',
  },
  {
    icon: <Heart className="w-6 h-6" />,
    title: 'Free & Open',
    titleAr: 'مجاني ومفتوح',
    desc: 'No ads, no tracking, no paywall. Built with love for the community. Forever free.',
    accent: 'rose',
  },
];

// Inline feature preview SVGs — Graph & Daily still use SVGs (no screenshot yet)
function GraphPreview() {
  const colors = ['#8b5cf6','#22c55e','#f59e0b','#3b82f6','#ef4444','#0ea5e9','#ec4899','#d4a853'];
  const nodes = [
    { x: 60, y: 50 }, { x: 190, y: 30 }, { x: 120, y: 100 },
    { x: 320, y: 80 }, { x: 250, y: 150 }, { x: 80, y: 190 },
    { x: 170, y: 220 }, { x: 300, y: 230 }, { x: 45, y: 120 },
    { x: 350, y: 170 }, { x: 200, y: 290 }, { x: 130, y: 310 },
  ];
  const edges = [
    [0,2],[2,1],[1,3],[2,4],[4,5],[5,6],[6,7],[3,7],[0,8],[8,5],[4,9],[9,7],[6,10],[10,11],[8,10],
  ];
  return (
    <svg viewBox="0 0 380 400" className="w-full h-full">
      <rect width="380" height="400" fill="#0a0518" rx="8" />
      {/* Search bar */}
      <rect x="10" y="10" width="360" height="30" rx="8" fill="rgba(255,255,255,0.03)" stroke="rgba(139,92,246,0.08)" strokeWidth="0.5" />
      <text x="24" y="30" fill="#5a5270" fontSize="8">🔍 Search nodes...</text>
      {/* Filter chips */}
      {['Book','Todo','Card','Pomo','Chall'].map((f,i) => (
        <g key={i}>
          <rect x={10 + i * 74} y="48" width="68" height="20" rx="6" fill={i<3?'rgba(139,92,246,0.15)':'rgba(255,255,255,0.03)'} />
          <text x={44 + i * 74} y="62" textAnchor="middle" fill={i<3?'#a78bfa':'#5a5270'} fontSize="6.5" fontWeight="bold">{f}</text>
        </g>
      ))}
      {/* Graph canvas */}
      <rect x="10" y="76" width="360" height="310" rx="8" fill="rgba(255,255,255,0.01)" />
      {/* Grid dots */}
      {Array.from({ length: 80 }, (_, i) => (
        <circle key={i} cx={20 + (i%10)*36} cy={90 + Math.floor(i/10)*34} r="1" fill="rgba(139,92,246,0.06)" />
      ))}
      {/* Edges */}
      {edges.map((e, i) => {
        const s = nodes[e[0]], t = nodes[e[1]];
        return (
          <g key={i}>
            <line x1={s.x} y1={s.y} x2={t.x} y2={t.y} stroke="rgba(139,92,246,0.15)" strokeWidth="1" />
          </g>
        );
      })}
      {/* Nodes */}
      {nodes.map((n, i) => (
        <g key={i}>
          <circle cx={n.x} cy={n.y} r={8 + (i%3)*4} fill={colors[i]} fillOpacity="0.2" stroke={colors[i]} strokeWidth="1.5" />
          <circle cx={n.x} cy={n.y} r={3} fill={colors[i]} />
          <text x={n.x} y={n.y + 18} textAnchor="middle" fill="#8a82a0" fontSize="4.5">
            {['Quran','Tasks','Books','Stats','Notes','Goals','Habits','Journal','Focus','Links','Ideas','Todos'][i]}
          </text>
        </g>
      ))}
      {/* Zoom controls */}
      <rect x="334" y="88" width="24" height="24" rx="6" fill="rgba(18,8,42,0.8)" stroke="rgba(139,92,246,0.1)" strokeWidth="0.5" />
      <text x="346" y="106" textAnchor="middle" fill="#8a82a0" fontSize="12">+</text>
      <rect x="334" y="116" width="24" height="24" rx="6" fill="rgba(18,8,42,0.8)" stroke="rgba(139,92,246,0.1)" strokeWidth="0.5" />
      <text x="346" y="134" textAnchor="middle" fill="#8a82a0" fontSize="12">−</text>
      {/* Legend */}
      <text x="16" y="370" fill="#8a82a0" fontSize="6">12 nodes · 15 connections</text>
      {['●','●','●','●','●'].map((d,i) => (
        <text key={i} x={140 + i * 44} y={370} fill={colors[i]} fontSize="6">{d} {['Bk','Td','Kb','Po','Ch'][i]}</text>
      ))}
    </svg>
  );
}

function DailyPreview() {
  const days = Array.from({ length: 35 }, (_, i) => ({
    d: i + 1, isToday: i === 16, hasContent: i % 3 === 0, isWeekend: i % 7 === 5 || i % 7 === 6,
  }));
  return (
    <svg viewBox="0 0 380 400" className="w-full h-full">
      <rect width="380" height="400" fill="#0a0518" rx="8" />
      {/* Date header */}
      <rect x="10" y="10" width="360" height="44" rx="8" fill="rgba(139,92,246,0.06)" />
      <text x="24" y="30" fill="#c8c4d8" fontSize="11" fontWeight="bold">Daily Notes</text>
      <text x="24" y="44" fill="#8a82a0" fontSize="7">Wednesday, July 29, 2026 · 17 Rajab 1447</text>
      <rect x="280" y="16" width="80" height="20" rx="6" fill="rgba(139,92,246,0.12)" />
      <text x="320" y="31" textAnchor="middle" fill="#a78bfa" fontSize="7">◀  Today  ▶</text>
      {/* Mini calendar grid */}
      <text x="16" y="72" fill="#c8c4d8" fontSize="8" fontWeight="bold">Rajab 1447</text>
      {['Sat','Sun','Mon','Tue','Wed','Thu','Fri'].map((d,i) => (
        <text key={i} x={24 + i * 48} y="86" fill="#5a5270" fontSize="6" textAnchor="middle">{d}</text>
      ))}
      {days.slice(0, 35).map((day, i) => (
        <g key={i}>
          <rect x={16 + (i%7)*48} y={92 + Math.floor(i/7)*26} width="40" height="22" rx="5"
            fill={day.isToday ? 'rgba(139,92,246,0.2)' : day.hasContent ? 'rgba(255,255,255,0.03)' : 'transparent'}
            stroke={day.isToday ? 'rgba(139,92,246,0.4)' : 'none'} strokeWidth="1" />
          <text x={36 + (i%7)*48} y={106 + Math.floor(i/7)*26} textAnchor="middle"
            fill={day.isToday ? '#a78bfa' : day.isWeekend ? '#5a5270' : '#8a82a0'} fontSize="7" fontWeight={day.isToday?'bold':'normal'}>{day.d}</text>
          {day.hasContent && <circle cx={56 + (i%7)*48} cy={110 + Math.floor(i/7)*26} r="2" fill="#8b5cf6" opacity="0.5" />}
        </g>
      ))}
      {/* Notes area */}
      <rect x="10" y="220" width="360" height="170" rx="8" fill="rgba(255,255,255,0.02)" />
      <text x="24" y="240" fill="#c8c4d8" fontSize="9" fontWeight="bold">Today's Notes</text>
      {/* Note blocks */}
      {[
        { t: 'Quran Reading', c: 'Completed Juz 1 review. Focus on tajweed.', time: '08:30', tag: 'ibadah' },
        { t: 'Project Update', c: 'API integration done. Need to test edge cases.', time: '10:15', tag: 'work' },
        { t: 'Study Session', c: 'React 19 features: use() hook and actions.', time: '14:00', tag: 'learning' },
      ].map((n, i) => (
        <g key={i}>
          <rect x={18} y={248 + i * 44} width="344" height="38" rx="5" fill="rgba(255,255,255,0.02)" />
          <rect x={18} y={248 + i * 44} width="3" height="38" rx="1.5" fill={['#d4a853','#8b5cf6','#22c55e'][i]} opacity="0.5" />
          <text x={28} y={262 + i * 44} fill="#c8c4d8" fontSize="7.5" fontWeight="bold">{n.t}</text>
          <text x={280} y={262 + i * 44} fill="#5a5270" fontSize="6">{n.time}</text>
          <text x={28} y={276 + i * 44} fill="#8a82a0" fontSize="6.5">{n.c}</text>
          <rect x={310} y={270 + i * 44} width="40" height="10" rx="3" fill="rgba(139,92,246,0.08)" />
          <text x={330} y={278 + i * 44} textAnchor="middle" fill="#a78bfa" fontSize="5">{n.tag}</text>
        </g>
      ))}
      {/* Add note */}
      <rect x="18" y="338" width="344" height="28" rx="6" fill="none" stroke="rgba(139,92,246,0.08)" strokeWidth="0.5" strokeDasharray="3,3" />
      <text x="28" y="357" fill="#5a5270" fontSize="7">+ Write a new note...</text>
      {/* Tags section */}
      <rect x="18" y="368" width="80" height="16" rx="4" fill="rgba(212,168,83,0.1)" />
      <text x="58" y="380" textAnchor="middle" fill="#d4a853" fontSize="5">#ibadah</text>
      <rect x="104" y="368" width="60" height="16" rx="4" fill="rgba(139,92,246,0.1)" />
      <text x="134" y="380" textAnchor="middle" fill="#a78bfa" fontSize="5">#work</text>
      <rect x="170" y="368" width="70" height="16" rx="4" fill="rgba(34,197,94,0.1)" />
      <text x="205" y="380" textAnchor="middle" fill="#22c55e" fontSize="5">#learning</text>
      <rect x="300" y="368" width="60" height="16" rx="4" fill="rgba(245,158,11,0.1)" />
      <text x="330" y="380" textAnchor="middle" fill="#f59e0b" fontSize="5">+ Add tag</text>
    </svg>
  );
}

const screenshots = [
  { preview: <img src="/screenshots/pomodoro.png" alt="Pomodoro" className="w-full h-full object-cover" />, src: '/screenshots/pomodoro.png', title: 'Pomodoro', desc: 'Focus timer with sessions, themes & mini-player', size: 'tall' },
  { preview: <img src="/screenshots/focus-video.png" alt="Focus Video" className="w-full h-full object-cover" />, src: '/screenshots/focus-video.png', title: 'Focus Video', desc: 'YouTube & local video player with auto-rotate', size: 'wide' },
  { preview: <img src="/screenshots/kanban.png" alt="Kanban" className="w-full h-full object-cover" />, src: '/screenshots/kanban.png', title: 'Kanban', desc: 'Drag-and-drop task management board', size: 'square' },
  { preview: <img src="/screenshots/library.png" alt="Library" className="w-full h-full object-cover" />, src: '/screenshots/library.png', title: 'Library', desc: 'Track books with progress & notes', size: 'square' },
  { preview: <img src="/screenshots/tasks.png" alt="Tasks" className="w-full h-full object-cover" />, src: '/screenshots/tasks.png', title: 'Tasks', desc: 'Daily todos with priority & categories', size: 'tall' },
  { preview: <img src="/screenshots/stats.png" alt="Stats" className="w-full h-full object-cover" />, src: '/screenshots/stats.png', title: 'Stats', desc: 'Activity analytics & focus breakdown', size: 'square' },
  { preview: <img src="/screenshots/inspire.png" alt="Inspire" className="w-full h-full object-cover" />, src: '/screenshots/inspire.png', title: 'Inspire', desc: 'Quran, hadith & daily quotes', size: 'square' },
  { preview: <img src="/screenshots/challenges.png" alt="Challenges" className="w-full h-full object-cover" />, src: '/screenshots/challenges.png', title: 'Challenges', desc: 'Build habits with streaks & achievements', size: 'wide' },
  { preview: <GraphPreview />, src: null, title: 'Graph', desc: 'Visual entity relationship network', size: 'square' },
  { preview: <DailyPreview />, src: null, title: 'Daily', desc: 'Daily notes with Hijri calendar', size: 'tall' },
];

// Live animating timer for the landing page
function LiveTimerPreview() {
  const [time, setTime] = useState(1500); // 25:00
  const [running, setRunning] = useState(false);
  const timer = useRef<ReturnType<typeof setInterval>>(undefined);

  const toggle = () => {
    if (running) {
      clearInterval(timer.current);
      setRunning(false);
    } else {
      setRunning(true);
      timer.current = setInterval(() => {
        setTime(prev => {
          if (prev <= 1) { clearInterval(timer.current); setRunning(false); return 1500; }
          return prev - 1;
        });
      }, 1000);
    }
  };

  useEffect(() => () => clearInterval(timer.current), []);

  const mins = Math.floor(time / 60);
  const secs = time % 60;
  const radius = 54;
  const circ = 2 * Math.PI * radius;
  const progress = ((1500 - time) / 1500) * 100;
  const offset = circ - (progress / 100) * circ;

  return (
    <div className="landing-live-timer" onClick={toggle}>
      <svg viewBox="0 0 128 128" className="landing-live-timer-ring">
        <circle cx="64" cy="64" r={radius} fill="none" stroke="rgba(139,92,246,0.15)" strokeWidth="6" />
        <circle cx="64" cy="64" r={radius} fill="none" stroke="#8b5cf6" strokeWidth="6" strokeLinecap="round"
          strokeDasharray={circ} strokeDashoffset={offset} style={{ transition: 'stroke-dashoffset 1s linear' }} />
      </svg>
      <div className="landing-live-timer-inner">
        <span className="landing-live-timer-time">{String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}</span>
        <span className="landing-live-timer-label">{running ? 'Focusing' : 'Tap to start'}</span>
      </div>
    </div>
  );
}

const steps = [
  { num: '01', title: 'Create your account', desc: 'Sign up in seconds with email. Pick a unique username for your public profile.', titleAr: 'أنشئ حسابك' },
  { num: '02', title: 'Explore the dashboard', desc: 'Navigate Quran, Timer, Kanban, Library, Tasks & more from one interface.', titleAr: 'استكشف لوحة التحكم' },
  { num: '03', title: 'Make it yours', desc: 'Pin widgets, customize themes, set goals, build habits. Your space, your rules.', titleAr: 'اجعله خاصاً بك' },
];

function FadeInSection({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      {children}
    </motion.div>
  );
}

function Counter({ end, suffix = '', duration = 2 }: { end: number; suffix?: string; duration?: number }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (!isInView) return;
    let start = 0;
    const increment = end / (duration * 60);
    const timer = setInterval(() => {
      start += increment;
      if (start >= end) { setCount(end); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, 1000 / 60);
    return () => clearInterval(timer);
  }, [isInView, end, duration]);

  return <span ref={ref}>{count}{suffix}</span>;
}

export function LandingPage({ onLogin, onRegister }: LandingPageProps) {
  const [lightboxImg, setLightboxImg] = useState<string | null>(null);
  const [lightboxTitle, setLightboxTitle] = useState('');

  return (
    <div className="landing">
      <div className="landing-orb landing-orb-1" />
      <div className="landing-orb landing-orb-2" />
      <div className="landing-orb landing-orb-3" />
      <div className="landing-pattern" />

      {/* Navigation */}
      <motion.nav
        className="landing-nav"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <a href="/" className="landing-nav-brand">
          <img src="/img/logo-icon.svg" alt="Bait El-Hakma" className="landing-nav-logo" />
          <span className="landing-nav-title">Bait El-Hakma</span>
        </a>
        <div className="landing-nav-links">
          <a href="#features" className="landing-nav-link">Features</a>
          <a href="#screenshots" className="landing-nav-link">Screenshots</a>
          <a href="#how" className="landing-nav-link">How it Works</a>
          <motion.button
            className="landing-btn-primary"
            style={{ padding: '0.5rem 1.25rem', fontSize: '0.875rem' }}
            onClick={onLogin}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Sign In
          </motion.button>
        </div>
      </motion.nav>

      {/* Hero - Redesigned */}
      <section className="landing-hero">
        <WallpaperBackground />
        <div className="landing-hero-glow" />

        {/* Decorative floating elements */}
        <div className="hero-deco hero-deco-1" />
        <div className="hero-deco hero-deco-2" />
        <div className="hero-deco hero-deco-3" />

        <div className="hero-glass-card">
          <motion.div
            className="hero-badge"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <span className="hero-badge-dot" />
            <Sparkles className="w-3.5 h-3.5" />
            Free & Open — No ads, no tracking
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
          >
            <span className="hero-title-gradient">Bait El-Hakma</span>
            <span className="hero-title-arabic">بيت الحكمة</span>
          </motion.h1>

          <motion.p
            className="hero-subtitle"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4 }}
          >
            Your intelligent productivity companion. Read the Quran with audio, manage tasks,
            track books, build habits — all beautifully designed and securely synced.
          </motion.p>

          <motion.div
            className="hero-actions"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.5 }}
          >
            <motion.button className="landing-btn-primary" onClick={onRegister} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              Get Started Free <ArrowRight className="w-5 h-5" />
            </motion.button>
            <motion.button className="landing-btn-secondary" onClick={onLogin} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              Sign In <ChevronRight className="w-5 h-5" />
            </motion.button>
          </motion.div>

          <motion.div
            className="hero-stats"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.6 }}
          >
            <div className="hero-stat">
              <div className="hero-stat-num">114</div>
              <div className="hero-stat-label">Surahs</div>
            </div>
            <div className="hero-stat">
              <div className="hero-stat-num">6,236</div>
              <div className="hero-stat-label">Ayahs</div>
            </div>
            <div className="hero-stat">
              <div className="hero-stat-num">13</div>
              <div className="hero-stat-label">Reciters</div>
            </div>
            <div className="hero-stat">
              <div className="hero-stat-num">8</div>
              <div className="hero-stat-label">Tools</div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Arabic Introduction */}
      <section className="arabic-intro">
        <FadeInSection>
          <div className="arabic-intro-ornament" />
          <motion.div
            className="arabic-intro-content"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <div className="arabic-intro-decoration">
              <span className="arabic-intro-deco-line" />
              <span className="arabic-intro-deco-diamond">◆</span>
              <span className="arabic-intro-deco-line" />
            </div>
            <p className="arabic-intro-arabic">
              بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
            </p>
            <p className="arabic-intro-translation">
              In the Name of Allah, the Most Gracious, the Most Merciful
            </p>
            <div className="arabic-intro-divider" />
            <h3 className="arabic-into-title-ar">
              بيت الحكمة
            </h3>
            <p className="arabic-intro-sub-ar">
              — حَيْثُ يَلْتَقِي الْعِلْمُ بِالْإِيمَانِ —
            </p>
            <p className="arabic-intro-english">
              A digital sanctuary where knowledge meets faith. Read, learn, track your progress,
              and build lasting habits — all in one beautifully crafted space, free forever.
            </p>
            <div className="arabic-intro-decoration">
              <span className="arabic-intro-deco-line" />
              <span className="arabic-intro-deco-diamond">◆</span>
              <span className="arabic-intro-deco-line" />
            </div>
          </motion.div>
          <div className="arabic-intro-ornament arabic-intro-ornament-bottom" />
        </FadeInSection>
      </section>

      {/* Features */}
      <section className="landing-features" id="features">
        <FadeInSection>
          <div className="landing-section-header">
            <div className="landing-section-tag">Features</div>
            <h2 className="landing-section-title">Everything you need, in one place</h2>
            <p className="landing-section-desc">
              From Quran recitation to productivity tools — a complete digital workspace.
            </p>
          </div>
        </FadeInSection>

        <div className="landing-features-grid">
          {features.map((f, i) => (
            <motion.div
              key={i}
              className="landing-feature-card"
              data-accent={f.accent}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              whileHover={{ y: -6, transition: { duration: 0.2 } }}
            >
              <div className="landing-feature-icon">{f.icon}</div>
              <h3>{f.title}</h3>
              <p className="landing-feature-title-ar">{f.titleAr}</p>
              <p>{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Stats Counter */}
      <section className="landing-stats-section">
        <div className="landing-stats-grid">
          <div className="landing-stat-item">
            <div className="landing-stat-num"><Counter end={114} /></div>
            <div className="landing-stat-label">Surahs</div>
          </div>
          <div className="landing-stat-item">
            <div className="landing-stat-num"><Counter end={6236} /></div>
            <div className="landing-stat-label">Ayahs</div>
          </div>
          <div className="landing-stat-item">
            <div className="landing-stat-num"><Counter end={13} /></div>
            <div className="landing-stat-label">Reciters</div>
          </div>
          <div className="landing-stat-item">
            <div className="landing-stat-num"><Counter end={8} /></div>
            <div className="landing-stat-label">Features</div>
          </div>
          <div className="landing-stat-item">
            <div className="landing-stat-num"><Counter end={100} suffix="%" /></div>
            <div className="landing-stat-label">Free</div>
          </div>
        </div>
      </section>

      {/* Screenshots */}
      <section className="landing-showcase" id="screenshots">
        <FadeInSection>
          <div className="landing-section-header">
            <div className="landing-section-tag">Gallery</div>
            <h2 className="landing-section-title">See it in action</h2>
            <p className="landing-section-desc">
              Every feature crafted with care for a delightful experience.
            </p>
          </div>
        </FadeInSection>

        <div className="landing-showcase-grid">
          {screenshots.map((s, i) => (
            <motion.div
              key={i}
              className={`landing-showcase-item landing-showcase-${s.size}`}
              onClick={() => { if (s.src) { setLightboxImg(s.src); setLightboxTitle(s.title); } }}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              whileHover={{ scale: 1.03, zIndex: 10 }}
            >
              {s.preview}
              <div className="landing-showcase-overlay">
                <h4>{s.title}</h4>
                <p>{s.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="landing-how" id="how">
        <FadeInSection>
          <div className="landing-section-header">
            <div className="landing-section-tag">How It Works</div>
            <h2 className="landing-section-title">Up and running in minutes</h2>
            <p className="landing-section-desc">
              No complicated setup. Just create an account and start using all features instantly.
            </p>
          </div>
        </FadeInSection>

        <div className="landing-steps">
          {steps.map((s, i) => (
            <motion.div
              key={i}
              className="landing-step"
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.5, delay: i * 0.2 }}
            >
              <div className="landing-step-num">{s.num}</div>
              <div className="landing-step-content">
                <h3>{s.title}</h3>
                <p className="landing-step-arabic">{s.titleAr}</p>
                <p>{s.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="landing-cta">
        <div className="landing-cta-glow" />
        <motion.div
          className="landing-cta-box"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <motion.div
            animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.1, 1] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          >
            <Star className="w-10 h-10 text-amber-400 mx-auto mb-4" />
          </motion.div>
          <h2>Ready to transform your productivity?</h2>
          <p>
            Join Bait El-Hakma today. Free forever, no credit card, no ads, no tracking.
            Just pure focus and spiritual growth.
          </p>
          <div className="landing-cta-actions">
            <motion.button className="landing-btn-primary" onClick={onRegister} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              Create Free Account <ArrowRight className="w-5 h-5" />
            </motion.button>
            <motion.button className="landing-btn-secondary" onClick={onLogin} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              Sign In
            </motion.button>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="landing-footer-inner">
          <div className="landing-footer-brand">
            <img src="/img/logo.svg" alt="Bait El-Hakma" />
            <span>Bait El-Hakma</span>
          </div>
          <div className="landing-footer-links">
            <a href="#features">Features</a>
            <a href="#screenshots">Gallery</a>
            <a href="#how">How It Works</a>
            <a href="https://github.com/meuor/Bait-El-Hakma" target="_blank" rel="noreferrer">GitHub</a>
            <a href="mailto:support@baitelhakma.dev">Support</a>
          </div>
          <div className="landing-footer-copy">
            &copy; 2026 Bait El-Hakma — House of Wisdom
          </div>
        </div>
      </footer>

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxImg && (
          <motion.div
            className="landing-lightbox"
            onClick={() => setLightboxImg(null)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.button
              className="landing-lightbox-close"
              onClick={() => setLightboxImg(null)}
              whileHover={{ rotate: 90 }}
            >
              <X className="w-6 h-6" />
            </motion.button>
            <motion.img
              src={lightboxImg}
              alt={lightboxTitle}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.3 }}
            />
            <motion.div
              className="landing-lightbox-title"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              {lightboxTitle}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
