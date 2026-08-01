import { useState, useEffect, useCallback } from 'react';
import { authAPI, type AuthUser } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Eye, EyeOff, Loader2, CheckCircle2, XCircle, BookOpen, Timer, ListTodo, Trophy, Library, RefreshCw, ArrowRight, Sparkles, Shield } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { IslamicWallpaper } from '@/components/IslamicWallpaper';
import './AuthLayout.css';

interface RegisterFormProps {
  onLogin: (user: AuthUser, token: string) => void;
  onSwitchToLogin: () => void;
}

const features = [
  { icon: <BookOpen className="w-5 h-5" />, label: 'Full Quran Reader', color: 'text-amber-400' },
  { icon: <Timer className="w-5 h-5" />, label: 'Pomodoro Timer', color: 'text-blue-400' },
  { icon: <Library className="w-5 h-5" />, label: 'Book Library', color: 'text-emerald-400' },
  { icon: <ListTodo className="w-5 h-5" />, label: 'Tasks & Kanban', color: 'text-pink-400' },
  { icon: <Trophy className="w-5 h-5" />, label: 'Challenge Tracker', color: 'text-violet-400' },
  { icon: <RefreshCw className="w-5 h-5" />, label: 'Cloud Sync', color: 'text-cyan-400' },
];

