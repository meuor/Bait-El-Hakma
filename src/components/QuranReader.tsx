import { useState, useEffect, useCallback, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  ScrollText, BookOpen, ArrowLeft, Bookmark, ChevronUp,
  CheckCircle2, Loader2, Palette,
} from 'lucide-react';
import { SURAH_LIST, getDailyPortion, TOTAL_AYAHS, type SurahInfo } from '@/data/quranData';
import { toast } from 'sonner';

interface Ayah {
  number: number;
  text: string;
  numberInSurah: number;
}

interface SurahData {
  number: number;
  name: string;
  englishName: string;
  ayahs: Ayah[];
}

export type MushafTheme = 'madina-1441' | 'madina-classic' | 'unicode';

const MUSHAF_THEMES: { id: MushafTheme; name: string; nameAr: string; fontFamily: string }[] = [
  { id: 'madina-1441', name: 'Madina 1441', nameAr: 'المصحف المريني', fontFamily: "'Amiri Quran', 'Amiri', serif" },
  { id: 'madina-classic', name: 'Madina Classic', nameAr: 'المدینین کلاسیک', fontFamily: "'Amiri', serif" },
  { id: 'unicode', name: 'Mushaf Unicode', nameAr: 'المصحف الیونیکود', fontFamily: "'Noto Naskh Arabic', serif" },
];

const LAST_READ_KEY = 'quran-last-read';
const PROGRESS_KEY = 'quran-progress';
const THEME_KEY = 'quran-mushaf-theme';
const AYAHS_PER_PAGE = 15;

interface QuranProgressData {
  completedSurahs: number[];
  totalReadAyahs: number;
  currentSurah: number;
  currentAyah: number;
  lastReadAt: string;
}

