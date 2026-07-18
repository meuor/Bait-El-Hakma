import type { VercelRequest, VercelResponse } from '@vercel/node';
import sql from '../_lib/db.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method === 'GET') {
    try {
      const tables = await sql`SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name`;
      return res.status(200).json({ tables: tables.map(t => t.table_name) });
    } catch (error) {
      return res.status(500).json({ error: String(error) });
    }
  }

  if (req.method === 'POST') {
    try {
      // Drop old tables with wrong schema, then recreate
      await sql`DROP TABLE IF EXISTS book_notes CASCADE`;
      await sql`DROP TABLE IF EXISTS books CASCADE`;
      await sql`DROP TABLE IF EXISTS challenges CASCADE`;
      await sql`DROP TABLE IF EXISTS kanban_cards CASCADE`;
      await sql`DROP TABLE IF EXISTS kanban_columns CASCADE`;
      await sql`DROP TABLE IF EXISTS pomodoro_sessions CASCADE`;
      await sql`DROP TABLE IF EXISTS pomodoro_settings CASCADE`;
      await sql`DROP TABLE IF EXISTS todos CASCADE`;
      await sql`DROP TABLE IF EXISTS users CASCADE`;

      // Create tables with correct schema
      await sql`CREATE TABLE users (
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

      await sql`CREATE TABLE pomodoro_sessions (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        start_time TIMESTAMPTZ NOT NULL,
        end_time TIMESTAMPTZ,
        duration INTEGER NOT NULL,
        type TEXT NOT NULL,
        completed BOOLEAN NOT NULL DEFAULT false,
        created_at TIMESTAMPTZ DEFAULT NOW()
      )`;

      await sql`CREATE TABLE kanban_columns (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        title TEXT NOT NULL,
        color TEXT NOT NULL,
        sort_order INTEGER DEFAULT 0
      )`;

      await sql`CREATE TABLE kanban_cards (
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

      await sql`CREATE TABLE books (
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

      await sql`CREATE TABLE book_notes (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        book_id TEXT NOT NULL,
        content TEXT NOT NULL,
        page_number INTEGER,
        created_at TIMESTAMPTZ NOT NULL
      )`;

      await sql`CREATE TABLE todos (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        content TEXT NOT NULL,
        completed BOOLEAN NOT NULL DEFAULT false,
        created_at TIMESTAMPTZ NOT NULL,
        due_date TIMESTAMPTZ,
        priority TEXT NOT NULL
      )`;

      await sql`CREATE TABLE challenges (
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

      await sql`CREATE TABLE pomodoro_settings (
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

      // Indexes
      await sql`CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)`;
      await sql`CREATE INDEX IF NOT EXISTS idx_users_username ON users(username)`;
      await sql`CREATE INDEX IF NOT EXISTS idx_pomodoro_sessions_user ON pomodoro_sessions(user_id)`;
      await sql`CREATE INDEX IF NOT EXISTS idx_kanban_columns_user ON kanban_columns(user_id)`;
      await sql`CREATE INDEX IF NOT EXISTS idx_kanban_cards_user ON kanban_cards(user_id)`;
      await sql`CREATE INDEX IF NOT EXISTS idx_kanban_cards_column ON kanban_cards(column_id)`;
      await sql`CREATE INDEX IF NOT EXISTS idx_books_user ON books(user_id)`;
      await sql`CREATE INDEX IF NOT EXISTS idx_book_notes_user ON book_notes(user_id)`;
      await sql`CREATE INDEX IF NOT EXISTS idx_todos_user ON todos(user_id)`;
      await sql`CREATE INDEX IF NOT EXISTS idx_challenges_user ON challenges(user_id)`;

      return res.status(200).json({ success: true, message: 'Database schema reset and recreated successfully. All old data was cleared.' });
    } catch (error) {
      console.error('Migration error:', error);
      return res.status(500).json({ error: String(error) });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
