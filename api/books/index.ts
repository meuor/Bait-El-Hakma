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

  const action = (req.query.action as string) || 'books';
  const uid = authUser.userId;

  try {
    // Notes
    if (action === 'notes') {
      if (req.method === 'GET') {
        const { bookId } = req.query;
        if (bookId) {
          const notes = await sql`SELECT * FROM book_notes WHERE user_id = ${uid} AND book_id = ${bookId as string} ORDER BY created_at DESC`;
          return res.status(200).json(notes);
        }
        const notes = await sql`SELECT * FROM book_notes WHERE user_id = ${uid} ORDER BY created_at DESC`;
        return res.status(200).json(notes);
      }
      if (req.method === 'POST') {
        const { id, bookId, content, pageNumber, createdAt } = req.body;
        await sql`INSERT INTO book_notes (id, user_id, book_id, content, page_number, created_at) VALUES (${id}, ${uid}, ${bookId}, ${content}, ${pageNumber || null}, ${createdAt})`;
        return res.status(201).json({ success: true });
      }
      if (req.method === 'DELETE') {
        const { id } = req.query;
        await sql`DELETE FROM book_notes WHERE id = ${id as string} AND user_id = ${uid}`;
        return res.status(200).json({ success: true });
      }
    }

    // Default: books
    if (req.method === 'GET') {
      const books = await sql`SELECT * FROM books WHERE user_id = ${uid} ORDER BY added_at DESC`;
      return res.status(200).json(books);
    }
    if (req.method === 'POST') {
      const { id, title, author, coverUrl, description, tags, status, progress, addedAt, completedAt } = req.body;
      await sql`INSERT INTO books (id, user_id, title, author, cover_url, description, tags, status, progress, added_at, completed_at) VALUES (${id}, ${uid}, ${title}, ${author}, ${coverUrl || ''}, ${description || ''}, ${JSON.stringify(tags || [])}, ${status}, ${progress || 0}, ${addedAt}, ${completedAt || null})`;
      return res.status(201).json({ success: true });
    }
    if (req.method === 'PUT') {
      const { id, title, author, coverUrl, description, tags, status, progress, completedAt } = req.body;
      await sql`UPDATE books SET title = ${title}, author = ${author}, cover_url = ${coverUrl || ''}, description = ${description || ''}, tags = ${JSON.stringify(tags || [])}, status = ${status}, progress = ${progress || 0}, completed_at = ${completedAt || null} WHERE id = ${id} AND user_id = ${uid}`;
      return res.status(200).json({ success: true });
    }
    if (req.method === 'DELETE') {
      const { id } = req.query;
      if (id) await sql`DELETE FROM books WHERE id = ${id as string} AND user_id = ${uid}`;
      else await sql`DELETE FROM books WHERE user_id = ${uid}`;
      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Books API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
