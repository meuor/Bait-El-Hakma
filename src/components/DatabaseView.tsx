import { useState, useMemo, useCallback, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { LayoutGrid, List, Columns3, Plus, Search, ArrowUpDown, X, Edit3, Trash2, ChevronUp, ChevronDown } from 'lucide-react';
import type { PropertySchema, EntityType } from '@/types';
import { cn } from '@/lib/utils';

type ViewMode = 'table' | 'board' | 'gallery';

interface DatabaseViewProps {
  title?: string;
  entityType?: EntityType;
  items?: any[];
  defaultSchema?: PropertySchema[];
  onItemsChange?: (items: any[]) => void;
  onSchemaChange?: (schema: PropertySchema[]) => void;
}

const defaultSchemaPreset: PropertySchema[] = [
  { key: 'title', label: 'Title', type: 'text' },
  { key: 'status', label: 'Status', type: 'select', options: ['Not started', 'In progress', 'Done'] },
];

function getItemValue(item: any, key: string): string | number | null {
  if (item.properties && key in item.properties) return item.properties[key];
  return null;
}

function setItemValue(item: any, key: string, value: string | number | null): any {
  return { ...item, properties: { ...(item.properties || {}), [key]: value } };
}

const emptyItem = (id: string) => ({ id, properties: {} as Record<string, string | number | null> });

export function DatabaseView({ title = 'Database', entityType = 'item', items: externalItems, defaultSchema, onItemsChange, onSchemaChange }: DatabaseViewProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('table');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [editingCell, setEditingCell] = useState<{ id: string; key: string } | null>(null);
  const [editValue, setEditValue] = useState('');
  const [showSchemaEditor, setShowSchemaEditor] = useState(false);
  const [internalSchema, setInternalSchema] = useState<PropertySchema[]>(defaultSchema || defaultSchemaPreset);
  const [internalItems, setInternalItems] = useState<any[]>(externalItems?.length ? externalItems : []);
  const [schemaLabelInput, setSchemaLabelInput] = useState('');
  const [schemaKeyInput, setSchemaKeyInput] = useState('');
  const [schemaTypeInput, setSchemaTypeInput] = useState<PropertySchema['type']>('text');

  const items = externalItems ?? internalItems;
  const schema = defaultSchema ? defaultSchema : internalSchema;

  const firstSelectProp = useMemo(() => schema.find(p => p.type === 'select'), [schema]);
  const [boardGroupBy, setBoardGroupBy] = useState(firstSelectProp?.key || '');

  useEffect(() => {
    if (!boardGroupBy && firstSelectProp) {
      setBoardGroupBy(firstSelectProp.key);
    }
  }, [firstSelectProp, boardGroupBy]);

  const handleItemsChange = useCallback((newItems: any[]) => {
    if (onItemsChange) { onItemsChange(newItems); } else { setInternalItems(newItems); }
  }, [onItemsChange]);

  const handleSchemaChange = useCallback((newSchema: PropertySchema[]) => {
    if (onSchemaChange) { onSchemaChange(newSchema); } else { setInternalSchema(newSchema); }
  }, [onSchemaChange]);

  const processedItems = useMemo(() => {
    let result = items;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(item => {
        if (schema.some(prop => {
          const val = getItemValue(item, prop.key);
          return val?.toString().toLowerCase().includes(q);
        })) return true;
        return false;
      });
    }
    if (sortKey) {
      result = [...result].sort((a, b) => {
        const aVal = getItemValue(a, sortKey)?.toString() || '';
        const bVal = getItemValue(b, sortKey)?.toString() || '';
        const cmp = aVal.localeCompare(bVal);
        return sortDir === 'asc' ? cmp : -cmp;
      });
    }
    return result;
  }, [items, searchQuery, sortKey, sortDir, schema]);

  const viewModeButtons = [
    { mode: 'table' as ViewMode, icon: List, label: 'Table' },
    { mode: 'board' as ViewMode, icon: Columns3, label: 'Board' },
    { mode: 'gallery' as ViewMode, icon: LayoutGrid, label: 'Gallery' },
  ];

  const handleSort = (key: string) => {
    if (sortKey === key) { setSortDir(d => d === 'asc' ? 'desc' : 'asc'); }
    else { setSortKey(key); setSortDir('asc'); }
  };

  const startEditing = (id: string, key: string) => {
    const val = getItemValue(items.find(i => i.id === id), key);
    setEditingCell({ id, key });
    setEditValue(val?.toString() || '');
  };

  const commitEdit = () => {
    if (!editingCell) return;
    const { id, key } = editingCell;
    const prop = schema.find(p => p.key === key);
    const parsed = prop?.type === 'number' ? (editValue === '' ? null : Number(editValue)) : editValue;
    handleItemsChange(items.map(item => item.id === id ? setItemValue(item, key, parsed) : item));
    setEditingCell(null);
  };

  const addItem = () => {
    const id = crypto.randomUUID?.() || Date.now().toString(36) + Math.random().toString(36).slice(2, 9);
    handleItemsChange([...items, emptyItem(id)]);
  };

  const deleteItem = (id: string) => {
    handleItemsChange(items.filter(item => item.id !== id));
  };

  const addSchemaProperty = () => {
    if (!schemaLabelInput || !schemaKeyInput) return;
    const key = schemaKeyInput.trim().toLowerCase().replace(/\s+/g, '_');
    const newProp: PropertySchema = {
      key,
      label: schemaLabelInput.trim(),
      type: schemaTypeInput,
      options: schemaTypeInput === 'select' ? ['Option 1', 'Option 2'] : undefined,
    };
    handleSchemaChange([...schema, newProp]);
    setSchemaLabelInput('');
    setSchemaKeyInput('');
    setSchemaTypeInput('text');
  };

  const removeSchemaProperty = (index: number) => {
    handleSchemaChange(schema.filter((_, i) => i !== index));
  };

  const moveSchemaProperty = (index: number, direction: 'up' | 'down') => {
    const newSchema = [...schema];
    const target = direction === 'up' ? index - 1 : index + 1;
    if (target < 0 || target >= schema.length) return;
    [newSchema[index], newSchema[target]] = [newSchema[target], newSchema[index]];
    handleSchemaChange(newSchema);
  };

  const renderCell = (item: any, prop: PropertySchema) => {
    const value = getItemValue(item, prop.key);
    const isEditing = editingCell?.id === item.id && editingCell?.key === prop.key;

    if (isEditing) {
      if (prop.type === 'select') {
        return (
          <Select value={editValue} onValueChange={v => { setEditValue(v); }}>
            <SelectTrigger className="h-8 w-full text-xs" data-slot="select-trigger">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {prop.options?.map(opt => (
                <SelectItem key={opt} value={opt}>{opt}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      }
      if (prop.type === 'date') {
        return (
          <input
            type="date"
            value={editValue}
            onChange={e => setEditValue(e.target.value)}
            onBlur={commitEdit}
            onKeyDown={e => { if (e.key === 'Enter') commitEdit(); if (e.key === 'Escape') setEditingCell(null); }}
            className="h-8 w-full rounded border border-input bg-transparent px-2 text-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
            autoFocus
          />
        );
      }
      return (
        <Input
          type={prop.type === 'number' ? 'number' : 'text'}
          value={editValue}
          onChange={e => setEditValue(e.target.value)}
          onBlur={commitEdit}
          onKeyDown={e => { if (e.key === 'Enter') commitEdit(); if (e.key === 'Escape') setEditingCell(null); }}
          className="h-8 text-xs"
          autoFocus
        />
      );
    }

    const displayVal = value?.toString() || '';

    if (prop.type === 'select') {
      return <Badge variant="secondary" className="text-xs">{displayVal || '\u2014'}</Badge>;
    }
    if (prop.type === 'date' && displayVal) {
      const d = new Date(displayVal);
      return <span className="text-xs">{d.toLocaleDateString()}</span>;
    }
    if (prop.type === 'number') {
      return <span className="text-xs tabular-nums">{displayVal || '\u2014'}</span>;
    }
    if (prop.type === 'relation') {
      return displayVal ? <Badge variant="outline" className="text-xs">{displayVal}</Badge> : <span className="text-xs text-muted-foreground">None</span>;
    }
    return <span className="text-xs truncate block max-w-[200px]">{displayVal || '\u2014'}</span>;
  };

  return (
    <div className="space-y-4" data-slot="database-view">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-semibold">{title}</h2>
          <Badge variant="outline" className="text-xs capitalize">{entityType.replace('-', ' ')}</Badge>
        </div>
        <div className="flex items-center gap-1 rounded-lg border p-0.5 bg-muted/30">
          {viewModeButtons.map(({ mode, icon: Icon, label }) => (
            <Button
              key={mode}
              variant={viewMode === mode ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode(mode)}
              className="gap-1.5 h-8"
            >
              <Icon className="size-3.5" />
              <span className="hidden sm:inline">{label}</span>
            </Button>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="Search items..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="pl-8 h-9 text-sm"
          />
          {searchQuery && (
            <Button
              variant="ghost"
              size="icon-sm"
              className="absolute right-1 top-1/2 -translate-y-1/2 size-7"
              onClick={() => setSearchQuery('')}
            >
              <X className="size-3.5" />
            </Button>
          )}
        </div>
        <Button variant="outline" size="sm" className="gap-1.5" onClick={() => setShowSchemaEditor(!showSchemaEditor)}>
          <Edit3 className="size-3.5" />
          Properties
        </Button>
        <Button size="sm" className="gap-1.5" onClick={addItem}>
          <Plus className="size-3.5" />
          Add
        </Button>
      </div>

      {showSchemaEditor && (
        <Card data-slot="schema-editor" className="border-dashed">
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium">Property Schema</h3>
              <Button variant="ghost" size="icon-sm" onClick={() => setShowSchemaEditor(false)}>
                <X className="size-3.5" />
              </Button>
            </div>
            <div className="space-y-2">
              {schema.map((prop, index) => (
                <div key={prop.key} className="flex items-center gap-2 rounded-md border px-3 py-2 text-sm">
                  <div className="flex flex-col gap-0.5">
                    <Button variant="ghost" size="icon-sm" className="size-5" onClick={() => moveSchemaProperty(index, 'up')} disabled={index === 0}>
                      <ChevronUp className="size-3" />
                    </Button>
                    <Button variant="ghost" size="icon-sm" className="size-5" onClick={() => moveSchemaProperty(index, 'down')} disabled={index === schema.length - 1}>
                      <ChevronDown className="size-3" />
                    </Button>
                  </div>
                  <span className="flex-1 font-medium">{prop.label}</span>
                  <Badge variant="secondary" className="text-xs">{prop.type}</Badge>
                  <span className="text-xs text-muted-foreground">key: {prop.key}</span>
                  <Button variant="ghost" size="icon-sm" className="size-7 text-destructive" onClick={() => removeSchemaProperty(index)}>
                    <Trash2 className="size-3.5" />
                  </Button>
                </div>
              ))}
            </div>
            <div className="flex items-end gap-2 pt-1 border-t">
              <div className="space-y-1 flex-1">
                <label className="text-xs text-muted-foreground">Label</label>
                <Input
                  placeholder="Property label"
                  value={schemaLabelInput}
                  onChange={e => setSchemaLabelInput(e.target.value)}
                  className="h-8 text-xs"
                />
              </div>
              <div className="space-y-1 flex-1">
                <label className="text-xs text-muted-foreground">Key</label>
                <Input
                  placeholder="property_key"
                  value={schemaKeyInput}
                  onChange={e => setSchemaKeyInput(e.target.value)}
                  className="h-8 text-xs"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">Type</label>
                <Select value={schemaTypeInput} onValueChange={v => setSchemaTypeInput(v as PropertySchema['type'])}>
                  <SelectTrigger className="h-8 w-24 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="text">text</SelectItem>
                    <SelectItem value="number">number</SelectItem>
                    <SelectItem value="select">select</SelectItem>
                    <SelectItem value="date">date</SelectItem>
                    <SelectItem value="relation">relation</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button size="sm" className="h-8" onClick={addSchemaProperty}>Add</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {viewMode === 'table' && (
        <div className="rounded-md border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10 text-xs text-muted-foreground font-medium">#</TableHead>
                {schema.map(prop => (
                  <TableHead
                    key={prop.key}
                    className={cn(
                      "text-xs font-medium cursor-pointer select-none hover:text-foreground transition-colors",
                      sortKey === prop.key && "text-foreground"
                    )}
                    onClick={() => handleSort(prop.key)}
                  >
                    <div className="flex items-center gap-1">
                      {prop.label}
                      {sortKey === prop.key ? (
                        <ArrowUpDown className={cn("size-3", sortDir === 'asc' ? 'rotate-0' : 'rotate-180')} />
                      ) : (
                        <ArrowUpDown className="size-3 opacity-30" />
                      )}
                    </div>
                  </TableHead>
                ))}
                <TableHead className="w-16" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {processedItems.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={schema.length + 2} className="text-center text-muted-foreground py-8 text-sm">
                    {searchQuery ? 'No items match your search.' : 'No items yet. Click "Add" to create one.'}
                  </TableCell>
                </TableRow>
              ) : (
                processedItems.map((item, idx) => (
                  <TableRow key={item.id}>
                    <TableCell className="text-xs text-muted-foreground w-10">{idx + 1}</TableCell>
                    {schema.map(prop => (
                      <TableCell
                        key={prop.key}
                        className="cursor-pointer hover:bg-muted/50 transition-colors max-w-[200px]"
                        onClick={() => startEditing(item.id, prop.key)}
                      >
                        {renderCell(item, prop)}
                      </TableCell>
                    ))}
                    <TableCell className="w-16">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        className="size-7 text-muted-foreground hover:text-destructive"
                        onClick={e => { e.stopPropagation(); deleteItem(item.id); }}
                      >
                        <Trash2 className="size-3.5" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}

      {viewMode === 'board' && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Group by:</span>
            <Select
              value={schema.some(p => p.key === boardGroupBy) ? boardGroupBy : (firstSelectProp?.key || '')}
              onValueChange={setBoardGroupBy}
            >
              <SelectTrigger className="h-8 w-48 text-xs">
                <SelectValue placeholder="Select property..." />
              </SelectTrigger>
              <SelectContent>
                {schema.filter(p => p.type === 'select').map(prop => (
                  <SelectItem key={prop.key} value={prop.key}>{prop.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-4">
            {(schema.find(p => p.key === boardGroupBy)?.options || ['No group']).map(option => {
              const groupItems = processedItems.filter(item => getItemValue(item, boardGroupBy) === option);
              return (
                <div key={option} className="flex-shrink-0 w-72 space-y-2">
                  <div className="flex items-center gap-2 px-1">
                    <h3 className="text-sm font-medium">{option}</h3>
                    <Badge variant="secondary" className="text-xs">{groupItems.length}</Badge>
                  </div>
                  <div className="space-y-2 min-h-[120px] rounded-lg bg-muted/30 p-2">
                    {groupItems.length === 0 ? (
                      <p className="text-xs text-muted-foreground text-center py-6">No items</p>
                    ) : (
                      groupItems.map(item => (
                        <Card key={item.id} className="shadow-sm cursor-pointer hover:shadow-md transition-shadow" data-slot="board-card">
                          <CardContent className="p-3 space-y-1.5">
                            <div className="flex items-start justify-between gap-2">
                              <span className="text-sm font-medium truncate">
                                {getItemValue(item, 'title')?.toString() || 'Untitled'}
                              </span>
                              <Button
                                variant="ghost"
                                size="icon-sm"
                                className="size-6 text-muted-foreground hover:text-destructive shrink-0 -mr-1 -mt-1"
                                onClick={e => { e.stopPropagation(); deleteItem(item.id); }}
                              >
                                <Trash2 className="size-3" />
                              </Button>
                            </div>
                            {schema.filter(p => p.key !== 'title' && p.key !== boardGroupBy).slice(0, 3).map(prop => {
                              const val = getItemValue(item, prop.key);
                              if (!val) return null;
                              return (
                                <div key={prop.key} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                  <span className="truncate">{prop.label}:</span>
                                  <span className="truncate">{val.toString()}</span>
                                </div>
                              );
                            })}
                          </CardContent>
                        </Card>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {viewMode === 'gallery' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {processedItems.length === 0 ? (
            <div className="col-span-full text-center text-muted-foreground py-12 text-sm">
              {searchQuery ? 'No items match your search.' : 'No items yet. Click "Add" to create one.'}
            </div>
          ) : (
            processedItems.map(item => (
              <Card key={item.id} className="shadow-sm hover:shadow-md transition-shadow" data-slot="gallery-card">
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-medium truncate">
                        {getItemValue(item, 'title')?.toString() || 'Untitled'}
                      </h3>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      className="size-7 text-muted-foreground hover:text-destructive shrink-0 -mr-2 -mt-1"
                      onClick={() => deleteItem(item.id)}
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  </div>
                  <div className="space-y-1.5">
                    {schema.filter(p => p.key !== 'title').map(prop => {
                      const val = getItemValue(item, prop.key);
                      return (
                        <div key={prop.key} className="flex items-center gap-2 text-xs">
                          <span className="text-muted-foreground shrink-0 min-w-[60px]">{prop.label}</span>
                          {prop.type === 'select' && val ? (
                            <Badge variant="secondary" className="text-xs">{val.toString()}</Badge>
                          ) : prop.type === 'date' && val ? (
                            <span>{new Date(val.toString()).toLocaleDateString()}</span>
                          ) : (
                            <span className="truncate">{val?.toString() || '\u2014'}</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  );
}
