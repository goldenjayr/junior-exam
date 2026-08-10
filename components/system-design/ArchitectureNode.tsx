"use client";

import { Handle, Position, type Node, type NodeProps } from "@xyflow/react";
import { getComponent } from "@/lib/system-design/components";
import { ComponentIcon, categoryAccent } from "./icons";

export type ArchitectureNodeData = {
  componentId: string;
  label?: string;
};

export type ArchitectureNodeType = Node<ArchitectureNodeData, "architecture">;

export default function ArchitectureNode({
  data,
  selected,
}: NodeProps<ArchitectureNodeType>) {
  const def = getComponent(data.componentId);
  const label = data.label ?? def?.label ?? data.componentId;
  const category = def?.category ?? "other";
  const accent = categoryAccent(category);

  return (
    <div
      className={`min-w-[148px] rounded-xl border bg-card px-3 py-2 shadow-sm transition ${
        selected
          ? "border-cyan-500 ring-2 ring-cyan-500/30"
          : "border-border"
      }`}
      style={{ borderLeftWidth: 3, borderLeftColor: accent }}
    >
      <Handle
        type="target"
        position={Position.Left}
        className="!h-2.5 !w-2.5 !border-border !bg-cyan-500"
      />
      <div className="flex items-center gap-2">
        <div
          className="grid h-8 w-8 place-items-center rounded-lg"
          style={{ background: `${accent}22` }}
        >
          <ComponentIcon
            icon={def?.icon ?? "client"}
            category={category}
            className="h-4 w-4"
          />
        </div>
        <div className="min-w-0">
          <p className="truncate text-xs font-semibold text-foreground">
            {label}
          </p>
          <p className="truncate text-[10px] uppercase tracking-wide text-muted">
            {category}
          </p>
        </div>
      </div>
      <Handle
        type="source"
        position={Position.Right}
        className="!h-2.5 !w-2.5 !border-border !bg-cyan-500"
      />
    </div>
  );
}
