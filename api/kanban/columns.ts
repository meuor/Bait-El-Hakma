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
      const columns = await sql`
        SELECT * FROM kanban_columns ORDER BY sort_order
      `;
      return res.status(200).json(columns);
    }

    if (req.method === 'POST') {
      const { id, title, color, sortOrder } = req.body;
      await sql`
        INSERT INTO kanban_columns (id, title, color, sort_order)
        VALUES (${id}, ${title}, ${color}, ${sortOrder || 0})
      `;
      return res.status(201).json({ success: true });
    }

    if (req.method === 'PUT') {
      const { id, title, color, sortOrder } = req.body;
      await sql`
        UPDATE kanban_columns 
        SET title = ${title}, color = ${color}, sort_order = ${sortOrder || 0}
        WHERE id = ${id}
      `;
      return res.status(200).json({ success: true });
    }

    if (req.method === 'DELETE') {
      const { id } = req.query;
      await sql`DELETE FROM kanban_columns WHERE id = ${id as string}`;
      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Kanban columns API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
