import { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Plus,
  Trash2,
  CheckCircle2,
  Flag,
  Moon,
  Sun,
} from 'lucide-react';
import { toast } from 'sonner';
import type { Todo } from '@/types';

// Simple Hijri date calculation (approximate)
function getHijriDate(gregorianDate: Date): { day: number; month: string; year: number } {
  const gregorianYear = gregorianDate.getFullYear();
  const gregorianMonth = gregorianDate.getMonth();
  const gregorianDay = gregorianDate.getDate();
  
  // Approximate conversion (Islamic calendar is lunar, about 354 days)
  const hijriMonths = [
    'Muharram', 'Safar', 'Rabi al-Awwal', 'Rabi al-Thani',
    'Jumada al-Awwal', 'Jumada al-Thani', 'Rajab', 'Shaban',
    'Ramadan', 'Shawwal', 'Dhu al-Qadah', 'Dhu al-Hijjah'
  ];
  
  // Rough approximation - Islamic year is about 578 years behind Gregorian
  const hijriYear = gregorianYear - 578;
  const daysSinceEpoch = gregorianMonth * 30 + gregorianDay;
  const hijriMonthIndex = Math.floor((daysSinceEpoch % 354) / 29.5);
  const hijriDay = Math.floor((daysSinceEpoch % 354) % 29.5) + 1;
  
  return {
    day: hijriDay,
    month: hijriMonths[hijriMonthIndex] || hijriMonths[0],
    year: hijriYear,
  };
}

const priorityColors = {
  low: 'bg-green-500/10 text-green-500 border-green-500/20',
  medium: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
  high: 'bg-red-500/10 text-red-500 border-red-500/20',
};

const priorityIcons = {
  low: Flag,
  medium: Flag,
  high: Flag,
};

