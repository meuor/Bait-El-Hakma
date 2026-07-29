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

// Inline feature preview SVGs — realistic screenshot-like representations of each tab
function PomodoroPreview() {
  const radius = 54, circ = 2 * Math.PI * radius, offset = circ * 0.35;
  return (
    <svg viewBox="0 0 380 400" className="w-full h-full">
      <rect width="380" height="400" fill="#0a0518" rx="8" />
      <rect x="10" y="10" width="360" height="44" rx="6" fill="rgba(139,92,246,0.08)" />
      <text x="24" y="38" fill="#c8c4d8" fontSize="13" fontWeight="bold">Focus Timer</text>
      <circle cx="280" cy="32" r="12" fill="rgba(139,92,246,0.15)" /><text x="280" y="37" textAnchor="middle" fill="#a78bfa" fontSize="9">⏱</text>
      <circle cx="310" cy="32" r="12" fill="rgba(34,197,94,0.15)" /><text x="310" y="37" textAnchor="middle" fill="#22c55e" fontSize="9">✓</text>
      <circle cx="340" cy="32" r="12" fill="rgba(239,68,68,0.15)" /><text x="340" y="37" textAnchor="middle" fill="#ef4444" fontSize="9">✕</text>
      {/* Timer ring */}
      <g transform="translate(190,210)">
        <circle cx="0" cy="0" r={radius} fill="none" stroke="rgba(139,92,246,0.12)" strokeWidth="6" />
        <circle cx="0" cy="0" r={radius} fill="none" stroke="#8b5cf6" strokeWidth="6" strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={offset} transform="rotate(-90)" />
        <text x="0" y="-8" textAnchor="middle" fill="#c8c4d8" fontSize="28" fontFamily="monospace" fontWeight="bold">18:42</text>
        <text x="0" y="14" textAnchor="middle" fill="#8a82a0" fontSize="9">Focus Session · 3/4</text>
      </g>
      {/* Activity selector */}
      <rect x="20" y="290" width="130" height="28" rx="6" fill="rgba(139,92,246,0.08)" stroke="rgba(139,92,246,0.15)" strokeWidth="0.5" />
      <text x="30" y="309" fill="#a78bfa" fontSize="8">📖 Reading</text>
      <rect x="158" y="290" width="100" height="28" rx="6" fill="rgba(16,185,129,0.08)" stroke="rgba(16,185,129,0.15)" strokeWidth="0.5" />
      <text x="170" y="309" fill="#34d399" fontSize="8">🧠 Study</text>
      <rect x="266" y="290" width="94" height="28" rx="6" fill="rgba(245,158,11,0.08)" stroke="rgba(245,158,11,0.15)" strokeWidth="0.5" />
      <text x="280" y="309" fill="#f59e0b" fontSize="8">💻 Code</text>
      {/* Theme swatches */}
      <text x="20" y="350" fill="#8a82a0" fontSize="8">Themes</text>
      {['#8b5cf6','#0ea5e9','#22c55e','#f97316','#ec4899','#f59e0b'].map((c,i) => (
        <circle key={i} cx={20 + i * 26} cy={370} r="7" fill={c} opacity="0.6" stroke={i===0?'white':'none'} strokeWidth="1.5" />
      ))}
      {/* Stats */}
      <rect x="200" y="340" width="160" height="40" rx="6" fill="rgba(139,92,246,0.05)" />
      <text x="210" y="358" fill="#8a82a0" fontSize="7">Today: 2h 15m · 4 sessions</text>
      <text x="210" y="373" fill="#8a82a0" fontSize="7">Streak: 7 days</text>
    </svg>
  );
}

