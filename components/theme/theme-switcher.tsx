"use client";

import { useEffect, useId, useRef, useState } from "react";
import { useTheme } from "next-themes";

/** Geist order: system → light → dark */
const OPTIONS = [
  { value: "system", label: "System", Icon: SystemIcon },
  { value: "light", label: "Light", Icon: SunIcon },
  { value: "dark", label: "Dark", Icon: MoonIcon },
] as const;

type ThemeValue = (typeof OPTIONS)[number]["value"];

export function ThemeSwitcher({
  small = false,
  disabled = false,
}: {
  small?: boolean;
  disabled?: boolean;
}) {
  const { theme, setTheme, forcedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const groupId = useId();
  const groupRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const locked = disabled || Boolean(forcedTheme);
  const shell = small ? "h-6 gap-0.5 p-0.5" : "h-10 gap-1 p-1";

  if (!mounted) {
    return (
      <div
        className={`inline-flex rounded-full bg-switcher ring-1 ring-border ${shell} ${
          small ? "w-[4.75rem]" : "w-[13.5rem]"
        }`}
        aria-hidden
      />
    );
  }

  const active = (forcedTheme ?? theme ?? "system") as ThemeValue;
  const activeIndex = Math.max(
    0,
    OPTIONS.findIndex((o) => o.value === active),
  );

  function onKeyDown(e: React.KeyboardEvent) {
    if (locked) return;
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    e.preventDefault();
    const delta = e.key === "ArrowRight" ? 1 : -1;
    const next = (activeIndex + delta + OPTIONS.length) % OPTIONS.length;
    setTheme(OPTIONS[next].value);
    groupRef.current
      ?.querySelectorAll<HTMLButtonElement>('[role="radio"]')
      [next]?.focus();
  }

  return (
    <div
      ref={groupRef}
      role="radiogroup"
      aria-label="Color theme"
      aria-disabled={locked || undefined}
      onKeyDown={onKeyDown}
      className={`theme-switcher inline-flex items-center rounded-full bg-switcher ring-1 ring-border ${shell} ${
        locked ? "pointer-events-none opacity-50" : ""
      }`}
    >
      {OPTIONS.map(({ value, label, Icon }) => {
        const selected = active === value;
        return (
          <button
            key={value}
            type="button"
            role="radio"
            aria-checked={selected}
            aria-label={label}
            title={label}
            id={`${groupId}-${value}`}
            tabIndex={selected ? 0 : -1}
            disabled={locked}
            onClick={() => setTheme(value)}
            className={`flex items-center justify-center rounded-full outline-none transition-[background-color,box-shadow,color] duration-150 focus-visible:ring-2 focus-visible:ring-blue-500/50 ${
              small ? "size-5" : "h-8 gap-1.5 px-3 text-xs font-medium"
            } ${
              selected
                ? "bg-switcher-active text-switcher-fg-active shadow-sm ring-1 ring-border"
                : "text-switcher-fg hover:text-switcher-fg-active"
            }`}
          >
            <Icon className={small ? "size-3.5" : "size-4"} />
            {!small && <span>{label}</span>}
          </button>
        );
      })}
    </div>
  );
}

function SunIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" fill="none" className={className} aria-hidden>
      <circle cx="8" cy="8" r="2.5" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M8 1.25v1.5M8 13.25v1.5M1.25 8h1.5M13.25 8h1.5M3.05 3.05l1.06 1.06M11.89 11.89l1.06 1.06M12.95 3.05l-1.06 1.06M4.11 11.89l-1.06 1.06"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function MoonIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" fill="none" className={className} aria-hidden>
      <path
        d="M13.25 9.2A5.4 5.4 0 0 1 6.8 2.75 5.5 5.5 0 1 0 13.25 9.2Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Desktop / system — Geist IconDeviceDesktopAlternate shape */
function SystemIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" fill="none" className={className} aria-hidden>
      <rect
        x="1.75"
        y="2.75"
        width="12.5"
        height="8.5"
        rx="1.5"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path
        d="M5 13.25h6M8 11.25v2"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}
