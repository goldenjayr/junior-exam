"use client";

import type { SoftDimension, ValidationResult } from "@/lib/system-design/types";

const labels: Record<SoftDimension, string> = {
  scalability: "Scalability",
  reliability: "Reliability",
  faultTolerance: "Fault Tolerance",
  latency: "Latency",
  costEfficiency: "Cost Efficiency",
  tradeoffs: "Trade-offs",
};

export default function ValidatorPanel({
  result,
  validating,
  onValidate,
  onSubmit,
  canSubmit,
  submitting,
  applicantName,
  onApplicantNameChange,
}: {
  result: ValidationResult | null;
  validating: boolean;
  onValidate: () => void;
  onSubmit?: () => void;
  canSubmit?: boolean;
  submitting?: boolean;
  applicantName?: string;
  onApplicantNameChange?: (name: string) => void;
}) {
  return (
    <section className="flex min-h-0 flex-1 flex-col p-4">
      <p className="text-[10px] font-bold uppercase tracking-widest text-muted">
        Validate design
      </p>
      <p className="mt-1 text-xs text-muted">
        Hard requirements must pass. Soft score reflects architecture quality.
      </p>

      <ul className="mt-3 space-y-2">
        {(
          Object.keys(labels) as SoftDimension[]
        ).map((dim) => {
          const score =
            result?.dimensions.find((d) => d.dimension === dim)?.score ?? null;
          const filled = score == null ? 0 : Math.round(score * 4);
          return (
            <li key={dim} className="flex items-center justify-between gap-2 text-xs">
              <span>{labels[dim]}</span>
              <span className="flex gap-0.5" aria-label={`${labels[dim]} ${filled}/4`}>
                {[0, 1, 2, 3].map((i) => (
                  <span
                    key={i}
                    className={`h-2.5 w-2.5 rounded-full ${
                      score == null
                        ? "border border-border"
                        : i < filled
                          ? "bg-emerald-500"
                          : "border border-border"
                    }`}
                  />
                ))}
              </span>
            </li>
          );
        })}
      </ul>

      {result && (
        <div className="mt-3 rounded-xl border border-border bg-background p-3 text-xs">
          <p>
            Hard:{" "}
            <span className="font-bold">
              {result.hardPassed}/{result.hardTotal}
            </span>
          </p>
          <p className="mt-1">
            Soft score: <span className="font-bold">{result.softScore}</span>
          </p>
        </div>
      )}

      <div className="mt-auto space-y-2 pt-4">
        {canSubmit && onApplicantNameChange && (
          <input
            value={applicantName ?? ""}
            onChange={(e) => onApplicantNameChange(e.target.value)}
            placeholder="Your name"
            className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-cyan-500"
          />
        )}
        <button
          type="button"
          onClick={onValidate}
          disabled={validating}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-card px-3 py-2.5 text-sm font-semibold hover:bg-hover disabled:opacity-60"
        >
          ▶ Run Validation
        </button>
        {canSubmit && onSubmit && (
          <button
            type="button"
            onClick={onSubmit}
            disabled={submitting}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-cyan-600 px-3 py-2.5 text-sm font-semibold text-white hover:bg-cyan-500 disabled:opacity-60"
          >
            ✈ Submit Design
          </button>
        )}
      </div>
    </section>
  );
}