function FocusVideoPreview() {
  return (
    <svg viewBox="0 0 380 400" className="w-full h-full">
      <rect width="380" height="400" fill="#0a0518" rx="8" />
      {/* Video player area */}
      <rect x="10" y="10" width="360" height="200" rx="8" fill="#1a1a2e" />
      <rect x="170" y="95" width="40" height="30" rx="6" fill="rgba(255,255,255,0.1)" />
      <polygon points="182,100 182,120 198,110" fill="rgba(255,255,255,0.5)" />
      <text x="190" y="155" textAnchor="middle" fill="#8a82a0" fontSize="8">YouTube Focus Mix</text>
      {/* Player controls */}
      <rect x="10" y="218" width="360" height="32" rx="6" fill="rgba(139,92,246,0.06)" />
      <rect x="20" y="225" width="340" height="4" rx="2" fill="rgba(139,92,246,0.12)" />
      <rect x="20" y="225" width="120" height="4" rx="2" fill="#8b5cf6" />
      <text x="24" y="250" fill="#8a82a0" fontSize="6">0:00 / 30:00</text>
      <circle cx="340" cy="234" r="8" fill="rgba(139,92,246,0.15)" /><text x="340" y="239" textAnchor="middle" fill="#a78bfa" fontSize="7">▶</text>
      {/* Suggested videos grid */}
      <text x="16" y="282" fill="#c8c4d8" fontSize="10" fontWeight="bold">Suggested</text>
      {[0,1,2,3,4,5].map(i => (
        <g key={i}>
          <rect x={16 + (i%3)*118} y={290 + Math.floor(i/3)*52} width="108" height="44" rx="6" fill="rgba(255,255,255,0.03)" stroke="rgba(139,92,246,0.06)" strokeWidth="0.5" />
          <rect x={16 + (i%3)*118} y={290 + Math.floor(i/3)*52} width="40" height="44" rx="6" fill="#8b5cf6" opacity="0.15" />
          <text x={36 + (i%3)*118} y={312 + Math.floor(i/3)*52} textAnchor="middle" fill="#a78bfa" fontSize="10">▶</text>
          <text x={62 + (i%3)*118} y={307 + Math.floor(i/3)*52} fill="#c8c4d8" fontSize="6" fontWeight="bold">{['Lofi Beats','Rainy Jazz','Deep Focus','Nature','Piano','Coffee Shop'][i]}</text>
          <text x={62 + (i%3)*118} y={322 + Math.floor(i/3)*52} fill="#6b6380" fontSize="5">Music · 30 min</text>
        </g>
      ))}
      {/* Pin / Focus button */}
      <rect x="260" y="270" width="100" height="22" rx="6" fill="rgba(139,92,246,0.15)" />
      <text x="310" y="285" textAnchor="middle" fill="#a78bfa" fontSize="8" fontWeight="bold">Focus Mode</text>
    </svg>
  );
}

function KanbanPreview() {
  const cols = [
    { label: 'To Do', cards: ['Design landing', 'Write API', 'Setup CI'], color: '#8b5cf6', count: 3 },
    { label: 'In Progress', cards: ['Fix auth bug', 'Build chart'], color: '#f59e0b', count: 2 },
    { label: 'Done', cards: ['Init project', 'Setup DB', 'Create logo', 'Add tests'], color: '#22c55e', count: 4 },
  ];
  return (
    <svg viewBox="0 0 380 400" className="w-full h-full">
      <rect width="380" height="400" fill="#0a0518" rx="8" />
      <rect x="10" y="10" width="360" height="36" rx="6" fill="rgba(139,92,246,0.06)" />
      <text x="24" y="34" fill="#c8c4d8" fontSize="12" fontWeight="bold">Kanban Board</text>
      <text x="350" y="34" textAnchor="end" fill="#8a82a0" fontSize="8">9 cards</text>
      <rect x="310" y="18" width="50" height="18" rx="4" fill="rgba(139,92,246,0.12)" />
      <text x="335" y="31" textAnchor="middle" fill="#a78bfa" fontSize="7">+ Add</text>
      {cols.map((col, ci) => (
        <g key={ci}>
          <rect x={10 + ci * 125} y="54" width="117" height="336" rx="6" fill="rgba(255,255,255,0.02)" stroke="rgba(139,92,246,0.06)" strokeWidth="0.5" />
          <rect x={10 + ci * 125} y="54" width="3" height="20" rx="1.5" fill={col.color} opacity="0.6" />
          <text x={22 + ci * 125} y="68" fill="#c8c4d8" fontSize="9" fontWeight="bold">{col.label}</text>
          <circle cx={108 + ci * 125} cy={65} r="8" fill="rgba(255,255,255,0.05)" />
          <text x={108 + ci * 125} y={69} textAnchor="middle" fill="#8a82a0" fontSize="7">{col.count}</text>
          {col.cards.map((card, i) => (
            <g key={i}>
              <rect x={18 + ci * 125} y={82 + i * 70} width="101" height="62" rx="5" fill="rgba(255,255,255,0.04)" stroke="rgba(139,92,246,0.06)" strokeWidth="0.5" />
              <rect x={18 + ci * 125} y={82 + i * 70} width="3" height="62" rx="1.5" fill={col.color} opacity="0.4" />
              <text x={26 + ci * 125} y={102 + i * 70} fill="#c8c4d8" fontSize="7" fontWeight="bold">{card}</text>
              <rect x={26 + ci * 125} y={112 + i * 70} width="26" height="8" rx="3" fill={col.color + '25'} />
              <text x={39 + ci * 125} y={119 + i * 70} textAnchor="middle" fill={col.color} fontSize="4.5" fontWeight="bold">{['FE','API','DevOps','Design'][i%4]}</text>
              <rect x={58 + ci * 125} y={112 + i * 70} width="20" height="8" rx="3" fill="rgba(245,158,11,0.15)" />
              <text x={68 + ci * 125} y={119 + i * 70} textAnchor="middle" fill="#f59e0b" fontSize="4.5">{['High','Med','Low','High'][i%4]}</text>
            </g>
          ))}
        </g>
      ))}
    </svg>
  );
}

