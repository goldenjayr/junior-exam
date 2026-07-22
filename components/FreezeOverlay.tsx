"use client";

export default function FreezeOverlay({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-900/40 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md animate-pop rounded-2xl border border-red-200 bg-white p-6 text-center shadow-2xl">
        <div className="text-3xl" aria-hidden>
          ⏱
        </div>
        <h2 className="mt-2 text-xl font-extrabold text-slate-900">
          Time&apos;s up
        </h2>
        <p className="mt-2 text-sm text-slate-500">
          Answers are locked. Enter your name and submit results.
        </p>
        <div className="mt-5">{children}</div>
      </div>
    </div>
  );
}
