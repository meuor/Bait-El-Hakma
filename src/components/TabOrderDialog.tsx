import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import {
  GripVertical, ArrowUp, ArrowDown, Pin, Check,
  Timer, Play, Columns3, BookOpen, CheckSquare,
  BarChart3, Sparkles, Trophy, Calendar,
} from 'lucide-react';

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

  const handleOpen = (o: boolean) => {
    if (o) setLocalOrder([...state.tabOrder]);
    setOpen(o);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon-sm" className="h-7 w-7 shrink-0" title="Reorder tabs">
          <GripVertical className="w-3.5 h-3.5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-base">Tab Order</DialogTitle>
        </DialogHeader>
        <div className="space-y-1 py-2">
          {localOrder.map((tabId, i) => (
            <div key={tabId} className="flex items-center gap-2 rounded-lg border border-border/50 px-3 py-2 text-sm">
              <span className="text-muted-foreground">{iconMap[tabId]}</span>
              <span className="flex-1">{tabLabels[tabId] || tabId}</span>
              <div className="flex items-center gap-0.5">
                <Button variant="ghost" size="icon-sm" className="h-6 w-6" onClick={() => moveUp(i)} disabled={i === 0}>
                  <ArrowUp className="w-3 h-3" />
                </Button>
                <Button variant="ghost" size="icon-sm" className="h-6 w-6" onClick={() => moveDown(i)} disabled={i === localOrder.length - 1}>
                  <ArrowDown className="w-3 h-3" />
                </Button>
              </div>
            </div>
          ))}
          <div className="border-t border-border/50 pt-2 mt-2 space-y-1">
            {pinnedTabs.map(t => (
              <div key={t.id} className="flex items-center gap-2 rounded-lg border border-dashed border-muted px-3 py-2 text-sm text-muted-foreground">
                <Pin className="w-3.5 h-3.5" />
                <span className="flex-1">{t.label}</span>
                <span className="text-[10px] text-muted-foreground/60">pinned</span>
              </div>
            ))}
          </div>
        </div>
        <Button onClick={handleSave} className="w-full gap-2">
          <Check className="w-4 h-4" /> Save Order
        </Button>
      </DialogContent>
    </Dialog>
  );
}
