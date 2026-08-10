"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { Challenge, DesignGraph, EdgeKind, ValidationResult } from "@/lib/system-design/types";
import { runValidation } from "@/lib/system-design/validate";
import { clearDraft, loadDraft, saveDraft } from "@/lib/system-design/serialize";
import { useTimeAttack } from "@/lib/use-time-attack";
import { parseTimeLimit } from "@/lib/time-attack";
import TimeAttackBar from "@/components/TimeAttackBar";
import FreezeOverlay from "@/components/FreezeOverlay";
import ComponentPalette from "./ComponentPalette";
import DesignCanvas, { type CanvasTool } from "./DesignCanvas";
import ChallengeBrief from "./ChallengeBrief";
import ValidatorPanel from "./ValidatorPanel";
import FeedbackStrip from "./FeedbackStrip";
import BuilderHeader from "./BuilderHeader";

const emptyGraph = (): DesignGraph => ({ nodes: [], edges: [] });

export default function BuilderShell({
  challenge,
  mode,
  examiner,
  timeLimitParam,
}: {
  challenge: Challenge;
  mode: "practice" | "challenge";
  examiner: string;
  timeLimitParam: string | null;
}) {
  const limitSeconds =
    mode === "challenge" ? parseTimeLimit(timeLimitParam) : null;
  const sessionId = `sd:${challenge.id}:${mode}:${timeLimitParam ?? "off"}`;
  const { remaining, frozen, elapsed } = useTimeAttack(limitSeconds, sessionId);

  const [seed, setSeed] = useState<DesignGraph>(() => emptyGraph());
  const [graph, setGraph] = useState<DesignGraph>(() => emptyGraph());
  const [canvasKey, setCanvasKey] = useState(0);
  const [tool, setTool] = useState<CanvasTool>("select");
  const [edgeKind, setEdgeKind] = useState<EdgeKind>("request");
  const [result, setResult] = useState<ValidationResult | null>(null);
  const [hintsLeft, setHintsLeft] = useState(3);
  const [revealedHints, setRevealedHints] = useState<string[]>([]);
  const [showConstraints, setShowConstraints] = useState(false);
  const [name, setName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitMsg, setSubmitMsg] = useState<string | null>(null);
  const [savedFlash, setSavedFlash] = useState(false);

  useEffect(() => {
    const draft = loadDraft(challenge.id);
    const g = draft ?? emptyGraph();
    setSeed(g);
    setGraph(g);
    setCanvasKey((k) => k + 1);
    setResult(null);
  }, [challenge.id]);

  const onGraphChange = useCallback((g: DesignGraph) => {
    setGraph(g);
  }, []);

  // Autosave drafts (debounced lightly via effect)
  useEffect(() => {
    const id = window.setTimeout(() => {
      saveDraft(challenge.id, graph);
    }, 400);
    return () => window.clearTimeout(id);
  }, [challenge.id, graph]);

  function handleValidate() {
    const v = runValidation(graph, challenge);
    setResult(v);
  }

  function handleClear() {
    if (!confirm("Clear the canvas? This cannot be undone.")) return;
    const g = emptyGraph();
    setSeed(g);
    setGraph(g);
    setResult(null);
    setCanvasKey((k) => k + 1);
    clearDraft(challenge.id);
  }

  function handleSave() {
    saveDraft(challenge.id, graph);
    setSavedFlash(true);
    window.setTimeout(() => setSavedFlash(false), 1500);
  }

  function revealHint() {
    if (hintsLeft <= 0) return;
    const next = challenge.hardRequirements.find(
      (r) => r.hint && !revealedHints.includes(r.id)
    );
    if (!next?.hint) {
      setHintsLeft(0);
      return;
    }
    setRevealedHints((h) => [...h, next.id]);
    setHintsLeft((n) => n - 1);
  }

  async function handleSubmit() {
    let v = result;
    if (!v) {
      v = runValidation(graph, challenge);
      setResult(v);
    }
    const applicantName = name.trim() || "Applicant";
    setSubmitting(true);
    setSubmitMsg(null);
    try {
      const res = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kind: "system-design",
          examiner,
          applicantName,
          timedOut: frozen,
          timeLimitSeconds: limitSeconds ?? undefined,
          timeUsedSeconds: elapsed ?? undefined,
          mode: mode === "practice" ? "practice" : "assessment",
          results: [
            {
              challengeId: challenge.id,
              challengeTitle: challenge.title,
              difficulty: challenge.difficulty,
              hardPassed: v.hardPassed,
              hardTotal: v.hardTotal,
              softScore: v.softScore,
              requirements: v.hard.map((h) => ({
                label: h.label,
                passed: h.passed,
              })),
              dimensions: v.dimensions.map((d) => ({
                dimension: d.dimension,
                score: d.score,
              })),
              bottlenecks: v.bottlenecks,
              componentsUsed: [
                ...new Set(graph.nodes.map((n) => n.componentId)),
              ],
              edgeCount: graph.edges.length,
            },
          ],
        }),
      });
      if (!res.ok) {
        setSubmitMsg("Submit failed — check email config or try again.");
      } else {
        setSubmitMsg("Design submitted to examiner.");
      }
    } catch {
      setSubmitMsg("Network error while submitting.");
    } finally {
      setSubmitting(false);
    }
  }

  const canSubmit = mode === "challenge";

  const constraintText = useMemo(() => {
    const s = challenge.scale;
    return `Users ${s.users} · Traffic ${s.traffic} · Writes ${s.writeHeavy} · Durability ${s.durability}`;
  }, [challenge.scale]);

  return (
    <div className="flex h-[100dvh] flex-col bg-background text-foreground">
      <BuilderHeader
        challenge={challenge}
        remaining={remaining}
        result={result}
        hintsLeft={hintsLeft}
        showConstraints={showConstraints}
        onToggleConstraints={() => setShowConstraints((v) => !v)}
        onRevealHint={revealHint}
      />

      {limitSeconds != null && remaining != null && (
        <div className="border-b border-border px-4 py-2">
          <TimeAttackBar remaining={remaining} limitSeconds={limitSeconds} />
        </div>
      )}

      {showConstraints && (
        <div className="border-b border-border bg-cyan-500/5 px-4 py-2 text-xs">
          <span className="font-bold">Constraints:</span> {constraintText}
        </div>
      )}

      {revealedHints.length > 0 && (
        <div className="border-b border-border bg-amber-500/5 px-4 py-2 text-xs">
          {revealedHints.map((id) => {
            const req = challenge.hardRequirements.find((r) => r.id === id);
            return (
              <p key={id}>
                <span className="font-bold text-amber-700 dark:text-amber-300">
                  Hint:
                </span>{" "}
                {req?.hint}
              </p>
            );
          })}
        </div>
      )}

      <div className="flex min-h-0 flex-1">
        <ComponentPalette
          allowedIds={challenge.allowedComponents}
          disabled={frozen}
        />
        <DesignCanvas
          canvasKey={canvasKey}
          seed={seed}
          graphNodeCount={graph.nodes.length}
          edgeKind={edgeKind}
          tool={tool}
          frozen={frozen}
          onGraphChange={onGraphChange}
          onClear={handleClear}
          onToolChange={setTool}
          onEdgeKindChange={setEdgeKind}
        />
        <aside className="flex w-80 shrink-0 flex-col border-l border-border bg-card">
          <ChallengeBrief challenge={challenge} hardResults={result?.hard ?? null} />
          <ValidatorPanel
            result={result}
            validating={false}
            onValidate={handleValidate}
            canSubmit={canSubmit}
            onSubmit={handleSubmit}
            submitting={submitting}
            applicantName={name}
            onApplicantNameChange={setName}
          />
        </aside>
      </div>

      <FeedbackStrip
        graph={graph}
        challenge={challenge}
        result={result}
        onReset={handleClear}
        onSave={handleSave}
      />
      {savedFlash && (
        <p className="pointer-events-none fixed bottom-20 right-6 rounded-lg bg-foreground px-3 py-1.5 text-xs font-semibold text-background">
          Design saved locally
        </p>
      )}
      {submitMsg && (
        <p className="border-t border-border bg-card px-4 py-2 text-xs text-muted">
          {submitMsg}
        </p>
      )}

      {frozen && (
        <FreezeOverlay>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm"
          />
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting}
            className="mt-3 w-full rounded-xl bg-cyan-600 px-3 py-2.5 text-sm font-semibold text-white"
          >
            Submit Design
          </button>
        </FreezeOverlay>
      )}
    </div>
  );
}
