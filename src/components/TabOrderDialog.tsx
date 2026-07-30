import { useState, useRef } from 'react';
import { useApp } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';
import {
  Tooltip, TooltipContent, TooltipProvider, TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  GripVertical, Pin, Check, RotateCcw, Plus, Trash2, Pencil, Save, FolderOpen, X,
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
  const [showNewProfile, setShowNewProfile] = useState(false);
  const [newProfileName, setNewProfileName] = useState('');
  const [renamingProfile, setRenamingProfile] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const dragItem = useRef<number | null>(null);
  const dragOverItem = useRef<number | null>(null);
  const newNameRef = useRef<HTMLInputElement>(null);

  const hasChanges = localOrder.join() !== state.tabOrder.join();

  const handleDragStart = (index: number) => { dragItem.current = index; };
  const handleDragOver = (index: number) => { dragOverItem.current = index; };
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
    dispatch({
      type: 'SET_TAB_PROFILES',
      payload: state.tabProfiles.map(p =>
        p.name === state.tabActiveProfile ? { ...p, order: localOrder } : p
      ),
    });
    setOpen(false);
  };

  const handleOpen = (o: boolean) => {
    if (o) { setLocalOrder([...state.tabOrder]); setShowNewProfile(false); setRenamingProfile(null); }
    setOpen(o);
  };

  const handleAddProfile = () => {
    const name = newProfileName.trim();
    if (!name || state.tabProfiles.some(p => p.name === name)) return;
    dispatch({ type: 'ADD_TAB_PROFILE', payload: { name, order: [...state.tabOrder] } });
    dispatch({ type: 'SET_ACTIVE_TAB_PROFILE', payload: name });
    setNewProfileName('');
    setShowNewProfile(false);
  };

  const handleSwitchProfile = (name: string) => {
    const profile = state.tabProfiles.find(p => p.name === name);
    if (!profile) return;
    dispatch({ type: 'SET_TAB_ORDER', payload: [...profile.order] });
    dispatch({ type: 'SET_ACTIVE_TAB_PROFILE', payload: name });
    setLocalOrder([...profile.order]);
    setShowNewProfile(false);
    setRenamingProfile(null);
  };

  const handleRenameProfile = (oldName: string) => {
    const newName = renameValue.trim();
    if (!newName || newName === oldName || state.tabProfiles.some(p => p.name === newName)) return;
    dispatch({ type: 'RENAME_TAB_PROFILE', payload: { oldName, newName } });
    setRenamingProfile(null);
    setRenameValue('');
  };

  const handleDeleteProfile = (name: string) => {
    dispatch({ type: 'REMOVE_TAB_PROFILE', payload: name });
    if (state.tabActiveProfile === name) {
      const defaultProfile = state.tabProfiles.find(p => p.name === 'Default');
      if (defaultProfile) {
        dispatch({ type: 'SET_TAB_ORDER', payload: [...defaultProfile.order] });
        setLocalOrder([...defaultProfile.order]);
      }
    }
  };

  const startRename = (name: string) => {
    setRenamingProfile(name);
    setRenameValue(name);
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

        {/* Profile Switcher */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {state.tabProfiles.map(p => (
            <div key={p.name} className="flex items-center gap-1">
              {renamingProfile === p.name ? (
                <div className="flex items-center gap-1">
                  <Input
                    ref={newNameRef}
                    value={renameValue}
                    onChange={e => setRenameValue(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') handleRenameProfile(p.name); if (e.key === 'Escape') setRenamingProfile(null); }}
                    className="h-7 w-24 text-xs px-2"
                    autoFocus
                  />
                  <Button variant="ghost" size="icon-sm" className="h-6 w-6" onClick={() => handleRenameProfile(p.name)}>
                    <Check className="w-3 h-3" />
                  </Button>
                  <Button variant="ghost" size="icon-sm" className="h-6 w-6" onClick={() => setRenamingProfile(null)}>
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              ) : (
                <button
                  onClick={() => handleSwitchProfile(p.name)}
                  className={cn(
                    'flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all',
                    state.tabActiveProfile === p.name
                      ? 'bg-primary/20 text-primary ring-1 ring-primary/40'
                      : 'bg-muted text-muted-foreground hover:bg-accent'
                  )}
                >
                  <FolderOpen className="w-3 h-3" />
                  {p.name}
                </button>
              )}
            </div>
          ))}
          {!showNewProfile ? (
            <Button variant="ghost" size="icon-sm" className="h-7 w-7" onClick={() => setShowNewProfile(true)} title="New profile">
              <Plus className="w-3.5 h-3.5" />
            </Button>
          ) : (
            <div className="flex items-center gap-1">
              <Input
                value={newProfileName}
                onChange={e => setNewProfileName(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') handleAddProfile(); if (e.key === 'Escape') setShowNewProfile(false); }}
                placeholder="Profile name"
                className="h-7 w-24 text-xs px-2"
                autoFocus
              />
              <Button variant="ghost" size="icon-sm" className="h-6 w-6" onClick={handleAddProfile}>
                <Check className="w-3 h-3" />
              </Button>
              <Button variant="ghost" size="icon-sm" className="h-6 w-6" onClick={() => setShowNewProfile(false)}>
                <X className="w-3 h-3" />
              </Button>
            </div>
          )}
        </div>

        {/* Draggable Tab List */}
        <div className="space-y-1">
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

        {/* Actions */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 mr-auto">
            {state.tabActiveProfile !== 'Default' && (
              <Button variant="ghost" size="icon-sm" className="h-7 w-7 text-destructive/70 hover:text-destructive" onClick={() => handleDeleteProfile(state.tabActiveProfile)} title="Delete profile">
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            )}
            <Button variant="ghost" size="icon-sm" className="h-7 w-7" onClick={() => startRename(state.tabActiveProfile)} title="Rename profile">
              <Pencil className="w-3.5 h-3.5" />
            </Button>
            <Button variant="ghost" size="icon-sm" className="h-7 w-7" onClick={() => setLocalOrder([...defaultOrder])} title="Reset to default order">
              <RotateCcw className="w-3.5 h-3.5" />
            </Button>
          </div>
          <Button size="sm" onClick={handleSave} className="gap-1.5 text-xs" disabled={!hasChanges}>
            <Save className="w-3.5 h-3.5" /> {hasChanges ? 'Save' : 'Saved'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