function LibraryPreview() {
  return (
    <svg viewBox="0 0 380 400" className="w-full h-full">
      <rect width="380" height="400" fill="#0a0518" rx="8" />
      {/* Search bar */}
      <rect x="10" y="10" width="260" height="32" rx="8" fill="rgba(255,255,255,0.04)" stroke="rgba(139,92,246,0.08)" strokeWidth="0.5" />
      <text x="24" y="31" fill="#5a5270" fontSize="9">🔍 Search library...</text>
      <rect x="280" y="10" width="90" height="32" rx="8" fill="rgba(139,92,246,0.12)" />
      <text x="325" y="31" textAnchor="middle" fill="#a78bfa" fontSize="9" fontWeight="bold">+ Add Book</text>
      {/* Filter chips */}
      {['All','Reading','Completed','Want'].map((f,i) => (
        <g key={i}>
          <rect x={10 + i * 56} y="50" width="50" height="20" rx="6" fill={i===0?'rgba(139,92,246,0.15)':'rgba(255,255,255,0.03)'} />
          <text x={35 + i * 56} y="64" textAnchor="middle" fill={i===0?'#a78bfa':'#5a5270'} fontSize="7" fontWeight="bold">{f}</text>
        </g>
      ))}
      {/* Book grid */}
      {[
        { t: 'Atomic Habits', a: 'James Clear', p: 72, c: '#8b5cf6' },
        { t: 'Deep Work', a: 'Cal Newport', p: 45, c: '#0ea5e9' },
        { t: 'The Alchemist', a: 'Paulo Coelho', p: 90, c: '#f59e0b' },
        { t: 'Sapiens', a: 'Yuval Harari', p: 34, c: '#22c55e' },
        { t: '1984', a: 'George Orwell', p: 100, c: '#ef4444' },
        { t: 'Quran', a: 'Translation', p: 15, c: '#d4a853' },
      ].map((b, i) => (
        <g key={i}>
          <rect x={10 + (i%3)*124} y={82 + Math.floor(i/3)*100} width="114" height="90" rx="6" fill="rgba(255,255,255,0.03)" stroke="rgba(139,92,246,0.06)" strokeWidth="0.5" />
          <rect x={16 + (i%3)*124} y={88 + Math.floor(i/3)*100} width="28" height="38" rx="3" fill={b.c} opacity="0.5" />
          <text x={30 + (i%3)*124} y={110 + Math.floor(i/3)*100} textAnchor="middle" fill="white" fontSize="8" fontWeight="bold">{b.t[0]}</text>
          <text x={50 + (i%3)*124} y={102 + Math.floor(i/3)*100} fill="#c8c4d8" fontSize="7" fontWeight="bold">{b.t}</text>
          <text x={50 + (i%3)*124} y={114 + Math.floor(i/3)*100} fill="#8a82a0" fontSize="6">{b.a}</text>
          {/* Progress bar */}
          <rect x={50 + (i%3)*124} y={124 + Math.floor(i/3)*100} width="66" height="4" rx="2" fill="rgba(255,255,255,0.06)" />
          <rect x={50 + (i%3)*124} y={124 + Math.floor(i/3)*100} width={66 * b.p / 100} height="4" rx="2" fill={b.c} />
          <text x={50 + (i%3)*124} y={140 + Math.floor(i/3)*100} fill="#5a5270" fontSize="6">{b.p}% complete</text>
        </g>
      ))}
      {/* Reading stats */}
      <rect x="10" y="382" width="360" height="1" rx="0.5" fill="rgba(139,92,246,0.08)" />
      <text x="16" y="395" fill="#8a82a0" fontSize="7">📚 6 books · 3 in progress · 1,245 pages read</text>
    </svg>
  );
}

