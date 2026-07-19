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
export interface PomodoroSettings {
  focusTime: number; // in minutes
  shortBreak: number; // in minutes
  longBreak: number; // in minutes
  cyclesBeforeLongBreak: number;
  autoStartBreaks: boolean;
  autoStartPomodoros: boolean;
  soundEnabled: boolean;
}

export interface PomodoroSession {
  id: string;
  startTime: Date;
  endTime: Date | null;
  duration: number; // in minutes
  type: 'focus' | 'shortBreak' | 'longBreak';
  completed: boolean;
}

export type TimerState = 'idle' | 'running' | 'paused' | 'break';

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
