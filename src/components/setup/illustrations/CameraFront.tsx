import { useSvgId } from "./useSvgId";
import { DARK, SILVER, TONES, type Tone } from "./geometry";

/**
 * The front of the VHSMO: the back's traced outline mirrored left-right
 * (front and back are the same body), with the dark viewfinder, two-lamp
 * flash and ringed lens measured from a photo of the real camera.
 * Local units: 985 x 718 with the body's top-left at 0,0; the shutter sits
 * on top at the left (negative y).
 */
export const FRONT = {
  w: 985,
  h: 718,
  flash: { x: 740, y: 108 },
  lens: { x: 492, y: 423 },
} as const;

export const FRONT_BODY =
  "M848 3.2H125.3C98.5 3.2 83.5 15 66.4 32.1L23.6 85.7C8.6 103.9 2.1 124.2 0 149.9V578.2C2.1 599.6 8.6 616.7 23.6 633.8L68.5 678.8C85.7 698.1 100.6 710.9 128.5 716.3H845.8C873.7 714.1 886.5 706.6 903.6 690.6L950.7 643.5C965.7 627.4 976.4 608.1 985 583.5V149.9C982.9 126.3 976.4 107.1 961.4 89.9L914.3 38.5C897.2 19.3 877.9 6.4 848 3.2Z";

export function CameraFront({
  tone = "pink",
  shutterClassName,
  shadow = true,
  hideShutter = false,
  children,
}: {
  tone?: Tone;
  shutterClassName?: string;
  shadow?: boolean;
  /** Skip the flat shutter art (the 3D camera builds its own). */
  hideShutter?: boolean;
  children?: React.ReactNode;
}) {
  const t = TONES[tone];
  const id = useSvgId("cf");
  const { x: lx, y: ly } = FRONT.lens;

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
        <linearGradient id={`${id}-ring`} x1="0.1" y1="0" x2="0.9" y2="1">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="0.3" stopColor="#b8b8be" />
          <stop offset="0.55" stopColor="#f5f5f6" />
          <stop offset="1" stopColor="#85858b" />
        </linearGradient>
        <radialGradient id={`${id}-lens`} cx="0.4" cy="0.35" r="0.8">
          <stop offset="0" stopColor="#3a3637" />
          <stop offset="0.6" stopColor="#171415" />
          <stop offset="1" stopColor="#0b0909" />
        </radialGradient>
        <linearGradient id={`${id}-glass`} x1="0" y1="0" x2="0.5" y2="1">
          <stop offset="0" stopColor="#3b3837" />
          <stop offset="1" stopColor="#151313" />
        </linearGradient>
        <linearGradient id={`${id}-flash`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#d3d7da" />
          <stop offset="1" stopColor="#a6adb2" />
        </linearGradient>
        <filter id={`${id}-blur`} x="-20%" y="-20%" width="140%" height="150%">
          <feGaussianBlur stdDeviation="18" />
        </filter>
        <clipPath id={`${id}-clip`}>
          <path d={FRONT_BODY} />
        </clipPath>
      </defs>

      {shadow && (
        <path d={FRONT_BODY} transform="translate(10 28)" fill="#000" opacity="0.4" filter={`url(#${id}-blur)`} />
      )}

      {/* Shutter */}
      {!hideShutter && (
      <g className={shutterClassName}>
        <rect x="179" y="-18" width="121" height="34" rx="8" fill={`url(#${id}-metal)`} stroke={SILVER.dark} strokeWidth="2" />
        {[-10, -3, 4].map((y, i) => (
          <line key={y} x1="186" x2="293" y1={y} y2={y} stroke={i % 2 ? "#fff" : SILVER.dark} strokeOpacity="0.7" strokeWidth="2.5" />
        ))}
      </g>
      )}

      {/* Body: soft gradient, directional bevel, gloss streaks */}
      <path d={FRONT_BODY} fill={`url(#${id}-body)`} stroke={t.edge} strokeWidth="3" />
      <g clipPath={`url(#${id}-clip)`}>
        <path d={FRONT_BODY} fill="none" stroke={`url(#${id}-bevel)`} strokeWidth="20" />
        <path d="M180 18H790" stroke="#fff" strokeOpacity="0.5" strokeWidth="5" strokeLinecap="round" />
        <path d="M16 146C22 122 34 104 54 78" fill="none" stroke="#fff" strokeOpacity="0.45" strokeWidth="6" strokeLinecap="round" />
      </g>

      {/* Viewfinder: raised frame, dark window with a reflection */}
      <rect x="373" y="50" width="225" height="120" rx="9" fill={t.frame} stroke={t.edge} strokeWidth="3" />
      <path d="M382 55H588" stroke="#fff" strokeOpacity="0.55" strokeWidth="3.5" strokeLinecap="round" />
      <rect x="402" y="59" width="184" height="97" rx="6" fill={`url(#${id}-glass)`} stroke="#0c0a0a" strokeWidth="2.5" />
      <rect x="446" y="74" width="108" height="53" rx="3" fill="#8b8785" fillOpacity="0.5" />
      <rect x="480" y="87" width="40" height="28" fill="#1b1819" fillOpacity="0.8" />
      <path d="M414 66H458L430 148H414Z" fill="#fff" fillOpacity="0.07" />

      {/* Flash: translucent pill with two lamps */}
      <rect x="654" y="63" width="172" height="91" rx="45" fill={`url(#${id}-flash)`} stroke="#8f979c" strokeWidth="2.5" />
      <path d="M690 70H790" stroke="#fff" strokeOpacity="0.5" strokeWidth="3" strokeLinecap="round" />
      <rect x="684" y="93" width="43" height="32" rx="3" fill="#F3EFCF" stroke="#c9c4a0" strokeWidth="1.5" />
      <rect x="753" y="93" width="44" height="32" rx="3" fill="#F3EFCF" stroke="#c9c4a0" strokeWidth="1.5" />

      {/* Lens: black gasket, silver ring, pink disc, black lens */}
      <circle cx={lx} cy={ly} r="217" fill={DARK} />
      <circle cx={lx} cy={ly} r="217" fill="none" stroke="#fff" strokeOpacity="0.08" strokeWidth="4" />
      <circle cx={lx} cy={ly} r="202" fill={`url(#${id}-ring)`} />
      <circle cx={lx} cy={ly} r="192" fill={t.lensDisc} stroke={t.edge} strokeWidth="2" />
      {[170, 156, 142].map((r) => (
        <circle key={r} cx={lx} cy={ly} r={r} fill="none" stroke={t.edge} strokeOpacity="0.4" strokeWidth="1.5" />
      ))}
      <path d={`M${lx - 150} ${ly - 100}A180 180 0 0 1 ${lx - 60} ${ly - 168}`} fill="none" stroke="#fff" strokeOpacity="0.5" strokeWidth="7" strokeLinecap="round" />
      <circle cx={lx} cy={ly} r="126" fill={`url(#${id}-lens)`} />
      {[100, 78, 54].map((r) => (
        <circle key={r} cx={lx} cy={ly} r={r} fill="none" stroke="#2f2b2c" strokeWidth="2" />
      ))}
      <circle cx={lx} cy={ly} r="13" fill="#000" />
      <circle cx={lx - 40} cy={ly - 42} r="9" fill="#fff" fillOpacity="0.2" />

      {children}
    </g>
  );
}
