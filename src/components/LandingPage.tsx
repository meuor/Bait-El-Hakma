import { useState, useRef, useEffect } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import {
  BookOpen, Timer, LayoutGrid, Library,
  Cloud, Sparkles, ArrowRight, ChevronRight, X,
  Star, Headphones, Brain, Heart,
} from 'lucide-react';
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

// Inline feature preview SVGs — accurate visual representations of each tab
function QuranPreview() {
  const lines = ['بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ', 'ٱلْحَمْدُ لِلَّهِ رَبِّ ٱلْعَـٰلَمِينَ', 'ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ', 'مَـٰلِكِ يَوْمِ ٱلدِّينِ', 'إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ', 'ٱهْدِنَا ٱلصِّرَٰطَ ٱلْمُسْتَقِيمَ', 'صِرَٰطَ ٱلَّذِينَ أَنْعَمْتَ عَلَيْهِمْ', 'غَيْرِ ٱلْمَغْضُوبِ عَلَيْهِمْ وَلَا ٱلضَّآلِّينَ'];
  return (
    <svg viewBox="0 0 200 400" className="w-full h-full">
      <defs><linearGradient id="qbg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#1a1a2e"/><stop offset="100%" stopColor="#0f0f1a"/></linearGradient>
      <linearGradient id="qgold" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#d4a853"/><stop offset="100%" stopColor="#8b6914"/></linearGradient></defs>
      <rect width="200" height="400" fill="url(#qbg)" rx="8" />
      <rect x="30" y="20" width="140" height="1.5" fill="url(#qgold)" opacity="0.5" />
      <text x="100" y="42" textAnchor="middle" fill="#d4a853" fontSize="10" fontFamily="serif" fontWeight="bold">سورة الفاتحة</text>
      <circle cx="100" cy="56" r="8" fill="none" stroke="#d4a853" strokeWidth="0.5" opacity="0.4" />
      <text x="100" y="59" textAnchor="middle" fill="#d4a853" fontSize="4" opacity="0.6">١</text>
      <rect x="30" y="65" width="140" height="0.5" fill="url(#qgold)" opacity="0.3" />
      {lines.map((t, i) => (
        <text key={i} x="100" y={90 + i * 32} textAnchor="middle" fill="#c8c4d8" fontSize="7.5" fontFamily="serif">{t}</text>
      ))}
      {[2,3,4,5,6,7].map((_, i) => (
        <circle key={`vm${i}`} cx={30 + (i%2)*140} cy={90 + i*32 - 10} r="5" fill="none" stroke="#d4a853" strokeWidth="0.4" opacity="0.35" />
      ))}
      <rect x="50" y="370" width="100" height="0.5" fill="url(#qgold)" opacity="0.3" />
      <text x="100" y="384" textAnchor="middle" fill="#d4a853" fontSize="5" opacity="0.4">۞</text>
      {/* Audio indicator */}
      <rect x="80" y="360" width="40" height="6" rx="3" fill="#d4a853" opacity="0.2" />
      <text x="100" y="365" textAnchor="middle" fill="#d4a853" fontSize="3.5" opacity="0.6">▶ Audio</text>
    </svg>
  );
}

