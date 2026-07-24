const assert = require("node:assert");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const vm = require("node:vm");

function proxy(value, counters, kind) {
  return {
    toJs: () => value,
    destroy: () => {
      counters[kind] = (counters[kind] ?? 0) + 1;
    },
  };
}

async function createWorker(pyodide) {
  const source = fs
    .readFileSync(path.join(__dirname, "python-worker.js"), "utf8")
    .replace(
      /^import \{ loadPyodide \} from .*;$/m,
      "const loadPyodide = () => globalThis.__pyodide;"
    );
  const messages = [];
  const context = vm.createContext({
    __pyodide: pyodide,
    console,
    JSON,
    Object,
    Number,
    Set,
    Error,
    String,
    self: {
      postMessage: (message) => messages.push(message),
    },
  });
  vm.runInContext(source, context);
  return {
    messages,
    run: async (problem, code) => {
      await context.self.onmessage({ data: { problem, code } });
      return messages.at(-1);
    },
  };
}

function createPyodide(definitions) {
  const counters = {};
  const createGlobals = () => {
    const values = new Map();
    return {
      has: (name) => values.has(name),
      get: (name) => values.get(name),
      set: (name, value) => values.set(name, value),
      destroy: () => {
        counters.globals = (counters.globals ?? 0) + 1;
      },
    };
  };
  return {
    counters,
    globals: {
      get: () => ({}),
    },
    setStdout() {},
    runPythonAsync: async (code, { globals }) => {
      definitions(code, globals, counters);
      return proxy(undefined, counters, "definition");
    },
    toPy: (value) =>
      value && typeof value === "object" && !Array.isArray(value)
        ? createGlobals()
        : proxy(value, counters, "arg"),
  };
}

const problem = {
  fnName: "answer",
  tests: [{ args: [1], expected: 1 }],
};

test("worker isolates submissions and reports missing definitions", async () => {
  const pyodide = createPyodide((code, globals, counters) => {
    if (code === "define")
      globals.set(
        "answer",
        Object.assign(
          () => proxy(1, counters, "result"),
          { destroy: () => (counters.fn = (counters.fn ?? 0) + 1) }
        )
      );
  });
  const worker = await createWorker(pyodide);

  assert.strictEqual((await worker.run(problem, "define")).status, "passed");
  assert.deepStrictEqual(
    JSON.parse(JSON.stringify(await worker.run(problem, "omit"))),
    {
    status: "error",
    tests: [],
    error: "Function answer was not defined.",
    }
  );
});

test("worker rejects non-callables as a top-level error", async () => {
  const pyodide = createPyodide((_code, globals, counters) => {
    globals.set("answer", proxy(42, counters, "fn"));
  });
  const worker = await createWorker(pyodide);

  assert.deepStrictEqual(
    JSON.parse(JSON.stringify(await worker.run(problem, "non-callable"))),
    {
    status: "error",
    tests: [],
    error: "answer is not callable.",
    }
  );
});

test("worker rejects values that JSON.stringify would silently change", async () => {
  for (const invalid of [new Set([1]), Number.POSITIVE_INFINITY]) {
    const pyodide = createPyodide((_code, globals, counters) => {
      globals.set(
        "answer",
        Object.assign(
          () => proxy(invalid, counters, "result"),
          { destroy() {} }
        )
      );
    });
    const worker = await createWorker(pyodide);
    const result = await worker.run(problem, "invalid return");

    assert.strictEqual(result.status, "failed");
    assert.match(result.tests[0].error, /JSON-friendly/);
  }
});

test("worker destroys definition, function, argument, and result proxies", async () => {
  const pyodide = createPyodide((_code, globals, counters) => {
    globals.set(
      "answer",
      Object.assign(
        () => proxy(1, counters, "result"),
        { destroy: () => (counters.fn = (counters.fn ?? 0) + 1) }
      )
    );
  });
  const worker = await createWorker(pyodide);

  assert.strictEqual((await worker.run(problem, "define")).status, "passed");
  assert.deepStrictEqual(pyodide.counters, {
    definition: 1,
    arg: 1,
    result: 1,
    fn: 1,
    globals: 1,
  });
});