function TasksPreview() {
  const tasks = [
    { t: 'Read Quran (Juz 1)', done: true, p: 'high', cat: 'ibadah' },
    { t: 'Review PR #42', done: true, p: 'high', cat: 'work' },
    { t: 'Write progress report', done: false, p: 'medium', cat: 'work' },
    { t: 'Study React 19', done: false, p: 'medium', cat: 'study' },
    { t: 'Buy groceries', done: false, p: 'low', cat: 'personal' },
    { t: 'Plan weekend trip', done: false, p: 'low', cat: 'personal' },
  ];
  return (
    <svg viewBox="0 0 380 400" className="w-full h-full">
      <rect width="380" height="400" fill="#0a0518" rx="8" />
      {/* Header */}
      <rect x="10" y="10" width="360" height="36" rx="6" fill="rgba(139,92,246,0.06)" />
      <text x="24" y="34" fill="#c8c4d8" fontSize="12" fontWeight="bold">Today's Tasks</text>
      <text x="330" y="34" fill="#8a82a0" fontSize="8">2/6 done</text>
      {/* Dual calendar */}
      <rect x="10" y="54" width="360" height="30" rx="6" fill="rgba(139,92,246,0.04)" />
      <text x="24" y="72" fill="#c8c4d8" fontSize="8" fontWeight="bold">Wed, Jul 29</text>
      <text x="190" y="72" textAnchor="middle" fill="#a78bfa" fontSize="8">17 Rajab 1447</text>
      <text x="350" y="72" textAnchor="end" fill="#8a82a0" fontSize="7">◀  ▶</text>
      {/* Filters */}
      {['All','Today','Important','Done'].map((f,i) => (
        <g key={i}>
          <rect x={10 + i * 58} y="90" width="52" height="20" rx="6" fill={i===0?'rgba(139,92,246,0.15)':'rgba(255,255,255,0.03)'} />
          <text x={36 + i * 58} y="104" textAnchor="middle" fill={i===0?'#a78bfa':'#5a5270'} fontSize="7" fontWeight="bold">{f}</text>
        </g>
      ))}
      {/* Tasks */}
      {tasks.map((t, i) => (
        <g key={i}>
          <rect x={10} y={118 + i * 34} width="360" height="28" rx="5" fill={t.done?'rgba(34,197,94,0.03)':'rgba(255,255,255,0.02)'} />
          <rect x={20} y={127 + i * 34} width="14" height="14" rx="7" fill={t.done?'#22c55e':'none'} stroke={t.done?'none':'rgba(200,196,216,0.2)'} strokeWidth="1.2" />
          {t.done && <text x="27" y="138" textAnchor="middle" fill="white" fontSize="9">✓</text>}
          <text x={42} y={137 + i * 34} fill={t.done?'#5a5270':'#c8c4d8'} fontSize="7.5" textDecoration={t.done?'line-through':'none'}>{t.t}</text>
          <rect x={280} y={126 + i * 34} width="30" height="12" rx="4" fill={t.p==='high'?'rgba(239,68,68,0.15)':t.p==='medium'?'rgba(245,158,11,0.15)':'rgba(148,163,184,0.15)'} />
          <text x={295} y={135 + i * 34} textAnchor="middle" fill={t.p==='high'?'#ef4444':t.p==='medium'?'#f59e0b':'#94a3b8'} fontSize="5" fontWeight="bold">{t.p.toUpperCase()}</text>
          <rect x={318} y={126 + i * 34} width="36" height="12" rx="4" fill="rgba(139,92,246,0.1)" />
          <text x={336} y={135 + i * 34} textAnchor="middle" fill="#a78bfa" fontSize="5">{t.cat}</text>
          <rect x={358} y={127 + i * 34} width="6" height="6" rx="3" fill={t.done?'#22c55e':'rgba(255,255,255,0.1)'} />
        </g>
      ))}
      {/* Add task */}
      <rect x="10" y="320" width="360" height="28" rx="6" fill="none" stroke="rgba(139,92,246,0.1)" strokeWidth="0.5" strokeDasharray="3,3" />
      <text x="24" y="339" fill="#5a5270" fontSize="8">+ Add new task...</text>
      {/* Bottom stats */}
      <rect x="10" y="356" width="360" height="34" rx="6" fill="rgba(139,92,246,0.04)" />
      <text x="24" y="370" fill="#8a82a0" fontSize="7">🎯 Focus: 4 remaining · ⏱ 1h 25m today</text>
      <text x="24" y="382" fill="#5a5270" fontSize="6">Completed: 12 this week</text>
    </svg>
  );
}