function BookLibraryPreview() {
  const books = [
    { w: 36, h: 50, c: '#8b5cf6' }, { w: 32, h: 42, c: '#0ea5e9' }, { w: 38, h: 55, c: '#22c55e' },
    { w: 30, h: 38, c: '#f97316' }, { w: 34, h: 48, c: '#ec4899' }, { w: 28, h: 35, c: '#f59e0b' },
    { w: 36, h: 52, c: '#6366f1' }, { w: 32, h: 40, c: '#14b8a6' }, { w: 30, h: 45, c: '#e11d48' },
  ];
  return (
    <svg viewBox="0 0 200 200" className="w-full h-full">
      <rect width="200" height="200" fill="#0a0518" rx="8" />
      <text x="16" y="22" fill="#c8c4d8" fontSize="10" fontWeight="bold">My Library</text>
      <text x="16" y="34" fill="#8a82a0" fontSize="7">9 books · 45% complete</text>
      {/* Bookshelf */}
      {books.map((b, i) => (
        <g key={i}>
          <rect x={14 + i * 20} y={100 - b.h} width={b.w - 2} height={b.h} rx="3" fill={b.c} opacity="0.7" />
          <rect x={14 + i * 20} y={100 - b.h + 4} width={b.w - 2} height={b.h - 8} rx="2" fill={b.c} opacity="0.15" />
          {/* Progress bar on spine */}
          <rect x={14 + i * 20 + 2} y={100 - 8} width={b.w - 6} height="3" rx="1" fill="rgba(255,255,255,0.2)" />
          <rect x={14 + i * 20 + 2} y={100 - 8} width={(b.w - 6) * 0.6} height="3" rx="1" fill="rgba(255,255,255,0.5)" />
        </g>
      ))}
      <rect x="10" y="102" width="180" height="2" rx="1" fill="#2a1f4a" />
      {/* Reading notes */}
      <rect x="14" y="112" width="82" height="28" rx="4" fill="rgba(139,92,246,0.08)" stroke="rgba(139,92,246,0.15)" strokeWidth="0.5" />
      <text x="20" y="124" fill="#c8c4d8" fontSize="6">Current: Atomic Habits</text>
      <text x="20" y="134" fill="#8a82a0" fontSize="5">Page 124 · Chapter 8</text>
      <rect x="104" y="112" width="82" height="28" rx="4" fill="rgba(16,185,129,0.08)" stroke="rgba(16,185,129,0.15)" strokeWidth="0.5" />
      <text x="110" y="124" fill="#c8c4d8" fontSize="6">Current: Deep Work</text>
      <text x="110" y="134" fill="#8a82a0" fontSize="5">Page 67 · Chapter 4</text>
      {/* Tags */}
      <rect x="14" y="148" width="28" height="6" rx="3" fill="#8b5cf6" opacity="0.3" /><text x="28" y="153" textAnchor="middle" fill="#a78bfa" fontSize="3.5">Fiction</text>
      <rect x="46" y="148" width="32" height="6" rx="3" fill="#0ea5e9" opacity="0.3" /><text x="62" y="153" textAnchor="middle" fill="#7dd3fc" fontSize="3.5">Science</text>
      <rect x="82" y="148" width="28" height="6" rx="3" fill="#22c55e" opacity="0.3" /><text x="96" y="153" textAnchor="middle" fill="#86efac" fontSize="3.5">History</text>
    </svg>
  );
}

function KanbanPreview() {
  const cols = [
    { label: 'To Do', cards: ['Design landing', 'Write API docs', 'Setup CI/CD'], color: '#8b5cf6' },
    { label: 'In Progress', cards: ['Fix auth bug', 'Build chart'], color: '#f59e0b' },
    { label: 'Done', cards: ['Init project', 'Setup DB', 'Create logo', 'Add tests'], color: '#22c55e' },
  ];
  return (
    <svg viewBox="0 0 380 200" className="w-full h-full">
      <rect width="380" height="200" fill="#0a0518" rx="8" />
      <text x="16" y="22" fill="#c8c4d8" fontSize="10" fontWeight="bold">Kanban Board</text>
      {cols.map((col, ci) => (
        <g key={ci}>
          <rect x={8 + ci * 126} y="32" width="118" height="158" rx="6" fill="rgba(255,255,255,0.03)" stroke="rgba(139,92,246,0.08)" strokeWidth="0.5" />
          <circle cx={20 + ci * 126} cy={48} r="4" fill={col.color} opacity="0.7" />
          <text x={30 + ci * 126} y={51} fill="#c8c4d8" fontSize="8" fontWeight="bold">{col.label}</text>
          <text x={130 + ci * 126} y={51} textAnchor="end" fill="#8a82a0" fontSize="7">{col.cards.length}</text>
          {col.cards.map((card, i) => (
            <g key={i}>
              <rect x={14 + ci * 126} y={60 + i * 32} width="106" height="26" rx="4" fill="rgba(255,255,255,0.05)" stroke="rgba(139,92,246,0.06)" strokeWidth="0.5" />
              <rect x={14 + ci * 126} y={60 + i * 32} width="3" height="26" rx="1.5" fill={col.color} opacity="0.5" />
              <text x={22 + ci * 126} y={74 + i * 32} fill="#c8c4d8" fontSize="6">{card}</text>
            </g>
          ))}
        </g>
      ))}
    </svg>
  );
}

