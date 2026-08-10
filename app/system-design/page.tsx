import Link from "next/link";
import { challenges } from "@/lib/system-design/challenges";

const difficultyBadge: Record<string, string> = {
  easy: "bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-300",
  medium: "bg-purple-50 text-purple-600 dark:bg-purple-950 dark:text-purple-300",
  hard: "bg-red-50 text-red-600 dark:bg-red-950 dark:text-red-300",
};

export default function SystemDesignLobbyPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-4xl px-6 py-14">
        <p className="text-xs font-bold uppercase tracking-widest text-cyan-600 dark:text-cyan-400">
          System Design Builder
        </p>
        <h1 className="mt-2 text-3xl font-bold sm:text-4xl">
          Drag, connect, and validate architecture.
        </h1>
        <p className="mt-3 max-w-2xl text-muted">
          Pick a challenge, design on the canvas, and run the smart validator —
          hard requirements plus a soft quality score. Practice anytime, or take
          a timed challenge from your examiner.
        </p>

        <div className="mt-6 flex flex-wrap gap-3 text-sm">
          <Link
            href="/admin/system-design"
            className="rounded-xl border border-border px-3 py-2 font-semibold hover:bg-hover"
          >
            Build a challenge link →
          </Link>
          <Link href="/" className="rounded-xl px-3 py-2 text-muted hover:text-foreground">
            ← Home
          </Link>
        </div>

        <ul className="mt-10 grid gap-4 sm:grid-cols-2">
          {challenges.map((c) => (
            <li key={c.id}>
              <Link
                href={`/system-design/play?c=${c.id}&mode=practice`}
                className="group block h-full rounded-2xl border border-border bg-card p-5 transition hover:-translate-y-0.5 hover:border-cyan-500/50 hover:shadow-lg hover:shadow-cyan-500/10"
              >
                <div className="flex items-start justify-between gap-2">
                  <h2 className="text-lg font-bold group-hover:text-cyan-600 dark:group-hover:text-cyan-400">
                    {c.title}
                  </h2>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${difficultyBadge[c.difficulty]}`}
                  >
                    {c.difficulty}
                  </span>
                </div>
                <p className="mt-2 text-sm text-muted">{c.blurb}</p>
                <p className="mt-4 text-xs font-semibold text-cyan-600 dark:text-cyan-400">
                  Start practice →
                </p>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}
