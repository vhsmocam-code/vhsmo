"use client";

import type { CSSProperties, ReactNode } from "react";
import { cn } from "@/lib/utils";
import { CameraFront, FRONT, FRONT_BODY } from "./CameraFront";
import { SILVER, TONES, type Tone } from "./geometry";
import s from "./illustrations.module.css";

/**
 * A small CSS-3D VHSMO for the "turn the camera" scenes.
 *
 * The body is the front silhouette (traced from the real camera) extruded
 * as a prism: a back cap and one wall per edge of the outline. The drawn front sits on the front, the shutter is a short
 * cylinder, and flat "planes" on the right and bottom faces carry the port,
 * cover, reset button and card.
 *
 * Local units (px) match the front art: W x H, depth D (about 1/6 of W).
 * Cube coordinates: x right, y down, z toward the viewer; the cube's centre
 * sits on the rig origin.
 *
 * Right-face and underside details are measured from photos of the real
 * camera. Which end of the USB face is the top is inferred from how the
 * photo was held: CONFIRM against hardware.
 */
export const CAM3D = {
  w: FRONT.w,
  h: FRONT.h,
  /** Body depth: about 0.30 of the width (the photos measure 0.32-0.34). */
  d: 296,
  perspective: 2600,
  /** Rig origin and perspective origin in the 1200 x 900 world. */
  cx: 600,
  cy: 450,
} as const;

/** The flat areas of the real body (front-view coordinates). */
export const FACES = {
  /** Right face (the ON/OFF switch side): x = W, flat between these y. */
  right: { y0: 150, y1: 583 },
  /** Bottom face: y = H, flat between these x. */
  bottom: { x0: 128, x1: 846 },
  /** Depth of the band the side details sit on (a hair inside the edges). */
  band: CAM3D.d - 12,
} as const;

export type Pose = { rx: number; ry: number; s: number; tx: number; ty: number };

/** Same function list for every pose so keyframes interpolate smoothly. */
export function poseCss(p: Pose) {
  return `translate(${p.tx}px, ${p.ty}px) scale(${p.s}) rotateX(${p.rx}deg) rotateY(${p.ry}deg)`;
}

/** Where a cube point (cube-centred coordinates) lands in the 1200 x 900 world. */
export function project(pt: { x: number; y: number; z: number }, pose: Pose) {
  const rad = (d: number) => (d * Math.PI) / 180;
  const cy = Math.cos(rad(pose.ry));
  const sy = Math.sin(rad(pose.ry));
  const cxr = Math.cos(rad(pose.rx));
  const sxr = Math.sin(rad(pose.rx));
  const x1 = pt.x * cy + pt.z * sy;
  const z1 = -pt.x * sy + pt.z * cy;
  const y2 = pt.y * cxr - z1 * sxr;
  const z2 = pt.y * sxr + z1 * cxr;
  const X = x1 * pose.s + pose.tx;
  const Y = y2 * pose.s + pose.ty;
  // CSS scale(s) is 2D: it scales x and y, not depth.
  const Z = z2;
  const f = CAM3D.perspective / (CAM3D.perspective - Z);
  return { x: Math.round((CAM3D.cx + X * f) * 100) / 100, y: Math.round((CAM3D.cy + Y * f) * 100) / 100 };
}

/** Shift a pose's translation so a cube point lands on a world target. */
export function centerOn(pt: { x: number; y: number; z: number }, pose: Pose, target: { x: number; y: number }): Pose {
  const p0 = project(pt, { ...pose, tx: 0, ty: 0 });
  const rad = (d: number) => (d * Math.PI) / 180;
  const z1 = -pt.x * Math.sin(rad(pose.ry)) + pt.z * Math.cos(rad(pose.ry));
  const z2 = pt.y * Math.sin(rad(pose.rx)) + z1 * Math.cos(rad(pose.rx));
  const f = CAM3D.perspective / (CAM3D.perspective - z2);
  return { ...pose, tx: Math.round(((target.x - p0.x) / f) * 10) / 10, ty: Math.round(((target.y - p0.y) / f) * 10) / 10 };
}

/** A point given in front-view coordinates (x, y from the top-left) and z. */
export function frontPoint(x: number, y: number, z = 0) {
  return { x: x - CAM3D.w / 2, y: y - CAM3D.h / 2, z };
}

/** Round to 2 decimals so server and browser render identical styles. */
const r2 = (v: number) => Math.round(v * 100) / 100;

