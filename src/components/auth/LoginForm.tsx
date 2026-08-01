import { useState } from 'react';
import { authAPI, type AuthUser } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { Eye, EyeOff, Loader2, ArrowRight, BookOpen, Timer, ListTodo, Trophy, Library, RefreshCw, Shield } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { IslamicWallpaper } from '@/components/IslamicWallpaper';
import './AuthLayout.css';

interface LoginFormProps {
  onLogin: (user: AuthUser, token: string) => void;
  onSwitchToRegister: () => void;
  onForgotPassword: () => void;
}

const features = [
  { icon: <BookOpen className="w-5 h-5" />, label: 'Full Quran Reader', color: 'text-amber-400' },
  { icon: <Timer className="w-5 h-5" />, label: 'Pomodoro Timer', color: 'text-blue-400' },
  { icon: <Library className="w-5 h-5" />, label: 'Book Library', color: 'text-emerald-400' },
  { icon: <ListTodo className="w-5 h-5" />, label: 'Tasks & Kanban', color: 'text-pink-400' },
  { icon: <Trophy className="w-5 h-5" />, label: 'Challenge Tracker', color: 'text-violet-400' },
  { icon: <RefreshCw className="w-5 h-5" />, label: 'Cloud Sync', color: 'text-cyan-400' },
];

export function LoginForm({ onLogin, onSwitchToRegister, onForgotPassword }: LoginFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [keepLoggedIn, setKeepLoggedIn] = useState(true);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const result = await authAPI.login(email, password);
      localStorage.setItem('bait-el-hakma-token', result.token);
      if (keepLoggedIn) {
        localStorage.setItem('bait-el-hakma-remember', 'true');
      }
      toast.success(`Welcome back, ${result.user.displayName}!`);
      onLogin(result.user, result.token);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Login failed';
      setError(msg);
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
              <h1>Welcome Back</h1>
              <p>Sign in to access your productivity dashboard</p>
            </div>

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
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setError(''); }}
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
                      onChange={(e) => { setPassword(e.target.value); setError(''); }}
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
                </div>

                <div className="auth-checkbox-row">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Checkbox
                      id="keep-logged-in"
                      checked={keepLoggedIn}
                      onCheckedChange={(checked) => setKeepLoggedIn(checked === true)}
                    />
                    <Label htmlFor="keep-logged-in" style={{ fontSize: '0.8rem', color: 'hsl(var(--text-secondary))', fontWeight: 400 }}>
                      Keep me logged in
                    </Label>
                  </div>
                  <button type="button" className="auth-link-btn" onClick={onForgotPassword}>
                    Forgot password?
                  </button>
                </div>

                <Button type="submit" className="auth-btn-primary" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    <>Sign In <ArrowRight className="w-4 h-4" /></>
                  )}
                </Button>
              </div>
            </form>

            <div className="auth-form-footer">
              <p>Don't have an account? <button onClick={onSwitchToRegister}>Sign up</button></p>
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