function StatsPreview() {
  return (
    <svg viewBox="0 0 380 400" className="w-full h-full">
      <rect width="380" height="400" fill="#0a0518" rx="8" />
      <text x="16" y="26" fill="#c8c4d8" fontSize="12" fontWeight="bold">Activity Stats</text>
      <rect x="290" y="12" width="80" height="20" rx="6" fill="rgba(139,92,246,0.1)" />
      <text x="330" y="26" textAnchor="middle" fill="#a78bfa" fontSize="7">This Week ▶</text>
      {/* Summary cards */}
      {[
        { v: '12h 30m', l: 'Focus Time', c: '#8b5cf6', x: 0 },
        { v: '18', l: 'Sessions', c: '#22c55e', x: 1 },
        { v: '32', l: 'Tasks Done', c: '#f59e0b', x: 2 },
        { v: '7d', l: 'Streak', c: '#0ea5e9', x: 3 },
      ].map((s, i) => (
        <g key={i}>
          <rect x={12 + i * 91} y="40" width="84" height="44" rx="6" fill="rgba(255,255,255,0.02)" stroke={`${s.c}15`} strokeWidth="0.5" />
          <text x={20 + i * 91} y="56" fill={s.c} fontSize="14" fontWeight="bold">{s.v}</text>
          <text x={20 + i * 91} y="72" fill="#8a82a0" fontSize="7">{s.l}</text>
        </g>
      ))}
      {/* Activity chart */}
      <text x="16" y="108" fill="#c8c4d8" fontSize="9" fontWeight="bold">Focus Time (this week)</text>
      <rect x="12" y="114" width="356" height="80" rx="6" fill="rgba(139,92,246,0.03)" />
      {[40, 65, 30, 80, 55, 70, 45].map((h, i) => (
        <g key={i}>
          <rect x={24 + i * 48} y={182 - h * 0.8} width="28" height={h * 0.8} rx="3" fill="#8b5cf6" opacity={0.4 + h/200} />
          <text x={38 + i * 48} y={190} textAnchor="middle" fill="#5a5270" fontSize="5">{['Mon','Tue','Wed','Thu','Fri','Sat','Sun'][i]}</text>
        </g>
      ))}
      {/* Pie chart */}
      <text x="16" y="218" fill="#c8c4d8" fontSize="9" fontWeight="bold">Activity Breakdown</text>
      <circle cx="80" cy="270" r="40" fill="none" stroke="rgba(139,92,246,0.08)" strokeWidth="12" />
      <circle cx="80" cy="270" r="40" fill="none" stroke="#8b5cf6" strokeWidth="12" strokeDasharray="70 251" strokeDashoffset="20" transform="rotate(-90 80 270)" />
      <circle cx="80" cy="270" r="40" fill="none" stroke="#22c55e" strokeWidth="12" strokeDasharray="55 251" strokeDashoffset="110" transform="rotate(-90 80 270)" />
      <circle cx="80" cy="270" r="40" fill="none" stroke="#f59e0b" strokeWidth="12" strokeDasharray="45 251" strokeDashoffset="190" transform="rotate(-90 80 270)" />
      <circle cx="80" cy="270" r="40" fill="none" stroke="#0ea5e9" strokeWidth="12" strokeDasharray="35 251" strokeDashoffset="260" transform="rotate(-90 80 270)" />
      <text x="80" y="268" textAnchor="middle" fill="#c8c4d8" fontSize="10" fontWeight="bold">12h</text>
      {[
        { l: 'Reading', c: '#8b5cf6', v: '4.2h' },
        { l: 'Studying', c: '#22c55e', v: '3.1h' },
        { l: 'Coding', c: '#f59e0b', v: '2.5h' },
        { l: 'Other', c: '#0ea5e9', v: '2.2h' },
      ].map((item, i) => (
        <g key={i}>
          <circle cx={150} cy={244 + i * 24} r="5" fill={item.c} opacity="0.7" />
          <text x={162} y={248 + i * 24} fill="#c8c4d8" fontSize="7">{item.l}</text>
          <text x={350} y={248 + i * 24} textAnchor="end" fill="#8a82a0" fontSize="7">{item.v}</text>
        </g>
      ))}
      {/* Recent activity */}
      <text x="16" y="358" fill="#c8c4d8" fontSize="9" fontWeight="bold">Recent</text>
      {[
        { t: 'Completed focus session', time: '2m ago' },
        { t: 'Read Surah Al-Kahf', time: '15m ago' },
        { t: 'Added task "Review PR"', time: '1h ago' },
      ].map((a, i) => (
        <g key={i}>
          <circle cx={20} cy={374 + i * 14} r="3" fill="#8b5cf6" opacity="0.4" />
          <text x={30} y={378 + i * 14} fill="#8a82a0" fontSize="6.5">{a.t}</text>
          <text x={360} y={378 + i * 14} textAnchor="end" fill="#5a5270" fontSize="6">{a.time}</text>
        </g>
      ))}
    </svg>
  );
}

