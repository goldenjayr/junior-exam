# Final branch review fixes

- Isolated each Pyodide submission in a fresh `globals` dictionary while retaining builtins and destroying all namespace proxies afterward.
- Added regression coverage preventing helpers from a prior Python submission from satisfying a later one.
- Updated worker test doubles for isolated namespaces and removed the stale `pnpm-lock.yaml`; `package-lock.json` is the newer active lockfile.

Verification:

- `node --test lib/python-runner.test.ts`
- `npm test`
