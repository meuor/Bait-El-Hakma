import { useState, useEffect, useCallback, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  ScrollText, BookOpen, ArrowLeft, Bookmark, ChevronUp,
  CheckCircle2, Loader2, Palette, MapPin, Headphones,
  Eye, EyeOff, Brain, LayoutGrid,
} from 'lucide-react';
import { SURAH_LIST, getDailyPortion, TOTAL_AYAHS, type SurahInfo } from '@/data/quranData';
import { quranAPI } from '@/lib/api';
import { toast } from 'sonner';
import { QuranDashboard } from './QuranDashboard';
import { QuranAudio } from './QuranAudio';

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
const BOOKMARKS_KEY = 'quran-bookmarks';
const PROGRESS_KEY = 'quran-progress';
const THEME_KEY = 'quran-mushaf-theme';

interface QuranProgressData {
  completedSurahs: number[];
  totalReadAyahs: number;
  currentSurah: number;
  currentAyah: number;
  lastReadAt: string;
}

interface BookmarksData {
  [surahNumber: number]: number;
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

function loadBookmarks(): BookmarksData {
  try {
    const raw = localStorage.getItem(BOOKMARKS_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return {};
}

function saveBookmark(surahNumber: number, ayahNumber: number) {
  const bookmarks = loadBookmarks();
  bookmarks[surahNumber] = ayahNumber;
  localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(bookmarks));
  localStorage.setItem(LAST_READ_KEY, JSON.stringify({ surah: surahNumber, ayah: ayahNumber }));
  saveProgress({ currentSurah: surahNumber, currentAyah: ayahNumber });
}

function getLastRead(): { surah: number; ayah: number } | null {
  try {
    const raw = localStorage.getItem(LAST_READ_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

function toArabicNumber(n: number): string {
  const arabicDigits = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
  return String(n).split('').map(d => arabicDigits[parseInt(d)]).join('');
}

export function QuranReader() {
  const [view, setView] = useState<'list' | 'surah' | 'dashboard'>('list');
  const [selectedSurah, setSelectedSurah] = useState<SurahInfo | null>(null);
  const [surahData, setSurahData] = useState<SurahData | null>(null);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'meccan' | 'medinan'>('all');
  const [theme, setTheme] = useState<MushafTheme>(loadTheme);
  const [progress, setProgress] = useState(loadProgress);
  const [bookmarks, setBookmarks] = useState<BookmarksData>(loadBookmarks);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [showThemePicker, setShowThemePicker] = useState(false);
  const [allAyahsLoaded, setAllAyahsLoaded] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [visibleAyahs, setVisibleAyahs] = useState(12);
  const [dailyCompleted, setDailyCompleted] = useState<Record<string, boolean>>(() => {
    try { return JSON.parse(localStorage.getItem('quran-daily-progress') || '{}'); } catch { return {}; }
  });
  const [dailyPages, setDailyPages] = useState(() => {
    try { return parseInt(localStorage.getItem('quran-daily-pages') || '4') || 4; } catch { return 4; }
  });
  // Memorization mode
  const [memMode, setMemMode] = useState(false);
  const [hiddenAyahs, setHiddenAyahs] = useState<Set<number>>(new Set());
  const [showAudio, setShowAudio] = useState(false);
  const [currentPlayingAyah, setCurrentPlayingAyah] = useState(1);
  const containerRef = useRef<HTMLDivElement>(null);
  const ayahRefs = useRef<Map<number, HTMLSpanElement>>(new Map());
  const syncTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const totalRead = progress.completedSurahs.reduce((sum, sn) => {
    const s = SURAH_LIST.find(x => x.number === sn);
    return sum + (s ? s.numberOfAyahs : 0);
  }, 0);
  const completionPct = Math.round((totalRead / TOTAL_AYAHS) * 100);

  useEffect(() => {
    localStorage.setItem(THEME_KEY, theme);
  }, [theme]);

  // Push to cloud - debounced
  useEffect(() => {
    const token = localStorage.getItem('bait-el-hakma-token');
    if (!token) return;
    if (syncTimerRef.current) clearTimeout(syncTimerRef.current);
    syncTimerRef.current = setTimeout(() => {
      quranAPI.save({
        bookmarks,
        completedSurahs: progress.completedSurahs,
        dailyCompleted,
        dailyPages,
        mushafTheme: theme,
        lastRead: getLastRead() || {},
      }).catch((err) => {
        console.warn('Quran cloud sync failed, will retry:', err);
        // Retry once after 3 seconds
        setTimeout(() => {
          quranAPI.save({
            bookmarks,
            completedSurahs: progress.completedSurahs,
            dailyCompleted,
            dailyPages,
            mushafTheme: theme,
            lastRead: getLastRead() || {},
          }).catch((e) => console.error('Quran cloud sync retry failed:', e));
        }, 3000);
      });
    }, 1500);
  }, [bookmarks, progress.completedSurahs, dailyCompleted, dailyPages, theme]);

  // Pull from cloud on mount - smart merge (cloud only overwrites if it has data)
  useEffect(() => {
    const token = localStorage.getItem('bait-el-hakma-token');
    if (!token) return;
    quranAPI.get().then((data) => {
      // Merge: only apply cloud data if it has meaningful content
      if (data.bookmarks && Object.keys(data.bookmarks).length > 0) {
        setBookmarks(data.bookmarks);
        localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(data.bookmarks));
      }
      if (data.completedSurahs && data.completedSurahs.length > 0) {
        const updated = { ...loadProgress(), completedSurahs: data.completedSurahs };
        localStorage.setItem(PROGRESS_KEY, JSON.stringify(updated));
        setProgress(updated);
      }
      if (data.dailyCompleted && Object.keys(data.dailyCompleted).length > 0) {
        setDailyCompleted(data.dailyCompleted);
        localStorage.setItem('quran-daily-progress', JSON.stringify(data.dailyCompleted));
      }
      if (data.dailyPages) {
        setDailyPages(data.dailyPages);
        localStorage.setItem('quran-daily-pages', String(data.dailyPages));
      }
      if (data.mushafTheme) {
        setTheme(data.mushafTheme as MushafTheme);
        localStorage.setItem(THEME_KEY, data.mushafTheme);
      }
      if (data.lastRead?.surah) {
        localStorage.setItem(LAST_READ_KEY, JSON.stringify(data.lastRead));
      }
      console.log('Quran data synced from cloud');
    }).catch((err) => {
      console.warn('Quran cloud pull failed:', err);
    });
  }, []);

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
        if (scrollHeight - currentScroll - clientHeight < 300 && !allAyahsLoaded) {
          loadMoreAyahs();
        }
      }
    };
    el.addEventListener('scroll', handleScroll, { passive: true });
    return () => el.removeEventListener('scroll', handleScroll);
  }, [view, surahData, allAyahsLoaded]);

