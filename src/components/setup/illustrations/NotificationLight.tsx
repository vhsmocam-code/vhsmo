"use client";

import { BACK, CameraBack } from "./CameraBack";
import { INK } from "./geometry";
import { LabelFrame, SceneLabel } from "./SceneLabel";
import { IllustrationStage } from "./Stage";
import { useSvgId } from "./useSvgId";
import s from "./illustrations.module.css";

const RED = "#ff3b30";

/**
 * Step 02 - the top of the back: the LED beside the viewfinder glows red
 * while the camera starts up, then goes out. No light means it is ready.
 */
export function NotificationLight({ label, paused }: { label: string; paused?: boolean }) {
  const uid = useSvgId("led");
  const k = 1.15;
  const tx = 400 - 495 * k;
  const ty = 150;
  const lx = tx + BACK.led.x * k;
  const ly = ty + BACK.led.y * k;

  return (
    <IllustrationStage label={label} paused={paused}>
      <svg viewBox="0 0 800 800" preserveAspectRatio="xMidYMid meet" aria-hidden>
        <defs>
          <radialGradient id={`${uid}-halo`}>
            <stop offset="0" stopColor={RED} stopOpacity="0.95" />
            <stop offset="0.3" stopColor={RED} stopOpacity="0.45" />
            <stop offset="1" stopColor={RED} stopOpacity="0" />
          </radialGradient>
        </defs>
        <g transform={`translate(${tx} ${ty}) scale(${k})`}>
          <CameraBack />
        </g>

        <circle cx={lx} cy={ly} r="26" fill="none" stroke={RED} strokeOpacity="0.7" strokeWidth="2.5" className={s.ripple} />
        <g className={s.ledOn}>
          <circle cx={lx} cy={ly} r="58" fill={`url(#${uid}-halo)`} />
          <circle cx={lx} cy={ly} r="9" fill={RED} />
        </g>

        {/* Callout */}
        <path d={`M${lx} ${ly + 34}V${ly + 100}`} stroke={INK} strokeOpacity="0.55" strokeWidth="2" strokeDasharray="4 7" />
        <circle cx={lx} cy={ly + 100} r="4" fill={INK} />
      </svg>
      <LabelFrame w={800} h={800}>
        <SceneLabel w={800} h={800} x={lx} y={ly + 131} align="middle" title="Notification light" titleSize={28} minTitle={12} titleColor={INK} />
        <SceneLabel w={800} h={800} x={lx} y={ly + 166} align="middle" className={s.startTag} title="Red light = starting up" titleSize={22} minTitle={11} titleColor={RED} />
        <SceneLabel w={800} h={800} x={lx} y={ly + 166} align="middle" className={s.readyTag} title="No light = ready" titleSize={22} minTitle={11} titleColor={INK} />
      </LabelFrame>
    </IllustrationStage>
  );
}
