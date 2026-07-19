import { useApp } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Brain, Coffee, Bed, X, Youtube, Pin, PinOff, Settings, Film, Timer } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useState } from 'react';

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

export function MiniPlayer() {
  const { state, dispatch } = useApp();
  const { timerDisplay, activeVideo, videoSource, pinnedItems } = state;
  const [settingsOpen, setSettingsOpen] = useState(false);

  const hasTimer = !!timerDisplay;
  const hasActiveVideo = !!activeVideo;
  const hasLocalVideo = videoSource?.type === 'local';
  const hasYouTubeVideo = videoSource?.type === 'youtube';

  const isAnyPinned = pinnedItems.timer || pinnedItems.localVideo || pinnedItems.youtubeVideo;
  const isAnyActive = hasTimer || hasActiveVideo;

  if (!isAnyPinned && !isAnyActive) return null;

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

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 pointer-events-none">
      <div className="container mx-auto px-4 pb-4">
        <div className="flex items-end gap-3 justify-end">
          {/* Timer mini player - show if active or pinned */}
          {(hasTimer || pinnedItems.timer) && (
            <Card className={`pointer-events-auto shadow-xl overflow-hidden flex-shrink-0 ${hasTimer ? 'border-primary/20' : 'border-muted opacity-80'}`}>
              <div className="relative">
                {hasTimer && <div className="absolute inset-0 bg-primary/5" style={{ width: `${progress}%` }} />}
                <div className="relative flex items-center gap-3 px-4 py-2.5">
                  <div className={`flex items-center gap-2 ${timerConfig.color}`}>
                    <TimerIcon className="w-4 h-4" />
                    <span className="text-xs font-medium">{timerConfig.label}</span>
                  </div>
                  <span className="text-lg font-mono font-bold tracking-tight">
                    {hasTimer ? formatTime(timerDisplay!.timeLeft) : '--:--'}
                  </span>
                  {hasTimer && (
                    <span className={`text-xs ${timerDisplay!.isRunning ? 'text-green-500' : 'text-yellow-500'}`}>
                      {timerDisplay!.isRunning ? '●' : '◆'}
                    </span>
                  )}
                </div>
              </div>
            </Card>
          )}

          {/* Local video mini player - show if pinned */}
          {pinnedItems.localVideo && hasLocalVideo && (
            <Card className="pointer-events-auto shadow-xl overflow-hidden flex-shrink-0 w-72 border-muted">
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
                    onClick={() => dispatch({ type: 'TOGGLE_PIN', payload: 'localVideo' })}
                  >
                    <PinOff className="w-3 h-3" />
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

          {/* YouTube video mini player - show if active or pinned */}
          {(hasActiveVideo || (pinnedItems.youtubeVideo && hasYouTubeVideo)) && (
            <Card className="pointer-events-auto shadow-xl overflow-hidden flex-shrink-0 w-72">
              <div className="relative">
                <div className="aspect-video bg-black">
                  {(() => {
                    const videoUrl = activeVideo?.url || (pinnedItems.youtubeVideo && hasYouTubeVideo ? videoSource!.url : null);
                    const videoId = videoUrl ? extractYouTubeId(videoUrl) : null;
                    return videoId ? (
                      <iframe
                        src={`https://www.youtube.com/embed/${videoId}?autoplay=1&loop=1`}
                        className="w-full h-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        title="Focus Video"
                      />
                    ) : null;
                  })()}
                </div>
                <div className="absolute top-1 right-1 flex gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 bg-black/50 hover:bg-black/70 text-white"
                    onClick={() => {
                      dispatch({ type: 'SET_ACTIVE_VIDEO', payload: null });
                      if (pinnedItems.youtubeVideo) {
                        dispatch({ type: 'TOGGLE_PIN', payload: 'youtubeVideo' });
                      }
                    }}
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
                <div className="absolute bottom-1 left-1">
                  <Badge className="bg-black/50 text-white border-0 text-[10px] gap-1">
                    <Youtube className="w-3 h-3" />
                    {activeVideo?.title || 'YouTube Video'}
                  </Badge>
                </div>
              </div>
            </Card>
          )}

          {/* Pin settings button */}
          <Popover open={settingsOpen} onOpenChange={setSettingsOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="pointer-events-auto h-10 w-10 shadow-lg flex-shrink-0 border-primary/30 hover:bg-primary/10"
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
                  {/* Timer pin */}
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

                  {/* Local video pin */}
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

                  {/* YouTube video pin */}
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
      </div>
    </div>
  );
}