const hex = (c: string) => [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16));
export function mix(a: string, b: string, t: number) {
  const A = hex(a);
  const B = hex(b);
  return `rgb(${A.map((v, i) => Math.round(v + (B[i]! - v) * t)).join(",")})`;
}

/** Flattens the body path (absolute M/H/V/L/C/Z only) into a closed polygon. */
function flattenPath(d: string, steps = 5) {
  const toks = d.match(/[MHVLCZ]|-?\d*\.?\d+/g) ?? [];
  const pts: [number, number][] = [];
  let i = 0;
  let x = 0;
  let y = 0;
  let cmd = "M";
  const num = () => parseFloat(toks[i++]!);
  while (i < toks.length) {
    if (/[MHVLCZ]/.test(toks[i]!)) cmd = toks[i++]!;
    if (cmd === "M" || cmd === "L") {
      x = num();
      y = num();
      pts.push([x, y]);
    } else if (cmd === "H") {
      x = num();
      pts.push([x, y]);
    } else if (cmd === "V") {
      y = num();
      pts.push([x, y]);
    } else if (cmd === "C") {
      const [x1, y1, x2, y2, x3, y3] = [num(), num(), num(), num(), num(), num()];
      for (let k = 1; k <= steps; k++) {
        const tt = k / steps;
        const u = 1 - tt;
        pts.push([
          u * u * u * x + 3 * u * u * tt * x1 + 3 * u * tt * tt * x2 + tt * tt * tt * x3,
          u * u * u * y + 3 * u * u * tt * y1 + 3 * u * tt * tt * y2 + tt * tt * tt * y3,
        ]);
      }
      x = x3;
      y = y3;
    } else {
      i++;
    }
  }
  return pts;
}

/**
 * The body's side walls: one plane per edge of the traced outline, standing
 * front → back. Each is shaded by how much it faces the light (top-left).
 */
const SIDE_FACES = (() => {
  const pts = flattenPath(FRONT_BODY);
  // Winding (shoelace): positive = clockwise on screen (y down).
  let area = 0;
  pts.forEach((p, i) => {
    const q = pts[(i + 1) % pts.length]!;
    area += p[0] * q[1] - q[0] * p[1];
  });
  const out = area > 0 ? 1 : -1;
  const light = [-0.45, -0.89];
  return pts.map((p, i) => {
    const q = pts[(i + 1) % pts.length]!;
    const dx = q[0] - p[0];
    const dy = q[1] - p[1];
    const len = Math.hypot(dx, dy);
    // (dy, -dx) points outward for a clockwise outline; flip otherwise.
    const nx = (out * dy) / len;
    const ny = (out * -dx) / len;
    const lit = 0.5 + 0.5 * (nx * light[0]! + ny * light[1]!);
    return {
      mx: r2((p[0] + q[0]) / 2),
      my: r2((p[1] + q[1]) / 2),
      len: r2(len),
      angle: r2((Math.atan2(dy, dx) * 180) / Math.PI),
      lit: r2(lit),
    };
  }).filter((f) => f.len > 0.5);
})();

const SHUTTER = { x: 240, r: 56, top: -32, bodyTop: 6, facets: 20 } as const;

