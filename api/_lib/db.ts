import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

let schemaEnsured = false;

export async function ensureSchema() {
  if (schemaEnsured) return;
  try {
    await sql`CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      display_name TEXT NOT NULL DEFAULT 'User',
      avatar_url TEXT DEFAULT '',
      bio TEXT DEFAULT '',
      username TEXT UNIQUE,
      username_changed_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    )`;

    await sql`CREATE TABLE IF NOT EXISTS pomodoro_sessions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      start_time TIMESTAMPTZ NOT NULL,
      end_time TIMESTAMPTZ,
      duration INTEGER NOT NULL,
      type TEXT NOT NULL,
      completed BOOLEAN NOT NULL DEFAULT false,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )`;

    await sql`CREATE TABLE IF NOT EXISTS kanban_columns (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      color TEXT NOT NULL,
      sort_order INTEGER DEFAULT 0
    )`;

    await sql`CREATE TABLE IF NOT EXISTS kanban_cards (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      column_id TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT DEFAULT '',
      labels JSONB DEFAULT '[]',
      priority TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL,
      due_date TIMESTAMPTZ
    )`;

    await sql`CREATE TABLE IF NOT EXISTS books (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      author TEXT NOT NULL,
      cover_url TEXT DEFAULT '',
      description TEXT DEFAULT '',
      tags JSONB DEFAULT '[]',
      status TEXT NOT NULL,
      progress INTEGER DEFAULT 0,
      added_at TIMESTAMPTZ NOT NULL,
      completed_at TIMESTAMPTZ
    )`;

    await sql`CREATE TABLE IF NOT EXISTS book_notes (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      book_id TEXT NOT NULL,
      content TEXT NOT NULL,
      page_number INTEGER,
      created_at TIMESTAMPTZ NOT NULL
    )`;

    await sql`CREATE TABLE IF NOT EXISTS todos (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      content TEXT NOT NULL,
      completed BOOLEAN NOT NULL DEFAULT false,
      created_at TIMESTAMPTZ NOT NULL,
      due_date TIMESTAMPTZ,
      priority TEXT NOT NULL
    )`;

    await sql`CREATE TABLE IF NOT EXISTS challenges (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      description TEXT DEFAULT '',
      total_days INTEGER NOT NULL,
      completed_days JSONB DEFAULT '[]',
      start_date TIMESTAMPTZ NOT NULL,
      color TEXT NOT NULL,
      icon TEXT NOT NULL
    )`;

    await sql`CREATE TABLE IF NOT EXISTS pomodoro_settings (
      user_id TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
      focus_time INTEGER DEFAULT 25,
      short_break INTEGER DEFAULT 5,
      long_break INTEGER DEFAULT 15,
      cycles_before_long_break INTEGER DEFAULT 4,
      auto_start_breaks BOOLEAN DEFAULT false,
      auto_start_pomodoros BOOLEAN DEFAULT false,
      sound_enabled BOOLEAN DEFAULT true,
      updated_at TIMESTAMPTZ DEFAULT NOW()
    )`;

    await sql`CREATE TABLE IF NOT EXISTS password_resets (
      id TEXT PRIMARY KEY,
      email TEXT NOT NULL,
      code TEXT NOT NULL,
      expires_at TIMESTAMPTZ NOT NULL,
      used BOOLEAN DEFAULT false,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )`;

    await sql`CREATE TABLE IF NOT EXISTS quran_progress (
      user_id TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
      bookmarks JSONB DEFAULT '{}',
      completed_surahs JSONB DEFAULT '[]',
      daily_completed JSONB DEFAULT '{}',
      daily_pages INTEGER DEFAULT 4,
      mushaf_theme TEXT DEFAULT 'madina-1441',
      last_read JSONB DEFAULT '{}',
      updated_at TIMESTAMPTZ DEFAULT NOW()
    )`;

    await sql`CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_users_username ON users(username)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_pomodoro_sessions_user ON pomodoro_sessions(user_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_kanban_columns_user ON kanban_columns(user_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_kanban_cards_user ON kanban_cards(user_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_books_user ON books(user_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_book_notes_user ON book_notes(user_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_todos_user ON todos(user_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_challenges_user ON challenges(user_id)`;

    schemaEnsured = true;
  } catch (err) {
    console.error('Schema ensure error:', err);
  }
}

export default sql;
