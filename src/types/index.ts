// Theme Types
export type Theme = 'light' | 'dark' | 'dracula' | 'monokai' | 'github';

export interface ThemeConfig {
  name: Theme;
  label: string;
  icon: string;
}

// User Types
export interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}

// Pomodoro Types
export type ActivityMode =
  | 'reading' | 'coding' | 'watching' | 'working'
  | 'studying' | 'gaming' | 'writing' | 'exercising'
  | 'meditating' | 'learning' | 'designing' | 'other';

export interface ActivityModeConfig {
  id: ActivityMode;
  label: string;
  icon: string;
  color: string;
}

export const activityModes: ActivityModeConfig[] = [
  { id: 'reading', label: 'Reading', icon: 'BookOpen', color: 'text-blue-500' },
  { id: 'coding', label: 'Coding', icon: 'Code', color: 'text-emerald-500' },
  { id: 'watching', label: 'Watching', icon: 'Film', color: 'text-red-500' },
  { id: 'working', label: 'Working', icon: 'Briefcase', color: 'text-amber-500' },
  { id: 'studying', label: 'Studying', icon: 'GraduationCap', color: 'text-violet-500' },
  { id: 'gaming', label: 'Gaming', icon: 'Gamepad2', color: 'text-purple-500' },
  { id: 'writing', label: 'Writing', icon: 'PenLine', color: 'text-pink-500' },
  { id: 'exercising', label: 'Exercising', icon: 'Dumbbell', color: 'text-orange-500' },
  { id: 'meditating', label: 'Meditating', icon: 'Heart', color: 'text-rose-500' },
  { id: 'learning', label: 'Learning', icon: 'Lightbulb', color: 'text-yellow-500' },
  { id: 'designing', label: 'Designing', icon: 'Palette', color: 'text-cyan-500' },
  { id: 'other', label: 'Other', icon: 'MoreHorizontal', color: 'text-muted-foreground' },
];

export type PomodoroTheme =
  | 'classic' | 'ocean' | 'forest' | 'sunset'
  | 'lavender' | 'rose' | 'midnight' | 'amber';

export interface PomodoroThemeConfig {
  id: PomodoroTheme;
  label: string;
  ringColor: string;
  bgFrom: string;
  bgTo: string;
}

export const pomodoroThemes: PomodoroThemeConfig[] = [
  { id: 'classic', label: 'Classic', ringColor: 'hsl(var(--primary))', bgFrom: 'from-primary/5', bgTo: 'to-primary/10' },
  { id: 'ocean', label: 'Ocean', ringColor: '#0ea5e9', bgFrom: 'from-sky-500/10', bgTo: 'to-cyan-500/10' },
  { id: 'forest', label: 'Forest', ringColor: '#22c55e', bgFrom: 'from-green-500/10', bgTo: 'to-emerald-500/10' },
  { id: 'sunset', label: 'Sunset', ringColor: '#f97316', bgFrom: 'from-orange-500/10', bgTo: 'to-rose-500/10' },
  { id: 'lavender', label: 'Lavender', ringColor: '#a855f7', bgFrom: 'from-purple-500/10', bgTo: 'to-violet-500/10' },
  { id: 'rose', label: 'Rose', ringColor: '#ec4899', bgFrom: 'from-pink-500/10', bgTo: 'to-rose-500/10' },
  { id: 'midnight', label: 'Midnight', ringColor: '#6366f1', bgFrom: 'from-indigo-500/10', bgTo: 'to-blue-500/10' },
  { id: 'amber', label: 'Amber', ringColor: '#f59e0b', bgFrom: 'from-amber-500/10', bgTo: 'to-yellow-500/10' },
];

export interface PomodoroSettings {
  focusTime: number;
  shortBreak: number;
  longBreak: number;
  cyclesBeforeLongBreak: number;
  autoStartBreaks: boolean;
  autoStartPomodoros: boolean;
  soundEnabled: boolean;
  videoSyncEnabled: boolean;
  theme: PomodoroTheme;
}

export interface PomodoroSession {
  id: string;
  startTime: Date;
  endTime: Date | null;
  duration: number;
  type: 'focus' | 'shortBreak' | 'longBreak';
  completed: boolean;
  activityMode?: ActivityMode;
  customName?: string;
  linkedTaskId?: string;
}

