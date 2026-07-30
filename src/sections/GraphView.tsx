import { useState, useRef, useMemo, useCallback, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ZoomIn, ZoomOut, RotateCcw, Search, Network } from 'lucide-react';
import { motion } from 'framer-motion';
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

const TYPE_CONFIG: Record<string, { color: string; glow: string; tab: AppTab }> = {
  'book': { color: '#8b5cf6', glow: 'rgba(139,92,246,0.5)', tab: 'library' },
  'todo': { color: '#22c55e', glow: 'rgba(34,197,94,0.5)', tab: 'todo' },
  'kanban-card': { color: '#f59e0b', glow: 'rgba(245,158,11,0.5)', tab: 'kanban' },
  'pomodoro-session': { color: '#3b82f6', glow: 'rgba(59,130,246,0.5)', tab: 'pomodoro' },
  'challenge': { color: '#ef4444', glow: 'rgba(239,68,68,0.5)', tab: 'challenges' },
};

const TYPE_LABELS: Record<string, string> = {
  'book': 'Book',
  'todo': 'Todo',
  'kanban-card': 'Kanban Card',
  'pomodoro-session': 'Pomodoro',
  'challenge': 'Challenge',
};

const ENTITY_TYPES: EntityType[] = ['book', 'todo', 'kanban-card', 'pomodoro-session', 'challenge'];

type GraphThemeId = 'default' | 'constellation' | 'neon' | 'warm';

interface GraphThemeConfig {
  id: GraphThemeId;
  label: string;
  icon: string;
  edgeColor: string;
  edgeWidth: number;
  nodeOpacity: number;
  labelOpacity: number;
  gridOpacity: number;
  glowIntensity: number;
}

const GRAPH_THEMES: GraphThemeConfig[] = [
  { id: 'default', label: 'Default', icon: '🎨', edgeColor: 'hsl(var(--border))', edgeWidth: 1.2, nodeOpacity: 0.2, labelOpacity: 0.85, gridOpacity: 0.12, glowIntensity: 5 },
  { id: 'constellation', label: 'Constellation', icon: '✨', edgeColor: '#4a7aff', edgeWidth: 0.8, nodeOpacity: 0.55, labelOpacity: 0.9, gridOpacity: 0.05, glowIntensity: 8 },
  { id: 'neon', label: 'Neon', icon: '💫', edgeColor: '#ff44ff', edgeWidth: 2.5, nodeOpacity: 0.35, labelOpacity: 1, gridOpacity: 0.06, glowIntensity: 12 },
  { id: 'warm', label: 'Warm', icon: '🌅', edgeColor: '#d4a853', edgeWidth: 1.5, nodeOpacity: 0.25, labelOpacity: 0.85, gridOpacity: 0.1, glowIntensity: 6 },
];

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

function runForceSimulation(nodes: GraphNode[], edges: GraphEdge[], cx: number, cy: number, iterations = 150) {
  const repulsionStrength = 5000;
  const attractionStrength = 0.005;
  const centerGravity = 0.01;
  const damping = 0.85;
  const minDist = 30;

  for (let iter = 0; iter < iterations; iter++) {
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

    for (const node of nodes) {
      node.vx += (cx - node.x) * centerGravity;
      node.vy += (cy - node.y) * centerGravity;
    }

    for (const node of nodes) {
      node.vx *= damping;
      node.vy *= damping;
      node.x += node.vx;
      node.y += node.vy;
    }
  }
}

function buildCurvedEdgePath(x1: number, y1: number, x2: number, y2: number, r2: number): string {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const dist = Math.sqrt(dx * dx + dy * dy) || 1;
  const ux = dx / dist;
  const uy = dy / dist;
  const tipX = x2 - ux * (r2 + 2);
  const tipY = y2 - uy * (r2 + 2);
  const midX = (x1 + tipX) / 2;
  const midY = (y1 + tipY) / 2;
  const offset = Math.min(dist * 0.15, 40);
  const nx = -uy * offset;
  const ny = ux * offset;
  return `M ${x1} ${y1} Q ${midX + nx} ${midY + ny} ${tipX} ${tipY}`;
}

