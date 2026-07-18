import type { VercelRequest, VercelResponse } from '@vercel/node';
import sql from '../_lib/db.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    if (req.method === 'GET') {
      const sessions = await sql`
        SELECT * FROM pomodoro_sessions ORDER BY start_time DESC
      `;
      return res.status(200).json(sessions);
    }

    if (req.method === 'POST') {
      const { id, startTime, endTime, duration, type, completed } = req.body;
      await sql`
        INSERT INTO pomodoro_sessions (id, start_time, end_time, duration, type, completed)
        VALUES (${id}, ${startTime}, ${endTime}, ${duration}, ${type}, ${completed})
      `;
      return res.status(201).json({ success: true });
    }

    if (req.method === 'DELETE') {
      const { id } = req.query;
      if (id) {
        await sql`DELETE FROM pomodoro_sessions WHERE id = ${id as string}`;
      } else {
        await sql`DELETE FROM pomodoro_sessions`;
      }
      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Pomodoro API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
