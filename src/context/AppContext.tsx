import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
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
  AppTab,
  PinnedItems
} from '@/types';
import { 
  pomodoroAPI, 
  kanbanAPI, 
  booksAPI,
  todosAPI, 
  challengesAPI, 
  settingsAPI
} from '@/lib/api';
import { syncManager } from '@/lib/SyncManager';

// App State Interface
interface TimerDisplay {
  isRunning: boolean;
  timeLeft: number;
  totalTime: number;
  sessionType: 'focus' | 'shortBreak' | 'longBreak';
}

interface ActiveVideo {
  url: string;
  title: string;
}

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
  apiStatus: 'checking' | 'online' | 'offline';
  syncErrors: string[];
  lastApiError: string | null;
  dataSource: 'api' | 'local';
  timerDisplay: TimerDisplay | null;
  activeVideo: ActiveVideo | null;
  pinnedItems: PinnedItems;
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
  | { type: 'SET_API_STATUS'; payload: 'checking' | 'online' | 'offline' }
  | { type: 'SET_API_ERROR'; payload: string | null }
  | { type: 'ADD_SYNC_ERROR'; payload: string }
  | { type: 'CLEAR_SYNC_ERRORS' }
  | { type: 'SET_DATA_SOURCE'; payload: 'api' | 'local' }
  | { type: 'SET_TIMER_DISPLAY'; payload: TimerDisplay | null }
  | { type: 'SET_ACTIVE_VIDEO'; payload: ActiveVideo | null }
  | { type: 'TOGGLE_PIN'; payload: keyof PinnedItems }
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
  videoSyncEnabled: false,
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
  apiStatus: 'checking',
  syncErrors: [],
  lastApiError: null,
  dataSource: 'local',
  timerDisplay: null,
  activeVideo: null,
  pinnedItems: { timer: false, localVideo: false, youtubeVideo: false },
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
    case 'SET_API_STATUS':
      return { ...state, apiStatus: action.payload };
    case 'SET_API_ERROR':
      return { ...state, lastApiError: action.payload };
    case 'ADD_SYNC_ERROR':
      return { ...state, syncErrors: [...state.syncErrors.slice(-4), action.payload] };
    case 'CLEAR_SYNC_ERRORS':
      return { ...state, syncErrors: [] };
    case 'SET_DATA_SOURCE':
      return { ...state, dataSource: action.payload };
    case 'SET_TIMER_DISPLAY':
      return { ...state, timerDisplay: action.payload };
    case 'SET_ACTIVE_VIDEO':
      return { ...state, activeVideo: action.payload };
    case 'TOGGLE_PIN':
      return {
        ...state,
        pinnedItems: {
          ...state.pinnedItems,
          [action.payload]: !state.pinnedItems[action.payload],
        },
      };
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

const THEME_STORAGE_KEY = 'bait-el-hakma-theme';
const DATA_STORAGE_KEY = 'bait-el-hakma-data';
const TOKEN_KEY = 'bait-el-hakma-token';

function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

function isAPIAvailable(): boolean {
  return typeof window !== 'undefined' && window.fetch !== undefined;
}

// Actions that should sync to API
const API_SYNC_ACTIONS = new Set([
  'SET_POMODORO_SETTINGS',
  'ADD_POMODORO_SESSION',
  'ADD_KANBAN_CARD',
  'UPDATE_KANBAN_CARD',
  'DELETE_KANBAN_CARD',
  'SET_KANBAN_COLUMNS',
  'ADD_BOOK',
  'UPDATE_BOOK',
  'DELETE_BOOK',
  'ADD_TODO',
  'UPDATE_TODO',
  'DELETE_TODO',
  'ADD_CHALLENGE',
  'UPDATE_CHALLENGE',
  'DELETE_CHALLENGE',
]);

