export default function CacheLayers({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 480 200"
      role="img"
      aria-hidden="true"
      className={className}
    >
      <defs>
        <marker
          id="cache-layers-arrow"
          markerWidth="8"
          markerHeight="8"
          refX="6"
          refY="3"
          orient="auto"
        >
          <path d="M0,0 L6,3 L0,6 Z" className="fill-foreground" />
        </marker>
      </defs>
      <rect x="12" y="64" width="100" height="72" rx="10" className="fill-card stroke-border" strokeWidth="2" />
      <text x="62" y="96" textAnchor="middle" className="fill-foreground" style={{ fontSize: 12, fontWeight: 700 }}>
        Browser
      </text>
      <text x="62" y="116" textAnchor="middle" className="fill-subtle" style={{ fontSize: 10, fontWeight: 600 }}>
        cache
      </text>
      <line x1="112" y1="100" x2="138" y2="100" className="stroke-foreground" strokeWidth="2" markerEnd="url(#cache-layers-arrow)" />
      <rect x="138" y="64" width="78" height="72" rx="10" className="fill-violet-500/15 stroke-violet-500" strokeWidth="2" />
      <text x="177" y="104" textAnchor="middle" className="fill-foreground" style={{ fontSize: 12, fontWeight: 700 }}>
        CDN
      </text>
      <line x1="216" y1="100" x2="242" y2="100" className="stroke-foreground" strokeWidth="2" markerEnd="url(#cache-layers-arrow)" />
      <rect x="242" y="64" width="100" height="72" rx="10" className="fill-card stroke-border" strokeWidth="2" />
      <text x="292" y="96" textAnchor="middle" className="fill-foreground" style={{ fontSize: 12, fontWeight: 700 }}>
        App
      </text>
      <text x="292" y="116" textAnchor="middle" className="fill-subtle" style={{ fontSize: 10, fontWeight: 600 }}>
        cache
      </text>
      <line x1="342" y1="100" x2="384" y2="100" className="stroke-foreground" strokeWidth="2" markerEnd="url(#cache-layers-arrow)" />
      <rect x="384" y="64" width="80" height="72" rx="10" className="fill-card stroke-border" strokeWidth="2" />
      <text x="424" y="104" textAnchor="middle" className="fill-foreground" style={{ fontSize: 12, fontWeight: 700 }}>
        DB
      </text>
    </svg>
  );
}
