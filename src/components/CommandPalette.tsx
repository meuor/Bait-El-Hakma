import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Search, BookOpen, CheckSquare, KanbanSquare, Timer, Trophy,
  Hash, Sun, Moon, Monitor, Command
} from 'lucide-react';
import { CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { useApp } from '@/context/AppContext';
import type { EntityType, AppTab } from '@/types';

interface SearchResult {
  id: string;
  label: string;
  sublabel?: string;
  type: EntityType;
  tab: AppTab;
  tags?: string[];
}

const ENTITY_ICONS: Record<string, React.ElementType> = {
  'pomodoro-session': Timer,
  'kanban-card': KanbanSquare,
  'todo': CheckSquare,
  'book': BookOpen,
  'challenge': Trophy,
};

export function CommandPalette() {
  const { state, dispatch } = useApp();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen(o => !o);
      }
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  const results = useMemo(() => {
    const items: SearchResult[] = [];

    state.pomodoroHistory.forEach(s => items.push({
      id: s.id,
      label: s.customName || `${s.type} session`,
      sublabel: `${s.duration}m · ${s.activityMode || 'focus'}`,
      type: 'pomodoro-session',
      tab: 'pomodoro',
      tags: s.tags?.map(t => t.name),
    }));

    state.kanbanCards.forEach(c => items.push({
      id: c.id,
      label: c.title,
      sublabel: c.description?.slice(0, 60),
      type: 'kanban-card',
      tab: 'kanban',
      tags: c.tags?.map(t => t.name),
    }));

    state.todos.forEach(t => items.push({
      id: t.id,
      label: t.content,
      sublabel: t.completed ? 'Done' : `${t.priority} priority`,
      type: 'todo',
      tab: 'todo',
      tags: t.tags?.map(tag => tag.name),
    }));

    state.books.forEach(b => items.push({
      id: b.id,
      label: b.title,
      sublabel: b.author,
      type: 'book',
      tab: 'library',
      tags: b.tags?.map(t => t.name),
    }));

    state.challenges.forEach(c => items.push({
      id: c.id,
      label: c.name,
      sublabel: `${c.totalDays} days`,
      type: 'challenge',
      tab: 'challenges',
      tags: c.tags?.map(t => t.name),
    }));

    return items;
  }, [state]);

  const handleSelect = useCallback((item: SearchResult) => {
    dispatch({ type: 'SET_TAB', payload: item.tab });
    setOpen(false);
  }, [dispatch]);

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Search everything (books, todos, sessions, cards, challenges)..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Suggestions">
          <CommandItem onSelect={() => { dispatch({ type: 'SET_TAB', payload: 'pomodoro' }); setOpen(false); }}>
            <Timer className="mr-2 h-4 w-4" /> Focus Timer
          </CommandItem>
          <CommandItem onSelect={() => { dispatch({ type: 'SET_TAB', payload: 'library' }); setOpen(false); }}>
            <BookOpen className="mr-2 h-4 w-4" /> Book Library
          </CommandItem>
          <CommandItem onSelect={() => { dispatch({ type: 'SET_TAB', payload: 'todo' }); setOpen(false); }}>
            <CheckSquare className="mr-2 h-4 w-4" /> Daily Tasks
          </CommandItem>
          <CommandItem onSelect={() => { dispatch({ type: 'SET_TAB', payload: 'kanban' }); setOpen(false); }}>
            <KanbanSquare className="mr-2 h-4 w-4" /> Kanban Board
          </CommandItem>
          <CommandItem onSelect={() => { dispatch({ type: 'SET_TAB', payload: 'challenges' }); setOpen(false); }}>
            <Trophy className="mr-2 h-4 w-4" /> Challenges
          </CommandItem>
        </CommandGroup>
        {(['todo', 'book', 'kanban-card', 'pomodoro-session', 'challenge'] as EntityType[]).map(type => {
          const group = results.filter(r => r.type === type);
          if (group.length === 0) return null;
          const Icon = ENTITY_ICONS[type] || Timer;
          const label = type === 'pomodoro-session' ? 'Sessions' : type === 'kanban-card' ? 'Kanban Cards' : type.charAt(0).toUpperCase() + type.slice(1) + 's';
          return (
            <CommandGroup key={type} heading={label}>
              {group.slice(0, 10).map(item => (
                <CommandItem key={`${item.type}-${item.id}`} onSelect={() => handleSelect(item)}>
                  <Icon className="mr-2 h-4 w-4 shrink-0" />
                  <div className="flex flex-col">
                    <span>{item.label}</span>
                    {item.sublabel && <span className="text-xs text-muted-foreground">{item.sublabel}</span>}
                  </div>
                  {item.tags && item.tags.length > 0 && (
                    <div className="ml-auto flex gap-1">
                      {item.tags.slice(0, 3).map(t => (
                        <span key={t} className="inline-flex items-center gap-0.5 rounded bg-muted px-1.5 py-0.5 text-[10px]">
                          <Hash className="h-2.5 w-2.5" />{t}
                        </span>
                      ))}
                    </div>
                  )}
                </CommandItem>
              ))}
            </CommandGroup>
          );
        })}
      </CommandList>
    </CommandDialog>
  );
}
