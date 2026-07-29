import { useState, useEffect, useRef, useCallback } from 'react';
import { useApp } from '@/context/AppContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Plus, Hash, ListTodo, BookOpen, Timer, StickyNote, Columns3, Zap } from 'lucide-react';
import type { UniversalTag } from '@/types';

type QuickType = 'todo' | 'book' | 'session' | 'note' | 'task';

const TYPE_ICONS: Record<QuickType, typeof ListTodo> = {
  todo: ListTodo,
  book: BookOpen,
  session: Timer,
  note: StickyNote,
  task: Columns3,
};

const TYPE_LABELS: Record<QuickType, string> = {
  todo: 'Todo',
  book: 'Book',
  session: 'Session',
  note: 'Daily Note',
  task: 'Kanban Task',
};

function parseInput(input: string): { type: QuickType; content: string; tags: string[] } {
  let type: QuickType = 'todo';
  let remaining = input.trim();

  const prefixMatch = remaining.match(/^(todo|book|session|note|task):\s*/i);
  if (prefixMatch) {
    type = prefixMatch[1].toLowerCase() as QuickType;
    remaining = remaining.slice(prefixMatch[0].length);
  }

  const tags: string[] = [];
  const tagRegex = /#(\S+)/g;
  let tagMatch;
  while ((tagMatch = tagRegex.exec(remaining)) !== null) {
    tags.push(tagMatch[1]);
  }

  const content = remaining.replace(tagRegex, '').trim();

  return { type, content, tags };
}

function genId(): string {
  return crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36) + Math.random().toString(36).slice(2);
}

export function QuickCapture() {
  const { state, dispatch } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const { type, content, tags: parsedTags } = parseInput(inputValue);

  const suggestionItems = useCallback(() => {
    if (!inputValue.trim()) return [];
    const q = inputValue.toLowerCase();
    const results: { label: string; type: string }[] = [];

    for (const t of state.todos) {
      if (t.content.toLowerCase().includes(q)) {
        results.push({ label: t.content, type: 'todo' });
        if (results.length >= 5) break;
      }
    }
    if (results.length < 5) {
      for (const b of state.books) {
        if (b.title.toLowerCase().includes(q)) {
          results.push({ label: b.title, type: 'book' });
          if (results.length >= 5) break;
        }
      }
    }

    return results.slice(0, 5);
  }, [inputValue, state.todos, state.books]);

  const suggestions = suggestionItems();

  useEffect(() => {
    setSelectedIndex(-1);
  }, [inputValue]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '/' && !isOpen && !(e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement)) {
        e.preventDefault();
        setIsOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    if (selectedIndex >= 0 && listRef.current) {
      const el = listRef.current.children[selectedIndex] as HTMLElement;
      if (el) el.scrollIntoView({ block: 'nearest' });
    }
  }, [selectedIndex]);

  const handleSubmit = useCallback(() => {
    if (!content) return;

    const tags: UniversalTag[] = parsedTags.map(t => ({ name: t }));
    const id = genId();

    switch (type) {
      case 'todo':
        dispatch({
          type: 'ADD_TODO',
          payload: {
            id,
            content,
            completed: false,
            createdAt: new Date(),
            priority: 'medium' as const,
            tags,
            links: [],
          },
        });
        break;
      case 'book':
        dispatch({
          type: 'ADD_BOOK',
          payload: {
            id,
            title: content,
            author: '',
            coverUrl: '',
            description: '',
            tags,
            notes: [],
            content: [],
            links: [],
            status: 'want-to-read' as const,
            progress: 0,
            addedAt: new Date(),
          },
        });
        break;
      case 'session':
        dispatch({
          type: 'ADD_POMODORO_SESSION',
          payload: {
            id,
            startTime: new Date(),
            endTime: null,
            duration: 25,
            type: 'focus' as const,
            completed: false,
            customName: content,
            tags,
            links: [],
          },
        });
        break;
      case 'note': {
        const today = new Date().toISOString().slice(0, 10);
        dispatch({
          type: 'SET_DAILY_NOTE',
          payload: {
            id,
            date: today,
            content: [{ id: genId(), type: 'text' as const, content }],
            tags,
            links: [],
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        });
        break;
      }
      case 'task': {
        const firstColumnId = state.kanbanColumns[0]?.id || 'ideas';
        dispatch({
          type: 'ADD_KANBAN_CARD',
          payload: {
            id,
            columnId: firstColumnId,
            title: content,
            description: '',
            labels: [],
            priority: 'medium' as const,
            createdAt: new Date(),
            tags,
            links: [],
          },
        });
        break;
      }
    }

    setInputValue('');
    setIsOpen(false);
  }, [content, parsedTags, type, dispatch, state.kanbanColumns]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      if (inputValue.trim()) {
        setInputValue('');
      } else {
        setIsOpen(false);
      }
      return;
    }

    if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
        setInputValue(suggestions[selectedIndex].label);
        setSelectedIndex(-1);
      } else {
        handleSubmit();
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev < suggestions.length - 1 ? prev + 1 : prev));
      return;
    }

    if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev > 0 ? prev - 1 : -1));
      return;
    }
  };

  const TypeIcon = TYPE_ICONS[type];

  return (
    <>
      {!isOpen && (
        <Button
          size="icon"
          className="fixed bottom-6 right-6 z-50 h-12 w-12 rounded-full shadow-lg"
          onClick={() => setIsOpen(true)}
        >
          <Plus className="h-5 w-5" />
        </Button>
      )}

      {isOpen && (
        <div className="fixed bottom-0 left-0 right-0 z-50 flex justify-center pb-6 px-4 pointer-events-none">
          <Card className="w-full max-w-2xl pointer-events-auto shadow-2xl border-primary/20">
            <div className="flex items-center gap-2 px-3 py-2">
              {inputValue.trim() && (
                <span className="flex items-center gap-1 rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary shrink-0">
                  <TypeIcon className="h-3 w-3" />
                  {TYPE_LABELS[type]}
                </span>
              )}

              {parsedTags.length > 0 && (
                <div className="flex items-center gap-1 shrink-0">
                  {parsedTags.map(tag => (
                    <span key={tag} className="flex items-center gap-0.5 rounded-md bg-muted px-1.5 py-0.5 text-xs text-muted-foreground">
                      <Hash className="h-2.5 w-2.5" />
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              <Input
                ref={inputRef}
                value={inputValue}
                onChange={e => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder='Quick capture... (todo:, book:, session:, note:, task:)'
                className="flex-1 border-0 bg-transparent shadow-none focus-visible:ring-0 px-0"
              />

              <Button
                size="icon-sm"
                variant="ghost"
                disabled={!inputValue.trim()}
                onClick={handleSubmit}
              >
                <Zap className="h-4 w-4" />
              </Button>
            </div>

            {suggestions.length > 0 && (
              <div ref={listRef} className="border-t px-2 py-1 max-h-40 overflow-y-auto">
                {suggestions.map((item, i) => (
                  <button
                    key={`${item.type}-${item.label}`}
                    className={`w-full text-left px-2 py-1.5 rounded-md text-sm transition-colors ${
                      i === selectedIndex ? 'bg-accent text-accent-foreground' : 'hover:bg-accent/50'
                    }`}
                    onMouseDown={e => {
                      e.preventDefault();
                      setInputValue(item.label);
                    }}
                  >
                    <span className="text-muted-foreground text-xs mr-2">#{item.type}</span>
                    {item.label}
                  </button>
                ))}
              </div>
            )}
          </Card>
        </div>
      )}
    </>
  );
}
