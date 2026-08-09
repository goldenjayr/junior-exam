export default function RequestPath({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 480 200"
      role="img"
      aria-hidden="true"
      className={className}
    >
      <defs>
        <marker
          id="request-path-arrow"
          markerWidth="8"
          markerHeight="8"
          refX="6"
          refY="3"
          orient="auto"
        >
          <path d="M0,0 L6,3 L0,6 Z" className="fill-foreground" />
        </marker>
      </defs>
      {[
        { label: "Client", x: 16, width: 78, className: "fill-card stroke-border" },
        { label: "Edge/Proxy", x: 136, width: 104, className: "fill-violet-500/15 stroke-violet-500" },
        { label: "App", x: 266, width: 78, className: "fill-card stroke-border" },
        { label: "DB", x: 386, width: 78, className: "fill-card stroke-border" },
      ].map((node) => (
        <g key={node.label}>
          <rect
            x={node.x}
            y="70"
            width={node.width}
            height="60"
            rx="10"
            className={node.className}
            strokeWidth="2"
          />
          <text
            x={node.x + node.width / 2}
            y="105"
            textAnchor="middle"
            className="fill-foreground"
            style={{ fontSize: 12, fontWeight: 700 }}
          >
            {node.label}
          </text>
        </g>
      ))}
      <line x1="94" y1="100" x2="136" y2="100" className="stroke-foreground" strokeWidth="2" markerEnd="url(#request-path-arrow)" />
      <line x1="240" y1="100" x2="266" y2="100" className="stroke-foreground" strokeWidth="2" markerEnd="url(#request-path-arrow)" />
      <line x1="344" y1="100" x2="386" y2="100" className="stroke-foreground" strokeWidth="2" markerEnd="url(#request-path-arrow)" />
    </svg>
  );
}