  const loadMoreAyahs = useCallback(() => {
    if (loadingMore || !surahData || allAyahsLoaded) return;
    setLoadingMore(true);
    setTimeout(() => {
      setVisibleAyahs(prev => {
        const next = Math.min(prev + 12, surahData.ayahs.length);
        if (next >= surahData.ayahs.length) setAllAyahsLoaded(true);
        return next;
      });
      setLoadingMore(false);
    }, 300);
  }, [loadingMore, surahData, allAyahsLoaded]);

  const markSurahComplete = useCallback((surahNumber: number) => {
    const current = loadProgress();
    if (!current.completedSurahs.includes(surahNumber)) {
      const updated = [...current.completedSurahs, surahNumber];
      saveProgress({ completedSurahs: updated });
      setProgress(prev => ({ ...prev, completedSurahs: updated }));
      toast.success('Surah marked as complete!');
    }
  }, []);

  const toggleAyahHidden = useCallback((ayahNumber: number) => {
    setHiddenAyahs(prev => {
      const next = new Set(prev);
      if (next.has(ayahNumber)) {
        next.delete(ayahNumber);
      } else {
        next.add(ayahNumber);
      }
      return next;
    });
  }, []);

  const hideAllAyahs = useCallback(() => {
    if (!surahData) return;
    const allNums = new Set(surahData.ayahs.map(a => a.number));
    setHiddenAyahs(allNums);
    toast.success('All ayahs hidden — test yourself!');
  }, [surahData]);

