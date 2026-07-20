import { useState, useEffect, useCallback } from 'react';
import { ThemeProvider } from '@/context/ThemeContext';
import { AppProvider, useApp } from '@/context/AppContext';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { TabNavigation } from '@/components/TabNavigation';
import { LoginForm } from '@/components/auth/LoginForm';
import { RegisterForm } from '@/components/auth/RegisterForm';
import { ForgotPasswordForm } from '@/components/auth/ForgotPasswordForm';
import { ResetPasswordForm } from '@/components/auth/ResetPasswordForm';
import { ProfilePage } from '@/components/auth/ProfilePage';
import { PublicProfile } from '@/components/auth/PublicProfile';
import { PomodoroTimer } from '@/sections/PomodoroTimer';
import { VideoPlayer } from '@/sections/VideoPlayer';
import { KanbanBoard } from '@/sections/KanbanBoard';
import { BookLibrary } from '@/sections/BookLibrary';
import { DailyTodo } from '@/sections/DailyTodo';
import { ActivityStats } from '@/sections/ActivityStats';
import { Motivation } from '@/sections/Motivation';
import { ChallengeTracker } from '@/sections/ChallengeTracker';
import { Toaster } from '@/components/ui/sonner';
import { SyncStatus } from '@/components/SyncStatus';
import { MiniPlayer } from '@/components/MiniPlayer';
import { LandingPage } from '@/components/LandingPage';
import { motion } from 'framer-motion';
import { authAPI, type AuthUser } from '@/lib/api';
import { Loader2 } from 'lucide-react';

type AuthView = 'landing' | 'login' | 'register' | 'forgot-password' | 'reset-password';

function AppContent() {
  const { state } = useApp();
  const { currentTab } = state;

  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [authView, setAuthView] = useState<AuthView>('landing');
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [publicProfileUsername, setPublicProfileUsername] = useState<string | null>(null);
  const [resetEmail, setResetEmail] = useState('');
  const [resetCode, setResetCode] = useState('');

  // Check for /@username route on mount
  useEffect(() => {
    const path = window.location.pathname;
    const match = path.match(/^\/@([a-zA-Z0-9_-]+)$/);
    if (match) {
      setPublicProfileUsername(match[1]);
      setIsLoadingAuth(false);
      return;
    }

    const checkAuth = async () => {
      const storedToken = localStorage.getItem('bait-el-hakma-token');
      if (storedToken) {
        try {
          setToken(storedToken);
          const profile = await authAPI.getProfile();
          setUser(profile);
        } catch {
          localStorage.removeItem('bait-el-hakma-token');
          setToken(null);
          setUser(null);
        }
      }
      setIsLoadingAuth(false);
    };
    checkAuth();
  }, []);

  const handleLogin = useCallback((loggedInUser: AuthUser, newToken: string) => {
    setUser(loggedInUser);
    setToken(newToken);
  }, []);

  const handleLogout = useCallback(() => {
    setUser(null);
    setToken(null);
    setAuthView('landing');
  }, []);

  const handleUpdateUser = useCallback((updatedUser: AuthUser) => {
    setUser(updatedUser);
  }, []);

  // Public profile view
  if (publicProfileUsername) {
    return (
      <PublicProfile
        username={publicProfileUsername}
        onBack={() => {
          setPublicProfileUsername(null);
          window.history.pushState({}, '', '/');
        }}
      />
    );
  }

  if (isLoadingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-violet-50 to-blue-50 dark:from-violet-950/20 dark:to-blue-950/20">
        <div className="text-center">
          <img src="/logo.png" alt="Bait El-Hakma" className="w-16 h-16 rounded-2xl object-cover mx-auto mb-4" />
          <Loader2 className="h-8 w-8 animate-spin text-violet-600 mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user || !token) {
    if (authView === 'landing') {
      return (
        <LandingPage
          onLogin={() => setAuthView('login')}
          onRegister={() => setAuthView('register')}
        />
      );
    }
    if (authView === 'register') {
      return (
        <RegisterForm
          onLogin={handleLogin}
          onSwitchToLogin={() => setAuthView('login')}
        />
      );
    }
    if (authView === 'forgot-password') {
      return (
        <ForgotPasswordForm
          onBack={() => setAuthView('login')}
          onCodeVerified={(email, code) => {
            setResetEmail(email);
            setResetCode(code);
            setAuthView('reset-password');
          }}
        />
      );
    }
    if (authView === 'reset-password') {
      return (
        <ResetPasswordForm
          email={resetEmail}
          initialCode={resetCode}
          onBack={() => setAuthView('login')}
          onSuccess={() => setAuthView('login')}
        />
      );
    }
    return (
      <LoginForm
        onLogin={handleLogin}
        onSwitchToRegister={() => setAuthView('register')}
        onForgotPassword={() => setAuthView('forgot-password')}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Header user={user} onLogout={handleLogout} />
      <TabNavigation />
      
      <main className="flex-1 container mx-auto px-4 py-6 overflow-auto">
        <AnimatePresenceWrapper currentTab={currentTab}>
          {(['pomodoro', 'video', 'kanban', 'library', 'todo', 'stats', 'motivation', 'challenges', 'profile'] as const).map((tab) => (
            <TabPanel key={tab} tab={tab} currentTab={currentTab}>
              {tab === 'pomodoro' && <PomodoroTimer />}
              {tab === 'video' && <VideoPlayer />}
              {tab === 'kanban' && <KanbanBoard />}
              {tab === 'library' && <BookLibrary />}
              {tab === 'todo' && <DailyTodo />}
              {tab === 'stats' && <ActivityStats />}
              {tab === 'motivation' && <Motivation />}
              {tab === 'challenges' && <ChallengeTracker />}
              {tab === 'profile' && (
                <ProfilePage
                  user={user}
                  onUpdate={handleUpdateUser}
                  onLogout={handleLogout}
                />
              )}
            </TabPanel>
          ))}
        </AnimatePresenceWrapper>
      </main>
      
      <Footer />
      <MiniPlayer />
      <SyncStatus />
      <Toaster />
    </div>
  );
}

function AnimatePresenceWrapper({ children }: { currentTab: string; children: React.ReactNode }) {
  return <>{children}</>;
}

function TabPanel({ tab, currentTab, children }: { tab: string; currentTab: string; children: React.ReactNode }) {
  const isActive = currentTab === tab;
  return (
    <motion.div
      initial={false}
      animate={{
        opacity: isActive ? 1 : 0,
        y: isActive ? 0 : 10,
      }}
      transition={{ duration: 0.2 }}
      className="h-full"
      style={{ display: isActive ? 'block' : 'none' }}
    >
      {children}
    </motion.div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AppProvider>
        <AppContent />
      </AppProvider>
    </ThemeProvider>
  );
}

export default App;
