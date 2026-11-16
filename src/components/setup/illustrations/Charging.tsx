"use client";

import type { CSSProperties } from "react";
import { CAM3D, Camera3D, centerOn, frontPoint, poseCss, project, type Pose } from "./Camera3D";
import { SceneLabel } from "./SceneLabel";
import { Stage3D } from "./Stage3D";
import { LED, LED_POINT, PORT, PORT_POINT, UsbCable, UsbPortFace } from "./UsbPort";
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
  const portAt = project(PORT_POINT, SIDE_POSE);

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
            sub={["On the side, next to the", "ON/OFF switch. The light", "beside it shows charging."]}
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
        right={<UsbPortFace led="animated" />}
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

/** Close-up of the port face for one LED state: the light beside the port. */
const MID = frontPoint(CAM3D.w, (PORT.y + LED.y) / 2, CAM3D.d / 2 - (PORT.depth + LED.depth) / 2);
const STILL_POSE: Pose = centerOn(MID, { rx: 0, ry: -72, s: 1.55, tx: 0, ty: 0 }, { x: 600, y: 450 });

export function ChargeState({
  label,
  state,
}: {
  label: string;
  state: "red" | "green";
}) {
  return (
    <Stage3D label={label}>
      <Camera3D
        rigClassName={s.staticRig}
        rigStyle={{ "--pose": poseCss(STILL_POSE) } as CSSProperties}
        right={<UsbPortFace led={state} ledClassName={state === "red" ? s.softPulse : undefined} />}
      />
    </Stage3D>
  );
}
