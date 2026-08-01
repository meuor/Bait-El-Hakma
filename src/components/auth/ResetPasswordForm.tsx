import { useState, useRef, useEffect } from 'react';
import { authAPI } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Loader2, ArrowLeft, KeyRound, CheckCircle2, Eye, EyeOff, BookOpen, Timer, ListTodo, Trophy, Library, RefreshCw, Shield } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { IslamicWallpaper } from '@/components/IslamicWallpaper';
import './AuthLayout.css';

interface ResetPasswordFormProps {
  email: string;
  initialCode?: string;
  onBack: () => void;
  onSuccess: () => void;
}

const features = [
  { icon: <BookOpen className="w-5 h-5" />, label: 'Full Quran Reader', color: 'text-amber-400' },
  { icon: <Timer className="w-5 h-5" />, label: 'Pomodoro Timer', color: 'text-blue-400' },
  { icon: <Library className="w-5 h-5" />, label: 'Book Library', color: 'text-emerald-400' },
  { icon: <ListTodo className="w-5 h-5" />, label: 'Tasks & Kanban', color: 'text-pink-400' },
  { icon: <Trophy className="w-5 h-5" />, label: 'Challenge Tracker', color: 'text-violet-400' },
  { icon: <RefreshCw className="w-5 h-5" />, label: 'Cloud Sync', color: 'text-cyan-400' },
];

export function ResetPasswordForm({ email, initialCode = '', onBack, onSuccess }: ResetPasswordFormProps) {
  const [code, setCode] = useState(initialCode.replace(/-/g, ''));
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [codeVerified, setCodeVerified] = useState(false);
  const [verifying, setVerifying] = useState(false);

  const codeInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (initialCode) {
      setCode(initialCode.replace(/-/g, ''));
    }
  }, [initialCode]);

  const handleCodeChange = (index: number, value: string) => {
    if (value.length > 1) value = value.slice(-1);
    if (value && !/^[a-zA-Z0-9]$/.test(value)) return;

    const newCode = code.split('');
    newCode[index] = value.toUpperCase();
    const newCodeStr = newCode.join('');
    setCode(newCodeStr);
    setError('');

    if (value && index < 5) {
      codeInputRefs.current[index + 1]?.focus();
    }
  };

  const handleCodeKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      codeInputRefs.current[index - 1]?.focus();
    }
    if (e.key === 'Enter') {
      handleVerifyCode();
    }
  };

  const handleCodePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/[^a-zA-Z0-9]/g, '').slice(0, 6);
    setCode(pasted.toUpperCase());
    if (pasted.length >= 6) {
      codeInputRefs.current[5]?.focus();
    } else {
      codeInputRefs.current[pasted.length]?.focus();
    }
  };

  const handleVerifyCode = async () => {
    if (code.length !== 6) {
      setError('Please enter the full 6-character code');
      return;
    }
    setVerifying(true);
    setError('');
    try {
      await authAPI.verifyResetCode(email, code);
      setCodeVerified(true);
      toast.success('Code verified! Set your new password.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid or expired code');
    } finally {
      setVerifying(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    setIsLoading(true);
    setError('');
    try {
      await authAPI.resetPassword(email, code, newPassword);
      toast.success('Password reset successfully! You can now sign in.');
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reset password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth">
      <IslamicWallpaper variant="hero" />

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
              <h1>{codeVerified ? 'New Password' : 'Enter Reset Code'}</h1>
              <p>{codeVerified ? `Set a new password for ${email}` : `Enter the 6-character code sent to ${email}`}</p>
            </div>

            <AnimatePresence mode="wait">
              {codeVerified ? (
                <motion.div
                  key="reset"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <form onSubmit={handleResetPassword}>
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
                        <Label htmlFor="new-password">New Password</Label>
                        <div className="auth-input-wrapper">
                          <Input
                            id="new-password"
                            type={showPassword ? 'text' : 'password'}
                            placeholder="••••••••"
                            value={newPassword}
                            onChange={(e) => { setNewPassword(e.target.value); setError(''); }}
                            required
                            minLength={6}
                            className="auth-input"
                          />
                          <button
                            type="button"
                            className="auth-input-toggle"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                      </div>

                      <div className="auth-field">
                        <Label htmlFor="confirm-password">Confirm Password</Label>
                        <Input
                          id="confirm-password"
                          type={showPassword ? 'text' : 'password'}
                          placeholder="••••••••"
                          value={confirmPassword}
                          onChange={(e) => { setConfirmPassword(e.target.value); setError(''); }}
                          required
                          minLength={6}
                          className="auth-input"
                        />
                        {newPassword && confirmPassword && newPassword !== confirmPassword && (
                          <p className="auth-field-error">Passwords do not match</p>
                        )}
                      </div>

                      <Button type="submit" className="auth-btn-primary" disabled={isLoading || !newPassword || !confirmPassword}>
                        {isLoading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Resetting...
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="mr-2 h-4 w-4" />
                            Reset Password
                          </>
                        )}
                      </Button>
                    </div>
                  </form>
                </motion.div>
              ) : (
                <motion.div
                  key="code"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="auth-form-fields"
                >
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
                    <Label>Reset Code</Label>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                      {[0, 1, 2].map((i) => (
                        <Input
                          key={i}
                          ref={(el) => { codeInputRefs.current[i] = el; }}
                          type="text"
                          inputMode="text"
                          maxLength={1}
                          value={code[i] || ''}
                          onChange={(e) => handleCodeChange(i, e.target.value)}
                          onKeyDown={(e) => handleCodeKeyDown(i, e)}
                          onPaste={handleCodePaste}
                          className="auth-input"
                          style={{ width: '48px', height: '56px', textAlign: 'center', fontSize: '1.25rem', fontFamily: 'monospace', fontWeight: 700 }}
                          autoFocus={i === 0}
                        />
                      ))}
                      <span style={{ fontSize: '1.25rem', fontWeight: 700, color: '#6b6380', margin: '0 0.25rem' }}>-</span>
                      {[3, 4, 5].map((i) => (
                        <Input
                          key={i}
                          ref={(el) => { codeInputRefs.current[i] = el; }}
                          type="text"
                          inputMode="text"
                          maxLength={1}
                          value={code[i] || ''}
                          onChange={(e) => handleCodeChange(i, e.target.value)}
                          onKeyDown={(e) => handleCodeKeyDown(i, e)}
                          onPaste={handleCodePaste}
                          className="auth-input"
                          style={{ width: '48px', height: '56px', textAlign: 'center', fontSize: '1.25rem', fontFamily: 'monospace', fontWeight: 700 }}
                        />
                      ))}
                    </div>
                    <p style={{ fontSize: '0.7rem', color: '#5a5270', textAlign: 'center', marginTop: '0.5rem' }}>
                      Code format: <span style={{ fontFamily: 'monospace', fontWeight: 700 }}>ABC-123</span> (letters &amp; numbers)
                    </p>
                  </div>

                  <Button className="auth-btn-primary" onClick={handleVerifyCode} disabled={code.length !== 6 || verifying}>
                    {verifying ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Verifying...
                      </>
                    ) : (
                      <>
                        <KeyRound className="mr-2 h-4 w-4" />
                        Verify Code
                      </>
                    )}
                  </Button>
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
