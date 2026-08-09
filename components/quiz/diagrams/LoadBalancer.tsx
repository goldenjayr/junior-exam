export default function LoadBalancer({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 480 200"
      role="img"
      aria-hidden="true"
      className={className}
    >
      <defs>
        <marker
          id="load-balancer-arrow"
          markerWidth="8"
          markerHeight="8"
          refX="6"
          refY="3"
          orient="auto"
        >
          <path d="M0,0 L6,3 L0,6 Z" className="fill-foreground" />
        </marker>
      </defs>
      <rect x="16" y="70" width="88" height="60" rx="10" className="fill-card stroke-border" strokeWidth="2" />
      <text x="60" y="105" textAnchor="middle" className="fill-foreground" style={{ fontSize: 12, fontWeight: 700 }}>
        Clients
      </text>
      <line x1="104" y1="100" x2="160" y2="100" className="stroke-foreground" strokeWidth="2" markerEnd="url(#load-balancer-arrow)" />
      <rect x="160" y="60" width="110" height="80" rx="10" className="fill-violet-500/15 stroke-violet-500" strokeWidth="2" />
      <text x="215" y="105" textAnchor="middle" className="fill-foreground" style={{ fontSize: 12, fontWeight: 700 }}>
        Load balancer
      </text>
      <line x1="270" y1="80" x2="330" y2="50" className="stroke-foreground" strokeWidth="2" markerEnd="url(#load-balancer-arrow)" />
      <line x1="270" y1="100" x2="330" y2="100" className="stroke-foreground" strokeWidth="2" markerEnd="url(#load-balancer-arrow)" />
      <line x1="270" y1="120" x2="330" y2="150" className="stroke-foreground" strokeWidth="2" markerEnd="url(#load-balancer-arrow)" />
      {[50, 100, 150].map((y, i) => (
        <g key={y}>
          <rect x="330" y={y - 22} width="120" height="44" rx="10" className="fill-card stroke-border" strokeWidth="2" />
          <text x="390" y={y + 4} textAnchor="middle" className="fill-foreground" style={{ fontSize: 12, fontWeight: 700 }}>
            {`App ${i + 1}`}
          </text>
        </g>
      ))}
    </svg>
  );
}
