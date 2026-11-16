"use client";

import { CAM3D, FACES, frontPoint } from "./Camera3D";
import { useSvgId } from "./useSvgId";
import s from "./illustrations.module.css";

const RED = "#ff3b30";
const GREEN = "#34c759";

/**
 * The slider-side face, measured from a photo of the real camera: an upright
 * USB-C slot with a silver rim, the charging LED (a pinhole) beside it, and
 * two screws near the back edge. The photo was held lens-up, so the end
 * nearest the bottom of the camera carries the port (about 0.67 H from the
 * top) and the LED sits level with the slider (about 0.51 H).
 * CONFIRM against hardware which end is the top.
 */
const H = CAM3D.h;
const D = CAM3D.d;
const EDGE = 6;
/** Front-view y of each part, and its depth from the front edge. */
export const PORT = { y: Math.round(0.67 * H), depth: Math.round(0.565 * D) } as const;
export const LED = { y: Math.round(0.51 * H), depth: Math.round(0.52 * D) } as const;
const SCREWS = [
  { y: Math.round(0.78 * H), depth: Math.round(0.86 * D) },
  { y: Math.round(0.23 * H), depth: Math.round(0.75 * D) },
] as const;

/** Kept for the scenes that anchor on the port's height. */
export const PORT_Y = PORT.y;

/** The cable plane's top edge (front-view y), plug centred on the port. */
const PLANE_TOP = PORT_Y - 44;
/** Where the stub ends inside its plane, then in front-view coordinates (z = 0). */
const STUB_END = { x: 300, y: 150 } as const;
export const CABLE_END = { x: CAM3D.w + STUB_END.x, y: PLANE_TOP + STUB_END.y } as const;

/** Cube-centred points on the right face (z measured from the cube centre). */
export const LED_POINT = frontPoint(CAM3D.w, LED.y, D / 2 - LED.depth);
export const PORT_POINT = frontPoint(CAM3D.w, PORT.y, D / 2 - PORT.depth);

/**
 * The face drawing (local x runs front → back, y from the flat's top).
 * `led` lights the charging LED: red or green, or "animated" to follow the
 * charging loop (red while charging, green when full), or "off".
 */
export function UsbPortFace({
  led = "off",
  ledClassName,
}: {
  led?: "off" | "red" | "green" | "animated";
  /** Class on the static glow (e.g. a soft pulse for the red still). */
  ledClassName?: string;
}) {
  const uid = useSvgId("upf");
  const px = PORT.depth - EDGE;
  const py = PORT.y - FACES.right.y0;
  const lx = LED.depth - EDGE;
  const ly = LED.y - FACES.right.y0;

  const glow = (color: string, name: string, className?: string) => (
    <g className={className} key={name}>
      <circle cx={lx} cy={ly} r="46" fill={`url(#${uid}-${name})`} />
      <circle cx={lx} cy={ly} r="6.5" fill={color} />
    </g>
  );

  return (
    <svg width={FACES.band} height={FACES.right.y1 - FACES.right.y0} style={{ display: "block", overflow: "visible" }}>
      <defs>
        <linearGradient id={`${uid}-metal`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#fbfbfc" />
          <stop offset="0.45" stopColor="#c4c4c9" />
          <stop offset="1" stopColor="#8f8f95" />
        </linearGradient>
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
      </defs>

      {/* USB-C: silver rim, dark mouth, centre tongue */}
      <rect x={px - 27} y={py - 64} width={54} height={128} rx={27} fill={`url(#${uid}-metal)`} stroke="#6f6f75" strokeWidth="2" />
      <rect x={px - 20} y={py - 57} width={40} height={114} rx={20} fill="#1E1A1B" />
      <rect x={px - 3.5} y={py - 38} width={7} height={76} rx={2.5} fill="#4a4a50" />

      {/* Charging LED hole and its glow */}
      <circle cx={lx} cy={ly} r="7.5" fill="#2a1a1d" stroke="#c98fa3" strokeWidth="1.5" />
      {led === "red" && glow(RED, "red", ledClassName)}
      {led === "green" && glow(GREEN, "green", ledClassName)}
      {led === "animated" && (
        <>
          {glow(RED, "red", s.chgLedRed)}
          {glow(GREEN, "green", s.chgLedGreen)}
        </>
      )}

      {/* The two screws */}
      {SCREWS.map((sc) => {
        const x = sc.depth - EDGE;
        const y = Math.min(sc.y, FACES.right.y1 - 18) - FACES.right.y0;
        return (
          <g key={sc.y}>
            <circle cx={x} cy={y} r="17" fill="#d9a0b4" opacity="0.6" />
            <circle cx={x} cy={y} r="13" fill={`url(#${uid}-metal)`} stroke="#6f6f75" strokeWidth="1.5" />
            <path d={`M${x - 7} ${y - 7}L${x + 7} ${y + 7}M${x + 7} ${y - 7}L${x - 7} ${y + 7}`} stroke="#4a4a50" strokeWidth="2.5" strokeLinecap="round" />
          </g>
        );
      })}
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
    <div className={s.cablePlane} style={{ left: CAM3D.w, top: PLANE_TOP, width: 440, height: 220 }}>
      <svg width="440" height="220" style={{ display: "block", overflow: "visible" }}>
        <defs>
          <linearGradient id={`${uid}-plug`} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#f4f2ed" />
            <stop offset="1" stopColor="#c9c6bf" />
          </linearGradient>
        </defs>
        <g className={animated ? s.plug3 : undefined}>
          <path d={`M112 44C190 44 262 70 ${STUB_END.x} ${STUB_END.y}`} stroke="#ebe8e1" strokeWidth="24" fill="none" strokeLinecap="round" />
          <rect x="-16" y="17" width="44" height="54" rx="8" fill="#b9b9b9" />
          <rect x="24" y="0" width="92" height="88" rx="18" fill={`url(#${uid}-plug)`} />
        </g>
      </svg>
      {endRef && <div ref={endRef} style={{ position: "absolute", left: STUB_END.x - 1, top: STUB_END.y - 1, width: 2, height: 2 }} />}
    </div>
  );
}
