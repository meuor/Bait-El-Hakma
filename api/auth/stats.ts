import type { VercelRequest, VercelResponse } from '@vercel/node';
import sql from '../_lib/db.js';
import { getUserFromRequest } from '../_lib/auth.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const user = getUserFromRequest(req as unknown as Request);
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    // Get stats for the logged-in user
    const [sessions, books, todos, challenges] = await Promise.all([
      sql`SELECT COUNT(*) as count FROM pomodoro_sessions WHERE user_id = ${user.userId} AND type = 'focus'`,
      sql`SELECT COUNT(*) as count FROM books WHERE user_id = ${user.userId}`,
      sql`SELECT COUNT(*) as total, COUNT(*) FILTER (WHERE completed = true) as done FROM todos WHERE user_id = ${user.userId}`,
      sql`SELECT COUNT(*) as count FROM challenges WHERE user_id = ${user.userId}`,
    ]);

    const focusMinutes = await sql`
      SELECT COALESCE(SUM(duration), 0) as total 
      FROM pomodoro_sessions 
      WHERE user_id = ${user.userId} AND type = 'focus'
    `;

    return res.status(200).json({
      pomodoroSessions: parseInt(sessions[0].count),
      focusMinutes: parseInt(focusMinutes[0].total),
      totalBooks: parseInt(books[0].count),
      totalTodos: parseInt(todos[0].total),
      completedTodos: parseInt(todos[0].done),
      totalChallenges: parseInt(challenges[0].count),
    });
  } catch (error) {
    console.error('Stats error:', error);
    return res.status(500).json({ error: 'Server error' });
  }
}