export type TimerState = 'idle' | 'running' | 'paused' | 'break' | 'focusEnded';

// Video Player Types
export interface VideoSource {
  type: 'local' | 'youtube';
  url: string;
  title?: string;
}

// Kanban Types
export interface KanbanColumn {
  id: string;
  title: string;
  color: string;
}

export interface KanbanCard {
  id: string;
  columnId: string;
  title: string;
  description: string;
  labels: Label[];
  priority: 'low' | 'medium' | 'high';
  createdAt: Date;
  dueDate?: Date;
}

export interface Label {
  id: string;
  name: string;
  color: string;
}

// Book Library Types
export interface Book {
  id: string;
  title: string;
  author: string;
  coverUrl: string;
  description: string;
  tags: BookTag[];
  notes: BookNote[];
  content: ContentBlock[];
  links: string[];
  status: 'reading' | 'completed' | 'want-to-read' | 'on-hold';
  progress: number; // 0-100
  addedAt: Date;
  completedAt?: Date;
}


export interface BookTag {
  id: string;
  name: string;
  color: string;
}

export interface BookNote {
  id: string;
  content: string;
  pageNumber?: number;
  createdAt: Date;
}

// Todo Types
export interface Todo {
  id: string;
  content: string;
  completed: boolean;
  createdAt: Date;
  dueDate?: Date;
  priority: 'low' | 'medium' | 'high';
}

// Activity Statistics Types
export interface DailyStats {
  date: string;
  pomodoroSessions: number;
  pomodoroMinutes: number;
  tasksCompleted: number;
  tasksCreated: number;
}

export interface ActivityData {
  dailyStats: DailyStats[];
  totalPomodoroSessions: number;
  totalFocusTime: number; // in minutes
  totalTasksCompleted: number;
  currentStreak: number;
  longestStreak: number;
}

// Motivation Types
export interface Hadith {
  id: string;
  arabic: string;
  english: string;
  narrator: string;
  source: string;
  book: string;
}

export interface QuranVerse {
  id: string;
  surah: string;
  surahNumber: number;
  ayahNumber: number;
  arabic: string;
  english: string;
  transliteration?: string;
}

export interface Quote {
  id: string;
  text: string;
  author: string;
  category: string;
}

export type MotivationContent = Hadith | QuranVerse | Quote;

// Challenge Types
export interface Challenge {
  id: string;
  name: string;
  description: string;
  totalDays: number;
  completedDays: boolean[];
  startDate: Date;
  color: string;
  icon: string;
}

export interface ChallengeProgress {
  challengeId: string;
  completedDays: number;
  percentage: number;
  currentStreak: number;
  longestStreak: number;
}

// App State
export interface AppState {
  theme: Theme;
  user: User | null;
  pomodoroSettings: PomodoroSettings;
  pomodoroHistory: PomodoroSession[];
  videoSource: VideoSource | null;
  kanbanColumns: KanbanColumn[];
  kanbanCards: KanbanCard[];
  books: Book[];
  todos: Todo[];
  challenges: Challenge[];
  activityData: ActivityData;
}

// Pin Types
export interface PinnedItems {
  timer: boolean;
  localVideo: boolean;
  youtubeVideo: boolean;
}

export interface PinnedPositions {
  timer: { x: number; y: number };
  localVideo: { x: number; y: number };
  youtubeVideo: { x: number; y: number };
}

// Book Page Content Blocks (Notion-like)
export type ContentBlockType = 'heading' | 'text' | 'image' | 'link' | 'divider' | 'list';

export interface ContentBlock {
  id: string;
  type: ContentBlockType;
  content: string;
  url?: string;
  meta?: Record<string, string>;
}

// Navigation
export type AppTab = 
  | 'pomodoro' 
  | 'video' 
  | 'kanban' 
  | 'library' 
  | 'todo' 
  | 'stats' 
  | 'motivation' 
  | 'challenges'
  | 'profile';

export interface TabConfig {
  id: AppTab;
  label: string;
  icon: string;
  description: string;
}