function getSyncKey(action: Action): string | null {
  switch (action.type) {
    case 'SET_POMODORO_SETTINGS': return 'settings';
    case 'ADD_POMODORO_SESSION': return `pomodoro:${action.payload.id}`;
    case 'SET_KANBAN_COLUMNS': return 'kanban:columns';
    case 'ADD_KANBAN_CARD': return `kanban:card:${action.payload.id}`;
    case 'UPDATE_KANBAN_CARD': return `kanban:card:${action.payload.id}`;
    case 'DELETE_KANBAN_CARD': return `kanban:card:del:${action.payload}`;
    case 'ADD_BOOK': return `book:${action.payload.id}`;
    case 'UPDATE_BOOK': return `book:${action.payload.id}`;
    case 'DELETE_BOOK': return `book:del:${action.payload}`;
    case 'ADD_TODO': return `todo:${action.payload.id}`;
    case 'UPDATE_TODO': return `todo:${action.payload.id}`;
    case 'DELETE_TODO': return `todo:del:${action.payload}`;
    case 'ADD_CHALLENGE': return `challenge:${action.payload.id}`;
    case 'UPDATE_CHALLENGE': return `challenge:${action.payload.id}`;
    case 'DELETE_CHALLENGE': return `challenge:del:${action.payload}`;
    default: return null;
  }
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Start the periodic sync timer on mount
  useEffect(() => {
    syncManager.start();
    return () => syncManager.stop();
  }, []);

  // Load state from API or localStorage on mount
  useEffect(() => {
    const loadState = async () => {
      dispatch({ type: 'SET_LOADING', payload: true });

      const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
      if (savedTheme) {
        dispatch({ type: 'SET_THEME', payload: savedTheme as Theme });
      }

      if (!isAPIAvailable()) {
        loadFromLocalStorage();
        dispatch({ type: 'SET_LOADING', payload: false });
        return;
      }

      // Step 1: Check if API is reachable at all
      dispatch({ type: 'SET_API_STATUS', payload: 'checking' });
      let apiReachable = false;
      try {
        const check = await fetch('/api/migrate', { method: 'GET' });
        apiReachable = check.ok;
      } catch {
        apiReachable = false;
      }

      if (!apiReachable) {
        // API is completely unreachable (e.g. running locally)
        dispatch({ type: 'SET_API_STATUS', payload: 'offline' });
        loadFromLocalStorage();
        dispatch({ type: 'SET_LOADING', payload: false });
        return;
      }

      // Step 2: API is reachable. Check if tables exist by testing a simple query
      const token = getToken();
      if (token) {
        dispatch({ type: 'SET_API_STATUS', payload: 'checking' });
        try {
          // Test if the data tables work with this token
          const testResp = await fetch('/api/todos', {
            headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
          });

          if (testResp.ok) {
            // Tables work — load data normally
            await loadAllDataFromAPI();
            dispatch({ type: 'SET_API_STATUS', payload: 'online' });
            dispatch({ type: 'SET_DATA_SOURCE', payload: 'api' });
          } else {
            // API returned error — try to migrate tables (safe migration)
            console.log('Data API failed, attempting safe migration...');
            try {
              const migResp = await fetch('/api/migrate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
              });

              if (migResp.ok) {
                console.log('Migration complete, retrying data load...');
                // Retry loading after migration
                await loadAllDataFromAPI();
                dispatch({ type: 'SET_API_STATUS', payload: 'online' });
                dispatch({ type: 'SET_DATA_SOURCE', payload: 'api' });
                dispatch({ type: 'SET_API_ERROR', payload: null });
              } else {
                console.error('Migration failed');
                dispatch({ type: 'SET_API_STATUS', payload: 'offline' });
                loadFromLocalStorage();
              }
            } catch {
              dispatch({ type: 'SET_API_STATUS', payload: 'offline' });
              loadFromLocalStorage();
            }
          }
        } catch (err) {
          console.error('API check failed:', err);
          dispatch({ type: 'SET_API_STATUS', payload: 'offline' });
          loadFromLocalStorage();
        }
      } else {
        // No token — check if tables exist anyway (for first-time setup)
        try {
          const testResp = await fetch('/api/migrate');
          if (testResp.ok) {
            dispatch({ type: 'SET_API_STATUS', payload: 'online' });
          } else {
            // Try to create tables
            const migResp = await fetch('/api/migrate', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
            });
            if (migResp.ok) {
              dispatch({ type: 'SET_API_STATUS', payload: 'online' });
            }
          }
        } catch {
          dispatch({ type: 'SET_API_STATUS', payload: 'offline' });
        }
        loadFromLocalStorage();
      }

      dispatch({ type: 'SET_LOADING', payload: false });
    };

    const loadAllDataFromAPI = async () => {
      const [sessions, columns, cards, books, todosList, challengesList, settings] = await Promise.allSettled([
        pomodoroAPI.getAll(),
        kanbanAPI.getColumns(),
        kanbanAPI.getCards(),
        booksAPI.getAll(),
        todosAPI.getAll(),
        challengesAPI.getAll(),
        settingsAPI.get(),
      ]);

      const loadedState: Partial<State> = {};

      if (sessions.status === 'fulfilled') {
        loadedState.pomodoroHistory = sessions.value.map((s: any) => ({
          id: s.id,
          startTime: new Date(s.start_time || s.startTime),
          endTime: s.end_time || s.endTime ? new Date(s.end_time || s.endTime) : null,
          duration: s.duration,
          type: s.type,
          completed: s.completed,
        }));
      }

      if (columns.status === 'fulfilled' && columns.value.length > 0) {
        loadedState.kanbanColumns = (columns.value as any[]).map(c => ({
          id: c.id,
          title: c.title,
          color: c.color,
        }));
      } else {
        loadedState.kanbanColumns = defaultKanbanColumns;
      }

      if (cards.status === 'fulfilled') {
        loadedState.kanbanCards = (cards.value as any[]).map(c => ({
          id: c.id,
          columnId: c.column_id || c.columnId,
          title: c.title,
          description: c.description || '',
          labels: typeof c.labels === 'string' ? JSON.parse(c.labels) : (c.labels || []),
          priority: c.priority,
          createdAt: new Date(c.created_at || c.createdAt),
          dueDate: c.due_date || c.dueDate ? new Date(c.due_date || c.dueDate) : undefined,
        }));
      }

      if (books.status === 'fulfilled') {
        loadedState.books = (books.value as any[]).map(b => ({
          id: b.id,
          title: b.title,
          author: b.author,
          coverUrl: b.cover_url || b.coverUrl || '',
          description: b.description || '',
          tags: typeof b.tags === 'string' ? JSON.parse(b.tags) : (b.tags || []),
          notes: [],
          status: b.status,
          progress: b.progress || 0,
          addedAt: new Date(b.added_at || b.addedAt),
          completedAt: b.completed_at || b.completedAt ? new Date(b.completed_at || b.completedAt) : undefined,
        }));
      }

      if (todosList.status === 'fulfilled') {
        loadedState.todos = (todosList.value as any[]).map(t => ({
          id: t.id,
          content: t.content,
          completed: t.completed,
          createdAt: new Date(t.created_at || t.createdAt),
          dueDate: t.due_date || t.dueDate ? new Date(t.due_date || t.dueDate) : undefined,
          priority: t.priority,
        }));
      }

      if (challengesList.status === 'fulfilled') {
        loadedState.challenges = (challengesList.value as any[]).map(c => ({
          id: c.id,
          name: c.name,
          description: c.description || '',
          totalDays: c.total_days || c.totalDays,
          completedDays: typeof c.completed_days === 'string' ? JSON.parse(c.completed_days) : (c.completed_days || []),
          startDate: new Date(c.start_date || c.startDate),
          color: c.color,
          icon: c.icon,
        }));
      }

      if (settings.status === 'fulfilled' && settings.value) {
        const sv = settings.value as any;
        loadedState.pomodoroSettings = {
          focusTime: sv.focus_time || sv.focusTime || 25,
          shortBreak: sv.short_break || sv.shortBreak || 5,
          longBreak: sv.long_break || sv.longBreak || 15,
          cyclesBeforeLongBreak: sv.cycles_before_long_break || sv.cyclesBeforeLongBreak || 4,
          autoStartBreaks: sv.auto_start_breaks || sv.autoStartBreaks || false,
          autoStartPomodoros: sv.auto_start_pomodoros || sv.autoStartPomodoros || false,
          soundEnabled: sv.sound_enabled !== undefined ? sv.sound_enabled : (sv.soundEnabled !== undefined ? sv.soundEnabled : true),
          videoSyncEnabled: sv.video_sync_enabled !== undefined ? sv.video_sync_enabled : (sv.videoSyncEnabled !== undefined ? sv.videoSyncEnabled : false),
        };
      }

      dispatch({ type: 'LOAD_STATE', payload: loadedState });

      // Persist cloud data to localStorage so account switching properly overwrites stale cache
      try {
        const dataToSave = {
          pomodoroSettings: loadedState.pomodoroSettings,
          pomodoroHistory: loadedState.pomodoroHistory,
          videoSource: null,
          kanbanColumns: loadedState.kanbanColumns,
          kanbanCards: loadedState.kanbanCards,
          books: loadedState.books,
          todos: loadedState.todos,
          challenges: loadedState.challenges,
          activityData: state.activityData,
          pinnedItems: state.pinnedItems,
        };
        localStorage.setItem(DATA_STORAGE_KEY, JSON.stringify(dataToSave));
      } catch { /* ignore storage errors */ }
    };

    const loadFromLocalStorage = () => {
      const stored = localStorage.getItem(DATA_STORAGE_KEY);
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
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
          console.error('Error loading state from localStorage:', error);
        }
      }
    };

    loadState();
  }, []);

  // Save theme to localStorage on changes
  useEffect(() => {
    localStorage.setItem(THEME_STORAGE_KEY, state.theme);
  }, [state.theme]);

  // Save data to localStorage as backup (for offline support)
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
      pinnedItems: state.pinnedItems,
    };
    localStorage.setItem(DATA_STORAGE_KEY, JSON.stringify(dataToSave));
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
    state.pinnedItems,
  ]);

  // Sync a single action to the API
  const syncActionToAPI = useCallback(async (action: Action) => {
    if (!isAPIAvailable() || !getToken()) return;

    switch (action.type) {
      case 'SET_POMODORO_SETTINGS':
        await settingsAPI.update(action.payload);
        break;
      case 'ADD_POMODORO_SESSION':
        await pomodoroAPI.create(action.payload);
        break;
      case 'SET_KANBAN_COLUMNS':
        for (const col of action.payload) {
          await kanbanAPI.createColumn(col);
        }
        break;
      case 'ADD_KANBAN_CARD':
        await kanbanAPI.createCard(action.payload);
        break;
      case 'UPDATE_KANBAN_CARD':
        await kanbanAPI.updateCard(action.payload);
        break;
      case 'DELETE_KANBAN_CARD':
        await kanbanAPI.deleteCard(action.payload);
        break;
      case 'ADD_BOOK':
        await booksAPI.create(action.payload);
        break;
      case 'UPDATE_BOOK':
        await booksAPI.update(action.payload);
        break;
      case 'DELETE_BOOK':
        await booksAPI.delete(action.payload);
        break;
      case 'ADD_TODO':
        await todosAPI.create(action.payload);
        break;
      case 'UPDATE_TODO':
        await todosAPI.update(action.payload);
        break;
      case 'DELETE_TODO':
        await todosAPI.delete(action.payload);
        break;
      case 'ADD_CHALLENGE':
        await challengesAPI.create(action.payload);
        break;
      case 'UPDATE_CHALLENGE':
        await challengesAPI.update(action.payload);
        break;
      case 'DELETE_CHALLENGE':
        await challengesAPI.delete(action.payload);
        break;
    }
  }, []);

  // Dispatch that enqueues sync actions to the periodic SyncManager
  const apiDispatch = useCallback((action: Action) => {
    dispatch(action);

    if (!API_SYNC_ACTIONS.has(action.type)) return;
    if (!isAPIAvailable() || !getToken()) return;

    const key = getSyncKey(action);
    if (!key) return;

    syncManager.enqueue(key, () => syncActionToAPI(action));
  }, [syncActionToAPI]);

  return (
    <AppContext.Provider value={{ state, dispatch: apiDispatch as React.Dispatch<Action> }}>
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
