import nodemailer from 'nodemailer';

function getTransporter() {
  const host = process.env.SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT || '587');
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    console.warn('SMTP not configured. Set SMTP_HOST, SMTP_USER, SMTP_PASS env vars.');
    return null;
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });
}

export async function sendPasswordResetEmail(to: string, code: string): Promise<void> {
  const transporter = getTransporter();
  if (!transporter) {
    console.log(`[DEV] Password reset code for ${to}: ${code}`);
    return;
  }

  await transporter.sendMail({
    from: process.env.SMTP_FROM || `"Bait El-Hakma" <${process.env.SMTP_USER}>`,
    to,
    subject: 'Your Password Reset Code - Bait El-Hakma',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f5f5f5; margin: 0; padding: 20px; }
          .container { max-width: 480px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08); }
          .header { background: linear-gradient(135deg, #7c3aed, #3b82f6); padding: 32px; text-align: center; }
          .header h1 { color: white; margin: 0; font-size: 24px; }
          .header p { color: rgba(255,255,255,0.8); margin: 8px 0 0; font-size: 14px; }
          .body { padding: 32px; text-align: center; }
          .code { font-size: 48px; font-weight: bold; letter-spacing: 8px; color: #1e293b; margin: 24px 0; font-family: 'Courier New', monospace; background: #f1f5f9; padding: 16px 24px; border-radius: 12px; display: inline-block; }
          .text { color: #64748b; font-size: 14px; line-height: 1.6; margin: 16px 0; }
          .footer { padding: 16px 32px; background: #f8fafc; text-align: center; border-top: 1px solid #e2e8f0; }
          .footer p { color: #94a3b8; font-size: 12px; margin: 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>House of Wisdom</h1>
            <p>Password Reset Request</p>
          </div>
          <div class="body">
            <p class="text">We received a request to reset your password. Use the code below to reset it:</p>
            <div class="code">${code}</div>
            <p class="text">This code expires in <strong>15 minutes</strong>.</p>
            <p class="text">If you didn't request this, you can safely ignore this email.</p>
          </div>
          <div class="footer">
            <p>Bait El-Hakma (House of Wisdom) &copy; ${new Date().getFullYear()}</p>
          </div>
        </div>
      </body>
      </html>
    `,
  });
}
