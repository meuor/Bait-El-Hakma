import React from 'react';
import { ArrowLeft, BookOpen, CheckSquare, KanbanSquare, Timer, Trophy, Hash } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import type { LinkRef, AppTab } from '@/types';

interface BacklinksPanelProps {
  targetId: string;
  incomingLinks: LinkRef[];
  onNavigate: (tab: AppTab, id: string) => void;
  onClose?: () => void;
}

const ENTITY_ICONS: Record<string, React.ElementType> = {
  'pomodoro-session': Timer,
  'kanban-card': KanbanSquare,
  'todo': CheckSquare,
  'book': BookOpen,
  'challenge': Trophy,
};

export function BacklinksPanel({ targetId: _targetId, incomingLinks, onNavigate, onClose }: BacklinksPanelProps) {
  if (!incomingLinks || incomingLinks.length === 0) return null;

  const getTargetTab = (type: string): AppTab => {
    switch (type) {
      case 'pomodoro-session': return 'pomodoro';
      case 'kanban-card': return 'kanban';
      case 'todo': return 'todo';
      case 'book': return 'library';
      case 'challenge': return 'challenges';
      default: return 'pomodoro';
    }
  };

  return (
    <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
      <div className="flex items-center justify-between border-b px-3 py-2">
        <div className="flex items-center gap-2 text-sm font-medium">
          <ArrowLeft className="h-4 w-4 text-muted-foreground" />
          Backlinks ({incomingLinks.length})
        </div>
        {onClose && (
          <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={onClose}>
            <span className="sr-only">Close</span>
            <Hash className="h-3 w-3" />
          </Button>
        )}
      </div>
      <ScrollArea className="max-h-48">
        <div className="p-2 space-y-1">
          {incomingLinks.map((link, i) => {
            const Icon = ENTITY_ICONS[link.targetType] || Timer;
            return (
              <button
                key={`${link.targetId}-${i}`}
                onClick={() => onNavigate(getTargetTab(link.targetType), link.targetId)}
                className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm hover:bg-accent transition-colors"
              >
                <Icon className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                <span className="truncate">{link.label || link.targetId}</span>
                <span className="ml-auto text-xs text-muted-foreground">{link.targetType}</span>
              </button>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}
