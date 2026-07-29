import { useState, useRef, useMemo, useCallback } from 'react';
import { useApp } from '@/context/AppContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import type { LinkRef, EntityType, AppTab } from '@/types';

interface GraphNode {
  id: string;
  label: string;
  type: EntityType;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  tags: string[];
  backlinkCount: number;
}

interface GraphEdge {
  source: string;
  target: string;
}

const TYPE_CONFIG: Record<string, { color: string; tab: AppTab }> = {
  'book': { color: '#8b5cf6', tab: 'library' },
  'todo': { color: '#22c55e', tab: 'todo' },
  'kanban-card': { color: '#f59e0b', tab: 'kanban' },
  'pomodoro-session': { color: '#3b82f6', tab: 'pomodoro' },
  'challenge': { color: '#ef4444', tab: 'challenges' },
};

const TYPE_LABELS: Record<string, string> = {
  'book': 'Book',
  'todo': 'Todo',
  'kanban-card': 'Kanban Card',
  'pomodoro-session': 'Pomodoro',
  'challenge': 'Challenge',
};

const ENTITY_TYPES: EntityType[] = ['book', 'todo', 'kanban-card', 'pomodoro-session', 'challenge'];

function truncate(s: string, n: number): string {
  return s.length > n ? s.slice(0, n) + '...' : s;
}

function computeBacklinkCount(edges: GraphEdge[], nodeId: string): number {
  let count = 0;
  for (const e of edges) {
    if (e.target === nodeId || e.source === nodeId) count++;
  }
  return count;
}

function runForceSimulation(nodes: GraphNode[], edges: GraphEdge[], iterations = 150) {
  const repulsionStrength = 5000;
  const attractionStrength = 0.005;
  const centerGravity = 0.01;
  const damping = 0.85;
  const minDist = 30;

  const cx = 400;
  const cy = 300;

  for (let iter = 0; iter < iterations; iter++) {
    // Repulsion
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const a = nodes[i];
        const b = nodes[j];
        let dx = b.x - a.x;
        let dy = b.y - a.y;
        let dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < minDist) dist = minDist;
        const force = repulsionStrength / (dist * dist);
        const fx = (dx / dist) * force;
        const fy = (dy / dist) * force;
        a.vx -= fx;
        a.vy -= fy;
        b.vx += fx;
        b.vy += fy;
      }
    }

    // Attraction along edges
    for (const edge of edges) {
      const source = nodes.find(n => n.id === edge.source);
      const target = nodes.find(n => n.id === edge.target);
      if (!source || !target) continue;
      const dx = target.x - source.x;
      const dy = target.y - source.y;
      const dist = Math.sqrt(dx * dx + dy * dy) || 1;
      const force = attractionStrength * dist;
      const fx = (dx / dist) * force;
      const fy = (dy / dist) * force;
      source.vx += fx;
      source.vy += fy;
      target.vx -= fx;
      target.vy -= fy;
    }

    // Center gravity
    for (const node of nodes) {
      node.vx += (cx - node.x) * centerGravity;
      node.vy += (cy - node.y) * centerGravity;
    }

    // Apply velocity with damping
    for (const node of nodes) {
      node.vx *= damping;
      node.vy *= damping;
      node.x += node.vx;
      node.y += node.vy;
    }
  }
}

function buildArrowHead(x1: number, y1: number, x2: number, y2: number, r2: number): string {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const dist = Math.sqrt(dx * dx + dy * dy) || 1;
  const ux = dx / dist;
  const uy = dy / dist;
  const tipX = x2 - ux * (r2 + 6);
  const tipY = y2 - uy * (r2 + 6);
  const bx = tipX - ux * 10;
  const by = tipY - uy * 10;
  const px = -uy * 5;
  const py = ux * 5;
  return `${tipX},${tipY} ${bx + px},${by + py} ${bx - px},${by - py}`;
}

