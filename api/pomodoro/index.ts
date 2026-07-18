import type { VercelRequest, VercelResponse } from '@vercel/node';
import sql from '../_lib/db.js';
import { getUserFromRequest } from '../_lib/auth.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const authUser = getUserFromRequest(req as unknown as Request);
  if (!authUser) return res.status(401).json({ error: 'Unauthorized' });

  const uid = authUser.userId;

  try {
    if (req.method === 'GET') {
      const sessions = await sql`SELECT * FROM pomodoro_sessions WHERE user_id = ${uid} ORDER BY start_time DESC`;
      return res.status(200).json(sessions);
    }
    if (req.method === 'POST') {
      const { id, startTime, endTime, duration, type, completed } = req.body;
      await sql`INSERT INTO pomodoro_sessions (id, user_id, start_time, end_time, duration, type, completed) VALUES (${id}, ${uid}, ${startTime}, ${endTime}, ${duration}, ${type}, ${completed})`;
      return res.status(201).json({ success: true });
    }
    if (req.method === 'DELETE') {
      const { id } = req.query;
      if (id) await sql`DELETE FROM pomodoro_sessions WHERE id = ${id as string} AND user_id = ${uid}`;
      else await sql`DELETE FROM pomodoro_sessions WHERE user_id = ${uid}`;
      return res.status(200).json({ success: true });
    }
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Pomodoro API error:', error);
    return res.status(500).json({ error: error instanceof Error ? error.message : String(error) });
  }
}
