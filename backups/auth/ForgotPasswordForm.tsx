import { useState } from 'react';
import { authAPI } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';
import { Loader2, ArrowLeft, Mail, AlertCircle, CheckCircle2 } from 'lucide-react';

interface ForgotPasswordFormProps {
  onBack: () => void;
  onCodeVerified: (email: string, code: string) => void;
}

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

  if (sent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-violet-50 to-blue-50 dark:from-violet-950/20 dark:to-blue-950/20 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-4" />
            <CardTitle className="text-2xl">Check Your Email</CardTitle>
            <CardDescription>
              We sent a 6-character code to<br />
              <strong className="text-foreground">{email}</strong>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground text-center">
              Enter the code from your email to reset your password. The code expires in 15 minutes.
            </p>
            {devCode && (
              <div className="border border-amber-300 bg-amber-50 dark:bg-amber-950/30 rounded-lg p-4 text-center space-y-2">
                <p className="text-xs font-semibold text-amber-700 dark:text-amber-300 uppercase tracking-wide">Email not configured — use this code:</p>
                <p className="text-3xl font-mono font-bold text-foreground tracking-widest">{devCode}</p>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex flex-col gap-3 pb-6">
            <Button className="w-full" onClick={() => onCodeVerified(email, '')}>
              Enter Code
            </Button>
            <Button variant="ghost" className="gap-2" onClick={() => { setSent(false); }}>
              <Mail className="w-4 h-4" />
              Resend code
            </Button>
            <Button variant="link" className="text-muted-foreground" onClick={onBack}>
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back to sign in
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-violet-50 to-blue-50 dark:from-violet-950/20 dark:to-blue-950/20 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <img src="/logo.png" alt="Bait El-Hakma" className="w-16 h-16 rounded-2xl object-cover mx-auto mb-4" />
          <CardTitle className="text-2xl">Reset Password</CardTitle>
          <CardDescription>Enter your email and we'll send you a reset code</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-5">
            {error && (
              <Alert variant="destructive" className="border-destructive/50 bg-destructive/10">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-sm font-medium">{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="reset-email">Email</Label>
              <Input
                id="reset-email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(''); }}
                required
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-3 pb-6">
            <Button type="submit" className="w-full" disabled={isLoading}>
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
            <Button variant="link" className="text-muted-foreground" onClick={onBack}>
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back to sign in
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
