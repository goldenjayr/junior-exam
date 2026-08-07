"use client";

import { usePathname } from "next/navigation";
import { ThemeSwitcher } from "./theme-switcher";

/** Single app-wide theme control — footer mount, Geist placement rule. */
export function SiteFooter() {
  const pathname = usePathname();
  if (pathname === "/playground") return null;

  return (
    <footer className="mt-auto border-t border-border bg-card/60">
      <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-4 px-6 py-4">
        <p className="text-xs text-muted">Junior Technical Assessment</p>
        <ThemeSwitcher small />
      </div>
    </footer>
  );
}
