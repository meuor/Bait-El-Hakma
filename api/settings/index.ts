import type { VercelRequest, VercelResponse } from '@vercel/node';
import sql from '../_lib/db.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    if (req.method === 'GET') {
      const settings = await sql`SELECT * FROM pomodoro_settings WHERE id = 1`;
      return res.status(200).json(settings[0] || null);
    }

    if (req.method === 'PUT') {
      const { focusTime, shortBreak, longBreak, cyclesBeforeLongBreak, autoStartBreaks, autoStartPomodoros, soundEnabled } = req.body;
      await sql`
        UPDATE pomodoro_settings 
        SET focus_time = ${focusTime}, short_break = ${shortBreak}, long_break = ${longBreak},
            cycles_before_long_break = ${cyclesBeforeLongBreak}, auto_start_breaks = ${autoStartBreaks},
            auto_start_pomodoros = ${autoStartPomodoros}, sound_enabled = ${soundEnabled},
            updated_at = NOW()
        WHERE id = 1
      `;
      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Settings API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
