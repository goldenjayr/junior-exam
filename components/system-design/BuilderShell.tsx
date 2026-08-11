"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Challenge, DesignGraph, ValidationResult } from "@/lib/system-design/types";
import { runValidation } from "@/lib/system-design/validate";
import { clearDraft, loadDraft, saveDraft } from "@/lib/system-design/serialize";
import {
  getReferenceSolution,
  type SolutionLevel,
} from "@/lib/system-design/solutions";
import { useTimeAttack } from "@/lib/use-time-attack";
import { parseTimeLimit } from "@/lib/time-attack";
import TimeAttackBar from "@/components/TimeAttackBar";
import FreezeOverlay from "@/components/FreezeOverlay";
import ComponentPalette from "./ComponentPalette";
import DesignCanvas from "./DesignCanvas";
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
  cheat = false,
}: {
  challenge: Challenge;
  mode: "practice" | "challenge";
  examiner: string;
  timeLimitParam: string | null;
  cheat?: boolean;
}) {
  const limitSeconds =
    mode === "challenge" ? parseTimeLimit(timeLimitParam) : null;
  const sessionId = `sd:${challenge.id}:${mode}:${timeLimitParam ?? "off"}`;
  const { remaining, frozen, elapsed } = useTimeAttack(limitSeconds, sessionId);

  const [seed, setSeed] = useState<DesignGraph>(() => emptyGraph());
  const [graph, setGraph] = useState<DesignGraph>(() => emptyGraph());
  const [canvasKey, setCanvasKey] = useState(0);
  const [deleteMode, setDeleteMode] = useState(false);
  const [result, setResult] = useState<ValidationResult | null>(null);
  const hintBudget = useMemo(
    () =>
      Math.min(
        3,
        challenge.hardRequirements.filter((r) => Boolean(r.hint)).length
      ),
    [challenge.hardRequirements]
  );
  const [hintsLeft, setHintsLeft] = useState(hintBudget);
  const [revealedHints, setRevealedHints] = useState<string[]>([]);
  const [showConstraints, setShowConstraints] = useState(false);
  const [name, setName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitMsg, setSubmitMsg] = useState<string | null>(null);
  const [savedFlash, setSavedFlash] = useState(false);
  const skipInvalidateRef = useRef(false);

  useEffect(() => {
    const draft = loadDraft(challenge.id);
    const g = draft ?? emptyGraph();
    skipInvalidateRef.current = true;
    setSeed(g);
    setGraph(g);
    setCanvasKey((k) => k + 1);
    setResult(null);
    setRevealedHints([]);
    setHintsLeft(
      Math.min(
        3,
        challenge.hardRequirements.filter((r) => Boolean(r.hint)).length
      )
    );
  }, [challenge.id, challenge.hardRequirements]);

  const onGraphChange = useCallback((g: DesignGraph) => {
    setGraph((prev) => {
      if (skipInvalidateRef.current) {
        skipInvalidateRef.current = false;
        return g;
      }
      const prevSig = [
        ...prev.nodes.map((n) => `${n.id}:${n.componentId}`),
        ...prev.edges.map((e) => `${e.id}:${e.source}->${e.target}`),
      ].join("|");
      const nextSig = [
        ...g.nodes.map((n) => `${n.id}:${n.componentId}`),
        ...g.edges.map((e) => `${e.id}:${e.source}->${e.target}`),
      ].join("|");
      if (prevSig !== nextSig) {
        queueMicrotask(() => setResult(null));
      }
      return g;
    });
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

  function handleShowAnswer(level: SolutionLevel) {
    const solution = getReferenceSolution(challenge.id, level);
    if (!solution) return;
    if (
      graph.nodes.length > 0 &&
      !confirm(
        `Replace your canvas with the ${level} reference design?`
      )
    ) {
      return;
    }
    skipInvalidateRef.current = true;
    setSeed(solution);
    setGraph(solution);
    setCanvasKey((k) => k + 1);
    setResult(runValidation(solution, challenge));
    saveDraft(challenge.id, solution);
  }

  function handleSave() {
    saveDraft(challenge.id, graph);
    setSavedFlash(true);
    window.setTimeout(() => setSavedFlash(false), 1500);
  }

  function handleCopyReport() {
    const v = result ?? runValidation(graph, challenge);
    if (!result) setResult(v);
    const lines = [
      `# ${challenge.title}`,
      `Hard: ${v.hardPassed}/${v.hardTotal}`,
      `Soft score: ${v.softScore}`,
      "",
      "## Requirements",
      ...v.hard.map(
        (h) => `- [${h.passed ? "x" : " "}] ${h.label}${h.detail ? ` — ${h.detail}` : ""}`
      ),
      "",
      "## Dimensions",
      ...v.dimensions.map(
        (d) => `- ${d.dimension}: ${Math.round(d.score * 100)}%`
      ),
      "",
      "## Components",
      [...new Set(graph.nodes.map((n) => n.componentId))].join(", ") || "(none)",
      `Edges: ${graph.edges.length}`,
    ];
    if (v.bottlenecks.length) {
      lines.push("", "## Bottlenecks", ...v.bottlenecks.map((b) => `- ${b}`));
    }
    void navigator.clipboard.writeText(lines.join("\n"));
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
        cheat={cheat}
        onShowAnswer={handleShowAnswer}
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
          suggestedIds={challenge.suggestedComponents}
          disabled={frozen}
        />
        <DesignCanvas
          canvasKey={canvasKey}
          seed={seed}
          graphNodeCount={graph.nodes.length}
          deleteMode={deleteMode}
          frozen={frozen}
          onGraphChange={onGraphChange}
          onClear={handleClear}
          onDeleteModeChange={setDeleteMode}
        />
        <aside className="flex min-h-0 w-80 shrink-0 flex-col overflow-hidden border-l border-border bg-card">
          <div className="min-h-0 flex-1 overflow-y-auto">
            <ChallengeBrief
              challenge={challenge}
              hardResults={result?.hard ?? null}
              allHardPassed={
                !!result &&
                result.hardTotal > 0 &&
                result.hardPassed === result.hardTotal
              }
            />
          </div>
          <ValidatorPanel
            result={result}
            validating={false}
            onValidate={handleValidate}
            canSubmit={canSubmit}
            onSubmit={handleSubmit}
            submitting={submitting}
            applicantName={name}
            onApplicantNameChange={setName}
            showCopyReport={mode === "practice"}
            onCopyReport={handleCopyReport}
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
