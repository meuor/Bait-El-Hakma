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
      const todos = await sql`
        SELECT * FROM todos ORDER BY created_at DESC
      `;
      return res.status(200).json(todos);
    }

    if (req.method === 'POST') {
      const { id, content, completed, createdAt, dueDate, priority } = req.body;
      await sql`
        INSERT INTO todos (id, content, completed, created_at, due_date, priority)
        VALUES (${id}, ${content}, ${completed || false}, ${createdAt}, ${dueDate || null}, ${priority})
      `;
      return res.status(201).json({ success: true });
    }

    if (req.method === 'PUT') {
      const { id, content, completed, createdAt, dueDate, priority } = req.body;
      await sql`
        UPDATE todos 
        SET content = ${content}, completed = ${completed}, due_date = ${dueDate || null}, priority = ${priority}
        WHERE id = ${id}
      `;
      return res.status(200).json({ success: true });
    }

    if (req.method === 'DELETE') {
      const { id } = req.query;
      if (id) {
        await sql`DELETE FROM todos WHERE id = ${id as string}`;
      } else {
        await sql`DELETE FROM todos`;
      }
      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Todos API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
