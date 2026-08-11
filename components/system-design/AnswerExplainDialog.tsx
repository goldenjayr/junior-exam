"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useState,
} from "react";
import { getComponent } from "@/lib/system-design/components";
import { ComponentIcon, categoryAccent } from "./icons";

export type ExplainTarget = {
  componentId: string;
  label: string;
  why: string;
  levelLabel?: string;
};

type ExplainCtx = {
  openExplain: (target: ExplainTarget) => void;
  closeExplain: () => void;
};

const AnswerExplainContext = createContext<ExplainCtx | null>(null);

export function useAnswerExplain() {
  return useContext(AnswerExplainContext);
}

function paragraphs(text: string): string[] {
  return text
    .split(/\n\s*\n/)
    .map((p) => p.replace(/\s+/g, " ").trim())
    .filter(Boolean);
}

export function AnswerExplainProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [target, setTarget] = useState<ExplainTarget | null>(null);
  const titleId = useId();

  const openExplain = useCallback((t: ExplainTarget) => setTarget(t), []);
  const closeExplain = useCallback(() => setTarget(null), []);

  useEffect(() => {
    if (!target) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeExplain();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [target, closeExplain]);

  const def = target ? getComponent(target.componentId) : null;
  const category = def?.category ?? "other";
  const accent = categoryAccent(category);
  const body = target ? paragraphs(target.why) : [];

  return (
    <AnswerExplainContext.Provider value={{ openExplain, closeExplain }}>
      {children}
      {target && (
        <div
          className="fixed inset-0 z-[80] grid place-items-center p-4"
          role="presentation"
        >
          <button
            type="button"
            className="absolute inset-0 bg-black/50 backdrop-blur-[2px]"
            aria-label="Close explanation"
            onClick={closeExplain}
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            className="relative z-10 flex max-h-[min(88vh,40rem)] w-full max-w-lg animate-pop flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-2xl shadow-black/30"
          >
            <div
              className="h-1.5 w-full shrink-0"
              style={{ background: accent }}
              aria-hidden
            />
            <div className="flex min-h-0 flex-1 flex-col p-5">
              <div className="flex shrink-0 items-start gap-3">
                <div
                  className="grid h-12 w-12 shrink-0 place-items-center rounded-xl"
                  style={{ background: `${accent}22` }}
                >
                  <ComponentIcon
                    icon={def?.icon ?? "client"}
                    category={category}
                    className="h-6 w-6"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  {target.levelLabel && (
                    <p className="text-[10px] font-bold uppercase tracking-widest text-amber-700 dark:text-amber-300">
                      {target.levelLabel} answer
                    </p>
                  )}
                  <h2
                    id={titleId}
                    className="mt-0.5 text-lg font-bold text-foreground"
                  >
                    {target.label}
                  </h2>
                  <p className="mt-0.5 text-[11px] font-semibold uppercase tracking-wide text-muted">
                    {category}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={closeExplain}
                  className="rounded-lg border border-border px-2 py-1 text-xs font-semibold text-muted hover:bg-hover hover:text-foreground"
                >
                  Esc
                </button>
              </div>

              <div className="mt-4 min-h-0 flex-1 overflow-y-auto rounded-xl border border-border bg-background px-4 py-3">
                <p className="text-[10px] font-bold uppercase tracking-widest text-cyan-600 dark:text-cyan-400">
                  Learn this piece
                </p>
                <div className="mt-2 space-y-3">
                  {body.map((p, i) => (
                    <p
                      key={i}
                      className="text-sm leading-relaxed text-foreground"
                    >
                      {p}
                    </p>
                  ))}
                </div>
              </div>

              <button
                type="button"
                onClick={closeExplain}
                className="mt-4 w-full shrink-0 rounded-xl bg-foreground px-3 py-2.5 text-sm font-semibold text-background hover:opacity-90"
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}
    </AnswerExplainContext.Provider>
  );
}
