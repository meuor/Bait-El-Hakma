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
    icon: <Timer className="w-4 h-4" />,
    description: 'Focus timer with customizable intervals',
  },
  {
    id: 'video',
    label: 'Focus Video',
    icon: <Play className="w-4 h-4" />,
    description: 'Ambient videos for deep focus',
  },
  {
    id: 'kanban',
    label: 'Kanban',
    icon: <Columns3 className="w-4 h-4" />,
    description: 'Visual task management board',
  },
  {
    id: 'library',
    label: 'Library',
    icon: <BookOpen className="w-4 h-4" />,
    description: 'Personal book collection tracker',
  },
  {
    id: 'todo',
    label: 'Daily Todo',
    icon: <CheckSquare className="w-4 h-4" />,
    description: 'Daily tasks with dual calendar',
  },
  {
    id: 'stats',
    label: 'Statistics',
    icon: <BarChart3 className="w-4 h-4" />,
    description: 'Productivity analytics and insights',
  },
  {
    id: 'motivation',
    label: 'Motivation',
    icon: <Sparkles className="w-4 h-4" />,
    description: 'Daily inspiration and wisdom',
  },
  {
    id: 'challenges',
    label: 'Challenges',
    icon: <Trophy className="w-4 h-4" />,
    description: 'Track your 100-day challenges',
  },
];

export function TabNavigation() {
  const { state, dispatch } = useApp();
  const { currentTab } = state;

  const handleTabChange = (tabId: AppTab) => {
    dispatch({ type: 'SET_TAB', payload: tabId });
  };

  return (
    <div className="border-b border-border bg-muted/30">
      <ScrollArea className="w-full whitespace-nowrap">
        <div className="container mx-auto px-4">
          <nav className="flex items-center gap-1 py-2">
            {tabs.map((tab) => (
              <Button
                key={tab.id}
                variant={currentTab === tab.id ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => handleTabChange(tab.id)}
                className={cn(
                  'relative flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200',
                  currentTab === tab.id
                    ? 'bg-secondary text-secondary-foreground font-medium'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                )}
                title={tab.description}
              >
                {tab.icon}
                <span className="hidden sm:inline">{tab.label}</span>
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
