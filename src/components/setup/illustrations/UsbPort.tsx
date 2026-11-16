"use client";

import { CAM3D, FACES } from "./Camera3D";
import { TONES } from "./geometry";
import { useSvgId } from "./useSvgId";
import s from "./illustrations.module.css";

/**
 * The charging / data port: an upright USB-C slot on the right face (the
 * side with the ON/OFF switch), level with the slider, centred in the
 * depth. CONFIRM against hardware: exact position is from the description.
 */
export const PORT_Y = 380;

/** The cable plane's top edge (front-view y), with the plug centred on PORT_Y. */
const PLANE_TOP = PORT_Y - 44;

/** Where the drawn cable stub ends, in front-view coordinates (z = 0). */
export const CABLE_END = { x: CAM3D.w + 350, y: PLANE_TOP + 280 } as const;

/** The slot, drawn on the right-face band (local x runs front → back). */
export function UsbPortFace() {
  const t = TONES.pink;
  const cx = FACES.band / 2;
  const cy = PORT_Y - FACES.right.y0;
  return (
    <svg width={FACES.band} height={FACES.right.y1 - FACES.right.y0} style={{ display: "block", overflow: "visible" }}>
      <rect x={cx - 20} y={cy - 42} width={40} height={84} rx={20} fill={t.frame} stroke={t.edge} strokeWidth="3" />
      <rect x={cx - 13} y={cy - 34} width={26} height={68} rx={13} fill="#1E1A1B" />
      <rect x={cx - 3} y={cy - 18} width={6} height={36} rx={2} fill="#6f6f75" />
    </svg>
  );
}

/**
 * The plug and a short cable stub, lying out from the port along +x as a
 * plane in the cube. The plug stands upright to match the slot. `animated`
 * plugs it in on the charging loop.
 */
export function UsbCable({
  animated = false,
  endRef,
}: {
  animated?: boolean;
  /** A probe at the stub's end, so a scene can measure where it lands. */
  endRef?: React.Ref<HTMLDivElement>;
}) {
  const uid = useSvgId("usbc");
  return (
    <div className={s.cablePlane} style={{ left: CAM3D.w, top: PLANE_TOP, width: 440, height: 300 }}>
      <svg width="440" height="300" style={{ display: "block", overflow: "visible" }}>
        <defs>
          <linearGradient id={`${uid}-plug`} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#f4f2ed" />
            <stop offset="1" stopColor="#c9c6bf" />
          </linearGradient>
        </defs>
        <g className={animated ? s.plug3 : undefined}>
          <path d="M112 44C200 44 300 90 350 280" stroke="#ebe8e1" strokeWidth="24" fill="none" strokeLinecap="round" />
          <rect x="-16" y="17" width="44" height="54" rx="8" fill="#b9b9b9" />
          <rect x="24" y="0" width="92" height="88" rx="18" fill={`url(#${uid}-plug)`} />
        </g>
      </svg>
      {endRef && <div ref={endRef} style={{ position: "absolute", left: 349, top: 279, width: 2, height: 2 }} />}
    </div>
  );
}