function InspirePreview() {
  return (
    <svg viewBox="0 0 380 400" className="w-full h-full">
      <rect width="380" height="400" fill="#0a0518" rx="8" />
      <defs><linearGradient id="inbg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#1a1a2e"/><stop offset="100%" stopColor="#0f0f1a"/></linearGradient></defs>
      {/* Quran verse card */}
      <rect x="10" y="10" width="360" height="130" rx="8" fill="url(#inbg)" stroke="rgba(212,168,83,0.15)" strokeWidth="0.5" />
      <rect x="10" y="10" width="360" height="3" rx="1.5" fill="#d4a853" opacity="0.4" />
      <text x="190" y="36" textAnchor="middle" fill="#d4a853" fontSize="10" fontWeight="bold">۞ القرآن الكريم ۞</text>
      <text x="190" y="65" textAnchor="middle" fill="#c8c4d8" fontSize="10" fontFamily="serif">وَمَن يَتَوَكَّلْ عَلَى ٱللَّهِ فَهُوَ حَسْبُهُۥٓ</text>
      <text x="190" y="84" textAnchor="middle" fill="#8a82a0" fontSize="7" fontStyle="italic">"And whoever relies upon Allah — He is sufficient for him."</text>
      <text x="190" y="102" textAnchor="middle" fill="#a78bfa" fontSize="7">— Surah At-Talaq (65:3)</text>
      <rect x="290" y="110" width="60" height="18" rx="5" fill="rgba(212,168,83,0.12)" />
      <text x="320" y="123" textAnchor="middle" fill="#d4a853" fontSize="7">🔊 Play</text>
      {/* Hadith card */}
      <rect x="10" y="150" width="175" height="120" rx="8" fill="rgba(255,255,255,0.02)" stroke="rgba(139,92,246,0.08)" strokeWidth="0.5" />
      <text x="97" y="174" textAnchor="middle" fill="#a78bfa" fontSize="9" fontWeight="bold">Hadith</text>
      <text x="97" y="198" textAnchor="middle" fill="#c8c4d8" fontSize="7" fontFamily="serif">إِنَّمَا الْأَعْمَالُ بِالنِّيَّاتِ</text>
      <text x="97" y="215" textAnchor="middle" fill="#8a82a0" fontSize="6" fontStyle="italic">"Actions are but by intentions"</text>
      <text x="97" y="240" textAnchor="middle" fill="#5a5270" fontSize="6">— Bukhari & Muslim</text>
      <rect x="110" y="248" width="60" height="16" rx="5" fill="rgba(139,92,246,0.1)" />
      <text x="140" y="260" textAnchor="middle" fill="#a78bfa" fontSize="6">Save</text>
      {/* Quote card */}
      <rect x="195" y="150" width="175" height="120" rx="8" fill="rgba(255,255,255,0.02)" stroke="rgba(16,185,129,0.08)" strokeWidth="0.5" />
      <text x="282" y="174" textAnchor="middle" fill="#34d399" fontSize="9" fontWeight="bold">Quote of the Day</text>
      <text x="282" y="200" textAnchor="middle" fill="#c8c4d8" fontSize="7" fontStyle="italic">"The best of you are those who learn the Quran and teach it."</text>
      <text x="282" y="240" textAnchor="middle" fill="#5a5270" fontSize="6">— Prophet Muhammad ﷺ</text>
      {/* Daily inspiration */}
      <rect x="10" y="280" width="360" height="40" rx="6" fill="rgba(139,92,246,0.04)" />
      <text x="24" y="298" fill="#8a82a0" fontSize="7">Today's Reminder</text>
      <text x="24" y="312" fill="#c8c4d8" fontSize="8">"Do not grieve; indeed Allah is with us." (9:40)</text>
      {/* Category tabs */}
      {['Quran','Hadith','Quotes','Dua'].map((c,i) => (
        <g key={i}>
          <rect x={10 + i * 88} y="328" width="82" height="24" rx="6" fill={i===0?'rgba(212,168,83,0.15)':'rgba(255,255,255,0.03)'} />
          <text x={51 + i * 88} y="344" textAnchor="middle" fill={i===0?'#d4a853':'#5a5270'} fontSize="8" fontWeight="bold">{c}</text>
        </g>
      ))}
      {/* Reciter selector */}
      <rect x="10" y="360" width="360" height="30" rx="6" fill="rgba(139,92,246,0.04)" />
      <text x="24" y="380" fill="#8a82a0" fontSize="7">🎤 Reciter: Sheikh Al-Afasy</text>
      <text x="350" y="380" textAnchor="end" fill="#a78bfa" fontSize="7">Change ▶</text>
    </svg>
  );
}

