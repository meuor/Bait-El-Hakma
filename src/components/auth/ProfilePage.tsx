import { useState, useEffect, useRef } from 'react';
import { authAPI, type AuthUser, type UserStats } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import {
  User,
  Mail,
  Calendar,
  Timer,
  BookOpen,
  CheckCircle2,
  Target,
  Flame,
  Save,
  Loader2,
  LogOut,
  Edit3,
  Camera,
  X,
} from 'lucide-react';

interface ProfilePageProps {
  user: AuthUser;
  onUpdate: (user: AuthUser) => void;
  onLogout: () => void;
}

export function ProfilePage({ user, onUpdate, onLogout }: ProfilePageProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [displayName, setDisplayName] = useState(user.displayName);
  const [bio, setBio] = useState(user.bio || '');
  const [avatarPreview, setAvatarPreview] = useState(user.avatarUrl || '');
  const [isSaving, setIsSaving] = useState(false);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const data = await authAPI.getStats();
        setStats(data);
      } catch (error) {
        console.error('Failed to load stats:', error);
      } finally {
        setIsLoadingStats(false);
      }
    };
    loadStats();
  }, []);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image must be less than 2MB');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatarPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveAvatar = () => {
    setAvatarPreview('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const updated = await authAPI.updateProfile({
        displayName,
        bio,
        avatarUrl: avatarPreview,
      });
      onUpdate(updated);
      setIsEditing(false);
      toast.success('Profile updated successfully!');
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('bait-el-hakma-token');
    toast.success('Logged out successfully');
    onLogout();
  };

  const initials = displayName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const formatMinutes = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) return `${hours}h ${mins}m`;
    return `${mins}m`;
  };

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-6">
      {/* Profile Header */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              {/* Avatar with upload */}
              <div className="relative group">
                {avatarPreview ? (
                  <img
                    src={avatarPreview}
                    alt={displayName}
                    className="h-20 w-20 rounded-full object-cover border-2 border-border"
                  />
                ) : (
                  <div className="h-20 w-20 rounded-full bg-violet-600 flex items-center justify-center border-2 border-border">
                    <span className="text-2xl font-bold text-white">{initials}</span>
                  </div>
                )}
                {isEditing && (
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                  >
                    <Camera className="h-6 w-6 text-white" />
                  </button>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                />
              </div>

              <div>
                <CardTitle className="text-2xl">{user.displayName}</CardTitle>
                <CardDescription className="flex items-center gap-1 mt-1">
                  <Mail className="h-3 w-3" />
                  {user.email}
                </CardDescription>
                {user.createdAt && (
                  <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    Joined {new Date(user.createdAt).toLocaleDateString()}
                  </p>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              {!isEditing ? (
                <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                  <Edit3 className="h-4 w-4 mr-1" />
                  Edit
                </Button>
              ) : (
                <>
                  <Button variant="outline" size="sm" onClick={() => { setIsEditing(false); setAvatarPreview(user.avatarUrl || ''); }}>
                    Cancel
                  </Button>
                  <Button size="sm" onClick={handleSave} disabled={isSaving}>
                    {isSaving ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4 mr-1" />
                    )}
                    Save
                  </Button>
                </>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isEditing ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Display Name</Label>
                <Input id="name" value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  placeholder="Tell us about yourself..."
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={3}
                />
              </div>
              {avatarPreview && (
                <div className="space-y-2">
                  <Label>Profile Picture</Label>
                  <div className="flex items-center gap-3">
                    <img src={avatarPreview} alt="Avatar" className="h-16 w-16 rounded-full object-cover" />
                    <Button variant="outline" size="sm" onClick={handleRemoveAvatar}>
                      <X className="h-4 w-4 mr-1" />
                      Remove
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
                      <Camera className="h-4 w-4 mr-1" />
                      Change
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div>
              {bio ? (
                <p className="text-muted-foreground">{bio}</p>
              ) : (
                <p className="text-muted-foreground italic">No bio added yet.</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Statistics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Your Statistics
          </CardTitle>
          <CardDescription>Your productivity at a glance</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingStats ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : stats ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-lg bg-violet-50 dark:bg-violet-950/20 text-center">
                <Timer className="h-6 w-6 mx-auto mb-2 text-violet-600" />
                <p className="text-2xl font-bold">{stats.pomodoroSessions}</p>
                <p className="text-xs text-muted-foreground">Pomodoro Sessions</p>
              </div>
              <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-950/20 text-center">
                <Flame className="h-6 w-6 mx-auto mb-2 text-blue-600" />
                <p className="text-2xl font-bold">{formatMinutes(stats.focusMinutes)}</p>
                <p className="text-xs text-muted-foreground">Focus Time</p>
              </div>
              <div className="p-4 rounded-lg bg-green-50 dark:bg-green-950/20 text-center">
                <CheckCircle2 className="h-6 w-6 mx-auto mb-2 text-green-600" />
                <p className="text-2xl font-bold">{stats.completedTodos}</p>
                <p className="text-xs text-muted-foreground">Tasks Done</p>
              </div>
              <div className="p-4 rounded-lg bg-amber-50 dark:bg-amber-950/20 text-center">
                <BookOpen className="h-6 w-6 mx-auto mb-2 text-amber-600" />
                <p className="text-2xl font-bold">{stats.totalBooks}</p>
                <p className="text-xs text-muted-foreground">Books</p>
              </div>
              <div className="p-4 rounded-lg bg-pink-50 dark:bg-pink-950/20 text-center">
                <Target className="h-6 w-6 mx-auto mb-2 text-pink-600" />
                <p className="text-2xl font-bold">{stats.totalChallenges}</p>
                <p className="text-xs text-muted-foreground">Challenges</p>
              </div>
              <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-950/20 text-center">
                <User className="h-6 w-6 mx-auto mb-2 text-slate-600" />
                <p className="text-2xl font-bold">{stats.totalTodos}</p>
                <p className="text-xs text-muted-foreground">Total Tasks</p>
              </div>
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-4">No statistics available yet.</p>
          )}
        </CardContent>
      </Card>

      {/* Account Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Account</CardTitle>
        </CardHeader>
        <CardContent>
          <Separator className="mb-4" />
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Sign out</p>
              <p className="text-sm text-muted-foreground">Sign out of your account on this device</p>
            </div>
            <Button variant="destructive" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
