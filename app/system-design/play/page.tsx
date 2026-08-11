"use client";

import { useMemo } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";
import { getChallenge } from "@/lib/system-design/challenges";
import { parseCheat } from "@/lib/cheat";
import BuilderShell from "@/components/system-design/BuilderShell";

function PlayInner() {
  const params = useSearchParams();
  const challengeId = params.get("c") ?? "";
  const modeParam = params.get("mode");
  const mode = modeParam === "challenge" ? "challenge" : "practice";
  const examiner = params.get("e") ?? "jayr";
  const t = params.get("t");
  const cheat = parseCheat(params.get("cheat"));

  const challenge = useMemo(() => getChallenge(challengeId), [challengeId]);

  if (!challenge) {
    return (
      <main className="grid min-h-screen place-items-center bg-background px-6 text-foreground">
        <div className="max-w-md text-center">
          <h1 className="text-xl font-bold">Challenge not found</h1>
          <p className="mt-2 text-sm text-muted">
            Unknown id <code className="text-foreground">{challengeId || "(empty)"}</code>.
          </p>
          <Link
            href="/system-design"
            className="mt-4 inline-block rounded-xl bg-cyan-600 px-4 py-2 text-sm font-semibold text-white"
          >
            Back to lobby
          </Link>
        </div>
      </main>
    );
  }

  return (
    <BuilderShell
      challenge={challenge}
      mode={mode}
      examiner={examiner}
      timeLimitParam={t}
      cheat={cheat}
    />
  );
}

export default function SystemDesignPlayPage() {
  return (
    <Suspense
      fallback={
        <div className="grid min-h-screen place-items-center text-muted">
          Loading builder…
        </div>
      }
    >
      <PlayInner />
    </Suspense>
  );
}
