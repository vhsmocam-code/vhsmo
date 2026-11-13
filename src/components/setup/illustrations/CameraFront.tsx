import { DARK, SILVER, TONES, type Tone } from "./geometry";

/**
 * The front of the VHSMO, flat-drawn from public/buyproduct/pinkFront.webp.
 * Local units: 985 x 752. The body spans y 38-752; the shutter sits on top
 * at the left.
 */
export const FRONT = {
  w: 985,
  h: 752,
  flash: { x: 727, y: 179 },
  lens: { x: 483, y: 480 },
} as const;

export function CameraFront({
  tone = "pink",
  shutterClassName,
  children,
}: {
  tone?: Tone;
  shutterClassName?: string;
  children?: React.ReactNode;
}) {
  const t = TONES[tone];
  const { x: lx, y: ly } = FRONT.lens;

  return (
    <g>
      {/* Shutter */}
      <g className={shutterClassName}>
        <rect x="185" y="10" width="157" height="34" rx="8" fill={SILVER.base} stroke={SILVER.dark} strokeWidth="2" />
        {[18, 25, 32].map((y, i) => (
          <line key={y} x1="193" x2="334" y1={y} y2={y} stroke={i % 2 ? SILVER.light : SILVER.dark} strokeWidth="2.5" />
        ))}
      </g>

      {/* Body */}
      <rect x="2" y="38" width="981" height="712" rx="120" fill={t.body} stroke={t.edge} strokeWidth="4" />
      <path d="M132 51H853" stroke={t.light} strokeWidth="5" strokeLinecap="round" />

      {/* Viewfinder: raised frame, white bevel, window */}
      <rect x="374" y="98" width="221" height="132" rx="6" fill={t.frame} stroke={t.edge} strokeWidth="3" />
      <rect x="392" y="112" width="185" height="102" rx="3" fill="#f7f0f0" />
      <path d="M392 214L439 182H547L577 214Z" fill="#ebe1e1" />
      <rect x="439" y="118" width="108" height="64" fill="#fff" stroke="#e6dada" strokeWidth="2" />

      {/* Flash: white ribbed pill */}
      <rect x="647" y="130" width="160" height="98" rx="49" fill="#f8f6f6" stroke="#e4dcdc" strokeWidth="2" />
      {Array.from({ length: 14 }, (_, i) => 668 + i * 9).map((x) => (
        <line key={x} x1={x} x2={x} y1="138" y2="220" stroke="#e6e0e0" strokeWidth="2" />
      ))}

      {/* Lens: black gasket, silver ring, pink disc, black lens */}
      <circle cx={lx} cy={ly} r="218" fill={DARK} />
      <circle cx={lx} cy={ly} r="200" fill={SILVER.base} stroke={SILVER.dark} strokeWidth="2" />
      <circle cx={lx} cy={ly} r="190" fill={t.lensDisc} stroke={t.edge} strokeWidth="2" />
      {[172, 156, 140].map((r) => (
        <circle key={r} cx={lx} cy={ly} r={r} fill="none" stroke={t.edge} strokeOpacity="0.45" strokeWidth="1.5" />
      ))}
      <circle cx={lx} cy={ly} r="120" fill="#141213" />
      {[96, 72, 50].map((r) => (
        <circle key={r} cx={lx} cy={ly} r={r} fill="none" stroke="#2c2829" strokeWidth="2" />
      ))}
      <circle cx={lx} cy={ly} r="10" fill="#000" />
      <circle cx={lx - 34} cy={ly - 36} r="8" fill="#fff" fillOpacity="0.22" />

      {children}
    </g>
  );
}