function DailyTasksPreview() {
  const tasks = [
    { t: 'Read Quran', done: true }, { t: 'Study React', done: true }, { t: 'Write report', done: false },
    { t: 'Exercise', done: false }, { t: 'Review PRs', done: false },
  ];
  return (
    <svg viewBox="0 0 200 200" className="w-full h-full">
      <rect width="200" height="200" fill="#0a0518" rx="8" />
      {/* Dual calendar */}
      <rect x="10" y="10" width="180" height="40" rx="6" fill="rgba(139,92,246,0.08)" />
      <text x="100" y="26" textAnchor="middle" fill="#c8c4d8" fontSize="9" fontWeight="bold">17 Rajab 1447</text>
      <text x="100" y="40" textAnchor="middle" fill="#8a82a0" fontSize="7">Wednesday · July 29, 2026</text>
      {/* Task list */}
      <text x="14" y="66" fill="#c8c4d8" fontSize="8" fontWeight="bold">Today's Tasks</text>
      {tasks.map((t, i) => (
        <g key={i}>
          <rect x="14" y={74 + i * 22} width="12" height="12" rx="6" fill={t.done ? '#22c55e' : 'none'} stroke={t.done ? 'none' : 'rgba(200,196,216,0.25)'} strokeWidth="1" />
          {t.done && <text x="20" y="83" textAnchor="middle" fill="white" fontSize="7">✓</text>}
          <text x="32" y={84 + i * 22} fill={t.done ? '#5a5270' : '#c8c4d8'} fontSize="6.5" textDecoration={t.done ? 'line-through' : 'none'}>{t.t}</text>
          <rect x={170} y={76 + i * 22} width="20" height="8" rx="2" fill="rgba(245,158,11,0.15)" />
          <text x={180} y={82 + i * 22} textAnchor="middle" fill="#f59e0b" fontSize="3.5">Medium</text>
        </g>
      ))}
      {/* Add task */}
      <rect x="14" y="184" width="172" height="12" rx="4" fill="none" stroke="rgba(139,92,246,0.15)" strokeWidth="0.5" strokeDasharray="2,2" />
      <text x="24" y="193" fill="#5a5270" fontSize="5">+ Add new task</text>
    </svg>
  );
}

