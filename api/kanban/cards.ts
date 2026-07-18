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
      const cards = await sql`
        SELECT * FROM kanban_cards ORDER BY created_at DESC
      `;
      return res.status(200).json(cards);
    }

    if (req.method === 'POST') {
      const { id, columnId, title, description, labels, priority, createdAt, dueDate } = req.body;
      await sql`
        INSERT INTO kanban_cards (id, column_id, title, description, labels, priority, created_at, due_date)
        VALUES (${id}, ${columnId}, ${title}, ${description || ''}, ${JSON.stringify(labels || [])}, ${priority}, ${createdAt}, ${dueDate || null})
      `;
      return res.status(201).json({ success: true });
    }

    if (req.method === 'PUT') {
      const { id, columnId, title, description, labels, priority, createdAt, dueDate } = req.body;
      await sql`
        UPDATE kanban_cards 
        SET column_id = ${columnId}, title = ${title}, description = ${description || ''}, 
            labels = ${JSON.stringify(labels || [])}, priority = ${priority}, due_date = ${dueDate || null}
        WHERE id = ${id}
      `;
      return res.status(200).json({ success: true });
    }

    if (req.method === 'DELETE') {
      const { id } = req.query;
      if (id) {
        await sql`DELETE FROM kanban_cards WHERE id = ${id as string}`;
      } else {
        await sql`DELETE FROM kanban_cards`;
      }
      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Kanban cards API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
