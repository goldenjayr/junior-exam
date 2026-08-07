"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import CodeEditor from "@/components/CodeEditor";
import { ThemeSwitcher } from "@/components/theme/theme-switcher";
import {
  CODE_THEMES,
  DEFAULT_CODE_THEME,
  getCodeTheme,
  loadCodeThemeId,
  saveCodeThemeId,
  type CodeThemeId,
} from "@/lib/code-themes";
import {
  PLAYGROUND_LANGUAGES,
  STARTERS,
  type PlaygroundLanguage,
  type PlaygroundResult,
  codeFor,
  decodeShare,
  encodeShare,
  loadDrafts,
  saveDraft,
} from "@/lib/playground";
import { runPlayground } from "@/lib/playground-runner";

export default function PlaygroundPage() {
  const [lang, setLang] = useState<PlaygroundLanguage>("typescript");
  const [code, setCode] = useState(STARTERS.typescript);
  const [result, setResult] = useState<PlaygroundResult | null>(null);
  const [running, setRunning] = useState(false);
  const [shareNote, setShareNote] = useState<string | null>(null);
  const [bootingPython, setBootingPython] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [codeThemeId, setCodeThemeId] =
    useState<CodeThemeId>(DEFAULT_CODE_THEME);
  const hydrated = useRef(false);
  const draftsRef = useRef(loadDrafts());
  const skipHashWrite = useRef(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const codeTheme = getCodeTheme(codeThemeId);

  useEffect(() => {
    setCodeThemeId(loadCodeThemeId());
    const share = decodeShare(window.location.hash);
    const drafts = loadDrafts();
    draftsRef.current = drafts;
    if (share) {
      skipHashWrite.current = true;
      setLang(share.lang);
      setCode(share.code);
      draftsRef.current = { ...drafts, [share.lang]: share.code };
      saveDraft(share.lang, share.code);
    } else {
      const initial: PlaygroundLanguage = "typescript";
      setLang(initial);
      setCode(codeFor(initial, drafts));
    }
    hydrated.current = true;
  }, []);

  useEffect(() => {
    if (!hydrated.current) return;
    saveDraft(lang, code);
    draftsRef.current = { ...draftsRef.current, [lang]: code };
  }, [lang, code]);

  useEffect(() => {
    if (!hydrated.current) return;
    saveCodeThemeId(codeThemeId);
  }, [codeThemeId]);

  useEffect(() => {
    if (!hydrated.current) return;
    if (skipHashWrite.current) {
      skipHashWrite.current = false;
      return;
    }
    const t = window.setTimeout(() => {
      const hash = encodeShare({ lang, code });
      if (window.location.hash.replace(/^#/, "") !== hash) {
        window.history.replaceState(null, "", `#${hash}`);
      }
    }, 250);
    return () => window.clearTimeout(t);
  }, [lang, code]);

  useEffect(() => {
    function onHash() {
      const share = decodeShare(window.location.hash);
      if (!share) return;
      skipHashWrite.current = true;
      setLang(share.lang);
      setCode(share.code);
    }
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  const switchLang = useCallback((next: PlaygroundLanguage) => {
    setShareNote(null);
    setLang(next);
    setCode(codeFor(next, draftsRef.current));
  }, []);

  const onRun = useCallback(async () => {
    setRunning(true);
    setShareNote(null);
    if (lang === "python") setBootingPython(true);
    try {
      const next = await runPlayground(lang, code);
      setResult(next);
    } finally {
      setRunning(false);
      setBootingPython(false);
    }
  }, [lang, code]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
        e.preventDefault();
        void onRun();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onRun]);

  const onShare = useCallback(async () => {
    const hash = encodeShare({ lang, code });
    const url = `${window.location.origin}${window.location.pathname}#${hash}`;
    window.history.replaceState(null, "", `#${hash}`);
    try {
      await navigator.clipboard.writeText(url);
      setShareNote("Link copied");
    } catch {
      setShareNote("URL updated — copy from the address bar");
    }
  }, [lang, code]);

  useEffect(() => {
    if (!shareNote) return;
    const t = window.setTimeout(() => setShareNote(null), 2200);
    return () => window.clearTimeout(t);
  }, [shareNote]);

  const onReset = useCallback(() => {
    setCode(STARTERS[lang]);
    setResult(null);
    setShareNote(null);
  }, [lang]);

  useEffect(() => {
    if (!menuOpen) return;
    function onDoc(e: MouseEvent) {
      if (!menuRef.current?.contains(e.target as Node)) setMenuOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [menuOpen]);

  return (
    <main
      className="flex h-[100dvh] flex-col overflow-hidden"
      style={{ backgroundColor: codeTheme.bg, color: codeTheme.text }}
    >
      <header
        className="relative flex h-12 shrink-0 items-center gap-2 border-b px-2 sm:gap-3 sm:px-3"
        style={{
          backgroundColor: codeTheme.panelBg,
          borderColor: codeTheme.border,
        }}
      >
        <Link
          href="/"
          className="grid h-11 shrink-0 place-items-center px-2 text-[11px] font-bold uppercase tracking-widest text-[#61afef] hover:underline"
        >
          Home
        </Link>

        <div
          role="tablist"
          aria-label="Language"
          className="inline-flex h-11 shrink-0 items-center rounded-full p-0.5 ring-1"
          style={{
            backgroundColor: "color-mix(in srgb, black 25%, transparent)",
            boxShadow: `inset 0 0 0 1px ${codeTheme.border}`,
          }}
        >
          {PLAYGROUND_LANGUAGES.map((item) => {
            const selected = lang === item.id;
            return (
              <button
                key={item.id}
                type="button"
                role="tab"
                aria-selected={selected}
                onClick={() => switchLang(item.id)}
                className="grid h-11 min-w-11 place-items-center rounded-full px-2.5 text-[12px] font-bold transition-colors"
                style={{
                  backgroundColor: selected ? codeTheme.bg : "transparent",
                  color: selected ? codeTheme.text : codeTheme.muted,
                }}
              >
                {item.short}
              </button>
            );
          })}
        </div>

        <label className="ml-1 hidden min-w-0 items-center gap-1.5 sm:flex">
          <span
            className="shrink-0 text-[10px] font-bold uppercase tracking-wider"
            style={{ color: codeTheme.muted }}
          >
            Code
          </span>
          <select
            aria-label="Code theme"
            value={codeThemeId}
            onChange={(e) => setCodeThemeId(e.target.value as CodeThemeId)}
            className="h-9 max-w-[9.5rem] truncate rounded-md border bg-transparent px-2 text-[12px] font-semibold outline-none focus-visible:ring-2 focus-visible:ring-[#61afef]/50"
            style={{
              color: codeTheme.text,
              borderColor: codeTheme.border,
              backgroundColor: codeTheme.bg,
            }}
          >
            {CODE_THEMES.map((t) => (
              <option key={t.id} value={t.id}>
                {t.label}
              </option>
            ))}
          </select>
        </label>

        <div className="relative ml-auto flex shrink-0 items-center gap-1.5">
          {shareNote && (
            <span
              className="animate-pop absolute top-full right-2 z-30 mt-1 rounded-md border px-2.5 py-1.5 text-[11px] font-semibold text-[#61afef] shadow-lg sm:static sm:top-auto sm:right-auto sm:mt-0 sm:mr-1 sm:border-0 sm:bg-transparent sm:p-0 sm:shadow-none"
              style={{
                backgroundColor: codeTheme.panelBg,
                borderColor: codeTheme.border,
              }}
            >
              {shareNote}
            </span>
          )}
          <button
            type="button"
            onClick={() => void onRun()}
            disabled={running}
            className="min-h-11 min-w-[3.25rem] rounded-md bg-[#61afef] px-3 text-[12px] font-bold text-[#1b1f23] hover:opacity-90 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {running
              ? bootingPython
                ? "Python…"
                : "Running…"
              : "Run"}
          </button>

          <div className="relative" ref={menuRef}>
            <button
              type="button"
              aria-expanded={menuOpen}
              aria-haspopup="menu"
              aria-label="More actions"
              onClick={() => setMenuOpen((o) => !o)}
              className="grid size-11 place-items-center rounded-md border hover:opacity-90"
              style={{
                color: codeTheme.muted,
                borderColor: codeTheme.border,
              }}
            >
              <svg viewBox="0 0 16 16" className="size-4" aria-hidden>
                <circle cx="3" cy="8" r="1.4" fill="currentColor" />
                <circle cx="8" cy="8" r="1.4" fill="currentColor" />
                <circle cx="13" cy="8" r="1.4" fill="currentColor" />
              </svg>
            </button>
            {menuOpen && (
              <div
                role="menu"
                className="absolute top-full right-0 z-20 mt-1 w-52 overflow-hidden rounded-lg border py-1 shadow-xl"
                style={{
                  backgroundColor: codeTheme.panelBg,
                  borderColor: codeTheme.border,
                  color: codeTheme.text,
                }}
              >
                <button
                  type="button"
                  role="menuitem"
                  className="block w-full px-3 py-2 text-left text-xs font-semibold hover:opacity-80"
                  onClick={() => {
                    void onShare();
                    setMenuOpen(false);
                  }}
                >
                  Share link
                </button>
                <button
                  type="button"
                  role="menuitem"
                  className="block w-full px-3 py-2 text-left text-xs font-semibold hover:opacity-80"
                  onClick={() => {
                    onReset();
                    setMenuOpen(false);
                  }}
                >
                  Reset to starter
                </button>

                <div
                  className="border-t px-3 py-2 sm:hidden"
                  style={{ borderColor: codeTheme.border }}
                >
                  <p
                    className="mb-1.5 text-[10px] font-bold uppercase tracking-wider"
                    style={{ color: codeTheme.muted }}
                  >
                    Code theme
                  </p>
                  <select
                    aria-label="Code theme"
                    value={codeThemeId}
                    onChange={(e) =>
                      setCodeThemeId(e.target.value as CodeThemeId)
                    }
                    className="h-9 w-full rounded-md border bg-transparent px-2 text-[12px] font-semibold"
                    style={{
                      color: codeTheme.text,
                      borderColor: codeTheme.border,
                      backgroundColor: codeTheme.bg,
                    }}
                  >
                    {CODE_THEMES.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div
                  className="border-t px-3 py-2"
                  style={{ borderColor: codeTheme.border }}
                >
                  <p
                    className="mb-1.5 text-[10px] font-bold uppercase tracking-wider"
                    style={{ color: codeTheme.muted }}
                  >
                    App theme
                  </p>
                  <ThemeSwitcher small />
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
        <section
          className="flex min-h-0 min-w-0 flex-[1.6] flex-col border-b lg:border-r lg:border-b-0"
          style={{ borderColor: codeTheme.border }}
        >
          <div className="min-h-0 flex-1">
            <CodeEditor
              value={code}
              onChange={setCode}
              language={lang}
              height="100%"
              fill
              codeTheme={codeThemeId}
            />
          </div>
        </section>

        <aside
          className="flex min-h-[30%] min-w-0 flex-1 flex-col lg:min-h-0 lg:max-w-md xl:max-w-lg"
          style={{ backgroundColor: codeTheme.bg }}
        >
          <div
            className="flex shrink-0 items-center justify-between gap-2 border-b px-3 py-2"
            style={{ borderColor: codeTheme.border }}
          >
            <h2
              className="text-[11px] font-bold uppercase tracking-widest"
              style={{ color: codeTheme.muted }}
            >
              Console
            </h2>
            <div
              className="flex items-center gap-2 text-[11px]"
              style={{ color: codeTheme.muted }}
            >
              {typeof result?.durationMs === "number" && (
                <span>
                  {result.durationMs < 1
                    ? "<1ms"
                    : `${Math.round(result.durationMs)}ms`}
                </span>
              )}
              <span className="hidden sm:inline">⌘/Ctrl+Enter</span>
            </div>
          </div>
          <div
            className="min-h-0 flex-1 overflow-auto p-3 font-mono text-[13px] leading-relaxed"
            style={{
              color:
                result?.status === "error" ? "#e06c75" : codeTheme.text,
            }}
            aria-live="polite"
          >
            {!result && (
              <p style={{ color: codeTheme.muted }}>
                Press Run. console.log / print appear here.
              </p>
            )}
            {result && result.logs.length === 0 && result.status === "ok" && (
              <p style={{ color: codeTheme.muted }}>
                Completed with no output. Log something to see it here.
              </p>
            )}
            {result?.logs.map((line, i) => (
              <div
                key={`${i}-${line.slice(0, 32)}`}
                className="whitespace-pre-wrap break-words"
              >
                {line}
              </div>
            ))}
            {result?.error && (
              <div className="mt-3 rounded-md border border-[#e06c75]/40 bg-[#3b1d20] p-3 text-[#e06c75]">
                <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-[#e06c75]/80">
                  {lang === "typescript"
                    ? "Transpile / runtime error"
                    : "Error"}
                </p>
                <pre className="whitespace-pre-wrap break-words font-mono text-[12px] text-[#f0c0c4]">
                  {result.error}
                </pre>
              </div>
            )}
          </div>
        </aside>
      </div>
    </main>
  );
}
