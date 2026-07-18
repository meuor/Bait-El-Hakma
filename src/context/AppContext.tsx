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

const THEME_STORAGE_KEY = 'bait-el-hakma-theme';
const DATA_STORAGE_KEY = 'bait-el-hakma-data';

// Check if API is available
function isAPIAvailable(): boolean {
  return typeof window !== 'undefined' && window.fetch !== undefined;
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Load state from API or localStorage on mount
  useEffect(() => {
    const loadState = async () => {
      dispatch({ type: 'SET_LOADING', payload: true });

      // Load theme from localStorage (theme is UI-only, not synced)
      const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
      if (savedTheme) {
        dispatch({ type: 'SET_THEME', payload: savedTheme as Theme });
      }

      if (!isAPIAvailable()) {
        // Fallback to localStorage if API not available
        loadFromLocalStorage();
        dispatch({ type: 'SET_LOADING', payload: false });
        return;
      }

      try {
        // Load all data from API in parallel
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
          loadedState.pomodoroHistory = sessions.value.map(s => ({
            ...s,
            startTime: new Date(s.startTime),
            endTime: s.endTime ? new Date(s.endTime) : null,
          }));
        }

        if (columns.status === 'fulfilled' && columns.value.length > 0) {
          loadedState.kanbanColumns = columns.value;
        } else {
          loadedState.kanbanColumns = defaultKanbanColumns;
        }

        if (cards.status === 'fulfilled') {
          loadedState.kanbanCards = cards.value.map(c => ({
            ...c,
            createdAt: new Date(c.createdAt),
            dueDate: c.dueDate ? new Date(c.dueDate) : undefined,
          }));
        }

        if (books.status === 'fulfilled') {
          loadedState.books = books.value.map(b => ({
            ...b,
            addedAt: new Date(b.addedAt),
            completedAt: b.completedAt ? new Date(b.completedAt) : undefined,
          }));
        }

        if (todosList.status === 'fulfilled') {
          loadedState.todos = todosList.value.map(t => ({
            ...t,
            createdAt: new Date(t.createdAt),
            dueDate: t.dueDate ? new Date(t.dueDate) : undefined,
          }));
        }

        if (challengesList.status === 'fulfilled') {
          loadedState.challenges = challengesList.value.map(c => ({
            ...c,
            startDate: new Date(c.startDate),
          }));
        }

        if (settings.status === 'fulfilled' && settings.value) {
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

        dispatch({ type: 'LOAD_STATE', payload: loadedState });
      } catch (error) {
        console.error('Error loading from API, falling back to localStorage:', error);
        loadFromLocalStorage();
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };

    const loadFromLocalStorage = () => {
      const stored = localStorage.getItem(DATA_STORAGE_KEY);
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

  // API-backed dispatch wrapper
  const apiDispatch = useCallback(async (action: Action) => {
    // First, update local state immediately
    dispatch(action);

    // Then, sync to API in the background
    if (!isAPIAvailable()) return;

    try {
      switch (action.type) {
        case 'SET_POMODORO_SETTINGS':
          await settingsAPI.update(action.payload);
          break;
        case 'ADD_POMODORO_SESSION':
          await pomodoroAPI.create(action.payload);
          break;
        case 'SET_KANBAN_COLUMNS':
          // We don't sync column changes individually yet
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
    } catch (error) {
      console.error('API sync error:', error);
      // Local state is already updated, so the app still works
      // Data will be synced on next load
    }
  }, []);

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
