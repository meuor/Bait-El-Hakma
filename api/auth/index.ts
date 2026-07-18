import type { VercelRequest, VercelResponse } from '@vercel/node';
import { v4 as uuidv4 } from 'uuid';
import sql from '../_lib/db.js';
import { hashPassword, verifyPassword, generateToken, getUserFromRequest } from '../_lib/auth.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const action = (req.query.action as string) || req.body?.action || '';

  try {
    // POST /api/auth?action=register
    if (req.method === 'POST' && action === 'register') {
      const { email, password, displayName, username } = req.body;
      if (!email || !password) return res.status(400).json({ error: 'Email and password are required' });
      if (password.length < 6) return res.status(400).json({ error: 'Password must be at least 6 characters' });

      const existing = await sql`SELECT id FROM users WHERE email = ${email}`;
      if (existing.length > 0) return res.status(409).json({ error: 'Email already registered' });

      if (username) {
        const cleanUsername = username.toLowerCase().replace(/[^a-z0-9_-]/g, '');
        if (cleanUsername.length < 3) return res.status(400).json({ error: 'Username must be at least 3 characters' });
        if (cleanUsername.length > 20) return res.status(400).json({ error: 'Username must be 20 characters or less' });
        const existingUser = await sql`SELECT id FROM users WHERE username = ${cleanUsername}`;
        if (existingUser.length > 0) return res.status(409).json({ error: 'Username already taken' });
      }

      const userId = uuidv4();
      const passwordHash = await hashPassword(password);
      const name = displayName || email.split('@')[0];
      const cleanUsername = username ? username.toLowerCase().replace(/[^a-z0-9_-]/g, '') : null;

      await sql`INSERT INTO users (id, email, password_hash, display_name, username) VALUES (${userId}, ${email}, ${passwordHash}, ${name}, ${cleanUsername})`;

      const defaultColumns = [
        { id: `ideas-${userId}`, title: 'Ideas', color: '#8b5cf6', sortOrder: 0 },
        { id: `future-${userId}`, title: 'Future Plans', color: '#3b82f6', sortOrder: 1 },
        { id: `doing-${userId}`, title: 'Doing', color: '#f59e0b', sortOrder: 2 },
        { id: `done-${userId}`, title: 'Done', color: '#10b981', sortOrder: 3 },
      ];
      for (const col of defaultColumns) {
        await sql`INSERT INTO kanban_columns (id, user_id, title, color, sort_order) VALUES (${col.id}, ${userId}, ${col.title}, ${col.color}, ${col.sortOrder})`;
      }
      await sql`INSERT INTO pomodoro_settings (user_id) VALUES (${userId})`;

      const token = generateToken({ userId, email });
      return res.status(201).json({ success: true, token, user: { id: userId, email, displayName: name, avatarUrl: '', bio: '', username: cleanUsername } });
    }

    // POST /api/auth?action=login
    if (req.method === 'POST' && action === 'login') {
      const { email, password } = req.body;
      if (!email || !password) return res.status(400).json({ error: 'Email and password are required' });

      const users = await sql`SELECT * FROM users WHERE email = ${email}`;
      if (users.length === 0) return res.status(401).json({ error: 'Invalid email or password' });

      const user = users[0];
      const valid = await verifyPassword(password, user.password_hash);
      if (!valid) return res.status(401).json({ error: 'Invalid email or password' });

      const token = generateToken({ userId: user.id, email: user.email });
      return res.status(200).json({ success: true, token, user: { id: user.id, email: user.email, displayName: user.display_name, avatarUrl: user.avatar_url, bio: user.bio, username: user.username, usernameChangedAt: user.username_changed_at } });
    }

    // GET /api/auth?action=profile
    if (req.method === 'GET' && action === 'profile') {
      const authUser = getUserFromRequest(req as unknown as Request);
      if (!authUser) return res.status(401).json({ error: 'Unauthorized' });

      const users = await sql`SELECT id, email, display_name, avatar_url, bio, username, username_changed_at, created_at FROM users WHERE id = ${authUser.userId}`;
      if (users.length === 0) return res.status(404).json({ error: 'User not found' });
      const u = users[0];
      return res.status(200).json({ id: u.id, email: u.email, displayName: u.display_name, avatarUrl: u.avatar_url, bio: u.bio, username: u.username, usernameChangedAt: u.username_changed_at, createdAt: u.created_at });
    }

    // PUT /api/auth?action=profile
    if (req.method === 'PUT' && action === 'profile') {
      const authUser = getUserFromRequest(req as unknown as Request);
      if (!authUser) return res.status(401).json({ error: 'Unauthorized' });

      const { displayName, avatarUrl, bio } = req.body;
      await sql`UPDATE users SET display_name = COALESCE(${displayName}, display_name), avatar_url = COALESCE(${avatarUrl}, avatar_url), bio = COALESCE(${bio}, bio), updated_at = NOW() WHERE id = ${authUser.userId}`;

      const users = await sql`SELECT id, email, display_name, avatar_url, bio, username, username_changed_at, created_at FROM users WHERE id = ${authUser.userId}`;
      const u = users[0];
      return res.status(200).json({ id: u.id, email: u.email, displayName: u.display_name, avatarUrl: u.avatar_url, bio: u.bio, username: u.username, usernameChangedAt: u.username_changed_at, createdAt: u.created_at });
    }

    // POST /api/auth?action=username
    if (req.method === 'POST' && action === 'username') {
      const authUser = getUserFromRequest(req as unknown as Request);
      if (!authUser) return res.status(401).json({ error: 'Unauthorized' });

      const { username } = req.body;
      if (!username) return res.status(400).json({ error: 'Username is required' });

      const cleanUsername = username.toLowerCase().replace(/[^a-z0-9_-]/g, '');
      if (cleanUsername.length < 3) return res.status(400).json({ error: 'Username must be at least 3 characters' });
      if (cleanUsername.length > 20) return res.status(400).json({ error: 'Username must be 20 characters or less' });

      const existingUser = await sql`SELECT id FROM users WHERE username = ${cleanUsername} AND id != ${authUser.userId}`;
      if (existingUser.length > 0) return res.status(409).json({ error: 'Username already taken' });

      // Check 90-day cooldown
      const users = await sql`SELECT username_changed_at FROM users WHERE id = ${authUser.userId}`;
      const user = users[0];
      if (user.username_changed_at) {
        const changedAt = new Date(user.username_changed_at);
        const now = new Date();
        const daysSince = Math.floor((now.getTime() - changedAt.getTime()) / (1000 * 60 * 60 * 24));
        if (daysSince < 90) {
          const daysLeft = 90 - daysSince;
          return res.status(400).json({ error: `You can change your username again in ${daysLeft} days` });
        }
      }

      await sql`UPDATE users SET username = ${cleanUsername}, username_changed_at = NOW() WHERE id = ${authUser.userId}`;

      return res.status(200).json({ success: true, username: cleanUsername, usernameChangedAt: new Date().toISOString() });
    }

    // GET /api/auth?action=check-username
    if (req.method === 'GET' && action === 'check-username') {
      const username = req.query.username as string;
      if (!username) return res.status(400).json({ error: 'Username is required' });

      const cleanUsername = username.toLowerCase().replace(/[^a-z0-9_-]/g, '');
      if (cleanUsername.length < 3) return res.status(200).json({ available: false });

      const existing = await sql`SELECT id FROM users WHERE username = ${cleanUsername}`;
      return res.status(200).json({ available: existing.length === 0 });
    }

    // GET /api/auth?action=public-profile
    if (req.method === 'GET' && action === 'public-profile') {
      const username = req.query.username as string;
      if (!username) return res.status(400).json({ error: 'Username is required' });

      const cleanUsername = username.toLowerCase().replace(/[^@]/g, '');
      const users = await sql`SELECT id, display_name, avatar_url, bio, username, created_at FROM users WHERE username = ${cleanUsername}`;
      if (users.length === 0) return res.status(404).json({ error: 'User not found' });

      const u = users[0];
      const uid = u.id;

      const [todosCount, completedTodos, booksCount, sessionsCount, challengesCount] = await Promise.all([
        sql`SELECT COUNT(*) as count FROM todos WHERE user_id = ${uid}`,
        sql`SELECT COUNT(*) as count FROM todos WHERE user_id = ${uid} AND completed = true`,
        sql`SELECT COUNT(*) as count FROM books WHERE user_id = ${uid}`,
        sql`SELECT COUNT(*) as count FROM pomodoro_sessions WHERE user_id = ${uid} AND type = 'focus'`,
        sql`SELECT COUNT(*) as count FROM challenges WHERE user_id = ${uid}`,
      ]);

      return res.status(200).json({
        id: u.id,
        displayName: u.display_name,
        avatarUrl: u.avatar_url,
        bio: u.bio,
        username: u.username,
        createdAt: u.created_at,
        totalTodos: parseInt(todosCount[0].count),
        completedTodos: parseInt(completedTodos[0].count),
        totalBooks: parseInt(booksCount[0].count),
        totalPomodoroSessions: parseInt(sessionsCount[0].count),
        totalChallenges: parseInt(challengesCount[0].count),
      });
    }

    // GET /api/auth?action=stats
    if (req.method === 'GET' && action === 'stats') {
      const authUser = getUserFromRequest(req as unknown as Request);
      if (!authUser) return res.status(401).json({ error: 'Unauthorized' });

      const uid = authUser.userId;
      const [sessions, books, todos, challenges, focusMinutes] = await Promise.all([
        sql`SELECT COUNT(*) as count FROM pomodoro_sessions WHERE user_id = ${uid} AND type = 'focus'`,
        sql`SELECT COUNT(*) as count FROM books WHERE user_id = ${uid}`,
        sql`SELECT COUNT(*) as total, COUNT(*) FILTER (WHERE completed = true) as done FROM todos WHERE user_id = ${uid}`,
        sql`SELECT COUNT(*) as count FROM challenges WHERE user_id = ${uid}`,
        sql`SELECT COALESCE(SUM(duration), 0) as total FROM pomodoro_sessions WHERE user_id = ${uid} AND type = 'focus'`,
      ]);

      return res.status(200).json({
        pomodoroSessions: parseInt(sessions[0].count),
        focusMinutes: parseInt(focusMinutes[0].total),
        totalBooks: parseInt(books[0].count),
        totalTodos: parseInt(todos[0].total),
        completedTodos: parseInt(todos[0].done),
        totalChallenges: parseInt(challenges[0].count),
      });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Auth API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
