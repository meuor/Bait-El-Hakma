import type {
  PomodoroSession,
  PomodoroSettings,
  KanbanColumn,
  KanbanCard,
  Book,
  BookNote,
  Todo,
  Challenge,
} from '@/types';

const API_BASE = import.meta.env.VITE_API_BASE || '/api';

function getAuthToken(): string | null {
  return localStorage.getItem('bait-el-hakma-token');
}

async function fetchAPI<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options?.headers as Record<string, string>),
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    throw new Error(`API error: ${res.status} ${res.statusText}`);
  }

  return res.json();
}

// Auth API
export interface AuthUser {
  id: string;
  email: string;
  displayName: string;
  avatarUrl: string;
  bio: string;
  createdAt?: string;
}

export interface AuthResponse {
  success: boolean;
  token: string;
  user: AuthUser;
}

export interface UserStats {
  pomodoroSessions: number;
  focusMinutes: number;
  totalBooks: number;
  totalTodos: number;
  completedTodos: number;
  totalChallenges: number;
}

export const authAPI = {
  register: (email: string, password: string, displayName?: string) =>
    fetchAPI<AuthResponse>('/auth?action=register', {
      method: 'POST',
      body: JSON.stringify({ email, password, displayName }),
    }),

  login: (email: string, password: string) =>
    fetchAPI<AuthResponse>('/auth?action=login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  getProfile: () => fetchAPI<AuthUser>('/auth?action=profile'),

  updateProfile: (data: { displayName?: string; avatarUrl?: string; bio?: string }) =>
    fetchAPI<AuthUser>('/auth?action=profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  getStats: () => fetchAPI<UserStats>('/auth?action=stats'),
};

// Pomodoro API
export const pomodoroAPI = {
  getAll: () => fetchAPI<PomodoroSession[]>('/pomodoro'),
  
  create: (session: PomodoroSession) =>
    fetchAPI('/pomodoro', {
      method: 'POST',
      body: JSON.stringify({
        id: session.id,
        startTime: session.startTime instanceof Date ? session.startTime.toISOString() : session.startTime,
        endTime: session.endTime instanceof Date ? session.endTime.toISOString() : session.endTime,
        duration: session.duration,
        type: session.type,
        completed: session.completed,
      }),
    }),

  delete: (id?: string) =>
    fetchAPI(`/pomodoro${id ? `?id=${id}` : ''}`, { method: 'DELETE' }),
};

// Kanban API
export const kanbanAPI = {
  getColumns: () => fetchAPI<KanbanColumn[]>('/kanban?type=columns'),
  
  createColumn: (column: KanbanColumn) =>
    fetchAPI('/kanban?type=columns', {
      method: 'POST',
      body: JSON.stringify(column),
    }),

  updateColumn: (column: KanbanColumn) =>
    fetchAPI('/kanban?type=columns', {
      method: 'PUT',
      body: JSON.stringify(column),
    }),

  deleteColumn: (id: string) =>
    fetchAPI(`/kanban?type=columns&id=${id}`, { method: 'DELETE' }),

  getCards: () => fetchAPI<KanbanCard[]>('/kanban?type=cards'),
  
  createCard: (card: KanbanCard) =>
    fetchAPI('/kanban?type=cards', {
      method: 'POST',
      body: JSON.stringify({
        ...card,
        createdAt: card.createdAt instanceof Date ? card.createdAt.toISOString() : card.createdAt,
        dueDate: card.dueDate instanceof Date ? card.dueDate.toISOString() : card.dueDate,
      }),
    }),

  updateCard: (card: KanbanCard) =>
    fetchAPI('/kanban?type=cards', {
      method: 'PUT',
      body: JSON.stringify({
        ...card,
        createdAt: card.createdAt instanceof Date ? card.createdAt.toISOString() : card.createdAt,
        dueDate: card.dueDate instanceof Date ? card.dueDate.toISOString() : card.dueDate,
      }),
    }),

  deleteCard: (id?: string) =>
    fetchAPI(`/kanban?type=cards${id ? `&id=${id}` : ''}`, { method: 'DELETE' }),
};

// Books API
export const booksAPI = {
  getAll: () => fetchAPI<Book[]>('/books'),
  
  create: (book: Book) =>
    fetchAPI('/books', {
      method: 'POST',
      body: JSON.stringify({
        ...book,
        addedAt: book.addedAt instanceof Date ? book.addedAt.toISOString() : book.addedAt,
        completedAt: book.completedAt instanceof Date ? book.completedAt.toISOString() : book.completedAt,
      }),
    }),

  update: (book: Book) =>
    fetchAPI('/books', {
      method: 'PUT',
      body: JSON.stringify({
        ...book,
        addedAt: book.addedAt instanceof Date ? book.addedAt.toISOString() : book.addedAt,
        completedAt: book.completedAt instanceof Date ? book.completedAt.toISOString() : book.completedAt,
      }),
    }),

  delete: (id?: string) =>
    fetchAPI(`/books${id ? `?id=${id}` : ''}`, { method: 'DELETE' }),

  getNotes: (bookId: string) =>
    fetchAPI<BookNote[]>(`/books?action=notes&bookId=${bookId}`),

  createNote: (note: BookNote & { bookId: string }) =>
    fetchAPI('/books?action=notes', {
      method: 'POST',
      body: JSON.stringify({
        ...note,
        createdAt: note.createdAt instanceof Date ? note.createdAt.toISOString() : note.createdAt,
      }),
    }),

  deleteNote: (id: string) =>
    fetchAPI(`/books?action=notes&id=${id}`, { method: 'DELETE' }),
};

// Todos API
export const todosAPI = {
  getAll: () => fetchAPI<Todo[]>('/todos'),
  
  create: (todo: Todo) =>
    fetchAPI('/todos', {
      method: 'POST',
      body: JSON.stringify({
        ...todo,
        createdAt: todo.createdAt instanceof Date ? todo.createdAt.toISOString() : todo.createdAt,
        dueDate: todo.dueDate instanceof Date ? todo.dueDate.toISOString() : todo.dueDate,
      }),
    }),

  update: (todo: Todo) =>
    fetchAPI('/todos', {
      method: 'PUT',
      body: JSON.stringify({
        ...todo,
        createdAt: todo.createdAt instanceof Date ? todo.createdAt.toISOString() : todo.createdAt,
        dueDate: todo.dueDate instanceof Date ? todo.dueDate.toISOString() : todo.dueDate,
      }),
    }),

  delete: (id?: string) =>
    fetchAPI(`/todos${id ? `?id=${id}` : ''}`, { method: 'DELETE' }),
};

// Challenges API
export const challengesAPI = {
  getAll: () => fetchAPI<Challenge[]>('/challenges'),
  
  create: (challenge: Challenge) =>
    fetchAPI('/challenges', {
      method: 'POST',
      body: JSON.stringify({
        ...challenge,
        startDate: challenge.startDate instanceof Date ? challenge.startDate.toISOString() : challenge.startDate,
      }),
    }),

  update: (challenge: Challenge) =>
    fetchAPI('/challenges', {
      method: 'PUT',
      body: JSON.stringify({
        ...challenge,
        startDate: challenge.startDate instanceof Date ? challenge.startDate.toISOString() : challenge.startDate,
      }),
    }),

  delete: (id?: string) =>
    fetchAPI(`/challenges${id ? `?id=${id}` : ''}`, { method: 'DELETE' }),
};

// Settings API
export const settingsAPI = {
  get: () => fetchAPI<PomodoroSettings>('/settings'),
  
  update: (settings: PomodoroSettings) =>
    fetchAPI('/settings', {
      method: 'PUT',
      body: JSON.stringify(settings),
    }),
};

// Migration API
export const migrateAPI = {
  migrate: (data: {
    pomodoroSessions?: PomodoroSession[];
    kanbanCards?: KanbanCard[];
    books?: Book[];
    todos?: Todo[];
    challenges?: Challenge[];
    settings?: PomodoroSettings;
  }) =>
    fetchAPI('/migrate', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};
