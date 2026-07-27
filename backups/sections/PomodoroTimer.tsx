import { useState, useEffect, useRef, useCallback } from 'react';
import { useApp } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Play,
  Pause,
  RotateCcw,
  Settings2,
  Volume2,
  VolumeX,
  Coffee,
  Brain,
  Bed,
  CheckCircle2,
  Pin,
  PinOff,
} from 'lucide-react';
import { toast } from 'sonner';
import type { PomodoroSession, TimerState } from '@/types';

// Sound effects using Web Audio API
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
  createBeep(523.25, 0.3, 'sine'); // C5
  setTimeout(() => createBeep(659.25, 0.3, 'sine'), 150); // E5
};

const playCompleteSound = () => {
  createBeep(523.25, 0.2, 'sine');
  setTimeout(() => createBeep(659.25, 0.2, 'sine'), 150);
  setTimeout(() => createBeep(783.99, 0.4, 'sine'), 300);
};

export function PomodoroTimer() {
  const { state, dispatch } = useApp();
  const { pomodoroSettings, pomodoroHistory, pinnedItems } = state;
  
  const [timeLeft, setTimeLeft] = useState(pomodoroSettings.focusTime * 60);
  const [timerState, setTimerState] = useState<TimerState>('idle');
  const [currentCycle, setCurrentCycle] = useState(1);
  const [sessionType, setSessionType] = useState<'focus' | 'shortBreak' | 'longBreak'>('focus');
  const [showSettings, setShowSettings] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(pomodoroSettings.soundEnabled);
  
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const sessionStartTime = useRef<Date | null>(null);

  const totalTime = 
    sessionType === 'focus' ? pomodoroSettings.focusTime * 60 :
    sessionType === 'shortBreak' ? pomodoroSettings.shortBreak * 60 :
    pomodoroSettings.longBreak * 60;

  const progress = ((totalTime - timeLeft) / totalTime) * 100;

  // Sync timer display to global state for mini player
  useEffect(() => {
    if (timerState === 'running' || timerState === 'paused' || timerState === 'break') {
      dispatch({ type: 'SET_TIMER_DISPLAY', payload: {
        isRunning: timerState === 'running',
        timeLeft,
        totalTime,
        sessionType,
      }});
    } else {
      dispatch({ type: 'SET_TIMER_DISPLAY', payload: null });
    }
  }, [timerState, timeLeft, totalTime, sessionType, dispatch]);

  // Format time as MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Start timer
  const startTimer = useCallback(() => {
    if (timerState === 'idle' || timerState === 'paused') {
      setTimerState('running');
      sessionStartTime.current = new Date();
      if (soundEnabled) playStartSound();
      
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            // Timer completed
            handleTimerComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
  }, [timerState, soundEnabled]);

  // Pause timer
  const pauseTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setTimerState('paused');
  }, []);

  // Reset timer
  const resetTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setTimerState('idle');
    setSessionType('focus');
    setCurrentCycle(1);
    setTimeLeft(pomodoroSettings.focusTime * 60);
    sessionStartTime.current = null;
    dispatch({ type: 'SET_TIMER_DISPLAY', payload: null });
  }, [pomodoroSettings.focusTime, dispatch]);

  // Handle timer completion
  const handleTimerComplete = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    
    if (soundEnabled) playCompleteSound();
    
    // Save session
    if (sessionStartTime.current) {
      const session: PomodoroSession = {
        id: Date.now().toString(),
        startTime: sessionStartTime.current,
        endTime: new Date(),
        duration: totalTime / 60,
        type: sessionType,
        completed: true,
      };
      dispatch({ type: 'ADD_POMODORO_SESSION', payload: session });
    }

    // Determine next session
    if (sessionType === 'focus') {
      if (currentCycle >= pomodoroSettings.cyclesBeforeLongBreak) {
        setSessionType('longBreak');
        setTimeLeft(pomodoroSettings.longBreak * 60);
        toast.success('Focus session complete! Take a long break.');
      } else {
        setSessionType('shortBreak');
        setTimeLeft(pomodoroSettings.shortBreak * 60);
        toast.success('Focus session complete! Take a short break.');
      }
      setTimerState('break');
    } else {
      // Break is over, start new focus session
      setSessionType('focus');
      setTimeLeft(pomodoroSettings.focusTime * 60);
      setCurrentCycle(prev => prev + 1);
      setTimerState('idle');
      toast.info('Break over! Ready to focus?');
    }
  }, [sessionType, currentCycle, pomodoroSettings, totalTime, soundEnabled, dispatch]);

  // Skip break
  const skipBreak = () => {
    setSessionType('focus');
    setTimeLeft(pomodoroSettings.focusTime * 60);
    setTimerState('idle');
  };

  // Update settings
  const updateSettings = (newSettings: Partial<typeof pomodoroSettings>) => {
    const updated = { ...pomodoroSettings, ...newSettings };
    dispatch({ type: 'SET_POMODORO_SETTINGS', payload: updated });
    if (timerState === 'idle') {
      setTimeLeft(updated.focusTime * 60);
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  // Get session icon and color
  const getSessionInfo = () => {
    switch (sessionType) {
      case 'focus':
        return { icon: Brain, color: 'text-primary', bgColor: 'bg-primary/10', label: 'Focus Time' };
      case 'shortBreak':
        return { icon: Coffee, color: 'text-yellow-500', bgColor: 'bg-yellow-500/10', label: 'Short Break' };
      case 'longBreak':
        return { icon: Bed, color: 'text-blue-500', bgColor: 'bg-blue-500/10', label: 'Long Break' };
    }
  };

  const sessionInfo = getSessionInfo();
  const SessionIcon = sessionInfo.icon;

  // Calculate circle progress
  const radius = 120;
  const strokeWidth = 8;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  // Today's stats
  const today = new Date().toDateString();
  const todaySessions = pomodoroHistory.filter(
    s => new Date(s.startTime).toDateString() === today && s.type === 'focus'
  );
  const todayFocusMinutes = todaySessions.reduce((acc, s) => acc + s.duration, 0);

  return (
    <div className="space-y-6">
      {/* Stats Bar */}
      <div className="flex flex-wrap items-center justify-center gap-4">
        <Badge variant="secondary" className="gap-2 px-3 py-1">
          <CheckCircle2 className="w-4 h-4" />
          <span>Today: {todaySessions.length} sessions</span>
        </Badge>
        <Badge variant="secondary" className="gap-2 px-3 py-1">
          <TimerIcon className="w-4 h-4" />
          <span>{todayFocusMinutes} min focused</span>
        </Badge>
        <Badge variant="secondary" className="gap-2 px-3 py-1">
          <span>Cycle {currentCycle}/{pomodoroSettings.cyclesBeforeLongBreak}</span>
        </Badge>
      </div>

      {/* Main Timer Card */}
      <Card className="max-w-md mx-auto">
        <CardHeader className="text-center pb-2">
          <div className="flex items-center justify-center gap-2">
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${sessionInfo.bgColor} ${sessionInfo.color}`}>
              <SessionIcon className="w-5 h-5" />
              <span className="font-medium">{sessionInfo.label}</span>
            </div>
            <Button
              variant={pinnedItems.timer ? 'default' : 'outline'}
              size="sm"
              onClick={() => dispatch({ type: 'TOGGLE_PIN', payload: 'timer' })}
              className="gap-2"
            >
              {pinnedItems.timer ? <PinOff className="w-4 h-4" /> : <Pin className="w-4 h-4" />}
              {pinnedItems.timer ? 'Unpin' : 'Pin Timer'}
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Circular Progress */}
          <div className="relative flex items-center justify-center">
            <svg className="timer-ring w-72 h-72">
              {/* Background circle */}
              <circle
                cx="144"
                cy="144"
                r={radius}
                fill="none"
                stroke="hsl(var(--muted))"
                strokeWidth={strokeWidth}
              />
              {/* Progress circle */}
              <circle
                cx="144"
                cy="144"
                r={radius}
                fill="none"
                stroke="hsl(var(--primary))"
                strokeWidth={strokeWidth}
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                className="transition-all duration-1000 ease-linear"
              />
            </svg>
            
            {/* Time Display */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-6xl font-mono font-bold tracking-tight">
                {formatTime(timeLeft)}
              </span>
              <span className="text-sm text-muted-foreground mt-2">
                {timerState === 'running' ? 'Running' : timerState === 'paused' ? 'Paused' : 'Ready'}
              </span>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-3">
            {timerState === 'running' ? (
              <Button
                size="lg"
                variant="outline"
                onClick={pauseTimer}
                className="gap-2"
              >
                <Pause className="w-5 h-5" />
                Pause
              </Button>
            ) : (
              <Button
                size="lg"
                onClick={startTimer}
                className="gap-2"
                disabled={timerState === 'break' && sessionType !== 'focus'}
              >
                <Play className="w-5 h-5" />
                {timerState === 'idle' ? 'Start' : 'Resume'}
              </Button>
            )}
            
            <Button
              size="lg"
              variant="outline"
              onClick={resetTimer}
              className="gap-2"
            >
              <RotateCcw className="w-5 h-5" />
              Reset
            </Button>

            {timerState === 'break' && (
              <Button
                size="lg"
                variant="secondary"
                onClick={skipBreak}
                className="gap-2"
              >
                Skip Break
              </Button>
            )}
          </div>

          {/* Sound Toggle & Settings */}
          <div className="flex items-center justify-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={soundEnabled ? 'text-primary' : 'text-muted-foreground'}
            >
              {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
            </Button>
            
            <Dialog open={showSettings} onOpenChange={setShowSettings}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Settings2 className="w-5 h-5" />
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Timer Settings</DialogTitle>
                  <DialogDescription>
                    Customize your Pomodoro timer intervals
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-6 py-4">
                  {/* Focus Time */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>Focus Time</Label>
                      <span className="text-sm font-medium">{pomodoroSettings.focusTime} min</span>
                    </div>
                    <Slider
                      value={[pomodoroSettings.focusTime]}
                      onValueChange={([v]) => updateSettings({ focusTime: v })}
                      min={1}
                      max={60}
                      step={1}
                    />
                  </div>

                  {/* Short Break */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>Short Break</Label>
                      <span className="text-sm font-medium">{pomodoroSettings.shortBreak} min</span>
                    </div>
                    <Slider
                      value={[pomodoroSettings.shortBreak]}
                      onValueChange={([v]) => updateSettings({ shortBreak: v })}
                      min={1}
                      max={30}
                      step={1}
                    />
                  </div>

                  {/* Long Break */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>Long Break</Label>
                      <span className="text-sm font-medium">{pomodoroSettings.longBreak} min</span>
                    </div>
                    <Slider
                      value={[pomodoroSettings.longBreak]}
                      onValueChange={([v]) => updateSettings({ longBreak: v })}
                      min={1}
                      max={60}
                      step={1}
                    />
                  </div>

                  {/* Cycles */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>Cycles Before Long Break</Label>
                      <span className="text-sm font-medium">{pomodoroSettings.cyclesBeforeLongBreak}</span>
                    </div>
                    <Slider
                      value={[pomodoroSettings.cyclesBeforeLongBreak]}
                      onValueChange={([v]) => updateSettings({ cyclesBeforeLongBreak: v })}
                      min={1}
                      max={10}
                      step={1}
                    />
                  </div>

                  {/* Auto-start toggles */}
                  <div className="flex items-center justify-between">
                    <Label htmlFor="auto-start-breaks">Auto-start Breaks</Label>
                    <Switch
                      id="auto-start-breaks"
                      checked={pomodoroSettings.autoStartBreaks}
                      onCheckedChange={(v) => updateSettings({ autoStartBreaks: v })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="auto-start-pomodoros">Auto-start Pomodoros</Label>
                    <Switch
                      id="auto-start-pomodoros"
                      checked={pomodoroSettings.autoStartPomodoros}
                      onCheckedChange={(v) => updateSettings({ autoStartPomodoros: v })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="sound-enabled">Sound Enabled</Label>
                    <Switch
                      id="sound-enabled"
                      checked={pomodoroSettings.soundEnabled}
                      onCheckedChange={(v) => {
                        updateSettings({ soundEnabled: v });
                        setSoundEnabled(v);
                      }}
                    />
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>

      {/* Session History */}
      {pomodoroHistory.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Recent Sessions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-48 overflow-auto">
              {pomodoroHistory.slice(-10).reverse().map((session) => (
                <div
                  key={session.id}
                  className="flex items-center justify-between p-2 rounded-lg bg-muted/50"
                >
                  <div className="flex items-center gap-2">
                    {session.type === 'focus' ? (
                      <Brain className="w-4 h-4 text-primary" />
                    ) : session.type === 'shortBreak' ? (
                      <Coffee className="w-4 h-4 text-yellow-500" />
                    ) : (
                      <Bed className="w-4 h-4 text-blue-500" />
                    )}
                    <span className="text-sm capitalize">{session.type}</span>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>{session.duration} min</span>
                    <span>{new Date(session.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// Timer icon for stats
function TimerIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="10" x2="14" y1="2" y2="2" />
      <line x1="12" x2="15" y1="14" y2="11" />
      <circle cx="12" cy="14" r="8" />
    </svg>
  );
}
