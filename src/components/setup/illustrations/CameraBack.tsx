import { useSvgId } from "./useSvgId";
import { arcPath, DARK, INK, SILVER, TONES, type Tone } from "./geometry";

/**
 * The back of the VHSMO, drawn from a photo of the real camera. Outline,
 * slot, Wi-Fi button, LED, logo and grille were measured from that photo
 * and scaled so the body is 920 wide.
 * Local units: body 920 x 671 with its top-left corner at 0,0; the shutter
 * peeks above the top edge (negative y).
 */
export const BACK = {
  w: 920,
  h: 671,
  /** Notification / charging LED, right of the viewfinder. */
  led: { x: 594, y: 105 },
  wifi: { x: 737, y: 335, r: 76 },
  slider: { x: 176, flash: 325, on: 355, off: 385 },
  /** Height of the side (USB) port, for the charging cable. */
  portY: 430,
} as const;

/** Chamfered, rounded body, traced from the photo. */
const BODY =
  "M128 3H803C828 3 842 14 858 30L898 80C912 97 918 116 920 140V540C918 560 912 576 898 592L856 634C840 652 826 664 800 669H130C104 667 92 660 76 645L32 601C18 586 8 568 0 545V140C2 118 8 100 22 84L66 36C82 18 100 6 128 3Z";

const FONT = "var(--font-display), system-ui, sans-serif";

