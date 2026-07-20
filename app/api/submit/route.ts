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

type Submission = {
  examiner?: string;
  applicantName: string;
  results: {
    title: string;
    difficulty: string;
    status: string;
    passed: number;
    total: number;
    code: string;
    error?: string;
  }[];
};

const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

export async function POST(request: Request) {
  const body = (await request.json()) as Submission;
  const to =
    EXAMINERS[body.examiner ?? ""] ?? EXAMINERS[DEFAULT_EXAMINER];

  const name = (body.applicantName || "Applicant").slice(0, 100);
  const solved = body.results.filter((r) => r.status === "passed").length;

  const html = `
    <h2>${esc(name)} — JavaScript Assessment</h2>
    <p><strong>${solved}/${body.results.length}</strong> problems solved · ${new Date().toDateString()}</p>
    ${body.results
      .map(
        (r) => `
      <h3>${esc(r.title)} (${esc(r.difficulty)}) — ${
          r.status === "passed" ? "✅" : "❌"
        } ${r.passed}/${r.total} tests</h3>
      ${r.error ? `<p style="color:#b91c1c">Error: ${esc(r.error)}</p>` : ""}
      <pre style="background:#f1f5f9;padding:12px;border-radius:8px;font-size:12px">${esc(
        r.code
      )}</pre>`
      )
      .join("")}`;

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: process.env.RESEND_FROM ?? "onboarding@resend.dev",
      to,
      subject: `Exam results: ${name} (${solved}/${body.results.length})`,
      html,
    }),
  });

  if (!res.ok) {
    console.error("Resend error:", await res.text());
    return Response.json({ ok: false }, { status: 502 });
  }
  return Response.json({ ok: true });
}