export function GraphView() {
  const { state, dispatch } = useApp();
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const inertiaRef = useRef<{ vx: number; vy: number; frameId: number | null }>({ vx: 0, vy: 0, frameId: null });
  const dragRef = useRef<{
    node: GraphNode | null;
    startX: number; startY: number;
    nodeX: number; nodeY: number;
    panning: boolean;
    panStartX: number; panStartY: number;
    transformStartX: number; transformStartY: number;
    lastMoveTime: number; lastMoveX: number; lastMoveY: number;
  }>({
    node: null, startX: 0, startY: 0, nodeX: 0, nodeY: 0,
    panning: false, panStartX: 0, panStartY: 0, transformStartX: 0, transformStartY: 0,
    lastMoveTime: 0, lastMoveX: 0, lastMoveY: 0,
  });

  const [containerSize, setContainerSize] = useState({ width: 800, height: 500 });
  const [filterTypes, setFilterTypes] = useState<Set<string>>(new Set(ENTITY_TYPES));
  const [searchQuery, setSearchQuery] = useState('');
  const [hoveredNode, setHoveredNode] = useState<GraphNode | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const [transform, setTransform] = useState({ x: 0, y: 0, scale: 1 });
  const [graphTheme, setGraphTheme] = useState<GraphThemeId>('default');

  const themeConfig = GRAPH_THEMES.find(t => t.id === graphTheme)!;

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new ResizeObserver(entries => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        if (width > 0 && height > 0) {
          setContainerSize({ width, height });
        }
      }
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const { nodes, edges } = useMemo(() => {
    const cx = containerSize.width / 2;
    const cy = containerSize.height / 2;
    const spread = Math.min(containerSize.width, containerSize.height) * 0.3;
    const nodeMap = new Map<string, { label: string; type: EntityType; tags: string[] }>();
    const edgeList: GraphEdge[] = [];

    const addLinks = (entityId: string, links: LinkRef[] | undefined) => {
      if (!links) return;
      for (const link of links) {
        edgeList.push({ source: entityId, target: link.targetId });
      }
    };

    for (const book of state.books) {
      nodeMap.set(book.id, { label: book.title, type: 'book', tags: (book.tags || []).map(t => t.name) });
      if (book.links) addLinks(book.id, book.links);
    }
    for (const todo of state.todos) {
      nodeMap.set(todo.id, { label: todo.content, type: 'todo', tags: (todo.tags || []).map(t => t.name) });
      if (todo.links) addLinks(todo.id, todo.links);
    }
    for (const card of state.kanbanCards) {
      nodeMap.set(card.id, { label: card.title, type: 'kanban-card', tags: (card.tags || []).map(t => t.name) });
      if (card.links) addLinks(card.id, card.links);
    }
    for (const session of state.pomodoroHistory) {
      const label = session.customName || `${session.type} ${new Date(session.startTime).toLocaleDateString()}`;
      nodeMap.set(session.id, { label, type: 'pomodoro-session', tags: (session.tags || []).map(t => t.name) });
      if (session.links) addLinks(session.id, session.links);
    }
    for (const challenge of state.challenges) {
      nodeMap.set(challenge.id, { label: challenge.name, type: 'challenge', tags: (challenge.tags || []).map(t => t.name) });
      if (challenge.links) addLinks(challenge.id, challenge.links);
    }

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
      const radius = spread + Math.random() * spread * 0.5;
      nodeList.push({
        id,
        label: info.label,
        type: info.type as EntityType,
        x: cx + Math.cos(angle) * radius,
        y: cy + Math.sin(angle) * radius,
        vx: 0,
        vy: 0,
        radius: 20,
        color,
        tags: info.tags,
        backlinkCount: 0,
      });
      i++;
    }

    for (const node of nodeList) {
      node.backlinkCount = computeBacklinkCount(edgeList, node.id);
      node.radius = Math.max(20, Math.min(60, 20 + node.backlinkCount * 4));
    }

    runForceSimulation(nodeList, edgeList, cx, cy);

    return { nodes: nodeList, edges: edgeList };
  }, [state.books, state.todos, state.kanbanCards, state.pomodoroHistory, state.challenges, state.linkRegistry, containerSize]);

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
    if (tab) dispatch({ type: 'SET_TAB', payload: tab as AppTab });
  }, [dispatch]);

  const zoomTo = useCallback((newScale: number, centerX?: number, centerY?: number) => {
    const svg = svgRef.current;
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    const cx = centerX ?? rect.width / 2;
    const cy = centerY ?? rect.height / 2;
    setTransform(prev => ({
      x: cx - (cx - prev.x) * (newScale / prev.scale),
      y: cy - (cy - prev.y) * (newScale / prev.scale),
      scale: Math.max(0.2, Math.min(5, newScale)),
    }));
  }, []);

  const resetView = useCallback(() => {
    const svg = svgRef.current;
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    setTransform({ x: rect.width / 2 - containerSize.width / 2, y: rect.height / 2 - containerSize.height / 2, scale: 1 });
  }, [containerSize]);

  useEffect(() => {
    if (containerSize.width > 0 && containerSize.height > 0) {
      resetView();
    }
  }, [containerSize, resetView]);

  const stopInertia = () => {
    if (inertiaRef.current.frameId !== null) {
      cancelAnimationFrame(inertiaRef.current.frameId);
      inertiaRef.current.frameId = null;
    }
    inertiaRef.current.vx = 0;
    inertiaRef.current.vy = 0;
  };

  const startInertia = (vx: number, vy: number) => {
    stopInertia();
    if (Math.abs(vx) < 0.5 && Math.abs(vy) < 0.5) return;
    const friction = 0.92;
    const step = () => {
      const cur = inertiaRef.current;
      cur.vx *= friction;
      cur.vy *= friction;
      if (Math.abs(cur.vx) < 0.3 && Math.abs(cur.vy) < 0.3) { cur.vx = 0; cur.vy = 0; cur.frameId = null; return; }
      setTransform(prev => ({ ...prev, x: prev.x + cur.vx, y: prev.y + cur.vy }));
      cur.frameId = requestAnimationFrame(step);
    };
    inertiaRef.current.vx = vx;
    inertiaRef.current.vy = vy;
    inertiaRef.current.frameId = requestAnimationFrame(step);
  };

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const svg = svgRef.current;
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    const newScale = Math.max(0.2, Math.min(5, transform.scale * delta));
    setTransform(prev => ({
      x: mx - (mx - prev.x) * (newScale / prev.scale),
      y: my - (my - prev.y) * (newScale / prev.scale),
      scale: newScale,
    }));
  }, [transform]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    const svg = svgRef.current;
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    const svgX = (mx - transform.x) / transform.scale;
    const svgY = (my - transform.y) / transform.scale;

    let hitNode: GraphNode | null = null;
    for (const node of filteredNodes) {
      const dx = svgX - node.x;
      const dy = svgY - node.y;
      if (dx * dx + dy * dy <= node.radius * node.radius * 1.5) {
        hitNode = node;
        break;
      }
    }

    stopInertia();

    if (hitNode) {
      dragRef.current = {
        node: hitNode,
        startX: e.clientX, startY: e.clientY,
        nodeX: hitNode.x, nodeY: hitNode.y,
        panning: false,
        panStartX: 0, panStartY: 0,
        transformStartX: 0, transformStartY: 0,
        lastMoveTime: 0, lastMoveX: 0, lastMoveY: 0,
      };
    } else {
      dragRef.current = {
        node: null, startX: 0, startY: 0, nodeX: 0, nodeY: 0,
        panning: true,
        panStartX: e.clientX, panStartY: e.clientY,
        transformStartX: transform.x, transformStartY: transform.y,
        lastMoveTime: Date.now(), lastMoveX: e.clientX, lastMoveY: e.clientY,
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
      drag.lastMoveX = e.clientX;
      drag.lastMoveY = e.clientY;
      drag.lastMoveTime = Date.now();
      setTransform(prev => ({
        ...prev,
        x: drag.transformStartX + dx,
        y: drag.transformStartY + dy,
      }));
    } else {
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;
      const svgX = (mx - transform.x) / transform.scale;
      const svgY = (my - transform.y) / transform.scale;
      let found: GraphNode | null = null;
      for (const node of filteredNodes) {
        const dx = svgX - node.x;
        const dy = svgY - node.y;
        if (dx * dx + dy * dy <= node.radius * node.radius + 12) {
          found = node;
          break;
        }
      }
      if (found) {
        setHoveredNode(found);
        setTooltipPos({ x: e.clientX - rect.left + 12, y: e.clientY - rect.top - 10 });
        (svg as SVGSVGElement).style.cursor = 'pointer';
      } else {
        setHoveredNode(null);
        (svg as SVGSVGElement).style.cursor = 'grab';
      }
    }
  }, [filteredNodes, transform]);

  const handleMouseUp = useCallback((e: React.MouseEvent) => {
    const drag = dragRef.current;
    if (drag.node) {
      const dx = drag.node.x - drag.nodeX;
      const dy = drag.node.y - drag.nodeY;
      if (Math.abs(dx) < 3 && Math.abs(dy) < 3) {
        handleNodeClick(drag.node);
      }
    } else if (drag.panning) {
      const now = Date.now();
      const dt = now - drag.lastMoveTime;
      if (dt > 0 && dt < 100) {
        const vx = (e.clientX - drag.lastMoveX) * 2;
        const vy = (e.clientY - drag.lastMoveY) * 2;
        startInertia(vx, vy);
      }
    }
    dragRef.current = {
      node: null, startX: 0, startY: 0, nodeX: 0, nodeY: 0,
      panning: false, panStartX: 0, panStartY: 0, transformStartX: 0, transformStartY: 0,
      lastMoveTime: 0, lastMoveX: 0, lastMoveY: 0,
    };
  }, [handleNodeClick]);

  useEffect(() => {
    return () => stopInertia();
  }, []);

  const allActive = filterTypes.size === ENTITY_TYPES.length;
  const showAllLabel = allActive ? 'Hide All' : 'Show All';

  const gridPatternId = 'graph-grid';
  const glowFilterId = 'node-glow';

  const handleZoomIn = () => zoomTo(transform.scale * 1.3);
  const handleZoomOut = () => zoomTo(transform.scale * 0.7);

  const typeCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const n of filteredNodes) {
      counts[n.type] = (counts[n.type] || 0) + 1;
    }
    return counts;
  }, [filteredNodes]);

  return (
    <div className="tab-section space-y-4 h-full flex flex-col" style={{ minHeight: 500 }}>
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Network className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold">Knowledge Graph</h2>
          </div>
          <div className="relative flex-1 min-w-[160px] max-w-[260px]">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <Input
              placeholder="Search nodes..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="h-8 pl-8 text-xs"
            />
          </div>
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.05 }} className="flex flex-wrap items-center gap-2">
        <div className="flex flex-wrap gap-1.5">
          {ENTITY_TYPES.map(t => (
            <Button
              key={t}
              variant={filterTypes.has(t) ? 'default' : 'outline'}
              size="sm"
              className="text-xs h-7 px-2.5"
              style={filterTypes.has(t) ? { backgroundColor: TYPE_CONFIG[t]?.color } : { borderColor: TYPE_CONFIG[t]?.color, color: TYPE_CONFIG[t]?.color }}
              onClick={() => toggleType(t)}
            >
              {TYPE_LABELS[t]}
            </Button>
          ))}
          <Button
            variant="ghost"
            size="sm"
            className="text-xs h-7 px-2"
            onClick={() => {
              if (allActive) setFilterTypes(new Set());
              else setFilterTypes(new Set(ENTITY_TYPES));
            }}
          >
            {showAllLabel}
          </Button>
          <span className="w-px h-5 bg-border mx-0.5" />
          {GRAPH_THEMES.map(t => (
            <button key={t.id} onClick={() => setGraphTheme(t.id)}
              className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-[10px] transition-all ${graphTheme === t.id ? 'border-primary shadow-sm shadow-primary/30 scale-110' : 'border-border hover:border-muted-foreground'}`}
              title={t.label}
            >
              {t.icon}
            </button>
          ))}
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3, delay: 0.1 }} className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
        {ENTITY_TYPES.map(t => (
          <span key={t} className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: TYPE_CONFIG[t]?.color }} />
            <span>{TYPE_LABELS[t]}</span>
            {typeCounts[t] !== undefined && (
              <span className="text-[10px] opacity-60">({typeCounts[t]})</span>
            )}
          </span>
        ))}
        <span className="ml-auto text-[11px] font-medium text-foreground/70">
          {filteredNodes.length} node{filteredNodes.length !== 1 ? 's' : ''} &middot; {filteredEdges.length} edge{filteredEdges.length !== 1 ? 's' : ''}
        </span>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.35, delay: 0.1 }}
        ref={containerRef}
        className="flex-1 relative overflow-hidden rounded-xl border bg-card/40 backdrop-blur-[2px]"
        style={{ minHeight: 400 }}
      >
        <svg
          ref={svgRef}
          width="100%"
          height="100%"
          className="cursor-grab"
          onWheel={handleWheel}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          style={{ transition: 'none' }}
        >
          <defs>
            <pattern id={gridPatternId} width={40} height={40} patternUnits="userSpaceOnUse" patternTransform={`scale(${transform.scale})`}>
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="hsl(var(--border))" strokeWidth={0.5} strokeOpacity={themeConfig.gridOpacity} />
            </pattern>
            <filter id={glowFilterId} x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation={themeConfig.glowIntensity} result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
            {ENTITY_TYPES.map(t => {
              const c = TYPE_CONFIG[t]?.color || '#666';
              return (
                <radialGradient key={t} id={`grad-${t}`} cx="30%" cy="30%" r="70%">
                  <stop offset="0%" stopColor={c} stopOpacity="0.5" />
                  <stop offset="60%" stopColor={c} stopOpacity="0.15" />
                  <stop offset="100%" stopColor={c} stopOpacity="0" />
                </radialGradient>
              );
            })}
            <filter id="node-inner-shadow">
              <feOffset dx="0" dy="1" />
              <feGaussianBlur stdDeviation="1.5" result="offset-blur" />
              <feComposite operator="out" in="SourceGraphic" in2="offset-blur" result="inverse" />
              <feFlood floodColor="black" floodOpacity="0.3" result="color" />
              <feComposite operator="in" in="color" in2="inverse" result="shadow" />
              <feComposite operator="over" in="shadow" in2="SourceGraphic" />
            </filter>
          </defs>

          <rect width="100%" height="100%" fill={`url(#${gridPatternId})`} />

          <g transform={`translate(${transform.x},${transform.y}) scale(${transform.scale})`}>
            {filteredEdges.map((edge, i) => {
              const source = nodes.find(n => n.id === edge.source);
              const target = nodes.find(n => n.id === edge.target);
              if (!source || !target) return null;
              const isHovered = hoveredNode && (hoveredNode.id === edge.source || hoveredNode.id === edge.target);
              return (
                <g key={`edge-${i}`}>
                  <path
                    d={buildCurvedEdgePath(source.x, source.y, target.x, target.y, target.radius)}
                    fill="none"
                    stroke={isHovered ? target.color : themeConfig.edgeColor}
                    strokeWidth={isHovered ? 2 : themeConfig.edgeWidth}
                    strokeOpacity={isHovered ? 0.7 : 0.3}
                    className="transition-all duration-200"
                  />
                  <circle
                    cx={target.x - (target.x - source.x) * 0.08}
                    cy={target.y - (target.y - source.y) * 0.08}
                    r={2.5}
                    fill={isHovered ? target.color : themeConfig.edgeColor}
                    fillOpacity={isHovered ? 0.8 : 0.4}
                  />
                </g>
              );
            })}

            {filteredNodes.map((node, idx) => {
              const isHovered = hoveredNode?.id === node.id;
              return (
                <motion.g
                  key={node.id}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, delay: idx * 0.008 }}
                  style={{ cursor: 'pointer' }}
                >
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r={node.radius + 8}
                    fill={`url(#grad-${node.type})`}
                  />
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r={node.radius}
                    fill={node.color}
                    fillOpacity={isHovered ? Math.min(themeConfig.nodeOpacity + 0.25, 0.7) : themeConfig.nodeOpacity}
                    stroke={isHovered ? node.color : `${node.color}80`}
                    strokeWidth={isHovered ? 2.5 : 1.5}
                    className="transition-all duration-200"
                    filter={isHovered ? `url(#${glowFilterId})` : undefined}
                  />
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r={node.radius - 5}
                    fill="none"
                    stroke={node.color}
                    strokeWidth={1}
                    strokeOpacity={0.2}
                  />
                  {node.backlinkCount > 0 && (
                    <circle
                      cx={node.x + node.radius * 0.5}
                      cy={node.y - node.radius * 0.5}
                      r={6}
                      fill="hsl(var(--background))"
                      stroke={node.color}
                      strokeWidth={1}
                      strokeOpacity={0.5}
                    />
                  )}
                  <text
                    x={node.x}
                    y={node.y + node.radius + 14}
                    textAnchor="middle"
                    fill={isHovered ? node.color : 'hsl(var(--foreground))'}
                    fontSize={Math.max(9, Math.min(12, node.radius * 0.28))}
                    style={{ pointerEvents: 'none', userSelect: 'none', opacity: themeConfig.labelOpacity, transition: 'color 0.2s' }}
                    fontWeight={500}
                  >
                    {truncate(node.label, 14)}
                  </text>
                </motion.g>
              );
            })}
          </g>
        </svg>

        {/* Zoom controls */}
        <div className="absolute bottom-3 right-3 flex flex-col gap-1">
          <Button
            variant="secondary"
            size="icon"
            className="h-8 w-8 shadow-md bg-background/80 backdrop-blur-sm hover:bg-background"
            onClick={handleZoomIn}
            title="Zoom in"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </Button>
          <Button
            variant="secondary"
            size="icon"
            className="h-8 w-8 shadow-md bg-background/80 backdrop-blur-sm hover:bg-background"
            onClick={handleZoomOut}
            title="Zoom out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </Button>
          <Button
            variant="secondary"
            size="icon"
            className="h-8 w-8 shadow-md bg-background/80 backdrop-blur-sm hover:bg-background"
            onClick={resetView}
            title="Reset view"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </Button>
        </div>

        {/* Node count badge */}
        <div className="absolute top-2 left-2 px-2.5 py-1 rounded-md bg-background/70 backdrop-blur-sm border text-[11px] text-muted-foreground flex items-center gap-2">
          <span>{filteredNodes.length} node{filteredNodes.length !== 1 ? 's' : ''}</span>
          <span className="w-px h-3 bg-border" />
          <span>{transform.scale.toFixed(1)}x</span>
        </div>

        {/* Empty state */}
        {filteredNodes.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="text-center text-muted-foreground">
              <Network className="w-10 h-10 mx-auto mb-2 opacity-30" />
              <p className="text-sm">No nodes match your filters</p>
              {searchQuery && (
                <p className="text-xs mt-1 opacity-60">Try a different search term</p>
              )}
            </div>
          </div>
        )}

        {hoveredNode && (
          <div
            className="absolute z-50 bg-popover/95 border border-border/60 rounded-lg shadow-xl px-3 py-2.5 text-xs pointer-events-none backdrop-blur-md"
            style={{ left: tooltipPos.x, top: tooltipPos.y }}
          >
            <div className="font-semibold text-sm mb-1 flex items-center gap-1.5" style={{ color: hoveredNode.color }}>
              <span className="w-2 h-2 rounded-full inline-block shrink-0" style={{ backgroundColor: hoveredNode.color }} />
              {hoveredNode.label}
            </div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-0.5 text-[11px] text-muted-foreground">
              <span>Type: {TYPE_LABELS[hoveredNode.type] || hoveredNode.type}</span>
              <span>Links: {hoveredNode.backlinkCount}</span>
              {hoveredNode.tags.length > 0 && (
                <span className="col-span-2 truncate max-w-[200px]">Tags: {hoveredNode.tags.join(', ')}</span>
              )}
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