function ChallengeTrackerPreview() {
  const cells = Array.from({ length: 49 }, (_, i) => ({
    filled: i % 3 === 0 || i % 7 === 0,
    intense: i % 5 === 0,
  }));
  return (
    <svg viewBox="0 0 200 400" className="w-full h-full">
      <rect width="200" height="400" fill="#0a0518" rx="8" />
      <text x="16" y="24" fill="#c8c4d8" fontSize="10" fontWeight="bold">Challenge: Read Daily</text>
      <text x="16" y="36" fill="#8a82a0" fontSize="7">Week 3 · Day 19 of 30</text>
      {/* Stats row */}
      <rect x="14" y="44" width="54" height="24" rx="4" fill="rgba(34,197,94,0.08)" />
      <text x="41" y="55" textAnchor="middle" fill="#22c55e" fontSize="10" fontWeight="bold">14</text>
      <text x="41" y="64" textAnchor="middle" fill="#86efac" fontSize="4">days streak</text>
      <rect x="73" y="44" width="54" height="24" rx="4" fill="rgba(139,92,246,0.08)" />
      <text x="100" y="55" textAnchor="middle" fill="#8b5cf6" fontSize="10" fontWeight="bold">19</text>
      <text x="100" y="64" textAnchor="middle" fill="#a78bfa" fontSize="4">of 30 done</text>
      <rect x="132" y="44" width="54" height="24" rx="4" fill="rgba(245,158,11,0.08)" />
      <text x="159" y="55" textAnchor="middle" fill="#f59e0b" fontSize="10" fontWeight="bold">63%</text>
      <text x="159" y="64" textAnchor="middle" fill="#fcd34d" fontSize="4">complete</text>
      {/* Grid header — weekdays */}
      {['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map((d,i) => (
        <text key={i} x={16 + i * 25} y={84} fill="#5a5270" fontSize="4.5" textAnchor="middle">{d}</text>
      ))}
      {/* Grid cells — 7 weeks x 7 days */}
      {cells.map((c, i) => {
        const x = 14 + (i % 7) * 25;
        const y = 91 + Math.floor(i / 7) * 22;
        return (
          <g key={i}>
            <rect x={x} y={y} width="20" height="18" rx="3" fill={
              c.intense ? '#22c55e' : c.filled ? 'rgba(34,197,94,0.4)' : 'rgba(255,255,255,0.04)'
            } stroke="rgba(139,92,246,0.06)" strokeWidth="0.3" />
            {c.intense && <text x={x + 10} y={y + 12} textAnchor="middle" fill="white" fontSize="6" fontWeight="bold">✓</text>}
          </g>
        );
      })}
      {/* Legend */}
      <text x="16" y={280} fill="#8a82a0" fontSize="5">Today: Day 19</text>
      <rect x="16" y="286" width="8" height="6" rx="1" fill="#22c55e" opacity="0.4" />
      <text x="28" y="292" fill="#5a5270" fontSize="4">Done</text>
      <rect x="48" y="286" width="8" height="6" rx="1" fill="#22c55e" />
      <text x="60" y="292" fill="#5a5270" fontSize="4">Streak</text>
      <rect x="88" y="286" width="8" height="6" rx="1" fill="rgba(255,255,255,0.04)" stroke="rgba(139,92,246,0.06)" strokeWidth="0.3" />
      <text x="100" y="292" fill="#5a5270" fontSize="4">Missed</text>
      {/* Bottom stats */}
      <rect x="14" y="310" width="172" height="40" rx="6" fill="rgba(139,92,246,0.06)" />
      <text x="30" y="328" fill="#c8c4d8" fontSize="6">Best streak: 21 days</text>
      <text x="30" y="342" fill="#8a82a0" fontSize="5">Consistency: 73%</text>
    </svg>
  );
}

