import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import {
  GripVertical, ArrowUp, ArrowDown, Pin, Check, RotateCcw,
  Timer, Play, Columns3, BookOpen, CheckSquare,
  BarChart3, Sparkles, Trophy, Calendar,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const defaultOrder = ['pomodoro', 'video', 'kanban', 'library', 'todo', 'stats', 'motivation', 'challenges', 'daily'];

const iconMap: Record<string, React.ReactNode> = {
  pomodoro: <Timer className="w-4 h-4" />,
  video: <Play className="w-4 h-4" />,
  kanban: <Columns3 className="w-4 h-4" />,
  library: <BookOpen className="w-4 h-4" />,
  todo: <CheckSquare className="w-4 h-4" />,
  stats: <BarChart3 className="w-4 h-4" />,
  motivation: <Sparkles className="w-4 h-4" />,
  challenges: <Trophy className="w-4 h-4" />,
  daily: <Calendar className="w-4 h-4" />,
};

const tabLabels: Record<string, string> = {
  pomodoro: 'Pomodoro',
  video: 'Focus Video',
  kanban: 'Kanban',
  library: 'Library',
  todo: 'Tasks',
  stats: 'Stats',
  motivation: 'Inspire',
  challenges: 'Challenges',
  daily: 'Daily',
};

const pinnedTabs = [
  { id: 'profile', label: 'Profile' },
  { id: 'help', label: 'Help' },
];

export function TabOrderDialog() {
  const { state, dispatch } = useApp();
  const [localOrder, setLocalOrder] = useState([...state.tabOrder]);
  const [open, setOpen] = useState(false);

  const hasChanges = localOrder.join() !== state.tabOrder.join();
  const isDefault = localOrder.join() === defaultOrder.join();

  const moveUp = (index: number) => {
    if (index === 0) return;
    const next = [...localOrder];
    [next[index - 1], next[index]] = [next[index], next[index - 1]];
    setLocalOrder(next);
  };

  const moveDown = (index: number) => {
    if (index === localOrder.length - 1) return;
    const next = [...localOrder];
    [next[index], next[index + 1]] = [next[index + 1], next[index]];
    setLocalOrder(next);
  };

  const handleSave = () => {
    dispatch({ type: 'SET_TAB_ORDER', payload: localOrder });
    setOpen(false);
  };

  const handleReset = () => setLocalOrder([...defaultOrder]);

  const handleOpen = (o: boolean) => {
    if (o) setLocalOrder([...state.tabOrder]);
    setOpen(o);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon-sm" className="h-7 w-7 shrink-0 relative group" title="Customize tab order">
          <GripVertical className="w-3.5 h-3.5" />
          <span className="absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md border bg-popover px-2 py-1 text-[10px] text-popover-foreground shadow-sm opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
            Reorder tabs
          </span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-base flex items-center gap-2">
            <GripVertical className="w-4 h-4 text-muted-foreground" />
            Tab Order
          </DialogTitle>
          <p className="text-xs text-muted-foreground">
            Arrange your navigation tabs by moving them up or down.
            Profile and Help are always pinned at the end.
          </p>
        </DialogHeader>
        <div className="space-y-1 py-2">
          {localOrder.map((tabId, i) => (
            <div key={tabId} className={cn(
              'flex items-center gap-2 rounded-lg border px-3 py-2.5 text-sm transition-colors',
              'border-border/50 hover:border-border/80 hover:bg-accent/30'
            )}>
              <span className="flex items-center justify-center w-5 h-5 rounded-full bg-muted text-[10px] font-mono text-muted-foreground shrink-0">
                {i + 1}
              </span>
              <span className="text-muted-foreground shrink-0">{iconMap[tabId]}</span>
              <span className="flex-1 font-medium">{tabLabels[tabId] || tabId}</span>
              <div className="flex items-center gap-0.5">
                <Button variant="ghost" size="icon-sm" className="h-7 w-7" onClick={() => moveUp(i)} disabled={i === 0}>
                  <ArrowUp className="w-3.5 h-3.5" />
                </Button>
                <Button variant="ghost" size="icon-sm" className="h-7 w-7" onClick={() => moveDown(i)} disabled={i === localOrder.length - 1}>
                  <ArrowDown className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          ))}
          <div className="border-t border-border/50 pt-2 mt-2 space-y-1">
            <p className="text-[10px] text-muted-foreground/60 uppercase tracking-wider font-medium px-1 py-1">Pinned</p>
            {pinnedTabs.map(t => (
              <div key={t.id} className="flex items-center gap-2 rounded-lg border border-dashed border-muted px-3 py-2.5 text-sm text-muted-foreground">
                <span className="flex items-center justify-center w-5 h-5 shrink-0">
                  <Pin className="w-3.5 h-3.5" />
                </span>
                <span className="flex-1">{t.label}</span>
                <span className="text-[10px] text-muted-foreground/50">always visible</span>
              </div>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {!isDefault && (
            <Button variant="outline" size="sm" onClick={handleReset} className="gap-1.5 text-xs">
              <RotateCcw className="w-3.5 h-3.5" /> Reset
            </Button>
          )}
          <Button onClick={handleSave} className="flex-1 gap-2" disabled={!hasChanges}>
            <Check className="w-4 h-4" /> {hasChanges ? 'Save Order' : 'No Changes'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
