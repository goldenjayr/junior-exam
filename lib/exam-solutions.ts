/** Official exam solutions for tests and optional `?cheat=1` reveal. */
export const examSolutions: Record<number, string> = {
  1: `function getActiveUsers(users) { return users.filter(u => u.active); }`,
  2: `function countEmployeesByRole(es) { const c = {}; for (const e of es) c[e.role] = (c[e.role] || 0) + 1; return c; }`,
  3: `function findEmployeeById(es, id) { return es.find(e => e.id === id); }`,
  4: `function removeDuplicates(ns) { return [...new Set(ns)]; }`,
  5: `function calculateAverage(s) { return s.reduce((a, b) => a + b, 0) / s.length; }`,
  6: `function reverseString(t) { return [...t].reverse().join(""); }`,
  7: `function isPalindrome(t) { const s = t.toLowerCase(); return s === [...s].reverse().join(""); }`,
  8: `function sumEvens(ns) { return ns.filter(n => n % 2 === 0).reduce((a, b) => a + b, 0); }`,
  9: `function fizzBuzz(n) { return Array.from({length: n}, (_, i) => { const x = i + 1; return x % 15 === 0 ? "FizzBuzz" : x % 3 === 0 ? "Fizz" : x % 5 === 0 ? "Buzz" : x; }); }`,
  10: `function groupByCategory(ps) { const g = {}; for (const p of ps) (g[p.category] ||= []).push(p.name); return g; }`,
  11: `function flatten(vs) { return vs.flat(Infinity); }`,
  12: `function chunk(vs, size) { const out = []; for (let i = 0; i < vs.length; i += size) out.push(vs.slice(i, i + size)); return out; }`,
  13: `function sortByAge(es) { return [...es].sort((a, b) => a.age - b.age); }`,
  14: `function countVowels(t) { return (t.match(/[aeiou]/gi) || []).length; }`,
  15: `function longestWord(s) { return s.split(" ").reduce((a, b) => b.length > a.length ? b : a); }`,
  16: `function capitalizeWords(s) { return s.split(" ").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" "); }`,
  17: `function minMax(ns) { return { min: Math.min(...ns), max: Math.max(...ns) }; }`,
  18: `function charCount(t) { const c = {}; for (const ch of t) c[ch] = (c[ch] || 0) + 1; return c; }`,
  19: `function totalCartPrice(items) { return items.reduce((sum, i) => sum + i.price * i.quantity, 0); }`,
  20: `function mergeSorted(a, b) { return [...a, ...b].sort((x, y) => x - y); }`,
  21: `function isAnagram(a, b) { const norm = s => [...s.toLowerCase()].sort().join(""); return norm(a) === norm(b); }`,
  22: `function pluck(items, key) { return items.map(i => i[key]); }`,
  23: `function twoSum(ns, t) { const seen = new Map(); for (let i = 0; i < ns.length; i++) { const need = t - ns[i]; if (seen.has(need)) return [seen.get(need), i]; seen.set(ns[i], i); } }`,
  24: `function isBalanced(t) { const pairs = { ")": "(", "]": "[", "}": "{" }; const st = []; for (const c of t) { if ("([{".includes(c)) st.push(c); else if (c in pairs) { if (st.pop() !== pairs[c]) return false; } } return st.length === 0; }`,
  25: `function runningTotal(ns) { let sum = 0; return ns.map(n => sum += n); }`,
  26: `function fibonacci(n) { const out = []; let [a, b] = [0, 1]; for (let i = 0; i < n; i++) { out.push(a); [a, b] = [b, a + b]; } return out; }`,
  27: `function unslug(slug) { return slug.split("-").map(w => w[0].toUpperCase() + w.slice(1)).join(" "); }`,
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
  43: `function findActiveUsersArgs() { return { where: { active: true } }; }`,
  44: `function findPublishedPostsArgs() { return { where: { published: true }, include: { author: true } }; }`,
  45: `function createPostArgs() { return { data: { title: "Hi", author: { connect: { id: 1 } } } }; }`,
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
