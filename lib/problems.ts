export type TestCase = {
  args: unknown[];
  expected: unknown;
  clickOn?: string;
  clicks?: number;
  /** SQL problems: seed schema + data before candidate query. */
  setupSql?: string;
  /** SQL problems: query persisted state after the candidate query. */
  verifySql?: string;
  /** SQL problems: expected rows returned by verifySql. */
  verifyExpected?: unknown;
};

export type Problem = {
  id: number;
  title: string;
  category:
    | "arrays"
    | "strings"
    | "objects"
    | "logic"
    | "react"
    | "postgresql"
    | "prisma";
  kind?: "react" | "sql" | "prisma-schema" | "prisma-client";
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
  "react",
  "postgresql",
  "prisma",
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
  {
    id: 28,
    title: "Greeting Component",
    category: "react",
    kind: "react",
    difficulty: "easy",
    instructions:
      'Complete the Greeting component so it renders an <h1> saying "Hello, <name>!" using the name prop.',
    fnName: "Greeting",
    starterCode: `function Greeting({ name }) {
  // Return your JSX here

}`,
    tests: [
      { args: [{ name: "Maria" }], expected: "Hello, Maria!" },
      { args: [{ name: "John" }], expected: "Hello, John!" },
    ],
  },
  {
    id: 29,
    title: "Item Counter Label",
    category: "react",
    kind: "react",
    difficulty: "easy",
    instructions:
      'Complete CartSummary so it renders "<n> items in cart" where n is the length of the items prop array.',
    fnName: "CartSummary",
    starterCode: `function CartSummary({ items }) {
  // Return your JSX here

}`,
    tests: [
      { args: [{ items: ["Pen", "Book", "Mug"] }], expected: "3 items in cart" },
      { args: [{ items: [] }], expected: "0 items in cart" },
    ],
  },
  {
    id: 30,
    title: "Conditional Status Badge",
    category: "react",
    kind: "react",
    difficulty: "easy",
    instructions:
      'Complete StatusBadge so it renders "Online" when the active prop is true and "Offline" when it is false.',
    fnName: "StatusBadge",
    starterCode: `function StatusBadge({ active }) {
  // Return your JSX here

}`,
    tests: [
      { args: [{ active: true }], expected: "Online" },
      { args: [{ active: false }], expected: "Offline" },
    ],
  },
  {
    id: 31,
    title: "Render a User List",
    category: "react",
    kind: "react",
    difficulty: "medium",
    instructions:
      "Complete UserList so it renders a <ul> with one <li> per user showing the user's name.",
    fnName: "UserList",
    starterCode: `function UserList({ users }) {
  // Return your JSX here

}`,
    tests: [
      {
        args: [
          {
            users: [
              { id: 1, name: "John" },
              { id: 2, name: "Maria" },
            ],
          },
        ],
        expected: "John Maria",
      },
      { args: [{ users: [{ id: 1, name: "Solo" }] }], expected: "Solo" },
    ],
  },
  {
    id: 32,
    title: "Click Counter",
    category: "react",
    kind: "react",
    difficulty: "medium",
    instructions:
      'Complete Counter so it renders "Count: <n>" and a <button> labeled "+" that increments the count on every click. Start at 0. Use the useState hook (available as React.useState).',
    fnName: "Counter",
    starterCode: `function Counter() {
  // Return your JSX here — e.g. <p>Count: 0</p> plus a <button>

}`,
    tests: [
      { args: [{}], expected: "Count: 0 +" },
      { args: [{}], clickOn: "button", clicks: 3, expected: "Count: 3 +" },
    ],
  },
  {
    id: 33,
    title: "Show / Hide Toggle",
    category: "react",
    kind: "react",
    difficulty: "hard",
    instructions:
      'Complete Toggle so it renders a <button> labeled "Toggle" and a message that switches between "Visible" and "Hidden" on each click. Start with "Visible". Use React.useState.',
    fnName: "Toggle",
    starterCode: `function Toggle() {
  // Return your JSX here

}`,
    tests: [
      { args: [{}], expected: "Toggle Visible" },
      { args: [{}], clickOn: "button", clicks: 1, expected: "Toggle Hidden" },
      { args: [{}], clickOn: "button", clicks: 2, expected: "Toggle Visible" },
    ],
  },
  {
    id: 34,
    title: "Active Users",
    category: "postgresql",
    kind: "sql",
    difficulty: "easy",
    instructions:
      "Write a query that returns the id, name, and active status of active users. Order the rows by id.",
    fnName: "query",
    starterCode: `-- SELECT active users
`,
    tests: [
      {
        args: [],
        setupSql: `
          CREATE TABLE users (id INT PRIMARY KEY, name TEXT, active BOOLEAN);
          INSERT INTO users VALUES
            (1, 'John', true),
            (2, 'Maria', false),
            (3, 'Peter', true);
        `,
        expected: [
          { id: 1, name: "John", active: true },
          { id: 3, name: "Peter", active: true },
        ],
      },
      {
        args: [],
        setupSql: `
          CREATE TABLE users (id INT PRIMARY KEY, name TEXT, active BOOLEAN);
          INSERT INTO users VALUES
            (4, 'Angela', false),
            (7, 'Noah', true),
            (2, 'Lina', true);
        `,
        expected: [
          { id: 2, name: "Lina", active: true },
          { id: 7, name: "Noah", active: true },
        ],
      },
    ],
  },
  {
    id: 35,
    title: "Orders for Customer",
    category: "postgresql",
    kind: "sql",
    difficulty: "easy",
    instructions:
      "Write a query that returns the id and total of every order placed by the customer named Maria. Order the rows by order id.",
    fnName: "query",
    starterCode: `-- SELECT Maria's orders
`,
    tests: [
      {
        args: [],
        setupSql: `
          CREATE TABLE customers (id INT PRIMARY KEY, name TEXT);
          CREATE TABLE orders (
            id INT PRIMARY KEY,
            customer_id INT REFERENCES customers(id),
            total INT
          );
          INSERT INTO customers VALUES (1, 'John'), (2, 'Maria'), (3, 'Peter');
          INSERT INTO orders VALUES
            (10, 2, 75),
            (11, 1, 40),
            (12, 2, 120);
        `,
        expected: [
          { id: 10, total: 75 },
          { id: 12, total: 120 },
        ],
      },
      {
        args: [],
        setupSql: `
          CREATE TABLE customers (id INT PRIMARY KEY, name TEXT);
          CREATE TABLE orders (
            id INT PRIMARY KEY,
            customer_id INT REFERENCES customers(id),
            total INT
          );
          INSERT INTO customers VALUES (2, 'John'), (7, 'Maria'), (9, 'Peter');
          INSERT INTO orders VALUES
            (20, 7, 55),
            (21, 2, 90),
            (22, 7, 140);
        `,
        expected: [
          { id: 20, total: 55 },
          { id: 22, total: 140 },
        ],
      },
    ],
  },
  {
    id: 36,
    title: "Count by Status",
    category: "postgresql",
    kind: "sql",
    difficulty: "medium",
    instructions:
      "Write a query that groups tickets by status and returns each status with its count as an integer column named count. Order the rows by status.",
    fnName: "query",
    starterCode: `-- Count tickets by status
`,
    tests: [
      {
        args: [],
        setupSql: `
          CREATE TABLE tickets (id INT PRIMARY KEY, status TEXT);
          INSERT INTO tickets VALUES
            (1, 'closed'),
            (2, 'open'),
            (3, 'open'),
            (4, 'pending');
        `,
        expected: [
          { status: "closed", count: 1 },
          { status: "open", count: 2 },
          { status: "pending", count: 1 },
        ],
      },
      {
        args: [],
        setupSql: `
          CREATE TABLE tickets (id INT PRIMARY KEY, status TEXT);
          INSERT INTO tickets VALUES
            (10, 'closed'),
            (11, 'closed'),
            (12, 'closed'),
            (13, 'open');
        `,
        expected: [
          { status: "closed", count: 3 },
          { status: "open", count: 1 },
        ],
      },
    ],
  },
  {
    id: 37,
    title: "Recent Posts",
    category: "postgresql",
    kind: "sql",
    difficulty: "medium",
    instructions:
      "Write a query that returns the id, title, and published_at date of posts published on or after 2024-01-01. Order newest posts first.",
    fnName: "query",
    starterCode: `-- SELECT recent posts
`,
    tests: [
      {
        args: [],
        setupSql: `
          CREATE TABLE posts (id INT PRIMARY KEY, title TEXT, published_at DATE);
          INSERT INTO posts VALUES
            (1, 'Old News', '2023-12-31'),
            (2, 'New Year', '2024-01-01'),
            (3, 'Spring Update', '2024-04-15');
        `,
        expected: [
          {
            id: 3,
            title: "Spring Update",
            published_at: new Date("2024-04-15T00:00:00.000Z"),
          },
          {
            id: 2,
            title: "New Year",
            published_at: new Date("2024-01-01T00:00:00.000Z"),
          },
        ],
      },
    ],
  },
  {
    id: 38,
    title: "Insert Returning",
    category: "postgresql",
    kind: "sql",
    difficulty: "medium",
    instructions:
      "Insert a product with id 1, name Mug, and price 9.5. Return the inserted row's id, name, and price.",
    fnName: "query",
    starterCode: `-- INSERT a product and RETURN it
`,
    tests: [
      {
        args: [],
        setupSql: `
          CREATE TABLE products (
            id SERIAL PRIMARY KEY,
            name TEXT,
            price NUMERIC
          );
        `,
        expected: [{ id: 1, name: "Mug", price: "9.5" }],
        verifySql: "SELECT id, name, price FROM products ORDER BY id;",
        verifyExpected: [{ id: 1, name: "Mug", price: "9.5" }],
      },
    ],
  },
  {
    id: 39,
    title: "Join and Filter",
    category: "postgresql",
    kind: "sql",
    difficulty: "medium",
    instructions:
      "Write a query that returns each customer name and matching order id for orders with a total greater than 100. Name the order id column order_id and order the rows by order id.",
    fnName: "query",
    starterCode: `-- Join customers and orders
`,
    tests: [
      {
        args: [],
        setupSql: `
          CREATE TABLE customers (id INT PRIMARY KEY, name TEXT);
          CREATE TABLE orders (
            id INT PRIMARY KEY,
            customer_id INT REFERENCES customers(id),
            total INT
          );
          INSERT INTO customers VALUES (1, 'John'), (2, 'Maria'), (3, 'Peter');
          INSERT INTO orders VALUES
            (20, 1, 90),
            (21, 2, 150),
            (22, 1, 220),
            (23, 3, 100);
        `,
        expected: [
          { name: "Maria", order_id: 21 },
          { name: "John", order_id: 22 },
        ],
      },
    ],
  },
  {
    id: 40,
    title: "Unique User Email",
    category: "prisma",
    kind: "prisma-schema",
    difficulty: "easy",
    instructions:
      "Write a Prisma schema with a User model. It must have an Int id marked @id and a String email marked @unique.",
    fnName: "schema",
    starterCode: `model User {
  // Add id and email fields
}`,
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
  },
  {
    id: 41,
    title: "User–Post 1-n",
    category: "prisma",
    kind: "prisma-schema",
    difficulty: "medium",
    instructions:
      "Write User and Post models for a one-to-many relationship. User needs posts Post[]. Post needs authorId Int and author User with @relation(fields: [authorId], references: [id]).",
    fnName: "schema",
    starterCode: `model User {
  // Add id and posts fields
}

model Post {
  // Add id, authorId, and author fields
}`,
    tests: [
      {
        args: [],
        expected: {
          enums: [],
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
        },
      },
    ],
  },
  {
    id: 42,
    title: "Role Enum",
    category: "prisma",
    kind: "prisma-schema",
    difficulty: "medium",
    instructions:
      "Write a Role enum with USER and ADMIN values, then add a User model with a role field of type Role.",
    fnName: "schema",
    starterCode: `enum Role {
  // Add USER and ADMIN
}

model User {
  // Add id and role fields
}`,
    tests: [
      {
        args: [],
        expected: {
          enums: [{ name: "Role", values: ["USER", "ADMIN"] }],
          models: [
            {
              name: "User",
              fields: [{ name: "role", type: "Role", attributes: [] }],
            },
          ],
        },
      },
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
