import React, { createContext, useContext, useReducer, useEffect, useCallback, useRef } from 'react';
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
import { 
  pomodoroAPI, 
  kanbanAPI, 
  booksAPI,
  todosAPI, 
  challengesAPI, 
  settingsAPI 
} from '@/lib/api';

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
  apiStatus: 'checking' | 'online' | 'offline';
  syncErrors: string[];
  dataSource: 'api' | 'local';
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
  | { type: 'ADD_SYNC_ERROR'; payload: string }
  | { type: 'CLEAR_SYNC_ERRORS' }
  | { type: 'SET_DATA_SOURCE'; payload: 'api' | 'local' }
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
  apiStatus: 'checking',
  syncErrors: [],
  dataSource: 'local',
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
    case 'ADD_SYNC_ERROR':
      return { ...state, syncErrors: [...state.syncErrors.slice(-4), action.payload] };
    case 'CLEAR_SYNC_ERRORS':
      return { ...state, syncErrors: [] };
    case 'SET_DATA_SOURCE':
      return { ...state, dataSource: action.payload };
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

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);
  const syncErrorsRef = useRef<string[]>([]);
  const failedQueueRef = useRef<Array<{ action: Action; retries: number }>>([]);
  const isRetryingRef = useRef(false);

  // Process retry queue
  const processRetryQueue = useCallback(async () => {
    if (isRetryingRef.current || failedQueueRef.current.length === 0) return;
    isRetryingRef.current = true;

    const queue = [...failedQueueRef.current];
    failedQueueRef.current = [];

    for (const item of queue) {
      try {
        await syncActionToAPI(item.action);
        dispatch({ type: 'CLEAR_SYNC_ERRORS' });
      } catch {
        if (item.retries < 2) {
          failedQueueRef.current.push({ action: item.action, retries: item.retries + 1 });
        } else {
          const errorMsg = `Failed to sync ${item.action.type.replace(/_/g, ' ').toLowerCase()}`;
          if (!syncErrorsRef.current.includes(errorMsg)) {
            syncErrorsRef.current.push(errorMsg);
            dispatch({ type: 'ADD_SYNC_ERROR', payload: errorMsg });
          }
        }
      }
    }

    isRetryingRef.current = false;

    if (failedQueueRef.current.length > 0) {
      setTimeout(processRetryQueue, 10000);
    }
  }, []);

  // Load state from API or localStorage on mount
  useEffect(() => {
    const loadState = async () => {
      dispatch({ type: 'SET_LOADING', payload: true });

      const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
      if (savedTheme) {
        dispatch({ type: 'SET_THEME', payload: savedTheme as Theme });
      }

      const token = getToken();

      if (!isAPIAvailable() || !token) {
        if (!token) {
          dispatch({ type: 'SET_API_STATUS', payload: 'offline' });
        }
        loadFromLocalStorage();
        dispatch({ type: 'SET_LOADING', payload: false });
        return;
      }

      dispatch({ type: 'SET_API_STATUS', payload: 'checking' });

      try {
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
        let anySuccess = false;

        if (sessions.status === 'fulfilled') {
          anySuccess = true;
          loadedState.pomodoroHistory = sessions.value.map(s => ({
            ...s,
            startTime: new Date(s.startTime),
            endTime: s.endTime ? new Date(s.endTime) : null,
          }));
        }

        if (columns.status === 'fulfilled' && columns.value.length > 0) {
          anySuccess = true;
          loadedState.kanbanColumns = columns.value;
        } else {
          loadedState.kanbanColumns = defaultKanbanColumns;
        }

        if (cards.status === 'fulfilled') {
          anySuccess = true;
          loadedState.kanbanCards = cards.value.map(c => ({
            ...c,
            createdAt: new Date(c.createdAt),
            dueDate: c.dueDate ? new Date(c.dueDate) : undefined,
          }));
        }

        if (books.status === 'fulfilled') {
          anySuccess = true;
          loadedState.books = books.value.map(b => ({
            ...b,
            addedAt: new Date(b.addedAt),
            completedAt: b.completedAt ? new Date(b.completedAt) : undefined,
          }));
        }

        if (todosList.status === 'fulfilled') {
          anySuccess = true;
          loadedState.todos = todosList.value.map(t => ({
            ...t,
            createdAt: new Date(t.createdAt),
            dueDate: t.dueDate ? new Date(t.dueDate) : undefined,
          }));
        }

        if (challengesList.status === 'fulfilled') {
          anySuccess = true;
          loadedState.challenges = challengesList.value.map(c => ({
            ...c,
            startDate: new Date(c.startDate),
          }));
        }

        if (settings.status === 'fulfilled' && settings.value) {
          anySuccess = true;
          loadedState.pomodoroSettings = {
            focusTime: settings.value.focusTime,
            shortBreak: settings.value.shortBreak,
            longBreak: settings.value.longBreak,
            cyclesBeforeLongBreak: settings.value.cyclesBeforeLongBreak,
            autoStartBreaks: settings.value.autoStartBreaks,
            autoStartPomodoros: settings.value.autoStartPomodoros,
            soundEnabled: settings.value.soundEnabled,
          };
        }

        if (anySuccess) {
          dispatch({ type: 'SET_API_STATUS', payload: 'online' });
          dispatch({ type: 'SET_DATA_SOURCE', payload: 'api' });
        } else {
          dispatch({ type: 'SET_API_STATUS', payload: 'offline' });
          loadFromLocalStorage();
          dispatch({ type: 'SET_DATA_SOURCE', payload: 'local' });
        }

        dispatch({ type: 'LOAD_STATE', payload: loadedState });
      } catch (error) {
        console.error('Error loading from API, falling back to localStorage:', error);
        dispatch({ type: 'SET_API_STATUS', payload: 'offline' });
        loadFromLocalStorage();
        dispatch({ type: 'SET_DATA_SOURCE', payload: 'local' });
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
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

  // API-backed dispatch wrapper
  const apiDispatch = useCallback(async (action: Action) => {
    // Always update local state immediately
    dispatch(action);

    // Only sync API-relevant actions
    if (!API_SYNC_ACTIONS.has(action.type)) return;
    if (!isAPIAvailable() || !getToken()) return;

    try {
      await syncActionToAPI(action);
      dispatch({ type: 'SET_API_STATUS', payload: 'online' });
      dispatch({ type: 'SET_DATA_SOURCE', payload: 'api' });
    } catch (error) {
      console.error('API sync error:', error);
      const errorMsg = `Failed to save ${action.type.replace(/_/g, ' ').toLowerCase()}`;
      dispatch({ type: 'ADD_SYNC_ERROR', payload: errorMsg });
      dispatch({ type: 'SET_API_STATUS', payload: 'offline' });

      // Queue for retry
      failedQueueRef.current.push({ action, retries: 0 });
      setTimeout(processRetryQueue, 5000);
    }
  }, [syncActionToAPI, processRetryQueue]);

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
