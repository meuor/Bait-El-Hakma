import type { VercelRequest, VercelResponse } from '@vercel/node';
import sql from '../_lib/db.js';
import { getUserFromRequest } from '../_lib/auth.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const authUser = getUserFromRequest(req as unknown as Request);
  if (!authUser) return res.status(401).json({ error: 'Unauthorized' });

  const uid = authUser.userId;

  try {
    const { pomodoroSessions, kanbanCards, books, todos, challenges, settings } = req.body;

    if (pomodoroSessions?.length) {
      for (const s of pomodoroSessions) {
        await sql`INSERT INTO pomodoro_sessions (id, user_id, start_time, end_time, duration, type, completed) VALUES (${s.id}, ${uid}, ${s.startTime}, ${s.endTime}, ${s.duration}, ${s.type}, ${s.completed}) ON CONFLICT (id) DO NOTHING`;
      }
    }
    if (kanbanCards?.length) {
      for (const c of kanbanCards) {
        await sql`INSERT INTO kanban_cards (id, user_id, column_id, title, description, labels, priority, created_at, due_date) VALUES (${c.id}, ${uid}, ${c.columnId}, ${c.title}, ${c.description || ''}, ${JSON.stringify(c.labels || [])}, ${c.priority}, ${c.createdAt}, ${c.dueDate || null}) ON CONFLICT (id) DO NOTHING`;
      }
    }
    if (books?.length) {
      for (const b of books) {
        await sql`INSERT INTO books (id, user_id, title, author, cover_url, description, tags, status, progress, added_at, completed_at) VALUES (${b.id}, ${uid}, ${b.title}, ${b.author}, ${b.coverUrl || ''}, ${b.description || ''}, ${JSON.stringify(b.tags || [])}, ${b.status}, ${b.progress || 0}, ${b.addedAt}, ${b.completedAt || null}) ON CONFLICT (id) DO NOTHING`;
      }
    }
    if (todos?.length) {
      for (const t of todos) {
        await sql`INSERT INTO todos (id, user_id, content, completed, created_at, due_date, priority) VALUES (${t.id}, ${uid}, ${t.content}, ${t.completed || false}, ${t.createdAt}, ${t.dueDate || null}, ${t.priority}) ON CONFLICT (id) DO NOTHING`;
      }
    }
    if (challenges?.length) {
      for (const c of challenges) {
        await sql`INSERT INTO challenges (id, user_id, name, description, total_days, completed_days, start_date, color, icon) VALUES (${c.id}, ${uid}, ${c.name}, ${c.description || ''}, ${c.totalDays}, ${JSON.stringify(c.completedDays || [])}, ${c.startDate}, ${c.color}, ${c.icon}) ON CONFLICT (id) DO NOTHING`;
      }
    }
    if (settings) {
      await sql`UPDATE pomodoro_settings SET focus_time = ${settings.focusTime}, short_break = ${settings.shortBreak}, long_break = ${settings.longBreak}, cycles_before_long_break = ${settings.cyclesBeforeLongBreak}, auto_start_breaks = ${settings.autoStartBreaks}, auto_start_pomodoros = ${settings.autoStartPomodoros}, sound_enabled = ${settings.soundEnabled}, updated_at = NOW() WHERE user_id = ${uid}`;
    }

    return res.status(200).json({ success: true, message: 'Data migrated successfully' });
  } catch (error) {
    console.error('Migration error:', error);
    return res.status(500).json({ error: 'Migration failed' });
  }
}
