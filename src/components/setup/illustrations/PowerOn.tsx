"use client";

import { BACK, CameraBack } from "./CameraBack";
import { INK } from "./geometry";
import { IllustrationStage } from "./Stage";
import s from "./illustrations.module.css";

/** Step 01 - the whole back: the slider moves from OFF up to ON. */
export function PowerOn({ label, paused }: { label: string; paused?: boolean }) {
  const k = 0.8;
  const tx = (800 - BACK.w * k) / 2;
  const ty = (800 - BACK.h * k) / 2 + 12;
  const sx = tx + BACK.slider.x * k;
  const onY = ty + BACK.slider.on * k;
  const offY = ty + BACK.slider.off * k;

  return (
    <IllustrationStage label={label} paused={paused}>
      <svg viewBox="0 0 800 800" preserveAspectRatio="xMidYMid meet" aria-hidden>
        <g transform={`translate(${tx} ${ty}) scale(${k})`}>
          <CameraBack thumbClassName={s.thumb} onLabelClassName={s.onLabel} />
        </g>
        {/* Focus ring round the switch */}
        <ellipse
          cx={sx + 42}
          cy={onY + 10}
          rx="98"
          ry="82"
          fill="none"
          stroke={INK}
          strokeOpacity="0.55"
          strokeWidth="2.5"
          strokeDasharray="7 7"
        />
        {/* Motion hint */}
        <g className={s.hint}>
          <path d={`M${sx - 50} ${offY + 22}V${onY - 14}`} stroke={INK} strokeWidth="5" strokeLinecap="round" />
          <path
            d={`M${sx - 63} ${onY - 1}L${sx - 50} ${onY - 16}L${sx - 37} ${onY - 1}`}
            stroke={INK}
            strokeWidth="5"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        </g>
      </svg>
    </IllustrationStage>
  );
}
