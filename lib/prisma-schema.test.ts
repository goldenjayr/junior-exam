import assert from "node:assert/strict";
import test from "node:test";
import { parsePrismaSchema, schemaContains } from "./prisma-schema.ts";
import { runPrismaSchemaProblem } from "./prisma-schema-runner.ts";
import { problems, type Problem } from "./problems.ts";

test("parses model fields with id, unique, default, and optional types", () => {
  const ast = parsePrismaSchema(`
    generator client {
      provider = "prisma-client-js"
    }

    model User {
      id    String  @id @default(cuid())
      email String  @unique
      name  String?
    }
  `);

  assert.deepEqual(ast, {
    enums: [],
    models: [
      {
        name: "User",
        fields: [
          { name: "id", type: "String", attributes: ["id", "default(cuid())"] },
          { name: "email", type: "String", attributes: ["unique"] },
          { name: "name", type: "String?", attributes: [] },
        ],
      },
    ],
  });
});

test("parses enums and one-to-many relation fields", () => {
  const ast = parsePrismaSchema(`
    enum Role {
      USER
      ADMIN
    }

    model User {
      id    Int    @id
      posts Post[]
      role  Role
    }

    model Post {
      id       Int  @id
      authorId Int
      author   User @relation(fields: [authorId], references: [id])
    }
  `);

  assert.equal(ast.enums[0].name, "Role");
  assert.deepEqual(ast.enums[0].values, ["USER", "ADMIN"]);
  assert.equal(ast.models.length, 2);
  assert.ok(
    schemaContains(ast, {
      enums: [{ name: "Role", values: ["USER", "ADMIN"] }],
      models: [
        {
          name: "User",
          fields: [{ name: "posts", type: "Post[]", attributes: [] }],
        },
        {
          name: "Post",
          fields: [
            { name: "authorId", type: "Int", attributes: [] },
            { name: "author", type: "User", attributes: ["relation"] },
          ],
        },
      ],
    })
  );
});

test("schema containment permits extra actual fields and attributes", () => {
  const actual = parsePrismaSchema(`
    model User {
      id    String @id @default(cuid())
      email String @unique
      name  String?
    }
  `);

  assert.ok(
    schemaContains(actual, {
      enums: [],
      models: [
        {
          name: "User",
          fields: [{ name: "id", type: "String", attributes: ["id"] }],
        },
      ],
    })
  );
});

test("rejects unknown field attributes", () => {
  assert.throws(
    () =>
      parsePrismaSchema(`
        model User {
          id Int @map("user_id")
        }
      `),
    /Unsupported Prisma field attribute: @map/
  );
});

const userEmail: Problem = {
  id: 9002,
  title: "User email fixture",
  category: "prisma",
  kind: "prisma-schema",
  difficulty: "easy",
  instructions: "Create a user schema",
  fnName: "schema",
  starterCode: "",
  tests: [
    {
      args: [],
      expected: {
        enums: [],
        models: [
          {
            name: "User",
            fields: [
              { name: "id", type: "Int", attributes: ["id"] },
              { name: "email", type: "String", attributes: ["unique"] },
            ],
          },
        ],
      },
    },
  ],
};

test("schema runner passes matching schema", () => {
  const result = runPrismaSchemaProblem(
    userEmail,
    `model User {
      id Int @id
      email String @unique
    }`
  );

  assert.equal(result.status, "passed", JSON.stringify(result));
});

test("schema runner fails a missing unique attribute", () => {
  const result = runPrismaSchemaProblem(
    userEmail,
    `model User {
      id Int @id
      email String
    }`
  );

  assert.equal(result.status, "failed");
});

const solutions: Record<number, string> = {
  40: `model User {
    id Int @id
    email String @unique
  }`,
  41: `model User {
    id Int @id
    posts Post[]
  }

  model Post {
    id Int @id
    authorId Int
    author User @relation(fields: [authorId], references: [id])
  }`,
  42: `enum Role {
    USER
    ADMIN
  }

  model User {
    id Int @id
    role Role
  }`,
};

test("official solutions pass Prisma problems 40-42", () => {
  const prismaProblems = problems.filter(
    (problem) => problem.id >= 40 && problem.id <= 42
  );
  assert.deepEqual(
    prismaProblems.map((problem) => problem.id),
    [40, 41, 42]
  );

  for (const problem of prismaProblems) {
    const result = runPrismaSchemaProblem(problem, solutions[problem.id]);
    assert.equal(
      result.status,
      "passed",
      `${problem.title}: ${JSON.stringify(result)}`
    );
  }
});

test("starter code does not pass Prisma problems 40-42", () => {
  for (const problem of problems.filter(
    (problem) => problem.id >= 40 && problem.id <= 42
  )) {
    assert.notEqual(
      runPrismaSchemaProblem(problem, problem.starterCode).status,
      "passed",
      problem.title
    );
  }
});
