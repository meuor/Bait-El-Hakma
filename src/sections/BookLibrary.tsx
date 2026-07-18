import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Plus,
  Search,
  BookOpen,
  Edit2,
  Trash2,
} from 'lucide-react';
import { toast } from 'sonner';
import type { Book, BookTag, BookNote } from '@/types';

// Default book tags
const defaultBookTags: BookTag[] = [
  { id: '1', name: 'Fiction', color: '#8b5cf6' },
  { id: '2', name: 'Non-Fiction', color: '#3b82f6' },
  { id: '3', name: 'Programming', color: '#22c55e' },
  { id: '4', name: 'Self-Help', color: '#f97316' },
  { id: '5', name: 'Islamic', color: '#10b981' },
  { id: '6', name: 'Science', color: '#06b6d4' },
  { id: '7', name: 'History', color: '#f59e0b' },
  { id: '8', name: 'Biography', color: '#ec4899' },
];



const statusLabels = {
  'reading': 'Reading',
  'completed': 'Completed',
  'want-to-read': 'Want to Read',
  'on-hold': 'On Hold',
};

const statusColors = {
  'reading': 'bg-blue-500/10 text-blue-500',
  'completed': 'bg-green-500/10 text-green-500',
  'want-to-read': 'bg-purple-500/10 text-purple-500',
  'on-hold': 'bg-yellow-500/10 text-yellow-500',
};

