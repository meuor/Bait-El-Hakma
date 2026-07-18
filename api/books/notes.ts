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
      const { bookId } = req.query;
      if (bookId) {
        const notes = await sql`
          SELECT * FROM book_notes WHERE book_id = ${bookId as string} ORDER BY created_at DESC
        `;
        return res.status(200).json(notes);
      }
      const notes = await sql`SELECT * FROM book_notes ORDER BY created_at DESC`;
      return res.status(200).json(notes);
    }

    if (req.method === 'POST') {
      const { id, bookId, content, pageNumber, createdAt } = req.body;
      await sql`
        INSERT INTO book_notes (id, book_id, content, page_number, created_at)
        VALUES (${id}, ${bookId}, ${content}, ${pageNumber || null}, ${createdAt})
      `;
      return res.status(201).json({ success: true });
    }

    if (req.method === 'DELETE') {
      const { id } = req.query;
      await sql`DELETE FROM book_notes WHERE id = ${id as string}`;
      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Book notes API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
