import { useState, useCallback } from 'react';
import { useApp } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2, Zap } from 'lucide-react';
import type { AutomationRule } from '@/types';

const TRIGGER_OPTIONS: { value: AutomationRule['trigger']; label: string }[] = [
  { value: 'timerComplete', label: 'Timer completes' },
  { value: 'cardMoved', label: 'Kanban card moved' },
  { value: 'todoChecked', label: 'Todo checked/unchecked' },
  { value: 'dateReached', label: 'Date reached' },
  { value: 'sessionComplete', label: 'Pomodoro session completes' },
];

const ACTION_OPTIONS: { value: AutomationRule['actions'][number]['type']; label: string }[] = [
  { value: 'createItem', label: 'Create item' },
  { value: 'updateItem', label: 'Update item' },
  { value: 'addLink', label: 'Add link to item' },
  { value: 'addTag', label: 'Add tag to item' },
  { value: 'notify', label: 'Send notification' },
];

function generateId(): string {
  return `rule-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function emptyRule(): AutomationRule {
  return {
    id: generateId(),
    name: '',
    trigger: 'timerComplete',
    conditions: {},
    actions: [],
    enabled: true,
  };
}

function emptyAction(): AutomationRule['actions'][number] {
  return { type: 'notify', params: {} };
}

export function AutomationRuleEditor() {
  const { state, dispatch } = useApp();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draftRules, setDraftRules] = useState<AutomationRule[]>(state.automationRules);

  const rules = editingId === null ? state.automationRules : draftRules;

  const isEditing = editingId !== null;

  const handleStartEditing = useCallback(() => {
    setDraftRules(state.automationRules.map(r => ({ ...r, conditions: { ...r.conditions }, actions: r.actions.map(a => ({ ...a, params: { ...a.params } })) })));
    setEditingId('__new__');
  }, [state.automationRules]);

  const handleCancelEditing = useCallback(() => {
    setEditingId(null);
    setDraftRules([]);
  }, []);

  const handleSave = useCallback(() => {
    dispatch({ type: 'SET_AUTOMATION_RULES', payload: draftRules });
    setEditingId(null);
    setDraftRules([]);
  }, [draftRules, dispatch]);

  const handleAddRule = useCallback(() => {
    setDraftRules(prev => [...prev, emptyRule()]);
  }, []);

  const handleDeleteRule = useCallback((ruleId: string) => {
    setDraftRules(prev => prev.filter(r => r.id !== ruleId));
  }, []);

  const handleToggleEnabled = useCallback((ruleId: string) => {
    if (isEditing) {
      setDraftRules(prev => prev.map(r => r.id === ruleId ? { ...r, enabled: !r.enabled } : r));
    } else {
      const updated = state.automationRules.map(r => r.id === ruleId ? { ...r, enabled: !r.enabled } : r);
      dispatch({ type: 'SET_AUTOMATION_RULES', payload: updated });
    }
  }, [isEditing, state.automationRules, dispatch]);

  const handleUpdateRule = useCallback((ruleId: string, patch: Partial<AutomationRule>) => {
    setDraftRules(prev => prev.map(r => r.id === ruleId ? { ...r, ...patch } : r));
  }, []);

  const handleAddCondition = useCallback((ruleId: string) => {
    setDraftRules(prev => prev.map(r => {
      if (r.id !== ruleId) return r;
      const key = `key_${Object.keys(r.conditions).length + 1}`;
      return { ...r, conditions: { ...r.conditions, [key]: '' } };
    }));
  }, []);

  const handleUpdateCondition = useCallback((ruleId: string, oldKey: string, newKey: string, value: string) => {
    setDraftRules(prev => prev.map(r => {
      if (r.id !== ruleId) return r;
      const conditions = { ...r.conditions };
      delete conditions[oldKey];
      conditions[newKey] = value;
      return { ...r, conditions };
    }));
  }, []);

  const handleRemoveCondition = useCallback((ruleId: string, key: string) => {
    setDraftRules(prev => prev.map(r => {
      if (r.id !== ruleId) return r;
      const conditions = { ...r.conditions };
      delete conditions[key];
      return { ...r, conditions };
    }));
  }, []);

  const handleAddAction = useCallback((ruleId: string) => {
    setDraftRules(prev => prev.map(r => r.id === ruleId ? { ...r, actions: [...r.actions, emptyAction()] } : r));
  }, []);

  const handleUpdateAction = useCallback((ruleId: string, actionIndex: number, patch: Partial<AutomationRule['actions'][number]>) => {
    setDraftRules(prev => prev.map(r => {
      if (r.id !== ruleId) return r;
      const actions = r.actions.map((a, i) => i === actionIndex ? { ...a, ...patch } : a);
      return { ...r, actions };
    }));
  }, []);

  const handleUpdateActionParam = useCallback((ruleId: string, actionIndex: number, key: string, value: string) => {
    setDraftRules(prev => prev.map(r => {
      if (r.id !== ruleId) return r;
      const actions = r.actions.map((a, i) => {
        if (i !== actionIndex) return a;
        return { ...a, params: { ...a.params, [key]: value } };
      });
      return { ...r, actions };
    }));
  }, []);

  const handleRemoveActionParam = useCallback((ruleId: string, actionIndex: number, key: string) => {
    setDraftRules(prev => prev.map(r => {
      if (r.id !== ruleId) return r;
      const actions = r.actions.map((a, i) => {
        if (i !== actionIndex) return a;
        const params = { ...a.params };
        delete params[key];
        return { ...a, params };
      });
      return { ...r, actions };
    }));
  }, []);

  const handleAddActionParam = useCallback((ruleId: string, actionIndex: number) => {
    setDraftRules(prev => prev.map(r => {
      if (r.id !== ruleId) return r;
      const actions = r.actions.map((a, i) => {
        if (i !== actionIndex) return a;
        const key = `param_${Object.keys(a.params).length + 1}`;
        return { ...a, params: { ...a.params, [key]: '' } };
      });
      return { ...r, actions };
    }));
  }, []);

  const handleRemoveAction = useCallback((ruleId: string, actionIndex: number) => {
    setDraftRules(prev => prev.map(r => {
      if (r.id !== ruleId) return r;
      return { ...r, actions: r.actions.filter((_, i) => i !== actionIndex) };
    }));
  }, []);

  const triggerLabel = (value: AutomationRule['trigger']) => TRIGGER_OPTIONS.find(o => o.value === value)?.label ?? value;
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Zap className="h-5 w-5" />
          Automation Rules
        </h2>
        <div className="flex items-center gap-2">
          {isEditing && (
            <>
              <Button variant="ghost" size="sm" onClick={handleAddRule}>
                <Plus className="h-4 w-4 mr-1" />
                Add rule
              </Button>
              <Button variant="outline" size="sm" onClick={handleCancelEditing}>
                Cancel
              </Button>
              <Button size="sm" onClick={handleSave}>
                Save
              </Button>
            </>
          )}
          {!isEditing && (
            <Button size="sm" onClick={handleStartEditing}>
              <Plus className="h-4 w-4 mr-1" />
              Edit rules
            </Button>
          )}
        </div>
      </div>

      {rules.length === 0 && (
        <p className="text-muted-foreground text-sm py-8 text-center">
          No automation rules yet. {isEditing ? 'Click "Add rule" to create one.' : 'Click "Edit rules" to get started.'}
        </p>
      )}

      <div className="space-y-3">
        {rules.map(rule => {
          const isCurrentlyEditing = isEditing;

          return (
            <Card key={rule.id} className="p-4">
              {!isCurrentlyEditing ? (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Badge variant={rule.enabled ? 'default' : 'secondary'} className="capitalize">
                      {triggerLabel(rule.trigger)}
                    </Badge>
                    <div>
                      <p className="font-medium">{rule.name || 'Untitled rule'}</p>
                      <p className="text-xs text-muted-foreground">
                        {rule.actions.length} action{rule.actions.length !== 1 ? 's' : ''}
                        {Object.keys(rule.conditions).length > 0 && ` · ${Object.keys(rule.conditions).length} condition${Object.keys(rule.conditions).length !== 1 ? 's' : ''}`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch checked={rule.enabled} onCheckedChange={() => handleToggleEnabled(rule.id)} />
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-3">
                      <div>
                        <Label>Rule name</Label>
                        <Input
                          value={rule.name}
                          onChange={e => handleUpdateRule(rule.id, { name: e.target.value })}
                          placeholder="e.g. Notify when timer ends"
                        />
                      </div>

                      <div>
                        <Label>Trigger</Label>
                        <Select
                          value={rule.trigger}
                          onValueChange={val => handleUpdateRule(rule.id, { trigger: val as AutomationRule['trigger'] })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {TRIGGER_OPTIONS.map(opt => (
                              <SelectItem key={opt.value} value={opt.value}>
                                {opt.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <Label>Conditions</Label>
                          <Button variant="ghost" size="sm" onClick={() => handleAddCondition(rule.id)}>
                            <Plus className="h-3 w-3 mr-1" />
                            Add condition
                          </Button>
                        </div>
                        {Object.keys(rule.conditions).length === 0 && (
                          <p className="text-xs text-muted-foreground">No conditions (always triggers)</p>
                        )}
                        <div className="space-y-2">
                          {Object.entries(rule.conditions).map(([key, value]) => (
                            <div key={key} className="flex items-center gap-2">
                              <Input
                                className="w-32"
                                value={key}
                                onChange={e => handleUpdateCondition(rule.id, key, e.target.value, value)}
                                placeholder="Key"
                              />
                              <Input
                                className="flex-1"
                                value={value}
                                onChange={e => handleUpdateCondition(rule.id, key, key, e.target.value)}
                                placeholder="Value"
                              />
                              <Button variant="ghost" size="icon" onClick={() => handleRemoveCondition(rule.id, key)}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <Label>Actions</Label>
                          <Button variant="ghost" size="sm" onClick={() => handleAddAction(rule.id)}>
                            <Plus className="h-3 w-3 mr-1" />
                            Add action
                          </Button>
                        </div>
                        {rule.actions.length === 0 && (
                          <p className="text-xs text-muted-foreground">No actions defined</p>
                        )}
                        <div className="space-y-3">
                          {rule.actions.map((action, idx) => (
                            <Card key={idx} className="p-3 border-dashed">
                              <div className="flex items-start justify-between mb-2">
                                <Select
                                  value={action.type}
                                  onValueChange={val => handleUpdateAction(rule.id, idx, { type: val as AutomationRule['actions'][number]['type'] })}
                                >
                                  <SelectTrigger className="w-44">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {ACTION_OPTIONS.map(opt => (
                                      <SelectItem key={opt.value} value={opt.value}>
                                        {opt.label}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <Button variant="ghost" size="icon" onClick={() => handleRemoveAction(rule.id, idx)}>
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                              <div>
                                <div className="flex items-center justify-between mb-1">
                                  <span className="text-xs text-muted-foreground">Params</span>
                                  <Button variant="ghost" size="sm" onClick={() => handleAddActionParam(rule.id, idx)}>
                                    <Plus className="h-3 w-3 mr-1" />
                                    Add param
                                  </Button>
                                </div>
                                {Object.keys(action.params).length === 0 && (
                                  <p className="text-xs text-muted-foreground">No params</p>
                                )}
                                <div className="space-y-1">
                                  {Object.entries(action.params).map(([pKey, pValue]) => (
                                    <div key={pKey} className="flex items-center gap-2">
                                      <Input
                                        className="w-28"
                                        value={pKey}
                                        onChange={e => {
                                          handleRemoveActionParam(rule.id, idx, pKey);
                                          handleUpdateActionParam(rule.id, idx, e.target.value, pValue);
                                        }}
                                        placeholder="Key"
                                      />
                                      <Input
                                        className="flex-1"
                                        value={pValue}
                                        onChange={e => handleUpdateActionParam(rule.id, idx, pKey, e.target.value)}
                                        placeholder="Value"
                                      />
                                      <Button variant="ghost" size="icon" onClick={() => handleRemoveActionParam(rule.id, idx, pKey)}>
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </Card>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col items-center gap-2 pt-6">
                      <div className="flex items-center gap-2">
                        <Label className="text-xs">Enabled</Label>
                        <Switch
                          checked={rule.enabled}
                          onCheckedChange={() => handleUpdateRule(rule.id, { enabled: !rule.enabled })}
                        />
                      </div>
                      <Button variant="destructive" size="sm" onClick={() => handleDeleteRule(rule.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}