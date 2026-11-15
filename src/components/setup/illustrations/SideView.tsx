import { useSvgId } from "./useSvgId";
import { SILVER, TONES, type Tone } from "./geometry";

/**
 * The VHSMO's side with the removable panel, drawn after the side shot in
 * public/buyproduct/pinkSide.webp: a screwed-down plate with two small
 * openings near the back of the body.
 *
 * CONFIRM against hardware: what sits under the panel (a memory card and
 * a reset button) comes from the video script. The exact spots are a best
 * guess until the team checks them on the camera.
 *
 * Local units: body 340 x 700, back of the camera on the left.
 */
export const SIDE = {
  w: 340,
  h: 700,
  /** The panel plate / recess. */
  panel: { x: 22, y: 120, w: 108, h: 460 },
  card: { x: 48, y: 160 },
  reset: { x: 76, y: 500 },
} as const;

const BODY =
  "M96 4H244C284 4 306 24 326 62L336 84V616L326 638C306 676 284 696 244 696H96C56 696 34 676 14 638L4 616V84L14 62C34 24 56 4 96 4Z";

export function SideCamera({
  tone = "pink",
  panelClassName,
  cardClassName,
  children,
}: {
  tone?: Tone;
  /** Class on the panel group. Its default CSS state is "slid away". */
  panelClassName?: string;
  cardClassName?: string;
  /** Drawn on top of the recess (e.g. a highlight ring). */
  children?: React.ReactNode;
}) {
  const t = TONES[tone];
  const id = useSvgId("sv");
  const { panel, card, reset } = SIDE;

  return (
    <g>
      <defs>
        <linearGradient id={`${id}-body`} x1="0.1" y1="0" x2="0.9" y2="1">
          <stop offset="0" stopColor={t.light} />
          <stop offset="0.4" stopColor={t.body} />
          <stop offset="1" stopColor={t.shade} />
        </linearGradient>
        <linearGradient id={`${id}-metal`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#fbfbfc" />
          <stop offset="0.4" stopColor="#c4c4c9" />
          <stop offset="1" stopColor="#8f8f95" />
        </linearGradient>
        <filter id={`${id}-blur`} x="-30%" y="-20%" width="160%" height="140%">
          <feGaussianBlur stdDeviation="16" />
        </filter>
        <clipPath id={`${id}-recess`}>
          <rect x={panel.x} y={panel.y} width={panel.w} height={panel.h} rx="22" />
        </clipPath>
      </defs>

      <path d={BODY} transform="translate(10 26)" fill="#000" opacity="0.4" filter={`url(#${id}-blur)`} />

      {/* Shutter button on top */}
      <rect x="150" y="-24" width="92" height="30" rx="7" fill={`url(#${id}-metal)`} stroke={SILVER.dark} strokeWidth="2" />

      {/* Body */}
      <path d={BODY} fill={`url(#${id}-body)`} stroke={t.edge} strokeWidth="3" />
      <path d="M100 14H240" stroke="#fff" strokeOpacity="0.5" strokeWidth="4" strokeLinecap="round" />

      {/* Recess under the panel: memory card and reset button */}
      <rect x={panel.x} y={panel.y} width={panel.w} height={panel.h} rx="22" fill="#2b201d" stroke={t.edge} strokeWidth="2.5" />
      <g clipPath={`url(#${id}-recess)`}>
        <rect x={panel.x} y={panel.y} width={panel.w} height="40" fill="#000" opacity="0.35" />
      </g>
      <g className={cardClassName}>
        <path
          d={`M${card.x} ${card.y}H${card.x + 38}L${card.x + 56} ${card.y + 18}V${card.y + 86}H${card.x}Z`}
          fill="#2a2f3a"
          stroke="#555d6e"
          strokeWidth="2"
        />
        <rect x={card.x + 8} y={card.y + 58} width="40" height="22" rx="2" fill="#d9b24a" />
        {[0, 1, 2, 3].map((i) => (
          <line key={i} x1={card.x + 14 + i * 9} x2={card.x + 14 + i * 9} y1={card.y + 60} y2={card.y + 78} stroke="#8a6d1f" strokeWidth="1.5" />
        ))}
        <circle cx={card.x + 14} cy={card.y + 24} r="3" fill="#6f7788" />
      </g>
      <circle cx={reset.x} cy={reset.y} r="20" fill="#14100f" />
      <circle cx={reset.x} cy={reset.y} r="13" fill={`url(#${id}-metal)`} stroke="#6f6f75" strokeWidth="1.5" />

      {children}

      {/* Panel plate with two screws and two openings */}
      <g className={panelClassName}>
        <rect x={panel.x} y={panel.y} width={panel.w} height={panel.h} rx="22" fill={t.frame} stroke={t.edge} strokeWidth="3" />
        <path d={`M${panel.x + 14} ${panel.y + 8}H${panel.x + panel.w - 14}`} stroke="#fff" strokeOpacity="0.5" strokeWidth="3" strokeLinecap="round" />
        {[panel.y + 48, panel.y + panel.h - 48].map((y) => (
          <g key={y}>
            <circle cx="76" cy={y} r="10" fill={`url(#${id}-metal)`} stroke="#6f6f75" strokeWidth="1.5" />
            <line x1="70" x2="82" y1={y - 3} y2={y + 3} stroke="#4a4a50" strokeWidth="2" strokeLinecap="round" />
          </g>
        ))}
        {[panel.y + 210, panel.y + 252].map((y) => (
          <rect key={y} x="56" y={y} width="40" height="18" rx="4" fill="#4a302a" stroke={t.edge} strokeWidth="1.5" />
        ))}
      </g>
    </g>
  );
}
