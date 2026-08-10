"use client";

import type { Challenge, HardResult } from "@/lib/system-design/types";

const difficultyBadge: Record<Challenge["difficulty"], string> = {
  easy: "bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-300",
  medium: "bg-purple-50 text-purple-600 dark:bg-purple-950 dark:text-purple-300",
  hard: "bg-red-50 text-red-600 dark:bg-red-950 dark:text-red-300",
};

export default function ChallengeBrief({
  challenge,
  hardResults,
}: {
  challenge: Challenge;
  hardResults: HardResult[] | null;
}) {
  const byId = new Map(hardResults?.map((h) => [h.id, h]) ?? []);

  return (
    <section className="space-y-3 border-b border-border p-4">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted">
            Challenge brief
          </p>
          <h2 className="mt-1 text-base font-bold text-foreground">
            {challenge.title}
          </h2>
        </div>
        <span
          className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${difficultyBadge[challenge.difficulty]}`}
        >
          {challenge.difficulty}
        </span>
      </div>
      <p className="text-xs text-muted">{challenge.objective}</p>

      <div>
        <p className="text-[10px] font-bold uppercase tracking-wider text-muted">
          Requirements
        </p>
        <ul className="mt-1.5 space-y-1.5">
          {challenge.hardRequirements.map((req) => {
            const result = byId.get(req.id);
            const passed = result?.passed;
            return (
              <li key={req.id} className="flex gap-2 text-xs">
                <span
                  className={`mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded-full text-[10px] font-bold ${
                    passed === true
                      ? "bg-emerald-500 text-white"
                      : passed === false
                        ? "bg-red-500/20 text-red-600"
                        : "border border-border text-muted"
                  }`}
                  aria-hidden
                >
                  {passed === true ? "✓" : passed === false ? "!" : ""}
                </span>
                <span className="text-foreground">{req.label}</span>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="grid grid-cols-2 gap-2 rounded-xl border border-border bg-background p-2.5 text-[10px]">
        <div>
          <p className="text-muted">Users</p>
          <p className="font-semibold">{challenge.scale.users}</p>
        </div>
        <div>
          <p className="text-muted">Traffic</p>
          <p className="font-semibold capitalize">{challenge.scale.traffic}</p>
        </div>
        <div>
          <p className="text-muted">Write heavy</p>
          <p className="font-semibold capitalize">{challenge.scale.writeHeavy}</p>
        </div>
        <div>
          <p className="text-muted">Durability</p>
          <p className="font-semibold capitalize">{challenge.scale.durability}</p>
        </div>
      </div>
    </section>
  );
}
