import { useState, useEffect } from 'react';
import { authAPI } from '@/lib/api';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, BookOpen, CheckSquare, Timer, Trophy, ArrowLeft } from 'lucide-react';

interface PublicProfileData {
  id: string;
  displayName: string;
  avatarUrl: string;
  bio: string;
  username: string;
  createdAt: string;
  totalTodos: number;
  completedTodos: number;
  totalBooks: number;
  totalPomodoroSessions: number;
  totalChallenges: number;
}



interface PublicProfileProps {
  username: string;
  onBack: () => void;
}

export function PublicProfile({ username, onBack }: PublicProfileProps) {
  const [profile, setProfile] = useState<PublicProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const data = await authAPI.getPublicProfile(username);
        setProfile(data as PublicProfileData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Profile not found');
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
  }, [username]);

  const initials = profile?.displayName
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || '';

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-violet-50 to-blue-50 dark:from-violet-950/20 dark:to-blue-950/20">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-violet-600 mx-auto mb-4" />
          <p className="text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-violet-50 to-blue-50 dark:from-violet-950/20 dark:to-blue-950/20">
        <div className="text-center">
          <img src="/logo.png" alt="Bait El-Hakma" className="w-16 h-16 rounded-2xl object-cover mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Profile Not Found</h1>
          <p className="text-muted-foreground mb-4">
            The user <span className="font-mono">@{username}</span> doesn't exist.
          </p>
          <Button onClick={onBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go to App
          </Button>
        </div>
      </div>
    );
  }

  const joinDate = new Date(profile.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const stats = [
    { label: 'Pomodoro Sessions', value: profile.totalPomodoroSessions, icon: Timer, color: 'text-primary' },
    { label: 'Tasks Completed', value: `${profile.completedTodos}/${profile.totalTodos}`, icon: CheckSquare, color: 'text-green-500' },
    { label: 'Books', value: profile.totalBooks, icon: BookOpen, color: 'text-blue-500' },
    { label: 'Challenges', value: profile.totalChallenges, icon: Trophy, color: 'text-yellow-500' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 to-blue-50 dark:from-violet-950/20 dark:to-blue-950/20 p-4">
      <div className="max-w-2xl mx-auto py-8">
        <Button variant="ghost" onClick={onBack} className="mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to App
        </Button>

        <Card>
          <CardHeader className="text-center">
            {profile.avatarUrl ? (
              <img
                src={profile.avatarUrl}
                alt={profile.displayName}
                className="w-24 h-24 rounded-full object-cover mx-auto border-4 border-primary/20"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-primary flex items-center justify-center mx-auto border-4 border-primary/20">
                <span className="text-primary-foreground text-3xl font-bold">{initials}</span>
              </div>
            )}
            <h1 className="text-2xl font-bold mt-4">{profile.displayName}</h1>
            <p className="text-muted-foreground font-mono">@{profile.username}</p>
            {profile.bio && (
              <p className="text-muted-foreground mt-2">{profile.bio}</p>
            )}
            <p className="text-xs text-muted-foreground mt-1">Joined {joinDate}</p>
          </CardHeader>

          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {stats.map((stat) => (
                <div key={stat.label} className="text-center p-4 rounded-lg bg-muted/50">
                  <stat.icon className={`w-6 h-6 mx-auto mb-2 ${stat.color}`} />
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <div className="text-xs text-muted-foreground">{stat.label}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
