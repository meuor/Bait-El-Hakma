import { useState, useEffect, useRef, useCallback } from 'react';
import { useApp } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Play, Pause, RotateCcw, Settings2, Volume2, VolumeX,
  Coffee, Brain, Bed, CheckCircle2, Pin, PinOff, Tv, Youtube,
  BookOpen, Code, Film, Briefcase, GraduationCap, Gamepad2,
  PenLine, Dumbbell, Heart, Lightbulb, Palette, MoreHorizontal,
  Type, ListChecks, Trash2,
} from 'lucide-react';
import React from 'react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import type { PomodoroSession, TimerState, ActivityMode, PomodoroTheme } from '@/types';

const themeColors: Record<PomodoroTheme, string> = {
  classic: '#8b5cf6',
  ocean: '#0ea5e9',
  forest: '#22c55e',
  sunset: '#f97316',
  lavender: '#a855f7',
  rose: '#e11d48',
  midnight: '#6366f1',
  amber: '#f59e0b',
  hourglass: '#d4a853',
};

const themeBgGradients: Record<PomodoroTheme, string> = {
  classic: 'linear-gradient(135deg, rgba(139,92,246,0.08), rgba(139,92,246,0.03))',
  ocean: 'linear-gradient(135deg, rgba(14,165,233,0.08), rgba(14,165,233,0.03))',
  forest: 'linear-gradient(135deg, rgba(34,197,94,0.08), rgba(34,197,94,0.03))',
  sunset: 'linear-gradient(135deg, rgba(249,115,22,0.08), rgba(249,115,22,0.03))',
  lavender: 'linear-gradient(135deg, rgba(168,85,247,0.08), rgba(168,85,247,0.03))',
  rose: 'linear-gradient(135deg, rgba(225,29,72,0.08), rgba(225,29,72,0.03))',
  midnight: 'linear-gradient(135deg, rgba(99,102,241,0.08), rgba(99,102,241,0.03))',
  amber: 'linear-gradient(135deg, rgba(245,158,11,0.08), rgba(245,158,11,0.03))',
  hourglass: 'linear-gradient(135deg, rgba(212,168,83,0.08), rgba(212,168,83,0.03))',
};

const activityOptions: { id: ActivityMode | ''; icon: React.ComponentType<any>; label: string; color: string }[] = [
  { id: '', icon: Brain, label: 'General', color: 'text-primary' },
  { id: 'reading', icon: BookOpen, label: 'Reading', color: 'text-blue-500' },
  { id: 'coding', icon: Code, label: 'Coding', color: 'text-emerald-500' },
  { id: 'watching', icon: Film, label: 'Watching', color: 'text-purple-500' },
  { id: 'working', icon: Briefcase, label: 'Working', color: 'text-orange-500' },
  { id: 'studying', icon: GraduationCap, label: 'Studying', color: 'text-yellow-500' },
  { id: 'gaming', icon: Gamepad2, label: 'Gaming', color: 'text-cyan-500' },
  { id: 'writing', icon: PenLine, label: 'Writing', color: 'text-pink-500' },
  { id: 'exercising', icon: Dumbbell, label: 'Exercising', color: 'text-red-500' },
  { id: 'meditating', icon: Heart, label: 'Meditating', color: 'text-rose-500' },
  { id: 'learning', icon: Lightbulb, label: 'Learning', color: 'text-amber-500' },
  { id: 'designing', icon: Palette, label: 'Designing', color: 'text-violet-500' },
  { id: 'other', icon: MoreHorizontal, label: 'Other', color: 'text-muted-foreground' },
];

const themeSwatches: { id: PomodoroTheme; color: string; label: string }[] = [
  { id: 'classic', color: '#8b5cf6', label: 'Classic' },
  { id: 'ocean', color: '#0ea5e9', label: 'Ocean' },
  { id: 'forest', color: '#22c55e', label: 'Forest' },
  { id: 'sunset', color: '#f97316', label: 'Sunset' },
  { id: 'lavender', color: '#a855f7', label: 'Lavender' },
  { id: 'rose', color: '#e11d48', label: 'Rose' },
  { id: 'midnight', color: '#6366f1', label: 'Midnight' },
  { id: 'amber', color: '#f59e0b', label: 'Amber' },
  { id: 'hourglass', color: '#d4a853', label: 'Hourglass' },
];