export function BookLibrary() {
  const { state, dispatch } = useApp();
  const { books } = state;
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showAddBook, setShowAddBook] = useState(false);
  const [viewingBook, setViewingBook] = useState<Book | null>(null);
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  
  // New book form
  const [newBookTitle, setNewBookTitle] = useState('');
  const [newBookAuthor, setNewBookAuthor] = useState('');
  const [newBookDescription, setNewBookDescription] = useState('');
  const [newBookCoverUrl, setNewBookCoverUrl] = useState('');
  const [newBookTags, setNewBookTags] = useState<string[]>([]);
  const [newBookStatus, setNewBookStatus] = useState<Book['status']>('want-to-read');
  
  // Note form
  const [newNoteContent, setNewNoteContent] = useState('');
  const [newNotePage, setNewNotePage] = useState('');

  const filteredBooks = books.filter((book) => {
    const matchesSearch = 
      book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.author.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTags = selectedTags.length === 0 || 
      book.tags.some(tag => selectedTags.includes(tag.id));
    const matchesStatus = statusFilter === 'all' || book.status === statusFilter;
    return matchesSearch && matchesTags && matchesStatus;
  });

  const handleAddBook = () => {
    if (!newBookTitle.trim() || !newBookAuthor.trim()) {
      toast.error('Please enter title and author');
      return;
    }

    const newBook: Book = {
      id: Date.now().toString(),
      title: newBookTitle,
      author: newBookAuthor,
      description: newBookDescription,
      coverUrl: newBookCoverUrl || `https://placehold.co/200x300/8b5cf6/ffffff?text=${encodeURIComponent(newBookTitle)}`,
      tags: defaultBookTags.filter(t => newBookTags.includes(t.id)),
      notes: [],
      status: newBookStatus,
      progress: 0,
      addedAt: new Date(),
    };

    dispatch({ type: 'ADD_BOOK', payload: newBook });
    
    // Reset form
    setNewBookTitle('');
    setNewBookAuthor('');
    setNewBookDescription('');
    setNewBookCoverUrl('');
    setNewBookTags([]);
    setNewBookStatus('want-to-read');
    setShowAddBook(false);
    
    toast.success('Book added to library');
  };

  const handleUpdateBook = () => {
    if (!editingBook) return;
    dispatch({ type: 'UPDATE_BOOK', payload: editingBook });
    setEditingBook(null);
    toast.success('Book updated');
  };

  const handleDeleteBook = (bookId: string) => {
    dispatch({ type: 'DELETE_BOOK', payload: bookId });
    toast.success('Book removed');
  };

  const handleAddNote = (bookId: string) => {
    if (!newNoteContent.trim()) return;

    const note: BookNote = {
      id: Date.now().toString(),
      content: newNoteContent,
      pageNumber: newNotePage ? parseInt(newNotePage) : undefined,
      createdAt: new Date(),
    };

    const book = books.find(b => b.id === bookId);
    if (book) {
      const updatedBook = {
        ...book,
        notes: [...book.notes, note],
      };
      dispatch({ type: 'UPDATE_BOOK', payload: updatedBook });
      setNewNoteContent('');
      setNewNotePage('');
      toast.success('Note added');
    }
  };

  const handleUpdateProgress = (book: Book, progress: number) => {
    const updatedBook = {
      ...book,
      progress,
      status: progress === 100 ? 'completed' as const : progress > 0 ? 'reading' as const : book.status,
      completedAt: progress === 100 ? new Date() : undefined,
    };
    dispatch({ type: 'UPDATE_BOOK', payload: updatedBook });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Book Library</h2>
          <p className="text-muted-foreground">Track your reading journey</p>
        </div>
        <Button onClick={() => setShowAddBook(true)} className="gap-2">
          <Plus className="w-4 h-4" />
          Add Book
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search books..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="reading">Reading</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="want-to-read">Want to Read</SelectItem>
                <SelectItem value="on-hold">On Hold</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {/* Tag Filters */}
          <div className="flex flex-wrap gap-2 mt-4">
            {defaultBookTags.map((tag) => (
              <Button
                key={tag.id}
                variant={selectedTags.includes(tag.id) ? 'default' : 'outline'}
                size="sm"
                className="text-xs"
                onClick={() => {
                  setSelectedTags(prev =>
                    prev.includes(tag.id)
                      ? prev.filter(id => id !== tag.id)
                      : [...prev, tag.id]
                  );
                }}
                style={
                  selectedTags.includes(tag.id)
                    ? { backgroundColor: tag.color }
                    : { borderColor: tag.color, color: tag.color }
                }
              >
                {tag.name}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Books Grid */}
      {filteredBooks.length === 0 ? (
        <Card className="p-12 text-center">
          <BookOpen className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">No books found</h3>
          <p className="text-muted-foreground mb-4">
            {books.length === 0 
              ? 'Start building your library by adding your first book'
              : 'Try adjusting your search or filters'}
          </p>
          {books.length === 0 && (
            <Button onClick={() => setShowAddBook(true)}>Add Your First Book</Button>
          )}
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredBooks.map((book) => (
            <Card
              key={book.id}
              className="group cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => setViewingBook(book)}
            >
              <CardContent className="p-4">
                <div className="flex gap-4">
                  {/* Book Cover */}
                  <div className="w-24 h-36 flex-shrink-0 rounded-lg overflow-hidden bg-muted">
                    <img
                      src={book.coverUrl}
                      alt={book.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = `https://placehold.co/200x300/8b5cf6/ffffff?text=${encodeURIComponent(book.title)}`;
                      }}
                    />
                  </div>
                  
                  {/* Book Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold line-clamp-2">{book.title}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-1">{book.author}</p>
                    
                    <div className="flex items-center gap-2 mt-2">
                      <Badge
                        variant="secondary"
                        className={`text-xs ${statusColors[book.status]}`}
                      >
                        {statusLabels[book.status]}
                      </Badge>
                    </div>
                    
                    {book.status === 'reading' && (
                      <div className="mt-3">
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span>Progress</span>
                          <span>{book.progress}%</span>
                        </div>
                        <Progress value={book.progress} className="h-1.5" />
                      </div>
                    )}
                    
                    <div className="flex flex-wrap gap-1 mt-3">
                      {book.tags.slice(0, 2).map((tag) => (
                        <span
                          key={tag.id}
                          className="text-[10px] px-1.5 py-0.5 rounded-full"
                          style={{
                            backgroundColor: `${tag.color}20`,
                            color: tag.color,
                          }}
                        >
                          {tag.name}
                        </span>
                      ))}
                      {book.tags.length > 2 && (
                        <span className="text-[10px] text-muted-foreground">
                          +{book.tags.length - 2}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add Book Dialog */}
      <Dialog open={showAddBook} onOpenChange={setShowAddBook}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>Add New Book</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Title *</Label>
              <Input
                placeholder="Book title"
                value={newBookTitle}
                onChange={(e) => setNewBookTitle(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label>Author *</Label>
              <Input
                placeholder="Author name"
                value={newBookAuthor}
                onChange={(e) => setNewBookAuthor(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                placeholder="Brief description..."
                value={newBookDescription}
                onChange={(e) => setNewBookDescription(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label>Cover Image URL</Label>
              <Input
                placeholder="https://..."
                value={newBookCoverUrl}
                onChange={(e) => setNewBookCoverUrl(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                value={newBookStatus}
                onValueChange={(v: Book['status']) => setNewBookStatus(v)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="want-to-read">Want to Read</SelectItem>
                  <SelectItem value="reading">Reading</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="on-hold">On Hold</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Tags</Label>
              <div className="flex flex-wrap gap-2">
                {defaultBookTags.map((tag) => (
                  <Button
                    key={tag.id}
                    variant={newBookTags.includes(tag.id) ? 'default' : 'outline'}
                    size="sm"
                    className="text-xs"
                    onClick={() => {
                      setNewBookTags(prev =>
                        prev.includes(tag.id)
                          ? prev.filter(id => id !== tag.id)
                          : [...prev, tag.id]
                      );
                    }}
                    style={
                      newBookTags.includes(tag.id)
                        ? { backgroundColor: tag.color }
                        : { borderColor: tag.color, color: tag.color }
                    }
                  >
                    {tag.name}
                  </Button>
                ))}
              </div>
            </div>
            
            <Button className="w-full" onClick={handleAddBook}>
              Add Book
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* View Book Dialog */}
      <Dialog open={!!viewingBook} onOpenChange={() => setViewingBook(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-auto">
          {viewingBook && (
            <>
              <DialogHeader>
                <DialogTitle>{viewingBook.title}</DialogTitle>
              </DialogHeader>
              
              <div className="space-y-6">
                <div className="flex gap-6">
                  <div className="w-32 h-48 flex-shrink-0 rounded-lg overflow-hidden bg-muted">
                    <img
                      src={viewingBook.coverUrl}
                      alt={viewingBook.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  
                  <div className="flex-1">
                    <p className="text-lg text-muted-foreground mb-2">{viewingBook.author}</p>
                    <Badge className={`mb-4 ${statusColors[viewingBook.status]}`}>
                      {statusLabels[viewingBook.status]}
                    </Badge>
                    
                    <p className="text-sm mb-4">{viewingBook.description}</p>
                    
                    <div className="flex flex-wrap gap-2 mb-4">
                      {viewingBook.tags.map((tag) => (
                        <span
                          key={tag.id}
                          className="text-xs px-2 py-1 rounded-full"
                          style={{
                            backgroundColor: `${tag.color}20`,
                            color: tag.color,
                          }}
                        >
                          {tag.name}
                        </span>
                      ))}
                    </div>
                    
                    {viewingBook.status === 'reading' && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span>Reading Progress</span>
                          <span>{viewingBook.progress}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={viewingBook.progress}
                          onChange={(e) => handleUpdateProgress(viewingBook, parseInt(e.target.value))}
                          className="w-full"
                        />
                      </div>
                    )}
                    
                    <div className="flex gap-2 mt-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setEditingBook(viewingBook);
                          setViewingBook(null);
                        }}
                      >
                        <Edit2 className="w-4 h-4 mr-2" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-destructive"
                        onClick={() => {
                          handleDeleteBook(viewingBook.id);
                          setViewingBook(null);
                        }}
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
                
                {/* Notes Section */}
                <div className="border-t pt-4">
                  <h4 className="font-semibold mb-4">Notes</h4>
                  
                  {/* Add Note */}
                  <div className="space-y-2 mb-4">
                    <Textarea
                      placeholder="Add a note..."
                      value={newNoteContent}
                      onChange={(e) => setNewNoteContent(e.target.value)}
                      className="min-h-[80px]"
                    />
                    <div className="flex gap-2">
                      <Input
                        placeholder="Page number (optional)"
                        type="number"
                        value={newNotePage}
                        onChange={(e) => setNewNotePage(e.target.value)}
                        className="w-32"
                      />
                      <Button onClick={() => handleAddNote(viewingBook.id)}>
                        Add Note
                      </Button>
                    </div>
                  </div>
                  
                  {/* Notes List */}
                  <ScrollArea className="max-h-[200px]">
                    <div className="space-y-2">
                      {viewingBook.notes.length === 0 ? (
                        <p className="text-muted-foreground text-sm">No notes yet</p>
                      ) : (
                        viewingBook.notes.map((note) => (
                          <div
                            key={note.id}
                            className="p-3 rounded-lg bg-muted/50"
                          >
                            <p className="text-sm">{note.content}</p>
                            <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                              {note.pageNumber && <span>Page {note.pageNumber}</span>}
                              <span>{new Date(note.createdAt).toLocaleDateString()}</span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </ScrollArea>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Book Dialog */}
      <Dialog open={!!editingBook} onOpenChange={() => setEditingBook(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Book</DialogTitle>
          </DialogHeader>
          {editingBook && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Title</Label>
                <Input
                  value={editingBook.title}
                  onChange={(e) => setEditingBook({ ...editingBook, title: e.target.value })}
                />
              </div>
              
              <div className="space-y-2">
                <Label>Author</Label>
                <Input
                  value={editingBook.author}
                  onChange={(e) => setEditingBook({ ...editingBook, author: e.target.value })}
                />
              </div>
              
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={editingBook.description}
                  onChange={(e) => setEditingBook({ ...editingBook, description: e.target.value })}
                />
              </div>
              
              <div className="space-y-2">
                <Label>Status</Label>
                <Select
                  value={editingBook.status}
                  onValueChange={(v: Book['status']) => setEditingBook({ ...editingBook, status: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="want-to-read">Want to Read</SelectItem>
                    <SelectItem value="reading">Reading</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="on-hold">On Hold</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <Button className="w-full" onClick={handleUpdateBook}>
                Save Changes
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
