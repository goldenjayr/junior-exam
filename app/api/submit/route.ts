import nodemailer from "nodemailer";

// ponytail: hardcoded examiner map — move to a DB when adding one means
// more than a one-line edit.
const EXAMINERS: Record<string, string> = {
  jayr: "jayr@thorneconsultingco.com",
  jack: "jack@thorneconsultingco.com",
  iven: "iven@thorneconsultingco.com",
  andrei: "andrei@thorneconsultingco.com",
  neil: "neil@thorneconsultingco.com",
  pragya: "pragya@thorneconsultingco.com",
};
const DEFAULT_EXAMINER = "jayr";

type ExamResult = {
  title: string;
  difficulty: string;
  status: string;
  passed: number;
  total: number;
  code: string;
  error?: string;
  efficiency?: "ok" | "slow" | "na";
};

type QuizResult = {
  prompt: string;
  topic: string;
  difficulty: string;
  type: string;
  correct: boolean;
  answer: string;
  explanation?: string;
};

type SystemDesignResult = {
  challengeId: string;
  challengeTitle: string;
  difficulty: string;
  hardPassed: number;
  hardTotal: number;
  softScore: number;
  requirements: { label: string; passed: boolean }[];
  dimensions: { dimension: string; score: number }[];
  bottlenecks: string[];
  componentsUsed: string[];
  edgeCount: number;
};

type Submission = {
  kind?: "exam" | "quiz" | "system-design";
  examiner?: string;
  applicantName: string;
  timedOut?: boolean;
  timeLimitSeconds?: number;
  timeUsedSeconds?: number;
  mode?: "assessment" | "practice";
  results: ExamResult[] | QuizResult[] | SystemDesignResult[];
};

const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

function timerMetaHtml(body: Submission): string {
  if (!body.timeLimitSeconds && !body.timedOut) return "";
  const parts: string[] = [];
  if (body.timeLimitSeconds) {
    parts.push(`limit ${Math.round(body.timeLimitSeconds / 60)} min`);
  }
  if (typeof body.timeUsedSeconds === "number") {
    parts.push(`used ${Math.round(body.timeUsedSeconds / 60)} min`);
  }
  if (body.timedOut) parts.push("timed out");
  return `<p><em>Time attack: ${esc(parts.join(" · "))}</em></p>`;
}

function efficiencyLabel(efficiency?: ExamResult["efficiency"]): string {
  if (efficiency === "ok") return " · Efficiency: ok";
  if (efficiency === "slow") return " · Efficiency: needs work";
  return "";
}

function examHtml(name: string, body: Submission, results: ExamResult[]) {
  const solved = results.filter((r) => r.status === "passed").length;
  return `
    <h2>${esc(name)} — JavaScript Assessment</h2>
    <p><strong>${solved}/${results.length}</strong> problems solved · ${new Date().toDateString()}</p>
    ${timerMetaHtml(body)}
    ${results
      .map(
        (r) => `
      <h3>${esc(r.title)} (${esc(r.difficulty)}) — ${
          r.status === "passed" ? "✅" : "❌"
        } ${r.passed}/${r.total} tests${efficiencyLabel(r.efficiency)}</h3>
      ${r.error ? `<p style="color:#b91c1c">Error: ${esc(r.error)}</p>` : ""}
      <pre style="background:#f1f5f9;padding:12px;border-radius:8px;font-size:12px">${esc(
        r.code
      )}</pre>`
      )
      .join("")}`;
}

function quizHtml(name: string, body: Submission, results: QuizResult[]) {
  const correct = results.filter((r) => r.correct).length;
  const mode = body.mode ?? "assessment";
  return `
    <h2>${esc(name)} — Knowledge Quiz</h2>
    <p><strong>${correct}/${results.length}</strong> correct · mode: ${esc(
      mode
    )} · ${new Date().toDateString()}</p>
    ${timerMetaHtml(body)}
    ${results
      .map(
        (r, i) => `
      <h3>${i + 1}. ${r.correct ? "✅" : "❌"} ${esc(r.prompt.slice(0, 120))}${
          r.prompt.length > 120 ? "…" : ""
        }</h3>
      <p style="color:#64748b;font-size:13px">${esc(r.topic)} · ${esc(
          r.difficulty
        )} · ${esc(r.type)}</p>
      <p>Answer: <code>${esc(r.answer)}</code></p>
      ${
        r.explanation
          ? `<p style="color:#475569">${esc(r.explanation)}</p>`
          : ""
      }`
      )
      .join("")}`;
}

function systemDesignHtml(
  name: string,
  body: Submission,
  results: SystemDesignResult[]
) {
  const r = results[0];
  if (!r) {
    return `<h2>${esc(name)} — System Design</h2><p>No results.</p>`;
  }
  return `
    <h2>${esc(name)} — System Design Challenge</h2>
    <p><strong>${esc(r.challengeTitle)}</strong> (${esc(
      r.difficulty
    )}) · ${new Date().toDateString()}</p>
    ${timerMetaHtml(body)}
    <p>Hard requirements: <strong>${r.hardPassed}/${r.hardTotal}</strong></p>
    <p>Soft score: <strong>${r.softScore}</strong> / 100</p>
    <h3>Requirements</h3>
    <ul>
      ${r.requirements
        .map(
          (req) =>
            `<li>${req.passed ? "✅" : "❌"} ${esc(req.label)}</li>`
        )
        .join("")}
    </ul>
    <h3>Quality dimensions</h3>
    <ul>
      ${r.dimensions
        .map(
          (d) =>
            `<li>${esc(d.dimension)}: ${Math.round(d.score * 100)}%</li>`
        )
        .join("")}
    </ul>
    ${
      r.bottlenecks?.length
        ? `<h3>Bottlenecks</h3><ul>${r.bottlenecks
            .map((b) => `<li>${esc(b)}</li>`)
            .join("")}</ul>`
        : ""
    }
    <p style="color:#64748b;font-size:13px">Components: ${esc(
      (r.componentsUsed ?? []).join(", ")
    )} · Edges: ${r.edgeCount ?? 0}</p>`;
}

export async function POST(request: Request) {
  const body = (await request.json()) as Submission;
  const to =
    EXAMINERS[body.examiner ?? ""] ?? EXAMINERS[DEFAULT_EXAMINER];

  const name = (body.applicantName || "Applicant").slice(0, 100);
  const kind =
    body.kind === "quiz"
      ? "quiz"
      : body.kind === "system-design"
        ? "system-design"
        : "exam";

  let html: string;
  let subject: string;

  if (kind === "quiz") {
    const results = body.results as QuizResult[];
    const correct = results.filter((r) => r.correct).length;
    html = quizHtml(name, body, results);
    subject = `Quiz results: ${name} (${correct}/${results.length})`;
  } else if (kind === "system-design") {
    const results = body.results as SystemDesignResult[];
    const r = results[0];
    html = systemDesignHtml(name, body, results);
    subject = `System design: ${name} (${r?.challengeTitle ?? "challenge"} · ${r?.softScore ?? 0} pts)`;
  } else {
    const results = body.results as ExamResult[];
    const solved = results.filter((r) => r.status === "passed").length;
    html = examHtml(name, body, results);
    subject = `Exam results: ${name} (${solved}/${results.length})`;
  }

  const transport = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  });

  try {
    await transport.sendMail({
      from: process.env.GMAIL_USER,
      to,
      subject,
      html,
    });
  } catch (err) {
    console.error("Gmail send error:", err);
    return Response.json({ ok: false }, { status: 502 });
  }
  return Response.json({ ok: true });
}
