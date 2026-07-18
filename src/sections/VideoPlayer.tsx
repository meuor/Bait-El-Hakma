import { useState, useRef, useEffect } from 'react';
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
} from 'lucide-react';
import { toast } from 'sonner';

// Extract YouTube video ID from URL
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
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
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
              <span className="text-sm font-medium truncate flex-1">
                {isYouTube ? 'YouTube Video' : 'Local Video'}
              </span>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onToggleMinimize}>
                  <Maximize2 className="w-3 h-3" />
                </Button>
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onClose}>
                  <X className="w-3 h-3" />
                </Button>
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
            <span className="text-sm font-medium">
              {isYouTube ? 'YouTube Video' : 'Local Video'}
            </span>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onToggleMinimize}>
                <Minimize2 className="w-3 h-3" />
              </Button>
              <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onClose}>
                <X className="w-3 h-3" />
              </Button>
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
            <video
              ref={videoRef}
              src={videoUrl}
              className="w-full h-40 rounded-lg"
              controls
              autoPlay
              loop
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export function VideoPlayer() {
  const { state, dispatch } = useApp();
  const { videoSource } = state;
  
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [activeTab, setActiveTab] = useState('youtube');
  const [isFloating, setIsFloating] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isPiPActive, setIsPiPActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Sync with Pomodoro timer (mock implementation)
  useEffect(() => {
    // In a real implementation, this would listen to Pomodoro state changes
    // and play/pause the video accordingly
  }, []);

  const handleYouTubeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const videoId = extractYouTubeId(youtubeUrl);
    
    if (!videoId) {
      toast.error('Invalid YouTube URL');
      return;
    }

    dispatch({
      type: 'SET_VIDEO_SOURCE',
      payload: { type: 'youtube', url: youtubeUrl, title: 'YouTube Video' },
    });
    toast.success('YouTube video loaded');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('video/')) {
      toast.error('Please select a video file');
      return;
    }

    const url = URL.createObjectURL(file);
    dispatch({
      type: 'SET_VIDEO_SOURCE',
      payload: { type: 'local', url, title: file.name },
    });
    toast.success('Video uploaded successfully');
  };

  const clearVideo = () => {
    dispatch({ type: 'SET_VIDEO_SOURCE', payload: null });
    setYoutubeUrl('');
    setIsFloating(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
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
      } catch (error) {
        toast.error('Picture-in-Picture not supported');
      }
    }
  };

  const toggleFloating = () => {
    setIsFloating(!isFloating);
    setIsMinimized(false);
  };

  return (
    <div className="space-y-6">
      {/* Video Input Section */}
      {!videoSource && (
        <Card>
          <CardHeader>
            <CardTitle>Choose Video Source</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="youtube" className="gap-2">
                  <Youtube className="w-4 h-4" />
                  YouTube
                </TabsTrigger>
                <TabsTrigger value="local" className="gap-2">
                  <Upload className="w-4 h-4" />
                  Local File
                </TabsTrigger>
              </TabsList>

              <TabsContent value="youtube" className="space-y-4">
                <form onSubmit={handleYouTubeSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">YouTube URL</label>
                    <div className="flex gap-2">
                      <Input
                        placeholder="https://youtube.com/watch?v=..."
                        value={youtubeUrl}
                        onChange={(e) => setYoutubeUrl(e.target.value)}
                        className="flex-1"
                      />
                      <Button type="submit">
                        <Play className="w-4 h-4 mr-2" />
                        Load
                      </Button>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Paste a YouTube video URL to play ambient focus music or study videos.
                  </p>
                </form>
              </TabsContent>

              <TabsContent value="local" className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Upload Video</label>
                  <div className="flex gap-2">
                    <Input
                      ref={fileInputRef}
                      type="file"
                      accept="video/*"
                      onChange={handleFileUpload}
                      className="flex-1"
                    />
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  Upload a local video file from your device.
                </p>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}

      {/* Video Player */}
      {videoSource && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>{videoSource.title || 'Video Player'}</CardTitle>
              <Badge variant="secondary" className="mt-1">
                {videoSource.type === 'youtube' ? 'YouTube' : 'Local File'}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              {videoSource.type === 'local' && (
                <Button variant="outline" size="sm" onClick={enablePiP}>
                  <PictureInPicture className="w-4 h-4 mr-2" />
                  {isPiPActive ? 'Exit PiP' : 'PiP Mode'}
                </Button>
              )}
              <Button variant="outline" size="sm" onClick={toggleFloating}>
                <ExternalLink className="w-4 h-4 mr-2" />
                {isFloating ? 'Dock' : 'Float'}
              </Button>
              <Button variant="ghost" size="sm" onClick={clearVideo}>
                <X className="w-4 h-4" />
              </Button>
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
                  <video
                    ref={videoRef}
                    src={videoSource.url}
                    className="w-full h-full"
                    controls
                    autoPlay
                    loop
                  />
                )}
              </div>
            )}

            {/* Sync Info */}
            <div className="mt-4 p-4 rounded-lg bg-muted/50">
              <h4 className="font-medium mb-2">Pomodoro Sync</h4>
              <p className="text-sm text-muted-foreground">
                When the Pomodoro timer starts, this video will automatically play. 
                When paused, the video will pause as well.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Suggested Videos */}
      {!videoSource && (
        <Card>
          <CardHeader>
            <CardTitle>Suggested Focus Videos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {suggestedVideos.map((video) => (
                <Button
                  key={video.id}
                  variant="outline"
                  className="h-auto p-4 flex flex-col items-start gap-2 text-left"
                  onClick={() => {
                    setYoutubeUrl(video.url);
                    dispatch({
                      type: 'SET_VIDEO_SOURCE',
                      payload: { type: 'youtube', url: video.url, title: video.title },
                    });
                  }}
                >
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

      {/* Floating Player */}
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

// Suggested focus videos
const suggestedVideos = [
  {
    id: '1',
    title: 'Lofi Girl - Study Beats',
    url: 'https://www.youtube.com/watch?v=jfKfPfyJRdk',
    category: 'Music',
  },
  {
    id: '2',
    title: 'Rainy Jazz Cafe',
    url: 'https://www.youtube.com/watch?v=DSGyEsJ17cI',
    category: 'Ambient',
  },
  {
    id: '3',
    title: 'Deep Focus Music',
    url: 'https://www.youtube.com/watch?v=WPni755-Krg',
    category: 'Focus',
  },
  {
    id: '4',
    title: 'Nature Sounds Forest',
    url: 'https://www.youtube.com/watch?v=xNN7iTA57jM',
    category: 'Nature',
  },
  {
    id: '5',
    title: 'Piano Study Music',
    url: 'https://www.youtube.com/watch?v=4oStw0r33so',
    category: 'Music',
  },
  {
    id: '6',
    title: 'Coffee Shop Ambience',
    url: 'https://www.youtube.com/watch?v=2OEL4P1R2Sz',
    category: 'Ambient',
  },
];