function ChallengesPreview() {
  const cells = Array.from({ length: 35 }, (_, i) => ({
    filled: i % 3 === 0 || i % 7 === 0,
    intense: i % 5 === 0,
  }));
  return (
    <svg viewBox="0 0 380 400" className="w-full h-full">
      <rect width="380" height="400" fill="#0a0518" rx="8" />
      <text x="16" y="26" fill="#c8c4d8" fontSize="12" fontWeight="bold">Challenges</text>
      <rect x="280" y="12" width="90" height="20" rx="6" fill="rgba(139,92,246,0.1)" />
      <text x="325" y="27" textAnchor="middle" fill="#a78bfa" fontSize="7">+ New Challenge</text>
      {/* Challenge cards */}
      {[
        { n: 'Read Quran Daily', days: '19/30', streak: 14, pct: 63, c: '#d4a853' },
        { n: 'Exercise', days: '12/20', streak: 5, pct: 60, c: '#22c55e' },
        { n: 'No Social Media', days: '7/14', streak: 7, pct: 50, c: '#0ea5e9' },
      ].map((ch, ci) => (
        <g key={ci}>
          <rect x={12} y={40 + ci * 84} width="356" height="76" rx="8" fill="rgba(255,255,255,0.02)" stroke="rgba(139,92,246,0.06)" strokeWidth="0.5" />
          <rect x={12} y={40 + ci * 84} width="4" height="76" rx="2" fill={ch.c} opacity="0.5" />
          <text x={26} y={58 + ci * 84} fill="#c8c4d8" fontSize="9" fontWeight="bold">{ch.n}</text>
          <text x={280} y={58 + ci * 84} textAnchor="end" fill={ch.c} fontSize="10" fontWeight="bold">{ch.days}</text>
          {/* Progress bar */}
          <rect x={26} y={66 + ci * 84} width="280" height="6" rx="3" fill="rgba(255,255,255,0.04)" />
          <rect x={26} y={66 + ci * 84} width={280 * ch.pct / 100} height="6" rx="3" fill={ch.c} opacity="0.6" />
          {/* Stats */}
          <rect x={26} y={80 + ci * 84} width="50" height="16" rx="4" fill="rgba(34,197,94,0.08)" />
          <text x={51} y={92 + ci * 84} textAnchor="middle" fill="#22c55e" fontSize="6" fontWeight="bold">🔥 {ch.streak}d</text>
          <rect x={84} y={80 + ci * 84} width="50" height="16" rx="4" fill="rgba(139,92,246,0.08)" />
          <text x={109} y={92 + ci * 84} textAnchor="middle" fill="#a78bfa" fontSize="6">{ch.pct}%</text>
          {/* Mini grid */}
          <g transform={`translate(160, ${78 + ci * 84})`}>
            {cells.slice(ci*7, ci*7+14).map((c, i) => (
              <rect key={i} x={i % 7 * 14} y={Math.floor(i/7)*14} width="11" height="11" rx="2" fill={c.intense?ch.c:c.filled?ch.c+'55':'rgba(255,255,255,0.04)'} />
            ))}
          </g>
        </g>
      ))}
      {/* Achievements */}
      <text x="16" y="302" fill="#c8c4d8" fontSize="9" fontWeight="bold">Achievements</text>
      {[
        { n: '7-Day Streak', unlocked: true },
        { n: 'First Week Complete', unlocked: true },
        { n: 'Halfway There', unlocked: false },
      ].map((a, i) => (
        <g key={i}>
          <rect x={12} y={310 + i * 30} width="356" height="24" rx="5" fill={a.unlocked?'rgba(34,197,94,0.03)':'rgba(255,255,255,0.01)'} />
          <circle cx={28} cy={322 + i * 30} r="8" fill={a.unlocked?'#22c55e':'rgba(255,255,255,0.05)'} />
          {a.unlocked && <text x="28" y="327" textAnchor="middle" fill="white" fontSize="9">✓</text>}
          <text x={44} y={327 + i * 30} fill={a.unlocked?'#c8c4d8':'#5a5270'} fontSize="7.5">{a.n}</text>
          {!a.unlocked && <text x={340} y={327 + i * 30} textAnchor="end" fill="#5a5270" fontSize="6">🔒 Locked</text>}
        </g>
      ))}
    </svg>
  );
}

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
  { preview: <PomodoroPreview />, title: 'Pomodoro', desc: 'Focus timer with sessions, themes & mini-player', size: 'tall' },
  { preview: <FocusVideoPreview />, title: 'Focus Video', desc: 'YouTube & local video player with auto-rotate', size: 'wide' },
  { preview: <KanbanPreview />, title: 'Kanban', desc: 'Drag-and-drop task management board', size: 'square' },
  { preview: <LibraryPreview />, title: 'Library', desc: 'Track books with progress & notes', size: 'square' },
  { preview: <TasksPreview />, title: 'Tasks', desc: 'Daily todos with priority & categories', size: 'tall' },
  { preview: <StatsPreview />, title: 'Stats', desc: 'Activity analytics & focus breakdown', size: 'square' },
  { preview: <InspirePreview />, title: 'Inspire', desc: 'Quran, hadith & daily quotes', size: 'square' },
  { preview: <ChallengesPreview />, title: 'Challenges', desc: 'Build habits with streaks & achievements', size: 'wide' },
  { preview: <GraphPreview />, title: 'Graph', desc: 'Visual entity relationship network', size: 'square' },
  { preview: <DailyPreview />, title: 'Daily', desc: 'Daily notes with Hijri calendar', size: 'tall' },
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
