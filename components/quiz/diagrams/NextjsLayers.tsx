export default function NextjsLayers({
  className,
  blankFocus = false,
}: {
  className?: string;
  blankFocus?: boolean;
}) {
  return (
    <svg
      viewBox="0 0 480 200"
      role="img"
      aria-hidden="true"
      className={className}
    >
      <defs>
        <marker
          id="nextjs-layers-arrow"
          markerWidth="8"
          markerHeight="8"
          refX="6"
          refY="3"
          orient="auto"
        >
          <path d="M0,0 L6,3 L0,6 Z" className="fill-foreground" />
        </marker>
      </defs>
      <rect x="14" y="70" width="86" height="60" rx="10" className="fill-card stroke-border" strokeWidth="2" />
      <text x="57" y="104" textAnchor="middle" className="fill-foreground" style={{ fontSize: 12, fontWeight: 700 }}>
        Browser
      </text>
      <line x1="100" y1="100" x2="128" y2="100" className="stroke-foreground" strokeWidth="2" markerEnd="url(#nextjs-layers-arrow)" />
      <rect x="128" y="60" width="100" height="80" rx="10" className="fill-violet-500/15 stroke-violet-500" strokeWidth="2" />
      {blankFocus ? (
        <text x="178" y="105" textAnchor="middle" className="fill-foreground" style={{ fontSize: 18, fontWeight: 700 }}>
          ?
        </text>
      ) : (
        <>
          <text x="178" y="95" textAnchor="middle" className="fill-foreground" style={{ fontSize: 12, fontWeight: 700 }}>
            Edge
          </text>
          <text x="178" y="114" textAnchor="middle" className="fill-subtle" style={{ fontSize: 10, fontWeight: 600 }}>
            middleware
          </text>
        </>
      )}
      <line x1="228" y1="100" x2="256" y2="100" className="stroke-foreground" strokeWidth="2" markerEnd="url(#nextjs-layers-arrow)" />
      <rect x="256" y="55" width="114" height="90" rx="10" className="fill-card stroke-border" strokeWidth="2" />
      <text x="313" y="88" textAnchor="middle" className="fill-foreground" style={{ fontSize: 12, fontWeight: 700 }}>
        Server
      </text>
      <text x="313" y="108" textAnchor="middle" className="fill-subtle" style={{ fontSize: 10, fontWeight: 600 }}>
        RSC/Route
      </text>
      <line x1="370" y1="100" x2="402" y2="100" className="stroke-foreground" strokeWidth="2" markerEnd="url(#nextjs-layers-arrow)" />
      <rect x="402" y="70" width="64" height="60" rx="10" className="fill-card stroke-border" strokeWidth="2" />
      <text x="434" y="104" textAnchor="middle" className="fill-foreground" style={{ fontSize: 12, fontWeight: 700 }}>
        Data
      </text>
    </svg>
  );
}
