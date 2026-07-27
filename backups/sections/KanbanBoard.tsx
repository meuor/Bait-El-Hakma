import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Plus,
  Trash2,
  Edit2,
  Lightbulb,
  Target,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import { toast } from 'sonner';
import type { KanbanCard, Label as LabelType } from '@/types';

// Predefined labels
const defaultLabels: LabelType[] = [
  { id: '1', name: 'Urgent', color: '#ef4444' },
  { id: '2', name: 'Important', color: '#f97316' },
  { id: '3', name: 'Low Priority', color: '#22c55e' },
  { id: '4', name: 'Research', color: '#3b82f6' },
  { id: '5', name: 'Learning', color: '#8b5cf6' },
  { id: '6', name: 'Project', color: '#ec4899' },
];

const priorityColors = {
  low: 'bg-green-500/10 text-green-500',
  medium: 'bg-yellow-500/10 text-yellow-500',
  high: 'bg-red-500/10 text-red-500',
};

const priorityLabels = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
};

export function KanbanBoard() {
  const { state, dispatch } = useApp();
  const { kanbanColumns, kanbanCards } = state;
  
  const [draggedCard, setDraggedCard] = useState<KanbanCard | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null);
  const [showAddCard, setShowAddCard] = useState<string | null>(null);
  const [editingCard, setEditingCard] = useState<KanbanCard | null>(null);
  
  // New card form
  const [newCardTitle, setNewCardTitle] = useState('');
  const [newCardDescription, setNewCardDescription] = useState('');
  const [newCardPriority, setNewCardPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [newCardLabels, setNewCardLabels] = useState<string[]>([]);

  const handleDragStart = (card: KanbanCard) => {
    setDraggedCard(card);
  };

  const handleDragOver = (e: React.DragEvent, columnId: string) => {
    e.preventDefault();
    setDragOverColumn(columnId);
  };

  const handleDragLeave = () => {
    setDragOverColumn(null);
  };

  const handleDrop = (e: React.DragEvent, columnId: string) => {
    e.preventDefault();
    setDragOverColumn(null);
    
    if (draggedCard && draggedCard.columnId !== columnId) {
      const updatedCard = { ...draggedCard, columnId };
      dispatch({ type: 'UPDATE_KANBAN_CARD', payload: updatedCard });
      toast.success('Card moved');
    }
    setDraggedCard(null);
  };

  const handleAddCard = (columnId: string) => {
    if (!newCardTitle.trim()) {
      toast.error('Please enter a title');
      return;
    }

    const newCard: KanbanCard = {
      id: Date.now().toString(),
      columnId,
      title: newCardTitle,
      description: newCardDescription,
      priority: newCardPriority,
      labels: defaultLabels.filter(l => newCardLabels.includes(l.id)),
      createdAt: new Date(),
    };

    dispatch({ type: 'ADD_KANBAN_CARD', payload: newCard });
    
    // Reset form
    setNewCardTitle('');
    setNewCardDescription('');
    setNewCardPriority('medium');
    setNewCardLabels([]);
    setShowAddCard(null);
    
    toast.success('Card added');
  };

  const handleUpdateCard = () => {
    if (!editingCard) return;
    
    dispatch({ type: 'UPDATE_KANBAN_CARD', payload: editingCard });
    setEditingCard(null);
    toast.success('Card updated');
  };

  const handleDeleteCard = (cardId: string) => {
    dispatch({ type: 'DELETE_KANBAN_CARD', payload: cardId });
    toast.success('Card deleted');
  };

  const getColumnIcon = (columnId: string) => {
    switch (columnId) {
      case 'ideas':
        return <Lightbulb className="w-4 h-4" />;
      case 'future':
        return <Target className="w-4 h-4" />;
      case 'doing':
        return <Clock className="w-4 h-4" />;
      case 'done':
        return <CheckCircle2 className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const getCardsForColumn = (columnId: string) => {
    return kanbanCards.filter(card => card.columnId === columnId);
  };

  return (
    <div className="space-y-6">
      {/* Board Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Kanban Board</h2>
          <p className="text-muted-foreground">Organize your tasks with GTD/PARA methodology</p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" className="gap-2">
              <Lightbulb className="w-4 h-4" />
              Mindspace
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Mindspace</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-muted-foreground">
                Use this space for long-term planning, ideas, and brainstorming.
                Capture everything here and move to the board when ready.
              </p>
              <Textarea
                placeholder="Write your ideas, goals, and long-term plans here..."
                className="min-h-[200px]"
              />
              <Button className="w-full">Save to Mindspace</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Kanban Columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {kanbanColumns.map((column) => (
          <Card
            key={column.id}
            className={`min-h-[400px] ${
              dragOverColumn === column.id ? 'ring-2 ring-primary ring-offset-2' : ''
            }`}
            onDragOver={(e) => handleDragOver(e, column.id)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, column.id)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: column.color }}
                  />
                  {getColumnIcon(column.id)}
                  <CardTitle className="text-sm font-semibold">{column.title}</CardTitle>
                  <Badge variant="secondary" className="text-xs">
                    {getCardsForColumn(column.id).length}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-3">
              <ScrollArea className="h-[300px]">
                <div className="space-y-3 pr-3">
                  {getCardsForColumn(column.id).map((card) => (
                    <div
                      key={card.id}
                      draggable
                      onDragStart={() => handleDragStart(card)}
                      className="p-3 rounded-lg bg-card border border-border cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow group"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-medium text-sm flex-1">{card.title}</h4>
                        <div className="sm:opacity-0 sm:group-hover:opacity-100 transition-opacity flex gap-1 shrink-0">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => setEditingCard(card)}
                          >
                            <Edit2 className="w-3 h-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 text-destructive"
                            onClick={() => handleDeleteCard(card.id)}
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                      
                      {card.description && (
                        <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                          {card.description}
                        </p>
                      )}
                      
                      <div className="flex items-center justify-between">
                        <div className="flex flex-wrap gap-1">
                          {card.labels.map((label) => (
                            <span
                              key={label.id}
                              className="text-[10px] px-1.5 py-0.5 rounded-full"
                              style={{
                                backgroundColor: `${label.color}20`,
                                color: label.color,
                              }}
                            >
                              {label.name}
                            </span>
                          ))}
                        </div>
                        <Badge
                          variant="secondary"
                          className={`text-[10px] ${priorityColors[card.priority]}`}
                        >
                          {priorityLabels[card.priority]}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>

              {/* Add Card Button */}
              <Dialog open={showAddCard === column.id} onOpenChange={(open) => setShowAddCard(open ? column.id : null)}>
                <DialogTrigger asChild>
                  <Button variant="ghost" className="w-full gap-2 text-muted-foreground">
                    <Plus className="w-4 h-4" />
                    Add Card
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New Card</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Title</Label>
                      <Input
                        placeholder="Enter card title..."
                        value={newCardTitle}
                        onChange={(e) => setNewCardTitle(e.target.value)}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Description</Label>
                      <Textarea
                        placeholder="Add details..."
                        value={newCardDescription}
                        onChange={(e) => setNewCardDescription(e.target.value)}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Priority</Label>
                      <Select
                        value={newCardPriority}
                        onValueChange={(v: 'low' | 'medium' | 'high') => setNewCardPriority(v)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Labels</Label>
                      <div className="flex flex-wrap gap-2">
                        {defaultLabels.map((label) => (
                          <Button
                            key={label.id}
                            variant={newCardLabels.includes(label.id) ? 'default' : 'outline'}
                            size="sm"
                            className="text-xs"
                            onClick={() => {
                              setNewCardLabels(prev =>
                                prev.includes(label.id)
                                  ? prev.filter(id => id !== label.id)
                                  : [...prev, label.id]
                              );
                            }}
                            style={
                              newCardLabels.includes(label.id)
                                ? { backgroundColor: label.color }
                                : { borderColor: label.color, color: label.color }
                            }
                          >
                            {label.name}
                          </Button>
                        ))}
                      </div>
                    </div>
                    
                    <Button
                      className="w-full"
                      onClick={() => handleAddCard(column.id)}
                    >
                      Add Card
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Edit Card Dialog */}
      <Dialog open={!!editingCard} onOpenChange={() => setEditingCard(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Card</DialogTitle>
          </DialogHeader>
          {editingCard && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Title</Label>
                <Input
                  value={editingCard.title}
                  onChange={(e) => setEditingCard({ ...editingCard, title: e.target.value })}
                />
              </div>
              
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={editingCard.description}
                  onChange={(e) => setEditingCard({ ...editingCard, description: e.target.value })}
                />
              </div>
              
              <div className="space-y-2">
                <Label>Priority</Label>
                <Select
                  value={editingCard.priority}
                  onValueChange={(v: 'low' | 'medium' | 'high') =>
                    setEditingCard({ ...editingCard, priority: v })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <Button className="w-full" onClick={handleUpdateCard}>
                Save Changes
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
