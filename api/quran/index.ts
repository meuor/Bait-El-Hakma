import type { VercelRequest, VercelResponse } from '@vercel/node';
import sql from '../_lib/db.js';
import { getUserFromRequest } from '../_lib/auth.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const authUser = getUserFromRequest(req as unknown as Request);
  if (!authUser) return res.status(401).json({ error: 'Unauthorized' });

  const userId = authUser.userId;

  if (req.method === 'GET') {
    try {
      const rows = await sql`SELECT * FROM quran_progress WHERE user_id = ${userId}`;
      if (rows.length === 0) {
        return res.status(200).json({
          bookmarks: {},
          completedSurahs: [],
          dailyCompleted: {},
          dailyPages: 4,
          mushafTheme: 'madina-1441',
          lastRead: {},
        });
      }
      const row = rows[0];
      return res.status(200).json({
        bookmarks: row.bookmarks || {},
        completedSurahs: row.completed_surahs || [],
        dailyCompleted: row.daily_completed || {},
        dailyPages: row.daily_pages || 4,
        mushafTheme: row.mushaf_theme || 'madina-1441',
        lastRead: row.last_read || {},
      });
    } catch (error) {
      console.error('GET /api/quran error:', error);
      return res.status(500).json({ error: String(error) });
    }
  }

  if (req.method === 'PUT') {
    try {
      const { bookmarks, completedSurahs, dailyCompleted, dailyPages, mushafTheme, lastRead } = req.body;

      await sql`
        INSERT INTO quran_progress (user_id, bookmarks, completed_surahs, daily_completed, daily_pages, mushaf_theme, last_read, updated_at)
        VALUES (
          ${userId},
          ${JSON.stringify(bookmarks || {})},
          ${JSON.stringify(completedSurahs || [])},
          ${JSON.stringify(dailyCompleted || {})},
          ${dailyPages || 4},
          ${mushafTheme || 'madina-1441'},
          ${JSON.stringify(lastRead || {})},
          NOW()
        )
        ON CONFLICT (user_id) DO UPDATE SET
          bookmarks = ${JSON.stringify(bookmarks || {})},
          completed_surahs = ${JSON.stringify(completedSurahs || [])},
          daily_completed = ${JSON.stringify(dailyCompleted || {})},
          daily_pages = ${dailyPages || 4},
          mushaf_theme = ${mushafTheme || 'madina-1441'},
          last_read = ${JSON.stringify(lastRead || {})},
          updated_at = NOW()
      `;

      return res.status(200).json({ success: true });
    } catch (error) {
      console.error('PUT /api/quran error:', error);
      return res.status(500).json({ error: String(error) });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
