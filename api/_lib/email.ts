import { Resend } from 'resend';

const RESET_HTML = (code: string) => `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#f5f5f5;margin:0;padding:20px">
<div style="max-width:480px;margin:0 auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,.08)">
  <div style="background:linear-gradient(135deg,#7c3aed,#3b82f6);padding:32px;text-align:center">
    <h1 style="color:#fff;margin:0;font-size:24px">House of Wisdom</h1>
    <p style="color:rgba(255,255,255,.8);margin:8px 0 0;font-size:14px">Password Reset Request</p>
  </div>
  <div style="padding:32px;text-align:center">
    <p style="color:#64748b;font-size:14px;line-height:1.6;margin:16px 0">We received a request to reset your password. Use the code below:</p>
    <div style="font-size:48px;font-weight:bold;letter-spacing:8px;color:#1e293b;margin:24px 0;font-family:'Courier New',monospace;background:#f1f5f9;padding:16px 24px;border-radius:12px;display:inline-block">${code}</div>
    <p style="color:#64748b;font-size:14px;margin:16px 0">This code expires in <strong>15 minutes</strong>.</p>
    <p style="color:#64748b;font-size:14px;margin:16px 0">If you didn't request this, you can safely ignore this email.</p>
  </div>
  <div style="padding:16px 32px;background:#f8fafc;text-align:center;border-top:1px solid #e2e8f0">
    <p style="color:#94a3b8;font-size:12px;margin:0">Bait El-Hakma (House of Wisdom) &copy; ${new Date().getFullYear()}</p>
  </div>
</div>
</body>
</html>`;

const WELCOME_HTML = (name: string) => `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#f5f5f5;margin:0;padding:20px">
<div style="max-width:480px;margin:0 auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,.08)">
  <div style="background:linear-gradient(135deg,#7c3aed,#3b82f6);padding:32px;text-align:center">
    <h1 style="color:#fff;margin:0;font-size:24px">بيت الحكمة</h1>
    <p style="color:rgba(255,255,255,.8);margin:8px 0 0;font-size:14px">House of Wisdom</p>
  </div>
  <div style="padding:32px;text-align:center">
    <h2 style="color:#1e293b;margin:0 0 8px;font-size:20px">مرحبًا ${name} 👋</h2>
    <p style="color:#64748b;font-size:15px;line-height:1.7;margin:16px 0">
      تم إنشاء حسابك بنجاح! أهلاً بك في <strong>بيت الحكمة</strong>.
    </p>
    <div style="text-align:left;background:#f8fafc;border-radius:12px;padding:20px;margin:20px 0;border:1px solid #e2e8f0">
      <p style="color:#1e293b;font-size:14px;font-weight:600;margin:0 0 12px">✨ ما الذي يمكنك فعله:</p>
      <table style="width:100%;border-collapse:collapse">
        <tr><td style="padding:6px 0;color:#64748b;font-size:13px">📖</td><td style="padding:6px 0;color:#64748b;font-size:13px">قراءة القرآن مع تتبع التقدم</td></tr>
        <tr><td style="padding:6px 0;color:#64748b;font-size:13px">📚</td><td style="padding:6px 0;color:#64748b;font-size:13px">إدارة مكتبتك الخاصة بالكتب</td></tr>
        <tr><td style="padding:6px 0;color:#64748b;font-size:13px">⏱️</td><td style="padding:6px 0;color:#64748b;font-size:13px">مؤقت بومودورو للتركيز</td></tr>
        <tr><td style="padding:6px 0;color:#64748b;font-size:13px">📋</td><td style="padding:6px 0;color:#64748b;font-size:13px">قوائم مهام + كانبان</td></tr>
        <tr><td style="padding:6px 0;color:#64748b;font-size:13px">🏆</td><td style="padding:6px 0;color:#64748b;font-size:13px">تحديات التعلم والمتابعة</td></tr>
        <tr><td style="padding:6px 0;color:#64748b;font-size:13px">🔄</td><td style="padding:6px 0;color:#64748b;font-size:13px">مزامنة البيانات سحابيًا</td></tr>
      </table>
    </div>
    <a href="https://bait-el-hakma.vercel.app" style="display:inline-block;background:linear-gradient(135deg,#7c3aed,#3b82f6);color:#fff;text-decoration:none;padding:12px 32px;border-radius:8px;font-weight:600;font-size:15px;margin:16px 0">ابدأ الآن</a>
    <p style="color:#94a3b8;font-size:12px;margin:20px 0 0">باستخدام هذا التطبيق، أنت توافق على سياسة الخصوصية الخاصة بنا</p>
  </div>
  <div style="padding:16px 32px;background:#f8fafc;text-align:center;border-top:1px solid #e2e8f0">
    <p style="color:#94a3b8;font-size:12px;margin:0">Bait El-Hakma (House of Wisdom) &copy; ${new Date().getFullYear()}</p>
  </div>
</div>
</body>
</html>`;

export async function sendWelcomeEmail(to: string, name: string): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.SMTP_FROM || 'Bait El-Hakma <onboarding@resend.dev>';

  if (!apiKey) {
    console.log(`[DEV] Welcome email skipped for ${to} — RESEND_API_KEY not set`);
    return;
  }

  const resend = new Resend(apiKey);

  await resend.emails.send({
    from,
    to,
    subject: 'مرحبًا بك في بيت الحكمة 🏠✨',
    html: WELCOME_HTML(name),
  });
}

export async function sendPasswordResetEmail(to: string, code: string): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.SMTP_FROM || 'Bait El-Hakma <onboarding@resend.dev>';

  if (!apiKey) {
    console.warn('[DEV] RESEND_API_KEY not set. Reset code logged below:');
    console.warn(`[DEV] Password reset code for ${to}: ${code}`);
    return;
  }

  const resend = new Resend(apiKey);

  await resend.emails.send({
    from,
    to,
    subject: 'Your Password Reset Code - Bait El-Hakma',
    html: RESET_HTML(code),
  });
}
