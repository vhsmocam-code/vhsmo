"use client";

import { BACK, CameraBack } from "./CameraBack";
import { INK } from "./geometry";
import { IllustrationStage } from "./Stage";
import { useSvgId } from "./useSvgId";
import s from "./illustrations.module.css";

/** Step 02 - the top of the back: the LED beside the viewfinder lights white. */
export function NotificationLight({ label, paused }: { label: string; paused?: boolean }) {
  const uid = useSvgId("led");
  const k = 1.3;
  const tx = 400 - 520 * k;
  const ty = 170;
  const lx = tx + BACK.led.x * k;
  const ly = ty + BACK.led.y * k;

  return (
    <IllustrationStage label={label} paused={paused}>
      <svg viewBox="0 0 800 800" preserveAspectRatio="xMidYMid meet" aria-hidden>
        <defs>
          <radialGradient id={`${uid}-halo`}>
            <stop offset="0" stopColor="#fff" stopOpacity="1" />
            <stop offset="0.3" stopColor="#fff" stopOpacity="0.75" />
            <stop offset="1" stopColor="#fff" stopOpacity="0" />
          </radialGradient>
        </defs>
        <g transform={`translate(${tx} ${ty}) scale(${k})`}>
          <CameraBack />
        </g>

        <circle cx={lx} cy={ly} r="26" fill="none" stroke={INK} strokeOpacity="0.6" strokeWidth="2.5" className={s.ripple} />
        <g className={s.ledOn}>
          <circle cx={lx} cy={ly} r="58" fill={`url(#${uid}-halo)`} />
          <circle cx={lx} cy={ly} r="9" fill="#fff" stroke={INK} strokeOpacity="0.5" strokeWidth="1.5" />
        </g>

        {/* Callout */}
        <path d={`M${lx} ${ly + 34}V${ly + 170}`} stroke={INK} strokeOpacity="0.55" strokeWidth="2" strokeDasharray="4 7" />
        <circle cx={lx} cy={ly + 170} r="4" fill={INK} />
        <text
          x={lx}
          y={ly + 212}
          textAnchor="middle"
          fontFamily="var(--font-display), system-ui, sans-serif"
          fontWeight="700"
          fontSize="28"
          fill={INK}
        >
          Notification light
        </text>
      </svg>
    </IllustrationStage>
  );
}
