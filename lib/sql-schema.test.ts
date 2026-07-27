import assert from "node:assert/strict";
import test from "node:test";
import { problems } from "./problems.ts";
import { extractSchemaSql, schemaSqlForProblem } from "./sql-schema.ts";

test("extractSchemaSql keeps CREATE TABLE statements only", () => {
  const setupSql = `
    CREATE TABLE customers (id INT PRIMARY KEY, name TEXT);
    CREATE TABLE orders (
      id INT PRIMARY KEY,
      customer_id INT REFERENCES customers(id),
      total INT
    );
    INSERT INTO customers VALUES (1, 'John'), (2, 'Maria');
    INSERT INTO orders VALUES (10, 2, 75);
  `;

  assert.equal(
    extractSchemaSql(setupSql),
    `CREATE TABLE customers (id INT PRIMARY KEY, name TEXT);

CREATE TABLE orders (
      id INT PRIMARY KEY,
      customer_id INT REFERENCES customers(id),
      total INT
    );`
  );
});

test("schemaSqlForProblem returns schema for every SQL exam problem", () => {
  const sqlProblems = problems.filter((p) => p.kind === "sql");
  assert.ok(sqlProblems.length > 0);

  for (const problem of sqlProblems) {
    const schema = schemaSqlForProblem(problem);
    assert.ok(schema, `expected schema for problem ${problem.id}`);
    assert.match(schema!, /CREATE TABLE/i);
    assert.doesNotMatch(schema!, /INSERT INTO/i);
  }
});
