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
const BOTTOM_POSE: Pose = { rx: 80, ry: 0, s: 0.78, tx: -34, ty: -118 };

/**
 * Measured from a photo of the real underside (lens edge at the top): one
 * rounded cover near the left end of the base, about 0.35 of the body width
 * long and 0.32 of its depth tall, engraved left to right with a microSD
 * icon, an R and a screw at its end.
 * CONFIRM against hardware. Plane units: x from the bottom flat's left edge,
 * y from the front of the camera toward the back.
 */
const COVER = { x: 4, y: Math.round(0.56 * CAM3D.d - 6 - 47), w: 339, h: 95 } as const;
const MID_Y = COVER.y + COVER.h / 2;
const at = (f: number) => Math.round(COVER.x + COVER.w * f);
const SD = { x: at(0.25), y: MID_Y };
const RESET = { x: at(0.51), y: MID_Y };
const SCREW = { x: at(0.84), y: MID_Y };

/** A bottom-plane point as a cube-centred point. */
function bottomPoint(x: number, y: number) {
  return frontPoint(FACES.bottom.x0 + x, CAM3D.h, FACES.band / 2 - y);
}

/**
 * Good to know - reset: the camera tips from the front onto its underside,
 * the small screwed cover (SD icon, R, screw) comes off, and the memory
 * card and the reset button show. Press and hold the reset button for about
 * four seconds.
 */
export function ResetButton({ label, paused }: { label: string; paused?: boolean }) {
  const uid = useSvgId("rst");
  const t = TONES.pink;
  const resetAt = project(bottomPoint(RESET.x, RESET.y), BOTTOM_POSE);
  const cardAt = project(bottomPoint(SD.x, SD.y), BOTTOM_POSE);
  const engrave = t.embossDark;

  return (
    <Stage3D
      label={label}
      paused={paused}
      labels={
        <>
          <SceneLabel w={1200} h={900} x={cardAt.x + 24} y={cardAt.y + 190} align="end" className={s.labelsIn} title="Memory card" sub="2,500+ photos inside" titleSize={38} subSize={24} />
          <SceneLabel w={1200} h={900} x={resetAt.x - 24} y={resetAt.y + 190} className={s.labelsIn} title="Reset" sub="Press & hold about 4 s" titleSize={38} subSize={24} />
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

            {/* Recess under the cover: SD slot, reset pinhole, screw hole */}
            <rect x={COVER.x} y={COVER.y} width={COVER.w} height={COVER.h} rx="18" fill="#241a18" stroke={t.edge} strokeWidth="3" />
            <rect x={SD.x - 34} y={SD.y - 24} width="68" height="48" rx="6" fill="#14100f" />
            <path
              d={`M${SD.x - 24} ${SD.y - 18}H${SD.x + 14}L${SD.x + 24} ${SD.y - 8}V${SD.y + 18}H${SD.x - 24}Z`}
              fill="#2a2f3a"
              stroke="#555d6e"
              strokeWidth="2"
            />
            {[0, 1, 2, 3].map((i) => (
              <rect key={i} x={SD.x - 18 + i * 9} y={SD.y + 4} width="5" height="12" rx="1" fill="#d9b24a" />
            ))}
            <circle cx={RESET.x} cy={RESET.y} r="14" fill="#14100f" />
            <circle cx={RESET.x} cy={RESET.y} r="6" fill="#050404" stroke="#6f6f75" strokeWidth="1.5" />
            <circle cx={SCREW.x} cy={SCREW.y} r="10" fill="#14100f" stroke="#4a4a50" strokeWidth="2" />

            {/* Hold ring round the reset pinhole */}
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

            {/* The cover: microSD icon, R, screw at the end. Turns, then comes off */}
            <g className={s.coverOff}>
              <rect x={COVER.x} y={COVER.y} width={COVER.w} height={COVER.h} rx="18" fill={t.frame} stroke={t.edge} strokeWidth="3" />
              <path d={`M${COVER.x + 22} ${COVER.y + 8}H${COVER.x + COVER.w - 40}`} stroke="#fff" strokeOpacity="0.5" strokeWidth="3" strokeLinecap="round" />
              {/* lip at the screw end */}
              <rect x={COVER.x + COVER.w - 9} y={COVER.y + 10} width="9" height={COVER.h - 20} rx="3" fill={t.edge} />

              {/* microSD icon */}
              <g transform={`translate(${SD.x} ${SD.y})`} fill="none" stroke={engrave} strokeWidth="3" strokeLinejoin="round" strokeLinecap="round">
                <path d="M-14 -22H6L14 -14V22H-14Z" />
                <path d="M-8 -14V-6M-3 -14V-6M2 -14V-6" />
              </g>

              {/* R */}
              <g transform={`translate(${RESET.x} ${RESET.y})`} fill="none" stroke={engrave} strokeWidth="4" strokeLinejoin="round" strokeLinecap="round">
                <path d="M-9 18V-18H3A10 10 0 0 1 3 2H-9M1 2L11 18" />
              </g>

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
          {/* Memory card */}
          <circle cx={cardAt.x} cy={cardAt.y} r="7" fill={KODAK} />
          <path d={`M${cardAt.x} ${cardAt.y}L${cardAt.x - 10} ${cardAt.y + 150}`} stroke={KODAK} strokeOpacity="0.75" strokeWidth="2.5" fill="none" strokeDasharray="4 8" />
          {/* Reset */}
          <circle cx={resetAt.x} cy={resetAt.y} r="7" fill={KODAK} />
          <path d={`M${resetAt.x} ${resetAt.y}L${resetAt.x + 10} ${resetAt.y + 150}`} stroke={KODAK} strokeOpacity="0.75" strokeWidth="2.5" fill="none" strokeDasharray="4 8" />
        </g>
      </svg>
    </Stage3D>
  );
}
