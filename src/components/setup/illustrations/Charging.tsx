"use client";

import { BACK, CameraBack } from "./CameraBack";
import { IllustrationStage } from "./Stage";
import { useSvgId } from "./useSvgId";
import s from "./illustrations.module.css";

const RED = "#ff3b30";
const GREEN = "#34c759";

/**
 * Step 06 - cable into the side port, the LED by the viewfinder glows red
 * while charging and turns green when full.
 */
export function Charging({ label, paused }: { label: string; paused?: boolean }) {
  const uid = useSvgId("chg");
  const k = 0.88;
  const tx = 110;
  const ty = 150;
  const lx = tx + BACK.led.x * k;
  const ly = ty + BACK.led.y * k;
  const px = tx + BACK.w * k;
  const py = ty + BACK.portY * k;

  return (
    <IllustrationStage label={label} paused={paused}>
      <svg viewBox="0 0 1200 900" preserveAspectRatio="xMidYMid meet" aria-hidden>
        <defs>
          {[
            ["red", RED],
            ["green", GREEN],
          ].map(([name, c]) => (
            <radialGradient key={name} id={`${uid}-${name}`}>
              <stop offset="0" stopColor={c} stopOpacity="0.95" />
              <stop offset="0.3" stopColor={c} stopOpacity="0.4" />
              <stop offset="1" stopColor={c} stopOpacity="0" />
            </radialGradient>
          ))}
          <linearGradient id={`${uid}-plug`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#f4f2ed" />
            <stop offset="1" stopColor="#c9c6bf" />
          </linearGradient>
        </defs>

        {/* Cable, behind the body so it reads as going into the side */}
        <g transform={`translate(${px - 6} ${py})`}>
          <g className={s.plug}>
            <path d="M96 0C190 0 230 40 300 200" stroke="#ebe8e1" strokeWidth="16" fill="none" strokeLinecap="round" />
            <rect x="0" y="-11" width="30" height="22" rx="5" fill="#b9b9b9" />
            <rect x="24" y="-24" width="78" height="48" rx="12" fill={`url(#${uid}-plug)`} />
          </g>
        </g>

        <g transform={`translate(${tx} ${ty}) scale(${k})`}>
          <CameraBack>
            <rect x="913" y={BACK.portY - 14} width="8" height="28" rx="3" fill="#1E1A1B" />
          </CameraBack>
        </g>

        {/* LED */}
        <g className={s.ledRed}>
          <circle cx={lx} cy={ly} r="70" fill={`url(#${uid}-red)`} />
          <circle cx={lx} cy={ly} r="7" fill={RED} />
        </g>
        <g className={s.ledGreen}>
          <circle cx={lx} cy={ly} r="70" fill={`url(#${uid}-green)`} />
          <circle cx={lx} cy={ly} r="7" fill={GREEN} />
        </g>

        {/* Battery */}
        <g transform="translate(470 808)">
          <rect x="0" y="0" width="240" height="34" rx="17" fill="none" stroke="#e3e3e1" strokeOpacity="0.35" strokeWidth="3" />
          <rect x="246" y="10" width="7" height="14" rx="3" fill="#e3e3e1" fillOpacity="0.35" />
          <g className={s.battery}>
            <rect x="6" y="6" width="228" height="22" rx="11" fill={RED} className={s.batRed} />
            <rect x="6" y="6" width="228" height="22" rx="11" fill={GREEN} className={s.batGreen} />
          </g>
          <g fontFamily="var(--font-display), system-ui, sans-serif" fontSize="22" fontWeight="700" fill="#e3e3e1">
            <text x="-18" y="25" textAnchor="end" className={s.chargeWord}>
              Charging
            </text>
            <text x="-18" y="25" textAnchor="end" className={s.fullWord}>
              Full
            </text>
          </g>
        </g>
      </svg>
    </IllustrationStage>
  );
}

/** Still for one LED state: close on the viewfinder with the dot glowing. */
export function ChargeState({
  label,
  state,
}: {
  label: string;
  state: "red" | "green";
}) {
  const uid = useSvgId(`cs${state}`);
  const c = state === "red" ? RED : GREEN;
  const k = 2;
  const tx = 720 - BACK.led.x * k;
  const ty = 470 - BACK.led.y * k;

  return (
    <IllustrationStage label={label}>
      <svg viewBox="0 0 1200 900" preserveAspectRatio="xMidYMid meet" aria-hidden>
        <defs>
          <radialGradient id={`${uid}-glow`}>
            <stop offset="0" stopColor={c} stopOpacity="0.95" />
            <stop offset="0.28" stopColor={c} stopOpacity="0.4" />
            <stop offset="1" stopColor={c} stopOpacity="0" />
          </radialGradient>
        </defs>
        <g transform={`translate(${tx} ${ty}) scale(${k})`}>
          <CameraBack />
        </g>
        <g className={state === "red" ? s.softPulse : undefined}>
          <circle cx="720" cy="470" r="120" fill={`url(#${uid}-glow)`} />
          <circle cx="720" cy="470" r="17" fill={c} />
        </g>
      </svg>
    </IllustrationStage>
  );
}
