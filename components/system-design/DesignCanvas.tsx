"use client";

import {
  useCallback,
  useEffect,
  type DragEvent,
} from "react";
import {
  ReactFlow,
  ReactFlowProvider,
  Background,
  Controls,
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
const DEFAULT_EDGE_KIND: EdgeKind = "request";

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
  deleteMode,
  frozen,
  onGraphChange,
  onExitDeleteMode,
  nodeAnnotate,
}: {
  seed: DesignGraph;
  deleteMode: boolean;
  frozen: boolean;
  onGraphChange: (graph: DesignGraph) => void;
  onExitDeleteMode: () => void;
  nodeAnnotate?: {
    whyFor: (componentId: string) => string;
    levelLabel?: string;
  } | null;
}) {
  const boot = fromDesignGraph(seed, nodeAnnotate ?? undefined);
  const [nodes, setNodes, onNodesChange] = useNodesState(boot.nodes as Node[]);
  const [edges, setEdges, onEdgesChange] = useEdgesState(boot.edges as Edge[]);
  const { screenToFlowPosition, fitView, deleteElements, getNodes, getEdges } =
    useReactFlow();

  useEffect(() => {
    onGraphChange(toDesignGraph(nodes as never, edges as never));
  }, [nodes, edges, onGraphChange]);

  const onConnect = useCallback(
    (connection: Connection) => {
      if (frozen || deleteMode) return;
      const id = `e-${connection.source}-${connection.target}-${Date.now()}`;
      setEdges((eds) =>
        addEdge(
          {
            ...connection,
            id,
            data: { kind: DEFAULT_EDGE_KIND },
            ...edgeStyle(DEFAULT_EDGE_KIND),
          },
          eds
        )
      );
    },
    [deleteMode, frozen, setEdges]
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
      if (frozen || !deleteMode) return;
      deleteElements({ nodes: [{ id: node.id }] });
    },
    [deleteElements, deleteMode, frozen]
  );

  const onEdgeClick = useCallback(
    (_: React.MouseEvent, edge: Edge) => {
      if (frozen || !deleteMode) return;
      deleteElements({ edges: [{ id: edge.id }] });
    },
    [deleteElements, deleteMode, frozen]
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (frozen) return;
      const t = e.target as HTMLElement | null;
      if (
        t &&
        (t.tagName === "INPUT" ||
          t.tagName === "TEXTAREA" ||
          t.isContentEditable)
      ) {
        return;
      }
      if (e.key === "Escape") {
        e.preventDefault();
        setNodes((nds) => nds.map((n) => ({ ...n, selected: false })));
        setEdges((eds) => eds.map((ed) => ({ ...ed, selected: false })));
        onExitDeleteMode();
        return;
      }
      if (e.key !== "Delete" && e.key !== "Backspace") return;
      const selectedNodes = getNodes().filter((n) => n.selected);
      const selectedEdges = getEdges().filter((ed) => ed.selected);
      if (selectedNodes.length || selectedEdges.length) {
        e.preventDefault();
        deleteElements({ nodes: selectedNodes, edges: selectedEdges });
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [
    deleteElements,
    frozen,
    getEdges,
    getNodes,
    onExitDeleteMode,
    setEdges,
    setNodes,
  ]);

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
      nodesDraggable={!frozen && !deleteMode}
      nodesConnectable={!frozen && !deleteMode}
      elementsSelectable={!frozen}
      connectionMode={ConnectionMode.Loose}
      onInit={() => fitView({ padding: 0.2 })}
      proOptions={{ hideAttribution: true }}
      className="bg-[radial-gradient(ellipse_at_top,_var(--card-muted)_0%,_var(--background)_55%)]"
    >
      <Background gap={18} size={1} />
      <Controls showInteractive={!frozen} />
    </ReactFlow>
  );
}

export default function DesignCanvas({
  canvasKey,
  seed,
  graphNodeCount,
  deleteMode,
  frozen,
  onGraphChange,
  onClear,
  onDeleteModeChange,
  nodeAnnotate = null,
}: {
  canvasKey: number;
  seed: DesignGraph;
  graphNodeCount: number;
  deleteMode: boolean;
  frozen: boolean;
  onGraphChange: (graph: DesignGraph) => void;
  onClear: () => void;
  onDeleteModeChange: (on: boolean) => void;
  nodeAnnotate?: {
    whyFor: (componentId: string) => string;
    levelLabel?: string;
  } | null;
}) {
  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col">
      <div className="flex flex-wrap items-center gap-2 border-b border-border bg-card px-3 py-2">
        <p className="mr-2 text-xs font-bold uppercase tracking-widest text-muted">
          Build the architecture
        </p>
        <button
          type="button"
          disabled={frozen}
          onClick={() => onDeleteModeChange(!deleteMode)}
          className={`rounded-lg px-2.5 py-1 text-xs font-semibold ${
            deleteMode
              ? "bg-cyan-600 text-white"
              : "border border-border hover:bg-hover"
          }`}
        >
          Delete
        </button>
        <button
          type="button"
          disabled={frozen}
          onClick={onClear}
          className="rounded-lg border border-border px-2.5 py-1 text-xs font-semibold hover:bg-hover disabled:opacity-50"
        >
          Clear
        </button>
        <p className="ml-auto text-[11px] text-muted">
          {nodeAnnotate
            ? "Click ? on a node to see why it’s in this answer"
            : "Drag handles to connect · Del removes · Esc clears selection"}
        </p>
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
            deleteMode={deleteMode}
            frozen={frozen}
            onGraphChange={onGraphChange}
            onExitDeleteMode={() => onDeleteModeChange(false)}
            nodeAnnotate={nodeAnnotate}
          />
        </ReactFlowProvider>
      </div>
    </div>
  );
}
