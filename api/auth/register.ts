import type { VercelRequest, VercelResponse } from '@vercel/node';
import { v4 as uuidv4 } from 'uuid';
import sql from '../_lib/db.js';
import { hashPassword, generateToken } from '../_lib/auth.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, password, displayName } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    // Check if user already exists
    const existingUser = await sql`SELECT id FROM users WHERE email = ${email}`;
    if (existingUser.length > 0) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    // Create user
    const userId = uuidv4();
    const passwordHash = await hashPassword(password);
    const name = displayName || email.split('@')[0];

    await sql`
      INSERT INTO users (id, email, password_hash, display_name)
      VALUES (${userId}, ${email}, ${passwordHash}, ${name})
    `;

    // Create default kanban columns for new user
    const defaultColumns = [
      { id: `ideas-${userId}`, title: 'Ideas', color: '#8b5cf6', sortOrder: 0 },
      { id: `future-${userId}`, title: 'Future Plans', color: '#3b82f6', sortOrder: 1 },
      { id: `doing-${userId}`, title: 'Doing', color: '#f59e0b', sortOrder: 2 },
      { id: `done-${userId}`, title: 'Done', color: '#10b981', sortOrder: 3 },
    ];

    for (const col of defaultColumns) {
      await sql`
        INSERT INTO kanban_columns (id, user_id, title, color, sort_order)
        VALUES (${col.id}, ${userId}, ${col.title}, ${col.color}, ${col.sortOrder})
      `;
    }

    // Create default pomodoro settings
    await sql`
      INSERT INTO pomodoro_settings (user_id)
      VALUES (${userId})
    `;

    // Generate JWT
    const token = generateToken({ userId, email });

    return res.status(201).json({
      success: true,
      token,
      user: {
        id: userId,
        email,
        displayName: name,
        avatarUrl: '',
        bio: '',
      },
    });
  } catch (error) {
    console.error('Register error:', error);
    return res.status(500).json({ error: 'Registration failed' });
  }
}
