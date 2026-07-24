/* public/python-worker.js — loaded as module worker */
import { loadPyodide } from "https://cdn.jsdelivr.net/pyodide/v0.27.7/full/pyodide.mjs";

let pyodideReady = loadPyodide({
  indexURL: "https://cdn.jsdelivr.net/pyodide/v0.27.7/full/",
});

function deepEqual(a, b) {
  if (Object.is(a, b)) return true;
  if (typeof a !== "object" || typeof b !== "object" || a === null || b === null)
    return false;
  if (Array.isArray(a) !== Array.isArray(b)) return false;
  if (Array.isArray(a) && Array.isArray(b))
    return a.length === b.length && a.every((v, i) => deepEqual(v, b[i]));
  const ka = Object.keys(a);
  const kb = Object.keys(b);
  return (
    ka.length === kb.length &&
    ka.every((k) => Object.hasOwn(b, k) && deepEqual(a[k], b[k]))
  );
}

function toJsonFriendly(value) {
  if (value === undefined || value === null) return value;
  if (typeof value?.toJs === "function") {
    value = value.toJs({ dict_converter: Object.fromEntries });
  }
  try {
    return JSON.parse(JSON.stringify(value));
  } catch {
    throw new Error(
      "Return value must be JSON-friendly (list, dict, str, int, float, bool, or None)."
    );
  }
}

self.onmessage = async (event) => {
  const { problem, code } = event.data;
  const logs = [];
  try {
    const pyodide = await pyodideReady;
    pyodide.setStdout?.({ batched: (s) => logs.push(s) });
    await pyodide.runPythonAsync(code);
    const fn = pyodide.globals.get(problem.fnName);
    if (!fn) {
      self.postMessage({
        status: "error",
        tests: [],
        error: `Function ${problem.fnName} was not defined.`,
      });
      return;
    }
    const tests = [];
    for (const test of problem.tests) {
      logs.length = 0;
      try {
        const pyArgs = test.args.map((a) =>
          pyodide.toPy(JSON.parse(JSON.stringify(a)))
        );
        const raw = fn(...pyArgs);
        const actual = toJsonFriendly(raw);
        tests.push({
          test,
          passed: deepEqual(actual, test.expected),
          actual,
          logs: [...logs],
        });
      } catch (error) {
        tests.push({
          test,
          passed: false,
          error: error instanceof Error ? error.message : String(error),
          logs: [...logs],
        });
      }
    }
    self.postMessage({
      status: tests.every((t) => t.passed) ? "passed" : "failed",
      tests,
    });
  } catch (error) {
    self.postMessage({
      status: "error",
      tests: [],
      error: error instanceof Error ? error.message : String(error),
    });
  }
};
