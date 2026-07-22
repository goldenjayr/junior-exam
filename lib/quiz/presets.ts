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
    ids: [1, 2, 6, 9, 12, 17, 19, 23, 24, 4],
    suggestedMinutes: 12,
  },
  {
    name: "React Essentials",
    description:
      "Hooks, lists, effects, immutability, and common junior React pitfalls.",
    ids: [91, 92, 93, 94, 95, 96, 99, 102, 107, 108, 111, 115],
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
    name: "Node API Basics",
    description:
      "Runtime basics, core modules, HTTP, env config, and Express-style pipeline thinking.",
    ids: [151, 152, 154, 156, 157, 159, 163, 165, 167, 170, 171, 175],
    suggestedMinutes: 15,
  },
  {
    name: "Full Stack Blitz",
    description:
      "Mixed junior topics across JS, TS, React, HTML, Tailwind, and Node.",
    ids: [
      1, 4, 9, 17, 23, // js
      31, 32, 39, 47, // ts
      61, 62, 69, // tailwind
      91, 92, 99, 107, // react
      121, 123, 132, // html
      151, 154, 167, // node
    ],
    suggestedMinutes: 25,
  },
  {
    name: "Time Attack 10",
    description:
      "Ten varied easy/medium items meant to pair with a tight countdown.",
    ids: [1, 32, 62, 92, 122, 152, 6, 96, 126, 156],
    suggestedMinutes: 10,
  },
  {
    name: "Junior Knowledge Full",
    description:
      "Broad bank sweep: first 12 questions from each topic (72 items) for a longer knowledge check.",
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
      // nodejs 151-162
      151, 152, 153, 154, 155, 156, 157, 158, 159, 160, 161, 162,
    ],
    suggestedMinutes: 60,
  },
];
