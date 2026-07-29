import React, { useState, useMemo } from 'react';
import { Search, BookOpen, CheckSquare, KanbanSquare, Timer, Trophy, Link2 } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useApp } from '@/context/AppContext';
import type { EntityType, LinkRef } from '@/types';

interface LinkPickerProps {
  currentEntityType: EntityType;
  currentEntityId: string;
  existingLinks: LinkRef[];
  onLinkAdd: (link: LinkRef) => void;
  onLinkRemove: (targetId: string) => void;
}

const ENTITY_ICONS: Record<string, React.ElementType> = {
  'pomodoro-session': Timer,
  'kanban-card': KanbanSquare,
  'todo': CheckSquare,
  'book': BookOpen,
  'challenge': Trophy,
};

const ENTITY_LABELS: Record<string, string> = {
  'pomodoro-session': 'Sessions',
  'kanban-card': 'Kanban Cards',
  'todo': 'Todos',
  'book': 'Books',
  'challenge': 'Challenges',
};

export function LinkPicker({ currentEntityType, currentEntityId, existingLinks, onLinkAdd, onLinkRemove }: LinkPickerProps) {
  const { state } = useApp();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] = useState<EntityType>('todo');

  const candidates = useMemo(() => {
    const existingIds = new Set(existingLinks.map(l => l.targetId));
    const items: { id: string; label: string; type: EntityType }[] = [];

    const addItems = (type: EntityType, list: any[], labelKey: string) => {
      for (const item of list) {
        if (item.id === currentEntityId) continue;
        if (existingIds.has(item.id)) continue;
        const label = item[labelKey] || item.content || item.name || item.id;
        if (search && !label.toLowerCase().includes(search.toLowerCase())) continue;
        items.push({ id: item.id, label, type });
      }
    };

    addItems('pomodoro-session', state.pomodoroHistory, 'customName');
    addItems('kanban-card', state.kanbanCards, 'title');
    addItems('todo', state.todos, 'content');
    addItems('book', state.books, 'title');
    addItems('challenge', state.challenges, 'name');

    return items;
  }, [state, search, existingLinks, currentEntityId]);

  const filtered = selectedType
    ? candidates.filter(c => c.type === selectedType)
    : candidates;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Link2 className="h-4 w-4" />
          Links ({existingLinks.length})
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="start">
        <div className="p-3 border-b">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search items to link..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-8 h-9"
            />
          </div>
          <div className="flex gap-1 mt-2 overflow-x-auto">
            {(['todo', 'book', 'kanban-card', 'pomodoro-session', 'challenge'] as EntityType[]).map(type => {
              const Icon = ENTITY_ICONS[type] || Timer;
              return (
                <button
                  key={type}
                  onClick={() => setSelectedType(selectedType === type ? '' as any : type)}
                  className={`flex items-center gap-1 rounded-md px-2 py-1 text-xs whitespace-nowrap transition-colors ${
                    selectedType === type ? 'bg-primary text-primary-foreground' : 'bg-muted hover:bg-accent'
                  }`}
                >
                  <Icon className="h-3 w-3" />
                  {ENTITY_LABELS[type]}
                </button>
              );
            })}
          </div>
        </div>

        {existingLinks.length > 0 && (
          <div className="px-3 py-2 border-b">
            <div className="text-xs font-medium text-muted-foreground mb-1">Linked items:</div>
            <div className="flex flex-wrap gap-1">
              {existingLinks.map(link => {
                const Icon = ENTITY_ICONS[link.targetType] || Timer;
                return (
                  <span
                    key={link.targetId}
                    className="inline-flex items-center gap-1 rounded-full bg-accent px-2 py-0.5 text-xs"
                  >
                    <Icon className="h-3 w-3" />
                    {link.label || link.targetId}
                    <button
                      onClick={() => onLinkRemove(link.targetId)}
                      className="ml-0.5 hover:text-destructive"
                    >
                      ×
                    </button>
                  </span>
                );
              })}
            </div>
          </div>
        )}

        <ScrollArea className="max-h-60">
          {filtered.length === 0 ? (
            <div className="p-6 text-center text-sm text-muted-foreground">
              {search ? 'No results found' : 'No items available'}
            </div>
          ) : (
            <div className="p-1 space-y-0.5">
              {filtered.slice(0, 50).map(item => {
                const Icon = ENTITY_ICONS[item.type] || Timer;
                return (
                  <button
                    key={`${item.type}-${item.id}`}
                    onClick={() => {
                      onLinkAdd({ targetType: item.type, targetId: item.id, label: item.label });
                      setOpen(false);
                    }}
                    className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm hover:bg-accent transition-colors"
                  >
                    <Icon className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                    <span className="truncate flex-1">{item.label}</span>
                    <span className="text-xs text-muted-foreground">{ENTITY_LABELS[item.type]}</span>
                  </button>
                );
              })}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
