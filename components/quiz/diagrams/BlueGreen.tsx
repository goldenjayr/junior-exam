export default function BlueGreen({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 480 200"
      role="img"
      aria-hidden="true"
      className={className}
    >
      <defs>
        <marker
          id="blue-green-arrow"
          markerWidth="8"
          markerHeight="8"
          refX="6"
          refY="3"
          orient="auto"
        >
          <path d="M0,0 L6,3 L0,6 Z" className="fill-foreground" />
        </marker>
      </defs>
      <rect x="32" y="70" width="92" height="60" rx="10" className="fill-violet-500/15 stroke-violet-500" strokeWidth="2" />
      <text x="78" y="104" textAnchor="middle" className="fill-foreground" style={{ fontSize: 12, fontWeight: 700 }}>
        LB
      </text>
      <line x1="124" y1="88" x2="230" y2="58" className="stroke-foreground" strokeWidth="2" markerEnd="url(#blue-green-arrow)" />
      <line x1="124" y1="112" x2="230" y2="142" className="stroke-muted" strokeWidth="2" strokeDasharray="6 6" markerEnd="url(#blue-green-arrow)" />
      <rect x="230" y="30" width="190" height="56" rx="12" className="fill-emerald-500/15 stroke-emerald-500" strokeWidth="2" />
      <text x="325" y="63" textAnchor="middle" className="fill-foreground" style={{ fontSize: 12, fontWeight: 700 }}>
        Green (active)
      </text>
      <rect x="230" y="114" width="190" height="56" rx="12" className="fill-sky-500/15 stroke-sky-500" strokeWidth="2" />
      <text x="325" y="147" textAnchor="middle" className="fill-foreground" style={{ fontSize: 12, fontWeight: 700 }}>
        Blue (idle)
      </text>
    </svg>
  );
}
