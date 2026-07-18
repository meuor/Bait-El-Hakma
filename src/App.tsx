import { ThemeProvider } from '@/context/ThemeContext';
import { AppProvider, useApp } from '@/context/AppContext';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { TabNavigation } from '@/components/TabNavigation';
import { PomodoroTimer } from '@/sections/PomodoroTimer';
import { VideoPlayer } from '@/sections/VideoPlayer';
import { KanbanBoard } from '@/sections/KanbanBoard';
import { BookLibrary } from '@/sections/BookLibrary';
import { DailyTodo } from '@/sections/DailyTodo';
import { ActivityStats } from '@/sections/ActivityStats';
import { Motivation } from '@/sections/Motivation';
import { ChallengeTracker } from '@/sections/ChallengeTracker';
import { Toaster } from '@/components/ui/sonner';
import { motion, AnimatePresence } from 'framer-motion';

function AppContent() {
  const { state } = useApp();
  const { currentTab } = state;

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
      default:
        return <PomodoroTimer />;
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Header />
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