function ActivityStatsPreview() {
  return (
    <svg viewBox="0 0 200 200" className="w-full h-full">
      <rect width="200" height="200" fill="#0a0518" rx="8" />
      <text x="14" y="22" fill="#c8c4d8" fontSize="10" fontWeight="bold">Activity</text>
      {/* Pie chart */}
      <circle cx="60" cy="80" r="36" fill="none" stroke="rgba(139,92,246,0.1)" strokeWidth="10" />
      <circle cx="60" cy="80" r="36" fill="none" stroke="#8b5cf6" strokeWidth="10" strokeDasharray="80 226" strokeDashoffset="20" transform="rotate(-90 60 80)" />
      <circle cx="60" cy="80" r="36" fill="none" stroke="#22c55e" strokeWidth="10" strokeDasharray="60 226" strokeDashoffset="140" transform="rotate(-90 60 80)" />
      <circle cx="60" cy="80" r="36" fill="none" stroke="#f59e0b" strokeWidth="10" strokeDasharray="40 226" strokeDashoffset="220" transform="rotate(-90 60 80)" />
      <circle cx="60" cy="80" r="36" fill="none" stroke="#0ea5e9" strokeWidth="10" strokeDasharray="46 226" strokeDashoffset="290" transform="rotate(-90 60 80)" />
      {/* Center text */}
      <text x="60" y="78" textAnchor="middle" fill="#c8c4d8" fontSize="12" fontWeight="bold">12h</text>
      <text x="60" y="88" textAnchor="middle" fill="#8a82a0" fontSize="5">focus</text>
      {/* Legend */}
      {[
        { label: 'Reading', color: '#8b5cf6', v: '4.2h' },
        { label: 'Coding', color: '#22c55e', v: '3.1h' },
        { label: 'Studying', color: '#f59e0b', v: '2.0h' },
        { label: 'Other', color: '#0ea5e9', v: '2.7h' },
      ].map((item, i) => (
        <g key={i}>
          <circle cx={120} cy={46 + i * 18} r="4" fill={item.color} opacity="0.8" />
          <text x={130} y={50 + i * 18} fill="#c8c4d8" fontSize="6">{item.label}</text>
          <text x={185} y={50 + i * 18} textAnchor="end" fill="#8a82a0" fontSize="6">{item.v}</text>
        </g>
      ))}
      {/* Sessions today */}
      <rect x="14" y="130" width="172" height="28" rx="6" fill="rgba(139,92,246,0.06)" />
      <text x="22" y="144" fill="#c8c4d8" fontSize="7">Sessions today: 6</text>
      <text x="22" y="154" fill="#8a82a0" fontSize="5">Avg session: 25 min</text>
      {/* Bar mini chart */}
      <rect x="14" y="166" width="20" height="12" rx="2" fill="#8b5cf6" opacity="0.5" />
      <rect x="38" y="160" width="20" height="18" rx="2" fill="#22c55e" opacity="0.5" />
      <rect x="62" y="155" width="20" height="23" rx="2" fill="#f59e0b" opacity="0.5" />
      <rect x="86" y="162" width="20" height="16" rx="2" fill="#0ea5e9" opacity="0.5" />
      <rect x="110" y="168" width="20" height="10" rx="2" fill="#ec4899" opacity="0.5" />
    </svg>
  );
}

function DashboardPreview() {
  return (
    <svg viewBox="0 0 380 200" className="w-full h-full">
      <rect width="380" height="200" fill="#0a0518" rx="8" />
      <text x="16" y="22" fill="#c8c4d8" fontSize="10" fontWeight="bold">Dashboard</text>
      {/* Stat cards */}
      {[
        { label: 'Quran Today', v: '2 pages', c: '#d4a853', x: 0 },
        { label: 'Focus Today', v: '1h 25m', c: '#8b5cf6', x: 1 },
        { label: 'Tasks Done', v: '4 of 7', c: '#22c55e', x: 2 },
        { label: 'Books Read', v: '3 this week', c: '#0ea5e9', x: 3 },
      ].map((s, i) => (
        <g key={i}>
          <rect x={12 + i * 91} y="32" width="84" height="40" rx="6" fill="rgba(255,255,255,0.03)" stroke={`${s.c}22`} strokeWidth="0.5" />
          <circle cx={24 + i * 91} cy={44} r="3" fill={s.c} opacity="0.6" />
          <text x={22 + i * 91} y={56} fill="#c8c4d8" fontSize="12" fontWeight="bold">{s.v}</text>
          <text x={22 + i * 91} y={67} fill="#8a82a0" fontSize="5">{s.label}</text>
        </g>
      ))}
      {/* Quick links row */}
      <text x="16" y="90" fill="#c8c4d8" fontSize="8" fontWeight="bold">Quick Access</text>
      {[
        { label: 'Quran', c: '#d4a853', icon: '۞' },
        { label: 'Timer', c: '#8b5cf6', icon: '⏱' },
        { label: 'Tasks', c: '#22c55e', icon: '☐' },
        { label: 'Library', c: '#0ea5e9', icon: '📚' },
        { label: 'Kanban', c: '#f59e0b', icon: '≡' },
      ].map((q, i) => (
        <g key={i}>
          <rect x={14 + i * 72} y={98} width="64" height="20" rx="5" fill="rgba(255,255,255,0.03)" stroke="rgba(139,92,246,0.08)" strokeWidth="0.5" />
          <text x={22 + i * 72} y={112} fill={q.c} fontSize="8">{q.icon}</text>
          <text x={34 + i * 72} y={112} fill="#c8c4d8" fontSize="6">{q.label}</text>
        </g>
      ))}
      {/* Activity feed */}
      <text x="16" y="140" fill="#c8c4d8" fontSize="8" fontWeight="bold">Recent Activity</text>
      {[
        { t: 'Completed Focus Session', time: '2 min ago', c: '#8b5cf6' },
        { t: 'Read Al-Fatiha', time: '15 min ago', c: '#d4a853' },
        { t: 'Added task "Review PRs"', time: '1h ago', c: '#22c55e' },
      ].map((a, i) => (
        <g key={i}>
          <circle cx={20} cy={156 + i * 16} r="3" fill={a.c} opacity="0.5" />
          <text x={30} y={160 + i * 16} fill="#c8c4d8" fontSize="6">{a.t}</text>
          <text x={370} y={160 + i * 16} textAnchor="end" fill="#5a5270" fontSize="5">{a.time}</text>
        </g>
      ))}
    </svg>
  );
}

