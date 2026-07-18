import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Plus,
  Trophy,
  Target,
  CheckCircle2,
  Flame,
  Edit2,
  Trash2,
  Code,
  BookOpen,
  Dumbbell,
  Palette,
  Music,
  PenTool,
  Camera,
  Globe,
  Heart,
  Zap,
} from 'lucide-react';
import { toast } from 'sonner';
import type { Challenge } from '@/types';

const challengeIcons = {
  code: Code,
  book: BookOpen,
  dumbbell: Dumbbell,
  palette: Palette,
  music: Music,
  pen: PenTool,
  camera: Camera,
  globe: Globe,
  heart: Heart,
  zap: Zap,
  trophy: Trophy,
  target: Target,
};

const challengeColors = [
  '#8b5cf6', // purple
  '#3b82f6', // blue
  '#22c55e', // green
  '#f59e0b', // amber
  '#ef4444', // red
  '#ec4899', // pink
  '#06b6d4', // cyan
  '#f97316', // orange
];

const presetChallenges = [
  { name: '100DaysOfCode', icon: 'code', color: '#3b82f6', days: 100 },
  { name: '30DaysOfReading', icon: 'book', color: '#8b5cf6', days: 30 },
  { name: '75Hard', icon: 'dumbbell', color: '#ef4444', days: 75 },
  { name: 'DailySketch', icon: 'palette', color: '#ec4899', days: 30 },
  { name: 'MorningWorkout', icon: 'zap', color: '#22c55e', days: 30 },
];

