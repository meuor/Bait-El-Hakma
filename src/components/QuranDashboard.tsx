import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Trophy, Target, Flame, BookOpen, Star, Calendar,
  TrendingUp, Clock, Award, Zap, Heart, Crown,
} from 'lucide-react';
import { SURAH_LIST, TOTAL_AYAHS } from '@/data/quranData';
import { quranAPI } from '@/lib/api';

interface AyahStatus {
  [key: string]: 'new' | 'learning' | 'review' | 'mastered';
}

interface DailyStats {
  [date: string]: { ayahsRead: number; minutesSpent: number };
}

interface Achievement {
  id: string;
  name: string;
  nameAr: string;
  desc: string;
  icon: string;
  unlocked: boolean;
  date?: string;
}

const ACHIEVEMENTS_DEF: Omit<Achievement, 'unlocked' | 'date'>[] = [
  { id: 'first_ayah', name: 'First Steps', nameAr: 'خطوة أولى', desc: 'Read your first ayah', icon: '🌟' },
  { id: 'surah_fatihah', name: 'Al-Fatihah Master', nameAr: 'سيد الفاتحة', desc: 'Complete Surah Al-Fatihah', icon: '📖' },
  { id: 'juz_30', name: 'Juz 30 Done', nameAr: 'جزء عم', desc: 'Complete Juz 30 (Amma)', icon: '🏅' },
  { id: 'streak_7', name: 'Week Warrior', nameAr: 'محارب الأسبوع', desc: '7-day reading streak', icon: '🔥' },
  { id: 'streak_30', name: 'Month Master', nameAr: 'سيد الشهر', desc: '30-day reading streak', icon: '👑' },
  { id: 'surahs_10', name: 'Ten Down', nameAr: 'عشر سور', desc: 'Complete 10 surahs', icon: '🎯' },
  { id: 'surahs_25', name: 'Quarter Way', nameAr: 'الربع', desc: 'Complete 25% of Quran', icon: '📊' },
  { id: 'surahs_50', name: 'Half Way', nameAr: 'النصف', desc: 'Complete 50% of Quran', icon: '🏆' },
  { id: 'ayahs_100', name: 'Century Mark', nameAr: 'مئة آية', desc: 'Read 100 ayahs total', icon: '💯' },
  { id: 'ayahs_1000', name: 'Thousand Club', nameAr: 'نادي الألف', desc: 'Read 1000 ayahs total', icon: '⭐' },
  { id: 'mastered_50', name: 'Memorizer', nameAr: 'حافظ', desc: 'Master 50 ayahs', icon: '🧠' },
  { id: 'daily_goal', name: 'Goal Crusher', nameAr: 'محقق الأهداف', desc: 'Hit daily goal 7 days', icon: '🎪' },
  { id: 'night_owl', name: 'Night Owl', nameAr: 'بومة الليل', desc: 'Read after 11 PM', icon: '🌙' },
  { id: 'early_bird', name: 'Early Bird', nameAr: 'صياد الصباح', desc: 'Read before 7 AM', icon: '🌅' },
  { id: 'tajweed_10', name: 'Tajweed Student', nameAr: 'طالب تجويد', desc: 'Master 10 ayahs with review', icon: '🎶' },
  { id: 'hafiz', name: 'Al-Hafiz', nameAr: 'الحافظ', desc: 'Master the entire Quran', icon: '🕌' },
];

function getJuzForSurah(surahNum: number): number {
  const juzBoundaries = [
    1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,
    21,22,23,24,25,26,27,28,29,30,31
  ];
  for (let j = 30; j >= 1; j--) {
    if (surahNum >= juzBoundaries[j - 1]) return j;
  }
  return 1;
}

const JUZ_SURAH_MAP: Record<number, { start: number; end: number }> = {
  1: { start: 1, end: 2 }, 2: { start: 2, end: 2 }, 3: { start: 2, end: 3 },
  4: { start: 3, end: 4 }, 5: { start: 4, end: 5 }, 6: { start: 5, end: 7 },
  7: { start: 7, end: 8 }, 8: { start: 8, end: 9 }, 9: { start: 9, end: 11 },
  10: { start: 11, end: 12 }, 11: { start: 11, end: 12 }, 12: { start: 12, end: 14 },
  13: { start: 14, end: 15 }, 14: { start: 15, end: 16 }, 15: { start: 16, end: 17 },
  16: { start: 17, end: 18 }, 17: { start: 17, end: 18 }, 18: { start: 18, end: 20 },
  19: { start: 20, end: 22 }, 20: { start: 21, end: 22 }, 21: { start: 22, end: 23 },
  22: { start: 23, end: 25 }, 23: { start: 25, end: 25 }, 24: { start: 25, end: 27 },
  25: { start: 27, end: 29 }, 26: { start: 29, end: 33 }, 27: { start: 33, end: 36 },
  28: { start: 36, end: 39 }, 29: { start: 39, end: 51 }, 30: { start: 51, end: 114 },
};

