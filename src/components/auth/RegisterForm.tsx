import { useState } from 'react';
import { authAPI, type AuthUser } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Eye, EyeOff, Loader2, CheckCircle2 } from 'lucide-react';

interface RegisterFormProps {
  onLogin: (user: AuthUser, token: string) => void;
  onSwitchToLogin: () => void;
}

export function RegisterForm({ onLogin, onSwitchToLogin }: RegisterFormProps) {
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [registered, setRegistered] = useState(false);
  const [registeredName, setRegisteredName] = useState('');

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

    setIsLoading(true);

    try {
      const result = await authAPI.register(email, password, displayName);
      localStorage.setItem('bait-el-hakma-token', result.token);
      setRegisteredName(result.user.displayName);
      setRegistered(true);
      toast.success(`Welcome, ${result.user.displayName}! Your account has been created.`);
      // Delay login to show success message
      setTimeout(() => {
        onLogin(result.user, result.token);
      }, 2000);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-violet-50 to-blue-50 dark:from-violet-950/20 dark:to-blue-950/20 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <img src="/logo.png" alt="Bait El-Hakma" className="w-16 h-16 rounded-2xl object-cover mx-auto mb-4" />
          <CardTitle className="text-2xl">
            {registered ? 'Account Created!' : 'Create Account'}
          </CardTitle>
          <CardDescription>
            {registered 
              ? `Welcome ${registeredName}! Your data will be synced to the cloud.`
              : 'Start your productivity journey today'
            }
          </CardDescription>
        </CardHeader>

        {registered ? (
          <CardContent className="text-center space-y-4">
            <div className="p-4 rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800">
              <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-2" />
              <p className="font-medium text-green-700 dark:text-green-300">
                Registration Successful!
              </p>
              <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                Your account has been created and your data will be stored securely in the cloud.
              </p>
            </div>
            <p className="text-sm text-muted-foreground">
              Redirecting you to the app...
            </p>
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground mx-auto" />
          </CardContent>
        ) : (
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Display Name</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Your name"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-4">
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating account...
                  </>
                ) : (
                  'Create Account'
                )}
              </Button>
              <p className="text-sm text-muted-foreground text-center">
                Already have an account?{' '}
                <Button variant="link" className="p-0 h-auto" onClick={onSwitchToLogin}>
                  Sign in
                </Button>
              </p>
            </CardFooter>
          </form>
        )}
      </Card>
    </div>
  );
}
