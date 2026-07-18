import type { VercelRequest, VercelResponse } from '@vercel/node';
import sql from '../_lib/db.js';
import { getUserFromRequest } from '../_lib/auth.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const user = getUserFromRequest(req as unknown as Request);
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    if (req.method === 'GET') {
      const users = await sql`
        SELECT id, email, display_name, avatar_url, bio, created_at 
        FROM users WHERE id = ${user.userId}
      `;
      if (users.length === 0) {
        return res.status(404).json({ error: 'User not found' });
      }
      const u = users[0];
      return res.status(200).json({
        id: u.id,
        email: u.email,
        displayName: u.display_name,
        avatarUrl: u.avatar_url,
        bio: u.bio,
        createdAt: u.created_at,
      });
    }

    if (req.method === 'PUT') {
      const { displayName, avatarUrl, bio } = req.body;
      await sql`
        UPDATE users 
        SET display_name = COALESCE(${displayName}, display_name),
            avatar_url = COALESCE(${avatarUrl}, avatar_url),
            bio = COALESCE(${bio}, bio),
            updated_at = NOW()
        WHERE id = ${user.userId}
      `;
      const users = await sql`
        SELECT id, email, display_name, avatar_url, bio, created_at 
        FROM users WHERE id = ${user.userId}
      `;
      const u = users[0];
      return res.status(200).json({
        id: u.id,
        email: u.email,
        displayName: u.display_name,
        avatarUrl: u.avatar_url,
        bio: u.bio,
        createdAt: u.created_at,
      });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Profile error:', error);
    return res.status(500).json({ error: 'Server error' });
  }
}