export function Camera3D({
  tone = "pink",
  rigClassName,
  rigStyle,
  right,
  bottom,
  children,
}: {
  tone?: Tone;
  /** Class carrying the scene's turn animation (and its static pose). */
  rigClassName?: string;
  rigStyle?: CSSProperties;
  /** Content on the flat right face band. Local x runs front → back. */
  right?: ReactNode;
  /** Content on the flat underside band. Local y runs front → back. */
  bottom?: ReactNode;
  /** Extra 3D items placed in the cube (e.g. the cable plane). */
  children?: ReactNode;
}) {
  const t = TONES[tone];
  const { w, h, d } = CAM3D;
  const rightH = FACES.right.y1 - FACES.right.y0;
  const bottomW = FACES.bottom.x1 - FACES.bottom.x0;
  const band = FACES.band;

  return (
    <div
      className={s.persp}
      style={{ perspective: CAM3D.perspective, perspectiveOrigin: `${CAM3D.cx}px ${CAM3D.cy}px` }}
    >
      <div className={cn(s.rig, rigClassName)} style={rigStyle}>
        <div className={s.cube} style={{ width: w, height: h, left: -w / 2, top: -h / 2 }}>
          {/* Body: back cap plus one wall per outline edge (a smooth prism) */}
          <div
            className={s.slice}
            style={{ clipPath: `path('${FRONT_BODY}')`, background: t.shade, transform: `translateZ(${-d / 2}px)` }}
          />
          {SIDE_FACES.map((f, i) => (
            <div
              key={i}
              className={s.plane3d}
              style={{
                left: r2(f.mx - (f.len + 1.5) / 2),
                top: r2(f.my - d / 2),
                width: r2(f.len + 1.5),
                height: d,
                // Local top is the back of the body, bottom the front.
                backgroundImage: `linear-gradient(180deg, ${mix(t.shade, t.edge, 0.55)} 0%, ${mix(t.edge, t.body, f.lit * 0.75)} 9%, ${mix(t.shade, t.light, f.lit * 0.9)} 86%, ${mix(t.light, "#ffffff", 0.35 + f.lit * 0.3)} 100%)`,
                transform: `rotateZ(${f.angle}deg) rotateX(90deg)`,
              }}
            />
          ))}

          {/* Shutter: a short silver cylinder on top, centred in the depth */}
          <div className={s.plane3d}>
            {Array.from({ length: SHUTTER.facets }, (_, i) => {
              const ang = (i / SHUTTER.facets) * 360;
              const shade = r2(0.5 + 0.5 * Math.cos(((ang - 40) * Math.PI) / 180));
              const w2 = r2((2 * Math.PI * SHUTTER.r) / SHUTTER.facets + 1);
              return (
                <div
                  key={i}
                  className={s.plane3d}
                  style={{
                    left: r2(SHUTTER.x - w2 / 2),
                    top: SHUTTER.top,
                    width: w2,
                    height: SHUTTER.bodyTop - SHUTTER.top + 6,
                    background: mix("#8f8f95", "#fbfbfc", shade),
                    transform: `rotateY(${ang}deg) translateZ(${SHUTTER.r}px)`,
                  }}
                />
              );
            })}
            <div
              className={s.plane3d}
              style={{
                left: SHUTTER.x - SHUTTER.r,
                top: SHUTTER.top - SHUTTER.r,
                width: SHUTTER.r * 2,
                height: SHUTTER.r * 2,
                borderRadius: "50%",
                backgroundImage: `radial-gradient(circle at 50% 50%, #e9e9ec 0 38%, transparent 38%), repeating-radial-gradient(circle at 50% 50%, rgba(60,60,66,0.28) 0 1.5px, transparent 1.5px 4px), radial-gradient(circle at 35% 35%, #ffffff, #c4c4c9 55%, ${SILVER.dark})`,
                boxShadow: "inset 0 0 0 3px rgba(255,255,255,0.55)",
                transform: "rotateX(90deg)",
              }}
            >
              {/* The engraved camera icon on the cap */}
              <svg width={SHUTTER.r * 2} height={SHUTTER.r * 2} viewBox="0 0 112 112" style={{ display: "block" }} aria-hidden>
                <g fill="none" stroke="#6f6f75" strokeWidth="3" strokeLinejoin="round" strokeLinecap="round">
                  <rect x="30" y="40" width="52" height="36" rx="5" />
                  <path d="M42 40l4-8h20l4 8" />
                  <circle cx="56" cy="58" r="10" />
                  <circle cx="56" cy="58" r="3.5" fill="#6f6f75" />
                </g>
              </svg>
            </div>
          </div>

          {/* Drawn front */}
          <svg
            className={s.plane3d}
            width={w}
            height={h}
            viewBox={`0 0 ${w} ${h}`}
            style={{
              overflow: "visible",
              transform: `translateZ(${d / 2 + 0.6}px)`,
            }}
            aria-hidden
          >
            <CameraFront tone={tone} shadow={false} hideShutter />
          </svg>

          {/* Right face band: local x runs front (0) → back (band) */}
          {right != null && (
          <div
            className={s.plane3d}
            style={{
              left: w - band / 2,
              top: FACES.right.y0,
              width: band,
              height: rightH,
              transform: "rotateY(90deg) translateZ(2px)",
            }}
          >
            {right}
          </div>
          )}

          {/* Underside band: local x from the flat's left, y runs front (0) → back (band) */}
          {bottom != null && (
          <div
            className={s.plane3d}
            style={{
              left: FACES.bottom.x0,
              top: h - band / 2,
              width: bottomW,
              height: band,
              transform: "rotateX(90deg) translateZ(-2px) scaleY(-1)",
            }}
          >
            {bottom}
          </div>
          )}

          {children}
        </div>
      </div>
    </div>
  );
}