function getAyahsInJuz(juz: number): number {
  const bounds = JUZ_SURAH_MAP[juz];
  if (!bounds) return 0;
  let total = 0;
  for (let s = bounds.start; s <= bounds.end; s++) {
    const surah = SURAH_LIST.find(x => x.number === s);
    if (surah) total += surah.numberOfAyahs;
  }
  return total;
}

const STORAGE_KEY = 'quran-memorization';

function loadMemorization(): AyahStatus {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch { return {}; }
}

function saveMemorization(data: AyahStatus) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function loadDailyStats(): DailyStats {
  try {
    const raw = localStorage.getItem('quran-daily-stats');
    return raw ? JSON.parse(raw) : {};
  } catch { return {}; }
}

interface QuranDashboardProps {
  completedSurahs: number[];
  onReadSurah: (s: any) => void;
}

export function QuranDashboard({ completedSurahs, onReadSurah }: QuranDashboardProps) {
  const [memStatus, setMemStatus] = useState<AyahStatus>(loadMemorization);
  const [dailyStats, setDailyStats] = useState<DailyStats>(loadDailyStats);

  // Calculate stats
  const totalMemorized = Object.values(memStatus).filter(v => v === 'mastered').length;
  const totalLearning = Object.values(memStatus).filter(v => v === 'learning' || v === 'review').length;
  const totalRead = completedSurahs.reduce((sum, sn) => {
    const s = SURAH_LIST.find(x => x.number === sn);
    return sum + (s ? s.numberOfAyahs : 0);
  }, 0);
  const completionPct = Math.round((totalRead / TOTAL_AYAHS) * 100);

  // Streak calculation
  const today = new Date();
  let streak = 0;
  for (let i = 0; i < 365; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().split('T')[0];
    if (dailyStats[key] && dailyStats[key].ayahsRead > 0) {
      streak++;
    } else if (i > 0) break;
  }

  // Weekly stats
  const weekStats: { day: string; count: number }[] = [];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().split('T')[0];
    weekStats.push({
      day: dayNames[d.getDay()],
      count: dailyStats[key]?.ayahsRead || 0,
    });
  }
  const maxWeek = Math.max(...weekStats.map(w => w.count), 1);

  // Achievements
  const achievements: Achievement[] = ACHIEVEMENTS_DEF.map(a => {
    let unlocked = false;
    let date: string | undefined;
    switch (a.id) {
      case 'first_ayah': unlocked = totalRead > 0; break;
      case 'surah_fatihah': unlocked = completedSurahs.includes(1); break;
      case 'juz_30': unlocked = completedSurahs.filter(s => s >= 78).length >= 37; break;
      case 'streak_7': unlocked = streak >= 7; break;
      case 'streak_30': unlocked = streak >= 30; break;
      case 'surahs_10': unlocked = completedSurahs.length >= 10; break;
      case 'surahs_25': unlocked = completionPct >= 25; break;
      case 'surahs_50': unlocked = completionPct >= 50; break;
      case 'ayahs_100': unlocked = totalRead >= 100; break;
      case 'ayahs_1000': unlocked = totalRead >= 1000; break;
      case 'mastered_50': unlocked = totalMemorized >= 50; break;
      case 'hafiz': unlocked = completionPct >= 100; break;
    }
    return { ...a, unlocked, date };
  });

  const unlockedCount = achievements.filter(a => a.unlocked).length;

  return (
    <div className="space-y-4">
      {/* Top Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
          <CardContent className="p-3 text-center">
            <div className="text-2xl font-bold text-primary">{completionPct}%</div>
            <div className="text-xs text-muted-foreground">Quran Complete</div>
            <Progress value={completionPct} className="h-1.5 mt-2" />
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-orange-500/10 to-orange-500/5 border-orange-500/20">
          <CardContent className="p-3 text-center">
            <div className="flex items-center justify-center gap-1">
              <Flame className="w-5 h-5 text-orange-500" />
              <span className="text-2xl font-bold text-orange-500">{streak}</span>
            </div>
            <div className="text-xs text-muted-foreground">Day Streak</div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 border-emerald-500/20">
          <CardContent className="p-3 text-center">
            <div className="text-2xl font-bold text-emerald-500">{completedSurahs.length}</div>
            <div className="text-xs text-muted-foreground">Surahs Done</div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-violet-500/10 to-violet-500/5 border-violet-500/20">
          <CardContent className="p-3 text-center">
            <div className="text-2xl font-bold text-violet-500">{totalMemorized}</div>
            <div className="text-xs text-muted-foreground">Ayahs Mastered</div>
          </CardContent>
        </Card>
      </div>

      {/* Weekly Activity */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-primary" />
            This Week
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-end gap-1.5 h-20">
            {weekStats.map((w, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full bg-primary/20 rounded-t relative" style={{ height: `${Math.max((w.count / maxWeek) * 60, 4)}px` }}>
                  <div className="absolute bottom-0 w-full bg-primary rounded-t transition-all" style={{ height: `${Math.max((w.count / maxWeek) * 60, 4)}px` }} />
                </div>
                <span className="text-[10px] text-muted-foreground">{w.day}</span>
              </div>
            ))}
          </div>
          <div className="text-center text-xs text-muted-foreground mt-2">
            {weekStats.reduce((s, w) => s + w.count, 0)} ayahs this week
          </div>
        </CardContent>
      </Card>

      {/* Juz Grid */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-primary" />
            Juz Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-10 gap-1.5">
            {Array.from({ length: 30 }, (_, i) => {
              const juz = i + 1;
              const bounds = JUZ_SURAH_MAP[juz];
              if (!bounds) return <div key={juz} className="aspect-square" />;
              const surahsInRange = SURAH_LIST.filter(s => s.number >= bounds.start && s.number <= bounds.end);
              const totalInJuz = surahsInRange.reduce((s, x) => s + x.numberOfAyahs, 0);
              const readInJuz = surahsInRange.filter(s => completedSurahs.includes(s.number)).reduce((s, x) => s + x.numberOfAyahs, 0);
              const pct = totalInJuz > 0 ? Math.round((readInJuz / totalInJuz) * 100) : 0;
              const color = pct >= 100 ? 'bg-emerald-500 text-white' : pct > 0 ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground';
              return (
                <div
                  key={juz}
                  className={`aspect-square rounded-md flex flex-col items-center justify-center text-[10px] font-bold cursor-default ${color} transition-colors`}
                  title={`Juz ${juz}: ${pct}%`}
                >
                  <span>{juz}</span>
                  {pct > 0 && pct < 100 && <span className="text-[7px]">{pct}%</span>}
                </div>
              );
            })}
          </div>
          <div className="flex items-center gap-3 mt-3 text-[10px] text-muted-foreground">
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-emerald-500" /> Done</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-primary/20" /> In Progress</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-muted" /> Not Started</span>
          </div>
        </CardContent>
      </Card>

      {/* Achievements */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Trophy className="w-4 h-4 text-yellow-500" />
            Achievements
            <Badge variant="secondary" className="ml-auto text-xs">{unlockedCount}/{achievements.length}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {achievements.map(a => (
              <div
                key={a.id}
                className={`flex items-center gap-2 p-2 rounded-lg border transition-all ${
                  a.unlocked
                    ? 'bg-yellow-500/5 border-yellow-500/30'
                    : 'bg-muted/50 border-border opacity-50 grayscale'
                }`}
              >
                <span className="text-xl">{a.icon}</span>
                <div className="min-w-0">
                  <div className="text-xs font-medium truncate">{a.name}</div>
                  <div className="text-[10px] text-muted-foreground truncate" dir="rtl">{a.nameAr}</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Surah Progress List */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Award className="w-4 h-4 text-primary" />
            Surah Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-1.5 max-h-[400px] overflow-y-auto pr-1">
            {SURAH_LIST.map(surah => {
              const complete = completedSurahs.includes(surah.number);
              return (
                <button
                  key={surah.number}
                  onClick={() => onReadSurah(surah)}
                  className={`flex items-center gap-3 p-2 rounded-lg border transition-all text-left hover:shadow-sm ${
                    complete ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-card border-border hover:bg-muted/50'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                    complete ? 'bg-emerald-500 text-white' : 'bg-muted text-muted-foreground'
                  }`}>
                    {complete ? '✓' : surah.number}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{surah.englishName}</div>
                    <div className="text-xs text-muted-foreground truncate" dir="rtl">{surah.name}</div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-xs text-muted-foreground">{surah.numberOfAyahs} ayahs</div>
                    <div className="text-[10px] text-muted-foreground">{surah.revelationType}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
