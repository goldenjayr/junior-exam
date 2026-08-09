export default function CdnOrigin({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 480 200"
      role="img"
      aria-hidden="true"
      className={className}
    >
      <defs>
        <marker
          id="cdn-origin-arrow"
          markerWidth="8"
          markerHeight="8"
          refX="6"
          refY="3"
          orient="auto"
        >
          <path d="M0,0 L6,3 L0,6 Z" className="fill-foreground" />
        </marker>
      </defs>
      <rect x="20" y="65" width="100" height="70" rx="12" className="fill-card stroke-border" strokeWidth="2" />
      <text x="70" y="104" textAnchor="middle" className="fill-foreground" style={{ fontSize: 12, fontWeight: 700 }}>
        Users
      </text>
      <line x1="120" y1="100" x2="190" y2="100" className="stroke-foreground" strokeWidth="2" markerEnd="url(#cdn-origin-arrow)" />
      <rect x="190" y="50" width="110" height="100" rx="14" className="fill-violet-500/15 stroke-violet-500" strokeWidth="2" />
      <text x="245" y="96" textAnchor="middle" className="fill-foreground" style={{ fontSize: 12, fontWeight: 700 }}>
        CDN
      </text>
      <text x="245" y="116" textAnchor="middle" className="fill-subtle" style={{ fontSize: 10, fontWeight: 600 }}>
        cached edge
      </text>
      <line x1="300" y1="100" x2="370" y2="100" className="stroke-foreground" strokeWidth="2" markerEnd="url(#cdn-origin-arrow)" />
      <rect x="370" y="65" width="90" height="70" rx="12" className="fill-card stroke-border" strokeWidth="2" />
      <text x="415" y="104" textAnchor="middle" className="fill-foreground" style={{ fontSize: 12, fontWeight: 700 }}>
        Origin
      </text>
    </svg>
  );
}
