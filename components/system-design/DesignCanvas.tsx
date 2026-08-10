"use client";

import {
  useCallback,
  useEffect,
  useRef,
  type DragEvent,
} from "react";
import {
  ReactFlow,
  ReactFlowProvider,
  Background,
  Controls,
  MiniMap,
  addEdge,
  useEdgesState,
  useNodesState,
  useReactFlow,
  type Connection,
  type Edge,
  type Node,
  ConnectionMode,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import { getComponent } from "@/lib/system-design/components";
import type { DesignGraph, EdgeKind } from "@/lib/system-design/types";
import {
  fromDesignGraph,
  toDesignGraph,
} from "@/lib/system-design/serialize";
import ArchitectureNode, {
  type ArchitectureNodeType,
} from "./ArchitectureNode";

const nodeTypes = { architecture: ArchitectureNode };

export type CanvasTool = "select" | "connect" | "delete";

function edgeStyle(kind: EdgeKind): Partial<Edge> {
  if (kind === "observe" || kind === "async") {
    return {
      animated: kind === "async",
      style: {
        strokeDasharray: "6 4",
        stroke: kind === "async" ? "#fbbf24" : "#a78bfa",
      },
    };
  }
  if (kind === "data") {
    return { style: { stroke: "#34d399" } };
  }
  return { style: { stroke: "#38bdf8" } };
}

function CanvasInner({
  seed,
  edgeKind,
  tool,
  frozen,
  onGraphChange,
}: {
  seed: DesignGraph;
  edgeKind: EdgeKind;
  tool: CanvasTool;
  frozen: boolean;
  onGraphChange: (graph: DesignGraph) => void;
}) {
  const boot = fromDesignGraph(seed);
  const [nodes, setNodes, onNodesChange] = useNodesState(boot.nodes as Node[]);
  const [edges, setEdges, onEdgesChange] = useEdgesState(boot.edges as Edge[]);
  const { screenToFlowPosition, fitView, deleteElements, getNodes, getEdges } =
    useReactFlow();
  const skipNotify = useRef(true);

  useEffect(() => {
    if (skipNotify.current) {
      skipNotify.current = false;
      // still notify once so parent syncs
    }
    onGraphChange(toDesignGraph(nodes as never, edges as never));
  }, [nodes, edges, onGraphChange]);

  const onConnect = useCallback(
    (connection: Connection) => {
      if (frozen) return;
      const id = `e-${connection.source}-${connection.target}-${Date.now()}`;
      setEdges((eds) =>
        addEdge(
          {
            ...connection,
            id,
            data: { kind: edgeKind },
            ...edgeStyle(edgeKind),
          },
          eds
        )
      );
    },
    [edgeKind, frozen, setEdges]
  );

  const onDragOver = useCallback((e: DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  }, []);

  const onDrop = useCallback(
    (e: DragEvent) => {
      e.preventDefault();
      if (frozen) return;
      const componentId = e.dataTransfer.getData("application/reactflow");
      if (!componentId || !getComponent(componentId)) return;
      const position = screenToFlowPosition({ x: e.clientX, y: e.clientY });
      const id = `${componentId}-${Date.now()}`;
      const node: ArchitectureNodeType = {
        id,
        type: "architecture",
        position,
        data: { componentId },
      };
      setNodes((nds) => [...nds, node]);
    },
    [frozen, screenToFlowPosition, setNodes]
  );

  const onNodeClick = useCallback(
    (_: React.MouseEvent, node: Node) => {
      if (frozen || tool !== "delete") return;
      deleteElements({ nodes: [{ id: node.id }] });
    },
    [deleteElements, frozen, tool]
  );

  const onEdgeClick = useCallback(
    (_: React.MouseEvent, edge: Edge) => {
      if (frozen || tool !== "delete") return;
      deleteElements({ edges: [{ id: edge.id }] });
    },
    [deleteElements, frozen, tool]
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (frozen) return;
      if (e.key !== "Delete" && e.key !== "Backspace") return;
      const t = e.target as HTMLElement | null;
      if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable)) {
        return;
      }
      const selectedNodes = getNodes().filter((n) => n.selected);
      const selectedEdges = getEdges().filter((ed) => ed.selected);
      if (selectedNodes.length || selectedEdges.length) {
        e.preventDefault();
        deleteElements({ nodes: selectedNodes, edges: selectedEdges });
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [deleteElements, frozen, getEdges, getNodes]);

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={frozen ? undefined : onNodesChange}
      onEdgesChange={frozen ? undefined : onEdgesChange}
      onConnect={onConnect}
      onDrop={onDrop}
      onDragOver={onDragOver}
      onNodeClick={onNodeClick}
      onEdgeClick={onEdgeClick}
      nodeTypes={nodeTypes}
      fitView
      nodesDraggable={!frozen && tool !== "delete"}
      nodesConnectable={!frozen}
      elementsSelectable={!frozen}
      connectionMode={ConnectionMode.Loose}
      onInit={() => fitView({ padding: 0.2 })}
      proOptions={{ hideAttribution: true }}
      className="bg-[radial-gradient(ellipse_at_top,_var(--card-muted)_0%,_var(--background)_55%)]"
    >
      <Background gap={18} size={1} />
      <Controls showInteractive={!frozen} />
      <MiniMap
        pannable
        zoomable
        className="!bg-card !border-border"
        maskColor="rgb(0 0 0 / 0.15)"
      />
    </ReactFlow>
  );
}

