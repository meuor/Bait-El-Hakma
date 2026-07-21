import { useEffect, useRef } from 'react';
import { useApp } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import type { AppTab } from '@/types';
import {
  Timer,
  Play,
  Columns3,
  BookOpen,
  CheckSquare,
  BarChart3,
  Sparkles,
  Trophy,
  UserCircle,
} from 'lucide-react';

interface Tab {
  id: AppTab;
  label: string;
  icon: React.ReactNode;
  description: string;
}

const tabs: Tab[] = [
  {
    id: 'pomodoro',
    label: 'Pomodoro',
    icon: <Timer className="w-5 h-5" />,
    description: 'Focus timer with customizable intervals',
  },
  {
    id: 'video',
    label: 'Focus Video',
    icon: <Play className="w-5 h-5" />,
    description: 'Ambient videos for deep focus',
  },
  {
    id: 'kanban',
    label: 'Kanban',
    icon: <Columns3 className="w-5 h-5" />,
    description: 'Visual task management board',
  },
  {
    id: 'library',
    label: 'Library',
    icon: <BookOpen className="w-5 h-5" />,
    description: 'Personal book collection tracker',
  },
  {
    id: 'todo',
    label: 'Tasks',
    icon: <CheckSquare className="w-5 h-5" />,
    description: 'Daily tasks with dual calendar',
  },
  {
    id: 'stats',
    label: 'Stats',
    icon: <BarChart3 className="w-5 h-5" />,
    description: 'Productivity analytics and insights',
  },
  {
    id: 'motivation',
    label: 'Inspire',
    icon: <Sparkles className="w-5 h-5" />,
    description: 'Daily inspiration and wisdom',
  },
  {
    id: 'challenges',
    label: 'Challenges',
    icon: <Trophy className="w-5 h-5" />,
    description: 'Track your 100-day challenges',
  },
  {
    id: 'profile',
    label: 'Profile',
    icon: <UserCircle className="w-5 h-5" />,
    description: 'Your account and settings',
  },
];

export function TabNavigation() {
  const { state, dispatch } = useApp();
  const { currentTab } = state;
  const activeTabRef = useRef<HTMLButtonElement>(null);

  const handleTabChange = (tabId: AppTab) => {
    dispatch({ type: 'SET_TAB', payload: tabId });
  };

  // Auto-scroll active tab into view
  useEffect(() => {
    if (activeTabRef.current) {
      activeTabRef.current.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
    }
  }, [currentTab]);

  return (
    <div className="border-b border-border bg-muted/30 sticky top-16 z-40">
      <ScrollArea className="w-full whitespace-nowrap">
        <div className="container mx-auto px-2 sm:px-4">
          <nav className="flex items-center gap-0.5 sm:gap-1 py-1.5 sm:py-2">
            {tabs.map((tab) => (
              <Button
                key={tab.id}
                ref={currentTab === tab.id ? activeTabRef : undefined}
                variant={currentTab === tab.id ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => handleTabChange(tab.id)}
                aria-label={tab.label}
                className={cn(
                  'relative flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-2 sm:py-2 rounded-lg transition-all duration-200 min-h-[44px] shrink-0',
                  currentTab === tab.id
                    ? 'bg-secondary text-secondary-foreground font-medium shadow-sm'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted active:scale-95'
                )}
              >
                {tab.icon}
                <span className="hidden sm:inline text-sm">{tab.label}</span>
                {currentTab === tab.id && (
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary" />
                )}
              </Button>
            ))}
          </nav>
        </div>
        <ScrollBar orientation="horizontal" className="invisible" />
      </ScrollArea>
    </div>
  );
}
