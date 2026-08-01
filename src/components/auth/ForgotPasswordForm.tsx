import { useState } from 'react';
import { authAPI } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Loader2, ArrowLeft, Mail, CheckCircle2, BookOpen, Timer, ListTodo, Trophy, Library, RefreshCw, Shield } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { IslamicWallpaper } from '@/components/IslamicWallpaper';
import './AuthLayout.css';

interface ForgotPasswordFormProps {
  onBack: () => void;
  onCodeVerified: (email: string, code: string) => void;
}

const features = [
  { icon: <BookOpen className="w-5 h-5" />, label: 'Full Quran Reader', color: 'text-amber-400' },
  { icon: <Timer className="w-5 h-5" />, label: 'Pomodoro Timer', color: 'text-blue-400' },
  { icon: <Library className="w-5 h-5" />, label: 'Book Library', color: 'text-emerald-400' },
  { icon: <ListTodo className="w-5 h-5" />, label: 'Tasks & Kanban', color: 'text-pink-400' },
  { icon: <Trophy className="w-5 h-5" />, label: 'Challenge Tracker', color: 'text-violet-400' },
  { icon: <RefreshCw className="w-5 h-5" />, label: 'Cloud Sync', color: 'text-cyan-400' },
];

export function ForgotPasswordForm({ onBack, onCodeVerified }: ForgotPasswordFormProps) {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);
  const [devCode, setDevCode] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const res = await authAPI.forgotPassword(email);
      setSent(true);
      if (res.devCode) setDevCode(res.devCode);
      toast.success('Reset code sent! Check your email.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send reset code');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth">
      <IslamicWallpaper variant="hero" forceDark />

      <div className="auth-container">
        {/* Left Side - Form */}
        <div className="auth-form-side">
          <motion.div
            className="auth-form-card"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="auth-form-header">
              <img src="/img/logo.png" alt="Bait El-Hakma" className="auth-logo" />
              <h1>{sent ? 'Check Your Email' : 'Reset Password'}</h1>
              <p>{sent ? `We sent a code to ${email}` : "Enter your email and we'll send you a reset code"}</p>
            </div>

            <AnimatePresence mode="wait">
              {sent ? (
                <motion.div
                  key="sent"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="auth-form-fields"
                >
                  <div className="auth-success">
                    <div className="auth-success-icon">
                      <CheckCircle2 className="w-16 h-16 text-emerald-400" />
                    </div>
                    <h2>Code Sent!</h2>
                    <p>Check your inbox for the 6-character reset code. It expires in 15 minutes.</p>
                  </div>

                  {devCode && (
                    <div style={{
                      border: '1px solid hsl(var(--gold) / 0.3)',
                      background: 'hsl(var(--gold) / 0.06)',
                      borderRadius: '10px',
                      padding: '1rem',
                      textAlign: 'center',
                    }}>
                      <p style={{ fontSize: '0.7rem', fontWeight: 600, color: 'hsl(var(--gold-light))', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 0.5rem' }}>
                        Email not configured — use this code:
                      </p>
                      <p style={{ fontSize: '1.5rem', fontFamily: 'monospace', fontWeight: 700, color: 'hsl(var(--text-primary))', letterSpacing: '0.15em', margin: 0 }}>
                        {devCode}
                      </p>
                    </div>
                  )}

                  <Button className="auth-btn-primary" onClick={() => onCodeVerified(email, '')}>
                    Enter Code
                  </Button>

                  <div style={{ textAlign: 'center' }}>
                    <button className="auth-link-btn" onClick={() => { setSent(false); }}>
                      Resend code
                    </button>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="form"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <form onSubmit={handleSubmit}>
                    <div className="auth-form-fields">
                      <AnimatePresence>
                        {error && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                          >
                            <div className="auth-alert">
                              <p>{error}</p>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      <div className="auth-field">
                        <Label htmlFor="reset-email">Email</Label>
                        <Input
                          id="reset-email"
                          type="email"
                          placeholder="you@example.com"
                          value={email}
                          onChange={(e) => { setEmail(e.target.value); setError(''); }}
                          required
                          className="auth-input"
                        />
                      </div>

                      <Button type="submit" className="auth-btn-primary" disabled={isLoading}>
                        {isLoading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Sending code...
                          </>
                        ) : (
                          <>
                            <Mail className="mr-2 h-4 w-4" />
                            Send Reset Code
                          </>
                        )}
                      </Button>
                    </div>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="auth-form-footer">
              <p><button onClick={onBack}><ArrowLeft className="w-4 h-4" style={{ display: 'inline', verticalAlign: 'middle', marginRight: '0.25rem' }} /> Back to sign in</button></p>
            </div>
          </motion.div>
        </div>

        {/* Right Side - Decorative */}
        <div className="auth-decor-side">
          <motion.div
            className="auth-decor-content"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <h2>House of Wisdom</h2>
            <p className="auth-decor-arabic">بيت الحكمة</p>
            <p className="auth-decor-desc">
              A digital sanctuary where knowledge meets faith. Read, learn, track your progress,
              and build lasting habits — all in one beautifully crafted space.
            </p>

            <div className="auth-decor-features">
              {features.map((f, i) => (
                <motion.div
                  key={i}
                  className="auth-decor-feature"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + i * 0.1 }}
                >
                  <span className={f.color}>{f.icon}</span>
                  <span>{f.label}</span>
                </motion.div>
              ))}
            </div>

            <div className="auth-decor-stats">
              <div className="auth-decor-stat">
                <span className="auth-decor-stat-num">114</span>
                <span className="auth-decor-stat-label">Surahs</span>
              </div>
              <div className="auth-decor-stat">
                <span className="auth-decor-stat-num">13</span>
                <span className="auth-decor-stat-label">Reciters</span>
              </div>
              <div className="auth-decor-stat">
                <span className="auth-decor-stat-num">100%</span>
                <span className="auth-decor-stat-label">Free</span>
              </div>
            </div>

            <div className="auth-decor-trust">
              <Shield className="w-4 h-4" />
              <span>Privacy First • No Ads • No Tracking</span>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
