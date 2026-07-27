import type { Problem } from "./problems.ts";

/** Extract CREATE TABLE statements from SQL test setup (stops before INSERT/data). */
export function extractSchemaSql(setupSql: string): string {
  const createStatements = setupSql
    .split(";")
    .map((statement) => statement.trim())
    .filter((statement) => /^CREATE\s+TABLE/i.test(statement));

  return createStatements.map((statement) => `${statement};`).join("\n\n");
}

export function schemaSqlForProblem(problem: Problem): string | null {
  if (problem.kind !== "sql") return null;
  const setupSql = problem.tests[0]?.setupSql;
  if (!setupSql) return null;
  const schema = extractSchemaSql(setupSql);
  return schema || null;
}
