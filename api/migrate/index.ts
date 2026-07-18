import type { VercelRequest, VercelResponse } from '@vercel/node';
import sql from '../_lib/db.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { pomodoroSessions, kanbanCards, books, todos, challenges, settings } = req.body;

    // Migrate pomodoro sessions
    if (pomodoroSessions && pomodoroSessions.length > 0) {
      for (const session of pomodoroSessions) {
        await sql`
          INSERT INTO pomodoro_sessions (id, start_time, end_time, duration, type, completed)
          VALUES (${session.id}, ${session.startTime}, ${session.endTime}, ${session.duration}, ${session.type}, ${session.completed})
          ON CONFLICT (id) DO NOTHING
        `;
      }
    }

    // Migrate kanban cards
    if (kanbanCards && kanbanCards.length > 0) {
      for (const card of kanbanCards) {
        await sql`
          INSERT INTO kanban_cards (id, column_id, title, description, labels, priority, created_at, due_date)
          VALUES (${card.id}, ${card.columnId}, ${card.title}, ${card.description || ''}, ${JSON.stringify(card.labels || [])}, ${card.priority}, ${card.createdAt}, ${card.dueDate || null})
          ON CONFLICT (id) DO NOTHING
        `;
      }
    }

    // Migrate books
    if (books && books.length > 0) {
      for (const book of books) {
        await sql`
          INSERT INTO books (id, title, author, cover_url, description, tags, status, progress, added_at, completed_at)
          VALUES (${book.id}, ${book.title}, ${book.author}, ${book.coverUrl || ''}, ${book.description || ''}, ${JSON.stringify(book.tags || [])}, ${book.status}, ${book.progress || 0}, ${book.addedAt}, ${book.completedAt || null})
          ON CONFLICT (id) DO NOTHING
        `;
      }
    }

    // Migrate todos
    if (todos && todos.length > 0) {
      for (const todo of todos) {
        await sql`
          INSERT INTO todos (id, content, completed, created_at, due_date, priority)
          VALUES (${todo.id}, ${todo.content}, ${todo.completed || false}, ${todo.createdAt}, ${todo.dueDate || null}, ${todo.priority})
          ON CONFLICT (id) DO NOTHING
        `;
      }
    }

    // Migrate challenges
    if (challenges && challenges.length > 0) {
      for (const challenge of challenges) {
        await sql`
          INSERT INTO challenges (id, name, description, total_days, completed_days, start_date, color, icon)
          VALUES (${challenge.id}, ${challenge.name}, ${challenge.description || ''}, ${challenge.totalDays}, ${JSON.stringify(challenge.completedDays || [])}, ${challenge.startDate}, ${challenge.color}, ${challenge.icon})
          ON CONFLICT (id) DO NOTHING
        `;
      }
    }

    // Migrate settings
    if (settings) {
      await sql`
        UPDATE pomodoro_settings 
        SET focus_time = ${settings.focusTime}, short_break = ${settings.shortBreak}, long_break = ${settings.longBreak},
            cycles_before_long_break = ${settings.cyclesBeforeLongBreak}, auto_start_breaks = ${settings.autoStartBreaks},
            auto_start_pomodoros = ${settings.autoStartPomodoros}, sound_enabled = ${settings.soundEnabled},
            updated_at = NOW()
        WHERE id = 1
      `;
    }

    return res.status(200).json({ success: true, message: 'Data migrated successfully' });
  } catch (error) {
    console.error('Migration error:', error);
    return res.status(500).json({ error: 'Migration failed' });
  }
}
