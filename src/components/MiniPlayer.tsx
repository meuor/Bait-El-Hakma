import { useApp } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Brain, Coffee, Bed, X, Youtube } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

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
  const { timerDisplay, activeVideo } = state;

  if (!timerDisplay && !activeVideo) return null;

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

  const hasTimer = !!timerDisplay;
  const hasVideo = !!activeVideo;
  const timerConfig = timerDisplay ? sessionConfig[timerDisplay.sessionType] : sessionConfig.focus;
  const TimerIcon = timerConfig.icon;
  const progress = timerDisplay ? ((timerDisplay.totalTime - timerDisplay.timeLeft) / timerDisplay.totalTime) * 100 : 0;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 pointer-events-none">
      <div className="container mx-auto px-4 pb-4">
        <div className="flex items-end gap-3 justify-end">
          {/* Timer mini player */}
          {hasTimer && (
            <Card className="pointer-events-auto shadow-xl border-primary/20 overflow-hidden flex-shrink-0">
              <div className="relative">
                <div className="absolute inset-0 bg-primary/5" style={{ width: `${progress}%` }} />
                <div className="relative flex items-center gap-3 px-4 py-2.5">
                  <div className={`flex items-center gap-2 ${timerConfig.color}`}>
                    <TimerIcon className="w-4 h-4" />
                    <span className="text-xs font-medium">{timerConfig.label}</span>
                  </div>
                  <span className="text-lg font-mono font-bold tracking-tight">
                    {formatTime(timerDisplay!.timeLeft)}
                  </span>
                  <span className={`text-xs ${timerDisplay!.isRunning ? 'text-green-500' : 'text-yellow-500'}`}>
                    {timerDisplay!.isRunning ? '●' : '◆'}
                  </span>
                </div>
              </div>
            </Card>
          )}

          {/* Video mini player */}
          {hasVideo && (
            <Card className="pointer-events-auto shadow-xl overflow-hidden flex-shrink-0 w-72">
              <div className="relative">
                <div className="aspect-video bg-black">
                  <iframe
                    src={`https://www.youtube.com/embed/${extractYouTubeId(activeVideo!.url)}?autoplay=1&loop=1`}
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    title="Focus Video"
                  />
                </div>
                <div className="absolute top-1 right-1 flex gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 bg-black/50 hover:bg-black/70 text-white"
                    onClick={() => dispatch({ type: 'SET_ACTIVE_VIDEO', payload: null })}
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
                <div className="absolute bottom-1 left-1">
                  <Badge className="bg-black/50 text-white border-0 text-[10px] gap-1">
                    <Youtube className="w-3 h-3" />
                    {activeVideo!.title}
                  </Badge>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
