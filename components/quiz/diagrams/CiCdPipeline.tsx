export default function CiCdPipeline({
  className,
  blankLabels = false,
}: {
  className?: string;
  blankFocus?: boolean;
  blankLabels?: boolean;
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
          id="ci-cd-pipeline-arrow"
          markerWidth="8"
          markerHeight="8"
          refX="6"
          refY="3"
          orient="auto"
        >
          <path d="M0,0 L6,3 L0,6 Z" className="fill-foreground" />
        </marker>
      </defs>
      <rect x="18" y="70" width="86" height="60" rx="10" className="fill-card stroke-border" strokeWidth="2" />
      <text x="61" y="104" textAnchor="middle" className="fill-foreground" style={{ fontSize: blankLabels ? 18 : 12, fontWeight: 700 }}>
        {blankLabels ? "1" : "Commit"}
      </text>
      <line x1="104" y1="100" x2="130" y2="100" className="stroke-foreground" strokeWidth="2" markerEnd="url(#ci-cd-pipeline-arrow)" />
      <rect x="130" y="58" width="100" height="84" rx="10" className="fill-violet-500/15 stroke-violet-500" strokeWidth="2" />
      {blankLabels ? (
        <text x="180" y="105" textAnchor="middle" className="fill-foreground" style={{ fontSize: 18, fontWeight: 700 }}>
          2
        </text>
      ) : (
        <>
          <text x="180" y="96" textAnchor="middle" className="fill-foreground" style={{ fontSize: 12, fontWeight: 700 }}>
            Build/Test
          </text>
          <text x="180" y="116" textAnchor="middle" className="fill-subtle" style={{ fontSize: 10, fontWeight: 600 }}>
            CI checks
          </text>
        </>
      )}
      <line x1="230" y1="100" x2="258" y2="100" className="stroke-foreground" strokeWidth="2" markerEnd="url(#ci-cd-pipeline-arrow)" />
      <rect x="258" y="70" width="92" height="60" rx="10" className="fill-card stroke-border" strokeWidth="2" />
      <text x="304" y="104" textAnchor="middle" className="fill-foreground" style={{ fontSize: blankLabels ? 18 : 12, fontWeight: 700 }}>
        {blankLabels ? "3" : "Artifact"}
      </text>
      <line x1="350" y1="100" x2="378" y2="100" className="stroke-foreground" strokeWidth="2" markerEnd="url(#ci-cd-pipeline-arrow)" />
      <rect x="378" y="70" width="84" height="60" rx="10" className="fill-card stroke-border" strokeWidth="2" />
      <text x="420" y="104" textAnchor="middle" className="fill-foreground" style={{ fontSize: blankLabels ? 18 : 12, fontWeight: 700 }}>
        {blankLabels ? "4" : "Deploy"}
      </text>
    </svg>
  );
}
