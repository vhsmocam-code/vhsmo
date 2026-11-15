"use client";

import { IllustrationStage } from "./Stage";
import { SIDE, SideCamera } from "./SideView";
import s from "./illustrations.module.css";

const FONT = "var(--font-display), system-ui, sans-serif";
const LIGHT = "#e3e3e1";
const KODAK = "#fdf100";

/**
 * Where the memory card lives: the side panel slides away, the card shows,
 * and the capacity is called out beside it.
 */
export function MemoryCard({ label, paused }: { label: string; paused?: boolean }) {
  const k = 1.05;
  const tx = 170;
  const ty = 80;
  const cx = tx + (SIDE.card.x + 56) * k;
  const cy = ty + (SIDE.card.y + 30) * k;

  return (
    <IllustrationStage label={label} paused={paused}>
      <svg viewBox="0 0 1200 900" preserveAspectRatio="xMidYMid meet" aria-hidden>
        <g transform={`translate(${tx} ${ty}) scale(${k})`}>
          <SideCamera panelClassName={s.panel} cardClassName={s.card} />
        </g>
        <path d={`M${cx + 24} ${cy}H690`} stroke={KODAK} strokeOpacity="0.7" strokeWidth="2.5" strokeDasharray="4 8" />
        <circle cx={cx + 24} cy={cy} r="5" fill={KODAK} />
        <text x="700" y={cy - 4} fontFamily={FONT} fontWeight="800" fontSize="118" fill={KODAK} letterSpacing="-3">
          2,500+
        </text>
        <text x="704" y={cy + 50} fontFamily={FONT} fontWeight="700" fontSize="38" fill={LIGHT}>
          photos, already inside
        </text>
        <text x="704" y={cy + 96} fontFamily={FONT} fontWeight="600" fontSize="28" fill={LIGHT} fillOpacity="0.6">
          Memory card included
        </text>
      </svg>
    </IllustrationStage>
  );
}

/**
 * Reset: under the same panel, press and hold the small button for about
 * four seconds until the indicator lights blink.
 */
export function ResetButton({ label, paused }: { label: string; paused?: boolean }) {
  const k = 1.05;
  const tx = 170;
  const ty = 80;
  const rx = tx + SIDE.reset.x * k;
  const ry = ty + SIDE.reset.y * k;

  return (
    <IllustrationStage label={label} paused={paused}>
      <svg viewBox="0 0 1200 900" preserveAspectRatio="xMidYMid meet" aria-hidden>
        <g transform={`translate(${tx} ${ty}) scale(${k})`}>
          <SideCamera panelClassName={s.panelOpen} />
        </g>

        {/* Hold ring around the reset button */}
        <circle cx={rx} cy={ry} r="34" fill="none" stroke={KODAK} strokeOpacity="0.25" strokeWidth="6" />
        <circle
          cx={rx}
          cy={ry}
          r="34"
          fill="none"
          stroke={KODAK}
          strokeWidth="6"
          strokeLinecap="round"
          transform={`rotate(-90 ${rx} ${ry})`}
          className={s.holdRing}
        />
        <path d={`M${rx + 44} ${ry}H690`} stroke={KODAK} strokeOpacity="0.7" strokeWidth="2.5" strokeDasharray="4 8" />

        <text x="720" y={ry - 52} fontFamily={FONT} fontWeight="800" fontSize="64" fill={KODAK}>
          Press &amp; hold
        </text>
        <text x="724" y={ry + 6} fontFamily={FONT} fontWeight="700" fontSize="38" fill={LIGHT}>
          about 4 seconds
        </text>

        {/* Indicator lights blink when the camera restarts */}
        <g className={s.blink}>
          {[0, 1].map((i) => (
            <circle key={i} cx={736 + i * 44} cy={ry + 76} r="12" fill={KODAK} />
          ))}
          <text x="814" y={ry + 86} fontFamily={FONT} fontWeight="600" fontSize="28" fill={LIGHT}>
            lights blink, then it restarts
          </text>
        </g>
      </svg>
    </IllustrationStage>
  );
}