export function CameraBack({
  tone = "pink",
  thumbAt = "on",
  thumbClassName,
  onLabelClassName,
  wifiClassName,
  shadow = true,
  children,
}: {
  tone?: Tone;
  thumbAt?: "flash" | "on" | "off";
  thumbClassName?: string;
  /** Ink highlight drawn over the ON label. */
  onLabelClassName?: string;
  wifiClassName?: string;
  /** Soft contact shadow behind the body. */
  shadow?: boolean;
  children?: React.ReactNode;
}) {
  const t = TONES[tone];
  const id = useSvgId("cb");
  const { x: wx, y: wy } = BACK.wifi;
  const label = (text: string, y: number) => (
    <g key={text}>
      <text x="235.5" y={y + 1.5} fill={t.embossDark}>
        {text}
      </text>
      <text x="234" y={y} fill={t.embossLight}>
        {text}
      </text>
    </g>
  );

  return (
    <g>
      <defs>
        <linearGradient id={`${id}-body`} x1="0.2" y1="0" x2="0.8" y2="1">
          <stop offset="0" stopColor={t.light} />
          <stop offset="0.35" stopColor={t.body} />
          <stop offset="1" stopColor={t.shade} />
        </linearGradient>
        <linearGradient id={`${id}-bevel`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity="0.7" />
          <stop offset="0.45" stopColor="#fff" stopOpacity="0" />
          <stop offset="0.6" stopColor={t.edge} stopOpacity="0" />
          <stop offset="1" stopColor={t.edge} stopOpacity="0.8" />
        </linearGradient>
        <linearGradient id={`${id}-metal`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#fbfbfc" />
          <stop offset="0.35" stopColor="#c4c4c9" />
          <stop offset="0.6" stopColor="#f1f1f3" />
          <stop offset="1" stopColor="#8f8f95" />
        </linearGradient>
        <radialGradient id={`${id}-dome`} cx="0.38" cy="0.32" r="0.8">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="0.55" stopColor="#d7d7db" />
          <stop offset="1" stopColor="#a9a9af" />
        </radialGradient>
        <linearGradient id={`${id}-glass`} x1="0" y1="0" x2="0.4" y2="1">
          <stop offset="0" stopColor="#3b3837" />
          <stop offset="1" stopColor="#161414" />
        </linearGradient>
        <filter id={`${id}-blur`} x="-20%" y="-20%" width="140%" height="150%">
          <feGaussianBlur stdDeviation="16" />
        </filter>
        <clipPath id={`${id}-clip`}>
          <path d={BODY} />
        </clipPath>
      </defs>

      {shadow && (
        <path d={BODY} transform="translate(8 26)" fill="#000" opacity="0.4" filter={`url(#${id}-blur)`} />
      )}

      {/* Shutter, peeking over the top edge */}
      <rect x="640" y="-26" width="113" height="34" rx="7" fill={`url(#${id}-metal)`} stroke={SILVER.dark} strokeWidth="2" />
      {[-19, -12, -5].map((y, i) => (
        <line key={y} x1="647" x2="746" y1={y} y2={y} stroke={i % 2 ? "#fff" : SILVER.dark} strokeOpacity="0.7" strokeWidth="2.5" />
      ))}

      {/* Body: soft gradient, directional bevel, gloss streak */}
      <path d={BODY} fill={`url(#${id}-body)`} stroke={t.edge} strokeWidth="3" />
      <g clipPath={`url(#${id}-clip)`}>
        <path d={BODY} fill="none" stroke={`url(#${id}-bevel)`} strokeWidth="16" />
        <path d="M120 14H800" stroke="#fff" strokeOpacity="0.5" strokeWidth="4" strokeLinecap="round" />
        <path d="M24 108C30 84 46 64 68 42" fill="none" stroke="#fff" strokeOpacity="0.45" strokeWidth="5" strokeLinecap="round" />
      </g>

      {/* Viewfinder: raised frame, dark window */}
      <rect x="396" y="55" width="138" height="106" rx="8" fill={t.frame} stroke={t.edge} strokeWidth="2.5" />
      <path d="M402 59H528" stroke="#fff" strokeOpacity="0.55" strokeWidth="3" strokeLinecap="round" />
      <rect x="413" y="74" width="103" height="71" rx="7" fill={`url(#${id}-glass)`} stroke="#0c0a0a" strokeWidth="2" />
      <path d="M426 82H470L452 138H426Z" fill="#fff" fillOpacity="0.07" />

      {/* LED (unlit) */}
      <circle cx={BACK.led.x} cy={BACK.led.y} r="6" fill="#8a4b3c" stroke={t.edge} strokeWidth="1.5" />
      <circle cx={BACK.led.x} cy={BACK.led.y} r="3.4" fill={DARK} />

      {/* Power slot, embossed labels, silver thumb */}
      <rect x="141" y="295" width="73" height="121" rx="36.5" fill={t.light} stroke={t.edge} strokeWidth="2.5" />
      <rect x="148" y="302" width="59" height="107" rx="29.5" fill="#E3B3A0" />
      <g fontFamily={FONT} fontWeight="700" fontSize="23">
        {label("Flash", 304)}
        {label("ON", 358)}
        {label("OFF", 409)}
      </g>
      <text
        x="234"
        y="358"
        fontFamily={FONT}
        fontWeight="800"
        fontSize="23"
        fill={INK}
        className={onLabelClassName}
        opacity={onLabelClassName ? undefined : 0}
      >
        ON
      </text>
      <g transform={`translate(${BACK.slider.x} ${BACK.slider[thumbAt]})`}>
        <g className={thumbClassName}>
          <rect x="-35" y="-29" width="70" height="58" rx="15" fill="#B9806C" />
          <rect x="-33" y="-28" width="66" height="54" rx="14" fill={`url(#${id}-metal)`} stroke={SILVER.dark} strokeWidth="1.5" />
          {[-17, -9, -1, 7, 15].map((y, i) => (
            <line key={y} x1="-27" x2="27" y1={y} y2={y} stroke={i % 2 ? "#fff" : "#8f8f95"} strokeOpacity={i % 2 ? 0.9 : 0.8} strokeWidth="3" strokeLinecap="round" />
          ))}
        </g>
      </g>

      {/* Speaker grille */}
      {[437, 465, 491].map((x) => (
        <rect key={x} x={x} y="550" width="5.5" height="41" rx="2.75" fill={DARK} />
      ))}

      {/* VHSMO mark: off-white disc, four-point star cut out */}
      <g transform="translate(791 547)">
        <circle r="52" fill="#F6ECE6" stroke="#E6D8D0" strokeWidth="1.5" />
        <path
          d="M0-37C3-14 14-3 37 0C14 3 3 14 0 37C-3 14-14 3-37 0C-14-3-3-14 0-37Z"
          fill={t.body}
        />
      </g>

      {/* Wi-Fi button */}
      <g className={wifiClassName}>
        <circle cx={wx} cy={wy} r="76" fill={`url(#${id}-metal)`} stroke={SILVER.dark} strokeWidth="2" />
        <circle cx={wx} cy={wy} r="64" fill="#7d7d83" />
        <circle cx={wx} cy={wy} r="60" fill={`url(#${id}-metal)`} />
        <circle cx={wx} cy={wy} r="52" fill={`url(#${id}-dome)`} stroke="#9a9aa0" strokeWidth="1.5" />
        {[40, 30].map((r) => (
          <circle key={r} cx={wx} cy={wy} r={r} fill="none" stroke="#fff" strokeOpacity="0.5" strokeWidth="1.2" />
        ))}
        <g fill="none" stroke="#3a3a3e" strokeWidth="5" strokeLinecap="round">
          {[10, 19, 28].map((r) => (
            <path key={r} d={arcPath(wx, wy + 12, r, 225, 315)} />
          ))}
        </g>
        <circle cx={wx} cy={wy + 12} r="4" fill="#3a3a3e" />
      </g>

      {children}
    </g>
  );
}
