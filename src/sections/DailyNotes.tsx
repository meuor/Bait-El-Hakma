import { useState, useEffect, useCallback, useRef } from 'react';
import { useApp } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { TagEditor } from '@/components/TagEditor';
import { LinkPicker } from '@/components/LinkPicker';
import { BacklinksPanel } from '@/components/BacklinksPanel';
import { Calendar, ChevronLeft, ChevronRight, Plus, Heading, Type, Link2, Minus, List, Save, Timer, BookOpen, CheckSquare, X } from 'lucide-react';
import type { ContentBlock, ContentBlockType, DailyNote, UniversalTag, LinkRef, AppTab, EntityType } from '@/types';

function getToday(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

function genId(): string {
  return `block-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export function DailyNotes() {
  const { state, dispatch } = useApp();

  const [currentDate, setCurrentDate] = useState(getToday());
  const [noteId, setNoteId] = useState('');
  const [blocks, setBlocks] = useState<ContentBlock[]>([]);
  const [tags, setTags] = useState<UniversalTag[]>([]);
  const [links, setLinks] = useState<LinkRef[]>([]);

  const dateInputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();
  const prevDateRef = useRef('');
  const dailyNotesRef = useRef(state.dailyNotes);
  dailyNotesRef.current = state.dailyNotes;

  useEffect(() => {
    if (prevDateRef.current === currentDate) return;
    prevDateRef.current = currentDate;

    const existing = dailyNotesRef.current.find(n => n.date === currentDate);
    if (existing) {
      setNoteId(existing.id);
      setBlocks(existing.content);
      setTags(existing.tags);
      setLinks(existing.links);
    } else {
      const id = `daily-note-${currentDate}`;
      setNoteId(id);
      setBlocks([]);
      setTags([]);
      setLinks([]);
      dispatch({
        type: 'SET_DAILY_NOTE',
        payload: {
          id,
          date: currentDate,
          content: [],
          tags: [],
          links: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });
    }
  }, [currentDate, dispatch]);

  useEffect(() => {
    if (!noteId) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      const existing = dailyNotesRef.current.find(n => n.id === noteId);
      dispatch({
        type: 'SET_DAILY_NOTE',
        payload: {
          id: noteId,
          date: currentDate,
          content: blocks,
          tags,
          links,
          createdAt: existing?.createdAt || new Date(),
          updatedAt: new Date(),
        },
      });
    }, 2000);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [blocks, tags, links, noteId, currentDate, dispatch]);

  const updateBlock = useCallback((blockId: string, updates: Partial<ContentBlock>) => {
    setBlocks(prev => prev.map(b => (b.id === blockId ? { ...b, ...updates } : b)));
  }, []);

  const deleteBlock = useCallback((blockId: string) => {
    setBlocks(prev => prev.filter(b => b.id !== blockId));
  }, []);

  const addBlock = useCallback((type: ContentBlockType) => {
    const base: ContentBlock = { id: genId(), type, content: '' };
    if (type === 'divider') base.content = '---';
    if (type === 'link') base.url = '';
    setBlocks(prev => [...prev, base]);
  }, []);

  const addBlockAtIndex = useCallback((type: ContentBlockType, index: number) => {
    const base: ContentBlock = { id: genId(), type, content: '' };
    if (type === 'divider') base.content = '---';
    if (type === 'link') base.url = '';
    setBlocks(prev => [...prev.slice(0, index + 1), base, ...prev.slice(index + 1)]);
  }, []);

  const handleLinkAdd = useCallback((link: LinkRef) => {
    setLinks(prev => [...prev, link]);
  }, []);

  const handleLinkRemove = useCallback((targetId: string) => {
    setLinks(prev => prev.filter(l => l.targetId !== targetId));
  }, []);

  const goPrevDay = useCallback(() => {
    const d = new Date(currentDate + 'T00:00:00');
    d.setDate(d.getDate() - 1);
    setCurrentDate(
      `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
    );
  }, [currentDate]);

  const goNextDay = useCallback(() => {
    const d = new Date(currentDate + 'T00:00:00');
    d.setDate(d.getDate() + 1);
    setCurrentDate(
      `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
    );
  }, [currentDate]);

  const handleNavigate = useCallback((tab: AppTab) => {
    dispatch({ type: 'SET_TAB', payload: tab });
  }, [dispatch]);

  const isToday = currentDate === getToday();
  const incomingLinks = state.linkRegistry[noteId] || [];

  const todayStr = new Date().toDateString();
  const todayTodos = state.todos.filter(t => new Date(t.createdAt).toDateString() === todayStr);
  const todayBooks = state.books.filter(b => new Date(b.addedAt).toDateString() === todayStr);
  const todaySessions = state.pomodoroHistory.filter(
    s => new Date(s.startTime).toDateString() === todayStr
  );

  const blockActions: { type: ContentBlockType; icon: React.ElementType; label: string }[] = [
    { type: 'text', icon: Type, label: 'Text' },
    { type: 'heading', icon: Heading, label: 'Heading' },
    { type: 'divider', icon: Minus, label: 'Divider' },
    { type: 'link', icon: Link2, label: 'Link' },
    { type: 'list', icon: List, label: 'List' },
  ];

  return (
    <div className="tab-section space-y-6">
      {/* Date Navigator */}
      <Card>
        <div className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={goPrevDay}>
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <div className="text-center">
              <h2 className="text-lg font-semibold">{formatDate(currentDate)}</h2>
              {!isToday && <p className="text-xs text-muted-foreground">Not today</p>}
            </div>
            <Button variant="ghost" size="icon" onClick={goNextDay}>
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <Calendar
              className="h-5 w-5 cursor-pointer text-muted-foreground hover:text-foreground"
              onClick={() => dateInputRef.current?.showPicker()}
            />
            <input
              ref={dateInputRef}
              type="date"
              value={currentDate}
              onChange={e => setCurrentDate(e.target.value)}
              className="hidden"
            />
            {!isToday && (
              <Button variant="outline" size="sm" onClick={() => setCurrentDate(getToday())}>
                Today
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* Content Blocks */}
      <Card>
        <div className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-muted-foreground">Content</h3>
            <div className="flex gap-1">
              {blockActions.map(action => (
                <Button
                  key={action.type}
                  variant="ghost"
                  size="sm"
                  className="h-7 gap-1 text-xs"
                  onClick={() => addBlock(action.type)}
                >
                  <action.icon className="h-3.5 w-3.5" />
                  {action.label}
                </Button>
              ))}
            </div>
          </div>
          <Separator />
          <div className="space-y-2 min-h-[200px]">
            {blocks.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                Start writing or add a block above
              </p>
            ) : (
              blocks.map((block, i) => (
                <div key={block.id} className="group relative flex items-start gap-2">
                  <div className="flex-1">
                    {block.type === 'text' && (
                      <Textarea
                        value={block.content}
                        onChange={e => updateBlock(block.id, { content: e.target.value })}
                        placeholder="Type something..."
                        className="min-h-[44px] border-0 bg-transparent resize-none focus-visible:ring-0 p-0 text-sm"
                      />
                    )}
                    {block.type === 'heading' && (
                      <Input
                        value={block.content}
                        onChange={e => updateBlock(block.id, { content: e.target.value })}
                        placeholder="Heading..."
                        className="text-lg font-semibold border-0 bg-transparent focus-visible:ring-0 p-0 h-auto"
                      />
                    )}
                    {block.type === 'divider' && <Separator className="my-2" />}
                    {block.type === 'link' && (
                      <div className="flex flex-col sm:flex-row gap-2">
                        <Input
                          value={block.content}
                          onChange={e => updateBlock(block.id, { content: e.target.value })}
                          placeholder="Link label..."
                          className="flex-1 border-0 bg-transparent focus-visible:ring-0 p-0 h-auto"
                        />
                        <Input
                          value={block.url || ''}
                          onChange={e => updateBlock(block.id, { url: e.target.value })}
                          placeholder="https://..."
                          className="flex-1 border-0 bg-transparent focus-visible:ring-0 p-0 h-auto text-blue-500 text-sm"
                        />
                      </div>
                    )}
                    {block.type === 'list' && (
                      <Textarea
                        value={block.content}
                        onChange={e => updateBlock(block.id, { content: e.target.value })}
                        placeholder="One item per line..."
                        className="min-h-[60px] border-0 bg-transparent resize-none focus-visible:ring-0 p-0 text-sm font-mono"
                      />
                    )}
                  </div>
                  <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 pt-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => addBlockAtIndex('text', i)}
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => deleteBlock(block.id)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </Card>

      {/* Tags & Links */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <div className="p-4 space-y-3">
            <h3 className="text-sm font-medium text-muted-foreground">Tags</h3>
            <TagEditor tags={tags} onChange={setTags} />
          </div>
        </Card>
        <Card>
          <div className="p-4 space-y-3">
            <h3 className="text-sm font-medium text-muted-foreground">Links</h3>
            <LinkPicker
              currentEntityType="daily-note"
              currentEntityId={noteId}
              existingLinks={links}
              onLinkAdd={handleLinkAdd}
              onLinkRemove={handleLinkRemove}
            />
          </div>
        </Card>
      </div>

      {/* Backlinks */}
      {incomingLinks.length > 0 && (
        <BacklinksPanel
          targetId={noteId}
          incomingLinks={incomingLinks}
          onNavigate={handleNavigate}
        />
      )}

      {/* Today's Embedded Queries */}
      {(todayTodos.length > 0 || todayBooks.length > 0 || todaySessions.length > 0) && (
        <Card>
          <div className="p-4 space-y-4">
            <h3 className="text-sm font-medium text-muted-foreground">Today's Activity</h3>
            {todayTodos.length > 0 && (
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                  <CheckSquare className="h-3.5 w-3.5" />
                  Todos ({todayTodos.length})
                </div>
                <div className="space-y-0.5">
                  {todayTodos.map(t => (
                    <div key={t.id} className="flex items-center gap-2 text-sm">
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          t.completed ? 'bg-green-500' : 'bg-muted-foreground'
                        }`}
                      />
                      <span className={t.completed ? 'line-through text-muted-foreground' : ''}>
                        {t.content}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {todayBooks.length > 0 && (
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                  <BookOpen className="h-3.5 w-3.5" />
                  Books ({todayBooks.length})
                </div>
                <div className="space-y-0.5">
                  {todayBooks.map(b => (
                    <div key={b.id} className="flex items-center gap-2 text-sm">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                      <span>{b.title}</span>
                      <span className="text-muted-foreground">by {b.author}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {todaySessions.length > 0 && (
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                  <Timer className="h-3.5 w-3.5" />
                  Sessions ({todaySessions.length})
                </div>
                <div className="space-y-0.5">
                  {todaySessions.map(s => (
                    <div key={s.id} className="flex items-center gap-2 text-sm">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                      <span>
                        {s.type} &mdash; {s.duration}min
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  );
}