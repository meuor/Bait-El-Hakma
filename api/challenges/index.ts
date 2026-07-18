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
      const challenges = await sql`
        SELECT * FROM challenges ORDER BY start_date DESC
      `;
      return res.status(200).json(challenges);
    }

    if (req.method === 'POST') {
      const { id, name, description, totalDays, completedDays, startDate, color, icon } = req.body;
      await sql`
        INSERT INTO challenges (id, name, description, total_days, completed_days, start_date, color, icon)
        VALUES (${id}, ${name}, ${description || ''}, ${totalDays}, ${JSON.stringify(completedDays || [])}, ${startDate}, ${color}, ${icon})
      `;
      return res.status(201).json({ success: true });
    }

    if (req.method === 'PUT') {
      const { id, name, description, totalDays, completedDays, startDate, color, icon } = req.body;
      await sql`
        UPDATE challenges 
        SET name = ${name}, description = ${description || ''}, total_days = ${totalDays}, 
            completed_days = ${JSON.stringify(completedDays || [])}, color = ${color}, icon = ${icon}
        WHERE id = ${id}
      `;
      return res.status(200).json({ success: true });
    }

    if (req.method === 'DELETE') {
      const { id } = req.query;
      if (id) {
        await sql`DELETE FROM challenges WHERE id = ${id as string}`;
      } else {
        await sql`DELETE FROM challenges`;
      }
      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Challenges API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
