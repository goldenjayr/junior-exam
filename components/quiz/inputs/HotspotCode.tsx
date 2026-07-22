"use client";
import type { AnswerValue } from "@/lib/quiz/types";

type Region = {
  id: string;
  label: string;
  startLine: number;
  endLine: number;
};

export default function HotspotCode({
  code,
  regions,
  value,
  onChange,
  disabled,
}: {
  code: string;
  regions: Region[];
  value: AnswerValue | null;
  onChange: (v: AnswerValue) => void;
  disabled?: boolean;
}) {
  const lines = code.split("\n");
  const selected = value?.type === "hotspot" ? value.regionId : null;

  function regionForLine(lineNum: number): Region | undefined {
    return regions.find(
      (r) => lineNum >= r.startLine && lineNum <= r.endLine
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900">
      <p className="border-b border-slate-700 px-3 py-2 text-xs font-semibold text-slate-400">
        Click the line that contains the issue
      </p>
      <pre className="p-0 font-mono text-sm leading-6 text-slate-100">
        {lines.map((line, i) => {
          const lineNum = i + 1;
          const region = regionForLine(lineNum);
          const on = region && selected === region.id;
          return (
            <button
              key={i}
              type="button"
              disabled={disabled || !region}
              onClick={() =>
                region && onChange({ type: "hotspot", regionId: region.id })
              }
              className={`flex w-full gap-3 px-3 text-left transition-colors disabled:cursor-default ${
                on
                  ? "bg-blue-600/40"
                  : region
                    ? "hover:bg-slate-800"
                    : ""
              }`}
            >
              <span className="w-6 shrink-0 select-none text-right text-slate-500">
                {lineNum}
              </span>
              <span className="min-w-0 flex-1 whitespace-pre-wrap">{line || " "}</span>
            </button>
          );
        })}
      </pre>
    </div>
  );
}