export function GraphView() {
  const { state, dispatch } = useApp();
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [filterTypes, setFilterTypes] = useState<Set<string>>(new Set(ENTITY_TYPES));
  const [searchQuery, setSearchQuery] = useState('');
  const [hoveredNode, setHoveredNode] = useState<GraphNode | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  // Transform state for zoom/pan
  const [transform, setTransform] = useState({ x: 0, y: 0, scale: 1 });

  // Drag state
  const dragRef = useRef<{ node: GraphNode | null; startX: number; startY: number; nodeX: number; nodeY: number; panning: boolean; panStartX: number; panStartY: number; transformStartX: number; transformStartY: number }>({
    node: null, startX: 0, startY: 0, nodeX: 0, nodeY: 0,
    panning: false, panStartX: 0, panStartY: 0, transformStartX: 0, transformStartY: 0,
  });

  // Build nodes and edges from state
  const { nodes, edges } = useMemo(() => {
    const nodeMap = new Map<string, { label: string; type: EntityType; tags: string[] }>();
    const edgeList: GraphEdge[] = [];

    const addLinks = (entityId: string, links: LinkRef[] | undefined) => {
      if (!links) return;
      for (const link of links) {
        edgeList.push({ source: entityId, target: link.targetId });
      }
    };

    for (const book of state.books) {
      nodeMap.set(book.id, { label: book.title, type: 'book', tags: book.tags.map(t => t.name) });
      addLinks(book.id, book.links);
    }
    for (const todo of state.todos) {
      nodeMap.set(todo.id, { label: todo.content, type: 'todo', tags: todo.tags.map(t => t.name) });
      addLinks(todo.id, todo.links);
    }
    for (const card of state.kanbanCards) {
      nodeMap.set(card.id, { label: card.title, type: 'kanban-card', tags: card.tags.map(t => t.name) });
      addLinks(card.id, card.links);
    }
    for (const session of state.pomodoroHistory) {
      const label = session.customName || `${session.type} ${new Date(session.startTime).toLocaleDateString()}`;
      nodeMap.set(session.id, { label, type: 'pomodoro-session', tags: session.tags.map(t => t.name) });
      addLinks(session.id, session.links);
    }
    for (const challenge of state.challenges) {
      nodeMap.set(challenge.id, { label: challenge.name, type: 'challenge', tags: challenge.tags.map(t => t.name) });
      addLinks(challenge.id, challenge.links);
    }

    // Also add reverse links from linkRegistry
    for (const [targetId, refs] of Object.entries(state.linkRegistry)) {
      for (const ref of refs) {
        const exists = edgeList.some(e => e.source === ref.targetId && e.target === targetId);
        if (!exists) {
          edgeList.push({ source: ref.targetId, target: targetId });
        }
      }
    }

    const nodeList: GraphNode[] = [];
    const seed = Math.random() * 1000;
    let i = 0;
    for (const [id, info] of nodeMap) {
      const color = TYPE_CONFIG[info.type]?.color || '#666';
      const angle = (i / nodeMap.size) * Math.PI * 2 + seed;
      const radius = 150 + Math.random() * 100;
      nodeList.push({
        id,
        label: info.label,
        type: info.type as EntityType,
        x: 400 + Math.cos(angle) * radius,
        y: 300 + Math.sin(angle) * radius,
        vx: 0,
        vy: 0,
        radius: 20,
        color,
        tags: info.tags,
        backlinkCount: 0,
      });
      i++;
    }

    // Compute backlink counts and sizes
    for (const node of nodeList) {
      node.backlinkCount = computeBacklinkCount(edgeList, node.id);
      node.radius = Math.max(20, Math.min(60, 20 + node.backlinkCount * 4));
    }

    runForceSimulation(nodeList, edgeList);

    return { nodes: nodeList, edges: edgeList };
  }, [state.books, state.todos, state.kanbanCards, state.pomodoroHistory, state.challenges, state.linkRegistry]);

  const filteredNodes = useMemo(() => {
    return nodes.filter(n => {
      if (!filterTypes.has(n.type)) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return n.label.toLowerCase().includes(q) || n.tags.some(t => t.toLowerCase().includes(q));
      }
      return true;
    });
  }, [nodes, filterTypes, searchQuery]);

  const filteredNodeIds = useMemo(() => new Set(filteredNodes.map(n => n.id)), [filteredNodes]);

  const filteredEdges = useMemo(() => {
    return edges.filter(e => filteredNodeIds.has(e.source) && filteredNodeIds.has(e.target));
  }, [edges, filteredNodeIds]);

  const toggleType = (t: string) => {
    setFilterTypes(prev => {
      const next = new Set(prev);
      if (next.has(t)) next.delete(t);
      else next.add(t);
      return next;
    });
  };

  const handleNodeClick = useCallback((node: GraphNode) => {
    const tab = TYPE_CONFIG[node.type]?.tab;
    if (tab) {
      dispatch({ type: 'SET_TAB', payload: tab as AppTab });
    }
  }, [dispatch]);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setTransform(prev => ({
      ...prev,
      scale: Math.max(0.2, Math.min(5, prev.scale * delta)),
    }));
  }, []);

  // Mouse handlers for drag
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    const svg = svgRef.current;
    if (!svg) return;

    const rect = svg.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;

    // Convert screen coords to svg coords
    const svgX = (mx - transform.x) / transform.scale;
    const svgY = (my - transform.y) / transform.scale;

    // Check if we hit a node
    let hitNode: GraphNode | null = null;
    for (const node of filteredNodes) {
      const dx = svgX - node.x;
      const dy = svgY - node.y;
      if (dx * dx + dy * dy <= node.radius * node.radius) {
        hitNode = node;
        break;
      }
    }

    if (hitNode) {
      dragRef.current = {
        node: hitNode,
        startX: e.clientX,
        startY: e.clientY,
        nodeX: hitNode.x,
        nodeY: hitNode.y,
        panning: false,
        panStartX: 0,
        panStartY: 0,
        transformStartX: 0,
        transformStartY: 0,
      };
    } else if (e.button === 1 || (e.button === 0 && (e.shiftKey || e.altKey))) {
      // Middle mouse or space (handled via key) + drag = pan
      dragRef.current = {
        node: null,
        startX: e.clientX,
        startY: e.clientY,
        nodeX: 0,
        nodeY: 0,
        panning: true,
        panStartX: e.clientX,
        panStartY: e.clientY,
        transformStartX: transform.x,
        transformStartY: transform.y,
      };
    } else {
      dragRef.current = {
        node: null, startX: 0, startY: 0, nodeX: 0, nodeY: 0,
        panning: false, panStartX: 0, panStartY: 0, transformStartX: 0, transformStartY: 0,
      };
    }
  }, [filteredNodes, transform]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const drag = dragRef.current;
    const svg = svgRef.current;
    if (!svg) return;

    const rect = svg.getBoundingClientRect();

    if (drag.node) {
      const dx = (e.clientX - drag.startX) / transform.scale;
      const dy = (e.clientY - drag.startY) / transform.scale;
      drag.node.x = drag.nodeX + dx;
      drag.node.y = drag.nodeY + dy;
    } else if (drag.panning) {
      const dx = e.clientX - drag.panStartX;
      const dy = e.clientY - drag.panStartY;
      setTransform(prev => ({
        ...prev,
        x: drag.transformStartX + dx,
        y: drag.transformStartY + dy,
      }));
    } else {
      // Hover detection
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;
      const svgX = (mx - transform.x) / transform.scale;
      const svgY = (my - transform.y) / transform.scale;
      let found: GraphNode | null = null;
      for (const node of filteredNodes) {
        const dx = svgX - node.x;
        const dy = svgY - node.y;
        if (dx * dx + dy * dy <= node.radius * node.radius + 8) {
          found = node;
          break;
        }
      }
      if (found) {
        setHoveredNode(found);
        setTooltipPos({ x: e.clientX - rect.left + 12, y: e.clientY - rect.top - 10 });
      } else {
        setHoveredNode(null);
      }
    }
  }, [filteredNodes, transform]);

  const handleMouseUp = useCallback(() => {
    const drag = dragRef.current;
    if (drag.node) {
      // Check if this was a click (no significant drag) -> navigate
      const dx = drag.node.x - drag.nodeX;
      const dy = drag.node.y - drag.nodeY;
      if (Math.abs(dx) < 3 && Math.abs(dy) < 3) {
        handleNodeClick(drag.node);
      }
    }
    dragRef.current = {
      node: null, startX: 0, startY: 0, nodeX: 0, nodeY: 0,
      panning: false, panStartX: 0, panStartY: 0, transformStartX: 0, transformStartY: 0,
    };
  }, [handleNodeClick]);

  const allActive = filterTypes.size === ENTITY_TYPES.length;

  return (
    <div className="tab-section space-y-4 h-full flex flex-col" style={{ minHeight: 400 }}>
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex flex-wrap gap-1.5">
          {ENTITY_TYPES.map(t => (
            <Button
              key={t}
              variant={filterTypes.has(t) ? 'default' : 'outline'}
              size="sm"
              className="text-xs h-7"
              style={filterTypes.has(t) ? { backgroundColor: TYPE_CONFIG[t]?.color } : { borderColor: TYPE_CONFIG[t]?.color, color: TYPE_CONFIG[t]?.color }}
              onClick={() => toggleType(t)}
            >
              {TYPE_LABELS[t]}
            </Button>
          ))}
          <Button
            variant="ghost"
            size="sm"
            className="text-xs h-7"
            onClick={() => {
              if (allActive) setFilterTypes(new Set());
              else setFilterTypes(new Set(ENTITY_TYPES));
            }}
          >
            {allActive ? 'Hide All' : 'Show All'}
          </Button>
        </div>
        <div className="flex-1 min-w-[140px] max-w-[260px]">
          <Input
            placeholder="Search nodes..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="h-7 text-xs"
          />
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 text-xs text-muted-foreground px-1">
        {ENTITY_TYPES.map(t => (
          <span key={t} className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: TYPE_CONFIG[t]?.color }} />
            {TYPE_LABELS[t]}
          </span>
        ))}
      </div>

      {/* Graph Canvas */}
      <div
        ref={containerRef}
        className="flex-1 relative overflow-hidden rounded-lg border bg-card"
        style={{ minHeight: 400 }}
      >
        <svg
          ref={svgRef}
          width="100%"
          height="100%"
          className="cursor-grab active:cursor-grabbing"
          onWheel={handleWheel}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          <g transform={`translate(${transform.x},${transform.y}) scale(${transform.scale})`}>
            {/* Edges */}
            {filteredEdges.map((edge, i) => {
              const source = nodes.find(n => n.id === edge.source);
              const target = nodes.find(n => n.id === edge.target);
              if (!source || !target) return null;
              return (
                <g key={`edge-${i}`}>
                  <line
                    x1={source.x}
                    y1={source.y}
                    x2={target.x}
                    y2={target.y}
                    stroke="hsl(var(--border))"
                    strokeWidth={1.5}
                    strokeOpacity={0.6}
                  />
                  <polygon
                    points={buildArrowHead(source.x, source.y, target.x, target.y, target.radius)}
                    fill="hsl(var(--border))"
                    fillOpacity={0.6}
                  />
                </g>
              );
            })}

            {/* Nodes */}
            {filteredNodes.map(node => (
              <g key={node.id} style={{ cursor: 'pointer' }}>
                <circle
                  cx={node.x}
                  cy={node.y}
                  r={node.radius}
                  fill={node.color}
                  fillOpacity={0.25}
                  stroke={node.color}
                  strokeWidth={2}
                />
                <text
                  x={node.x}
                  y={node.y}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fill="hsl(var(--foreground))"
                  fontSize={Math.max(8, Math.min(13, node.radius * 0.35))}
                  style={{ pointerEvents: 'none', userSelect: 'none' }}
                >
                  {truncate(node.label, 15)}
                </text>
              </g>
            ))}
          </g>
        </svg>

        {/* Tooltip */}
        {hoveredNode && (
          <div
            className="absolute z-50 bg-popover border border-border rounded-md shadow-md px-3 py-2 text-xs pointer-events-none"
            style={{ left: tooltipPos.x, top: tooltipPos.y }}
          >
            <div className="font-semibold text-sm mb-0.5">{hoveredNode.label}</div>
            <div className="text-muted-foreground">
              <span className="inline-block w-2 h-2 rounded-full mr-1" style={{ backgroundColor: hoveredNode.color }} />
              {TYPE_LABELS[hoveredNode.type] || hoveredNode.type}
            </div>
            {hoveredNode.tags.length > 0 && (
              <div className="text-muted-foreground mt-0.5">
                Tags: {hoveredNode.tags.join(', ')}
              </div>
            )}
            <div className="text-muted-foreground">
              Links: {hoveredNode.backlinkCount}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
