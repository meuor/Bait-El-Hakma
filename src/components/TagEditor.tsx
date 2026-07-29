import React, { useState } from 'react';
import { X, Plus, Hash } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import type { UniversalTag } from '@/types';

interface TagEditorProps {
  tags: UniversalTag[];
  onChange: (tags: UniversalTag[]) => void;
  placeholder?: string;
}

const PRESET_COLORS = [
  '#ef4444', '#f97316', '#eab308', '#22c55e', '#06b6d4',
  '#3b82f6', '#8b5cf6', '#ec4899', '#6b7280',
];

export function TagEditor({ tags, onChange, placeholder = 'Add tag...' }: TagEditorProps) {
  const [input, setInput] = useState('');

  const addTag = () => {
    const name = input.trim().toLowerCase();
    if (!name || tags.some(t => t.name === name)) return;
    onChange([...tags, { name, color: PRESET_COLORS[tags.length % PRESET_COLORS.length] }]);
    setInput('');
  };

  const removeTag = (name: string) => {
    onChange(tags.filter(t => t.name !== name));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') { e.preventDefault(); addTag(); }
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-1.5">
        {tags.map(tag => (
          <Badge
            key={tag.name}
            variant="secondary"
            className="flex items-center gap-1 text-xs"
            style={{ backgroundColor: tag.color + '20', color: tag.color, borderColor: tag.color + '40' }}
          >
            <Hash className="h-3 w-3" />
            {tag.name}
            <button onClick={() => removeTag(tag.name)} className="ml-0.5 hover:opacity-70">
              <X className="h-3 w-3" />
            </button>
          </Badge>
        ))}
      </div>
      <div className="flex gap-2">
        <Input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="h-8 text-sm"
        />
        <Button type="button" variant="outline" size="sm" onClick={addTag} className="h-8">
          <Plus className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}