function ProfilePreview() {
  return (
    <svg viewBox="0 0 200 200" className="w-full h-full">
      <rect width="200" height="200" fill="#0a0518" rx="8" />
      {/* Cover bg */}
      <rect x="0" y="0" width="200" height="60" fill="url(#qbg)" opacity="0.5" rx="8" />
      <rect x="0" y="30" width="200" height="30" fill="url(#qbg)" opacity="0.3" />
      {/* Avatar */}
      <circle cx="100" cy="50" r="28" fill="#2a1f4a" stroke="rgba(139,92,246,0.2)" strokeWidth="2" />
      <circle cx="100" cy="42" r="10" fill="#8b5cf6" opacity="0.6" />
      <ellipse cx="100" cy="58" rx="14" ry="8" fill="#8b5cf6" opacity="0.3" />
      {/* Username */}
      <text x="100" y="90" textAnchor="middle" fill="#c8c4d8" fontSize="12" fontWeight="bold">testuser2026</text>
      <text x="100" y="104" textAnchor="middle" fill="#8a82a0" fontSize="7">testuser2026 · Joined 2026</text>
      {/* Stats row */}
      {[
        { label: 'Sessions', v: '47' },
        { label: 'Tasks', v: '128' },
        { label: 'Books', v: '12' },
        { label: 'Streak', v: '14d' },
      ].map((s, i) => (
        <g key={i}>
          <text x={30 + i * 44} y={130} textAnchor="middle" fill="#c8c4d8" fontSize="11" fontWeight="bold">{s.v}</text>
          <text x={30 + i * 44} y={140} textAnchor="middle" fill="#8a82a0" fontSize="5">{s.label}</text>
          {i < 3 && <line x1={55 + i * 44} y1={120} x2={55 + i * 44} y2={142} stroke="rgba(139,92,246,0.1)" strokeWidth="0.5" />}
        </g>
      ))}
      {/* Bio */}
      <rect x="14" y="152" width="172" height="24" rx="4" fill="rgba(139,92,246,0.04)" stroke="rgba(139,92,246,0.06)" strokeWidth="0.5" />
      <text x="100" y="164" textAnchor="middle" fill="#c8c4d8" fontSize="5">"Building in public · Learning daily"</text>
      <text x="100" y="172" textAnchor="middle" fill="#5a5270" fontSize="4">Frontend Developer · Open Source</text>
      {/* Edit button */}
      <rect x="70" y="184" width="60" height="12" rx="6" fill="rgba(139,92,246,0.15)" />
      <text x="100" y="193" textAnchor="middle" fill="#8b5cf6" fontSize="5">Edit Profile</text>
    </svg>
  );
}

