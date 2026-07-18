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

  const type = (req.query.type as string) || 'cards';
  const uid = authUser.userId;

  try {
    if (type === 'columns') {
      if (req.method === 'GET') {
        const columns = await sql`SELECT * FROM kanban_columns WHERE user_id = ${uid} ORDER BY sort_order`;
        return res.status(200).json(columns);
      }
      if (req.method === 'POST') {
        const { id, title, color, sortOrder } = req.body;
        await sql`INSERT INTO kanban_columns (id, user_id, title, color, sort_order) VALUES (${id}, ${uid}, ${title}, ${color}, ${sortOrder || 0})`;
        return res.status(201).json({ success: true });
      }
      if (req.method === 'PUT') {
        const { id, title, color, sortOrder } = req.body;
        await sql`UPDATE kanban_columns SET title = ${title}, color = ${color}, sort_order = ${sortOrder || 0} WHERE id = ${id} AND user_id = ${uid}`;
        return res.status(200).json({ success: true });
      }
      if (req.method === 'DELETE') {
        const { id } = req.query;
        await sql`DELETE FROM kanban_columns WHERE id = ${id as string} AND user_id = ${uid}`;
        return res.status(200).json({ success: true });
      }
    }

    // Default: cards
    if (req.method === 'GET') {
      const cards = await sql`SELECT * FROM kanban_cards WHERE user_id = ${uid} ORDER BY created_at DESC`;
      return res.status(200).json(cards);
    }
    if (req.method === 'POST') {
      const { id, columnId, title, description, labels, priority, createdAt, dueDate } = req.body;
      await sql`INSERT INTO kanban_cards (id, user_id, column_id, title, description, labels, priority, created_at, due_date) VALUES (${id}, ${uid}, ${columnId}, ${title}, ${description || ''}, ${JSON.stringify(labels || [])}, ${priority}, ${createdAt}, ${dueDate || null})`;
      return res.status(201).json({ success: true });
    }
    if (req.method === 'PUT') {
      const { id, columnId, title, description, labels, priority, dueDate } = req.body;
      await sql`UPDATE kanban_cards SET column_id = ${columnId}, title = ${title}, description = ${description || ''}, labels = ${JSON.stringify(labels || [])}, priority = ${priority}, due_date = ${dueDate || null} WHERE id = ${id} AND user_id = ${uid}`;
      return res.status(200).json({ success: true });
    }
    if (req.method === 'DELETE') {
      const { id } = req.query;
      if (id) await sql`DELETE FROM kanban_cards WHERE id = ${id as string} AND user_id = ${uid}`;
      else await sql`DELETE FROM kanban_cards WHERE user_id = ${uid}`;
      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Kanban API error:', error);
    return res.status(500).json({ error: error instanceof Error ? error.message : String(error) });
  }
}