  const revealAllAyahs = useCallback(() => {
    setHiddenAyahs(new Set());
  }, []);

  const loadSurah = useCallback(async (surah: SurahInfo) => {
    setSelectedSurah(surah);
    setView('surah');
    setVisibleAyahs(12);
    setAllAyahsLoaded(false);
    try {
      const res = await fetch(`https://api.alquran.cloud/v1/surah/${surah.number}/ar.alafasy`);
      const json = await res.json();
      if (json.code === 200) {
        const data = json.data;
        const bsm = 'بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ';
        const isFatihah = surah.number === 1;
        const isTawbah = surah.number === 9;

        if (isFatihah) {
          data.ayahs = data.ayahs.filter((a: Ayah) => !a.text.includes(bsm));
        } else if (!isTawbah && data.ayahs.length > 0) {
          const firstText = data.ayahs[0].text;
          if (firstText.includes(bsm)) {
            data.ayahs[0] = { ...data.ayahs[0], text: firstText.replace(bsm, '').trim() };
          }
        }

        setSurahData(data);
        const total = data.ayahs.length;
        if (total <= 12) setAllAyahsLoaded(true);

        const savedBookmark = loadBookmarks()[surah.number] || 1;
        if (savedBookmark > 12) {
          setVisibleAyahs(savedBookmark + 2);
          if (savedBookmark + 2 >= total) setAllAyahsLoaded(true);
        }
        setTimeout(() => {
          if (savedBookmark > 1) {
            const el = ayahRefs.current.get(savedBookmark);
            if (el) {
              el.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
          }
        }, 400);
      }
    } catch (err) {
      console.error('Failed to load surah:', err);
      toast.error('Failed to load surah. Check your connection.');
    }
  }, []);

  const setBookmark = useCallback((surahNumber: number, ayahNumber: number) => {
    saveBookmark(surahNumber, ayahNumber);
    setBookmarks(prev => ({ ...prev, [surahNumber]: ayahNumber }));
    toast.success(`Marked ayah ${ayahNumber} as your last read`, { icon: '📌' });
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

  const ayahFontSize = theme === 'madina-1441' ? '2em' : theme === 'madina-classic' ? '1.8em' : '1.65em';
  const ayahLineHeight = '1.65em';

  if (view === 'surah' && surahData && selectedSurah) {
    const shownAyahs = surahData.ayahs.slice(0, visibleAyahs);
    const hasMore = visibleAyahs < surahData.ayahs.length;
    const readPct = Math.round((visibleAyahs / surahData.ayahs.length) * 100);
    const bookmarkAyah = bookmarks[selectedSurah.number] || 0;
    const totalAyahs = surahData.ayahs.length;

    return (
      <div className="space-y-4" ref={containerRef}>
        <div className="flex items-center gap-2 sticky top-0 z-30 bg-background/95 backdrop-blur-sm py-2 -mx-1 px-1">
          <Button variant="ghost" size="sm" onClick={() => { setView('list'); setSurahData(null); }}>
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back
          </Button>
          <div className="flex-1 text-center">
            <h3 className="font-bold text-lg">{surahData.englishName}</h3>
            <p className="text-xs text-muted-foreground" dir="rtl">{surahData.name}</p>
          </div>
          <Button
            variant={isComplete(selectedSurah.number) ? 'default' : 'outline'}
            size="sm"
            onClick={() => markSurahComplete(selectedSurah.number)}
          >
            <CheckCircle2 className="w-4 h-4 mr-1" />
            {isComplete(selectedSurah.number) ? 'Done' : 'Mark Done'}
          </Button>
        </div>

        {bookmarkAyah > 0 && (
          <div className="bg-primary/5 border border-primary/20 rounded-lg px-4 py-2 flex items-center justify-between text-sm">
            <div className="flex items-center gap-2 text-primary">
              <MapPin className="w-4 h-4" />
              <span>Your bookmark: Ayah {bookmarkAyah}</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs"
              onClick={() => {
                if (bookmarkAyah > visibleAyahs) {
                  setVisibleAyahs(bookmarkAyah + 2);
                  if (bookmarkAyah + 2 >= totalAyahs) setAllAyahsLoaded(true);
                }
                setTimeout(() => {
                  const el = ayahRefs.current.get(bookmarkAyah);
                  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }, 100);
              }}
            >
              Jump to it
            </Button>
          </div>
        )}

        {/* Memorization Mode Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant={memMode ? 'default' : 'outline'}
            size="sm"
            onClick={() => { setMemMode(!memMode); setHiddenAyahs(new Set()); }}
            className="gap-1.5"
          >
            <Brain className="w-4 h-4" />
            {memMode ? 'Memorize Mode ON' : 'Memorize'}
          </Button>
          {memMode && (
            <>
              <Button variant="outline" size="sm" onClick={hideAllAyahs} className="gap-1.5">
                <EyeOff className="w-3.5 h-3.5" />
                Hide All
              </Button>
              <Button variant="outline" size="sm" onClick={revealAllAyahs} className="gap-1.5">
                <Eye className="w-3.5 h-3.5" />
                Reveal All
              </Button>
              <Badge variant="secondary" className="text-xs">
                {hiddenAyahs.size}/{totalAyahs} hidden
              </Badge>
            </>
          )}
          <Button
            variant={showAudio ? 'default' : 'outline'}
            size="sm"
            onClick={() => setShowAudio(!showAudio)}
            className="gap-1.5 ml-auto"
          >
            <Headphones className="w-4 h-4" />
            Audio
          </Button>
        </div>

        {/* Audio Player */}
        {showAudio && surahData && (
          <QuranAudio
            surahNumber={selectedSurah.number}
            ayahs={surahData.ayahs}
            currentAyah={currentPlayingAyah}
            onAyahChange={setCurrentPlayingAyah}
          />
        )}

        {selectedSurah.number === 2 && (
          <div className="text-center py-3">
            <p
              dir="rtl"
              style={{
                fontFamily: themeData.fontFamily,
                fontSize: ayahFontSize,
                lineHeight: ayahLineHeight,
              }}
            >
              بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
            </p>
          </div>
        )}

        <div className="rounded-xl border border-border/50 overflow-hidden" style={{ background: 'hsl(var(--card))' }}>
          <div className="p-5 md:p-8">
            <p
              dir="rtl"
              style={{
                fontFamily: themeData.fontFamily,
                fontSize: ayahFontSize,
                lineHeight: ayahLineHeight,
                textAlign: 'justify',
                wordSpacing: '0.1em',
                letterSpacing: theme === 'unicode' ? '0' : '0.02em',
              }}
            >
              {shownAyahs.map((ayah) => {
                const isBookmarked = bookmarkAyah === ayah.numberInSurah;
                const isHidden = memMode && hiddenAyahs.has(ayah.number);
                return (
                  <span
                    key={ayah.number}
                    ref={(el) => {
                      if (el) ayahRefs.current.set(ayah.numberInSurah, el);
                    }}
                    onClick={() => {
                      if (memMode) {
                        toggleAyahHidden(ayah.number);
                      } else {
                        setBookmark(selectedSurah.number, ayah.numberInSurah);
                      }
                    }}
                    className={`cursor-pointer transition-all duration-200 ${
                      isHidden
                        ? 'bg-destructive/10 text-destructive/30 rounded-sm border border-dashed border-destructive/20 px-1'
                        : isBookmarked
                          ? 'bg-primary/20 ring-2 ring-primary/40 rounded-sm'
                          : 'hover:bg-primary/10 rounded-sm'
                    }`}
                    title={isHidden ? 'Tap to reveal' : isBookmarked ? `Last read (ayah ${ayah.numberInSurah})` : `Tap to ${memMode ? 'hide/reveal' : 'mark as last read'}`}
                  >
                    {isHidden ? '···' : ayah.text}
                    {!isHidden && (
                      <span
                        className="inline-flex items-center justify-center mx-1 select-none"
                        style={{
                          fontFamily: theme === 'madina-1441' ? "'Amiri Quran', serif" : "'Amiri', serif",
                          fontSize: '0.75em',
                          color: isBookmarked ? 'hsl(var(--primary))' : 'hsl(var(--primary) / 0.5)',
                          verticalAlign: 'baseline',
                          position: 'relative',
                          top: '-1px',
                          fontWeight: isBookmarked ? 700 : 400,
                        }}
                      >
                        ﴿{toArabicNumber(ayah.numberInSurah)}﴾
                      </span>
                    )}
                  </span>
                );
              })}
            </p>
          </div>
        </div>

        {hasMore && (
          <div className="py-4 text-center">
            {loadingMore ? (
              <Loader2 className="h-6 w-6 animate-spin text-primary mx-auto" />
            ) : (
              <Button variant="outline" onClick={loadMoreAyahs}>
                Load more ayahs ({surahData.ayahs.length - visibleAyahs} remaining)
              </Button>
            )}
          </div>
        )}

        {!hasMore && (
          <p className="text-center text-sm text-muted-foreground py-2">
            All {totalAyahs} ayahs loaded
          </p>
        )}

        <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
          <div className="h-full bg-primary rounded-full transition-all duration-500" style={{ width: `${readPct}%` }} />
        </div>
        <p className="text-xs text-center text-muted-foreground">
          {visibleAyahs} / {totalAyahs} ayahs loaded
        </p>

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

      {/* View Tabs */}
      <div className="flex gap-1 bg-muted/50 p-1 rounded-lg">
        <Button
          variant={view === 'list' || view === 'surah' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setView('list')}
          className="flex-1 gap-2"
        >
          <BookOpen className="w-4 h-4" />
          Read
        </Button>
        <Button
          variant={view === 'dashboard' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setView('dashboard')}
          className="flex-1 gap-2"
        >
          <LayoutGrid className="w-4 h-4" />
          Dashboard
        </Button>
      </div>

      {view === 'dashboard' && (
        <QuranDashboard
          completedSurahs={progress.completedSurahs}
          onReadSurah={(s) => { setView('list'); loadSurah(s); }}
        />
      )}

      {view !== 'dashboard' && (<>
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

      <DailyReadingCard
        onReadSurah={loadSurah}
        dailyCompleted={dailyCompleted}
        setDailyCompleted={setDailyCompleted}
        dailyPages={dailyPages}
        setDailyPages={setDailyPages}
      />

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
            <div className="absolute right-0 top-full mt-1 z-50 bg-popover border border-border rounded-lg shadow-xl p-1 w-48 sm:w-52">
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
          const bookmarkedAyah = bookmarks[surah.number] || 0;
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
                  {bookmarkedAyah > 0 && (
                    <Badge variant="secondary" className="text-[10px] flex-shrink-0 gap-1">
                      <MapPin className="w-2.5 h-2.5" />
                      {bookmarkedAyah}
                    </Badge>
                  )}
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
    </>
    )}
    </div>
  );
}

function DailyReadingCard({
  onReadSurah,
  dailyCompleted,
  setDailyCompleted,
  dailyPages,
  setDailyPages,
}: {
  onReadSurah: (s: SurahInfo) => void;
  dailyCompleted: Record<string, boolean>;
  setDailyCompleted: (v: Record<string, boolean>) => void;
  dailyPages: number;
  setDailyPages: (v: number) => void;
}) {
  const DAILY_KEY = 'quran-daily-progress';
  const PAGES_KEY = 'quran-daily-pages';

  const [editing, setEditing] = useState(false);
  const [tempPages, setTempPages] = useState(String(dailyPages));

  const today = new Date();
  const todayKey = today.toISOString().split('T')[0];
  const dayOfMonth = today.getDate();
  const isTodayDone = !!dailyCompleted[todayKey];
  const portion = getDailyPortion(dayOfMonth, dailyPages);
  const startSurah = SURAH_LIST.find(s => s.number === portion.startSurah);
  const endSurah = SURAH_LIST.find(s => s.number === portion.endSurah);

  const completedCount = Object.values(dailyCompleted).filter(Boolean).length;
  const totalDays = 30;
  const progressPct = Math.round((completedCount / totalDays) * 100);
  const estDays = Math.ceil(TOTAL_AYAHS / (dailyPages * 12));

  const toggleToday = () => {
    const updated = { ...dailyCompleted, [todayKey]: !isTodayDone };
    setDailyCompleted(updated);
    localStorage.setItem(DAILY_KEY, JSON.stringify(updated));
    toast.success(isTodayDone ? 'Marked as not completed' : 'Daily reading completed! 🎉');
  };

  const savePages = () => {
    const val = parseInt(tempPages);
    if (val >= 1 && val <= 20) {
      setDailyPages(val);
      localStorage.setItem(PAGES_KEY, String(val));
      setEditing(false);
    } else {
      toast.error('Pages must be between 1 and 20');
    }
  };

  return (
    <Card className={`border transition-colors ${isTodayDone ? 'bg-emerald-500/5 border-emerald-500/30' : 'bg-gradient-to-r from-emerald-500/5 to-primary/5 border-emerald-500/20'}`}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center justify-between">
          <span className="flex items-center gap-2">
            <ScrollText className="w-4 h-4 text-emerald-500" />
            الورد اليومي — Daily Reading
          </span>
          <span className="text-xs font-normal text-muted-foreground">
            {completedCount}/{totalDays} days ({progressPct}%)
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
          <div
            className="h-full bg-emerald-500 rounded-full transition-all duration-500"
            style={{ width: `${progressPct}%` }}
          />
        </div>

        <div className="flex items-center justify-between text-sm">
          <p className="text-muted-foreground">
            {isTodayDone ? (
              <span className="text-emerald-600 dark:text-emerald-400 font-medium">✓ Today's reading completed</span>
            ) : (
              <>Read: <strong>Surah {startSurah?.englishName}</strong> ({portion.startAyah})
                {portion.startSurah !== portion.endSurah && (
                  <> → <strong>Surah {endSurah?.englishName}</strong> ({portion.endAyah})</>
                )}
              </>
            )}
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>{dailyPages} pages/day</span>
          <span>•</span>
          <span>~{estDays} days to complete</span>
          <span>•</span>
          {editing ? (
            <span className="flex items-center gap-1">
              <input
                type="number"
                min={1}
                max={20}
                value={tempPages}
                onChange={(e) => setTempPages(e.target.value)}
                className="w-12 px-1 py-0.5 rounded border border-border bg-background text-center text-xs"
                onKeyDown={(e) => e.key === 'Enter' && savePages()}
              />
              <Button variant="ghost" size="sm" className="h-5 px-1.5 text-xs" onClick={savePages}>✓</Button>
              <Button variant="ghost" size="sm" className="h-5 px-1.5 text-xs" onClick={() => setEditing(false)}>✕</Button>
            </span>
          ) : (
            <button
              onClick={() => { setTempPages(String(dailyPages)); setEditing(true); }}
              className="text-primary hover:underline cursor-pointer"
            >
              Edit
            </button>
          )}
        </div>

        <div className="flex gap-2">
          {!isTodayDone && (
            <Button size="sm" onClick={() => startSurah && onReadSurah(startSurah)}>
              <BookOpen className="w-4 h-4 mr-1" />
              Start Reading
            </Button>
          )}
          <Button
            size="sm"
            variant={isTodayDone ? 'outline' : 'default'}
            className={isTodayDone ? 'border-emerald-500/50 text-emerald-600 dark:text-emerald-400' : ''}
            onClick={toggleToday}
          >
            <CheckCircle2 className="w-4 h-4 mr-1" />
            {isTodayDone ? 'Done ✓' : 'Mark Done'}
          </Button>
        </div>

        <p className="text-xs text-muted-foreground">
          {today.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
        </p>
      </CardContent>
    </Card>
  );
}