const screenshots = [
  { preview: <QuranPreview />, title: 'Quran Reader', desc: 'Full Mushaf with audio & memorization', size: 'tall' },
  { preview: <LiveTimerPreview />, title: 'Focus Timer', desc: 'Pomodoro with floating mini-player', size: 'wide' },
  { preview: <BookLibraryPreview />, title: 'Book Library', desc: 'Track books with notes & progress', size: 'square' },
  { preview: <KanbanPreview />, title: 'Kanban Board', desc: 'Visual drag-and-drop task management', size: 'wide' },
  { preview: <DailyTasksPreview />, title: 'Daily Tasks', desc: 'Plan your day with dual calendar', size: 'square' },
  { preview: <ChallengeTrackerPreview />, title: 'Challenges', desc: 'Build habits with streaks & grids', size: 'tall' },
  { preview: <ActivityStatsPreview />, title: 'Activity Stats', desc: 'Track productivity with analytics', size: 'square' },
  { preview: <DashboardPreview />, title: 'Dashboard', desc: 'Central hub for all features', size: 'wide' },
  { preview: <ProfilePreview />, title: 'Profile', desc: 'Public profile with stats & username', size: 'square' },
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

export function LandingPage({ onLogin, onRegister }: LandingPageProps) {
  const [lightboxImg, setLightboxImg] = useState<string | null>(null);
  const [lightboxTitle, setLightboxTitle] = useState('');
  const [wallpaperIndex, setWallpaperIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setWallpaperIndex(prev => (prev + 1) % wallpapers.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

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
          <img src="/logo.png" alt="Bait El-Hakma" className="landing-nav-logo" />
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

      {/* Hero */}
      <section className="landing-hero">
        <div className="landing-wallpaper">
          {wallpapers.map((url, i) => (
            <div
              key={url}
              className={`landing-wallpaper-slide${i === wallpaperIndex ? ' active' : ''}`}
              style={{ backgroundImage: `url(${url})` }}
            />
          ))}
          <div className="landing-wallpaper-overlay" />
        </div>
        <div className="landing-hero-glow" />
        <motion.div
          className="landing-hero-badge"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <span className="landing-hero-badge-dot" />
          <Sparkles className="w-3.5 h-3.5" />
          Free & Open — No ads, no tracking
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
        >
          <span className="gradient-text">Bait El-Hakma</span>
          <span className="arabic-text">بيت الحكمة</span>
        </motion.h1>

        <motion.p
          className="landing-hero-sub"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4 }}
        >
          Your intelligent productivity companion. Read the Quran with audio, manage tasks,
          track books, build habits — all beautifully designed and securely synced.
        </motion.p>

        <motion.div
          className="landing-hero-actions"
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
          className="landing-hero-stats"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.6 }}
        >
          <div className="landing-hero-stat">
            <div className="landing-hero-stat-num">114</div>
            <div className="landing-hero-stat-label">Surahs</div>
          </div>
          <div className="landing-hero-stat">
            <div className="landing-hero-stat-num">6,236</div>
            <div className="landing-hero-stat-label">Ayahs</div>
          </div>
          <div className="landing-hero-stat">
            <div className="landing-hero-stat-num">13</div>
            <div className="landing-hero-stat-label">Reciters</div>
          </div>
          <div className="landing-hero-stat">
            <div className="landing-hero-stat-num">8</div>
            <div className="landing-hero-stat-label">Tools</div>
          </div>
        </motion.div>
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
              onClick={() => { if (s.title !== 'Focus Timer') { setLightboxImg('#'); setLightboxTitle(s.title); } }}
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
            <img src="/logo.png" alt="Bait El-Hakma" />
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