const createBeep = (frequency: number, duration: number, type: OscillatorType = 'sine') => {
  const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();
  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);
  oscillator.frequency.value = frequency;
  oscillator.type = type;
  gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
  oscillator.start(audioContext.currentTime);
  oscillator.stop(audioContext.currentTime + duration);
};

const playStartSound = () => {
  createBeep(523.25, 0.3, 'sine');
  setTimeout(() => createBeep(659.25, 0.3, 'sine'), 150);
};

const playCompleteSound = () => {
  createBeep(523.25, 0.2, 'sine');
  setTimeout(() => createBeep(659.25, 0.2, 'sine'), 150);
  setTimeout(() => createBeep(783.99, 0.4, 'sine'), 300);
};

export function PomodoroTimer() {
  const { state, dispatch } = useApp();
  const { pomodoroSettings, pomodoroHistory, pinnedItems, todos } = state;

  const [timeLeft, setTimeLeft] = useState(pomodoroSettings.focusTime * 60);
  const [timerState, setTimerState] = useState<TimerState>('idle');
  const [currentCycle, setCurrentCycle] = useState(1);
  const [sessionType, setSessionType] = useState<'focus' | 'shortBreak' | 'longBreak'>('focus');
  const [showSettings, setShowSettings] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(pomodoroSettings.soundEnabled);
  const [activityMode, setActivityMode] = useState<ActivityMode | ''>('');
  const [customName, setCustomName] = useState('');
  const [linkedTaskId, setLinkedTaskId] = useState('');

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const sessionStartTime = useRef<Date | null>(null);
  const sessionTypeRef = useRef(sessionType);
  const currentCycleRef = useRef(currentCycle);
  const soundEnabledRef = useRef(soundEnabled);

  useEffect(() => { sessionTypeRef.current = sessionType; }, [sessionType]);
  useEffect(() => { currentCycleRef.current = currentCycle; }, [currentCycle]);
  useEffect(() => { soundEnabledRef.current = soundEnabled; }, [soundEnabled]);

  const currentTheme = pomodoroSettings.theme || 'classic';
  const themeStroke = themeColors[currentTheme];
  const themeBg = themeBgGradients[currentTheme];

  const totalTime =
    sessionType === 'focus' ? pomodoroSettings.focusTime * 60 :
    sessionType === 'shortBreak' ? pomodoroSettings.shortBreak * 60 :
    pomodoroSettings.longBreak * 60;

  const progress = ((totalTime - timeLeft) / totalTime) * 100;
  const radius = 120;
  const strokeWidth = 8;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  useEffect(() => {
    if (timerState === 'running' || timerState === 'paused' || timerState === 'break') {
      dispatch({ type: 'SET_TIMER_DISPLAY', payload: { isRunning: timerState === 'running', timeLeft, totalTime, sessionType } });
    } else {
      dispatch({ type: 'SET_TIMER_DISPLAY', payload: null });
    }
  }, [timerState, timeLeft, totalTime, sessionType, dispatch]);

  const videoUrlRef = useRef<string | null>(null);
  useEffect(() => {
    if (!pomodoroSettings.videoSyncEnabled) return;
    if (timerState === 'running' && sessionType === 'focus') {
      if (state.videoSource) {
        videoUrlRef.current = state.videoSource.url;
        dispatch({ type: 'SET_ACTIVE_VIDEO', payload: { url: state.videoSource.url, title: state.videoSource.title || 'Focus Video' } });
      }
    } else if (timerState === 'paused' && sessionType === 'focus') {
      // Keep video visible but stopped — show placeholder in MiniPlayer
      // ActiveVideo is kept, MiniPlayer will show paused state
    } else if (timerState === 'idle' || timerState === 'focusEnded' || sessionType !== 'focus') {
      dispatch({ type: 'SET_ACTIVE_VIDEO', payload: null });
      videoUrlRef.current = null;
    }
  }, [timerState, sessionType, pomodoroSettings.videoSyncEnabled, state.videoSource, dispatch]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const saveSession = useCallback(() => {
    if (!sessionStartTime.current) return;
    const session: PomodoroSession = {
      id: Date.now().toString(),
      startTime: sessionStartTime.current,
      endTime: new Date(),
      duration: totalTime / 60,
      type: sessionTypeRef.current,
      completed: true,
    };
    if (activityMode) session.activityMode = activityMode;
    if (customName.trim()) session.customName = customName.trim();
    if (linkedTaskId) session.linkedTaskId = linkedTaskId;
    dispatch({ type: 'ADD_POMODORO_SESSION', payload: session });
    sessionStartTime.current = null;
  }, [totalTime, activityMode, customName, linkedTaskId, dispatch]);

  const startBreakTransition = useCallback(() => {
    if (currentCycleRef.current >= pomodoroSettings.cyclesBeforeLongBreak) {
      setSessionType('longBreak');
      setTimeLeft(pomodoroSettings.longBreak * 60);
    } else {
      setSessionType('shortBreak');
      setTimeLeft(pomodoroSettings.shortBreak * 60);
    }
    if (pomodoroSettings.autoStartBreaks) {
      setTimerState('running');
    } else {
      setTimerState('break');
    }
  }, [pomodoroSettings]);

  const handleTimerCompleteRef = useRef<() => void>(() => {});
  handleTimerCompleteRef.current = useCallback(() => {
    if (soundEnabledRef.current) playCompleteSound();
    saveSession();
    if (sessionTypeRef.current === 'focus') {
      toast.success('Focus session complete!');
      if (pomodoroSettings.autoStartBreaks) {
        startBreakTransition();
      } else {
        setTimerState('focusEnded');
      }
    } else {
      setSessionType('focus');
      setTimeLeft(pomodoroSettings.focusTime * 60);
      setCurrentCycle(prev => prev + 1);
      setActivityMode('');
      setCustomName('');
      setLinkedTaskId('');
      if (pomodoroSettings.autoStartPomodoros) {
        setTimerState('running');
      } else {
        setTimerState('idle');
      }
      toast.info('Break over! Ready to focus?');
    }
  }, [saveSession, pomodoroSettings, startBreakTransition]);

  useEffect(() => {
    if (timerState === 'running' && timeLeft <= 0) {
      handleTimerCompleteRef.current?.();
    }
  }, [timeLeft, timerState]);

  useEffect(() => {
    if (timerState === 'running') {
      const id = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
      timerRef.current = id;
      return () => clearInterval(id);
    }
  }, [timerState]);

  const startTimer = useCallback(() => {
    if (timerState === 'idle' || timerState === 'paused') {
      setTimerState('running');
      if (!sessionStartTime.current) sessionStartTime.current = new Date();
      if (soundEnabledRef.current) playStartSound();
    }
  }, [timerState]);

  const pauseTimer = useCallback(() => setTimerState('paused'), []);

  const resetTimer = useCallback(() => {
    setTimerState('idle');
    setSessionType('focus');
    setCurrentCycle(1);
    setTimeLeft(pomodoroSettings.focusTime * 60);
    sessionStartTime.current = null;
    setActivityMode('');
    setCustomName('');
    setLinkedTaskId('');
    dispatch({ type: 'SET_TIMER_DISPLAY', payload: null });
    dispatch({ type: 'SET_ACTIVE_VIDEO', payload: null });
  }, [pomodoroSettings.focusTime, dispatch]);

  const startBreak = () => startBreakTransition();

  const skipBreak = () => {
    setSessionType('focus');
    setTimeLeft(pomodoroSettings.focusTime * 60);
    setCurrentCycle(prev => prev + 1);
    setTimerState('idle');
    setActivityMode('');
    setCustomName('');
    setLinkedTaskId('');
  };

  const endBreak = () => {
    setSessionType('focus');
    setTimeLeft(pomodoroSettings.focusTime * 60);
    setCurrentCycle(prev => prev + 1);
    setTimerState('idle');
    setActivityMode('');
    setCustomName('');
    setLinkedTaskId('');
    toast.info('Break ended early. Ready to focus!');
  };

  const updateSettings = (newSettings: Partial<typeof pomodoroSettings>) => {
    const updated = { ...pomodoroSettings, ...newSettings };
    dispatch({ type: 'SET_POMODORO_SETTINGS', payload: updated });
    if (timerState === 'idle') setTimeLeft(updated.focusTime * 60);
  };

  useEffect(() => {
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  const today = new Date().toDateString();
  const todaySessions = pomodoroHistory.filter(s => new Date(s.startTime).toDateString() === today && s.type === 'focus');
  const todayFocusMinutes = todaySessions.reduce((acc, s) => acc + s.duration, 0);
  const incompleteTodos = todos.filter(t => !t.completed);
  const currentActivity = activityOptions.find(a => a.id === activityMode);

  const sessionIcon = sessionType === 'focus' ? Brain : sessionType === 'shortBreak' ? Coffee : Bed;
  const sessionLabel = timerState === 'focusEnded' ? 'Focus Complete!' : sessionType === 'focus' ? (customName || 'Focus Time') : sessionType === 'shortBreak' ? 'Short Break' : 'Long Break';

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }} className="tab-section space-y-6">
      <div className="flex flex-wrap items-center justify-center gap-4">
        <Badge variant="secondary" className="tab-badge gap-2 px-3 py-1">
          <CheckCircle2 className="w-4 h-4" />
          <span>Today: {todaySessions.length} sessions</span>
        </Badge>
        <Badge variant="secondary" className="gap-2 px-3 py-1">
          <span>{todayFocusMinutes} min focused</span>
        </Badge>
        <Badge variant="secondary" className="gap-2 px-3 py-1">
          <span>Cycle {currentCycle}/{pomodoroSettings.cyclesBeforeLongBreak}</span>
        </Badge>
      </div>

      <div className="lg:flex lg:gap-6 lg:items-start justify-center">
        {timerState === 'idle' && sessionType === 'focus' && (
          <Card className="w-full lg:max-w-sm" style={{ background: themeBg }}>
            <CardHeader className="text-center pb-2">
              <CardTitle className="text-lg">Ready to Focus</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-xs text-muted-foreground mb-2 block">What are you working on?</Label>
                <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                  {activityOptions.map((opt) => {
                    const Icon = opt.icon;
                    const isSelected = activityMode === opt.id;
                    return (
                      <button key={opt.id} onClick={() => setActivityMode(opt.id as ActivityMode | '')}
                        className={`flex flex-col items-center gap-1 p-2 rounded-lg border transition-all ${isSelected ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/50 hover:bg-accent/50'}`}>
                        <Icon className={`w-5 h-5 ${isSelected ? 'text-primary' : opt.color}`} />
                        <span className="text-[10px] leading-tight">{opt.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
              <div>
                <Label htmlFor="session-name" className="text-xs text-muted-foreground mb-1.5 block">Session Name</Label>
                <div className="relative">
                  <Type className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input id="session-name" placeholder="What are you working on?" value={customName} onChange={(e) => setCustomName(e.target.value)} className="pl-9" />
                </div>
              </div>
              {incompleteTodos.length > 0 && (
                <div>
                  <Label htmlFor="link-task" className="text-xs text-muted-foreground mb-1.5 block">Link to Task</Label>
                  <div className="relative">
                    <ListChecks className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none z-10" />
                    <select id="link-task" value={linkedTaskId} onChange={(e) => setLinkedTaskId(e.target.value)}
                      className="flex h-10 w-full rounded-md border border-input bg-background pl-9 pr-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
                      <option value="">No task</option>
                      {incompleteTodos.map(t => <option key={t.id} value={t.id}>{t.content}</option>)}
                    </select>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

      <Card className={`w-full max-w-md mx-auto ${timerState === 'focusEnded' ? 'border-primary/50 ring-1 ring-primary/20' : ''} ${timerState === 'idle' && sessionType === 'focus' ? 'lg:mx-0' : 'lg:mx-auto'}`} style={{ background: themeBg }}>
        <CardHeader className="text-center pb-2">
          <div className="flex items-center justify-center gap-2 flex-wrap">
            {timerState === 'running' && currentActivity && currentActivity.id ? (
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10">
                <currentActivity.icon className={`w-5 h-5 ${currentActivity.color}`} />
                <span className="font-medium">{sessionLabel}</span>
              </div>
            ) : (
              <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${sessionType === 'focus' ? 'bg-primary/10' : sessionType === 'shortBreak' ? 'bg-yellow-500/10' : 'bg-blue-500/10'}`}>
                {React.createElement(sessionIcon, { className: `w-5 h-5 ${sessionType === 'focus' ? 'text-primary' : sessionType === 'shortBreak' ? 'text-yellow-500' : 'text-blue-500'}` })}
                <span className={`font-medium ${sessionType === 'focus' ? 'text-primary' : sessionType === 'shortBreak' ? 'text-yellow-500' : 'text-blue-500'}`}>{sessionLabel}</span>
              </div>
            )}
            <Button variant={pinnedItems.timer ? 'default' : 'outline'} size="sm" onClick={() => dispatch({ type: 'TOGGLE_PIN', payload: 'timer' })} className="gap-2">
              {pinnedItems.timer ? <PinOff className="w-4 h-4" /> : <Pin className="w-4 h-4" />}
              {pinnedItems.timer ? 'Unpin' : 'Pin'}
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="relative flex items-center justify-center">
            {currentTheme === 'hourglass' ? (
              <HourglassSVG progress={progress} running={timerState === 'running'} color={themeStroke} size="large" />
            ) : (
              <svg className="timer-ring w-56 h-56 sm:w-72 sm:h-72" viewBox="0 0 288 288">
                <circle cx="144" cy="144" r={radius} fill="none" stroke="hsl(var(--muted))" strokeWidth={strokeWidth} />
                <circle cx="144" cy="144" r={radius} fill="none" stroke={themeStroke} strokeWidth={strokeWidth} strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={strokeDashoffset} className="transition-all duration-1000 ease-linear" />
              </svg>
            )}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-5xl sm:text-6xl font-mono font-bold tracking-tight">{formatTime(timeLeft)}</span>
              <span className="text-xs sm:text-sm text-muted-foreground mt-1 sm:mt-2">
                {timerState === 'running' ? sessionType === 'focus' ? 'Focusing' : 'On Break' : timerState === 'paused' ? 'Paused' : timerState === 'break' ? 'Paused' : timerState === 'focusEnded' ? sessionType === 'focus' ? 'Complete!' : 'Break Over' : 'Ready'}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
            {timerState === 'running' ? (
              <Button size="lg" variant="outline" onClick={pauseTimer} className="gap-2"><Pause className="w-5 h-5" /> Pause</Button>
            ) : timerState === 'focusEnded' ? (
              <>
                <Button size="lg" onClick={startBreak} className="gap-2"><Coffee className="w-5 h-5" /> Start Break</Button>
                <Button size="lg" variant="outline" onClick={skipBreak} className="gap-2"><CheckCircle2 className="w-5 h-5" /> Skip</Button>
              </>
            ) : timerState === 'break' ? (
              <>
                <Button size="lg" onClick={() => setTimerState('running')} className="gap-2"><Play className="w-5 h-5" /> Resume Break</Button>
                <Button size="lg" variant="outline" onClick={endBreak} className="gap-2"><CheckCircle2 className="w-5 h-5" /> End Break</Button>
                <Button size="lg" variant="secondary" onClick={skipBreak} className="gap-2"><RotateCcw className="w-5 h-5" /> Skip</Button>
              </>
            ) : timerState === 'paused' ? (
              <Button size="lg" onClick={startTimer} className="gap-2"><Play className="w-5 h-5" /> Resume</Button>
            ) : (
              <Button size="lg" onClick={startTimer} className="gap-2"><Play className="w-5 h-5" /> Start</Button>
            )}
            <Button size="lg" variant="outline" onClick={resetTimer} className="gap-2"><RotateCcw className="w-5 h-5" /> Reset</Button>
          </div>

          {pomodoroSettings.videoSyncEnabled && state.videoSource && sessionType === 'focus' && (timerState === 'running' || timerState === 'paused') && (
            <div className="flex items-center justify-center gap-2 text-xs text-primary">
              <Youtube className="w-3.5 h-3.5" />
              <span>Focus video {timerState === 'paused' ? 'paused' : 'synced'}</span>
            </div>
          )}

          <div className="flex items-center justify-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => setSoundEnabled(!soundEnabled)} className={soundEnabled ? 'text-primary' : 'text-muted-foreground'}>
              {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
            </Button>
            <Dialog open={showSettings} onOpenChange={setShowSettings}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="icon"><Settings2 className="w-5 h-5" /></Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Timer Settings</DialogTitle>
                  <DialogDescription>Customize your Pomodoro timer intervals and appearance</DialogDescription>
                </DialogHeader>
                <div className="space-y-6 py-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>Focus Time</Label>
                      <span className="text-sm font-medium">{pomodoroSettings.focusTime} min</span>
                    </div>
                    <Slider value={[pomodoroSettings.focusTime]} onValueChange={([v]) => updateSettings({ focusTime: v })} min={1} max={60} step={1} />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>Short Break</Label>
                      <span className="text-sm font-medium">{pomodoroSettings.shortBreak} min</span>
                    </div>
                    <Slider value={[pomodoroSettings.shortBreak]} onValueChange={([v]) => updateSettings({ shortBreak: v })} min={1} max={30} step={1} />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>Long Break</Label>
                      <span className="text-sm font-medium">{pomodoroSettings.longBreak} min</span>
                    </div>
                    <Slider value={[pomodoroSettings.longBreak]} onValueChange={([v]) => updateSettings({ longBreak: v })} min={1} max={60} step={1} />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>Cycles Before Long Break</Label>
                      <span className="text-sm font-medium">{pomodoroSettings.cyclesBeforeLongBreak}</span>
                    </div>
                    <Slider value={[pomodoroSettings.cyclesBeforeLongBreak]} onValueChange={([v]) => updateSettings({ cyclesBeforeLongBreak: v })} min={1} max={10} step={1} />
                  </div>
                  <div className="border-t pt-4">
                    <Label className="text-sm font-medium mb-3 block">Timer Theme</Label>
                    <div className="grid grid-cols-4 gap-3">
                      {themeSwatches.map((t) => (
                        <button key={t.id} onClick={() => updateSettings({ theme: t.id })}
                          className={`flex flex-col items-center gap-1.5 p-2 rounded-lg border-2 transition-all ${currentTheme === t.id ? 'border-primary' : 'border-transparent hover:border-border'}`}>
                          <div className="w-8 h-8 rounded-full" style={{ backgroundColor: t.color }} />
                          <span className="text-[10px] text-muted-foreground">{t.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="border-t pt-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="auto-start-breaks">Auto-start Breaks</Label>
                      <Switch id="auto-start-breaks" checked={pomodoroSettings.autoStartBreaks} onCheckedChange={(v) => updateSettings({ autoStartBreaks: v })} />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="auto-start-pomodoros">Auto-start Pomodoros</Label>
                      <Switch id="auto-start-pomodoros" checked={pomodoroSettings.autoStartPomodoros} onCheckedChange={(v) => updateSettings({ autoStartPomodoros: v })} />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="sound-enabled">Sound Enabled</Label>
                      <Switch id="sound-enabled" checked={pomodoroSettings.soundEnabled} onCheckedChange={(v) => { updateSettings({ soundEnabled: v }); setSoundEnabled(v); }} />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Tv className="w-4 h-4 text-muted-foreground" />
                        <Label htmlFor="video-sync" className="font-medium">Sync with Focus Video</Label>
                      </div>
                      <Switch id="video-sync" checked={pomodoroSettings.videoSyncEnabled} onCheckedChange={(v) => updateSettings({ videoSyncEnabled: v })} />
                    </div>
                    <p className="text-xs text-muted-foreground ml-6">Auto-play focus video during sessions, pause during breaks</p>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>
      </div>

      {pomodoroHistory.length > 0 && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Recent Sessions</CardTitle>
            <Button variant="ghost" size="sm" className="text-destructive text-xs gap-1" onClick={() => dispatch({ type: 'CLEAR_POMODORO_SESSIONS' })}>
              <Trash2 className="w-3.5 h-3.5" /> Clear All
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-48 overflow-auto">
              {pomodoroHistory.slice(-10).reverse().map((session) => {
                const actOpt = activityOptions.find(a => a.id === session.activityMode);
                const ActIcon = actOpt?.icon || Brain;
                return (
                  <div key={session.id} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                    <div className="flex items-center gap-2 min-w-0">
                      {session.activityMode ? (
                        <ActIcon className="w-4 h-4 shrink-0 text-primary" />
                      ) : session.type === 'focus' ? (
                        <Brain className="w-4 h-4 shrink-0 text-primary" />
                      ) : session.type === 'shortBreak' ? (
                        <Coffee className="w-4 h-4 shrink-0 text-yellow-500" />
                      ) : (
                        <Bed className="w-4 h-4 shrink-0 text-blue-500" />
                      )}
                      <span className="text-sm truncate">{session.customName || (session.activityMode ? (actOpt?.label || 'Focus') : session.type)}</span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground shrink-0">
                      <span>{session.duration} min</span>
                      <span>{new Date(session.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </motion.div>
  );
}

// Hourglass SVG component with animated sand
function HourglassSVG({ progress, running, color, size = 'large' }: { progress: number; running: boolean; color: string; size?: 'large' | 'small' }) {
  const dim = size === 'large' ? 256 : 128;
  const viewBox = '0 0 120 180';
  const sandTopY = 20 + (1 - progress / 100) * 48;
  const sandBottomY = 132 - (progress / 100) * 57;

  return (
    <svg className="timer-ring" width={dim} height={dim * 1.5} viewBox={viewBox}>
      <defs>
        <clipPath id="topBulb">
          <path d="M30,20 L90,20 Q65,45 62,68 L58,68 Q55,45 30,20 Z" />
        </clipPath>
        <clipPath id="bottomBulb">
          <path d="M30,132 L90,132 Q90,102 62,75 L58,75 Q30,102 30,132 Z" />
        </clipPath>
        <linearGradient id="sandGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#e8c56a" />
          <stop offset="100%" stopColor="#d4a853" />
        </linearGradient>
      </defs>

      {/* Glass frame */}
      <path d="M30,20 L90,20 Q65,45 62,68 L62,75 Q90,102 90,132 L30,132 Q30,102 58,75 L58,68 Q55,45 30,20 Z"
        fill="none" stroke={color} strokeWidth="2.5" strokeLinejoin="round" opacity="0.6" />

      {/* Frame top and bottom bars */}
      <line x1="28" y1="20" x2="92" y2="20" stroke={color} strokeWidth="3" strokeLinecap="round" />
      <line x1="28" y1="132" x2="92" y2="132" stroke={color} strokeWidth="3" strokeLinecap="round" />

      {/* Top sand — decreases as progress increases */}
      <rect x="28" y={sandTopY} width="64" height={68 - sandTopY} fill="url(#sandGrad)" clipPath="url(#topBulb)" />

      {/* Bottom sand — increases as progress increases */}
      <rect x="28" y={sandBottomY} width="64" height={132 - sandBottomY} fill="url(#sandGrad)" clipPath="url(#bottomBulb)" />

      {/* Falling sand particles through the neck */}
      {running && (
        <>
          <circle cx="60" cy={68 + (progress / 100) * 8} r="1.2" fill="#e8c56a" opacity="0.8">
            <animate attributeName="cy" values={`${68 + (progress / 100) * 8};${75 - (progress / 100) * 8}`}
              dur="0.8s" repeatCount="indefinite" />
          </circle>
          <circle cx="60" cy={68 + (progress / 100) * 8} r="0.8" fill="#d4a853" opacity="0.6">
            <animate attributeName="cy" values={`${68 + (progress / 100) * 8};${75 - (progress / 100) * 8}`}
              dur="0.6s" repeatCount="indefinite" begin="0.3s" />
          </circle>
          <circle cx="60" cy={68 + (progress / 100) * 8} r="1" fill="#f0d080" opacity="0.7">
            <animate attributeName="cy" values={`${68 + (progress / 100) * 8};${75 - (progress / 100) * 8}`}
              dur="0.7s" repeatCount="indefinite" begin="0.5s" />
          </circle>
        </>
      )}

      {/* Sand pile glow at bottom */}
      {running && (
        <ellipse cx="60" cy={sandBottomY} rx="15" ry="2" fill="#e8c56a" opacity="0.3">
          <animate attributeName="opacity" values="0.3;0.1;0.3" dur="1.5s" repeatCount="indefinite" />
        </ellipse>
      )}
    </svg>
  );
}
