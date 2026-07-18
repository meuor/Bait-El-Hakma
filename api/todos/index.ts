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
      const todos = await sql`SELECT * FROM todos WHERE user_id = ${uid} ORDER BY created_at DESC`;
      return res.status(200).json(todos);
    }
    if (req.method === 'POST') {
      const { id, content, completed, createdAt, dueDate, priority } = req.body;
      await sql`INSERT INTO todos (id, user_id, content, completed, created_at, due_date, priority) VALUES (${id}, ${uid}, ${content}, ${completed || false}, ${createdAt}, ${dueDate || null}, ${priority})`;
      return res.status(201).json({ success: true });
    }
    if (req.method === 'PUT') {
      const { id, content, completed, dueDate, priority } = req.body;
      await sql`UPDATE todos SET content = ${content}, completed = ${completed}, due_date = ${dueDate || null}, priority = ${priority} WHERE id = ${id} AND user_id = ${uid}`;
      return res.status(200).json({ success: true });
    }
    if (req.method === 'DELETE') {
      const { id } = req.query;
      if (id) await sql`DELETE FROM todos WHERE id = ${id as string} AND user_id = ${uid}`;
      else await sql`DELETE FROM todos WHERE user_id = ${uid}`;
      return res.status(200).json({ success: true });
    }
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Todos API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
