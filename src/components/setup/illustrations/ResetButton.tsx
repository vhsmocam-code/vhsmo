"use client";

import type { CSSProperties } from "react";
import { CAM3D, Camera3D, FACES, frontPoint, poseCss, project, type Pose } from "./Camera3D";
import { TONES } from "./geometry";
import { SceneLabel } from "./SceneLabel";
import { Stage3D } from "./Stage3D";
import { useSvgId } from "./useSvgId";
import s from "./illustrations.module.css";

const KODAK = "#fdf100";

const FRONT_POSE: Pose = { rx: 0, ry: 0, s: 0.74, tx: 0, ty: -30 };
/** Tipped forward so the underside faces us, lens edge at the top. */
const BOTTOM_POSE: Pose = { rx: 80, ry: 0, s: 0.8, tx: -106, ty: -112 };

/**
 * CONFIRM against hardware: the cover sits toward the bottom-right of the
 * underside. Left to right under it: a screw (on the cover's left), the
 * reset button, then the SD card. Positions are from the team's
 * description, not a photo. Plane units: x from the bottom flat's left edge,
 * y from the front of the camera toward the back.
 */
const COVER = { x: 330, y: 71, w: 300, h: 92 } as const;
const MID_Y = COVER.y + COVER.h / 2;
const SCREW = { x: COVER.x + 32, y: MID_Y };
const RESET = { x: COVER.x + 132, y: MID_Y };
/** The visible end of the microSD card in its slot. */
const CARD = { x: COVER.x + 196, y: COVER.y + 18, w: 84, h: 56 };

/** A bottom-plane point as a cube-centred point. */
function bottomPoint(x: number, y: number) {
  return frontPoint(FACES.bottom.x0 + x, CAM3D.h, FACES.band / 2 - y);
}

/**
 * Good to know - reset: the camera tips from the front onto its underside,
 * the small screwed cover comes off, and the reset button (middle) and
 * memory card (right) show. Press and hold the button for about four seconds.
 */
