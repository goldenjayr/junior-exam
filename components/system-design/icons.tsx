import type { ComponentCategory } from "@/lib/system-design/types";

const categoryColor: Record<ComponentCategory, string> = {
  client: "#38bdf8",
  edge: "#818cf8",
  compute: "#34d399",
  data: "#f472b6",
  messaging: "#fbbf24",
  storage: "#fb923c",
  observability: "#a78bfa",
  other: "#94a3b8",
};

export function categoryAccent(category: ComponentCategory): string {
  return categoryColor[category];
}

type IconProps = { className?: string; color?: string };

function Svg({
  children,
  className,
  color = "currentColor",
}: {
  children: React.ReactNode;
  className?: string;
  color?: string;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className ?? "h-5 w-5"}
      aria-hidden
    >
      {children}
    </svg>
  );
}

const icons: Record<string, (p: IconProps) => React.ReactNode> = {
  client: ({ className, color }) => (
    <Svg className={className} color={color}>
      <rect x="5" y="3" width="14" height="18" rx="2" />
      <path d="M9 17h6" />
    </Svg>
  ),
  cdn: ({ className, color }) => (
    <Svg className={className} color={color}>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" />
    </Svg>
  ),
  "load-balancer": ({ className, color }) => (
    <Svg className={className} color={color}>
      <path d="M12 3v6M12 9l-5 4M12 9l5 4M7 13v8M17 13v8M12 21v-4" />
    </Svg>
  ),
  "api-gateway": ({ className, color }) => (
    <Svg className={className} color={color}>
      <path d="M4 8h16M4 16h16M8 4v16M16 4v16" />
    </Svg>
  ),
  "auth-service": ({ className, color }) => (
    <Svg className={className} color={color}>
      <path d="M12 3l8 4v5c0 5-3.5 8-8 9-4.5-1-8-4-8-9V7l8-4z" />
      <path d="M9 12l2 2 4-4" />
    </Svg>
  ),
  "chat-service": ({ className, color }) => (
    <Svg className={className} color={color}>
      <path d="M4 5h12a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H9l-5 3v-3H4a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2z" />
    </Svg>
  ),
  "notification-service": ({ className, color }) => (
    <Svg className={className} color={color}>
      <path d="M6 9a6 6 0 1 1 12 0c0 7 3 7 3 7H3s3 0 3-7" />
      <path d="M10 20a2 2 0 0 0 4 0" />
    </Svg>
  ),
  "presence-service": ({ className, color }) => (
    <Svg className={className} color={color}>
      <circle cx="12" cy="8" r="3" />
      <path d="M5 19a7 7 0 0 1 14 0" />
      <circle cx="18" cy="7" r="2" fill={color} stroke="none" />
    </Svg>
  ),
  "feed-service": ({ className, color }) => (
    <Svg className={className} color={color}>
      <path d="M4 6h16M4 12h16M4 18h10" />
    </Svg>
  ),
  "matching-service": ({ className, color }) => (
    <Svg className={className} color={color}>
      <circle cx="8" cy="8" r="3" />
      <circle cx="16" cy="16" r="3" />
      <path d="M10.5 10.5l3 3" />
    </Svg>
  ),
  "rate-limiter": ({ className, color }) => (
    <Svg className={className} color={color}>
      <path d="M12 3v3M12 18v3M3 12h3M18 12h3" />
      <circle cx="12" cy="12" r="5" />
      <path d="M12 12l3-2" />
    </Svg>
  ),
  worker: ({ className, color }) => (
    <Svg className={className} color={color}>
      <path d="M12 2v4M12 18v4M4.9 4.9l2.8 2.8M16.3 16.3l2.8 2.8M2 12h4M18 12h4M4.9 19.1l2.8-2.8M16.3 7.7l2.8-2.8" />
      <circle cx="12" cy="12" r="3" />
    </Svg>
  ),
  "websocket-gateway": ({ className, color }) => (
    <Svg className={className} color={color}>
      <path d="M5 12h3l2-5 4 10 2-5h3" />
    </Svg>
  ),
  "message-queue": ({ className, color }) => (
    <Svg className={className} color={color}>
      <rect x="3" y="6" width="6" height="12" rx="1" />
      <rect x="9" y="6" width="6" height="12" rx="1" />
      <rect x="15" y="6" width="6" height="12" rx="1" />
    </Svg>
  ),
  cache: ({ className, color }) => (
    <Svg className={className} color={color}>
      <ellipse cx="12" cy="7" rx="7" ry="3" />
      <path d="M5 7v10c0 1.7 3.1 3 7 3s7-1.3 7-3V7" />
    </Svg>
  ),
  database: ({ className, color }) => (
    <Svg className={className} color={color}>
      <ellipse cx="12" cy="6" rx="7" ry="3" />
      <path d="M5 6v12c0 1.7 3.1 3 7 3s7-1.3 7-3V6" />
      <path d="M5 12c0 1.7 3.1 3 7 3s7-1.3 7-3" />
    </Svg>
  ),
  "object-storage": ({ className, color }) => (
    <Svg className={className} color={color}>
      <path d="M4 8l8-4 8 4v8l-8 4-8-4V8z" />
      <path d="M12 12v8M4 8l8 4 8-4" />
    </Svg>
  ),
  monitoring: ({ className, color }) => (
    <Svg className={className} color={color}>
      <path d="M3 12h3l2-6 3 12 2-8 2 4h6" />
    </Svg>
  ),
  "search-service": ({ className, color }) => (
    <Svg className={className} color={color}>
      <circle cx="11" cy="11" r="6" />
      <path d="M16 16l4 4" />
    </Svg>
  ),
  analytics: ({ className, color }) => (
    <Svg className={className} color={color}>
      <path d="M4 20V10M10 20V4M16 20v-7M22 20V8" />
    </Svg>
  ),
};

export function ComponentIcon({
  icon,
  category,
  className,
}: {
  icon: string;
  category: ComponentCategory;
  className?: string;
}) {
  const render = icons[icon] ?? icons.client;
  return <>{render({ className, color: categoryAccent(category) })}</>;
}
