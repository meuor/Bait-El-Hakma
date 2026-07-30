import { useState, useRef } from 'react';
import { useApp } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';
import {
  Tooltip, TooltipContent, TooltipProvider, TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  GripVertical, Pin, Check, RotateCcw,
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
  const dragItem = useRef<number | null>(null);
  const dragOverItem = useRef<number | null>(null);

  const hasChanges = localOrder.join() !== state.tabOrder.join();
  const isDefault = localOrder.join() === defaultOrder.join();

  const handleDragStart = (index: number) => {
    dragItem.current = index;
  };

  const handleDragOver = (index: number) => {
    dragOverItem.current = index;
  };

  const handleDrop = () => {
    if (dragItem.current === null || dragOverItem.current === null) return;
    if (dragItem.current === dragOverItem.current) return;
    const next = [...localOrder];
    const [moved] = next.splice(dragItem.current, 1);
    next.splice(dragOverItem.current, 0, moved);
    dragItem.current = null;
    dragOverItem.current = null;
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
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <DialogTrigger asChild>
              <Button variant="ghost" size="icon-sm" className="h-7 w-7 shrink-0">
                <GripVertical className="w-3.5 h-3.5" />
              </Button>
            </DialogTrigger>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="text-xs">
            Reorder tabs
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-base flex items-center gap-2">
            <GripVertical className="w-4 h-4 text-muted-foreground" />
            Tab Order
          </DialogTitle>
          <p className="text-xs text-muted-foreground">
            Drag tabs to rearrange. Profile and Help are always pinned at the end.
          </p>
        </DialogHeader>
        <div className="space-y-1 py-2">
          {localOrder.map((tabId, i) => (
            <div
              key={tabId}
              draggable
              onDragStart={() => handleDragStart(i)}
              onDragOver={(e) => { e.preventDefault(); handleDragOver(i); }}
              onDrop={handleDrop}
              onDragEnd={() => { dragItem.current = null; dragOverItem.current = null; }}
              className={cn(
                'flex items-center gap-2 rounded-lg border px-3 py-2.5 text-sm transition-colors cursor-grab active:cursor-grabbing',
                'border-border/50 hover:border-border/80 hover:bg-accent/30'
              )}
            >
              <span className="flex items-center justify-center w-5 h-5 rounded-full bg-muted text-[10px] font-mono text-muted-foreground shrink-0">
                {i + 1}
              </span>
              <span className="text-muted-foreground shrink-0">{iconMap[tabId]}</span>
              <span className="flex-1 font-medium">{tabLabels[tabId] || tabId}</span>
              <GripVertical className="w-3.5 h-3.5 text-muted-foreground/40 shrink-0" />
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
