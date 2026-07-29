import { useState, useEffect, useCallback } from 'react';
import { useApp } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { BookOpen, CheckSquare, Columns3, Timer, Trophy, Save, Trash2, Play, Clock, Calendar, Hash, FileText } from 'lucide-react';
import type { EntityType } from '@/types';

const STORAGE_KEY = 'bait-el-hakma-templates';

interface ItemTemplate {
  id: string;
  name: string;
  description: string;
  entityType: EntityType;
  data: Record<string, any>;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
  useCount: number;
}

const ENTITY_ICONS: Record<EntityType, typeof BookOpen> = {
  'pomodoro-session': Timer,
  'kanban-card': Columns3,
  'todo': CheckSquare,
  'book': BookOpen,
  'challenge': Trophy,
  'book-note': BookOpen,
  'daily-note': Calendar,
};

const ENTITY_LABELS: Record<EntityType, string> = {
  'pomodoro-session': 'Pomodoro Session',
  'kanban-card': 'Kanban Card',
  'todo': 'Task',
  'book': 'Book',
  'challenge': 'Challenge',
  'book-note': 'Book Note',
  'daily-note': 'Daily Note',
};

const ENTITY_COLORS: Record<EntityType, string> = {
  'pomodoro-session': 'text-red-500 border-red-500/30 bg-red-500/10',
  'kanban-card': 'text-purple-500 border-purple-500/30 bg-purple-500/10',
  'todo': 'text-blue-500 border-blue-500/30 bg-blue-500/10',
  'book': 'text-amber-500 border-amber-500/30 bg-amber-500/10',
  'challenge': 'text-emerald-500 border-emerald-500/30 bg-emerald-500/10',
  'book-note': 'text-pink-500 border-pink-500/30 bg-pink-500/10',
  'daily-note': 'text-cyan-500 border-cyan-500/30 bg-cyan-500/10',
};

const ENTITY_TYPES: EntityType[] = [
  'todo',
  'kanban-card',
  'book',
  'challenge',
  'pomodoro-session',
  'daily-note',
  'book-note',
];

function genId(): string {
  return crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36) + Math.random().toString(36).slice(2);
}

function replaceSlots(value: string): string {
  const now = new Date();
  return value
    .replace(/\{\{date\}\}/g, now.toISOString().slice(0, 10))
    .replace(/\{\{time\}\}/g, now.toTimeString().slice(0, 5))
    .replace(/\{\{now\}\}/g, now.toISOString());
}

function deepReplaceSlots(obj: any): any {
  if (typeof obj === 'string') return replaceSlots(obj);
  if (Array.isArray(obj)) return obj.map(deepReplaceSlots);
  if (obj && typeof obj === 'object') {
    const result: Record<string, any> = {};
    for (const [key, value] of Object.entries(obj)) {
      result[key] = deepReplaceSlots(value);
    }
    return result;
  }
  return obj;
}

function convertDates(obj: any): any {
  if (typeof obj === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(obj)) return new Date(obj);
  if (Array.isArray(obj)) return obj.map(convertDates);
  if (obj && typeof obj === 'object') {
    const result: Record<string, any> = {};
    for (const [key, value] of Object.entries(obj)) {
      result[key] = convertDates(value);
    }
    return result;
  }
  return obj;
}

function buildDefaultData(type: EntityType, name: string, description: string): Record<string, any> {
  const now = new Date().toISOString();
  switch (type) {
    case 'todo':
      return { content: name, completed: false, priority: 'medium', createdAt: now, tags: [], links: [] };
    case 'book':
      return { title: name, author: '', coverUrl: '', description, tags: [], notes: [], content: [], links: [], status: 'want-to-read', progress: 0, addedAt: now };
    case 'kanban-card':
      return { columnId: '', title: name, description, labels: [], priority: 'medium', createdAt: now, tags: [], links: [] };
    case 'pomodoro-session':
      return { startTime: now, endTime: null, duration: 25, type: 'focus', completed: false, customName: name, tags: [], links: [] };
    case 'challenge':
      return { name, description, totalDays: 30, completedDays: [], startDate: now, color: '#8b5cf6', icon: 'Trophy', tags: [], links: [] };
    case 'book-note':
      return { content: description || name, pageNumber: undefined, createdAt: now };
    case 'daily-note':
      return { date: now.slice(0, 10), content: [{ id: genId(), type: 'text', content: description || name }], tags: [], links: [], createdAt: now, updatedAt: now };
  }
}

