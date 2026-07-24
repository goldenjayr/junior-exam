import type { QuizQuestion } from "../types.ts";

export const prismaQuestions: QuizQuestion[] = [
  {
    id: 241,
    type: "single",
    topic: "prisma",
    difficulty: "easy",
    prompt: "Which datasource provider value configures Prisma for PostgreSQL?",
    options: [
      { id: "a", label: '`provider = "postgresql"`' },
      { id: "b", label: '`provider = "postgres"`' },
      { id: "c", label: '`provider = "pg"`' },
      { id: "d", label: '`provider = "sql"`' },
    ],
    correctId: "a",
    explanation: 'Prisma uses `provider = "postgresql"` for a PostgreSQL datasource.',
  },
  {
    id: 242,
    type: "single",
    topic: "prisma",
    difficulty: "easy",
    prompt: "What does `@id` mark on a Prisma model field?",
    options: [
      { id: "a", label: "The model's primary key" },
      { id: "b", label: "A field that may contain duplicates" },
      { id: "c", label: "A relation field only" },
      { id: "d", label: "A field hidden from Prisma Client" },
    ],
    correctId: "a",
    explanation: "`@id` identifies the primary-key field for the model.",
  },
  {
    id: 243,
    type: "single",
    topic: "prisma",
    difficulty: "medium",
    prompt: "Which scalar type is appropriate for a required email address in a Prisma model?",
    options: [
      { id: "a", label: "String" },
      { id: "b", label: "Boolean" },
      { id: "c", label: "DateTime" },
      { id: "d", label: "Json[]" },
    ],
    correctId: "a",
    explanation: "Email addresses are text values, so `String` is the appropriate scalar type.",
  },
  {
    id: 244,
    type: "single",
    topic: "prisma",
    difficulty: "medium",
    prompt: "When querying one user by its unique email, which Prisma Client method fits?",
    options: [
      { id: "a", label: "prisma.user.findUnique({ where: { email } })" },
      { id: "b", label: "prisma.user.findMany({ where: { email } })" },
      { id: "c", label: "prisma.user.create({ where: { email } })" },
      { id: "d", label: "prisma.user.groupBy({ email })" },
    ],
    correctId: "a",
    explanation: "`findUnique` looks up a single record through a unique field such as `email`.",
  },
  {
    id: 245,
    type: "single",
    topic: "prisma",
    difficulty: "medium",
    prompt: "Which option loads a post's related author with a Prisma query?",
    options: [
      { id: "a", label: "`include: { author: true }`" },
      { id: "b", label: "`where: { author: true }`" },
      { id: "c", label: "`data: { author: true }`" },
      { id: "d", label: "`orderBy: { author: true }`" },
    ],
    correctId: "a",
    explanation: "`include` requests related records in the returned result.",
  },
  {
    id: 246,
    type: "single",
    topic: "prisma",
    difficulty: "hard",
    prompt: "What is the main purpose of `prisma migrate dev` during development?",
    options: [
      { id: "a", label: "Create and apply development migrations from schema changes" },
      { id: "b", label: "Run production migrations without migration files" },
      { id: "c", label: "Generate only TypeScript types, without changing the database" },
      { id: "d", label: "Delete all tables before every query" },
    ],
    correctId: "a",
    explanation: "`migrate dev` creates and applies migrations in development as the schema evolves.",
  },
  {
    id: 247,
    type: "multi",
    topic: "prisma",
    difficulty: "medium",
    prompt: "Which field declarations add constraints or defaults? (select all)",
    options: [
      { id: "a", label: "`id Int @id`" },
      { id: "b", label: "`email String @unique`" },
      { id: "c", label: "`published Boolean @default(false)`" },
      { id: "d", label: "`name String @include`" },
    ],
    correctIds: ["a", "b", "c"],
    explanation: "`@id`, `@unique`, and `@default(...)` are schema attributes; `include` is a query option.",
  },
  {
    id: 248,
    type: "multi",
    topic: "prisma",
    difficulty: "medium",
    prompt: "Which statements about Prisma query options are true? (select all)",
    options: [
      { id: "a", label: "`where` filters records" },
      { id: "b", label: "`select` chooses returned scalar fields" },
      { id: "c", label: "`include` can load related records" },
      { id: "d", label: "`select` inserts a new record" },
    ],
    correctIds: ["a", "b", "c"],
    explanation: "`where`, `select`, and `include` shape reads; creation uses `create` with `data`.",
  },
  {
    id: 249,
    type: "multi",
    topic: "prisma",
    difficulty: "hard",
    prompt: "Which statements about relations are true? (select all)",
    options: [
      { id: "a", label: "A 1-n relation commonly has a foreign-key scalar on the 'one' record" },
      { id: "b", label: "`User.posts Post[]` can represent a user's many posts" },
      { id: "c", label: "Two list relation fields can model an implicit many-to-many relation" },
      { id: "d", label: "Relations prevent Prisma Client from querying either model separately" },
    ],
    correctIds: ["b", "c"],
    explanation: "For User–Post, the foreign key belongs on the many side (`Post.authorId`); two list fields can model implicit n-n.",
  },
  {
    id: 250,
    type: "boolean",
    topic: "prisma",
    difficulty: "easy",
    prompt: "`@unique` prevents two records from using the same value for that field.",
    correct: true,
    explanation: "`@unique` creates a uniqueness constraint for the field.",
  },
  {
    id: 251,
    type: "boolean",
    topic: "prisma",
    difficulty: "medium",
    prompt: "`findMany` returns at most one record when its `where` clause uses a unique field.",
    correct: false,
    explanation: "`findMany` always returns a list; use `findUnique` when querying by a unique identifier.",
  },
  {
    id: 252,
    type: "boolean",
    topic: "prisma",
    difficulty: "hard",
    prompt: "`prisma db push` is designed to create migration history files for each schema change.",
    correct: false,
    explanation: "`db push` synchronizes the schema without creating migration files; use migrations when migration history is needed.",
  },
  {
    id: 253,
    type: "fill",
    topic: "prisma",
    difficulty: "easy",
    prompt: "Complete the field attribute that makes email unique: `email String @____`",
    accept: ["unique"],
    placeholder: "unique",
    explanation: "`@unique` makes values in this field unique.",
  },
  {
    id: 254,
    type: "fill",
    topic: "prisma",
    difficulty: "medium",
    prompt: "Complete the query option that filters active users: `prisma.user.findMany({ ____: { active: true } })`",
    accept: ["where"],
    placeholder: "where",
    explanation: "`where` supplies the filtering conditions for a Prisma query.",
  },
  {
    id: 255,
    type: "fill",
    topic: "prisma",
    difficulty: "medium",
    prompt: "Which Client method inserts one record? `prisma.user.____({ data: { email: 'a@example.com' } })`",
    accept: ["create"],
    placeholder: "create",
    explanation: "`create` inserts one record using the values in `data`.",
  },
  {
    id: 256,
    type: "order",
    topic: "prisma",
    difficulty: "medium",
    prompt: "Order the usual steps after adding a Prisma model field that needs a tracked development migration:",
    items: [
      { id: "schema", label: "Update schema.prisma" },
      { id: "migrate", label: "Run prisma migrate dev" },
      { id: "client", label: "Use the updated generated Client" },
    ],
    correctOrder: ["schema", "migrate", "client"],
    explanation: "Define the schema change, apply it through a development migration, then use the updated Client.",
  },
  {
    id: 257,
    type: "order",
    topic: "prisma",
    difficulty: "medium",
    prompt: "Order the parts of a Prisma Client update call:",
    items: [
      { id: "model", label: "Choose `prisma.user.update`" },
      { id: "where", label: "Identify the record with `where`" },
      { id: "data", label: "Provide changed values in `data`" },
    ],
    correctOrder: ["model", "where", "data"],
    explanation: "Choose a model operation, target the record with `where`, then supply changes through `data`.",
  },
  {
    id: 258,
    type: "snippet",
    topic: "prisma",
    difficulty: "easy",
    prompt: "Which model correctly gives `User` an integer primary key and unique email?",
    snippets: [
      {
        id: "a",
        code: `model User {
  id    Int    @id
  email String @unique
}`,
      },
      {
        id: "b",
        code: `model User {
  id    Int    @unique
  email String @id
}`,
      },
      {
        id: "c",
        code: `model User {
  id    Integer @primary
  email Text    @unique
}`,
      },
    ],
    correctId: "a",
    explanation: "`Int @id` defines the primary key and `String @unique` makes email unique.",
  },
  {
    id: 259,
    type: "snippet",
    topic: "prisma",
    difficulty: "hard",
    prompt: "Which query returns published posts and includes each post's author?",
    snippets: [
      {
        id: "a",
        code: `await prisma.post.findMany({
  where: { published: true },
  include: { author: true },
});`,
      },
      {
        id: "b",
        code: `await prisma.post.findUnique({
  where: { published: true },
  author: true,
});`,
      },
      {
        id: "c",
        code: `await prisma.post.create({
  where: { published: true },
  include: { author: true },
});`,
      },
    ],
    correctId: "a",
    explanation: "`findMany` reads matching posts, `where` filters them, and `include` loads authors.",
  },
  {
    id: 260,
    type: "match",
    topic: "prisma",
    difficulty: "easy",
    prompt: "Match each Prisma Client method to its usual job.",
    left: [
      { id: "create", label: "create" },
      { id: "update", label: "update" },
      { id: "delete", label: "delete" },
      { id: "findMany", label: "findMany" },
    ],
    right: [
      { id: "r1", label: "insert a record" },
      { id: "r2", label: "modify a matching record" },
      { id: "r3", label: "remove a matching record" },
      { id: "r4", label: "return a list of records" },
    ],
    pairs: { create: "r1", update: "r2", delete: "r3", findMany: "r4" },
  },
  {
    id: 261,
    type: "match",
    topic: "prisma",
    difficulty: "medium",
    prompt: "Match each schema feature to its effect.",
    left: [
      { id: "id", label: "@id" },
      { id: "unique", label: "@unique" },
      { id: "default", label: "@default(false)" },
      { id: "list", label: "Post[]" },
    ],
    right: [
      { id: "r1", label: "marks a primary key" },
      { id: "r2", label: "requires distinct field values" },
      { id: "r3", label: "sets a value when none is provided" },
      { id: "r4", label: "represents many related posts" },
    ],
    pairs: { id: "r1", unique: "r2", default: "r3", list: "r4" },
  },
  {
    id: 262,
    type: "hotspot",
    topic: "prisma",
    difficulty: "medium",
    prompt: "Click the line that declares the foreign key scalar for the Post-to-User relation.",
    code: `model Post {
  id       Int  @id
  authorId Int
  author   User @relation(fields: [authorId], references: [id])
}`,
    regions: [
      { id: "r1", label: "Line 1: model declaration", startLine: 1, endLine: 1 },
      { id: "r2", label: "Line 2: primary key", startLine: 2, endLine: 2 },
      { id: "r3", label: "Line 3: foreign key scalar", startLine: 3, endLine: 3 },
      { id: "r4", label: "Line 4: relation field", startLine: 4, endLine: 4 },
    ],
    correctRegionId: "r3",
    explanation: "`authorId` stores the foreign-key value; the `author` field defines the relation.",
  },
  {
    id: 263,
    type: "hotspot",
    topic: "prisma",
    difficulty: "hard",
    prompt: "Click the line that configures cascading deletes from a user to related posts.",
    code: `model Post {
  id       Int  @id
  authorId Int
  author   User @relation(fields: [authorId], references: [id], onDelete: Cascade)
}`,
    regions: [
      { id: "r1", label: "Line 1: model declaration", startLine: 1, endLine: 1 },
      { id: "r2", label: "Line 2: primary key", startLine: 2, endLine: 2 },
      { id: "r3", label: "Line 3: foreign key scalar", startLine: 3, endLine: 3 },
      { id: "r4", label: "Line 4: relation with cascade", startLine: 4, endLine: 4 },
    ],
    correctRegionId: "r4",
    explanation: "`onDelete: Cascade` on the relation configures the referential action for a deleted parent.",
  },
  {
    id: 264,
    type: "output",
    topic: "prisma",
    difficulty: "easy",
    prompt: "What number is logged?",
    code: `const users = await prisma.user.findMany({
  select: { id: true },
});
console.log(users.length); // the query returned 3 users`,
    accept: ["3"],
    explanation: "The returned list has three records, so its `length` is 3.",
  },
  {
    id: 265,
    type: "output",
    topic: "prisma",
    difficulty: "medium",
    prompt: "What number is logged?",
    code: `const result = await prisma.post.deleteMany({
  where: { published: false },
});
console.log(result.count); // 2 records matched`,
    accept: ["2"],
    explanation: "`deleteMany` returns a count of affected records; here two records matched.",
  },
];
