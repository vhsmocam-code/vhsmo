"use client";

import type { CSSProperties } from "react";
import { BACK, CameraBack } from "./CameraBack";
import { CAM3D, Camera3D, frontPoint, poseCss, project, type Pose } from "./Camera3D";
import { SceneLabel } from "./SceneLabel";
import { IllustrationStage } from "./Stage";
import { Stage3D } from "./Stage3D";
import { useSvgId } from "./useSvgId";
import { PORT_Y, UsbCable, UsbPortFace } from "./UsbPort";
import s from "./illustrations.module.css";

const RED = "#ff3b30";
const GREEN = "#34c759";
const KODAK = "#fdf100";

/** Front view, then the camera turns to show the right (ON/OFF switch) side. */
const FRONT_POSE: Pose = { rx: 0, ry: 0, s: 0.74, tx: 0, ty: -30 };
const SIDE_POSE: Pose = { rx: 0, ry: -68, s: 0.88, tx: -110, ty: -40 };

/**
 * Step 06 - the camera turns from the front to the side with the ON/OFF
 * switch, where the charging port is. The cable plugs in and the battery
 * fills (red while charging, green when full).
 */
export function Charging({ label, paused }: { label: string; paused?: boolean }) {
  const portAt = project(frontPoint(CAM3D.w, PORT_Y), SIDE_POSE);

  return (
    <Stage3D
      label={label}
      paused={paused}
      labels={
        <>
          <SceneLabel
            w={1200}
            h={900}
            x={portAt.x + 150}
            y={portAt.y - 110}
            className={s.capSide}
            title="Charging port"
            sub={["On the side, next to", "the ON/OFF switch"]}
          />
          <SceneLabel w={1200} h={900} x={452} y={843} align="end" className={s.chargeWord} title="Charging" titleSize={26} minTitle={11} titleColor="#e3e3e1" />
          <SceneLabel w={1200} h={900} x={452} y={843} align="end" className={s.fullWord} title="Full" titleSize={26} minTitle={11} titleColor="#e3e3e1" />
        </>
      }
    >
      <Camera3D
        rigClassName={s.sideTurn}
        rigStyle={
          {
            "--poseFront": poseCss(FRONT_POSE),
            "--poseSide": poseCss(SIDE_POSE),
          } as CSSProperties
        }
        right={<UsbPortFace />}
      >
        {/* The cable lies out from the port along +x and plugs in */}
        <UsbCable animated />
      </Camera3D>

      <svg className={s.overlay} viewBox="0 0 1200 900" width="1200" height="900" aria-hidden>
        {/* Callout to the port */}
        <g className={s.capSide}>
          <circle cx={portAt.x} cy={portAt.y} r="8" fill={KODAK} />
          <path d={`M${portAt.x} ${portAt.y}L${portAt.x + 40} ${portAt.y - 142}H${portAt.x + 140}`} stroke={KODAK} strokeOpacity="0.75" strokeWidth="2.5" fill="none" strokeDasharray="4 8" />
        </g>

        {/* Battery */}
        <g transform="translate(470 826)">
          <rect x="0" y="0" width="240" height="34" rx="17" fill="none" stroke="#e3e3e1" strokeOpacity="0.35" strokeWidth="3" />
          <rect x="246" y="10" width="7" height="14" rx="3" fill="#e3e3e1" fillOpacity="0.35" />
          <g className={s.battery}>
            <rect x="6" y="6" width="228" height="22" rx="11" fill={RED} className={s.batRed} />
            <rect x="6" y="6" width="228" height="22" rx="11" fill={GREEN} className={s.batGreen} />
          </g>
        </g>
      </svg>
    </Stage3D>
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
