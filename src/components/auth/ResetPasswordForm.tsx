import { useState, useRef, useEffect } from 'react';
import { authAPI } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';
import { Loader2, ArrowLeft, KeyRound, AlertCircle, CheckCircle2, Eye, EyeOff } from 'lucide-react';

interface ResetPasswordFormProps {
  email: string;
  initialCode?: string;
  onBack: () => void;
  onSuccess: () => void;
}

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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-violet-50 to-blue-50 dark:from-violet-950/20 dark:to-blue-950/20 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <img src="/logo.png" alt="Bait El-Hakma" className="w-16 h-16 rounded-2xl object-cover mx-auto mb-4" />
          <CardTitle className="text-2xl">
            {codeVerified ? 'New Password' : 'Enter Reset Code'}
          </CardTitle>
          <CardDescription>
            {codeVerified
              ? `Set a new password for ${email}`
              : `Enter the 6-character code sent to ${email}`
            }
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          {error && (
            <Alert variant="destructive" className="border-destructive/50 bg-destructive/10">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-sm font-medium">{error}</AlertDescription>
            </Alert>
          )}

          {!codeVerified ? (
            <div className="space-y-4">
              <Label>Reset Code</Label>
              <div className="flex items-center justify-center gap-2">
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
                    className="w-12 h-14 text-center text-xl font-mono font-bold uppercase text-center"
                    autoFocus={i === 0}
                  />
                ))}
                <span className="text-2xl font-bold text-muted-foreground mx-1">-</span>
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
                    className="w-12 h-14 text-center text-xl font-mono font-bold uppercase text-center"
                  />
                ))}
              </div>
              <p className="text-xs text-muted-foreground text-center">
                Code format: <span className="font-mono font-bold">ABC-123</span> (letters &amp; numbers)
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="new-password">New Password</Label>
                <div className="relative">
                  <Input
                    id="new-password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={newPassword}
                    onChange={(e) => { setNewPassword(e.target.value); setError(''); }}
                    required
                    minLength={6}
                    className="pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 p-0"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm Password</Label>
                <Input
                  id="confirm-password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => { setConfirmPassword(e.target.value); setError(''); }}
                  required
                  minLength={6}
                />
                {newPassword && confirmPassword && newPassword !== confirmPassword && (
                  <p className="text-xs text-destructive">Passwords do not match</p>
                )}
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex flex-col gap-3 pb-6">
          {!codeVerified ? (
            <Button className="w-full" onClick={handleVerifyCode} disabled={code.length !== 6 || verifying}>
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
          ) : (
            <Button className="w-full" onClick={handleResetPassword} disabled={isLoading || !newPassword || !confirmPassword}>
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
          )}
          <Button variant="link" className="text-muted-foreground" onClick={onBack}>
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to sign in
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
