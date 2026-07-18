export type TestCase = {
  args: unknown[];
  expected: unknown;
};

export type Problem = {
  id: number;
  title: string;
  category: "arrays" | "strings" | "objects" | "logic";
  difficulty: "easy" | "medium" | "hard";
  instructions: string;
  fnName: string;
  starterCode: string;
  tests: TestCase[];
};

export const categories: Problem["category"][] = [
  "arrays",
  "strings",
  "objects",
  "logic",
];

export const problems: Problem[] = [
  {
    id: 1,
    title: "Filter Active Users",
    category: "arrays",
    difficulty: "easy",
    instructions:
      "Complete getActiveUsers so it returns only users whose active property is true.",
    fnName: "getActiveUsers",
    starterCode: `function getActiveUsers(users) {
  // Write your solution here

}`,
    tests: [
      {
        args: [
          [
            { id: 1, name: "John", active: true },
            { id: 2, name: "Maria", active: false },
            { id: 3, name: "Peter", active: true },
          ],
        ],
        expected: [
          { id: 1, name: "John", active: true },
          { id: 3, name: "Peter", active: true },
        ],
      },
      {
        args: [[{ id: 1, name: "Solo", active: false }]],
        expected: [],
      },
      { args: [[]], expected: [] },
    ],
  },
  {
    id: 2,
    title: "Count Employees by Role",
    category: "objects",
    difficulty: "easy",
    instructions:
      "Complete countEmployeesByRole so it returns an object mapping each role to the number of employees with that role.",
    fnName: "countEmployeesByRole",
    starterCode: `function countEmployeesByRole(employees) {
  // Write your solution here

}`,
    tests: [
      {
        args: [
          [
            { name: "John", role: "Developer" },
            { name: "Maria", role: "Developer" },
            { name: "Peter", role: "Designer" },
            { name: "Angela", role: "QA" },
          ],
        ],
        expected: { Developer: 2, Designer: 1, QA: 1 },
      },
      { args: [[]], expected: {} },
    ],
  },
  {
    id: 3,
    title: "Find Employee by ID",
    category: "arrays",
    difficulty: "easy",
    instructions:
      "Complete findEmployeeById so it returns the employee with the matching id, or undefined when no employee matches.",
    fnName: "findEmployeeById",
    starterCode: `function findEmployeeById(employees, id) {
  // Write your solution here

}`,
    tests: [
      {
        args: [
          [
            { id: 1, name: "John" },
            { id: 2, name: "Maria" },
          ],
          2,
        ],
        expected: { id: 2, name: "Maria" },
      },
      {
        args: [[{ id: 1, name: "John" }], 99],
        expected: undefined,
      },
    ],
  },
  {
    id: 4,
    title: "Remove Duplicate Numbers",
    category: "arrays",
    difficulty: "easy",
    instructions:
      "Complete removeDuplicates so it returns a new array containing only unique numbers, keeping the original order.",
    fnName: "removeDuplicates",
    starterCode: `function removeDuplicates(numbers) {
  // Write your solution here

}`,
    tests: [
      { args: [[1, 2, 2, 3, 4, 4, 5]], expected: [1, 2, 3, 4, 5] },
      { args: [[7, 7, 7]], expected: [7] },
      { args: [[]], expected: [] },
    ],
  },
  {
    id: 5,
    title: "Calculate Average Score",
    category: "arrays",
    difficulty: "easy",
    instructions:
      "Complete calculateAverage so it returns the average of all scores.",
    fnName: "calculateAverage",
    starterCode: `function calculateAverage(scores) {
  // Write your solution here

}`,
    tests: [
      { args: [[90, 80, 100, 95]], expected: 91.25 },
      { args: [[10]], expected: 10 },
    ],
  },
  {
    id: 6,
    title: "Reverse a String",
    category: "strings",
    difficulty: "easy",
    instructions:
      "Complete reverseString so it returns the input string reversed.",
    fnName: "reverseString",
    starterCode: `function reverseString(text) {
  // Write your solution here

}`,
    tests: [
      { args: ["hello"], expected: "olleh" },
      { args: ["a"], expected: "a" },
      { args: [""], expected: "" },
    ],
  },
  {
    id: 7,
    title: "Check for Palindrome",
    category: "strings",
    difficulty: "easy",
    instructions:
      "Complete isPalindrome so it returns true when the string reads the same forwards and backwards (case-insensitive).",
    fnName: "isPalindrome",
    starterCode: `function isPalindrome(text) {
  // Write your solution here

}`,
    tests: [
      { args: ["Racecar"], expected: true },
      { args: ["hello"], expected: false },
      { args: [""], expected: true },
    ],
  },
  {
    id: 8,
    title: "Sum of Even Numbers",
    category: "arrays",
    difficulty: "easy",
    instructions:
      "Complete sumEvens so it returns the sum of all even numbers in the array.",
    fnName: "sumEvens",
    starterCode: `function sumEvens(numbers) {
  // Write your solution here

}`,
    tests: [
      { args: [[1, 2, 3, 4, 5, 6]], expected: 12 },
      { args: [[1, 3, 5]], expected: 0 },
      { args: [[]], expected: 0 },
    ],
  },
  {
    id: 9,
    title: "FizzBuzz",
    category: "logic",
    difficulty: "easy",
    instructions:
      'Complete fizzBuzz so it returns an array from 1 to n where multiples of 3 are "Fizz", multiples of 5 are "Buzz", and multiples of both are "FizzBuzz".',
    fnName: "fizzBuzz",
    starterCode: `function fizzBuzz(n) {
  // Write your solution here

}`,
    tests: [
      {
        args: [15],
        expected: [
          1, 2, "Fizz", 4, "Buzz", "Fizz", 7, 8, "Fizz", "Buzz", 11, "Fizz",
          13, 14, "FizzBuzz",
        ],
      },
      { args: [3], expected: [1, 2, "Fizz"] },
    ],
  },
  {
    id: 10,
    title: "Group Products by Category",
    category: "objects",
    difficulty: "medium",
    instructions:
      "Complete groupByCategory so it returns an object mapping each category to an array of product names in that category.",
    fnName: "groupByCategory",
    starterCode: `function groupByCategory(products) {
  // Write your solution here

}`,
    tests: [
      {
        args: [
          [
            { name: "Laptop", category: "Electronics" },
            { name: "Shirt", category: "Clothing" },
            { name: "Phone", category: "Electronics" },
          ],
        ],
        expected: {
          Electronics: ["Laptop", "Phone"],
          Clothing: ["Shirt"],
        },
      },
      { args: [[]], expected: {} },
    ],
  },
  {
    id: 11,
    title: "Flatten a Nested Array",
    category: "arrays",
    difficulty: "medium",
    instructions:
      "Complete flatten so it returns a single-level array from an array nested to any depth.",
    fnName: "flatten",
    starterCode: `function flatten(values) {
  // Write your solution here

}`,
    tests: [
      { args: [[1, [2, [3, [4]]], 5]], expected: [1, 2, 3, 4, 5] },
      { args: [[1, 2, 3]], expected: [1, 2, 3] },
      { args: [[]], expected: [] },
    ],
  },
  {
    id: 12,
    title: "Chunk an Array",
    category: "arrays",
    difficulty: "medium",
    instructions:
      "Complete chunk so it splits the array into groups of the given size. The final group may be smaller.",
    fnName: "chunk",
    starterCode: `function chunk(values, size) {
  // Write your solution here

}`,
    tests: [
      {
        args: [[1, 2, 3, 4, 5], 2],
        expected: [[1, 2], [3, 4], [5]],
      },
      { args: [[1, 2, 3], 3], expected: [[1, 2, 3]] },
      { args: [[], 2], expected: [] },
    ],
  },
  {
    id: 13,
    title: "Sort Employees by Age",
    category: "arrays",
    difficulty: "medium",
    instructions:
      "Complete sortByAge so it returns a new array of employees sorted by age ascending. Do not mutate the input array.",
    fnName: "sortByAge",
    starterCode: `function sortByAge(employees) {
  // Write your solution here

}`,
    tests: [
      {
        args: [
          [
            { name: "John", age: 32 },
            { name: "Maria", age: 25 },
            { name: "Peter", age: 28 },
          ],
        ],
        expected: [
          { name: "Maria", age: 25 },
          { name: "Peter", age: 28 },
          { name: "John", age: 32 },
        ],
      },
      { args: [[]], expected: [] },
    ],
  },
  {
    id: 14,
    title: "Count Vowels",
    category: "strings",
    difficulty: "easy",
    instructions:
      "Complete countVowels so it returns the number of vowels (a, e, i, o, u) in the string, case-insensitive.",
    fnName: "countVowels",
    starterCode: `function countVowels(text) {
  // Write your solution here

}`,
    tests: [
      { args: ["JavaScript"], expected: 3 },
      { args: ["AEIOU"], expected: 5 },
      { args: ["xyz"], expected: 0 },
    ],
  },
  {
    id: 15,
    title: "Find the Longest Word",
    category: "strings",
    difficulty: "medium",
    instructions:
      "Complete longestWord so it returns the longest word in the sentence. If several words tie, return the first one.",
    fnName: "longestWord",
    starterCode: `function longestWord(sentence) {
  // Write your solution here

}`,
    tests: [
      {
        args: ["The quick brown fox jumped over the lazy dog"],
        expected: "jumped",
      },
      { args: ["one two six"], expected: "one" },
    ],
  },
  {
    id: 16,
    title: "Capitalize Each Word",
    category: "strings",
    difficulty: "easy",
    instructions:
      "Complete capitalizeWords so it returns the sentence with the first letter of every word uppercased.",
    fnName: "capitalizeWords",
    starterCode: `function capitalizeWords(sentence) {
  // Write your solution here

}`,
    tests: [
      { args: ["hello world"], expected: "Hello World" },
      { args: ["javaScript is fun"], expected: "JavaScript Is Fun" },
      { args: [""], expected: "" },
    ],
  },
  {
    id: 17,
    title: "Find Min and Max",
    category: "arrays",
    difficulty: "easy",
    instructions:
      "Complete minMax so it returns an object with the smallest and largest numbers, e.g. { min: 1, max: 9 }.",
    fnName: "minMax",
    starterCode: `function minMax(numbers) {
  // Write your solution here

}`,
    tests: [
      { args: [[3, 1, 9, 4]], expected: { min: 1, max: 9 } },
      { args: [[5]], expected: { min: 5, max: 5 } },
      { args: [[-2, -8, 0]], expected: { min: -8, max: 0 } },
    ],
  },
  {
    id: 18,
    title: "Count Character Occurrences",
    category: "strings",
    difficulty: "medium",
    instructions:
      "Complete charCount so it returns an object mapping each character in the string to how many times it appears.",
    fnName: "charCount",
    starterCode: `function charCount(text) {
  // Write your solution here

}`,
    tests: [
      { args: ["hello"], expected: { h: 1, e: 1, l: 2, o: 1 } },
      { args: [""], expected: {} },
    ],
  },
  {
    id: 19,
    title: "Sum Nested Values",
    category: "objects",
    difficulty: "medium",
    instructions:
      "Complete totalCartPrice so it returns the total price of the cart: sum of price × quantity for every item.",
    fnName: "totalCartPrice",
    starterCode: `function totalCartPrice(items) {
  // Write your solution here

}`,
    tests: [
      {
        args: [
          [
            { name: "Pen", price: 2, quantity: 3 },
            { name: "Book", price: 10, quantity: 1 },
          ],
        ],
        expected: 16,
      },
      { args: [[]], expected: 0 },
    ],
  },
  {
    id: 20,
    title: "Merge Two Sorted Arrays",
    category: "arrays",
    difficulty: "medium",
    instructions:
      "Complete mergeSorted so it merges two arrays that are already sorted ascending into one sorted array.",
    fnName: "mergeSorted",
    starterCode: `function mergeSorted(a, b) {
  // Write your solution here

}`,
    tests: [
      { args: [[1, 3, 5], [2, 4, 6]], expected: [1, 2, 3, 4, 5, 6] },
      { args: [[], [1, 2]], expected: [1, 2] },
      { args: [[1, 1], [1]], expected: [1, 1, 1] },
    ],
  },
  {
    id: 21,
    title: "Check Anagrams",
    category: "strings",
    difficulty: "medium",
    instructions:
      "Complete isAnagram so it returns true when the two strings contain exactly the same letters (case-insensitive).",
    fnName: "isAnagram",
    starterCode: `function isAnagram(a, b) {
  // Write your solution here

}`,
    tests: [
      { args: ["listen", "silent"], expected: true },
      { args: ["Hello", "olleh"], expected: true },
      { args: ["hello", "world"], expected: false },
      { args: ["aab", "abb"], expected: false },
    ],
  },
  {
    id: 22,
    title: "Pluck a Property",
    category: "objects",
    difficulty: "easy",
    instructions:
      "Complete pluck so it returns an array of the given property's value from every object.",
    fnName: "pluck",
    starterCode: `function pluck(items, key) {
  // Write your solution here

}`,
    tests: [
      {
        args: [
          [
            { name: "John", age: 30 },
            { name: "Maria", age: 25 },
          ],
          "name",
        ],
        expected: ["John", "Maria"],
      },
      { args: [[], "name"], expected: [] },
    ],
  },
  {
    id: 23,
    title: "Two Sum",
    category: "logic",
    difficulty: "hard",
    instructions:
      "Complete twoSum so it returns the indices of the two numbers that add up to the target, as [i, j] with i < j. Assume exactly one solution exists.",
    fnName: "twoSum",
    starterCode: `function twoSum(numbers, target) {
  // Write your solution here

}`,
    tests: [
      { args: [[2, 7, 11, 15], 9], expected: [0, 1] },
      { args: [[3, 2, 4], 6], expected: [1, 2] },
      { args: [[3, 3], 6], expected: [0, 1] },
    ],
  },
  {
    id: 24,
    title: "Balanced Brackets",
    category: "logic",
    difficulty: "hard",
    instructions:
      "Complete isBalanced so it returns true when every opening bracket ( [ { has a matching closing bracket in the correct order.",
    fnName: "isBalanced",
    starterCode: `function isBalanced(text) {
  // Write your solution here

}`,
    tests: [
      { args: ["([]{})"], expected: true },
      { args: ["([)]"], expected: false },
      { args: ["((("], expected: false },
      { args: [""], expected: true },
    ],
  },
  {
    id: 25,
    title: "Running Total",
    category: "logic",
    difficulty: "hard",
    instructions:
      "Complete runningTotal so it returns an array where each element is the sum of all numbers up to and including that position.",
    fnName: "runningTotal",
    starterCode: `function runningTotal(numbers) {
  // Write your solution here

}`,
    tests: [
      { args: [[1, 2, 3, 4]], expected: [1, 3, 6, 10] },
      { args: [[5]], expected: [5] },
      { args: [[]], expected: [] },
    ],
  },
  {
    id: 26,
    title: "Fibonacci Sequence",
    category: "logic",
    difficulty: "medium",
    instructions:
      "Complete fibonacci so it returns an array with the first n Fibonacci numbers, starting 0, 1.",
    fnName: "fibonacci",
    starterCode: `function fibonacci(n) {
  // Write your solution here

}`,
    tests: [
      { args: [7], expected: [0, 1, 1, 2, 3, 5, 8] },
      { args: [1], expected: [0] },
      { args: [0], expected: [] },
    ],
  },
  {
    id: 27,
    title: "Title from Slug",
    category: "strings",
    difficulty: "easy",
    instructions:
      'Complete unslug so it converts a-slug-like-this into "A Slug Like This".',
    fnName: "unslug",
    starterCode: `function unslug(slug) {
  // Write your solution here

}`,
    tests: [
      { args: ["hello-world"], expected: "Hello World" },
      { args: ["a"], expected: "A" },
    ],
  },
];

export function parseProblemIds(param: string | null): number[] {
  if (!param) return [];
  const valid = new Set(problems.map((p) => p.id));
  return [...new Set(param.split(",").map(Number))].filter((id) =>
    valid.has(id)
  );
}
