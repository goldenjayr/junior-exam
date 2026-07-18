import Link from "next/link";
import { problems, categories } from "@/lib/problems";

export default function Home() {
  const testCount = problems.reduce((sum, p) => sum + p.tests.length, 0);

  return (
    <main className="flex min-h-screen flex-col bg-slate-100 text-slate-900">
      <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col justify-center px-6 py-16 [&>*]:animate-fade-up">
        <p className="text-xs font-bold uppercase tracking-widest text-blue-600">
          Junior JavaScript Assessment
        </p>
        <h1 style={{ animationDelay: "80ms" }} className="mt-2 text-4xl font-bold sm:text-5xl">
          Technical interviews,
          <br />
          <span className="text-blue-600">without the setup.</span>
        </h1>
        <p style={{ animationDelay: "160ms" }} className="mt-4 max-w-xl text-lg text-slate-500">
          A self-contained coding exam for junior JavaScript candidates. Pick
          problems, send a link, and get a PDF of the results — everything
          runs in the browser.
        </p>

        <div style={{ animationDelay: "240ms" }} className="mt-10 grid gap-4 sm:grid-cols-2">
          <Link
            href="/exam"
            className="group rounded-2xl border border-slate-200 bg-white p-6 transition-all duration-200 hover:-translate-y-1 hover:border-blue-400 hover:shadow-lg hover:shadow-blue-100"
          >
            <span className="text-2xl">📝</span>
            <h2 className="mt-3 text-lg font-bold group-hover:text-blue-600">
              Take the Exam →
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              For applicants. Solve each problem in the editor and run the
              tests — submit your results as a PDF when you&apos;re done.
            </p>
          </Link>
          <Link
            href="/admin"
            className="group rounded-2xl border border-slate-200 bg-white p-6 transition-all duration-200 hover:-translate-y-1 hover:border-blue-400 hover:shadow-lg hover:shadow-blue-100"
          >
            <span className="text-2xl">🗂️</span>
            <h2 className="mt-3 text-lg font-bold group-hover:text-blue-600">
              Build an Exam →
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              For interviewers. Browse the problem bank, pick a recommended
              set or your own mix, and copy a shareable exam link.
            </p>
          </Link>
        </div>

        <dl style={{ animationDelay: "320ms" }} className="mt-10 flex flex-wrap gap-8 border-t border-slate-200 pt-6">
          {[
            [problems.length, "problems"],
            [categories.length, "categories"],
            [testCount, "test cases"],
            [3, "difficulty levels"],
          ].map(([value, label]) => (
            <div key={label}>
              <dt className="text-2xl font-bold">{value}</dt>
              <dd className="text-sm text-slate-500">{label}</dd>
            </div>
          ))}
        </dl>
      </div>
    </main>
  );
}
