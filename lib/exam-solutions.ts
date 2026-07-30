/** Official exam solutions for tests and optional `?cheat=1` reveal. */
export const examSolutions: Record<number, string> = {
  1: `// Keep users whose active flag is true.
function getActiveUsers(users) {
  return users.filter((user) => user.active);
}`,
  2: `// Tally how many employees have each role.
function countEmployeesByRole(employees) {
  const counts = {};
  for (const employee of employees) {
    counts[employee.role] = (counts[employee.role] || 0) + 1;
  }
  return counts;
}`,
  3: `// Find the first employee with a matching id.
function findEmployeeById(employees, id) {
  return employees.find((employee) => employee.id === id);
}`,
  4: `// Drop duplicates while preserving first-seen order via Set.
function removeDuplicates(numbers) {
  return [...new Set(numbers)];
}`,
  5: `// Average = sum of scores divided by how many there are.
function calculateAverage(scores) {
  const total = scores.reduce((sum, score) => sum + score, 0);
  return total / scores.length;
}`,
  6: `// Spread into chars, reverse, then join back into a string.
function reverseString(text) {
  return [...text].reverse().join("");
}`,
  7: `// Compare the lowercased string to its reverse.
function isPalindrome(text) {
  const normalized = text.toLowerCase();
  return normalized === [...normalized].reverse().join("");
}`,
  8: `// Keep only even numbers, then add them up.
function sumEvens(numbers) {
  return numbers
    .filter((number) => number % 2 === 0)
    .reduce((sum, number) => sum + number, 0);
}`,
  9: `// For each 1..n, label Fizz / Buzz / FizzBuzz or leave the number.
function fizzBuzz(n) {
  return Array.from({ length: n }, (_, index) => {
    const value = index + 1;
    if (value % 15 === 0) return "FizzBuzz";
    if (value % 3 === 0) return "Fizz";
    if (value % 5 === 0) return "Buzz";
    return value;
  });
}`,
  10: `// Group product names under their category key.
function groupByCategory(products) {
  const groups = {};
  for (const product of products) {
    (groups[product.category] ||= []).push(product.name);
  }
  return groups;
}`,
  11: `// Flatten nested arrays to any depth.
function flatten(values) {
  return values.flat(Infinity);
}`,
  12: `// Slice the array into consecutive chunks of the given size.
function chunk(values, size) {
  const chunks = [];
  for (let index = 0; index < values.length; index += size) {
    chunks.push(values.slice(index, index + size));
  }
  return chunks;
}`,
  13: `// Sort a copy by age ascending so the input is not mutated.
function sortByAge(employees) {
  return [...employees].sort((a, b) => a.age - b.age);
}`,
  14: `// Count case-insensitive vowel matches with a regex.
function countVowels(text) {
  return (text.match(/[aeiou]/gi) || []).length;
}`,
  15: `// Among space-separated words, keep the one with the greatest length.
function longestWord(sentence) {
  return sentence
    .split(" ")
    .reduce((longest, word) => (word.length > longest.length ? word : longest));
}`,
  16: `// Uppercase the first character of each space-separated word.
function capitalizeWords(sentence) {
  return sentence
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}`,
  17: `// Return both extremes in one pass via Math.min / Math.max.
function minMax(numbers) {
  return {
    min: Math.min(...numbers),
    max: Math.max(...numbers),
  };
}`,
  18: `// Count how often each character appears.
function charCount(text) {
  const counts = {};
  for (const char of text) {
    counts[char] = (counts[char] || 0) + 1;
  }
  return counts;
}`,
  19: `// Sum price × quantity for every cart line item.
function totalCartPrice(items) {
  return items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
}`,
  20: `// Concatenate then sort numerically (simple merge for interview scope).
function mergeSorted(a, b) {
  return [...a, ...b].sort((left, right) => left - right);
}`,
  21: `// Anagrams share the same sorted lowercase character multiset.
function isAnagram(a, b) {
  const normalize = (text) => [...text.toLowerCase()].sort().join("");
  return normalize(a) === normalize(b);
}`,
  22: `// Collect one property from every item.
function pluck(items, key) {
  return items.map((item) => item[key]);
}`,
  23: `// One pass: remember each value's index and look up target - value.
function twoSum(numbers, target) {
  const seen = new Map();
  for (let index = 0; index < numbers.length; index++) {
    const need = target - numbers[index];
    if (seen.has(need)) {
      return [seen.get(need), index];
    }
    seen.set(numbers[index], index);
  }
}`,
  24: `// Stack open brackets; each closer must match the latest opener.
function isBalanced(text) {
  const pairs = { ")": "(", "]": "[", "}": "{" };
  const stack = [];

  for (const char of text) {
    if ("([{".includes(char)) {
      stack.push(char);
    } else if (char in pairs) {
      if (stack.pop() !== pairs[char]) return false;
    }
  }

  return stack.length === 0;
}`,
  25: `// Running sum: each position is the sum of all values up to there.
function runningTotal(numbers) {
  let sum = 0;
  return numbers.map((number) => (sum += number));
}`,
  26: `// Walk the Fibonacci recurrence and collect the first n values.
function fibonacci(n) {
  const sequence = [];
  let a = 0;
  let b = 1;

  for (let index = 0; index < n; index++) {
    sequence.push(a);
    [a, b] = [b, a + b];
  }

  return sequence;
}`,
  27: `// Split on hyphens, capitalize each word, then join with spaces.
function unslug(slug) {
  return slug
    .split("-")
    .map((word) => word[0].toUpperCase() + word.slice(1))
    .join(" ");
}`,
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
  43: `// findMany args: only rows where active is true.
function findActiveUsersArgs() {
  return { where: { active: true } };
}`,
  44: `// findMany args: published posts, and include each post's author.
function findPublishedPostsArgs() {
  return {
    where: { published: true },
    include: { author: true },
  };
}`,
  45: `// create args: title "Hi", connected to author id 1.
function createPostArgs() {
  return {
    data: {
      title: "Hi",
      author: { connect: { id: 1 } },
    },
  };
}`,
  46: `def get_active_users(users):
    return [u for u in users if u["active"]]
`,
  47: `def word_lengths(words):
    return [len(w) for w in words]
`,
  48: `def group_by_category(products):
    g = {}
    for p in products:
        g.setdefault(p["category"], []).append(p["name"])
    return g
`,
  49: `def is_palindrome(text):
    s = "".join(c.lower() for c in text if c.isalnum())
    return s == s[::-1]
`,
  50: `def top_n_frequencies(words, n):
    from collections import Counter
    counts = Counter(words)
    ranked = sorted(counts.items(), key=lambda kv: (-kv[1], kv[0]))
    return [[w, c] for w, c in ranked[:n]]
`,
  51: `def flatten(values):
    out = []
    for v in values:
        if isinstance(v, list):
            out.extend(flatten(v))
        else:
            out.append(v)
    return out
`,
  52: `type User = { id: number; name: string; active: boolean };

function getActiveUsers(users: User[]): User[] {
  return users.filter((user) => user.active);
}`,
  53: `function pluck<T, K extends keyof T>(items: T[], key: K): T[K][] {
  return items.map((item) => item[key]);
}`,
  54: `type ApiResult =
  | { status: "ok"; data: string }
  | { status: "error"; message: string };

function getMessage(result: ApiResult): string {
  if (result.status === "ok") return result.data;
  return result.message;
}`,
  55: `type Employee = { name: string; role: string };

function countByRole(employees: Employee[]): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const employee of employees) {
    counts[employee.role] = (counts[employee.role] ?? 0) + 1;
  }
  return counts;
}`,
  56: `function parseUserId(id: string | number): number {
  return typeof id === "number" ? id : Number(id);
}`,
  57: `type User = { id: number; name: string; email: string };

function omitEmail(users: User[]): Omit<User, "email">[] {
  return users.map(({ id, name }) => ({ id, name }));
}`,
};

export function getExamSolution(id: number): string | undefined {
  return examSolutions[id];
}
