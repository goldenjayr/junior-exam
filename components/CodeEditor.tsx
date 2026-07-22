"use client";
import { useRef } from "react";

// ponytail: textarea + line-number gutter with Tab support. Swap for
// CodeMirror if syntax highlighting is ever actually needed.
export default function CodeEditor({
  value,
  onChange,
  readOnly = false,
}: {
  value: string;
  onChange: (value: string) => void;
  readOnly?: boolean;
}) {
  const gutterRef = useRef<HTMLDivElement>(null);
  const lines = value.split("\n").length;

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (readOnly || e.key !== "Tab") return;
    e.preventDefault();
    const el = e.currentTarget;
    const { selectionStart, selectionEnd } = el;
    const next =
      value.slice(0, selectionStart) + "  " + value.slice(selectionEnd);
    onChange(next);
    requestAnimationFrame(() => {
      el.selectionStart = el.selectionEnd = selectionStart + 2;
    });
  }

  return (
    <div className="flex overflow-hidden rounded-xl border border-slate-700 bg-slate-900 font-mono text-sm leading-6">
      <div
        ref={gutterRef}
        aria-hidden
        className="select-none overflow-hidden border-r border-slate-700/60 bg-slate-900 px-3 py-4 text-right text-slate-500"
      >
        {Array.from({ length: lines }, (_, i) => (
          <div key={i}>{i + 1}</div>
        ))}
      </div>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        onScroll={(e) => {
          if (gutterRef.current)
            gutterRef.current.scrollTop = e.currentTarget.scrollTop;
        }}
        readOnly={readOnly}
        spellCheck={false}
        autoCapitalize="off"
        autoCorrect="off"
        aria-label="Code editor"
        className={`min-h-[380px] w-full resize-y bg-transparent p-4 pl-3 text-slate-100 outline-none ${
          readOnly ? "cursor-not-allowed opacity-70" : ""
        }`}
      />
    </div>
  );
}