function loadProgress(): QuranProgressData {
  try {
    const raw = localStorage.getItem(PROGRESS_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return { completedSurahs: [], totalReadAyahs: 0, currentSurah: 1, currentAyah: 1, lastReadAt: '' };
}

function saveProgress(data: Partial<QuranProgressData>) {
  const current = loadProgress();
  const updated = { ...current, ...data, lastReadAt: new Date().toISOString() };
  localStorage.setItem(PROGRESS_KEY, JSON.stringify(updated));
}

function loadTheme(): MushafTheme {
  try {
    const raw = localStorage.getItem(THEME_KEY);
    if (raw && MUSHAF_THEMES.some(t => t.id === raw)) return raw as MushafTheme;
  } catch {}
  return 'madina-1441';
}

function getLastRead(): { surah: number; ayah: number } | null {
  try {
    const raw = localStorage.getItem(LAST_READ_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

export function QuranReader() {
  const [view, setView] = useState<'list' | 'surah'>('list');
  const [selectedSurah, setSelectedSurah] = useState<SurahInfo | null>(null);
  const [surahData, setSurahData] = useState<SurahData | null>(null);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'meccan' | 'medinan'>('all');
  const [theme, setTheme] = useState<MushafTheme>(loadTheme);
  const [progress, setProgress] = useState(loadProgress);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [visibleAyahs, setVisibleAyahs] = useState(AYAHS_PER_PAGE);
  const [loadingMore, setLoadingMore] = useState(false);
  const [showThemePicker, setShowThemePicker] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const totalRead = progress.completedSurahs.reduce((sum, sn) => {
    const s = SURAH_LIST.find(x => x.number === sn);
    return sum + (s ? s.numberOfAyahs : 0);
  }, 0);
  const completionPct = Math.round((totalRead / TOTAL_AYAHS) * 100);

  useEffect(() => {
    localStorage.setItem(THEME_KEY, theme);
  }, [theme]);

  useEffect(() => {
    const el = containerRef.current?.closest('.overflow-auto') || window;
    const handleScroll = () => {
      const scrollTop = el === window ? window.scrollY : (el as HTMLElement).scrollTop;
      setShowScrollTop(scrollTop > 400);

      if (view === 'surah' && surahData && el !== window) {
        const container = el as HTMLElement;
        const scrollHeight = container.scrollHeight;
        const clientHeight = container.clientHeight;
        const currentScroll = container.scrollTop;
        if (scrollHeight - currentScroll - clientHeight < 300 && visibleAyahs < surahData.ayahs.length) {
          loadMoreAyahs();
        }
      }
    };
    el.addEventListener('scroll', handleScroll, { passive: true });
    return () => el.removeEventListener('scroll', handleScroll);
  }, [view, surahData, visibleAyahs]);

  const loadMoreAyahs = useCallback(() => {
    if (loadingMore || !surahData) return;
    setLoadingMore(true);
    setTimeout(() => {
      setVisibleAyahs(prev => Math.min(prev + AYAHS_PER_PAGE, surahData.ayahs.length));
      setLoadingMore(false);
    }, 300);
  }, [loadingMore, surahData]);

  const markSurahComplete = useCallback((surahNumber: number) => {
    const current = loadProgress();
    if (!current.completedSurahs.includes(surahNumber)) {
      const updated = [...current.completedSurahs, surahNumber];
      saveProgress({ completedSurahs: updated });
      setProgress(prev => ({ ...prev, completedSurahs: updated }));
      toast.success('Surah marked as complete!');
    }
  }, []);

  const loadSurah = useCallback(async (surah: SurahInfo) => {
    setSelectedSurah(surah);
    setView('surah');
    setVisibleAyahs(AYAHS_PER_PAGE);
    try {
      const res = await fetch(`https://api.alquran.cloud/v1/surah/${surah.number}/ar.alafasy`);
      const json = await res.json();
      if (json.code === 200) {
        setSurahData(json.data);
        saveProgress({ currentSurah: surah.number, currentAyah: 1 });
      }
    } catch (err) {
      console.error('Failed to load surah:', err);
      toast.error('Failed to load surah. Check your connection.');
    }
  }, []);

  const loadFromLastRead = useCallback(() => {
    const last = getLastRead();
    if (last) {
      const surah = SURAH_LIST.find(s => s.number === last.surah);
      if (surah) loadSurah(surah);
    }
  }, [loadSurah]);

  const filteredSurahs = SURAH_LIST.filter(s => {
    const matchesSearch = search === '' ||
      s.englishName.toLowerCase().includes(search.toLowerCase()) ||
      s.name.includes(search) ||
      String(s.number).includes(search);
    const matchesFilter = filter === 'all' ||
      (filter === 'meccan' && s.revelationType === 'Meccan') ||
      (filter === 'medinan' && s.revelationType === 'Medinan');
    return matchesSearch && matchesFilter;
  });

  const last = getLastRead();
  const themeData = MUSHAF_THEMES.find(t => t.id === theme) || MUSHAF_THEMES[0];
  const isComplete = (sn: number) => progress.completedSurahs.includes(sn);

  if (view === 'surah' && surahData && selectedSurah) {
    const shownAyahs = surahData.ayahs.slice(0, visibleAyahs);
    const hasMore = visibleAyahs < surahData.ayahs.length;
    const readPct = Math.round((visibleAyahs / surahData.ayahs.length) * 100);

    return (
      <div className="space-y-4" ref={containerRef}>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => { setView('list'); setSurahData(null); }}>
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back
          </Button>
          <div className="flex-1 text-center">
            <h3 className="font-bold text-lg">{surahData.englishName}</h3>
            <p className="text-sm text-muted-foreground" dir="rtl">{surahData.name}</p>
          </div>
          <Button
            variant={isComplete(selectedSurah.number) ? 'default' : 'outline'}
            size="sm"
            onClick={() => markSurahComplete(selectedSurah.number)}
          >
            <CheckCircle2 className="w-4 h-4 mr-1" />
            {isComplete(selectedSurah.number) ? 'Done' : 'Complete'}
          </Button>
        </div>

        <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
          <div className="h-full bg-primary rounded-full transition-all duration-500" style={{ width: `${readPct}%` }} />
        </div>
        <p className="text-xs text-center text-muted-foreground">
          {visibleAyahs} / {surahData.ayahs.length} ayahs loaded ({readPct}%)
        </p>

        <div className="text-center p-4">
          <p className="mushaf-theme-madina-1441" dir="rtl" style={{ fontFamily: themeData.fontFamily }}>
            بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ
          </p>
          <p className="text-xs text-muted-foreground mt-1">In the name of Allah, the Most Gracious, the Most Merciful</p>
        </div>

        <div className="space-y-1">
          {shownAyahs.map((ayah) => (
            <div
              key={ayah.number}
              id={`ayah-${ayah.numberInSurah}`}
              className="py-4 px-3 border-b border-border/30 last:border-b-0"
            >
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-11 h-11 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
                  <span className="text-xs font-bold text-primary">{ayah.numberInSurah}</span>
                </div>
                <p
                  className="flex-1 text-right"
                  dir="rtl"
                  style={{
                    fontFamily: themeData.fontFamily,
                    fontSize: theme === 'madina-1441' ? '1.8rem' : theme === 'madina-classic' ? '1.6rem' : '1.5rem',
                    lineHeight: theme === 'madina-1441' ? '2.8' : theme === 'madina-classic' ? '2.6' : '2.4',
                    letterSpacing: theme === 'unicode' ? '0' : '0.02em',
                  }}
                  onMouseUp={() => saveProgress({ currentSurah: surahData.number, currentAyah: ayah.numberInSurah })}
                >
                  {ayah.text}
                </p>
              </div>
            </div>
          ))}
        </div>

        {hasMore && (
          <div className="py-4 text-center">
            {loadingMore ? (
              <Loader2 className="h-6 w-6 animate-spin text-primary mx-auto" />
            ) : (
              <Button variant="outline" onClick={loadMoreAyahs}>
                Load More ({surahData.ayahs.length - visibleAyahs} remaining)
              </Button>
            )}
          </div>
        )}

        {!hasMore && surahData.ayahs.length > AYAHS_PER_PAGE && (
          <p className="text-center text-sm text-muted-foreground py-2">All ayahs loaded</p>
        )}

        {showScrollTop && (
          <Button
            variant="outline"
            size="icon"
            className="fixed bottom-24 right-6 z-40 shadow-lg"
            onClick={() => {
              const container = containerRef.current?.closest('.overflow-auto');
              container?.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          >
            <ChevronUp className="w-4 h-4" />
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="text-center">
        <h3 className="text-xl font-bold">The Holy Quran</h3>
        <p className="text-sm text-muted-foreground">المصحف الشريف — Complete Quran (114 Surahs)</p>
      </div>

      <Card className="overflow-hidden">
        <CardContent className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Quran Progress</span>
            <span className="text-sm font-bold text-primary">{completionPct}%</span>
          </div>
          <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 to-primary rounded-full transition-all duration-700"
              style={{ width: `${completionPct}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{totalRead.toLocaleString()} / {TOTAL_AYAHS.toLocaleString()} ayahs read</span>
            <span>{progress.completedSurahs.length} / 114 surahs completed</span>
          </div>
        </CardContent>
      </Card>

      {last && (
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium flex items-center gap-2">
                <Bookmark className="w-4 h-4 text-primary" />
                Resume Reading
              </p>
              <p className="text-xs text-muted-foreground">
                Surah {SURAH_LIST.find(s => s.number === last.surah)?.englishName || ''} — Ayah {last.ayah}
              </p>
            </div>
            <Button size="sm" onClick={loadFromLastRead}>
              <BookOpen className="w-4 h-4 mr-1" />
              Continue
            </Button>
          </CardContent>
        </Card>
      )}

      <DailyReadingCard onReadSurah={loadSurah} />

      <div className="flex items-center justify-between">
        <div className="flex gap-1">
          {(['all', 'meccan', 'medinan'] as const).map(f => (
            <Button
              key={f}
              variant={filter === f ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter(f)}
              className="capitalize"
            >
              {f}
            </Button>
          ))}
        </div>
        <div className="relative">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowThemePicker(!showThemePicker)}
            className="gap-1.5"
          >
            <Palette className="w-3.5 h-3.5" />
            <span className="hidden sm:inline text-xs">{themeData.name}</span>
          </Button>
          {showThemePicker && (
            <div className="absolute right-0 top-full mt-1 z-50 bg-popover border border-border rounded-lg shadow-xl p-1 w-52">
              {MUSHAF_THEMES.map(t => (
                <button
                  key={t.id}
                  onClick={() => { setTheme(t.id); setShowThemePicker(false); }}
                  className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                    theme === t.id ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
                  }`}
                >
                  <span className="font-medium">{t.name}</span>
                  <span className="block text-xs opacity-70" dir="rtl">{t.nameAr}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <input
        type="text"
        placeholder="Search surah name or number..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
      />

      <div className="grid gap-2">
        {filteredSurahs.map((surah) => {
          const complete = isComplete(surah.number);
          return (
            <button
              key={surah.number}
              onClick={() => loadSurah(surah)}
              className={`flex items-center gap-3 p-3 rounded-lg border transition-all text-left ${
                complete
                  ? 'border-emerald-500/30 bg-emerald-500/5 hover:bg-emerald-500/10'
                  : 'border-border/50 hover:border-primary/30 hover:bg-muted/50'
              }`}
            >
              <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                complete ? 'bg-emerald-500/20' : 'bg-primary/10'
              }`}>
                {complete ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                ) : (
                  <span className="text-sm font-bold text-primary">{surah.number}</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium truncate">{surah.englishName}</span>
                  <Badge variant="outline" className="text-[10px] flex-shrink-0">
                    {surah.numberOfAyahs}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground truncate">{surah.englishNameTranslation}</p>
              </div>
              <p
                className="text-lg flex-shrink-0"
                dir="rtl"
                style={{ fontFamily: themeData.fontFamily }}
              >
                {surah.name}
              </p>
            </button>
          );
        })}
      </div>

      {filteredSurahs.length === 0 && (
        <p className="text-center text-muted-foreground py-8">No surahs found</p>
      )}
    </div>
  );
}

function DailyReadingCard({ onReadSurah }: { onReadSurah: (s: SurahInfo) => void }) {
  const today = new Date();
  const dayOfMonth = today.getDate();
  const portion = getDailyPortion(dayOfMonth);
  const startSurah = SURAH_LIST.find(s => s.number === portion.startSurah);
  const endSurah = SURAH_LIST.find(s => s.number === portion.endSurah);

  return (
    <Card className="bg-gradient-to-r from-emerald-500/5 to-primary/5 border-emerald-500/20">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <ScrollText className="w-4 h-4 text-emerald-500" />
          الورد اليومي — Daily Reading
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground">
          Today's portion: <strong>Surah {startSurah?.englishName}</strong> ({portion.startAyah})
          {portion.startSurah !== portion.endSurah && (
            <> → <strong>Surah {endSurah?.englishName}</strong> ({portion.endAyah})</>
          )}
        </p>
        <div className="flex gap-2">
          <Button size="sm" onClick={() => startSurah && onReadSurah(startSurah)}>
            <BookOpen className="w-4 h-4 mr-1" />
            Start Reading
          </Button>
          {portion.startSurah !== portion.endSurah && endSurah && (
            <Button size="sm" variant="outline" onClick={() => onReadSurah(endSurah)}>
              End: {endSurah.englishName}
            </Button>
          )}
        </div>
        <p className="text-xs text-muted-foreground">
          ~4 pages/day to complete the Quran in 30 days — {today.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
        </p>
      </CardContent>
    </Card>
  );
}
