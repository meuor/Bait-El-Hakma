import { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import {
  Play, Pause, SkipForward, SkipBack, Volume2, VolumeX,
  Repeat, ChevronDown, Loader2,
} from 'lucide-react';

interface Reciter {
  id: string;
  name: string;
  nameAr: string;
}

const RECITERS: Reciter[] = [
  { id: 'ar.alafasy', name: 'Mishary Alafasy', nameAr: 'مشاري العفاسي' },
  { id: 'ar.muhammadjinni', name: 'Muhammad Jinn', nameAr: 'محمد جنّي' },
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

const SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 2];

interface QuranAudioProps {
  surahNumber: number;
  ayahs: { number: number; numberInSurah: number }[];
  currentAyah: number;
  onAyahChange: (ayahNum: number) => void;
}

export function QuranAudio({ surahNumber, ayahs, currentAyah, onAyahChange }: QuranAudioProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [loading, setLoading] = useState(false);
  const [reciter, setReciter] = useState('ar.alafasy');
  const [speed, setSpeed] = useState(1);
  const [showReciters, setShowReciters] = useState(false);
  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);
  const [repeatMode, setRepeatMode] = useState<'none' | 'ayah'>('none');
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [audioError, setAudioError] = useState<string | null>(null);

  // Use refs for values needed in event handlers (avoid stale closures)
  const stateRef = useRef({ repeatMode, currentAyah, ayahs, reciter, onAyahChange });
  stateRef.current = { repeatMode, currentAyah, ayahs, reciter, onAyahChange };

  const selectedReciter = RECITERS.find(r => r.id === reciter) || RECITERS[0];

  const buildUrl = useCallback((ayahNum: number, reciterId: string, ayahList: typeof ayahs) => {
    const ayah = ayahList.find(a => a.numberInSurah === ayahNum);
    if (!ayah) return null;
    return `https://cdn.islamic.network/quran/audio/128/${reciterId}/${ayah.number}.mp3`;
  }, []);

  // Create audio element once, attach event listeners using refs
  useEffect(() => {
    const audio = new Audio();
    audio.preload = 'auto';
    audioRef.current = audio;

    const onEnded = () => {
      const { repeatMode: rm, currentAyah: ca, ayahs: al, reciter: ri, onAyahChange: oc } = stateRef.current;
      setAudioError(null);
      setLoading(false);

      if (rm === 'ayah') {
        audio.currentTime = 0;
        audio.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
        return;
      }

      const nextIdx = al.findIndex(a => a.numberInSurah === ca) + 1;
      if (nextIdx < al.length) {
        const nextAyah = al[nextIdx].numberInSurah;
        oc(nextAyah);
        audio.src = `https://cdn.islamic.network/quran/audio/128/${ri}/${al[nextIdx].number}.mp3`;
        audio.load();
        audio.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
      } else {
        setIsPlaying(false);
      }
    };

    const onError = () => {
      setAudioError('Failed to load audio');
      setIsPlaying(false);
      setLoading(false);
    };

    const onCanPlay = () => setLoading(false);
    const onWaiting = () => setLoading(true);

    audio.addEventListener('ended', onEnded);
    audio.addEventListener('error', onError);
    audio.addEventListener('canplay', onCanPlay);
    audio.addEventListener('waiting', onWaiting);

    return () => {
      audio.removeEventListener('ended', onEnded);
      audio.removeEventListener('error', onError);
      audio.removeEventListener('canplay', onCanPlay);
      audio.removeEventListener('waiting', onWaiting);
      audio.pause();
      audio.src = '';
      audioRef.current = null;
    };
  }, []);

  // Update volume/speed live
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = speed;
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [speed, volume, isMuted]);

  const playAyah = useCallback(async (ayahNum: number) => {
    const audio = audioRef.current;
    if (!audio) return;

    setAudioError(null);
    const url = buildUrl(ayahNum, reciter, ayahs);
    if (!url) return;

    // Always set new source to be safe
    audio.src = url;
    audio.playbackRate = speed;
    audio.volume = isMuted ? 0 : volume;
    audio.load();

    try {
      await audio.play();
      setIsPlaying(true);
    } catch (err) {
      const isAbort = err instanceof DOMException && err.name === 'AbortError';
      if (!isAbort) {
        console.error('Audio play failed:', err);
        setAudioError('Tap play to start');
        setIsPlaying(false);
      }
    }
  }, [ayahs, reciter, speed, volume, isMuted, buildUrl]);

  const togglePlay = async () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
      return;
    }

    // Resume from pause
    if (audio.src && !audio.ended && audio.currentTime > 0) {
      try {
        await audio.play();
        setIsPlaying(true);
        setAudioError(null);
        return;
      } catch {
        // Fall through to fresh play
      }
    }

    // Fresh play
    playAyah(currentAyah);
  };

  const playNext = () => {
    const idx = ayahs.findIndex(a => a.numberInSurah === currentAyah);
    if (idx < ayahs.length - 1) {
      const next = ayahs[idx + 1].numberInSurah;
      onAyahChange(next);
      playAyah(next);
    }
  };

  const playPrev = () => {
    const idx = ayahs.findIndex(a => a.numberInSurah === currentAyah);
    if (idx > 0) {
      const prev = ayahs[idx - 1].numberInSurah;
      onAyahChange(prev);
      playAyah(prev);
    }
  };

  return (
    <div className="border border-border rounded-xl bg-card p-3 space-y-3">
      <div className="flex items-center justify-between">
        <div className="relative">
          <button
            onClick={() => setShowReciters(!showReciters)}
            className="flex items-center gap-1.5 text-sm font-medium hover:text-primary transition-colors"
          >
            <span dir="rtl" className="text-xs">{selectedReciter.nameAr}</span>
            <span className="text-xs text-muted-foreground">•</span>
            <span className="text-xs text-muted-foreground">{selectedReciter.name}</span>
            <ChevronDown className="w-3 h-3" />
          </button>
          {showReciters && (
            <div className="absolute top-full left-0 mt-1 bg-popover border border-border rounded-lg shadow-xl p-1 z-50 w-56 max-h-64 overflow-y-auto">
              {RECITERS.map(r => (
                <button
                  key={r.id}
                  onClick={() => {
                    setReciter(r.id);
                    setShowReciters(false);
                    if (isPlaying) playAyah(currentAyah);
                  }}
                  className={`w-full text-left px-3 py-1.5 rounded-md text-xs transition-colors ${
                    reciter === r.id ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
                  }`}
                >
                  <span className="font-medium">{r.name}</span>
                  <span className="block text-[10px] opacity-70" dir="rtl">{r.nameAr}</span>
                </button>
              ))}
            </div>
          )}
        </div>
        <Badge variant="outline" className="text-[10px]">
          {currentAyah}/{ayahs.length}
        </Badge>
      </div>

      <div className="flex items-center justify-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => setRepeatMode(repeatMode === 'none' ? 'ayah' : 'none')}
        >
          <Repeat className={`w-3.5 h-3.5 ${repeatMode !== 'none' ? 'text-primary' : ''}`} />
        </Button>
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={playPrev}>
          <SkipBack className="w-4 h-4" />
        </Button>
        <Button
          size="icon"
          className="h-10 w-10 rounded-full"
          onClick={togglePlay}
        >
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : isPlaying ? (
            <Pause className="w-5 h-5" />
          ) : (
            <Play className="w-5 h-5 ml-0.5" />
          )}
        </Button>
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={playNext}>
          <SkipForward className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => setIsMuted(!isMuted)}
        >
          {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
        </Button>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1">
          {SPEEDS.map(s => (
            <button
              key={s}
              onClick={() => setSpeed(s)}
              className={`px-1.5 py-0.5 rounded text-[10px] font-medium transition-colors ${
                speed === s ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted'
              }`}
            >
              {s}x
            </button>
          ))}
        </div>
        <div className="flex-1 flex items-center gap-2">
          <VolumeX className="w-3 h-3 text-muted-foreground shrink-0" />
          <Slider
            value={[volume * 100]}
            onValueChange={(v) => setVolume(v[0] / 100)}
            max={100}
            className="flex-1"
          />
          <Volume2 className="w-3 h-3 text-muted-foreground shrink-0" />
        </div>
      </div>

      {audioError && (
        <p className="text-[11px] text-center text-destructive bg-destructive/5 rounded-md px-2 py-1">
          {audioError}
        </p>
      )}
    </div>
  );
}
