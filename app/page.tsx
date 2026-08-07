import Link from "next/link";
import { problems, categories } from "@/lib/problems";
import { quizQuestions, quizTopics } from "@/lib/quiz/index";

export default function Home() {
  const testCount = problems.reduce((sum, p) => sum + p.tests.length, 0);

  return (
    <main className="flex min-h-screen flex-col bg-background text-foreground">
      <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col justify-center px-6 py-16 [&>*]:animate-fade-up">
        <p className="text-xs font-bold uppercase tracking-widest text-accent-fg">
          Junior Technical Assessment
        </p>
        <h1
          style={{ animationDelay: "80ms" }}
          className="mt-2 text-4xl font-bold sm:text-5xl"
        >
          Coding exams &amp; knowledge quizzes,
          <br />
          <span className="text-accent-fg">without the setup.</span>
        </h1>
        <p
          style={{ animationDelay: "160ms" }}
          className="mt-4 max-w-xl text-lg text-muted"
        >
          Build a coding exam or a gamified knowledge quiz, send a link, and get
          results by email — everything runs in the browser.
        </p>

        <div
          style={{ animationDelay: "240ms" }}
          className="mt-10 grid gap-4 sm:grid-cols-2"
        >
          <Link
            href="/exam"
            className="group rounded-2xl border border-border bg-card p-6 transition-all duration-200 hover:-translate-y-1 hover:border-blue-400 hover:shadow-lg hover:shadow-[var(--accent-glow)]"
          >
            <span className="text-2xl">📝</span>
            <h2 className="mt-3 text-lg font-bold group-hover:text-blue-600">
              Take the Exam →
            </h2>
            <p className="mt-1 text-sm text-muted">
              Solve coding problems in the editor, run tests, submit results as
              email.
            </p>
          </Link>
          <Link
            href="/admin"
            className="group rounded-2xl border border-border bg-card p-6 transition-all duration-200 hover:-translate-y-1 hover:border-blue-400 hover:shadow-lg hover:shadow-[var(--accent-glow)]"
          >
            <span className="text-2xl">🗂️</span>
            <h2 className="mt-3 text-lg font-bold group-hover:text-blue-600">
              Build an Exam →
            </h2>
            <p className="mt-1 text-sm text-muted">
              Pick coding problems, optional Time Attack, copy a shareable exam
              link.
            </p>
          </Link>
          <Link
            href="/quiz"
            className="group rounded-2xl border border-border bg-card p-6 transition-all duration-200 hover:-translate-y-1 hover:border-violet-400 hover:shadow-lg hover:shadow-[var(--violet-glow)]"
          >
            <span className="text-2xl">🎯</span>
            <h2 className="mt-3 text-lg font-bold group-hover:text-violet-600">
              Take a Quiz →
            </h2>
            <p className="mt-1 text-sm text-muted">
              One question at a time — multiple answer styles across JS, TypeScript,
              React, Postgres, Prisma, Python, and more.
            </p>
          </Link>
          <Link
            href="/admin/quiz"
            className="group rounded-2xl border border-border bg-card p-6 transition-all duration-200 hover:-translate-y-1 hover:border-violet-400 hover:shadow-lg hover:shadow-[var(--violet-glow)]"
          >
            <span className="text-2xl">🧩</span>
            <h2 className="mt-3 text-lg font-bold group-hover:text-violet-600">
              Build a Quiz →
            </h2>
            <p className="mt-1 text-sm text-muted">
              Browse the knowledge bank, presets, practice or assessment mode,
              and Time Attack.
            </p>
          </Link>
          <Link
            href="/random-exam"
            className="group rounded-2xl border border-border bg-card p-6 transition-all duration-200 hover:-translate-y-1 hover:border-blue-400 hover:shadow-lg hover:shadow-[var(--accent-glow)] sm:col-span-2"
          >
            <span className="text-2xl">🎲</span>
            <h2 className="mt-3 text-lg font-bold group-hover:text-blue-600">
              Random Exam →
            </h2>
            <p className="mt-1 text-sm text-muted">
              Pick language, difficulty, and count — spin for a surprise set and
              jump straight in.
            </p>
          </Link>
        </div>

        <dl
          style={{ animationDelay: "320ms" }}
          className="mt-10 flex flex-wrap gap-8 border-t border-border pt-6"
        >
          {[
            [problems.length, "coding problems"],
            [categories.length, "exam categories"],
            [testCount, "test cases"],
            [quizQuestions.length, "quiz items"],
            [quizTopics.length, "quiz topics"],
          ].map(([value, label]) => (
            <div key={label}>
              <dt className="text-2xl font-bold">{value}</dt>
              <dd className="text-sm text-muted">{label}</dd>
            </div>
          ))}
        </dl>
      </div>
    </main>
  );
}