export function ChallengeTracker() {
  const { state, dispatch } = useApp();
  const { challenges } = state;
  
  const [showAddChallenge, setShowAddChallenge] = useState(false);
  const [editingChallenge, setEditingChallenge] = useState<Challenge | null>(null);
  
  // New challenge form
  const [newChallengeName, setNewChallengeName] = useState('');
  const [newChallengeDescription, setNewChallengeDescription] = useState('');
  const [newChallengeDays, setNewChallengeDays] = useState(100);
  const [newChallengeIcon, setNewChallengeIcon] = useState<keyof typeof challengeIcons>('trophy');
  const [newChallengeColor, setNewChallengeColor] = useState(challengeColors[0]);

  const handleAddChallenge = () => {
    if (!newChallengeName.trim()) {
      toast.error('Please enter a challenge name');
      return;
    }

    const newChallenge: Challenge = {
      id: Date.now().toString(),
      name: newChallengeName,
      description: newChallengeDescription,
      totalDays: newChallengeDays,
      completedDays: Array(newChallengeDays).fill(false),
      startDate: new Date(),
      color: newChallengeColor,
      icon: newChallengeIcon,
    };

    dispatch({ type: 'ADD_CHALLENGE', payload: newChallenge });
    
    // Reset form
    setNewChallengeName('');
    setNewChallengeDescription('');
    setNewChallengeDays(100);
    setNewChallengeIcon('trophy');
    setNewChallengeColor(challengeColors[0]);
    setShowAddChallenge(false);
    
    toast.success('Challenge created!');
  };

  const handleUpdateChallenge = () => {
    if (!editingChallenge) return;
    dispatch({ type: 'UPDATE_CHALLENGE', payload: editingChallenge });
    setEditingChallenge(null);
    toast.success('Challenge updated');
  };

  const handleDeleteChallenge = (challengeId: string) => {
    dispatch({ type: 'DELETE_CHALLENGE', payload: challengeId });
    toast.success('Challenge deleted');
  };

  const toggleDay = (challenge: Challenge, dayIndex: number) => {
    const updatedCompletedDays = [...challenge.completedDays];
    updatedCompletedDays[dayIndex] = !updatedCompletedDays[dayIndex];
    
    const updatedChallenge = {
      ...challenge,
      completedDays: updatedCompletedDays,
    };
    
    dispatch({ type: 'UPDATE_CHALLENGE', payload: updatedChallenge });
    
    if (updatedCompletedDays[dayIndex]) {
      toast.success('Day marked as complete!');
    }
  };

  const getChallengeStats = (challenge: Challenge) => {
    const completedCount = challenge.completedDays.filter(Boolean).length;
    const percentage = Math.round((completedCount / challenge.totalDays) * 100);
    
    // Calculate current streak
    let currentStreak = 0;
    for (let i = challenge.completedDays.length - 1; i >= 0; i--) {
      if (challenge.completedDays[i]) {
        currentStreak++;
      } else {
        break;
      }
    }
    
    // Calculate longest streak
    let longestStreak = 0;
    let tempStreak = 0;
    for (const completed of challenge.completedDays) {
      if (completed) {
        tempStreak++;
        longestStreak = Math.max(longestStreak, tempStreak);
      } else {
        tempStreak = 0;
      }
    }
    
    return { completedCount, percentage, currentStreak, longestStreak };
  };

  const loadPresetChallenge = (preset: typeof presetChallenges[0]) => {
    setNewChallengeName(preset.name);
    setNewChallengeDays(preset.days);
    setNewChallengeIcon(preset.icon as keyof typeof challengeIcons);
    setNewChallengeColor(preset.color);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Challenge Tracker</h2>
          <p className="text-muted-foreground">Build habits, one day at a time</p>
        </div>
        <Button onClick={() => setShowAddChallenge(true)} className="gap-2">
          <Plus className="w-4 h-4" />
          New Challenge
        </Button>
      </div>

      {/* Active Challenges */}
      {challenges.length === 0 ? (
        <Card className="p-12 text-center">
          <Trophy className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">No challenges yet</h3>
          <p className="text-muted-foreground mb-4">
            Start your first challenge and track your progress daily
          </p>
          <Button onClick={() => setShowAddChallenge(true)}>Create Challenge</Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {challenges.map((challenge) => {
            const stats = getChallengeStats(challenge);
            const IconComponent = challengeIcons[challenge.icon as keyof typeof challengeIcons] || Trophy;
            
            return (
              <Card key={challenge.id} className="overflow-hidden">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center"
                        style={{ backgroundColor: `${challenge.color}20` }}
                      >
                        <IconComponent
                          className="w-6 h-6"
                          style={{ color: challenge.color }}
                        />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{challenge.name}</CardTitle>
                        <p className="text-sm text-muted-foreground">
                          {challenge.description || `${challenge.totalDays}-day challenge`}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => setEditingChallenge(challenge)}
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive"
                        onClick={() => handleDeleteChallenge(challenge.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  {/* Progress Stats */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center p-3 rounded-lg bg-muted/50">
                      <p className="text-2xl font-bold" style={{ color: challenge.color }}>
                        {stats.percentage}%
                      </p>
                      <p className="text-xs text-muted-foreground">Complete</p>
                    </div>
                    <div className="text-center p-3 rounded-lg bg-muted/50">
                      <p className="text-2xl font-bold">{stats.completedCount}</p>
                      <p className="text-xs text-muted-foreground">Days Done</p>
                    </div>
                    <div className="text-center p-3 rounded-lg bg-muted/50">
                      <p className="text-2xl font-bold flex items-center justify-center gap-1">
                        <Flame className="w-5 h-5 text-orange-500" />
                        {stats.currentStreak}
                      </p>
                      <p className="text-xs text-muted-foreground">Day Streak</p>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span>Progress</span>
                      <span>{stats.completedCount}/{challenge.totalDays}</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full transition-all duration-500"
                        style={{
                          width: `${stats.percentage}%`,
                          backgroundColor: challenge.color,
                        }}
                      />
                    </div>
                  </div>

                  {/* Day Grid */}
                  <ScrollArea className="h-32">
                    <div className="grid grid-cols-10 gap-1">
                      {challenge.completedDays.map((completed, index) => (
                        <button
                          key={index}
                          onClick={() => toggleDay(challenge, index)}
                          className={`aspect-square rounded-md flex items-center justify-center text-xs font-medium transition-all ${
                            completed
                              ? 'text-white'
                              : 'bg-muted hover:bg-muted/80 text-muted-foreground'
                          }`}
                          style={
                            completed
                              ? { backgroundColor: challenge.color }
                              : undefined
                          }
                          title={`Day ${index + 1}`}
                        >
                          {index + 1}
                        </button>
                      ))}
                    </div>
                  </ScrollArea>

                  {/* Quick Actions */}
                  <div className="flex gap-2">
                    {stats.completedCount < challenge.totalDays && (
                      <Button
                        variant="outline"
                        className="flex-1 gap-2"
                        onClick={() => toggleDay(challenge, stats.completedCount)}
                        style={{ borderColor: challenge.color, color: challenge.color }}
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        Mark Day {stats.completedCount + 1} Complete
                      </Button>
                    )}
                    {stats.completedCount === challenge.totalDays && (
                      <Button
                        className="flex-1 gap-2"
                        style={{ backgroundColor: challenge.color }}
                      >
                        <Trophy className="w-4 h-4" />
                        Challenge Complete!
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Add Challenge Dialog */}
      <Dialog open={showAddChallenge} onOpenChange={setShowAddChallenge}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>Create New Challenge</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Preset Challenges */}
            <div>
              <Label className="mb-2 block">Quick Start</Label>
              <div className="flex flex-wrap gap-2">
                {presetChallenges.map((preset) => (
                  <Button
                    key={preset.name}
                    variant="outline"
                    size="sm"
                    onClick={() => loadPresetChallenge(preset)}
                    style={{ borderColor: preset.color, color: preset.color }}
                  >
                    {preset.name}
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Challenge Name *</Label>
              <Input
                placeholder="e.g., 100DaysOfCode"
                value={newChallengeName}
                onChange={(e) => setNewChallengeName(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                placeholder="What is this challenge about?"
                value={newChallengeDescription}
                onChange={(e) => setNewChallengeDescription(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label>Number of Days</Label>
              <Input
                type="number"
                min={1}
                max={365}
                value={newChallengeDays}
                onChange={(e) => setNewChallengeDays(parseInt(e.target.value) || 30)}
              />
            </div>
            
            <div className="space-y-2">
              <Label>Icon</Label>
              <div className="flex flex-wrap gap-2">
                {Object.entries(challengeIcons).map(([key, Icon]) => (
                  <Button
                    key={key}
                    variant={newChallengeIcon === key ? 'default' : 'outline'}
                    size="icon"
                    className="h-10 w-10"
                    onClick={() => setNewChallengeIcon(key as keyof typeof challengeIcons)}
                  >
                    <Icon className="w-5 h-5" />
                  </Button>
                ))}
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Color</Label>
              <div className="flex flex-wrap gap-2">
                {challengeColors.map((color) => (
                  <button
                    key={color}
                    onClick={() => setNewChallengeColor(color)}
                    className={`w-8 h-8 rounded-full transition-all ${
                      newChallengeColor === color ? 'ring-2 ring-offset-2 ring-primary' : ''
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
            
            <Button className="w-full" onClick={handleAddChallenge}>
              Create Challenge
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Challenge Dialog */}
      <Dialog open={!!editingChallenge} onOpenChange={() => setEditingChallenge(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Challenge</DialogTitle>
          </DialogHeader>
          {editingChallenge && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Name</Label>
                <Input
                  value={editingChallenge.name}
                  onChange={(e) => setEditingChallenge({ ...editingChallenge, name: e.target.value })}
                />
              </div>
              
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={editingChallenge.description}
                  onChange={(e) => setEditingChallenge({ ...editingChallenge, description: e.target.value })}
                />
              </div>
              
              <Button className="w-full" onClick={handleUpdateChallenge}>
                Save Changes
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