export default function DesignCanvas({
  canvasKey,
  seed,
  graphNodeCount,
  edgeKind,
  tool,
  frozen,
  onGraphChange,
  onClear,
  onToolChange,
  onEdgeKindChange,
}: {
  canvasKey: number;
  seed: DesignGraph;
  graphNodeCount: number;
  edgeKind: EdgeKind;
  tool: CanvasTool;
  frozen: boolean;
  onGraphChange: (graph: DesignGraph) => void;
  onClear: () => void;
  onToolChange: (tool: CanvasTool) => void;
  onEdgeKindChange: (kind: EdgeKind) => void;
}) {
  const tools: { id: CanvasTool; label: string }[] = [
    { id: "select", label: "Select" },
    { id: "connect", label: "Connect" },
    { id: "delete", label: "Delete" },
  ];
  const kinds: EdgeKind[] = ["request", "async", "data", "observe"];

  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col">
      <div className="flex flex-wrap items-center gap-2 border-b border-border bg-card px-3 py-2">
        <p className="mr-2 text-xs font-bold uppercase tracking-widest text-muted">
          Build the architecture
        </p>
        <div className="flex gap-1">
          {tools.map((t) => (
            <button
              key={t.id}
              type="button"
              disabled={frozen}
              onClick={() => onToolChange(t.id)}
              className={`rounded-lg px-2.5 py-1 text-xs font-semibold ${
                tool === t.id
                  ? "bg-cyan-600 text-white"
                  : "border border-border hover:bg-hover"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
        <div className="mx-1 h-4 w-px bg-border" />
        <label className="flex items-center gap-1.5 text-xs text-muted">
          Edge
          <select
            value={edgeKind}
            disabled={frozen}
            onChange={(e) => onEdgeKindChange(e.target.value as EdgeKind)}
            className="rounded-md border border-border bg-background px-1.5 py-1 text-xs text-foreground"
          >
            {kinds.map((k) => (
              <option key={k} value={k}>
                {k}
              </option>
            ))}
          </select>
        </label>
        <button
          type="button"
          disabled={frozen}
          onClick={onClear}
          className="rounded-lg border border-border px-2.5 py-1 text-xs font-semibold hover:bg-hover disabled:opacity-50"
        >
          Clear
        </button>
      </div>
      <div className="relative min-h-0 flex-1">
        {graphNodeCount === 0 && (
          <div className="pointer-events-none absolute inset-0 z-10 grid place-items-center">
            <p className="rounded-xl border border-dashed border-border bg-card/80 px-4 py-3 text-sm text-muted backdrop-blur">
              Drag components here, then connect them
            </p>
          </div>
        )}
        <ReactFlowProvider>
          <CanvasInner
            key={canvasKey}
            seed={seed}
            edgeKind={edgeKind}
            tool={tool}
            frozen={frozen}
            onGraphChange={onGraphChange}
          />
        </ReactFlowProvider>
      </div>
    </div>
  );
}
