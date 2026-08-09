export default function ReverseProxy({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 480 200"
      role="img"
      aria-hidden="true"
      className={className}
    >
      <defs>
        <marker
          id="reverse-proxy-arrow"
          markerWidth="8"
          markerHeight="8"
          refX="6"
          refY="3"
          orient="auto"
        >
          <path d="M0,0 L6,3 L0,6 Z" className="fill-foreground" />
        </marker>
      </defs>
      <rect x="24" y="70" width="100" height="60" rx="10" className="fill-card stroke-border" strokeWidth="2" />
      <text x="74" y="104" textAnchor="middle" className="fill-foreground" style={{ fontSize: 12, fontWeight: 700 }}>
        Internet
      </text>
      <line x1="124" y1="100" x2="185" y2="100" className="stroke-foreground" strokeWidth="2" markerEnd="url(#reverse-proxy-arrow)" />
      <rect x="185" y="55" width="125" height="90" rx="12" className="fill-violet-500/15 stroke-violet-500" strokeWidth="2" />
      <text x="247.5" y="96" textAnchor="middle" className="fill-foreground" style={{ fontSize: 12, fontWeight: 700 }}>
        Reverse proxy
      </text>
      <text x="247.5" y="116" textAnchor="middle" className="fill-subtle" style={{ fontSize: 10, fontWeight: 600 }}>
        routes requests
      </text>
      <line x1="310" y1="100" x2="365" y2="100" className="stroke-foreground" strokeWidth="2" markerEnd="url(#reverse-proxy-arrow)" />
      <rect x="365" y="70" width="95" height="60" rx="10" className="fill-card stroke-border" strokeWidth="2" />
      <text x="412.5" y="96" textAnchor="middle" className="fill-foreground" style={{ fontSize: 12, fontWeight: 700 }}>
        App
      </text>
      <text x="412.5" y="114" textAnchor="middle" className="fill-foreground" style={{ fontSize: 12, fontWeight: 700 }}>
        process
      </text>
    </svg>
  );
}
