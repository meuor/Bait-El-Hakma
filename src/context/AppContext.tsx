import React, { createContext, useContext, useReducer, useEffect } from 'react';
import type { 
  Theme, 
  User, 
  PomodoroSettings, 
  PomodoroSession,
  VideoSource,
  KanbanColumn,
  KanbanCard,
  Book,
  BookNote,
  Todo,
  Challenge,
  ActivityData,
  AppTab
} from '@/types';

// App State Interface
interface State {
  theme: Theme;
  user: User | null;
  isAuthenticated: boolean;
  currentTab: AppTab;
  pomodoroSettings: PomodoroSettings;
  pomodoroHistory: PomodoroSession[];
  videoSource: VideoSource | null;
  kanbanColumns: KanbanColumn[];
  kanbanCards: KanbanCard[];
  books: Book[];
  todos: Todo[];
  challenges: Challenge[];
  activityData: ActivityData;
  isLoading: boolean;
}

// Action Types
type Action =
  | { type: 'SET_THEME'; payload: Theme }
  | { type: 'SET_USER'; payload: User | null }
  | { type: 'SET_AUTH'; payload: boolean }
  | { type: 'SET_TAB'; payload: AppTab }
  | { type: 'SET_POMODORO_SETTINGS'; payload: PomodoroSettings }
  | { type: 'ADD_POMODORO_SESSION'; payload: PomodoroSession }
  | { type: 'SET_VIDEO_SOURCE'; payload: VideoSource | null }
  | { type: 'SET_KANBAN_COLUMNS'; payload: KanbanColumn[] }
  | { type: 'SET_KANBAN_CARDS'; payload: KanbanCard[] }
  | { type: 'ADD_KANBAN_CARD'; payload: KanbanCard }
  | { type: 'UPDATE_KANBAN_CARD'; payload: KanbanCard }
  | { type: 'DELETE_KANBAN_CARD'; payload: string }
  | { type: 'SET_BOOKS'; payload: Book[] }
  | { type: 'ADD_BOOK'; payload: Book }
  | { type: 'UPDATE_BOOK'; payload: Book }
  | { type: 'DELETE_BOOK'; payload: string }
  | { type: 'SET_TODOS'; payload: Todo[] }
  | { type: 'ADD_TODO'; payload: Todo }
  | { type: 'UPDATE_TODO'; payload: Todo }
  | { type: 'DELETE_TODO'; payload: string }
  | { type: 'SET_CHALLENGES'; payload: Challenge[] }
  | { type: 'ADD_CHALLENGE'; payload: Challenge }
  | { type: 'UPDATE_CHALLENGE'; payload: Challenge }
  | { type: 'DELETE_CHALLENGE'; payload: string }
  | { type: 'SET_ACTIVITY_DATA'; payload: ActivityData }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'LOAD_STATE'; payload: Partial<State> };

// Default Pomodoro Settings
const defaultPomodoroSettings: PomodoroSettings = {
  focusTime: 25,
  shortBreak: 5,
  longBreak: 15,
  cyclesBeforeLongBreak: 4,
  autoStartBreaks: false,
  autoStartPomodoros: false,
  soundEnabled: true,
};

// Default Kanban Columns
const defaultKanbanColumns: KanbanColumn[] = [
  { id: 'ideas', title: 'Ideas', color: '#8b5cf6' },
  { id: 'future', title: 'Future Plans', color: '#3b82f6' },
  { id: 'doing', title: 'Doing', color: '#f59e0b' },
  { id: 'done', title: 'Done', color: '#10b981' },
];

// Default Activity Data
const defaultActivityData: ActivityData = {
  dailyStats: [],
  totalPomodoroSessions: 0,
  totalFocusTime: 0,
  totalTasksCompleted: 0,
  currentStreak: 0,
  longestStreak: 0,
};

// Initial State
const initialState: State = {
  theme: 'light',
  user: null,
  isAuthenticated: false,
  currentTab: 'pomodoro',
  pomodoroSettings: defaultPomodoroSettings,
  pomodoroHistory: [],
  videoSource: null,
  kanbanColumns: defaultKanbanColumns,
  kanbanCards: [],
  books: [],
  todos: [],
  challenges: [],
  activityData: defaultActivityData,
  isLoading: false,
};

