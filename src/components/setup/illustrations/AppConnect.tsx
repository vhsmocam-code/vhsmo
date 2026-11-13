"use client";

import { BACK, CameraBack } from "./CameraBack";
import { arcPath, INK } from "./geometry";
import { IllustrationStage } from "./Stage";
import { useSvgId } from "./useSvgId";
import s from "./illustrations.module.css";

/**
 * Step 05 - the camera (Wi-Fi on) beside a phone showing the real VHSMO
 * app Home screen, with frames travelling across.
 */
export function AppConnect({ label, paused }: { label: string; paused?: boolean }) {
  const uid = useSvgId("app");
  const k = 0.42;
  const tx = 70;
  const ty = 300;
  const wx = tx + BACK.wifi.x * k;
  const wy = ty + BACK.wifi.y * k;
  const lx = tx + BACK.led.x * k;
  const ly = ty + BACK.led.y * k;

  return (
    <IllustrationStage label={label} paused={paused}>
      <svg viewBox="0 0 1200 900" preserveAspectRatio="xMidYMid meet" aria-hidden>
        <defs>
          <clipPath id={`${uid}-screen`}>
            <rect x="800" y="130" width="280" height="630" rx="40" />
          </clipPath>
          <linearGradient id={`${uid}-tile`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#5b4f45" />
            <stop offset="1" stopColor="#fdf100" stopOpacity="0.85" />
          </linearGradient>
          <radialGradient id={`${uid}-halo`}>
            <stop offset="0" stopColor="#fff" stopOpacity="0.8" />
            <stop offset="1" stopColor="#fff" stopOpacity="0" />
          </radialGradient>
        </defs>

        <g transform={`translate(${tx} ${ty}) scale(${k})`}>
          <CameraBack />
        </g>
        {/* Camera is on, Wi-Fi is on */}
        <circle cx={lx} cy={ly} r="22" fill={`url(#${uid}-halo)`} />
        <circle cx={lx} cy={ly} r="5" fill="#fff" stroke={INK} strokeOpacity="0.5" strokeWidth="1" />
        <circle cx={wx} cy={wy} r={BACK.wifi.r * k + 2} fill="none" stroke="#fff" strokeWidth="3" />
        <circle cx={wx} cy={wy} r={BACK.wifi.r * k + 5} fill="none" stroke="#fff" strokeOpacity="0.5" strokeWidth="8" />
        <circle cx={wx} cy={wy} r={BACK.wifi.r * k + 10} fill="none" stroke={INK} strokeOpacity="0.35" strokeWidth="1" />

        {/* Signal towards the phone */}
        <g fill="none" stroke="#e3e3e1" strokeWidth="6" strokeLinecap="round">
          <path d={arcPath(wx, wy, 58, -40, 40)} className={s.pulseArc} />
          <path d={arcPath(wx, wy, 84, -36, 36)} className={`${s.pulseArc} ${s.pulseArc2}`} />
          <path d={arcPath(wx, wy, 110, -32, 32)} className={`${s.pulseArc} ${s.pulseArc3}`} />
        </g>
        <path
          d={`M${wx + 130} ${wy - 10}Q600 300 785 400`}
          fill="none"
          stroke="#fdf100"
          strokeOpacity="0.6"
          strokeWidth="3"
          strokeDasharray="10 8"
          className={s.dash}
        />

        {/* Frames on their way */}
        {[s.tile, `${s.tile} ${s.tile2}`, `${s.tile} ${s.tile3}`].map((cls) => (
          <g key={cls} transform="translate(440 425)">
            <g className={cls}>
              <rect x="-22" y="-22" width="44" height="44" rx="6" fill="#f3f0e8" />
              <rect x="-17" y="-17" width="34" height="27" rx="2" fill={`url(#${uid}-tile)`} />
            </g>
          </g>
        ))}

        {/* Phone with the real app Home screen */}
        <rect x="790" y="120" width="300" height="650" rx="50" fill="#0b0a09" stroke="#fff" strokeOpacity="0.14" strokeWidth="2" />
        <image
          href="/setup/step-05/app-5.webp"
          x="800"
          y="130"
          width="280"
          height="630"
          preserveAspectRatio="xMidYMid slice"
          clipPath={`url(#${uid}-screen)`}
        />
      </svg>
    </IllustrationStage>
  );
}
