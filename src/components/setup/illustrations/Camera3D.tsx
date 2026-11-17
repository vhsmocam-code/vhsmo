"use client";

import { useContext, type CSSProperties, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { CameraFront, FRONT, FRONT_BODY } from "./CameraFront";
import { SILVER, TONES, type Tone } from "./geometry";
import { Detail3D } from "./Stage3D";
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
  /** Body depth: 0.25 of the width. */
  d: 246,
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
function sideFaces(steps: number) {
  const pts = flattenPath(FRONT_BODY, steps);
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
}
const SIDE_FACES = sideFaces(5);
/** Phones: fewer steps round the corners; the same shape at that size. */
const SIDE_FACES_LITE = sideFaces(3);


/**
 * The lens stands out of the front as stepped rings, like the real one:
 * a black gasket, a silver trim ring, then the tall pink shield. The black
 * lens sits recessed inside the shield's opening, not bulging past it.
 * Radii match the flat art in CameraFront; z values are heights above the
 * front face.
 */
const LENS = {
  x: FRONT.lens.x,
  y: FRONT.lens.y,
  gasket: { r: 217, z0: 0, z1: 8 },
  trim: { r: 202, z0: 8, z1: 30 },
  /** The pink shield: the outermost part, open in the middle. */
  housing: { r: 192, z0: 30, z1: 96 },
  /** The black lens, almost level with the shield, just inside its opening. */
  opening: { r: 126 },
  glass: { z: 90 },
} as const;
/** Light from the top-left, as for the body walls. */
const LIGHT = [-0.45, -0.89] as const;

/** One cylinder wall around the lens axis: facets from z0 to z1 above the face. */
function LensWall({
  r,
  z0,
  z1,
  facets,
  face,
  color,
  inward = false,
}: {
  r: number;
  z0: number;
  z1: number;
  facets: number;
  /** z of the front face in cube coordinates. */
  face: number;
  color: (lit: number) => string;
  /** Face the inside (for the wall around the recessed glass). */
  inward?: boolean;
}) {
  const h = z1 - z0;
  const wf = r2((2 * Math.PI * r) / facets + 1.2);
  return (
    <>
      {Array.from({ length: facets }, (_, i) => {
        const th = (i / facets) * 2 * Math.PI;
        const cx = LENS.x + r * Math.cos(th);
        const cy = LENS.y + r * Math.sin(th);
        const n = inward ? -1 : 1;
        const lit = 0.5 + 0.5 * n * (Math.cos(th) * LIGHT[0] + Math.sin(th) * LIGHT[1]);
        const rot = (th * 180) / Math.PI + (inward ? -90 : 90);
        return (
          <div
            key={i}
            className={s.plane3d}
            style={{
              left: r2(cx - wf / 2),
              top: r2(cy - h / 2),
              width: wf,
              height: h,
              background: color(lit),
              backfaceVisibility: "hidden",
              transform: `translateZ(${r2(face + (z0 + z1) / 2)}px) rotateZ(${r2(rot)}deg) rotateX(90deg)`,
            }}
          />
        );
      })}
    </>
  );
}

/** A flat disc (cap) facing the viewer, `z` above the front face. */
function LensCap({ r, z, face, children }: { r: number; z: number; face: number; children: ReactNode }) {
  return (
    <div
      className={s.plane3d}
      style={{
        left: LENS.x - r,
        top: LENS.y - r,
        width: r * 2,
        height: r * 2,
        transform: `translateZ(${r2(face + z)}px)`,
      }}
    >
      <svg width={r * 2} height={r * 2} viewBox={`${-r} ${-r} ${r * 2} ${r * 2}`} style={{ display: "block", overflow: "visible" }}>
        {children}
      </svg>
    </div>
  );
}

/** Annulus path (outer r1, inner r2) centred on the origin, for even-odd fill. */
const ring = (ro: number, ri: number) =>
  `M${-ro} 0a${ro} ${ro} 0 1 0 ${ro * 2} 0a${ro} ${ro} 0 1 0 ${-ro * 2} 0Z` +
  `M${-ri} 0a${ri} ${ri} 0 1 0 ${ri * 2} 0a${ri} ${ri} 0 1 0 ${-ri * 2} 0Z`;

function Lens3D({ face, tone, facets }: { face: number; tone: Tone; facets: number }) {
  const t = TONES[tone];
  const L = LENS;
  const black = (lit: number) => mix("#050404", "#3d393a", lit * 0.9);
  const silver = (lit: number) => mix("#7d7d83", "#fbfbfc", lit);
  const pink = (lit: number) => mix(t.edge, t.light, 0.15 + lit * 0.7);
  return (
    <div className={s.plane3d}>
      <LensWall {...L.gasket} facets={facets} face={face} color={black} />
      <LensCap r={L.gasket.r} z={L.gasket.z1} face={face}>
        <path d={ring(L.gasket.r, L.trim.r)} fill="#141112" fillRule="evenodd" />
      </LensCap>

      <LensWall {...L.trim} facets={facets} face={face} color={silver} />
      <LensCap r={L.trim.r} z={L.trim.z1} face={face}>
        <defs>
          <linearGradient id="lens3d-trim" x1="0.1" y1="0" x2="0.9" y2="1">
            <stop offset="0" stopColor="#ffffff" />
            <stop offset="0.3" stopColor="#b8b8be" />
            <stop offset="0.55" stopColor="#f5f5f6" />
            <stop offset="1" stopColor="#85858b" />
          </linearGradient>
        </defs>
        <path d={ring(L.trim.r, L.housing.r)} fill="url(#lens3d-trim)" fillRule="evenodd" />
      </LensCap>

      <LensWall {...L.housing} facets={facets} face={face} color={pink} />
      <LensCap r={L.housing.r} z={L.housing.z1} face={face}>
        <defs>
          <radialGradient id={`lens3d-housing-${tone}`} cx="0.38" cy="0.32" r="0.85">
            <stop offset="0" stopColor={t.light} />
            <stop offset="0.55" stopColor={t.lensDisc} />
            <stop offset="1" stopColor={t.shade} />
          </radialGradient>
        </defs>
        <path d={ring(L.housing.r, L.opening.r)} fill={`url(#lens3d-housing-${tone})`} fillRule="evenodd" stroke={t.edge} strokeWidth="2" />
        {[170, 156, 142].map((r) => (
          <circle key={r} r={r} fill="none" stroke={t.edge} strokeOpacity="0.45" strokeWidth="1.5" />
        ))}
        <path d="M-150 -100A180 180 0 0 1 -60 -168" fill="none" stroke="#fff" strokeOpacity="0.45" strokeWidth="7" strokeLinecap="round" />
      </LensCap>

      {/* The black lens, just inside the shield: a short dark inner wall, then the glass */}
      <LensWall r={L.opening.r} z0={L.glass.z} z1={L.housing.z1} facets={facets} face={face} color={black} inward />
      <LensCap r={L.opening.r} z={L.glass.z} face={face}>
        <defs>
          <radialGradient id="lens3d-glass" cx="0.4" cy="0.35" r="0.8">
            <stop offset="0" stopColor="#3a3637" />
            <stop offset="0.6" stopColor="#171415" />
            <stop offset="1" stopColor="#0b0909" />
          </radialGradient>
        </defs>
        <circle r={L.opening.r} fill="#120f10" />
        <circle r={L.opening.r - 14} fill="url(#lens3d-glass)" />
        {[100, 78, 54].map((r) => (
          <circle key={r} r={r} fill="none" stroke="#2f2b2c" strokeWidth="2" />
        ))}
        <circle r="13" fill="#000" />
        <circle cx="-40" cy="-42" r="9" fill="#fff" fillOpacity="0.22" />
        <path d="M-86 -44A96 96 0 0 1 -34 -90" fill="none" stroke="#fff" strokeOpacity="0.18" strokeWidth="6" strokeLinecap="round" />
      </LensCap>
    </div>
  );
}

const SHUTTER = { x: 240, r: 56, top: -32, bodyTop: 6 } as const;

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
  const lite = useContext(Detail3D) === "lite";
  const sides = lite ? SIDE_FACES_LITE : SIDE_FACES;
  const shutterFacets = lite ? 12 : 20;

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
          {sides.map((f, i) => (
            <div
              key={i}
              className={s.plane3d}
              style={{
                left: r2(f.mx - (f.len + 1.5) / 2),
                top: r2(f.my - d / 2),
                width: r2(f.len + 1.5),
                height: d,
                // Local top is the back of the body, bottom the front. Plain
                // body tone, shaded by how much the wall faces the light; no
                // white rim (that was only a reflection in the photos).
                backgroundImage: `linear-gradient(180deg, ${mix(t.shade, t.body, 0.45 + f.lit * 0.15)} 0%, ${mix(t.shade, t.body, 0.72 + f.lit * 0.18)} 100%)`,
                transform: `rotateZ(${f.angle}deg) rotateX(90deg)`,
              }}
            />
          ))}

          {/* Shutter: a short silver cylinder on top, centred in the depth */}
          <div className={s.plane3d}>
            {Array.from({ length: shutterFacets }, (_, i) => {
              const ang = (i / shutterFacets) * 360;
              const shade = r2(0.5 + 0.5 * Math.cos(((ang - 40) * Math.PI) / 180));
              const w2 = r2((2 * Math.PI * SHUTTER.r) / shutterFacets + 1);
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
            <CameraFront tone={tone} shadow={false} hideShutter hideLens />
          </svg>

          {/* The lens, built in 3D on the front face */}
          <Lens3D face={d / 2} tone={tone} facets={lite ? 16 : 28} />

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
