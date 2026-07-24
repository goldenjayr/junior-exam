import assert from "node:assert/strict";
import test from "node:test";
import type { Problem } from "./problems.ts";
import { runSqlProblem } from "./sql-runner.ts";

const filterActive: Problem = {
  id: 9001,
  title: "Filter Active (fixture)",
  category: "postgresql",
  kind: "sql",
  difficulty: "easy",
  instructions: "Select active users",
  fnName: "query",
  starterCode: "-- write SQL",
  tests: [
    {
      args: [],
      setupSql: `
        CREATE TABLE users (id INT PRIMARY KEY, name TEXT, active BOOLEAN);
        INSERT INTO users VALUES (1, 'John', true), (2, 'Maria', false), (3, 'Peter', true);
      `,
      expected: [
        { id: 1, name: "John", active: true },
        { id: 3, name: "Peter", active: true },
      ],
    },
  ],
};

test("correct SELECT passes", async () => {
  const r = await runSqlProblem(
    filterActive,
    "SELECT id, name, active FROM users WHERE active = true ORDER BY id;"
  );
  assert.equal(r.status, "passed", JSON.stringify(r));
});

test("wrong SELECT fails", async () => {
  const r = await runSqlProblem(filterActive, "SELECT id, name, active FROM users;");
  assert.equal(r.status, "failed");
});

test("syntax error reports error status", async () => {
  const r = await runSqlProblem(filterActive, "SELEC oops");
  assert.equal(r.status, "error");
  assert.ok(r.error || r.tests.some((t) => t.error));
});
