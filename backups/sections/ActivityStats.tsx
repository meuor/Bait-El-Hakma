import { useMemo } from 'react';
import { useApp } from '@/context/AppContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from 'recharts';
import {
  Timer,
  CheckCircle2,
  BookOpen,
  Target,
  TrendingUp,
  Calendar,
  Flame,
  Award,
} from 'lucide-react';
import { MigrateData } from '@/components/MigrateData';

const COLORS = ['#8b5cf6', '#3b82f6', '#22c55e', '#f59e0b', '#ef4444'];

export function ActivityStats() {
  const { state } = useApp();
  const { pomodoroHistory, todos, books, challenges } = state;

  // Calculate statistics
  const stats = useMemo(() => {
    const today = new Date().toDateString();
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      return date.toDateString();
    }).reverse();

    // Pomodoro stats
    const todayPomodoros = pomodoroHistory.filter(
      s => new Date(s.startTime).toDateString() === today && s.type === 'focus'
    );
    const todayFocusMinutes = todayPomodoros.reduce((acc, s) => acc + s.duration, 0);
    const totalPomodoros = pomodoroHistory.filter(s => s.type === 'focus').length;
    const totalFocusHours = Math.floor(
      pomodoroHistory
        .filter(s => s.type === 'focus')
        .reduce((acc, s) => acc + s.duration, 0) / 60
    );

    // Weekly pomodoro data
    const weeklyPomodoroData = last7Days.map(dateStr => {
      const dayPomodoros = pomodoroHistory.filter(
        s => new Date(s.startTime).toDateString() === dateStr && s.type === 'focus'
      );
      return {
        day: new Date(dateStr).toLocaleDateString('en', { weekday: 'short' }),
        sessions: dayPomodoros.length,
        minutes: dayPomodoros.reduce((acc, s) => acc + s.duration, 0),
      };
    });

    // Todo stats
    const todayTodos = todos.filter(t => new Date(t.createdAt).toDateString() === today);
    const completedToday = todayTodos.filter(t => t.completed).length;
    const totalTasks = todos.length;
    const totalCompletedTasks = todos.filter(t => t.completed).length;

    // Book stats
    const booksReading = books.filter(b => b.status === 'reading').length;
    const booksCompleted = books.filter(b => b.status === 'completed').length;
    const totalBooks = books.length;

    // Challenge stats
    const activeChallenges = challenges.filter(c => 
      c.completedDays.filter(Boolean).length < c.totalDays
    ).length;
    const totalChallengeDays = challenges.reduce((acc, c) => acc + c.totalDays, 0);
    const completedChallengeDays = challenges.reduce(
      (acc, c) => acc + c.completedDays.filter(Boolean).length,
      0
    );

    // Session type distribution
    const sessionTypes = [
      { name: 'Focus', value: pomodoroHistory.filter(s => s.type === 'focus').length },
      { name: 'Short Break', value: pomodoroHistory.filter(s => s.type === 'shortBreak').length },
      { name: 'Long Break', value: pomodoroHistory.filter(s => s.type === 'longBreak').length },
    ].filter(t => t.value > 0);

    // Calculate streak (simplified)
    let currentStreak = 0;
    const sortedHistory = [...pomodoroHistory].sort(
      (a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
    );
    
    if (sortedHistory.length > 0) {
      const lastSession = new Date(sortedHistory[0].startTime);
      const today = new Date();
      const diffDays = Math.floor((today.getTime() - lastSession.getTime()) / (1000 * 60 * 60 * 24));
      
      if (diffDays <= 1) {
        currentStreak = 1;
        for (let i = 1; i < sortedHistory.length; i++) {
          const curr = new Date(sortedHistory[i].startTime);
          const prev = new Date(sortedHistory[i - 1].startTime);
          const dayDiff = Math.floor((prev.getTime() - curr.getTime()) / (1000 * 60 * 60 * 24));
          if (dayDiff <= 1) {
            currentStreak++;
          } else {
            break;
          }
        }
      }
    }

    return {
      todayPomodoros: todayPomodoros.length,
      todayFocusMinutes,
      totalPomodoros,
      totalFocusHours,
      weeklyPomodoroData,
      completedToday,
      totalToday: todayTodos.length,
      totalTasks,
      totalCompletedTasks,
      booksReading,
      booksCompleted,
      totalBooks,
      activeChallenges,
      totalChallengeDays,
      completedChallengeDays,
      sessionTypes,
      currentStreak,
    };
  }, [pomodoroHistory, todos, books, challenges]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold">Activity Statistics</h2>
        <p className="text-muted-foreground">Track your productivity journey</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Timer className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.todayPomodoros}</p>
                <p className="text-xs text-muted-foreground">Pomodoros Today</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.completedToday}</p>
                <p className="text-xs text-muted-foreground">Tasks Done Today</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center">
                <Flame className="w-5 h-5 text-orange-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.currentStreak}</p>
                <p className="text-xs text-muted-foreground">Day Streak</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.totalFocusHours}h</p>
                <p className="text-xs text-muted-foreground">Total Focus Time</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Pomodoro Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Weekly Focus Sessions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.weeklyPomodoroData}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                  <Bar dataKey="sessions" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Focus Time Trend */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Focus Minutes Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats.weeklyPomodoroData}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="minutes" 
                    stroke="hsl(var(--primary))" 
                    fill="hsl(var(--primary))"
                    fillOpacity={0.3}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Session Types */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Session Types</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[200px]">
              {stats.sessionTypes.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={stats.sessionTypes}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {stats.sessionTypes.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  No data yet
                </div>
              )}
            </div>
            <div className="flex flex-wrap justify-center gap-2 mt-2">
              {stats.sessionTypes.map((type, index) => (
                <div key={type.name} className="flex items-center gap-1 text-xs">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <span>{type.name}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Reading Progress */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <BookOpen className="w-5 h-5" />
              Reading Progress
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Books Reading</span>
              <span className="font-semibold">{stats.booksReading}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Books Completed</span>
              <span className="font-semibold">{stats.booksCompleted}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Total Books</span>
              <span className="font-semibold">{stats.totalBooks}</span>
            </div>
            <div className="pt-2">
              <div className="flex items-center justify-between text-sm mb-1">
                <span>Library Progress</span>
                <span>{stats.totalBooks > 0 ? Math.round((stats.booksCompleted / stats.totalBooks) * 100) : 0}%</span>
              </div>
              <Progress 
                value={stats.totalBooks > 0 ? (stats.booksCompleted / stats.totalBooks) * 100 : 0} 
                className="h-2"
              />
            </div>
          </CardContent>
        </Card>

        {/* Challenge Progress */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Target className="w-5 h-5" />
              Challenges
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Active Challenges</span>
              <span className="font-semibold">{stats.activeChallenges}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Days Completed</span>
              <span className="font-semibold">{stats.completedChallengeDays}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Total Days</span>
              <span className="font-semibold">{stats.totalChallengeDays}</span>
            </div>
            <div className="pt-2">
              <div className="flex items-center justify-between text-sm mb-1">
                <span>Overall Progress</span>
                <span>{stats.totalChallengeDays > 0 ? Math.round((stats.completedChallengeDays / stats.totalChallengeDays) * 100) : 0}%</span>
              </div>
              <Progress 
                value={stats.totalChallengeDays > 0 ? (stats.completedChallengeDays / stats.totalChallengeDays) * 100 : 0} 
                className="h-2"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Achievement Badges */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Award className="w-5 h-5" />
            Achievements
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            {stats.totalPomodoros >= 1 && (
              <Badge variant="secondary" className="px-3 py-2 gap-2">
                <Timer className="w-4 h-4" />
                First Pomodoro
              </Badge>
            )}
            {stats.totalPomodoros >= 10 && (
              <Badge variant="secondary" className="px-3 py-2 gap-2">
                <Timer className="w-4 h-4" />
                10 Pomodoros
              </Badge>
            )}
            {stats.totalPomodoros >= 50 && (
              <Badge variant="secondary" className="px-3 py-2 gap-2">
                <Timer className="w-4 h-4" />
                Focus Master (50+)
              </Badge>
            )}
            {stats.currentStreak >= 3 && (
              <Badge variant="secondary" className="px-3 py-2 gap-2">
                <Flame className="w-4 h-4" />
                3-Day Streak
              </Badge>
            )}
            {stats.currentStreak >= 7 && (
              <Badge variant="secondary" className="px-3 py-2 gap-2">
                <Flame className="w-4 h-4" />
                Week Warrior
              </Badge>
            )}
            {stats.booksCompleted >= 1 && (
              <Badge variant="secondary" className="px-3 py-2 gap-2">
                <BookOpen className="w-4 h-4" />
                Bookworm
              </Badge>
            )}
            {stats.totalCompletedTasks >= 10 && (
              <Badge variant="secondary" className="px-3 py-2 gap-2">
                <CheckCircle2 className="w-4 h-4" />
                Task Master
              </Badge>
            )}
            {stats.totalFocusHours >= 10 && (
              <Badge variant="secondary" className="px-3 py-2 gap-2">
                <TrendingUp className="w-4 h-4" />
                10 Hours Focused
              </Badge>
            )}
          </div>
          {stats.totalPomodoros === 0 && (
            <p className="text-muted-foreground text-center py-4">
              Complete tasks to earn achievements!
            </p>
          )}
        </CardContent>
      </Card>

      {/* Data Migration Section */}
      <div className="mt-8">
        <MigrateData />
      </div>
    </div>
  );
}
