/* public/python-worker.js — loaded as module worker */
import { loadPyodide } from "https://cdn.jsdelivr.net/pyodide/v0.27.7/full/pyodide.mjs";

let pyodideReady = loadPyodide({
  indexURL: "https://cdn.jsdelivr.net/pyodide/v0.27.7/full/",
});

const JSON_RETURN_ERROR =
  "Return value must be JSON-friendly (list, dict, str, int, float, bool, or None).";

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

function destroyProxy(value) {
  if (
    (typeof value === "object" || typeof value === "function") &&
    value !== null &&
    typeof value.destroy === "function"
  ) {
    value.destroy();
  }
}

function isJsonFriendly(value, seen = new Set()) {
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

function normalizeReturnValue(result) {
  const converted =
    result !== null &&
    (typeof result === "object" || typeof result === "function") &&
    typeof result.toJs === "function"
      ? result.toJs({
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

self.onmessage = async (event) => {
  const { problem, code } = event.data;
  const logs = [];
  try {
    const pyodide = await pyodideReady;
    pyodide.setStdout?.({ batched: (s) => logs.push(s) });
    if (pyodide.globals.has(problem.fnName))
      pyodide.globals.delete(problem.fnName);
    let definitionResult;
    try {
      definitionResult = await pyodide.runPythonAsync(code);
    } finally {
      destroyProxy(definitionResult);
    }
    if (!pyodide.globals.has(problem.fnName)) {
      self.postMessage({
        status: "error",
        tests: [],
        error: `Function ${problem.fnName} was not defined.`,
      });
      return;
    }
    const fn = pyodide.globals.get(problem.fnName);
    if (typeof fn !== "function") {
      destroyProxy(fn);
      self.postMessage({
        status: "error",
        tests: [],
        error: `${problem.fnName} is not callable.`,
      });
      return;
    }
    const tests = [];
    try {
      for (const test of problem.tests) {
        logs.length = 0;
        let pyArgs = [];
        let raw;
        try {
          pyArgs = test.args.map((a) =>
            pyodide.toPy(JSON.parse(JSON.stringify(a)))
          );
          raw = fn(...pyArgs);
          const actual = normalizeReturnValue(raw);
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
        } finally {
          destroyProxy(raw);
          pyArgs.forEach(destroyProxy);
        }
      }
    } finally {
      destroyProxy(fn);
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
