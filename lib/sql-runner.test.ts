import assert from "node:assert/strict";
import test from "node:test";
import { problems, type Problem } from "./problems.ts";
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

test("normalizes trailing zeros in decimal row values", async () => {
  const numericValue: Problem = {
    ...filterActive,
    id: 9003,
    title: "Numeric normalization fixture",
    tests: [
      {
        args: [],
        expected: [{ price: "9.5" }],
      },
    ],
  };

  const result = await runSqlProblem(
    numericValue,
    "SELECT 9.50::numeric(10, 2) AS price;"
  );

  assert.equal(result.status, "passed", JSON.stringify(result));
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

const solutions: Record<number, string> = {
  34: "SELECT id, name, active FROM users WHERE active = true ORDER BY id;",
  35: `SELECT orders.id, orders.total
       FROM orders
       JOIN customers ON customers.id = orders.customer_id
       WHERE customers.name = 'Maria'
       ORDER BY orders.id;`,
  36: `SELECT status, COUNT(*)::int AS count
       FROM tickets
       GROUP BY status
       ORDER BY status;`,
  37: `SELECT id, title, published_at
       FROM posts
       WHERE published_at >= '2024-01-01'
       ORDER BY published_at DESC;`,
  38: `INSERT INTO products (id, name, price)
       VALUES (1, 'Mug', 9.5)
       RETURNING id, name, price;`,
  39: `SELECT customers.name, orders.id AS order_id
       FROM customers
       JOIN orders ON orders.customer_id = customers.id
       WHERE orders.total > 100
       ORDER BY orders.id;`,
};

test("official solutions pass SQL problems 34-39", async () => {
  const sqlProblems = problems.filter((problem) => problem.id >= 34 && problem.id <= 39);
  assert.deepEqual(
    sqlProblems.map((problem) => problem.id),
    [34, 35, 36, 37, 38, 39]
  );

  for (const problem of sqlProblems) {
    const result = await runSqlProblem(problem, solutions[problem.id]);
    assert.equal(
      result.status,
      "passed",
      `${problem.title}: ${JSON.stringify(result)}`
    );
  }
});

test("starter code does not pass SQL problems 34-39", async () => {
  for (const problem of problems.filter(
    (candidate) => candidate.id >= 34 && candidate.id <= 39
  )) {
    const result = await runSqlProblem(problem, problem.starterCode);
    assert.notEqual(result.status, "passed", problem.title);
  }
});

test("problem 35 cannot be solved by hard-coding Maria's customer id", async () => {
  const problem = problems.find((candidate) => candidate.id === 35);
  assert.ok(problem);

  const result = await runSqlProblem(
    problem,
    "SELECT id, total FROM orders WHERE customer_id = 2 ORDER BY id;"
  );

  assert.notEqual(result.status, "passed");
});

test("verifySql rejects a literal SELECT that fakes INSERT RETURNING", async () => {
  const insertProduct: Problem = {
    id: 9002,
    title: "Insert Product (fixture)",
    category: "postgresql",
    kind: "sql",
    difficulty: "easy",
    instructions: "Insert and return a product",
    fnName: "query",
    starterCode: "-- write SQL",
    tests: [
      {
        args: [],
        setupSql:
          "CREATE TABLE products (id INT PRIMARY KEY, name TEXT, price NUMERIC);",
        expected: [{ id: 1, name: "Mug", price: "9.5" }],
        verifySql: "SELECT id, name, price FROM products ORDER BY id;",
        verifyExpected: [{ id: 1, name: "Mug", price: "9.5" }],
      },
    ],
  };

  const result = await runSqlProblem(
    insertProduct,
    "SELECT 1 AS id, 'Mug' AS name, 9.5::numeric AS price;"
  );

  assert.equal(result.status, "failed");
});
