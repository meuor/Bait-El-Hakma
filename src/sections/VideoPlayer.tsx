import { useState, useRef, useEffect, useCallback } from 'react';
import { useApp } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import {
  Play,
  Pause,
  Upload,
  Youtube,
  PictureInPicture,
  ExternalLink,
  X,
  Minimize2,
  Maximize2,
  Volume2,
  VolumeX,
  Shuffle,
  SkipForward,
  Pin,
  PinOff,
} from 'lucide-react';
import { toast } from 'sonner';

const extractYouTubeId = (url: string): string | null => {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\s?]+)/,
    /youtube\.com\/watch\?.*v=([^&\s]+)/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
};

interface FloatingPlayerProps {
  videoUrl: string;
  isYouTube: boolean;
  onClose: () => void;
  isMinimized: boolean;
  onToggleMinimize: () => void;
}

function FloatingPlayer({ videoUrl, isYouTube, onClose, isMinimized, onToggleMinimize }: FloatingPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) { videoRef.current.pause(); } else { videoRef.current.play(); }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  if (isMinimized) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Card className="w-64 shadow-2xl">
          <CardContent className="p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium truncate flex-1">{isYouTube ? 'YouTube Video' : 'Local Video'}</span>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onToggleMinimize}><Maximize2 className="w-3 h-3" /></Button>
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onClose}><X className="w-3 h-3" /></Button>
              </div>
            </div>
            {!isYouTube && (
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={togglePlay}>
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={toggleMute}>
                  {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Card className="w-80 shadow-2xl">
        <CardHeader className="p-3 pb-0">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">{isYouTube ? 'YouTube Video' : 'Local Video'}</span>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onToggleMinimize}><Minimize2 className="w-3 h-3" /></Button>
              <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onClose}><X className="w-3 h-3" /></Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-3">
          {isYouTube ? (
            <iframe
              src={`https://www.youtube.com/embed/${extractYouTubeId(videoUrl)}?autoplay=1`}
              className="w-full h-40 rounded-lg"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <video ref={videoRef} src={videoUrl} className="w-full h-40 rounded-lg" controls autoPlay loop />
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export function VideoPlayer() {
  const { state, dispatch } = useApp();
  const { videoSource, pinnedItems } = state;
  
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [activeTab, setActiveTab] = useState('youtube');
  const [isFloating, setIsFloating] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isPiPActive, setIsPiPActive] = useState(false);
  const [autoRotate, setAutoRotate] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const rotateTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const filteredVideos = selectedCategory === 'all'
    ? suggestedVideos
    : suggestedVideos.filter(v => v.category.toLowerCase() === selectedCategory.toLowerCase());

  const nextVideo = useCallback(() => {
    if (filteredVideos.length === 0) return;
    const nextIdx = (currentVideoIndex + 1) % filteredVideos.length;
    setCurrentVideoIndex(nextIdx);
    const video = filteredVideos[nextIdx];
    dispatch({ type: 'SET_VIDEO_SOURCE', payload: { type: 'youtube', url: video.url, title: video.title } });
    dispatch({ type: 'SET_ACTIVE_VIDEO', payload: { url: video.url, title: video.title } });
  }, [currentVideoIndex, filteredVideos, dispatch]);

  useEffect(() => {
    if (autoRotate && videoSource?.type === 'youtube') {
      rotateTimerRef.current = setInterval(() => {
        nextVideo();
      }, 300000);
    }
    return () => { if (rotateTimerRef.current) clearInterval(rotateTimerRef.current); };
  }, [autoRotate, videoSource, nextVideo]);

  useEffect(() => {
    if (videoSource && videoSource.type === 'youtube') {
      dispatch({ type: 'SET_ACTIVE_VIDEO', payload: { url: videoSource.url, title: videoSource.title || 'Focus Video' } });
    }
  }, [videoSource, dispatch]);

  const handleYouTubeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const videoId = extractYouTubeId(youtubeUrl);
    if (!videoId) { toast.error('Invalid YouTube URL'); return; }
    dispatch({ type: 'SET_VIDEO_SOURCE', payload: { type: 'youtube', url: youtubeUrl, title: 'YouTube Video' } });
    dispatch({ type: 'SET_ACTIVE_VIDEO', payload: { url: youtubeUrl, title: 'YouTube Video' } });
    toast.success('YouTube video loaded');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('video/')) { toast.error('Please select a video file'); return; }
    const url = URL.createObjectURL(file);
    dispatch({ type: 'SET_VIDEO_SOURCE', payload: { type: 'local', url, title: file.name } });
    dispatch({ type: 'SET_ACTIVE_VIDEO', payload: { url, title: file.name } });
    toast.success('Video uploaded successfully');
  };

  const clearVideo = () => {
    dispatch({ type: 'SET_VIDEO_SOURCE', payload: null });
    dispatch({ type: 'SET_ACTIVE_VIDEO', payload: null });
    setYoutubeUrl('');
    setIsFloating(false);
    setAutoRotate(false);
    if (rotateTimerRef.current) clearInterval(rotateTimerRef.current);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const enablePiP = async () => {
    if (videoRef.current && document.pictureInPictureEnabled) {
      try {
        if (document.pictureInPictureElement) {
          await document.exitPictureInPicture();
          setIsPiPActive(false);
        } else {
          await videoRef.current.requestPictureInPicture();
          setIsPiPActive(true);
        }
      } catch { toast.error('Picture-in-Picture not supported'); }
    }
  };

  const toggleFloating = () => { setIsFloating(!isFloating); setIsMinimized(false); };

  const categories = ['all', ...new Set(suggestedVideos.map(v => v.category))];

  return (
    <div className="space-y-6">
      {!videoSource && (
        <Card>
          <CardHeader>
            <CardTitle>Choose Video Source</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="youtube" className="gap-2"><Youtube className="w-4 h-4" />YouTube</TabsTrigger>
                <TabsTrigger value="local" className="gap-2"><Upload className="w-4 h-4" />Local File</TabsTrigger>
              </TabsList>
              <TabsContent value="youtube" className="space-y-4">
                <form onSubmit={handleYouTubeSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">YouTube URL</label>
                    <div className="flex gap-2">
                      <Input placeholder="https://youtube.com/watch?v=..." value={youtubeUrl} onChange={(e) => setYoutubeUrl(e.target.value)} className="flex-1" />
                      <Button type="submit"><Play className="w-4 h-4 mr-2" />Load</Button>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">Paste a YouTube video URL to play ambient focus music or study videos.</p>
                </form>
              </TabsContent>
              <TabsContent value="local" className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Upload Video</label>
                  <Input ref={fileInputRef} type="file" accept="video/*" onChange={handleFileUpload} className="flex-1" />
                </div>
                <p className="text-sm text-muted-foreground">Upload a local video file from your device.</p>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}

      {videoSource && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>{videoSource.title || 'Video Player'}</CardTitle>
              <Badge variant="secondary" className="mt-1">{videoSource.type === 'youtube' ? 'YouTube' : 'Local File'}</Badge>
            </div>
            <div className="flex items-center gap-2">
              {videoSource.type === 'youtube' && (
                <Button variant={autoRotate ? 'default' : 'outline'} size="sm" onClick={() => setAutoRotate(!autoRotate)} className="gap-2">
                  <Shuffle className="w-4 h-4" />
                  {autoRotate ? 'Auto-Rotate On' : 'Auto-Rotate'}
                </Button>
              )}
              {videoSource.type === 'youtube' && (
                <Button variant="outline" size="sm" onClick={nextVideo} className="gap-2">
                  <SkipForward className="w-4 h-4" />Next
                </Button>
              )}
              {videoSource.type === 'local' && (
                <Button variant="outline" size="sm" onClick={enablePiP}>
                  <PictureInPicture className="w-4 h-4 mr-2" />{isPiPActive ? 'Exit PiP' : 'PiP Mode'}
                </Button>
              )}
              <Button
                variant={pinnedItems[videoSource.type === 'local' ? 'localVideo' : 'youtubeVideo'] ? 'default' : 'outline'}
                size="sm"
                onClick={() => dispatch({ type: 'TOGGLE_PIN', payload: videoSource.type === 'local' ? 'localVideo' : 'youtubeVideo' })}
                className="gap-2"
              >
                {pinnedItems[videoSource.type === 'local' ? 'localVideo' : 'youtubeVideo'] ? <PinOff className="w-4 h-4" /> : <Pin className="w-4 h-4" />}
                {pinnedItems[videoSource.type === 'local' ? 'localVideo' : 'youtubeVideo'] ? 'Unpin' : 'Pin'}
              </Button>
              <Button variant="outline" size="sm" onClick={toggleFloating}>
                <ExternalLink className="w-4 h-4 mr-2" />{isFloating ? 'Dock' : 'Float'}
              </Button>
              <Button variant="ghost" size="sm" onClick={clearVideo}><X className="w-4 h-4" /></Button>
            </div>
          </CardHeader>
          <CardContent>
            {!isFloating && (
              <div className="aspect-video rounded-lg overflow-hidden bg-black">
                {videoSource.type === 'youtube' ? (
                  <iframe
                    src={`https://www.youtube.com/embed/${extractYouTubeId(videoSource.url)}?autoplay=1`}
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    title="YouTube Video"
                  />
                ) : (
                  <video ref={videoRef} src={videoSource.url} className="w-full h-full" controls autoPlay loop />
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {!videoSource && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Suggested Focus Videos</CardTitle>
              <div className="flex gap-1">
                {categories.map(cat => (
                  <Button key={cat} variant={selectedCategory === cat ? 'default' : 'ghost'} size="sm" onClick={() => setSelectedCategory(cat)} className="capitalize text-xs">
                    {cat}
                  </Button>
                ))}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredVideos.map((video) => (
                <Button key={video.id} variant="outline" className="h-auto p-4 flex flex-col items-start gap-2 text-left"
                  onClick={() => {
                    setYoutubeUrl(video.url);
                    setCurrentVideoIndex(filteredVideos.indexOf(video));
                    dispatch({ type: 'SET_VIDEO_SOURCE', payload: { type: 'youtube', url: video.url, title: video.title } });
                    dispatch({ type: 'SET_ACTIVE_VIDEO', payload: { url: video.url, title: video.title } });
                  }}>
                  <Youtube className="w-6 h-6 text-red-500" />
                  <div>
                    <p className="font-medium">{video.title}</p>
                    <p className="text-sm text-muted-foreground">{video.category}</p>
                  </div>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {isFloating && videoSource && (
        <FloatingPlayer
          videoUrl={videoSource.url}
          isYouTube={videoSource.type === 'youtube'}
          onClose={() => setIsFloating(false)}
          isMinimized={isMinimized}
          onToggleMinimize={() => setIsMinimized(!isMinimized)}
        />
      )}
    </div>
  );
}

const suggestedVideos = [
  { id: '1', title: 'Lofi Girl - Study Beats', url: 'https://www.youtube.com/watch?v=jfKfPfyJRdk', category: 'Music' },
  { id: '2', title: 'Rainy Jazz Cafe', url: 'https://www.youtube.com/watch?v=DSGyEsJ17cI', category: 'Ambient' },
  { id: '3', title: 'Deep Focus Music', url: 'https://www.youtube.com/watch?v=WPni755-Krg', category: 'Focus' },
  { id: '4', title: 'Nature Sounds Forest', url: 'https://www.youtube.com/watch?v=xNN7iTA57jM', category: 'Nature' },
  { id: '5', title: 'Piano Study Music', url: 'https://www.youtube.com/watch?v=4oStw0r33so', category: 'Music' },
  { id: '6', title: 'Coffee Shop Ambience', url: 'https://www.youtube.com/watch?v=2OEL4P1R2Sz', category: 'Ambient' },
  { id: '7', title: 'Ocean Waves Relaxation', url: 'https://www.youtube.com/watch?v=ClVY5VLvODg', category: 'Nature' },
  { id: '8', title: 'Classical Study Music', url: 'https://www.youtube.com/watch?v=jHpXqMScV0c', category: 'Music' },
  { id: '9', title: 'White Noise for Focus', url: 'https://www.youtube.com/watch?v=nMfPqeZjc2c', category: 'Focus' },
  { id: '10', title: 'Rain and Thunder Sounds', url: 'https://www.youtube.com/watch?v=mPqF6Vh7BqI', category: 'Nature' },
  { id: '11', title: 'Binaural Beats Focus', url: 'https://www.youtube.com/watch?v=FzD6VYJmDdQ', category: 'Focus' },
  { id: '12', title: 'Library Ambience', url: 'https://www.youtube.com/watch?v=2PAVinD0Kao', category: 'Ambient' },
];
