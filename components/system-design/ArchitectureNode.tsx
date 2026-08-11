"use client";

import { Handle, Position, type Node, type NodeProps } from "@xyflow/react";
import { getComponent } from "@/lib/system-design/components";
import { ComponentIcon, categoryAccent } from "./icons";
import { useAnswerExplain } from "./AnswerExplainDialog";

export type ArchitectureNodeData = {
  componentId: string;
  label?: string;
  /** Cheat-mode rationale shown via the node info button. */
  why?: string;
  levelLabel?: string;
};

export type ArchitectureNodeType = Node<ArchitectureNodeData, "architecture">;

export default function ArchitectureNode({
  data,
  selected,
}: NodeProps<ArchitectureNodeType>) {
  const explain = useAnswerExplain();
  const def = getComponent(data.componentId);
  const label = data.label ?? def?.label ?? data.componentId;
  const category = def?.category ?? "other";
  const accent = categoryAccent(category);
  const hasWhy = Boolean(data.why);

  return (
    <div
      className={`relative min-w-[156px] rounded-xl border bg-card px-3 py-2 shadow-sm transition ${
        selected
          ? "border-cyan-500 ring-2 ring-cyan-500/30"
          : hasWhy
            ? "border-amber-500/40"
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
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs font-semibold text-foreground">
            {label}
          </p>
          <p className="truncate text-[10px] uppercase tracking-wide text-muted">
            {category}
          </p>
        </div>
        {hasWhy && (
          <button
            type="button"
            title="Why is this here?"
            aria-label={`Why is ${label} in this design?`}
            className="nodrag nopan grid h-7 w-7 shrink-0 place-items-center rounded-full border border-amber-400/70 bg-amber-500/20 text-xs font-bold text-amber-900 transition hover:scale-110 hover:bg-amber-500/35 hover:ring-4 hover:ring-amber-400/25 dark:text-amber-100"
            onClick={(e) => {
              e.stopPropagation();
              explain?.openExplain({
                componentId: data.componentId,
                label,
                why: data.why!,
                levelLabel: data.levelLabel,
              });
            }}
          >
            ?
          </button>
        )}
      </div>
      <Handle
        type="source"
        position={Position.Right}
        className="!h-2.5 !w-2.5 !border-border !bg-cyan-500"
      />
    </div>
  );
}
