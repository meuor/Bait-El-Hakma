import { useState, useEffect, useCallback, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  ScrollText, BookOpen, ArrowLeft, Bookmark, ChevronUp,
  CheckCircle2, Loader2, Palette, MapPin, Eye, EyeOff,
  Brain, LayoutGrid, Play, Pause, SkipForward, SkipBack, X,
  Volume2, VolumeX, Headphones, Repeat, Mic2,
} from 'lucide-react';
import { SURAH_LIST, TOTAL_AYAHS, type SurahInfo } from '@/data/quranData';
import { quranAPI } from '@/lib/api';
import { toast } from 'sonner';
import { QuranDashboard } from './QuranDashboard';

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

const RECITERS = [
  { id: 'ar.alafasy', name: 'Mishary Alafasy', nameAr: 'مشاري العفاسي' },
  { id: 'ar.muhammadjinni', name: 'Muhammad Jinni', nameAr: 'محمد جنّي' },
  { id: 'ar.muayyad', name: 'Muayyad Al-Muaeeq', nameAr: 'مؤيد المويقق' },
  { id: 'ar.minshawi', name: 'Minshawi', nameAr: 'المنشاوي' },
  { id: 'ar.minshawimujawwad', name: 'Minshawi Mujawwad', nameAr: 'المنشاوي مجود' },
  { id: 'ar.husary', name: 'Husary', nameAr: 'الحصري' },
  { id: 'ar.husarymujawwad', name: 'Husary Mujawwad', nameAr: 'الحصري مجود' },
  { id: 'ar.ayyoub', name: 'Ayyoub', nameAr: 'أيوب' },
  { id: 'ar.shaatree', name: 'Abdul Basit (Shaatree)', nameAr: 'عبدالباسط عبدالصمد' },
  { id: 'ar.ahmedajamy', name: 'Ahmed Al Ajmi', nameAr: 'أحمد العجمي' },
  { id: 'ar.md_yusuf', name: 'Md. Siddiqur Rahman', nameAr: 'محمد يوسف' },
  { id: 'ar.parhizgar', name: 'Parhizgar', nameAr: 'بهرزگر' },
  { id: 'ar.hudhaify', name: 'Hudhaify', nameAr: 'الحذيفي' },
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
  const [memMode, setMemMode] = useState(false);
  const [hiddenAyahs, setHiddenAyahs] = useState<Set<number>>(new Set());
  const [selectedAyah, setSelectedAyah] = useState<number | null>(null);
  const [playingAyah, setPlayingAyah] = useState<number | null>(null);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [audioLoading, setAudioLoading] = useState(false);
  const [audioMuted, setAudioMuted] = useState(false);
  const [repeatMode, setRepeatMode] = useState<'none' | 'ayah' | 'ayah3x'>('none');
  const [reciter, setReciter] = useState(() => {
    try { return localStorage.getItem('quran-reciter') || 'ar.alafasy'; } catch { return 'ar.alafasy'; }
  });
  const [showReciters, setShowReciters] = useState(false);
  const repeatCountRef = useRef(0);
  const [pendingScrollAyah, setPendingScrollAyah] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const ayahRefs = useRef<Map<number, HTMLDivElement>>(new Map());
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioStateRef = useRef({ surahData: null as SurahData | null, playingAyah: null as number | null, audioMuted: false, repeatMode: 'none' as 'none' | 'ayah' | 'ayah3x', reciter: 'ar.alafasy' });
  const syncTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  audioStateRef.current = { surahData, playingAyah, audioMuted, repeatMode, reciter };

  const totalRead = progress.completedSurahs.reduce((sum, sn) => {
    const s = SURAH_LIST.find(x => x.number === sn);
    return sum + (s ? s.numberOfAyahs : 0);
  }, 0);
  const completionPct = Math.round((totalRead / TOTAL_AYAHS) * 100);

  useEffect(() => {
    localStorage.setItem(THEME_KEY, theme);
  }, [theme]);

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

  useEffect(() => {
    const token = localStorage.getItem('bait-el-hakma-token');
    if (!token) return;
    quranAPI.get().then((data) => {
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
        if (container.scrollHeight - container.scrollTop - container.clientHeight < 300 && !allAyahsLoaded) {
          loadMoreAyahs();
        }
      }
    };
    el.addEventListener('scroll', handleScroll, { passive: true });
    return () => el.removeEventListener('scroll', handleScroll);
  }, [view, surahData, allAyahsLoaded]);

  useEffect(() => {
    if (!pendingScrollAyah || !surahData) return;
    let attempts = 0;
    const tryScroll = () => {
      const el = ayahRefs.current.get(pendingScrollAyah);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        setPendingScrollAyah(null);
      } else if (attempts < 10) {
        attempts++;
        setTimeout(tryScroll, 200);
      } else {
        setPendingScrollAyah(null);
      }
    };
    setTimeout(tryScroll, 150);
  }, [pendingScrollAyah, surahData, visibleAyahs]);

  useEffect(() => {
    if (playingAyah === null || !surahData) return;
    const el = ayahRefs.current.get(playingAyah);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [playingAyah, surahData]);

  useEffect(() => {
    if (playingAyah === null || !surahData || allAyahsLoaded) return;
    const idx = surahData.ayahs.findIndex(a => a.numberInSurah === playingAyah);
    if (idx >= visibleAyahs - 3) {
      const target = Math.min(idx + 24, surahData.ayahs.length);
      if (target > visibleAyahs) {
        setVisibleAyahs(target);
        if (target >= surahData.ayahs.length) setAllAyahsLoaded(true);
      }
    }
  }, [playingAyah, surahData, visibleAyahs, allAyahsLoaded]);

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
      if (next.has(ayahNumber)) next.delete(ayahNumber);
      else next.add(ayahNumber);
      return next;
    });
  }, []);

  const hideAllAyahs = useCallback(() => {
    if (!surahData) return;
    setHiddenAyahs(new Set(surahData.ayahs.map(a => a.number)));
    toast.success('All ayahs hidden — test yourself!');
  }, [surahData]);

  const revealAllAyahs = useCallback(() => setHiddenAyahs(new Set()), []);

  // Initialize audio element once
  useEffect(() => {
    const audio = new Audio();
    audio.preload = 'auto';
    audioRef.current = audio;

    const onEnded = () => {
      const { surahData: sd, playingAyah: pa, audioMuted: am, repeatMode: rm, reciter: ri } = audioStateRef.current;
      if (!sd || pa === null) return;

      if (rm === 'ayah' || rm === 'ayah3x') {
        if (rm === 'ayah3x') {
          repeatCountRef.current++;
          if (repeatCountRef.current >= 3) {
            repeatCountRef.current = 0;
          } else {
            audio.currentTime = 0;
            audio.volume = am ? 0 : 0.8;
            audio.play().then(() => setIsAudioPlaying(true)).catch(() => setIsAudioPlaying(false));
            return;
          }
        } else {
          audio.currentTime = 0;
          audio.volume = am ? 0 : 0.8;
          audio.play().then(() => setIsAudioPlaying(true)).catch(() => setIsAudioPlaying(false));
          return;
        }
      }

      const idx = sd.ayahs.findIndex(a => a.numberInSurah === pa);
      if (idx < sd.ayahs.length - 1) {
        const nextAyah = sd.ayahs[idx + 1];
        setPlayingAyah(nextAyah.numberInSurah);
        const url = `https://cdn.islamic.network/quran/audio/128/${ri}/${nextAyah.number}.mp3`;
        audio.src = url;
        audio.volume = am ? 0 : 0.8;
        audio.load();
        audio.play().then(() => setIsAudioPlaying(true)).catch(() => setIsAudioPlaying(false));
      } else {
        setIsAudioPlaying(false);
        setPlayingAyah(null);
      }
    };

    const onCanPlay = () => setAudioLoading(false);
    const onWaiting = () => setAudioLoading(true);
    const onError = () => { setIsAudioPlaying(false); setAudioLoading(false); };

    audio.addEventListener('ended', onEnded);
    audio.addEventListener('canplay', onCanPlay);
    audio.addEventListener('waiting', onWaiting);
    audio.addEventListener('error', onError);

    return () => {
      audio.removeEventListener('ended', onEnded);
      audio.removeEventListener('canplay', onCanPlay);
      audio.removeEventListener('waiting', onWaiting);
      audio.removeEventListener('error', onError);
      audio.pause();
      audio.src = '';
    };
  }, []);

  const playAyahAudio = useCallback(async (ayahNum: number) => {
    const audio = audioRef.current;
    if (!audio || !surahData) return;
    const ayah = surahData.ayahs.find(a => a.numberInSurah === ayahNum);
    if (!ayah) return;

    repeatCountRef.current = 0;
    const url = `https://cdn.islamic.network/quran/audio/128/${reciter}/${ayah.number}.mp3`;
    audio.src = url;
    audio.volume = audioMuted ? 0 : 0.8;
    audio.load();
    setPlayingAyah(ayahNum);
    setSelectedAyah(ayahNum);
    setAudioLoading(true);

    try {
      await audio.play();
      setIsAudioPlaying(true);
    } catch (err) {
      if (!(err instanceof DOMException && err.name === 'AbortError')) {
        setIsAudioPlaying(false);
        setAudioLoading(false);
      }
    }
  }, [surahData, audioMuted, reciter]);

  const toggleAudioPlay = async () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isAudioPlaying) {
      audio.pause();
      setIsAudioPlaying(false);
      return;
    }
    if (audio.src && !audio.ended && audio.currentTime > 0) {
      try { await audio.play(); setIsAudioPlaying(true); return; } catch {}
    }
    if (playingAyah) {
      playAyahAudio(playingAyah);
    } else if (selectedAyah) {
      playAyahAudio(selectedAyah);
    } else if (surahData && surahData.ayahs.length > 0) {
      playAyahAudio(surahData.ayahs[0].numberInSurah);
    }
  };

  const playPrevAyah = () => {
    if (!surahData || playingAyah === null) return;
    const idx = surahData.ayahs.findIndex(a => a.numberInSurah === playingAyah);
    if (idx > 0) {
      const prev = surahData.ayahs[idx - 1].numberInSurah;
      setSelectedAyah(prev);
      playAyahAudio(prev);
    }
  };

  const playNextAyah = () => {
    if (!surahData || playingAyah === null) return;
    const idx = surahData.ayahs.findIndex(a => a.numberInSurah === playingAyah);
    if (idx < surahData.ayahs.length - 1) {
      const next = surahData.ayahs[idx + 1].numberInSurah;
      setSelectedAyah(next);
      playAyahAudio(next);
    }
  };

  const stopAudio = () => {
    const audio = audioRef.current;
    if (audio) { audio.pause(); audio.currentTime = 0; }
    setIsAudioPlaying(false);
    setPlayingAyah(null);
  };

  const handleAyahClick = useCallback((ayah: Ayah) => {
    if (memMode) {
      toggleAyahHidden(ayah.number);
      return;
    }
    if (selectedAyah === ayah.numberInSurah) {
      setSelectedAyah(null);
    } else {
      setSelectedAyah(ayah.numberInSurah);
    }
  }, [memMode, selectedAyah, toggleAyahHidden]);

  const loadSurah = useCallback(async (surah: SurahInfo) => {
    stopAudio();
    setSelectedAyah(null);
    setSelectedSurah(surah);
    setView('surah');
    setVisibleAyahs(12);
    setAllAyahsLoaded(false);
    try {
      const res = await fetch(`https://api.alquran.cloud/v1/surah/${surah.number}/ar.alafasy`);
      const json = await res.json();
      if (json.code === 200) {
        const data = json.data;
        const norm = (s: string) => s
          .replace(/[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06DC\u06DF-\u06E4\u06E7\u06E8\u06EA-\u06ED\u06E1\u0640\u06E2\u06E3]/g, '')
          .replace(/\u06CC/g, '\u064A').replace(/\u0671/g, '\u0627')
          .replace(/\s+/g, ' ').trim();
        const bsmNorm = 'بسم الله الرحمن الرحيم';
        const hasBasmala = (t: string) => norm(t).startsWith(bsmNorm);
        const stripBasmala = (t: string) => {
          if (!hasBasmala(t)) return t;
          const d = /[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06DC\u06DF-\u06E4\u06E7\u06E8\u06EA-\u06ED\u06E1\u0640\u06E2\u06E3]/;
          let i = 0, c = 0;
          for (; i < t.length && c < bsmNorm.length; i++) { if (!d.test(t[i])) c++; }
          while (i < t.length && (t[i] === ' ' || d.test(t[i]))) i++;
          return t.substring(i);
        };

        if (surah.number === 1) {
          data.ayahs = data.ayahs.filter((a: Ayah) => !hasBasmala(a.text));
        } else if (data.ayahs.length > 0) {
          data.ayahs[0] = { ...data.ayahs[0], text: stripBasmala(data.ayahs[0].text) };
        }

        setSurahData(data);
        const total = data.ayahs.length;
        if (total <= 12) setAllAyahsLoaded(true);

        const savedBookmark = loadBookmarks()[surah.number] || 1;
        if (savedBookmark > 12) {
          setVisibleAyahs(savedBookmark + 2);
          if (savedBookmark + 2 >= total) setAllAyahsLoaded(true);
        }
        setPendingScrollAyah(savedBookmark > 1 ? savedBookmark : null);
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
  const ayahLineHeight = '2em';
  const anyAudioActive = playingAyah !== null;

  if (view === 'surah' && surahData && selectedSurah) {
    const shownAyahs = surahData.ayahs.slice(0, visibleAyahs);
    const hasMore = visibleAyahs < surahData.ayahs.length;
    const readPct = Math.round((visibleAyahs / surahData.ayahs.length) * 100);
    const bookmarkAyah = bookmarks[selectedSurah.number] || 0;
    const totalAyahs = surahData.ayahs.length;

    return (
      <div className="space-y-4" ref={containerRef}>
        <div className="flex items-center gap-2 sticky top-0 z-30 bg-background/95 backdrop-blur-sm py-2 -mx-1 px-1">
          <Button variant="ghost" size="sm" onClick={() => { stopAudio(); setSelectedAyah(null); setView('list'); setSurahData(null); }}>
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
            <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => {
              if (bookmarkAyah > visibleAyahs) {
                setVisibleAyahs(bookmarkAyah + 2);
                if (bookmarkAyah + 2 >= totalAyahs) setAllAyahsLoaded(true);
              }
              setPendingScrollAyah(bookmarkAyah);
            }}>
              Jump to it
            </Button>
          </div>
        )}

        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant={memMode ? 'default' : 'outline'}
            size="sm"
            onClick={() => { setMemMode(!memMode); setHiddenAyahs(new Set()); }}
            className="gap-1.5"
          >
            <Brain className="w-4 h-4" />
            {memMode ? 'Memorize ON' : 'Memorize'}
          </Button>
          {memMode && (
            <>
              <Button variant="outline" size="sm" onClick={hideAllAyahs} className="gap-1.5">
                <EyeOff className="w-3.5 h-3.5" /> Hide All
              </Button>
              <Button variant="outline" size="sm" onClick={revealAllAyahs} className="gap-1.5">
                <Eye className="w-3.5 h-3.5" /> Reveal All
              </Button>
              <Badge variant="secondary" className="text-xs">{hiddenAyahs.size}/{totalAyahs} hidden</Badge>
            </>
          )}

          <div className="relative ml-auto">
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 text-xs"
              onClick={() => setShowReciters(!showReciters)}
            >
              <Mic2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{RECITERS.find(r => r.id === reciter)?.nameAr || ''}</span>
            </Button>
            {showReciters && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowReciters(false)} />
                <div className="absolute right-0 top-full mt-1 z-50 bg-popover border border-border rounded-xl shadow-xl p-1 w-56 max-h-72 overflow-y-auto">
                  {RECITERS.map(r => (
                    <button
                      key={r.id}
                      onClick={() => {
                        setReciter(r.id);
                        localStorage.setItem('quran-reciter', r.id);
                        setShowReciters(false);
                        if (isAudioPlaying) playAyahAudio(playingAyah || 1);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-lg text-xs transition-colors ${
                        reciter === r.id ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
                      }`}
                    >
                      <span className="font-medium block">{r.name}</span>
                      <span className="block text-[10px] opacity-70" dir="rtl">{r.nameAr}</span>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {repeatMode !== 'none' && (
            <Badge variant="secondary" className="gap-1 text-xs">
              <Repeat className="w-3 h-3" />
              {repeatMode === 'ayah3x' ? '3x' : '∞'}
            </Badge>
          )}
          <Badge variant={anyAudioActive ? 'default' : 'outline'} className="gap-1 text-xs">
            <Headphones className="w-3 h-3" />
            {anyAudioActive ? `Playing ${playingAyah}` : 'Tap ayah to play'}
          </Badge>
        </div>

        {selectedSurah.number === 2 && (
          <div className="text-center py-4">
            <p dir="rtl" style={{ fontFamily: themeData.fontFamily, fontSize: ayahFontSize, lineHeight: ayahLineHeight, textAlign: 'center' }}>
              بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
            </p>
          </div>
        )}

        <div className="rounded-xl border border-border/30 overflow-hidden shadow-sm" style={{ background: 'hsl(var(--card))' }}>
          <div className="p-6 md:p-10">
            <div className="space-y-5">
              {shownAyahs.map((ayah) => {
                const isBookmarked = bookmarkAyah === ayah.numberInSurah;
                const isHidden = memMode && hiddenAyahs.has(ayah.number);
                const isSelected = selectedAyah === ayah.numberInSurah;
                const isPlaying = playingAyah === ayah.numberInSurah;

                return (
                  <div key={ayah.number} className="relative">
                    <div
                      ref={(el) => { if (el) ayahRefs.current.set(ayah.numberInSurah, el); }}
                      dir="rtl"
                      onClick={() => handleAyahClick(ayah)}
                      style={{
                        fontFamily: themeData.fontFamily,
                        fontSize: ayahFontSize,
                        lineHeight: ayahLineHeight,
                        textAlign: 'center',
                        wordSpacing: '0.05em',
                        letterSpacing: theme === 'unicode' ? '0' : '0.01em',
                      }}
                      className={`cursor-pointer transition-all duration-200 rounded-xl px-3 py-2 ${
                        isHidden
                          ? 'bg-destructive/5 text-destructive/30 border border-dashed border-destructive/15'
                          : isPlaying
                            ? 'bg-primary/10 ring-2 ring-primary/40 shadow-sm'
                            : isSelected
                              ? 'bg-primary/5 ring-1 ring-primary/20'
                              : isBookmarked
                                ? 'bg-primary/5 ring-1 ring-primary/15'
                                : 'hover:bg-primary/5'
                      }`}
                    >
                      {isHidden ? (
                        <span className="tracking-widest">• • •</span>
                      ) : (
                        <>
                          {ayah.text}
                          <span
                            className="inline-flex items-center justify-center mx-2 select-none"
                            style={{
                              fontFamily: "'Amiri Quran', 'Amiri', serif",
                              fontSize: '0.65em',
                              color: isPlaying ? 'hsl(var(--primary))' : isBookmarked ? 'hsl(var(--primary))' : 'hsl(var(--primary) / 0.4)',
                              verticalAlign: 'baseline',
                              fontWeight: isPlaying || isBookmarked ? 700 : 400,
                            }}
                          >
                            ﴿{toArabicNumber(ayah.numberInSurah)}﴾
                          </span>
                        </>
                      )}
                    </div>

                    {isSelected && !memMode && (
                      <div className="flex items-center justify-center gap-1 p-1.5 mt-1 mb-1 bg-muted/40 rounded-xl border border-border/20 animate-in fade-in slide-in-from-top-1 duration-200">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 shrink-0"
                          onClick={(e) => { e.stopPropagation(); playPrevAyah(); }}
                          disabled={playingAyah === null || surahData.ayahs.findIndex(a => a.numberInSurah === playingAyah) <= 0}
                        >
                          <SkipBack className="w-3 h-3" />
                        </Button>

                        <Button
                          size="icon"
                          className="h-9 w-9 rounded-full shrink-0"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (isPlaying && isAudioPlaying) {
                              toggleAudioPlay();
                            } else {
                              playAyahAudio(ayah.numberInSurah);
                            }
                          }}
                        >
                          {audioLoading && isPlaying ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : isPlaying && isAudioPlaying ? (
                            <Pause className="w-4 h-4" />
                          ) : (
                            <Play className="w-4 h-4 ml-0.5" />
                          )}
                        </Button>

                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 shrink-0"
                          onClick={(e) => { e.stopPropagation(); playNextAyah(); }}
                          disabled={playingAyah === null || surahData.ayahs.findIndex(a => a.numberInSurah === playingAyah) >= surahData.ayahs.length - 1}
                        >
                          <SkipForward className="w-3 h-3" />
                        </Button>

                        <div className="w-px h-4 bg-border/50 mx-0.5" />

                        <Button
                          variant={repeatMode !== 'none' ? 'secondary' : 'ghost'}
                          size="icon"
                          className="h-7 w-7 shrink-0"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (repeatMode === 'none') setRepeatMode('ayah');
                            else if (repeatMode === 'ayah') setRepeatMode('ayah3x');
                            else setRepeatMode('none');
                          }}
                          title={repeatMode === 'none' ? 'Repeat' : repeatMode === 'ayah' ? 'Repeat: On' : 'Repeat: 3x'}
                        >
                          {repeatMode === 'ayah3x' ? (
                            <span className="text-[10px] font-bold">3x</span>
                          ) : (
                            <Repeat className={`w-3.5 h-3.5 ${repeatMode !== 'none' ? 'text-primary' : ''}`} />
                          )}
                        </Button>

                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 shrink-0"
                          onClick={(e) => { e.stopPropagation(); setAudioMuted(!audioMuted); }}
                        >
                          {audioMuted ? <VolumeX className="w-3 h-3" /> : <Volume2 className="w-3 h-3" />}
                        </Button>

                        <div className="w-px h-4 bg-border/50 mx-0.5" />

                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 shrink-0"
                          onClick={(e) => { e.stopPropagation(); setBookmark(selectedSurah.number, ayah.numberInSurah); }}
                        >
                          <Bookmark className={`w-3 h-3 ${isBookmarked ? 'fill-primary text-primary' : ''}`} />
                        </Button>

                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 shrink-0"
                          onClick={(e) => { e.stopPropagation(); setSelectedAyah(null); }}
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
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

      <div className="flex gap-1 bg-muted/50 p-1 rounded-lg">
        <Button
          variant={view === 'list' || view === 'surah' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setView('list')}
          className="flex-1 gap-2"
        >
          <BookOpen className="w-4 h-4" /> Read
        </Button>
        <Button
          variant={view === 'dashboard' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setView('dashboard')}
          className="flex-1 gap-2"
        >
          <LayoutGrid className="w-4 h-4" /> Dashboard
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
                <Bookmark className="w-4 h-4 text-primary" /> Resume Reading
              </p>
              <p className="text-xs text-muted-foreground">
                Surah {SURAH_LIST.find(s => s.number === last.surah)?.englishName || ''} — Ayah {last.ayah}
              </p>
            </div>
            <Button size="sm" onClick={loadFromLastRead}>
              <BookOpen className="w-4 h-4 mr-1" /> Continue
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

      <div className="space-y-2">
        {filteredSurahs.length > 0 && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <ScrollText className="w-3.5 h-3.5" />
            <span>{filteredSurahs.length} surahs</span>
          </div>
        )}

        {filteredSurahs.map(surah => (
          <div
            key={surah.number}
            onClick={() => loadSurah(surah)}
            className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all hover:shadow-md ${
              isComplete(surah.number) ? 'bg-primary/5 border-primary/20' : 'bg-card hover:bg-muted/50'
            }`}
          >
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold ${
              isComplete(surah.number) ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
            }`}>
              {surah.number}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm truncate">{surah.englishName}</p>
              <p className="text-xs text-muted-foreground truncate" dir="rtl">{surah.name}</p>
            </div>
            <div className="text-right shrink-0">
              <p className="text-xs text-muted-foreground">{surah.numberOfAyahs} ayahs</p>
              <Badge variant={surah.revelationType === 'Meccan' ? 'secondary' : 'outline'} className="text-[10px] mt-0.5">
                {surah.revelationType}
              </Badge>
            </div>
            {bookmarks[surah.number] && (
              <Bookmark className="w-4 h-4 text-primary shrink-0 fill-primary" />
            )}
          </div>
        ))}

        {filteredSurahs.length === 0 && (
          <p className="text-center text-muted-foreground py-8">No surahs found</p>
        )}
      </div>
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
  setDailyPages: (n: number) => void;
}) {
  const today = new Date().toISOString().split('T')[0];
  const isTodayDone = dailyCompleted[today] || false;
  const [showSettings, setShowSettings] = useState(false);

  const getTodayPortion = () => {
    const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
    const totalPages = 604;
    const startPage = ((dayOfYear * dailyPages) % totalPages) + 1;
    return { startPage, endPage: startPage + dailyPages - 1 };
  };

  const toggleTodayDone = () => {
    const updated = { ...dailyCompleted, [today]: !isTodayDone };
    setDailyCompleted(updated);
    localStorage.setItem('quran-daily-progress', JSON.stringify(updated));
  };

  const portion = getTodayPortion();

  return (
    <Card className={isTodayDone ? 'bg-emerald-500/5 border-emerald-500/20' : ''}>
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium flex items-center gap-2">
              {isTodayDone ? '✅' : '📖'} Daily Reading — {new Date().toLocaleDateString('en-US', { weekday: 'long' })}
            </p>
            <p className="text-xs text-muted-foreground">
              Pages {portion.startPage}–{portion.endPage} ({dailyPages} pages/day)
            </p>
          </div>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => setShowSettings(!showSettings)}>
              ⚙️
            </Button>
            <Button
              variant={isTodayDone ? 'default' : 'outline'}
              size="sm"
              onClick={toggleTodayDone}
            >
              {isTodayDone ? 'Done' : 'Mark Done'}
            </Button>
          </div>
        </div>
        {showSettings && (
          <div className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">Pages:</span>
            {[2, 4, 6, 8, 10].map(n => (
              <Button
                key={n}
                variant={dailyPages === n ? 'default' : 'outline'}
                size="sm"
                className="h-7 w-8 text-xs"
                onClick={() => { setDailyPages(n); localStorage.setItem('quran-daily-pages', String(n)); }}
              >
                {n}
              </Button>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