export function ResetButton({ label, paused }: { label: string; paused?: boolean }) {
  const uid = useSvgId("rst");
  const t = TONES.pink;
  const resetAt = project(bottomPoint(RESET.x, RESET.y), BOTTOM_POSE);
  const cardAt = project(bottomPoint(CARD.x + CARD.w / 2, CARD.y + CARD.h / 2), BOTTOM_POSE);

  return (
    <Stage3D
      label={label}
      paused={paused}
      labels={
        <>
          <SceneLabel w={1200} h={900} x={resetAt.x - 30} y={resetAt.y + 190} align="end" className={s.labelsIn} title="Reset" sub="Press & hold about 4 s" titleSize={38} subSize={24} />
          <SceneLabel w={1200} h={900} x={cardAt.x + 30} y={cardAt.y + 190} className={s.labelsIn} title="Memory card" sub="2,500+ photos inside" titleSize={38} subSize={24} />
          <SceneLabel w={1200} h={900} x={540} y={846} className={s.blink} sub="Lights blink, then it restarts" subSize={26} />
        </>
      }
    >
      <Camera3D
        rigClassName={s.bottomTurn}
        rigStyle={
          {
            "--poseFront": poseCss(FRONT_POSE),
            "--poseBottom": poseCss(BOTTOM_POSE),
          } as CSSProperties
        }
        bottom={
          <svg width={FACES.bottom.x1 - FACES.bottom.x0} height={FACES.band} style={{ display: "block", overflow: "visible" }}>
            <defs>
              <linearGradient id={`${uid}-metal`} x1="0" y1="0" x2="1" y2="1">
                <stop offset="0" stopColor="#fbfbfc" />
                <stop offset="0.45" stopColor="#c4c4c9" />
                <stop offset="1" stopColor="#8f8f95" />
              </linearGradient>
            </defs>

            {/* Recess under the cover */}
            <rect x={COVER.x} y={COVER.y} width={COVER.w} height={COVER.h} rx="20" fill="#241a18" stroke={t.edge} strokeWidth="3" />
            <circle cx={SCREW.x} cy={SCREW.y} r="9" fill="#14100f" stroke="#4a4a50" strokeWidth="2" />
            <circle cx={RESET.x} cy={RESET.y} r="19" fill="#14100f" />
            <circle cx={RESET.x} cy={RESET.y} r="12" fill={`url(#${uid}-metal)`} stroke="#6f6f75" strokeWidth="2" />
            <rect x={CARD.x - 6} y={CARD.y - 6} width={CARD.w + 12} height={CARD.h + 12} rx="8" fill="#14100f" />
            <path
              d={`M${CARD.x} ${CARD.y}H${CARD.x + CARD.w - 14}L${CARD.x + CARD.w} ${CARD.y + 14}V${CARD.y + CARD.h}H${CARD.x}Z`}
              fill="#2a2f3a"
              stroke="#555d6e"
              strokeWidth="2"
            />
            {[0, 1, 2].map((i) => (
              <line key={i} x1={CARD.x + 12} x2={CARD.x + CARD.w - 18} y1={CARD.y + 16 + i * 12} y2={CARD.y + 16 + i * 12} stroke="#6f7788" strokeWidth="2" strokeLinecap="round" />
            ))}

            {/* Hold ring round the reset button */}
            <circle cx={RESET.x} cy={RESET.y} r="28" fill="none" stroke={KODAK} strokeOpacity="0.25" strokeWidth="6" />
            <circle
              cx={RESET.x}
              cy={RESET.y}
              r="28"
              fill="none"
              stroke={KODAK}
              strokeWidth="5"
              strokeLinecap="round"
              transform={`rotate(-90 ${RESET.x} ${RESET.y})`}
              className={s.holdRing}
            />

            {/* Cover with its screw on the left: turns, then comes off */}
            <g className={s.coverOff}>
              <rect x={COVER.x} y={COVER.y} width={COVER.w} height={COVER.h} rx="20" fill={t.frame} stroke={t.edge} strokeWidth="3" />
              <path d={`M${COVER.x + 24} ${COVER.y + 10}H${COVER.x + COVER.w - 24}`} stroke="#fff" strokeOpacity="0.5" strokeWidth="3" strokeLinecap="round" />
              <g className={s.screwTurn}>
                <circle cx={SCREW.x} cy={SCREW.y} r="14" fill={`url(#${uid}-metal)`} stroke="#6f6f75" strokeWidth="2" />
                <line x1={SCREW.x - 9} x2={SCREW.x + 9} y1={SCREW.y} y2={SCREW.y} stroke="#4a4a50" strokeWidth="3" strokeLinecap="round" />
                <line x1={SCREW.x} x2={SCREW.x} y1={SCREW.y - 9} y2={SCREW.y + 9} stroke="#4a4a50" strokeWidth="3" strokeLinecap="round" />
              </g>
            </g>
          </svg>
        }
      />

      <svg className={s.overlay} viewBox="0 0 1200 900" width="1200" height="900" aria-hidden>
        <g className={s.labelsIn}>
          {/* Reset */}
          <circle cx={resetAt.x} cy={resetAt.y} r="7" fill={KODAK} />
          <path d={`M${resetAt.x} ${resetAt.y}L${resetAt.x - 20} ${resetAt.y + 150}`} stroke={KODAK} strokeOpacity="0.75" strokeWidth="2.5" fill="none" strokeDasharray="4 8" />

          {/* Memory card */}
          <circle cx={cardAt.x} cy={cardAt.y} r="7" fill={KODAK} />
          <path d={`M${cardAt.x} ${cardAt.y}L${cardAt.x + 20} ${cardAt.y + 150}`} stroke={KODAK} strokeOpacity="0.75" strokeWidth="2.5" fill="none" strokeDasharray="4 8" />
        </g>

        {/* Indicator lights blink as the camera restarts */}
        <g className={s.blink}>
          {[0, 1].map((i) => (
            <circle key={i} cx={470 + i * 40} cy="846" r="11" fill={KODAK} />
          ))}
        </g>
      </svg>
    </Stage3D>
  );
}
