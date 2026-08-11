"use client";

import { useMemo, useState } from "react";
import {
  componentCatalog,
} from "@/lib/system-design/components";
import type { ComponentCategory } from "@/lib/system-design/types";
import { ComponentIcon, categoryAccent } from "./icons";

const categoryOrder: ComponentCategory[] = [
  "client",
  "edge",
  "compute",
  "messaging",
  "data",
  "storage",
  "observability",
  "other",
];

export default function ComponentPalette({
  allowedIds,
  suggestedIds,
  disabled,
}: {
  allowedIds?: string[];
  suggestedIds?: string[];
  disabled?: boolean;
}) {
  const [query, setQuery] = useState("");
  const suggested = useMemo(
    () => new Set(suggestedIds ?? []),
    [suggestedIds]
  );

  const items = useMemo(() => {
    const allow = allowedIds ? new Set(allowedIds) : null;
    return componentCatalog.filter((c) => {
      if (allow && !allow.has(c.id)) return false;
      const q = query.trim().toLowerCase();
      if (!q) return true;
      return (
        c.label.toLowerCase().includes(q) ||
        c.tags.some((t) => t.includes(q)) ||
        c.category.includes(q)
      );
    });
  }, [allowedIds, query]);

  const grouped = useMemo(() => {
    const map = new Map<ComponentCategory, typeof items>();
    for (const cat of categoryOrder) map.set(cat, []);
    for (const item of items) {
      map.get(item.category)?.push(item);
    }
    // Suggested first within each group
    for (const [, list] of map) {
      list.sort((a, b) => {
        const as = suggested.has(a.id) ? 0 : 1;
        const bs = suggested.has(b.id) ? 0 : 1;
        return as - bs;
      });
    }
    return categoryOrder
      .map((cat) => ({ cat, items: map.get(cat) ?? [] }))
      .filter((g) => g.items.length > 0);
  }, [items, suggested]);

  function onDragStart(e: React.DragEvent, componentId: string) {
    if (disabled) {
      e.preventDefault();
      return;
    }
    e.dataTransfer.setData("application/reactflow", componentId);
    e.dataTransfer.effectAllowed = "move";
  }

  return (
    <aside className="flex h-full min-h-0 w-64 shrink-0 flex-col border-r border-border bg-card">
      <div className="border-b border-border p-3">
        <p className="text-[10px] font-bold uppercase tracking-widest text-muted">
          Component bank
        </p>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search components…"
          className="mt-2 w-full rounded-lg border border-border bg-background px-2.5 py-1.5 text-sm outline-none focus:border-cyan-500"
        />
        {suggested.size > 0 && (
          <p className="mt-1.5 text-[10px] text-cyan-700 dark:text-cyan-400">
            Highlighted items are suggested for this challenge
          </p>
        )}
      </div>
      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-3">
        {grouped.map(({ cat, items: group }) => (
          <div key={cat}>
            <p className="mb-1.5 text-[10px] font-bold uppercase tracking-wider text-muted">
              {cat}
            </p>
            <ul className="space-y-1.5">
              {group.map((c) => {
                const accent = categoryAccent(c.category);
                const isSuggested = suggested.has(c.id);
                return (
                  <li
                    key={c.id}
                    draggable={!disabled}
                    onDragStart={(e) => onDragStart(e, c.id)}
                    title={c.description}
                    className={`flex cursor-grab items-center gap-2 rounded-lg border bg-background px-2 py-1.5 active:cursor-grabbing ${
                      isSuggested
                        ? "border-cyan-500/70 ring-1 ring-cyan-500/20"
                        : "border-border"
                    } ${
                      disabled ? "opacity-50" : "hover:border-cyan-500/60"
                    }`}
                  >
                    <span className="text-muted-fg" aria-hidden>
                      ⠿
                    </span>
                    <span
                      className="grid h-7 w-7 place-items-center rounded-md"
                      style={{ background: `${accent}22` }}
                    >
                      <ComponentIcon
                        icon={c.icon}
                        category={c.category}
                        className="h-3.5 w-3.5"
                      />
                    </span>
                    <span className="min-w-0 flex-1 truncate text-xs font-medium">
                      {c.label}
                    </span>
                    {isSuggested && (
                      <span className="shrink-0 text-[9px] font-bold uppercase tracking-wide text-cyan-600 dark:text-cyan-400">
                        tip
                      </span>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
        {items.length === 0 && (
          <p className="text-xs text-muted">No components match.</p>
        )}
      </div>
      <div className="border-t border-border p-3">
        <button
          type="button"
          disabled
          className="w-full rounded-lg border border-dashed border-border px-2 py-2 text-xs text-muted"
          title="Coming later"
        >
          Request a component
        </button>
      </div>
    </aside>
  );
}
