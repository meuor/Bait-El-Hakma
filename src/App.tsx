import { useState, useEffect, useCallback } from 'react';
import { ThemeProvider } from '@/context/ThemeContext';
import { AppProvider, useApp } from '@/context/AppContext';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { TabNavigation } from '@/components/TabNavigation';
import { LoginForm } from '@/components/auth/LoginForm';
import { RegisterForm } from '@/components/auth/RegisterForm';
import { ProfilePage } from '@/components/auth/ProfilePage';
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
import { motion, AnimatePresence } from 'framer-motion';
import { authAPI, type AuthUser } from '@/lib/api';
import { Loader2 } from 'lucide-react';

type AuthView = 'login' | 'register';

function AppContent() {
  const { state } = useApp();
  const { currentTab } = state;

  // Auth state
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [authView, setAuthView] = useState<AuthView>('login');
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);

  // Check for existing token on mount
  useEffect(() => {
    const checkAuth = async () => {
      const storedToken = localStorage.getItem('bait-el-hakma-token');
      if (storedToken) {
        try {
          setToken(storedToken);
          const profile = await authAPI.getProfile();
          setUser(profile);
        } catch {
          // Invalid token, clear it
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
    setAuthView('login');
  }, []);

  const handleUpdateUser = useCallback((updatedUser: AuthUser) => {
    setUser(updatedUser);
  }, []);

  // Loading state
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

  // Not authenticated - show login/register
  if (!user || !token) {
    if (authView === 'register') {
      return (
        <RegisterForm
          onLogin={handleLogin}
          onSwitchToLogin={() => setAuthView('login')}
        />
      );
    }
    return (
      <LoginForm
        onLogin={handleLogin}
        onSwitchToRegister={() => setAuthView('register')}
      />
    );
  }

  const renderTabContent = () => {
    switch (currentTab) {
      case 'pomodoro':
        return <PomodoroTimer />;
      case 'video':
        return <VideoPlayer />;
      case 'kanban':
        return <KanbanBoard />;
      case 'library':
        return <BookLibrary />;
      case 'todo':
        return <DailyTodo />;
      case 'stats':
        return <ActivityStats />;
      case 'motivation':
        return <Motivation />;
      case 'challenges':
        return <ChallengeTracker />;
      case 'profile':
        return (
          <ProfilePage
            user={user}
            onUpdate={handleUpdateUser}
            onLogout={handleLogout}
          />
        );
      default:
        return <PomodoroTimer />;
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Header user={user} onLogout={handleLogout} />
      <TabNavigation />
      
      <main className="flex-1 container mx-auto px-4 py-6 overflow-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="h-full"
          >
            {renderTabContent()}
          </motion.div>
        </AnimatePresence>
      </main>
      
      <Footer />
      <SyncStatus />
      <Toaster />
    </div>
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
