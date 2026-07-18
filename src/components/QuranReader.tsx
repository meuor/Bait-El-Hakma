import { useState, useEffect, useCallback, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollText, BookOpen, ArrowLeft, Bookmark, ChevronUp } from 'lucide-react';
import { SURAH_LIST, getDailyPortion, type SurahInfo } from '@/data/quranData';

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

const LAST_READ_KEY = 'quran-last-read';

function loadLastRead(): { surah: number; ayah: number } | null {
  try {
    const raw = localStorage.getItem(LAST_READ_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

function saveLastRead(surah: number, ayah: number) {
  localStorage.setItem(LAST_READ_KEY, JSON.stringify({ surah, ayah }));
}

export function QuranReader() {
  const [view, setView] = useState<'list' | 'surah'>('list');
  const [selectedSurah, setSelectedSurah] = useState<SurahInfo | null>(null);
  const [surahData, setSurahData] = useState<SurahData | null>(null);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'meccan' | 'medinan'>('all');
  const [lastRead, setLastRead] = useState(loadLastRead);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = scrollRef.current?.closest('.overflow-auto') || window;
    const handleScroll = () => {
      const scrollTop = el === window ? window.scrollY : (el as HTMLElement).scrollTop;
      setShowScrollTop(scrollTop > 400);
    };
    el.addEventListener('scroll', handleScroll);
    return () => el.removeEventListener('scroll', handleScroll);
  }, []);

  const loadSurah = useCallback(async (surah: SurahInfo) => {
    setSelectedSurah(surah);
    setView('surah');
    try {
      const res = await fetch(`https://api.alquran.cloud/v1/surah/${surah.number}/ar.alafasy`);
      const json = await res.json();
      if (json.code === 200) {
        setSurahData(json.data);
        saveLastRead(surah.number, 1);
        setLastRead({ surah: surah.number, ayah: 1 });
      }
    } catch (err) {
      console.error('Failed to load surah:', err);
    } finally {
    }
  }, []);

  const loadFromLastRead = useCallback(() => {
    if (lastRead) {
      const surah = SURAH_LIST.find(s => s.number === lastRead.surah);
      if (surah) {
        loadSurah(surah);
      }
    }
  }, [lastRead, loadSurah]);

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

  if (view === 'surah' && surahData) {
    return (
      <div className="space-y-4" ref={scrollRef}>
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => { setView('list'); setSurahData(null); }}>
            <ArrowLeft className="w-4 h-4 mr-1" />
            Surahs
          </Button>
          <div className="flex-1 text-center">
            <h3 className="font-bold text-lg">{surahData.englishName}</h3>
            <p className="text-sm text-muted-foreground" dir="rtl">{surahData.name}</p>
          </div>
          <Badge variant="secondary">{selectedSurah?.numberOfAyahs} ayahs</Badge>
        </div>

        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-3xl font-arabic leading-loose mb-2" dir="rtl">
              بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ
            </p>
            <p className="text-sm text-muted-foreground">In the name of Allah, the Most Gracious, the Most Merciful</p>
          </CardContent>
        </Card>

        <div className="space-y-2">
          {surahData.ayahs.map((ayah) => (
            <div
              key={ayah.number}
              id={`ayah-${ayah.numberInSurah}`}
              className="p-4 rounded-lg bg-card border border-border/50 hover:border-primary/30 transition-colors"
            >
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-sm font-bold text-primary">{ayah.numberInSurah}</span>
                </div>
                <p
                  className="flex-1 text-2xl font-arabic leading-loose text-right"
                  dir="rtl"
                  onMouseUp={() => saveLastRead(surahData.number, ayah.numberInSurah)}
                >
                  {ayah.text}
                </p>
              </div>
            </div>
          ))}
        </div>

        {showScrollTop && (
          <Button
            variant="outline"
            size="icon"
            className="fixed bottom-24 right-6 z-40 shadow-lg"
            onClick={() => {
              const container = scrollRef.current?.closest('.overflow-auto');
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

      {lastRead && (
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium flex items-center gap-2">
                <Bookmark className="w-4 h-4 text-primary" />
                Resume Reading
              </p>
              <p className="text-xs text-muted-foreground">
                Surah {SURAH_LIST.find(s => s.number === lastRead.surah)?.englishName || ''} — Ayah {lastRead.ayah}
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

      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          placeholder="Search surah name or number..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
        />
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
      </div>

      <div className="grid gap-2">
        {filteredSurahs.map((surah) => (
          <button
            key={surah.number}
            onClick={() => loadSurah(surah)}
            className="flex items-center gap-3 p-3 rounded-lg border border-border/50 hover:border-primary/30 hover:bg-muted/50 transition-all text-left"
          >
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-sm font-bold text-primary">{surah.number}</span>
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
            <p className="text-lg font-arabic flex-shrink-0" dir="rtl">{surah.name}</p>
          </button>
        ))}
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
