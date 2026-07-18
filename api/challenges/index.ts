import type { VercelRequest, VercelResponse } from '@vercel/node';
import sql from '../_lib/db.js';
import { getUserFromRequest } from '../_lib/auth.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const authUser = getUserFromRequest(req as unknown as Request);
  if (!authUser) return res.status(401).json({ error: 'Unauthorized' });

  const uid = authUser.userId;

  try {
    if (req.method === 'GET') {
      const challenges = await sql`SELECT * FROM challenges WHERE user_id = ${uid} ORDER BY start_date DESC`;
      return res.status(200).json(challenges);
    }
    if (req.method === 'POST') {
      const { id, name, description, totalDays, completedDays, startDate, color, icon } = req.body;
      await sql`INSERT INTO challenges (id, user_id, name, description, total_days, completed_days, start_date, color, icon) VALUES (${id}, ${uid}, ${name}, ${description || ''}, ${totalDays}, ${JSON.stringify(completedDays || [])}, ${startDate}, ${color}, ${icon})`;
      return res.status(201).json({ success: true });
    }
    if (req.method === 'PUT') {
      const { id, name, description, totalDays, completedDays, color, icon } = req.body;
      await sql`UPDATE challenges SET name = ${name}, description = ${description || ''}, total_days = ${totalDays}, completed_days = ${JSON.stringify(completedDays || [])}, color = ${color}, icon = ${icon} WHERE id = ${id} AND user_id = ${uid}`;
      return res.status(200).json({ success: true });
    }
    if (req.method === 'DELETE') {
      const { id } = req.query;
      if (id) await sql`DELETE FROM challenges WHERE id = ${id as string} AND user_id = ${uid}`;
      else await sql`DELETE FROM challenges WHERE user_id = ${uid}`;
      return res.status(200).json({ success: true });
    }
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Challenges API error:', error);
    return res.status(500).json({ error: error instanceof Error ? error.message : String(error) });
  }
}
