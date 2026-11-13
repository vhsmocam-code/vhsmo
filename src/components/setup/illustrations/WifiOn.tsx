"use client";

import { BACK, CameraBack } from "./CameraBack";
import { arcPath, INK } from "./geometry";
import { IllustrationStage } from "./Stage";
import s from "./illustrations.module.css";

/** Step 04 - the whole back: a press on the Wi-Fi button, then it lights up. */
export function WifiOn({ label, paused }: { label: string; paused?: boolean }) {
  const k = 0.8;
  const tx = (800 - BACK.w * k) / 2;
  const ty = (800 - BACK.h * k) / 2 + 12;
  const cx = tx + BACK.wifi.x * k;
  const cy = ty + BACK.wifi.y * k;
  const r = BACK.wifi.r * k;

  return (
    <IllustrationStage label={label} paused={paused}>
      <svg viewBox="0 0 800 800" preserveAspectRatio="xMidYMid meet" aria-hidden>
        <g transform={`translate(${tx} ${ty}) scale(${k})`}>
          <CameraBack wifiClassName={s.press} />
        </g>

        {/* White light round the button */}
        <g className={s.wifiGlow}>
          <circle cx={cx} cy={cy} r={r + 9} fill="none" stroke="#fff" strokeOpacity="0.55" strokeWidth="18" />
          <circle cx={cx} cy={cy} r={r + 4} fill="none" stroke="#fff" strokeWidth="5" />
          <circle cx={cx} cy={cy} r={r + 19} fill="none" stroke={INK} strokeOpacity="0.35" strokeWidth="1.5" />
        </g>

        {/* Signal */}
        <g fill="none" stroke={INK} strokeWidth="6" strokeLinecap="round">
          <path d={arcPath(cx, cy, r + 38, 234, 306)} className={s.arc} />
          <path d={arcPath(cx, cy, r + 62, 238, 302)} className={`${s.arc} ${s.arc2}`} />
          <path d={arcPath(cx, cy, r + 86, 241, 299)} className={`${s.arc} ${s.arc3}`} />
        </g>

        {/* Fingertip */}
        <g transform={`translate(${cx} ${cy})`}>
          <g className={s.finger}>
            <ellipse rx="50" ry="57" fill="#fff" fillOpacity="0.35" stroke={INK} strokeOpacity="0.6" strokeWidth="2.5" />
          </g>
        </g>
      </svg>
    </IllustrationStage>
  );
}
