export type QuizPreset = {
  name: string;
  description: string;
  ids: number[];
  suggestedMinutes?: number;
};

export const quizPresets: QuizPreset[] = [
  {
    name: "Quick JS Screen",
    description:
      "Core JavaScript fundamentals for a short junior phone/screen: types, arrays, equality, async basics.",
    ids: [1, 2, 6, 9, 12, 17, 19, 23, 24, 4, 26, 29],
    suggestedMinutes: 12,
  },
  {
    name: "TypeScript Essentials",
    description:
      "Static typing, unions, utilities, narrowing, and common junior TS interview topics.",
    ids: [31, 32, 33, 34, 36, 38, 39, 42, 47, 49, 51, 55, 56, 57, 59],
    suggestedMinutes: 15,
  },
  {
    name: "React Essentials",
    description:
      "Hooks, lists, effects, immutability, and common junior React pitfalls.",
    ids: [91, 92, 93, 94, 95, 96, 99, 102, 107, 108, 111, 115, 116, 119],
    suggestedMinutes: 15,
  },
  {
    name: "Tailwind Sprint",
    description:
      "Utility-first layout, spacing, responsive prefixes, and variants.",
    ids: [61, 62, 63, 64, 66, 69, 72, 73, 77, 78, 79, 85],
    suggestedMinutes: 12,
  },
  {
    name: "CSS Fundamentals",
    description:
      "Box model, cascade, flex/grid, selectors, and responsive basics for juniors.",
    ids: [181, 182, 183, 184, 186, 189, 192, 193, 196, 197, 199, 203],
    suggestedMinutes: 12,
  },
  {
    name: "Node API Basics",
    description:
      "Runtime basics, core modules, HTTP, env config, and Express-style pipeline thinking.",
    ids: [151, 152, 154, 156, 157, 159, 163, 165, 167, 170, 171, 175],
    suggestedMinutes: 15,
  },
  {
    name: "PostgreSQL Essentials",
    description:
      "SELECT/JOIN/aggregates, keys, and junior Postgres pitfalls.",
    ids: [211, 212, 213, 214, 216, 219, 221, 222, 224, 226, 228, 230, 233],
    suggestedMinutes: 15,
  },
  {
    name: "Prisma Essentials",
    description:
      "Schema modeling, relations, and Client CRUD/query args.",
    ids: [241, 242, 243, 244, 246, 249, 251, 252, 254, 256, 258, 260, 263],
    suggestedMinutes: 15,
  },
  {
    name: "Data Layer Blitz",
    description:
      "Mixed Postgres + Prisma for a short data-layer screen.",
    ids: [211, 214, 219, 224, 230, 241, 244, 249, 254, 260],
    suggestedMinutes: 20,
  },
  {
    name: "Full Stack Blitz",
    description:
      "Mixed junior topics across JS, TS, React, HTML, CSS, Tailwind, and Node.",
    ids: [
      1, 4, 9, 17, 23, // js
      31, 32, 39, 47, // ts
      61, 62, 69, // tailwind
      91, 92, 99, 107, // react
      121, 123, 132, // html
      181, 184, 192, // css
      151, 154, 167, // node
      211, 214, 241, 244, // postgres, prisma
    ],
    suggestedMinutes: 25,
  },
  {
    name: "Time Attack 10",
    description:
      "Ten varied easy/medium items meant to pair with a tight countdown.",
    ids: [1, 32, 62, 92, 122, 152, 211, 96, 181, 241],
    suggestedMinutes: 10,
  },
  {
    name: "Junior Knowledge Full",
    description:
      "Broad bank sweep: first 12 questions from each topic for a longer knowledge check.",
    ids: [
      // javascript 1-12
      1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12,
      // typescript 31-42
      31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42,
      // tailwind 61-72
      61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71, 72,
      // react 91-102
      91, 92, 93, 94, 95, 96, 97, 98, 99, 100, 101, 102,
      // html 121-132
      121, 122, 123, 124, 125, 126, 127, 128, 129, 130, 131, 132,
      // css 181-192
      181, 182, 183, 184, 185, 186, 187, 188, 189, 190, 191, 192,
      // nodejs 151-162
      151, 152, 153, 154, 155, 156, 157, 158, 159, 160, 161, 162,
      // postgresql 211-222
      211, 212, 213, 214, 215, 216, 217, 218, 219, 220, 221, 222,
      // prisma 241-252
      241, 242, 243, 244, 245, 246, 247, 248, 249, 250, 251, 252,
    ],
    suggestedMinutes: 70,
  },
];
