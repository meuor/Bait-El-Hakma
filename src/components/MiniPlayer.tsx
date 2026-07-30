import { useApp } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Brain, Coffee, Bed, X, Youtube, Pin, PinOff, Settings, Film, Timer, Maximize2, Volume2, VolumeX, Headphones, Play, Pause } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useState, useRef, useEffect } from 'react';
import type { PinnedPositions } from '@/types';

function extractYouTubeId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\s?]+)/,
    /youtube\.com\/watch\?.*v=([^&\s]+)/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

function getDefaultPositions(): PinnedPositions {
  const w = typeof window !== 'undefined' ? window.innerWidth : 1200;
  const h = typeof window !== 'undefined' ? window.innerHeight : 800;
  return {
    timer: { x: w - 260, y: h - 100 },
    localVideo: { x: Math.max(16, w - 560), y: h - 360 },
    youtubeVideo: { x: Math.max(16, w - 280), y: h - 360 },
  };
}

export function MiniPlayer() {
  const { state, dispatch } = useApp();
  const { timerDisplay, activeVideo, videoSource, pinnedItems, pinnedPositions, isMinimized } = state;
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [dragging, setDragging] = useState<string | null>(null);
  const dragOffset = useRef({ x: 0, y: 0 });
  const [youtubeMuted, setYoutubeMuted] = useState(true);
  const [backgroundAudio, setBackgroundAudio] = useState(false);

  const hasTimer = !!timerDisplay;
  const hasActiveVideo = !!activeVideo;
  const hasLocalVideo = videoSource?.type === 'local';
  const hasYouTubeVideo = videoSource?.type === 'youtube';

  const handleMouseDown = (key: string, e: React.MouseEvent, currentPos: { x: number; y: number }) => {
    dragOffset.current = { x: e.clientX - currentPos.x, y: e.clientY - currentPos.y };
    setDragging(key);
  };

  useEffect(() => {
    if (!dragging) return;
    const handleMove = (e: MouseEvent) => {
      dispatch({
        type: 'SET_PIN_POSITION',
        payload: {
          key: dragging as keyof PinnedPositions,
          position: { x: e.clientX - dragOffset.current.x, y: e.clientY - dragOffset.current.y },
        },
      });
    };
    const handleUp = () => setDragging(null);
    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleUp);
    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleUp);
    };
  }, [dragging, dispatch]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const sessionConfig = {
    focus: { icon: Brain, color: 'text-primary', bg: 'bg-primary/10', label: 'Focus' },
    shortBreak: { icon: Coffee, color: 'text-yellow-500', bg: 'bg-yellow-500/10', label: 'Break' },
    longBreak: { icon: Bed, color: 'text-blue-500', bg: 'bg-blue-500/10', label: 'Break' },
  };

  const timerConfig = timerDisplay ? sessionConfig[timerDisplay.sessionType] : sessionConfig.focus;
  const TimerIcon = timerConfig.icon;
  const progress = timerDisplay ? ((timerDisplay.totalTime - timerDisplay.timeLeft) / timerDisplay.totalTime) * 100 : 0;

  const defaults = getDefaultPositions();
  const getPos = (key: keyof PinnedPositions) => {
    const p = pinnedPositions[key];
    if (p.x !== 0 || p.y !== 0) return p;
    return defaults[key];
  };

  const timerPos = getPos('timer');
  const localVideoPos = getPos('localVideo');
  const youtubePos = getPos('youtubeVideo');

  const showTimer = hasTimer || pinnedItems.timer;
  const showYouTube = hasActiveVideo || (pinnedItems.youtubeVideo && hasYouTubeVideo);
  const showLocalVideo = pinnedItems.localVideo && hasLocalVideo;

  const videoUrl = activeVideo?.url || (pinnedItems.youtubeVideo && hasYouTubeVideo ? videoSource!.url : null);
  const videoId = videoUrl ? extractYouTubeId(videoUrl) : null;
  const youtubeSrc = videoId
    ? `https://www.youtube.com/embed/${videoId}?autoplay=1&loop=1&playlist=${videoId}${youtubeMuted ? '&mute=1' : ''}`
    : null;

  const isPaused = hasTimer && !timerDisplay!.isRunning;

  const closeTimer = () => {
    if (pinnedItems.timer) dispatch({ type: 'TOGGLE_PIN', payload: 'timer' });
    if (hasTimer) dispatch({ type: 'SET_TIMER_DISPLAY', payload: null });
  };

  const closeYouTube = () => {
    if (pinnedItems.youtubeVideo) dispatch({ type: 'TOGGLE_PIN', payload: 'youtubeVideo' });
    if (hasActiveVideo) dispatch({ type: 'SET_ACTIVE_VIDEO', payload: null });
  };

  const closeLocalVideo = () => {
    if (pinnedItems.localVideo) dispatch({ type: 'TOGGLE_PIN', payload: 'localVideo' });
    if (hasActiveVideo) dispatch({ type: 'SET_ACTIVE_VIDEO', payload: null });
  };

  if (isMinimized && showTimer) {
    return (
      <Card
        className="fixed z-40 shadow-xl border-primary/20 cursor-grab active:cursor-grabbing backdrop-blur-xl bg-background/80 select-none"
        style={{ left: timerPos.x, top: timerPos.y, width: '220px' }}
        onMouseDown={(e) => handleMouseDown('timer', e, timerPos)}
      >
        <div className="p-3 space-y-2">
          <div className="flex items-center justify-between">
            <div className={`flex items-center gap-1.5 ${timerConfig.color}`}>
              <TimerIcon className="w-3.5 h-3.5" />
              <span className="text-[11px] font-medium">{timerConfig.label}</span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-5 w-5"
              onMouseDown={(e) => e.stopPropagation()}
              onClick={() => dispatch({ type: 'TOGGLE_MINIMIZE' })}
            >
              <Maximize2 className="w-3 h-3" />
            </Button>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xl font-mono font-bold tracking-tight">
              {hasTimer ? formatTime(timerDisplay!.timeLeft) : '--:--'}
            </span>
            {hasTimer && (
              <Button
                variant="outline"
                size="icon"
                className="h-7 w-7"
                onMouseDown={(e) => e.stopPropagation()}
                  onClick={(e) => {
                    e.stopPropagation();
                    dispatch({ type: 'TOGGLE_TIMER' });
                  }}
                >
                  {timerDisplay!.isRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                </Button>
              )}
            </div>
        </div>
      </Card>
    );
  }

  if (!showTimer && !showYouTube && !showLocalVideo) return null;

  return (
    <>
      {showTimer && (
        <Card
          className="fixed z-40 shadow-xl overflow-hidden cursor-grab active:cursor-grabbing select-none"
          style={{ left: timerPos.x, top: timerPos.y, width: '220px' }}
          onMouseDown={(e) => handleMouseDown('timer', e, timerPos)}
        >
          <div className="relative">
            {hasTimer && <div className="absolute inset-0 bg-primary/5" style={{ width: `${progress}%` }} />}
            <div className="relative p-3 space-y-2">
              <div className="flex items-center justify-between">
                <div className={`flex items-center gap-1.5 ${timerConfig.color}`}>
                  <TimerIcon className="w-3.5 h-3.5" />
                  <span className="text-[11px] font-medium">{timerConfig.label}</span>
                </div>
                <div className="flex items-center gap-0.5">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onMouseDown={(e) => e.stopPropagation()}
                    onClick={(e) => {
                      e.stopPropagation();
                      dispatch({ type: 'TOGGLE_PIN', payload: 'timer' });
                    }}
                    title={pinnedItems.timer ? 'Unpin' : 'Pin'}
                  >
                    {pinnedItems.timer ? <PinOff className="w-3 h-3" /> : <Pin className="w-3 h-3" />}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 hover:bg-destructive/10 hover:text-destructive"
                    onMouseDown={(e) => e.stopPropagation()}
                    onClick={(e) => {
                      e.stopPropagation();
                      closeTimer();
                    }}
                    title="Close"
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xl font-mono font-bold tracking-tight">
                  {hasTimer ? formatTime(timerDisplay!.timeLeft) : '--:--'}
                </span>
                <div className="flex items-center gap-1">
                  {hasTimer && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onMouseDown={(e) => e.stopPropagation()}
                      onClick={(e) => {
                        e.stopPropagation();
                        dispatch({ type: 'TOGGLE_TIMER' });
                      }}
                    >
                      {timerDisplay!.isRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </Card>
      )}

      {showYouTube && youtubeSrc && (
        <Card
          className="fixed z-40 shadow-xl overflow-hidden cursor-grab active:cursor-grabbing select-none"
          style={{ left: youtubePos.x, top: youtubePos.y, width: '240px' }}
          onMouseDown={(e) => handleMouseDown('youtubeVideo', e, youtubePos)}
        >
          <div className="relative">
            <div className="aspect-video bg-black relative">
              <iframe
                src={youtubeSrc}
                className={`w-full h-full ${backgroundAudio ? 'opacity-0' : ''}`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                title="YouTube Video"
              />
              {backgroundAudio && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                  <Headphones className="w-6 h-6 text-white/60" />
                </div>
              )}
              {isPaused && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/60 z-10">
                  <div className="flex flex-col items-center gap-1 text-white">
                    <Pause className="w-6 h-6" />
                    <span className="text-xs font-medium">Paused</span>
                  </div>
                </div>
              )}
            </div>
            <div className="absolute top-1 right-1 flex gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 bg-black/50 hover:bg-black/70 text-white"
                onMouseDown={(e) => e.stopPropagation()}
                onClick={(e) => {
                  e.stopPropagation();
                  setYoutubeMuted(!youtubeMuted);
                }}
                title={youtubeMuted ? 'Unmute' : 'Mute'}
              >
                {youtubeMuted ? <VolumeX className="w-3 h-3" /> : <Volume2 className="w-3 h-3" />}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className={`h-6 w-6 bg-black/50 hover:bg-black/70 text-white ${backgroundAudio ? 'bg-primary/60' : ''}`}
                onMouseDown={(e) => e.stopPropagation()}
                onClick={(e) => {
                  e.stopPropagation();
                  setBackgroundAudio(!backgroundAudio);
                }}
                title={backgroundAudio ? 'Show Video' : 'Background Audio'}
              >
                <Headphones className="w-3 h-3" />
              </Button>
            </div>
            <div className="absolute top-1 right-16 flex gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 bg-black/50 hover:bg-black/70 text-white"
                onMouseDown={(e) => e.stopPropagation()}
                onClick={(e) => {
                  e.stopPropagation();
                  dispatch({ type: 'TOGGLE_PIN', payload: 'youtubeVideo' });
                }}
                title={pinnedItems.youtubeVideo ? 'Unpin' : 'Pin'}
              >
                {pinnedItems.youtubeVideo ? <PinOff className="w-3 h-3" /> : <Pin className="w-3 h-3" />}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 bg-black/50 hover:bg-red-500/70 text-white"
                onMouseDown={(e) => e.stopPropagation()}
                onClick={(e) => {
                  e.stopPropagation();
                  closeYouTube();
                }}
                title="Close"
              >
                <X className="w-3 h-3" />
              </Button>
            </div>
            <div className="absolute bottom-1 left-1">
              <Badge className="bg-black/50 text-white border-0 text-[10px] gap-1">
                <Youtube className="w-3 h-3" />
                {activeVideo?.title || videoSource?.title || 'YouTube Video'}
              </Badge>
            </div>
          </div>
        </Card>
      )}

      {showLocalVideo && (
        <Card
          className="fixed z-40 shadow-xl overflow-hidden cursor-grab active:cursor-grabbing select-none"
          style={{ left: localVideoPos.x, top: localVideoPos.y, width: '240px' }}
          onMouseDown={(e) => handleMouseDown('localVideo', e, localVideoPos)}
        >
          <div className="relative">
            <div className="aspect-video bg-black">
              <video
                src={videoSource!.url}
                className="w-full h-full"
                controls
                autoPlay
                loop
                muted
              />
            </div>
            <div className="absolute top-1 right-1 flex gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 bg-black/50 hover:bg-black/70 text-white"
                onMouseDown={(e) => e.stopPropagation()}
                onClick={(e) => {
                  e.stopPropagation();
                  dispatch({ type: 'TOGGLE_PIN', payload: 'localVideo' });
                }}
                title={pinnedItems.localVideo ? 'Unpin' : 'Pin'}
              >
                {pinnedItems.localVideo ? <PinOff className="w-3 h-3" /> : <Pin className="w-3 h-3" />}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 bg-black/50 hover:bg-red-500/70 text-white"
                onMouseDown={(e) => e.stopPropagation()}
                onClick={(e) => {
                  e.stopPropagation();
                  closeLocalVideo();
                }}
                title="Close"
              >
                <X className="w-3 h-3" />
              </Button>
            </div>
            <div className="absolute bottom-1 left-1">
              <Badge className="bg-black/50 text-white border-0 text-[10px] gap-1">
                <Film className="w-3 h-3" />
                {videoSource!.title || 'Local Video'}
              </Badge>
            </div>
          </div>
        </Card>
      )}

      <div
        className="fixed z-40"
        style={{ right: '16px', bottom: '16px' }}
      >
        <Popover open={settingsOpen} onOpenChange={setSettingsOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="h-10 w-10 shadow-lg border-primary/30 hover:bg-primary/10"
            >
              <Settings className="w-4 h-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-64 p-3" side="top" align="end">
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Pin className="w-4 h-4 text-primary" />
                Pin to All Tabs
              </div>
              <p className="text-xs text-muted-foreground">
                Choose what stays visible across all tabs
              </p>

              <div className="space-y-1">
                <button
                  onClick={() => dispatch({ type: 'TOGGLE_PIN', payload: 'timer' })}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${
                    pinnedItems.timer
                      ? 'bg-primary/10 text-primary'
                      : 'hover:bg-muted text-muted-foreground'
                  }`}
                >
                  <Timer className="w-4 h-4" />
                  <span className="flex-1 text-left">Pomodoro Timer</span>
                  {pinnedItems.timer ? (
                    <Pin className="w-3.5 h-3.5 text-primary" />
                  ) : (
                    <PinOff className="w-3.5 h-3.5" />
                  )}
                </button>

                <button
                  onClick={() => dispatch({ type: 'TOGGLE_PIN', payload: 'localVideo' })}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${
                    pinnedItems.localVideo
                      ? 'bg-primary/10 text-primary'
                      : 'hover:bg-muted text-muted-foreground'
                  }`}
                >
                  <Film className="w-4 h-4" />
                  <span className="flex-1 text-left">Local Video</span>
                  {pinnedItems.localVideo ? (
                    <Pin className="w-3.5 h-3.5 text-primary" />
                  ) : (
                    <PinOff className="w-3.5 h-3.5" />
                  )}
                </button>

                <button
                  onClick={() => dispatch({ type: 'TOGGLE_PIN', payload: 'youtubeVideo' })}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${
                    pinnedItems.youtubeVideo
                      ? 'bg-primary/10 text-primary'
                      : 'hover:bg-muted text-muted-foreground'
                  }`}
                >
                  <Youtube className="w-4 h-4" />
                  <span className="flex-1 text-left">YouTube Video</span>
                  {pinnedItems.youtubeVideo ? (
                    <Pin className="w-3.5 h-3.5 text-primary" />
                  ) : (
                    <PinOff className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>

              {(pinnedItems.timer || pinnedItems.localVideo || pinnedItems.youtubeVideo) && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full text-xs text-muted-foreground"
                  onClick={() => {
                    if (pinnedItems.timer) dispatch({ type: 'TOGGLE_PIN', payload: 'timer' });
                    if (pinnedItems.localVideo) dispatch({ type: 'TOGGLE_PIN', payload: 'localVideo' });
                    if (pinnedItems.youtubeVideo) dispatch({ type: 'TOGGLE_PIN', payload: 'youtubeVideo' });
                  }}
                >
                  Unpin All
                </Button>
              )}
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </>
  );
}