function parseTemplateDates(t: any): ItemTemplate {
  return { ...t, createdAt: new Date(t.createdAt), updatedAt: new Date(t.updatedAt) };
}

export function TemplateManager() {
  const { state, dispatch } = useApp();
  const [templates, setTemplates] = useState<ItemTemplate[]>([]);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [selectedType, setSelectedType] = useState<EntityType>('todo');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [templateTags, setTemplateTags] = useState<string[]>([]);
  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(new Set());

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setTemplates(parsed.map(parseTemplateDates));
      }
    } catch {}
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(templates));
  }, [templates]);

  const handleAddTag = useCallback(() => {
    const tag = tagInput.trim().toLowerCase();
    if (tag && !templateTags.includes(tag)) {
      setTemplateTags(prev => [...prev, tag]);
      setTagInput('');
    }
  }, [tagInput, templateTags]);

  const handleTagKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  }, [handleAddTag]);

  const handleRemoveTag = useCallback((tag: string) => {
    setTemplateTags(prev => prev.filter(t => t !== tag));
  }, []);

  const resetSaveForm = useCallback(() => {
    setName('');
    setDescription('');
    setTemplateTags([]);
    setTagInput('');
    setSelectedType('todo');
  }, []);

  const handleSaveTemplate = useCallback(() => {
    if (!name.trim()) return;

    const now = new Date();
    const template: ItemTemplate = {
      id: genId(),
      name: name.trim(),
      description: description.trim(),
      entityType: selectedType,
      data: buildDefaultData(selectedType, name.trim(), description.trim()),
      tags: [...templateTags],
      createdAt: now,
      updatedAt: now,
      useCount: 0,
    };

    setTemplates(prev => [...prev, template]);
    resetSaveForm();
    setSaveDialogOpen(false);
  }, [name, description, selectedType, templateTags, resetSaveForm]);

  const handleDeleteTemplate = useCallback((id: string) => {
    setTemplates(prev => prev.filter(t => t.id !== id));
  }, []);

  const handleApplyTemplate = useCallback((template: ItemTemplate) => {
    const id = genId();
    const data = deepReplaceSlots(template.data);

    switch (template.entityType) {
      case 'todo':
        dispatch({
          type: 'ADD_TODO',
          payload: {
            id,
            content: data.content || template.name,
            completed: data.completed ?? false,
            createdAt: convertDates(data.createdAt) || new Date(),
            priority: data.priority || 'medium',
            tags: (data.tags || []).map((t: any) => typeof t === 'string' ? { name: t } : t),
            links: data.links || [],
          },
        });
        break;
      case 'book':
        dispatch({
          type: 'ADD_BOOK',
          payload: {
            id,
            title: data.title || template.name,
            author: data.author || '',
            coverUrl: data.coverUrl || '',
            description: data.description || template.description,
            tags: (data.tags || []).map((t: any) => typeof t === 'string' ? { name: t } : t),
            notes: data.notes || [],
            content: data.content || [],
            links: data.links || [],
            status: data.status || 'want-to-read',
            progress: data.progress ?? 0,
            addedAt: convertDates(data.addedAt) || new Date(),
          },
        });
        break;
      case 'kanban-card': {
        const firstColumn = state.kanbanColumns[0]?.id || 'ideas';
        dispatch({
          type: 'ADD_KANBAN_CARD',
          payload: {
            id,
            columnId: data.columnId || firstColumn,
            title: data.title || template.name,
            description: data.description || template.description,
            labels: data.labels || [],
            priority: data.priority || 'medium',
            createdAt: convertDates(data.createdAt) || new Date(),
            tags: (data.tags || []).map((t: any) => typeof t === 'string' ? { name: t } : t),
            links: data.links || [],
          },
        });
        break;
      }
      case 'pomodoro-session':
        dispatch({
          type: 'ADD_POMODORO_SESSION',
          payload: {
            id,
            startTime: convertDates(data.startTime) || new Date(),
            endTime: data.endTime ? convertDates(data.endTime) : null,
            duration: data.duration || 25,
            type: data.type || 'focus',
            completed: data.completed ?? false,
            activityMode: data.activityMode,
            customName: data.customName || template.name,
            linkedTaskId: data.linkedTaskId,
            tags: (data.tags || []).map((t: any) => typeof t === 'string' ? { name: t } : t),
            links: data.links || [],
          },
        });
        break;
      case 'challenge':
        dispatch({
          type: 'ADD_CHALLENGE',
          payload: {
            id,
            name: data.name || template.name,
            description: data.description || template.description,
            totalDays: data.totalDays || 30,
            completedDays: data.completedDays || [],
            startDate: convertDates(data.startDate) || new Date(),
            color: data.color || '#8b5cf6',
            icon: data.icon || 'Trophy',
            tags: (data.tags || []).map((t: any) => typeof t === 'string' ? { name: t } : t),
            links: data.links || [],
          },
        });
        break;
      case 'daily-note': {
        const today = new Date().toISOString().slice(0, 10);
        dispatch({
          type: 'SET_DAILY_NOTE',
          payload: {
            id,
            date: data.date || today,
            content: data.content || [{ id: genId(), type: 'text', content: template.description || template.name }],
            tags: (data.tags || []).map((t: any) => typeof t === 'string' ? { name: t } : t),
            links: data.links || [],
            createdAt: convertDates(data.createdAt) || new Date(),
            updatedAt: new Date(),
          },
        });
        break;
      }
      case 'book-note': {
        const targetBook = state.books[0];
        if (targetBook) {
          dispatch({
            type: 'UPDATE_BOOK',
            payload: {
              ...targetBook,
              notes: [...targetBook.notes, {
                id,
                content: data.content || template.description || template.name,
                pageNumber: data.pageNumber,
                createdAt: convertDates(data.createdAt) || new Date(),
              }],
            },
          });
        }
        break;
      }
    }

    setTemplates(prev => prev.map(t =>
      t.id === template.id ? { ...t, useCount: t.useCount + 1, updatedAt: new Date() } : t
    ));
  }, [dispatch, state.kanbanColumns, state.books]);

  const toggleCollapse = useCallback((type: string) => {
    setCollapsedSections(prev => {
      const next = new Set(prev);
      if (next.has(type)) next.delete(type);
      else next.add(type);
      return next;
    });
  }, []);

  const grouped = ENTITY_TYPES
    .map(type => ({ type, templates: templates.filter(t => t.entityType === type) }))
    .filter(g => g.templates.length > 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold">Templates</h2>
        </div>
        <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="default" size="sm" className="gap-1.5">
              <Save className="h-4 w-4" />
              Save as Template
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Save as Template</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-muted-foreground">Entity Type</label>
                <div className="flex flex-wrap gap-1.5">
                  {ENTITY_TYPES.map(type => {
                    const Icon = ENTITY_ICONS[type];
                    const isSelected = selectedType === type;
                    return (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setSelectedType(type)}
                        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium border transition-colors ${
                          isSelected
                            ? ENTITY_COLORS[type] + ' border-current'
                            : 'text-muted-foreground border-border hover:border-muted-foreground/30'
                        }`}
                      >
                        <Icon className="h-3.5 w-3.5" />
                        {ENTITY_LABELS[type]}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-muted-foreground">Name</label>
                <Input
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Template name..."
                  className="h-9"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-muted-foreground">Description</label>
                <Textarea
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Describe what this template is for..."
                  className="min-h-[60px] resize-none"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-muted-foreground">Tags</label>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {templateTags.map(tag => (
                    <Badge key={tag} variant="secondary" className="flex items-center gap-1 text-xs">
                      <Hash className="h-3 w-3" />
                      {tag}
                      <button onClick={() => handleRemoveTag(tag)} className="ml-0.5 hover:opacity-70">
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    value={tagInput}
                    onChange={e => setTagInput(e.target.value)}
                    onKeyDown={handleTagKeyDown}
                    placeholder="Add tag..."
                    className="h-8 text-sm flex-1"
                  />
                  <Button type="button" variant="outline" size="sm" onClick={handleAddTag} className="h-8">
                    <Hash className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" size="sm" onClick={() => { resetSaveForm(); setSaveDialogOpen(false); }}>
                  Cancel
                </Button>
                <Button size="sm" onClick={handleSaveTemplate} disabled={!name.trim()}>
                  <Save className="h-4 w-4 mr-1.5" />
                  Save Template
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {templates.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
          <FileText className="h-12 w-12 mb-3 opacity-20" />
          <p className="text-sm">No templates saved yet</p>
          <p className="text-xs mt-1">Save items as reusable templates to apply them later</p>
        </div>
      ) : (
        <ScrollArea className="max-h-[600px] pr-2">
          <div className="space-y-3">
            {grouped.map(group => {
              const Icon = ENTITY_ICONS[group.type];
              const isCollapsed = collapsedSections.has(group.type);
              return (
                <div key={group.type} className="space-y-2">
                  <button
                    type="button"
                    onClick={() => toggleCollapse(group.type)}
                    className="flex items-center gap-2 w-full text-left"
                  >
                    <div className={`flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium ${ENTITY_COLORS[group.type]} border`}>
                      <Icon className="h-3.5 w-3.5" />
                      {ENTITY_LABELS[group.type]}
                    </div>
                    <span className="text-xs text-muted-foreground tabular-nums">
                      {group.templates.length} template{group.templates.length !== 1 ? 's' : ''}
                    </span>
                    <div className="flex-1 border-t border-border/50" />
                    <span className="text-xs text-muted-foreground">{isCollapsed ? '▶' : '▼'}</span>
                  </button>
                  {!isCollapsed && (
                    <div className="grid gap-2 pl-1">
                      {group.templates.map(tmpl => (
                        <Card key={tmpl.id} className="p-3">
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0 flex-1 space-y-1.5">
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-sm truncate">{tmpl.name}</span>
                                <div className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium ${ENTITY_COLORS[tmpl.entityType]} border`}>
                                  <Icon className="h-3 w-3" />
                                  {ENTITY_LABELS[tmpl.entityType]}
                                </div>
                              </div>
                              {tmpl.description && (
                                <p className="text-xs text-muted-foreground line-clamp-2">{tmpl.description}</p>
                              )}
                              <div className="flex items-center gap-2 flex-wrap">
                                {tmpl.tags.map(tag => (
                                  <Badge key={tag} variant="outline" className="text-[10px] px-1.5 py-0">
                                    <Hash className="h-2.5 w-2.5 mr-0.5" />
                                    {tag}
                                  </Badge>
                                ))}
                                {tmpl.useCount > 0 && (
                                  <span className="text-[10px] text-muted-foreground flex items-center gap-0.5 ml-auto">
                                    <Play className="h-2.5 w-2.5" />
                                    Used {tmpl.useCount} time{tmpl.useCount !== 1 ? 's' : ''}
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-1 shrink-0">
                              <Button
                                variant="default"
                                size="sm"
                                className="h-7 text-xs gap-1"
                                onClick={() => handleApplyTemplate(tmpl)}
                              >
                                <Play className="h-3 w-3" />
                                Apply
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon-sm"
                                className="h-7 w-7 text-muted-foreground hover:text-destructive"
                                onClick={() => handleDeleteTemplate(tmpl.id)}
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </ScrollArea>
      )}

      {templates.length > 0 && (
        <div className="flex items-center gap-2 text-xs text-muted-foreground border-t border-border pt-3">
          <Clock className="h-3 w-3" />
          <span>Use {`{{date}}`}, {`{{time}}`}, {`{{now}}`} placeholders in template names/descriptions — they'll be replaced when applying</span>
        </div>
      )}
    </div>
  );
}
