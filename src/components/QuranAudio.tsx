import { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import {
  Play, Pause, SkipForward, SkipBack, Volume2, VolumeX,
  Repeat, ChevronDown,
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
  { id: 'ar.ayyoub', name: 'Ayyoub', nameAr: 'أيوب' },
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
  const [reciter, setReciter] = useState('ar.alafasy');
  const [speed, setSpeed] = useState(1);
  const [showReciters, setShowReciters] = useState(false);
  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);
  const [repeatMode, setRepeatMode] = useState<'none' | 'ayah' | 'range'>('none');
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const selectedReciter = RECITERS.find(r => r.id === reciter) || RECITERS[0];

  const getAudioUrl = useCallback((ayahNum: number) => {
    const padded = String(surahNumber).padStart(3, '0');
    const ayahPadded = String(ayahNum).padStart(3, '0');
    return `https://cdn.islamic.network/quran/audio/${reciter === 'ar.alafasy' ? '128' : '64'}/${reciter}/${padded}${ayahPadded}.mp3`;
  }, [surahNumber, reciter]);

  const playAyah = useCallback((ayahNum: number) => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    const audio = new Audio(getAudioUrl(ayahNum));
    audio.playbackRate = speed;
    audio.volume = isMuted ? 0 : volume;
    audioRef.current = audio;

    audio.onended = () => {
      if (repeatMode === 'ayah') {
        playAyah(ayahNum);
      } else {
        const nextIdx = ayahs.findIndex(a => a.numberInSurah === ayahNum) + 1;
        if (nextIdx < ayahs.length) {
          onAyahChange(ayahs[nextIdx].numberInSurah);
          playAyah(ayahs[nextIdx].numberInSurah);
        } else {
          setIsPlaying(false);
        }
      }
    };

    audio.play().catch(() => setIsPlaying(false));
    setIsPlaying(true);
  }, [getAudioUrl, speed, volume, isMuted, repeatMode, ayahs, onAyahChange]);

  const togglePlay = () => {
    if (isPlaying && audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      playAyah(currentAyah);
    }
  };

  const playNext = () => {
    const idx = ayahs.findIndex(a => a.numberInSurah === currentAyah);
    if (idx < ayahs.length - 1) {
      const next = ayahs[idx + 1].numberInSurah;
      onAyahChange(next);
      if (isPlaying) playAyah(next);
    }
  };

  const playPrev = () => {
    const idx = ayahs.findIndex(a => a.numberInSurah === currentAyah);
    if (idx > 0) {
      const prev = ayahs[idx - 1].numberInSurah;
      onAyahChange(prev);
      if (isPlaying) playAyah(prev);
    }
  };

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = speed;
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [speed, volume, isMuted]);

  return (
    <div className="border border-border rounded-xl bg-card p-3 space-y-3">
      {/* Reciter Selector */}
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
                  onClick={() => { setReciter(r.id); setShowReciters(false); }}
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

      {/* Controls */}
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
          {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
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

      {/* Speed + Volume */}
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
    </div>
  );
}