export function DailyTodo() {
  const { state, dispatch } = useApp();
  const { todos } = state;
  
  const [newTodoContent, setNewTodoContent] = useState('');
  const [newTodoPriority, setNewTodoPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');
  const [currentDate, setCurrentDate] = useState(new Date());
  
  // Get today's todos
  const today = new Date().toDateString();
  const todayTodos = todos.filter(todo => 
    new Date(todo.createdAt).toDateString() === today
  );
  
  const filteredTodos = todayTodos.filter(todo => {
    if (filter === 'active') return !todo.completed;
    if (filter === 'completed') return todo.completed;
    return true;
  });

  const completedCount = todayTodos.filter(t => t.completed).length;
  const totalCount = todayTodos.length;
  const progress = totalCount === 0 ? 0 : (completedCount / totalCount) * 100;

  // Hijri date
  const hijriDate = getHijriDate(currentDate);
  
  // Day names
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const handleAddTodo = () => {
    if (!newTodoContent.trim()) {
      toast.error('Please enter a task');
      return;
    }

    const newTodo: Todo = {
      id: Date.now().toString(),
      content: newTodoContent,
      completed: false,
      createdAt: new Date(),
      priority: newTodoPriority,
    };

    dispatch({ type: 'ADD_TODO', payload: newTodo });
    setNewTodoContent('');
    setNewTodoPriority('medium');
    toast.success('Task added');
  };

  const handleToggleTodo = (todo: Todo) => {
    const updatedTodo = { ...todo, completed: !todo.completed };
    dispatch({ type: 'UPDATE_TODO', payload: updatedTodo });
    
    if (!todo.completed) {
      toast.success('Task completed!');
    }
  };

  const handleDeleteTodo = (todoId: string) => {
    dispatch({ type: 'DELETE_TODO', payload: todoId });
    toast.success('Task deleted');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAddTodo();
    }
  };

  // Update date every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentDate(new Date());
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6">
      {/* Date Display */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Gregorian Calendar */}
        <Card className="bg-gradient-to-br from-primary/5 to-primary/10">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <Sun className="w-5 h-5 text-yellow-500" />
              <span className="text-sm font-medium text-muted-foreground">Gregorian</span>
            </div>
            <div className="text-3xl font-bold">
              {days[currentDate.getDay()]}
            </div>
            <div className="text-xl text-muted-foreground">
              {months[currentDate.getMonth()]} {currentDate.getDate()}, {currentDate.getFullYear()}
            </div>
          </CardContent>
        </Card>

        {/* Hijri Calendar */}
        <Card className="bg-gradient-to-br from-emerald-500/5 to-emerald-500/10">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <Moon className="w-5 h-5 text-emerald-500" />
              <span className="text-sm font-medium text-muted-foreground">Hijri</span>
            </div>
            <div className="text-3xl font-bold">
              {hijriDate.day} {hijriDate.month}
            </div>
            <div className="text-xl text-muted-foreground">
              {hijriDate.year} AH
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Progress Card */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Today's Progress</span>
            <span className="text-sm text-muted-foreground">
              {completedCount}/{totalCount} tasks
            </span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Add Todo */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <Input
              placeholder="Add a new task..."
              value={newTodoContent}
              onChange={(e) => setNewTodoContent(e.target.value)}
              onKeyPress={handleKeyPress}
              className="flex-1"
            />
            <Select
              value={newTodoPriority}
              onValueChange={(v: 'low' | 'medium' | 'high') => setNewTodoPriority(v)}
            >
              <SelectTrigger className="w-[120px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={handleAddTodo} className="gap-2">
              <Plus className="w-4 h-4" />
              Add
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Todo List */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Today's Tasks</CardTitle>
            <div className="flex gap-2">
              <Button
                variant={filter === 'all' ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => setFilter('all')}
              >
                All
              </Button>
              <Button
                variant={filter === 'active' ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => setFilter('active')}
              >
                Active
              </Button>
              <Button
                variant={filter === 'completed' ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => setFilter('completed')}
              >
                Done
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[400px]">
            <div className="space-y-2 pr-4">
              {filteredTodos.length === 0 ? (
                <div className="text-center py-12">
                  <CheckCircle2 className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">
                    {filter === 'completed' 
                      ? 'No completed tasks yet'
                      : filter === 'active'
                      ? 'No active tasks'
                      : 'No tasks for today'}
                  </p>
                  {filter === 'all' && (
                    <p className="text-sm text-muted-foreground mt-1">
                      Add your first task above
                    </p>
                  )}
                </div>
              ) : (
                filteredTodos.map((todo) => {
                  const PriorityIcon = priorityIcons[todo.priority];
                  return (
                    <div
                      key={todo.id}
                      className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${
                        todo.completed ? 'bg-muted/50 opacity-60' : 'bg-card hover:bg-muted/30'
                      }`}
                    >
                      <Checkbox
                        checked={todo.completed}
                        onCheckedChange={() => handleToggleTodo(todo)}
                        className="h-5 w-5"
                      />
                      
                      <div className="flex-1 min-w-0">
                        <p className={`truncate ${todo.completed ? 'line-through text-muted-foreground' : ''}`}>
                          {todo.content}
                        </p>
                      </div>
                      
                      <Badge
                        variant="outline"
                        className={`text-xs ${priorityColors[todo.priority]}`}
                      >
                        <PriorityIcon className="w-3 h-3 mr-1" />
                        {todo.priority}
                      </Badge>
                      
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        onClick={() => handleDeleteTodo(todo.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  );
                })
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Motivational Quote */}
      <Card className="bg-gradient-to-r from-primary/5 via-accent/5 to-primary/5">
        <CardContent className="p-6 text-center">
          <p className="text-lg italic text-muted-foreground">
            "The best time to plant a tree was 20 years ago. The second best time is now."
          </p>
          <p className="text-sm text-muted-foreground mt-2">— Chinese Proverb</p>
        </CardContent>
      </Card>
    </div>
  );
}
