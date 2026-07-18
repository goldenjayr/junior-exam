"use client";
import React from "react";
import { flushSync } from "react-dom";
import { createRoot } from "react-dom/client";
import { transform } from "sucrase";
import type { Problem } from "./problems.ts";
import type { RunResult, TestResult } from "./runner.ts";

// Whitespace-insensitive so "John Maria" matches <li>John</li><li>Maria</li>.
function normalize(text: string): string {
  return text.replace(/\s+/g, "");
}

// ponytail: renders in the page with the app's own React instead of an
// isolated iframe — infinite while-loops in candidate JSX can hang the tab
// (React itself catches infinite re-render loops). Move to a sandboxed
// iframe runner if that ever bites.
export function runReactProblem(problem: Problem, code: string): RunResult {
  let Component: React.ComponentType<Record<string, unknown>>;
  try {
    const js = transform(code, { transforms: ["jsx"] }).code;
    Component = new Function(
      "React",
      `"use strict";\n${js}\nif (typeof ${problem.fnName} !== "function") throw new Error("Component ${problem.fnName} was not defined.");\nreturn ${problem.fnName};`
    )(React) as typeof Component;
  } catch (error) {
    return {
      status: "error",
      tests: [],
      error: error instanceof Error ? error.message : String(error),
    };
  }

  const tests: TestResult[] = problem.tests.map((test) => {
    const container = document.createElement("div");
    const root = createRoot(container);
    try {
      flushSync(() =>
        root.render(
          React.createElement(
            Component,
            (test.args[0] ?? {}) as Record<string, unknown>
          )
        )
      );

      if (test.clickOn && test.clicks) {
        for (let i = 0; i < test.clicks; i++) {
          const target = container.querySelector(test.clickOn);
          if (!target)
            throw new Error(`No <${test.clickOn}> element was rendered.`);
          flushSync(() =>
            target.dispatchEvent(
              new MouseEvent("click", { bubbles: true, cancelable: true })
            )
          );
        }
      }

      const actual = container.textContent ?? "";
      return {
        test,
        passed: normalize(actual) === normalize(String(test.expected)),
        actual: actual.trim() === "" ? "(nothing rendered)" : actual,
      };
    } catch (error) {
      return {
        test,
        passed: false,
        error: error instanceof Error ? error.message : String(error),
      };
    } finally {
      root.unmount();
    }
  });

  return {
    status: tests.every((t) => t.passed) ? "passed" : "failed",
    tests,
  };
}
