import { arcPath, DARK, INK, SILVER, TONES, type Tone } from "./geometry";

/**
 * The back of the VHSMO, flat-drawn from public/buyproduct/pinkBack.webp.
 * Local units: the body is 920 x 660 with its top-left corner at 0,0;
 * the shutter peeks above the top edge (negative y).
 */
export const BACK = {
  w: 920,
  h: 660,
  /** Notification / charging LED, right of the viewfinder. */
  led: { x: 585, y: 109 },
  wifi: { x: 721, y: 332, r: 72 },
  slider: { x: 174, flash: 310, on: 343, off: 376 },
  /** Height of the side (USB) port, for the charging cable. */
  portY: 430,
} as const;

const BODY =
  "M100 0H820Q845 0 862 18L902 62Q920 82 920 108V552Q920 577 902 597L862 642Q845 660 820 660H100Q75 660 58 642L18 597Q0 577 0 552V108Q0 82 18 62L58 18Q75 0 100 0Z";

const FONT = "var(--font-display), system-ui, sans-serif";

export function CameraBack({
  tone = "pink",
  thumbAt = "on",
  thumbClassName,
  onLabelClassName,
  wifiClassName,
  children,
}: {
  tone?: Tone;
  thumbAt?: "flash" | "on" | "off";
  thumbClassName?: string;
  /** Ink highlight drawn over the ON label. */
  onLabelClassName?: string;
  wifiClassName?: string;
  children?: React.ReactNode;
}) {
  const t = TONES[tone];
  const { x: wx, y: wy } = BACK.wifi;
  const label = (text: string, y: number) => (
    <g key={text}>
      <text x="230.5" y={y + 1.5} fill={t.embossDark}>
        {text}
      </text>
      <text x="229" y={y} fill={t.embossLight}>
        {text}
      </text>
    </g>
  );

  return (
    <g>
      {/* Shutter, peeking over the top edge */}
      <rect x="622" y="-26" width="142" height="32" rx="7" fill={SILVER.base} stroke={SILVER.dark} strokeWidth="2" />
      {[-19, -12, -5].map((y, i) => (
        <line key={y} x1="630" x2="756" y1={y} y2={y} stroke={i % 2 ? SILVER.light : SILVER.dark} strokeWidth="2.5" />
      ))}

      {/* Body */}
      <path d={BODY} fill={t.body} stroke={t.edge} strokeWidth="4" />
      <path d="M112 11H808" stroke={t.light} strokeWidth="5" strokeLinecap="round" />

      {/* Viewfinder: raised frame, white window */}
      <rect x="383" y="57" width="134" height="101" rx="7" fill={t.frame} stroke={t.edge} strokeWidth="3" />
      <rect x="399" y="73" width="103" height="69" rx="3" fill="#fff" stroke="#eadede" strokeWidth="2" />

      {/* LED (unlit) */}
      <circle cx={BACK.led.x} cy={BACK.led.y} r="5.5" fill={DARK} />

      {/* Power slot, embossed labels, silver thumb */}
      <rect x="140" y="284" width="68" height="118" rx="34" fill="#6b5148" stroke={t.edge} strokeWidth="3" />
      <rect x="147" y="291" width="54" height="30" rx="15" fill="#4e3a33" opacity="0.55" />
      <g fontFamily={FONT} fontWeight="700" fontSize="24">
        {label("Flash", 299)}
        {label("ON", 349)}
        {label("OFF", 399)}
      </g>
      <text
        x="229"
        y="349"
        fontFamily={FONT}
        fontWeight="800"
        fontSize="24"
        fill={INK}
        className={onLabelClassName}
        opacity={onLabelClassName ? undefined : 0}
      >
        ON
      </text>
      <g transform={`translate(${BACK.slider.x} ${BACK.slider[thumbAt]})`}>
        <g className={thumbClassName}>
          <rect x="-34" y="-26" width="68" height="52" rx="14" fill={SILVER.base} stroke={SILVER.dark} strokeWidth="2" />
          {[-15, -8, -1, 6, 13].map((y, i) => (
            <line key={y} x1="-26" x2="26" y1={y} y2={y} stroke={i % 2 ? SILVER.light : SILVER.dark} strokeWidth="3" strokeLinecap="round" />
          ))}
        </g>
      </g>

      {/* Speaker grille */}
      {[430, 455, 480].map((x) => (
        <rect key={x} x={x} y="532" width="9" height="44" rx="4.5" fill={DARK} />
      ))}

      {/* Wi-Fi button */}
      <g className={wifiClassName}>
        <circle cx={wx} cy={wy} r="72" fill={SILVER.base} stroke={SILVER.dark} strokeWidth="3" />
        <circle cx={wx} cy={wy} r="61" fill="#bdbdc2" />
        <circle cx={wx} cy={wy} r="57" fill={SILVER.light} />
        {[45, 32].map((r) => (
          <circle key={r} cx={wx} cy={wy} r={r} fill="none" stroke="#d2d2d6" strokeWidth="1.5" />
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
