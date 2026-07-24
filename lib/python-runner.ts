import type { PyodideInterface } from "pyodide";
import type { PyProxy } from "pyodide/ffi";
import type { Problem } from "./problems.ts";
import type { RunResult, TestResult } from "./runner.ts";

const JSON_RETURN_ERROR =
  "Return value must be JSON-friendly (list, dict, str, int, float, bool, or None).";

let pyodidePromise: Promise<PyodideInterface> | undefined;
let gradeQueue: Promise<void> = Promise.resolve();
let worker: Worker | null = null;
let browserGradeQueue: Promise<void> = Promise.resolve();

function getWorker(): Worker {
  if (worker) return worker;
  worker = new Worker("/python-worker.js", { type: "module" });
  return worker;
}

function resetWorker(): void {
  worker?.terminate();
  worker = null;
}

function deepEqual(a: unknown, b: unknown): boolean {
  if (Object.is(a, b)) return true;
  if (typeof a !== "object" || typeof b !== "object" || a === null || b === null)
    return false;
  if (Array.isArray(a) !== Array.isArray(b)) return false;
  if (Array.isArray(a) && Array.isArray(b))
    return a.length === b.length && a.every((value, i) => deepEqual(value, b[i]));
  const aKeys = Object.keys(a);
  const bKeys = Object.keys(b);
  return (
    aKeys.length === bKeys.length &&
    aKeys.every(
      (key) =>
        Object.hasOwn(b, key) &&
        deepEqual(
          (a as Record<string, unknown>)[key],
          (b as Record<string, unknown>)[key]
        )
    )
  );
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

function isPyProxy(value: unknown): value is PyProxy {
  return (
    (typeof value === "object" || typeof value === "function") &&
    value !== null &&
    typeof (value as PyProxy).destroy === "function"
  );
}

function destroyProxy(value: unknown): void {
  if (isPyProxy(value)) value.destroy();
}

function isJsonFriendly(value: unknown, seen = new Set<object>()): boolean {
  if (
    value === null ||
    typeof value === "string" ||
    typeof value === "boolean"
  )
    return true;
  if (typeof value === "number") return Number.isFinite(value);
  if (typeof value !== "object") return false;
  if (seen.has(value)) return false;
  seen.add(value);
  try {
    if (Array.isArray(value))
      return value.every((item) => isJsonFriendly(item, seen));
    if (
      Object.getPrototypeOf(value) !== Object.prototype &&
      Object.getPrototypeOf(value) !== null
    )
      return false;
    return Object.values(value).every((item) => isJsonFriendly(item, seen));
  } finally {
    seen.delete(value);
  }
}

function normalizeReturnValue(result: unknown): unknown {
  const converted =
    result !== null &&
    (typeof result === "object" || typeof result === "function") &&
    typeof (result as PyProxy).toJs === "function"
      ? (result as PyProxy).toJs({
          dict_converter: Object.fromEntries,
          create_pyproxies: false,
        })
      : result;

  if (!isJsonFriendly(converted)) throw new Error(JSON_RETURN_ERROR);

  try {
    return JSON.parse(JSON.stringify(converted));
  } catch {
    throw new Error(JSON_RETURN_ERROR);
  }
}

async function getNodePyodide(): Promise<PyodideInterface> {
  pyodidePromise ??= import("pyodide").then(({ loadPyodide }) => loadPyodide());
  return pyodidePromise;
}

export async function gradeWithPyodide(
  pyodide: PyodideInterface,
  problem: Problem,
  code: string
): Promise<RunResult> {
  let currentLogs: string[] = [];
  pyodide.setStdout({ batched: (output) => currentLogs.push(output) });
  const globals = pyodide.toPy({});
  let builtins: unknown;

  try {
    builtins = pyodide.globals.get("__builtins__");
    globals.set("__builtins__", builtins);
    let definitionResult: unknown;
    try {
      definitionResult = await pyodide.runPythonAsync(code, { globals });
    } finally {
      destroyProxy(definitionResult);
    }

    if (!globals.has(problem.fnName)) {
      return {
        status: "error",
        tests: [],
        error: `Function ${problem.fnName} was not defined.`,
      };
    }

    const fn = globals.get(problem.fnName);
    if (typeof fn !== "function") {
      destroyProxy(fn);
      return {
        status: "error",
        tests: [],
        error: `${problem.fnName} is not callable.`,
      };
    }
    const tests: TestResult[] = [];

    try {
      for (const test of problem.tests) {
        currentLogs = [];
        let pythonArgs: unknown[] = [];
        let pythonResult: unknown;

        try {
          const jsonArgs = JSON.parse(JSON.stringify(test.args)) as unknown[];
          pythonArgs = jsonArgs.map((arg) => pyodide.toPy(arg));
          pythonResult = fn(...pythonArgs);
          const actual = normalizeReturnValue(pythonResult);
          tests.push({
            test,
            passed: deepEqual(actual, test.expected),
            actual,
            logs: [...currentLogs],
          });
        } catch (error) {
          tests.push({
            test,
            passed: false,
            error: errorMessage(error),
            logs: [...currentLogs],
          });
        } finally {
          destroyProxy(pythonResult);
          pythonArgs.forEach(destroyProxy);
        }
      }
    } finally {
      destroyProxy(fn);
    }

    return {
      status: tests.every((test) => test.passed) ? "passed" : "failed",
      tests,
    };
  } catch (error) {
    return { status: "error", tests: [], error: errorMessage(error) };
  } finally {
    destroyProxy(builtins);
    destroyProxy(globals);
  }
}

export async function runPythonProblem(
  problem: Problem,
  code: string,
  timeoutMs?: number
): Promise<RunResult> {
  if (typeof window !== "undefined") {
    const browserTimeoutMs = timeoutMs ?? 8000;
    const run = browserGradeQueue.then(
      () =>
        new Promise<RunResult>((resolve) => {
          const activeWorker = getWorker();
          const timeout = window.setTimeout(() => {
            resetWorker();
            resolve({
              status: "error",
              tests: [],
              error: `Your code took longer than ${
                browserTimeoutMs / 1000
              } seconds to run — check for infinite loops.`,
            });
          }, browserTimeoutMs);

          activeWorker.onmessage = (event: MessageEvent<RunResult>) => {
            window.clearTimeout(timeout);
            resolve(event.data);
          };
          activeWorker.onerror = (event: ErrorEvent) => {
            window.clearTimeout(timeout);
            resetWorker();
            resolve({
              status: "error",
              tests: [],
              error: event.message,
            });
          };
          activeWorker.postMessage({ problem, code });
        })
    );
    browserGradeQueue = run.then(
      () => undefined,
      () => undefined
    );
    return run;
  }

  const run = gradeQueue.then(async () => {
    const pyodide = await getNodePyodide();
    return gradeWithPyodide(pyodide, problem, code);
  });
  gradeQueue = run.then(
    () => undefined,
    () => undefined
  );
  return run;
}
