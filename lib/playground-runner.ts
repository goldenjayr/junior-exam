import { transform } from "sucrase";
import type { PlaygroundLanguage, PlaygroundResult } from "./playground.ts";

/**
 * Sync JS scratch run. Self-contained on purpose: sandboxed path ships this
 * whole function into a Web Worker via toString().
 */
export function runJavaScriptScratch(code: string): PlaygroundResult {
  const logs: string[] = [];
  const fmtArg = (a: unknown): string => {
    if (typeof a === "string") return a;
    if (a === undefined) return "undefined";
    try {
      return JSON.stringify(a) ?? String(a);
    } catch {
      return String(a);
    }
  };
  const capture =
    (level: string) =>
    (...args: unknown[]) =>
      logs.push(
        (level === "log" ? "" : `[${level}] `) + args.map(fmtArg).join(" ")
      );
  const sandboxConsole = {
    log: capture("log"),
    error: capture("error"),
    warn: capture("warn"),
    info: capture("info"),
    debug: capture("debug"),
  };
  const start = performance.now();
  try {
    new Function("console", `"use strict";\n${code}`)(sandboxConsole);
    return {
      status: "ok",
      logs,
      durationMs: performance.now() - start,
    };
  } catch (error) {
    return {
      status: "error",
      logs,
      error: error instanceof Error ? error.message : String(error),
      durationMs: performance.now() - start,
    };
  }
}

function transpileTypeScript(
  code: string
): { ok: true; js: string } | { ok: false; error: string } {
  try {
    return {
      ok: true,
      js: transform(code, { transforms: ["typescript"] }).code,
    };
  } catch (error) {
    const err = error as Error & {
      loc?: { line: number; column: number };
    };
    const loc =
      err.loc != null
        ? ` (line ${err.loc.line}, col ${err.loc.column})`
        : "";
    return {
      ok: false,
      error: `${err.message || String(error)}${loc}`,
    };
  }
}

export function runTypeScriptScratch(code: string): PlaygroundResult {
  const t = transpileTypeScript(code);
  if (!t.ok) return { status: "error", logs: [], error: t.error };
  return runJavaScriptScratch(t.js);
}

const DEFAULT_TIMEOUT_MS = 5000;

export function runJavaScriptScratchSandboxed(
  code: string,
  timeoutMs = DEFAULT_TIMEOUT_MS
): Promise<PlaygroundResult> {
  if (typeof Worker === "undefined") {
    return Promise.resolve(runJavaScriptScratch(code));
  }

  const src = `const run = ${runJavaScriptScratch.toString()};
onmessage = (e) => postMessage(run(e.data.code));`;
  const url = URL.createObjectURL(
    new Blob([src], { type: "application/javascript" })
  );
  const worker = new Worker(url);

  return new Promise<PlaygroundResult>((resolve) => {
    worker.postMessage({ code });
    const timer = setTimeout(() => {
      worker.terminate();
      resolve({
        status: "error",
        logs: [],
        error: `Code took longer than ${timeoutMs / 1000}s — check for infinite loops.`,
      });
    }, timeoutMs);
    worker.onmessage = (e) => {
      clearTimeout(timer);
      worker.terminate();
      resolve(e.data as PlaygroundResult);
    };
    worker.onerror = (e) => {
      clearTimeout(timer);
      worker.terminate();
      resolve({
        status: "error",
        logs: [],
        error: e.message || "Code could not be executed.",
      });
    };
  }).finally(() => URL.revokeObjectURL(url));
}

export function runTypeScriptScratchSandboxed(
  code: string,
  timeoutMs = DEFAULT_TIMEOUT_MS
): Promise<PlaygroundResult> {
  const t = transpileTypeScript(code);
  if (!t.ok) {
    return Promise.resolve({ status: "error", logs: [], error: t.error });
  }
  return runJavaScriptScratchSandboxed(t.js, timeoutMs);
}

let playgroundWorker: Worker | null = null;
let playgroundQueue: Promise<void> = Promise.resolve();

function getPlaygroundPythonWorker(): Worker {
  if (playgroundWorker) return playgroundWorker;
  playgroundWorker = new Worker("/python-worker.js", { type: "module" });
  return playgroundWorker;
}

export function runPythonScratch(
  code: string,
  timeoutMs = 8000
): Promise<PlaygroundResult> {
  if (typeof Worker === "undefined") {
    return Promise.resolve({
      status: "error",
      logs: [],
      error: "Python playground requires a browser Worker.",
    });
  }

  const run = playgroundQueue.then(
    () =>
      new Promise<PlaygroundResult>((resolve) => {
        const worker = getPlaygroundPythonWorker();
        const timer = setTimeout(() => {
          worker.terminate();
          playgroundWorker = null;
          resolve({
            status: "error",
            logs: [],
            error: `Code took longer than ${timeoutMs / 1000}s — check for infinite loops.`,
          });
        }, timeoutMs);

        const onMessage = (e: MessageEvent) => {
          clearTimeout(timer);
          worker.removeEventListener("message", onMessage);
          worker.removeEventListener("error", onError);
          const data = e.data as {
            status?: string;
            logs?: string[];
            error?: string;
            durationMs?: number;
          };
          resolve({
            status: data.status === "ok" ? "ok" : "error",
            logs: data.logs ?? [],
            error: data.error,
            durationMs: data.durationMs,
          });
        };
        const onError = (e: ErrorEvent) => {
          clearTimeout(timer);
          worker.removeEventListener("message", onMessage);
          worker.removeEventListener("error", onError);
          resolve({
            status: "error",
            logs: [],
            error: e.message || "Python could not be executed.",
          });
        };

        worker.addEventListener("message", onMessage);
        worker.addEventListener("error", onError);
        worker.postMessage({ mode: "playground", code });
      })
  );

  playgroundQueue = run.then(
    () => undefined,
    () => undefined
  );
  return run;
}

export function runPlayground(
  lang: PlaygroundLanguage,
  code: string
): Promise<PlaygroundResult> {
  switch (lang) {
    case "typescript":
      return runTypeScriptScratchSandboxed(code);
    case "python":
      return runPythonScratch(code);
    default:
      return runJavaScriptScratchSandboxed(code);
  }
}
