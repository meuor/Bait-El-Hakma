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
      const books = await sql`
        SELECT * FROM books ORDER BY added_at DESC
      `;
      return res.status(200).json(books);
    }

    if (req.method === 'POST') {
      const { id, title, author, coverUrl, description, tags, status, progress, addedAt, completedAt } = req.body;
      await sql`
        INSERT INTO books (id, title, author, cover_url, description, tags, status, progress, added_at, completed_at)
        VALUES (${id}, ${title}, ${author}, ${coverUrl || ''}, ${description || ''}, ${JSON.stringify(tags || [])}, ${status}, ${progress || 0}, ${addedAt}, ${completedAt || null})
      `;
      return res.status(201).json({ success: true });
    }

    if (req.method === 'PUT') {
      const { id, title, author, coverUrl, description, tags, status, progress, addedAt, completedAt } = req.body;
      await sql`
        UPDATE books 
        SET title = ${title}, author = ${author}, cover_url = ${coverUrl || ''}, 
            description = ${description || ''}, tags = ${JSON.stringify(tags || [])}, 
            status = ${status}, progress = ${progress || 0}, completed_at = ${completedAt || null}
        WHERE id = ${id}
      `;
      return res.status(200).json({ success: true });
    }

    if (req.method === 'DELETE') {
      const { id } = req.query;
      if (id) {
        await sql`DELETE FROM books WHERE id = ${id as string}`;
      } else {
        await sql`DELETE FROM books`;
      }
      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Books API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
