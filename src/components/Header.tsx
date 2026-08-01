import { useState } from 'react';
import { useTheme } from '@/context/ThemeContext';
import { useApp } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import { 
  Sun, 
  Moon, 
  Palette, 
  Github, 
  User,
  LogOut,
  BarChart3,
  Cloud,
  CloudOff,
  RefreshCw,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import type { Theme } from '@/types';
import type { AuthUser } from '@/lib/api';
import { UpdateDialog } from '@/components/UpdateDialog';

const themes: { value: Theme; label: string; icon: React.ReactNode }[] = [
  { value: 'light', label: 'Light', icon: <Sun className="w-4 h-4" /> },
  { value: 'dark', label: 'Dark', icon: <Moon className="w-4 h-4" /> },
  { value: 'dracula', label: 'Dracula', icon: <Palette className="w-4 h-4" /> },
  { value: 'monokai', label: 'Monokai', icon: <Palette className="w-4 h-4" /> },
  { value: 'github', label: 'GitHub', icon: <Github className="w-4 h-4" /> },
];

interface HeaderProps {
  user: AuthUser;
  onLogout: () => void;
  onShowWhatsNew: () => void;
}

export function Header({ user, onLogout, onShowWhatsNew }: HeaderProps) {
  const { theme, setTheme } = useTheme();
  const { state, dispatch } = useApp();
  const { apiStatus, syncErrors } = state;
  const hasErrors = syncErrors.length > 0;
  const [showUpdateDialog, setShowUpdateDialog] = useState(false);

  const isElectron = typeof window !== 'undefined' && !!(window as any).electronAPI?.isElectron;

  const goToProfile = () => {
    dispatch({ type: 'SET_TAB', payload: 'profile' });
  };

  const currentTheme = themes.find(t => t.value === theme);

  const initials = user.displayName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <>
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50 relative">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <img src="/img/logo.png" alt="Bait El-Hakma" className="w-10 h-10 rounded-xl object-cover" />
            <div>
              <h1 className="text-xl font-bold tracking-tight">Bait El-Hakma</h1>
              <p className="text-xs text-muted-foreground">House of Wisdom</p>
            </div>
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center gap-2">
            {/* Cloud Sync Indicator */}
            <div className="flex items-center gap-1 text-xs text-muted-foreground" title={
              hasErrors ? 'Cloud sync failed' :
              apiStatus === 'online' ? 'Data saved to cloud' :
              apiStatus === 'offline' ? 'Data saved locally only' :
              'Connecting...'
            }>
              {hasErrors ? (
                <CloudOff className="h-4 w-4 text-red-500" />
              ) : apiStatus === 'online' ? (
                <Cloud className="h-4 w-4 text-green-500" />
              ) : apiStatus === 'offline' ? (
                <CloudOff className="h-4 w-4 text-orange-500" />
              ) : null}
            </div>

            {/* What's New Button */}
            <Button variant="ghost" size="sm" onClick={onShowWhatsNew}
              className="hidden sm:flex gap-1.5 text-xs"
              style={{ color: 'hsl(var(--gold-light))' }}>
              <Sparkles className="h-3.5 w-3.5" />
              What's New
            </Button>

            {/* Update Button (Electron only) */}
            {isElectron && (
              <Button variant="ghost" size="icon" onClick={() => setShowUpdateDialog(true)}
                title="Check for Updates">
                <RefreshCw className="h-4 w-4" />
              </Button>
            )}

            {/* Theme Selector */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                  {currentTheme?.icon}
                  <span className="sr-only">Select theme</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40">
                <DropdownMenuLabel>Select Theme</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {themes.map((t) => (
                  <DropdownMenuItem
                    key={t.value}
                    onClick={() => setTheme(t.value)}
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    {t.icon}
                    <span className={theme === t.value ? 'font-semibold' : ''}>
                      {t.label}
                    </span>
                    {theme === t.value && (
                      <span className="ml-auto text-xs text-primary">✓</span>
                    )}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                  {user.avatarUrl ? (
                    <img 
                      src={user.avatarUrl} 
                      alt={user.displayName} 
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                      <span className="text-primary-foreground text-sm font-medium">
                        {initials}
                      </span>
                    </div>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col">
                    <span>{user.displayName}</span>
                    <span className="text-xs text-muted-foreground">{user.email}</span>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={goToProfile} className="cursor-pointer">
                  <User className="w-4 h-4 mr-2" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={goToProfile} className="cursor-pointer">
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Statistics
                </DropdownMenuItem>
                {isElectron && (
                  <DropdownMenuItem onClick={() => setShowUpdateDialog(true)} className="cursor-pointer">
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Check for Updates
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem
                  onClick={() => window.open('https://github.com/meuor/Bait-El-Hakma/releases', '_blank')}
                  className="cursor-pointer"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Release Notes
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={onLogout}
                  className="cursor-pointer text-destructive"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Update Dialog */}
      <UpdateDialog open={showUpdateDialog} onOpenChange={setShowUpdateDialog} />
    </>
  );
}