// Reducer
function appReducer(state: State, action: Action): State {
  switch (action.type) {
    case 'SET_THEME':
      return { ...state, theme: action.payload };
    case 'SET_USER':
      return { ...state, user: action.payload };
    case 'SET_AUTH':
      return { ...state, isAuthenticated: action.payload };
    case 'SET_TAB':
      return { ...state, currentTab: action.payload };
    case 'SET_POMODORO_SETTINGS':
      return { ...state, pomodoroSettings: action.payload };
    case 'ADD_POMODORO_SESSION':
      return { 
        ...state, 
        pomodoroHistory: [...state.pomodoroHistory, action.payload] 
      };
    case 'SET_VIDEO_SOURCE':
      return { ...state, videoSource: action.payload };
    case 'SET_KANBAN_COLUMNS':
      return { ...state, kanbanColumns: action.payload };
    case 'SET_KANBAN_CARDS':
      return { ...state, kanbanCards: action.payload };
    case 'ADD_KANBAN_CARD':
      return { 
        ...state, 
        kanbanCards: [...state.kanbanCards, action.payload] 
      };
    case 'UPDATE_KANBAN_CARD':
      return {
        ...state,
        kanbanCards: state.kanbanCards.map(card =>
          card.id === action.payload.id ? action.payload : card
        ),
      };
    case 'DELETE_KANBAN_CARD':
      return {
        ...state,
        kanbanCards: state.kanbanCards.filter(card => card.id !== action.payload),
      };
    case 'SET_BOOKS':
      return { ...state, books: action.payload };
    case 'ADD_BOOK':
      return { ...state, books: [...state.books, action.payload] };
    case 'UPDATE_BOOK':
      return {
        ...state,
        books: state.books.map(book =>
          book.id === action.payload.id ? action.payload : book
        ),
      };
    case 'DELETE_BOOK':
      return {
        ...state,
        books: state.books.filter(book => book.id !== action.payload),
      };
    case 'SET_TODOS':
      return { ...state, todos: action.payload };
    case 'ADD_TODO':
      return { ...state, todos: [...state.todos, action.payload] };
    case 'UPDATE_TODO':
      return {
        ...state,
        todos: state.todos.map(todo =>
          todo.id === action.payload.id ? action.payload : todo
        ),
      };
    case 'DELETE_TODO':
      return {
        ...state,
        todos: state.todos.filter(todo => todo.id !== action.payload),
      };
    case 'SET_CHALLENGES':
      return { ...state, challenges: action.payload };
    case 'ADD_CHALLENGE':
      return { ...state, challenges: [...state.challenges, action.payload] };
    case 'UPDATE_CHALLENGE':
      return {
        ...state,
        challenges: state.challenges.map(challenge =>
          challenge.id === action.payload.id ? action.payload : challenge
        ),
      };
    case 'DELETE_CHALLENGE':
      return {
        ...state,
        challenges: state.challenges.filter(challenge => challenge.id !== action.payload),
      };
    case 'SET_ACTIVITY_DATA':
      return { ...state, activityData: action.payload };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'LOAD_STATE':
      return { ...state, ...action.payload };
    default:
      return state;
  }
}

// Context
interface AppContextType {
  state: State;
  dispatch: React.Dispatch<Action>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEY = 'bait-el-hakma-data';

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Load state from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        // Convert date strings back to Date objects
        if (parsed.pomodoroHistory) {
          parsed.pomodoroHistory = parsed.pomodoroHistory.map((session: PomodoroSession) => ({
            ...session,
            startTime: new Date(session.startTime),
            endTime: session.endTime ? new Date(session.endTime) : null,
          }));
        }
        if (parsed.kanbanCards) {
          parsed.kanbanCards = parsed.kanbanCards.map((card: KanbanCard) => ({
            ...card,
            createdAt: new Date(card.createdAt),
            dueDate: card.dueDate ? new Date(card.dueDate) : undefined,
          }));
        }
        if (parsed.books) {
          parsed.books = parsed.books.map((book: Book) => ({
            ...book,
            addedAt: new Date(book.addedAt),
            completedAt: book.completedAt ? new Date(book.completedAt) : undefined,
            notes: book.notes?.map((note: BookNote) => ({
              ...note,
              createdAt: new Date(note.createdAt),
            })),
          }));
        }
        if (parsed.todos) {
          parsed.todos = parsed.todos.map((todo: Todo) => ({
            ...todo,
            createdAt: new Date(todo.createdAt),
            dueDate: todo.dueDate ? new Date(todo.dueDate) : undefined,
          }));
        }
        if (parsed.challenges) {
          parsed.challenges = parsed.challenges.map((challenge: Challenge) => ({
            ...challenge,
            startDate: new Date(challenge.startDate),
          }));
        }
        dispatch({ type: 'LOAD_STATE', payload: parsed });
      } catch (error) {
        console.error('Error loading state:', error);
      }
    }
  }, []);

  // Save state to localStorage on changes
  useEffect(() => {
    const dataToSave = {
      pomodoroSettings: state.pomodoroSettings,
      pomodoroHistory: state.pomodoroHistory,
      videoSource: state.videoSource,
      kanbanColumns: state.kanbanColumns,
      kanbanCards: state.kanbanCards,
      books: state.books,
      todos: state.todos,
      challenges: state.challenges,
      activityData: state.activityData,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
  }, [
    state.pomodoroSettings,
    state.pomodoroHistory,
    state.videoSource,
    state.kanbanColumns,
    state.kanbanCards,
    state.books,
    state.todos,
    state.challenges,
    state.activityData,
  ]);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