export function RegisterForm({ onLogin, onSwitchToLogin }: RegisterFormProps) {
  const [step, setStep] = useState(1);
  const [displayName, setDisplayName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [registered, setRegistered] = useState(false);
  const [registeredName, setRegisteredName] = useState('');
  const [usernameStatus, setUsernameStatus] = useState<'idle' | 'checking' | 'available' | 'taken'>('idle');

  const checkUsernameAvailability = useCallback(async (value: string) => {
    if (value.length < 3) {
      setUsernameStatus('idle');
      return;
    }
    const clean = value.toLowerCase().replace(/[^a-z0-9_-]/g, '');
    if (clean !== value) {
      setUsername(clean);
    }
    setUsernameStatus('checking');
    try {
      const result = await authAPI.checkUsername(clean);
      setUsernameStatus(result.available ? 'available' : 'taken');
    } catch {
      setUsernameStatus('idle');
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (username) checkUsernameAvailability(username);
    }, 500);
    return () => clearTimeout(timer);
  }, [username, checkUsernameAvailability]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    if (username && usernameStatus !== 'available') {
      if (usernameStatus === 'taken') {
        toast.error('Username is already taken');
      } else if (username.length < 3) {
        toast.error('Username must be at least 3 characters');
      }
      return;
    }

    setIsLoading(true);

    try {
      const result = await authAPI.register(email, password, displayName, username || undefined);
      localStorage.setItem('bait-el-hakma-token', result.token);
      setRegisteredName(result.user.displayName);
      setRegistered(true);
      toast.success(`Welcome, ${result.user.displayName}! Your account has been created.`);
      setTimeout(() => {
        onLogin(result.user, result.token);
      }, 2500);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  const canProceedStep1 = displayName.trim().length > 0;
  const canProceedStep2 = email.trim().length > 0 && password.length >= 6;

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
              <h1>{registered ? 'Welcome!' : 'Create Account'}</h1>
              <p>{registered ? `Hello ${registeredName}, your workspace is ready` : 'Start your productivity journey today'}</p>
            </div>

            <AnimatePresence mode="wait">
              {registered ? (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="auth-success"
                >
                  <div className="auth-success-icon">
                    <CheckCircle2 className="w-16 h-16 text-emerald-400" />
                  </div>
                  <h2>Account Created!</h2>
                  <p>Welcome, {registeredName}! Your data will be synced to the cloud.</p>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '1.5rem' }}>
                    {features.map((f, i) => (
                      <motion.div
                        key={i}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          padding: '0.5rem 0.75rem',
                          background: 'hsl(var(--brand) / 0.06)',
                          border: '1px solid hsl(var(--brand) / 0.08)',
                          borderRadius: '8px',
                          fontSize: '0.75rem',
                          color: 'hsl(var(--brand-lighter))',
                        }}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 + i * 0.1 }}
                      >
                        <span className={f.color}>{f.icon}</span>
                        <span>{f.label}</span>
                      </motion.div>
                    ))}
                  </div>
                  <p style={{ fontSize: '0.8rem', color: 'hsl(var(--text-dim))' }}>Redirecting you to the app...</p>
                  <Loader2 className="h-6 w-6 animate-spin text-violet-400 mx-auto" />
                </motion.div>
              ) : (
                <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  {/* Progress Steps */}
                  <div className="auth-steps">
                    <div className={`auth-step ${step >= 1 ? 'active' : ''}`}>
                      <span>1</span>
                      <span className="auth-step-label">Profile</span>
                    </div>
                    <div className="auth-step-line" />
                    <div className={`auth-step ${step >= 2 ? 'active' : ''}`}>
                      <span>2</span>
                      <span className="auth-step-label">Account</span>
                    </div>
                  </div>

                  <form onSubmit={handleSubmit}>
                    <AnimatePresence mode="wait">
                      {step === 1 && (
                        <motion.div
                          key="step1"
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -20 }}
                          className="auth-form-fields"
                        >
                          <div className="auth-field">
                            <Label htmlFor="name">Display Name</Label>
                            <Input
                              id="name"
                              type="text"
                              placeholder="Your name"
                              value={displayName}
                              onChange={(e) => setDisplayName(e.target.value)}
                              required
                              className="auth-input"
                            />
                          </div>
                          <div className="auth-field">
                            <Label htmlFor="username">
                              Username
                              <span className="auth-label-hint">(optional, your public profile)</span>
                            </Label>
                            <div className="auth-input-wrapper">
                              <span className="auth-input-prefix">@</span>
                              <Input
                                id="username"
                                type="text"
                                placeholder="your_username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ''))}
                                className="auth-input auth-input-prefix-input"
                              />
                              <span className="auth-input-status">
                                {usernameStatus === 'checking' && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
                                {usernameStatus === 'available' && <CheckCircle2 className="h-4 w-4 text-emerald-400" />}
                                {usernameStatus === 'taken' && <XCircle className="h-4 w-4 text-red-400" />}
                              </span>
                            </div>
                            {username && usernameStatus === 'taken' && (
                              <p className="auth-field-error">This username is already taken</p>
                            )}
                            {username && usernameStatus === 'available' && (
                              <p className="auth-field-success">bait-el-hakma.vercel.app/@{username}</p>
                            )}
                          </div>
                          <Button
                            type="button"
                            className="auth-btn-primary"
                            onClick={() => setStep(2)}
                            disabled={!canProceedStep1}
                          >
                            Continue <ArrowRight className="w-4 h-4" />
                          </Button>
                        </motion.div>
                      )}

                      {step === 2 && (
                        <motion.div
                          key="step2"
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -20 }}
                          className="auth-form-fields"
                        >
                          <div className="auth-field">
                            <Label htmlFor="email">Email</Label>
                            <Input
                              id="email"
                              type="email"
                              placeholder="you@example.com"
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              required
                              className="auth-input"
                            />
                          </div>
                          <div className="auth-field">
                            <Label htmlFor="password">Password</Label>
                            <div className="auth-input-wrapper">
                              <Input
                                id="password"
                                type={showPassword ? 'text' : 'password'}
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
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
                            {password && password.length < 6 && (
                              <p className="auth-field-error">Password must be at least 6 characters</p>
                            )}
                          </div>
                          <div className="auth-field">
                            <Label htmlFor="confirmPassword">Confirm Password</Label>
                            <Input
                              id="confirmPassword"
                              type={showPassword ? 'text' : 'password'}
                              placeholder="••••••••"
                              value={confirmPassword}
                              onChange={(e) => setConfirmPassword(e.target.value)}
                              required
                              className="auth-input"
                            />
                            {confirmPassword && password !== confirmPassword && (
                              <p className="auth-field-error">Passwords do not match</p>
                            )}
                          </div>
                          <div className="auth-form-actions">
                            <Button type="button" variant="ghost" onClick={() => setStep(1)} className="auth-btn-back">
                              Back
                            </Button>
                            <Button type="submit" className="auth-btn-primary" disabled={isLoading || !canProceedStep2}>
                              {isLoading ? (
                                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating...</>
                              ) : (
                                <>Create Account <Sparkles className="w-4 h-4" /></>
                              )}
                            </Button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </form>

                  <div className="auth-form-footer">
                    <p>Already have an account? <button onClick={onSwitchToLogin}>Sign in</button></p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
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
