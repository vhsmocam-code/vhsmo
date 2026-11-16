"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { CAM3D, Camera3D, centerOn, frontPoint, poseCss, project, type Pose } from "./Camera3D";
import { SceneLabel } from "./SceneLabel";
import { Stage3D } from "./Stage3D";
import { useSvgId } from "./useSvgId";
import { CABLE_END, UsbCable, UsbPortFace } from "./UsbPort";
import s from "./illustrations.module.css";

const KODAK = "#fdf100";

/**
 * Times (seconds on the 14 s loop) when each photo leaves the plug. The
 * keyframes in illustrations.module.css (usbSlotL* / usbSlotP*) are built
 * from the same numbers: change them together.
 */
const DEPART_L = (i: number) => 1.2 + 0.55 * i;
const DEPART_P = (i: number) => 8.8 + 0.5 * i;

/** The desk line, and the camera standing on it, turned to show the port. */
const FLOOR = 770;
const POSE: Pose = centerOn(
  frontPoint(CAM3D.w / 2, CAM3D.h, 0),
  { rx: 0, ry: -64, s: 0.6, tx: 0, ty: 0 },
  { x: 330, y: FLOOR - 14 },
);

/** Devices, drawn in their own local units and docked to one cable. */
const LAP = { x: 690 } as const;
/** Phone stands upright on a small stand, centred under the laptop's spot. */
const PHONE = { x: LAP.x + 220 - 75 } as const;
/** Where the cable lies on the desk before it rises to a device. */
const Q = { x: 600, y: FLOOR - 6 } as const;
const PORT_L = { x: LAP.x + 3, y: FLOOR - 11 } as const;
const PORT_P = { x: PHONE.x + 75, y: FLOOR - 26 } as const;

const r1 = (v: number) => Math.round(v * 10) / 10;

/** A cable drawn as a round tube: dark edge, off-white body, thin highlight. */
function CableStroke({ d, className, pathLength }: { d: string; className?: string; pathLength?: number }) {
  return (
    <g fill="none" strokeLinecap="round" strokeLinejoin="round">
      <path d={d} stroke="#5d5851" strokeWidth="21" className={className} pathLength={pathLength} />
      <path d={d} stroke="#ebe8e1" strokeWidth="16" className={className} pathLength={pathLength} />
      <path d={d} stroke="#ffffff" strokeOpacity="0.85" strokeWidth="3.5" transform="translate(0 -3.2)" className={className} pathLength={pathLength} />
    </g>
  );
}

/**
 * USB transfer: the camera sits on a desk on a data cable. Six photos
 * travel down the cable into a laptop; then the plug comes out, the laptop
 * slides away, a phone slides in and the same photos copy across.
 */
export function UsbTransfer({ label, paused }: { label: string; paused?: boolean }) {
  const uid = useSvgId("usb");
  const probe = useRef<HTMLDivElement>(null);
  const [end, setEnd] = useState(() => {
    const p = project(frontPoint(CABLE_END.x, CABLE_END.y), POSE);
    return { x: r1(p.x), y: r1(p.y) };
  });

  // The cable stub is drawn in 3D; measure where its end actually lands so
  // the 2D cable joins it exactly.
  useEffect(() => {
    const el = probe.current;
    const world = el?.closest(`.${s.world3d}`) as HTMLElement | null;
    if (!el || !world) return;
    const measure = () => {
      const wr = world.getBoundingClientRect();
      if (!wr.width) return;
      const k = wr.width / 1200;
      const pr = el.getBoundingClientRect();
      const x = r1((pr.left + pr.width / 2 - wr.left) / k);
      const y = r1((pr.top + pr.height / 2 - wr.top) / k);
      setEnd((p) => (Math.abs(p.x - x) < 0.5 && Math.abs(p.y - y) < 0.5 ? p : { x, y }));
    };
    const raf = requestAnimationFrame(measure);
    if (typeof ResizeObserver === "undefined") return () => cancelAnimationFrame(raf);
    const ro = new ResizeObserver(() => requestAnimationFrame(measure));
    ro.observe(world);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, []);

  const main = `M${end.x} ${end.y}C${r1(end.x + 6)} ${r1(end.y + 90)} ${Q.x - 190} ${Q.y + 8} ${Q.x} ${Q.y}`;
  const tailA = `M${Q.x} ${Q.y}C${Q.x + 36} ${Q.y} ${PORT_L.x - 40} ${PORT_L.y + 4} ${PORT_L.x} ${PORT_L.y}`;
  // The phone tail rises from below into the port on the phone's bottom edge.
  const tailB = `M${Q.x} ${Q.y}C${Q.x + 150} ${Q.y} ${PORT_P.x} ${PORT_P.y + 22} ${PORT_P.x} ${PORT_P.y}`;
  const tailAOnly = (d: string) => d.slice(d.indexOf("C"));
  const fullA = `${main}${tailAOnly(tailA)}`;
  const fullB = `${main}${tailAOnly(tailB)}`;
  const q = (d: string) => `path("${d}")`;

  const lapSlot = (i: number) => ({ x: 62 + (i % 3) * 110, y: -224 + Math.floor(i / 3) * 90 });
  const phoneSlot = (i: number) => ({ x: 13 + (i % 2) * 66, y: -274 + Math.floor(i / 2) * 66 });

  return (
    <Stage3D
      label={label}
      paused={paused}
      labels={
        <>
          <SceneLabel w={1200} h={900} x={910} y={448} align="middle" className={s.usbChipLapCopy} title="Copying your photos…" titleSize={30} minTitle={12} titleColor="#e3e3e1" />
          <SceneLabel w={1200} h={900} x={910} y={448} align="middle" className={s.usbChipLapDone} title="Done · safe to eject" titleSize={30} minTitle={12} />
          <SceneLabel w={1200} h={900} x={910} y={416} align="middle" className={s.usbChipPhoneCopy} title="Copying your photos…" titleSize={30} minTitle={12} titleColor="#e3e3e1" />
          <SceneLabel w={1200} h={900} x={910} y={416} align="middle" className={s.usbChipPhoneDone} title="Saved to your phone" titleSize={30} minTitle={12} />
        </>
      }
    >
      <div className={s.usbFloor} />

      <svg className={s.overlay} viewBox="0 0 1200 900" width="1200" height="900" aria-hidden>
        <defs>
          <linearGradient id={`${uid}-tile`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#5b4f45" />
            <stop offset="1" stopColor={KODAK} stopOpacity="0.9" />
          </linearGradient>
          <linearGradient id={`${uid}-base`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#e4e4e7" />
            <stop offset="1" stopColor="#a9a9ae" />
          </linearGradient>
          <radialGradient id={`${uid}-shadow`}>
            <stop offset="0" stopColor="#000" stopOpacity="0.5" />
            <stop offset="1" stopColor="#000" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Camera shadow on the desk */}
        <ellipse cx="330" cy={FLOOR - 8} rx="210" ry="18" fill={`url(#${uid}-shadow)`} />

        {/* Laptop */}
        <g transform={`translate(${LAP.x} ${FLOOR})`}>
          <g className={s.usbLapDev}>
            <ellipse cx="220" cy="4" rx="260" ry="16" fill={`url(#${uid}-shadow)`} />
            <rect x="0" y="-22" width="440" height="22" rx="8" fill={`url(#${uid}-base)`} />
            <rect x="170" y="-22" width="100" height="6" rx="3" fill="#8c8c92" />
            <rect x="34" y="-292" width="372" height="272" rx="14" fill="#14110f" stroke="#8f8f95" strokeWidth="2.5" />
            <rect x="46" y="-280" width="348" height="246" rx="6" fill="#1f1a18" />
            <rect x="46" y="-280" width="348" height="26" rx="6" fill="#2c2623" />
            {[0, 1, 2].map((i) => (
              <circle key={i} cx={62 + i * 16} cy="-267" r="4.5" fill={["#ff5f57", "#febc2e", "#28c840"][i]} />
            ))}
            {Array.from({ length: 6 }, (_, i) => {
              const p = lapSlot(i);
              return (
                <g key={i} transform={`translate(${p.x} ${p.y})`}>
                  <rect width="96" height="76" rx="8" fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.14)" strokeDasharray="5 5" />
                  <g className={s[`usbSlotL${i}` as keyof typeof s]}>
                    <rect width="96" height="76" rx="8" fill="#f3f0e8" />
                    <rect x="6" y="6" width="84" height="50" rx="3" fill={`url(#${uid}-tile)`} opacity={0.6 + ((i * 7) % 4) * 0.1} />
                  </g>
                </g>
              );
            })}
            <rect x="62" y="-46" width="316" height="8" rx="4" fill="rgba(255,255,255,0.12)" />
            <rect x="62" y="-46" width="316" height="8" rx="4" fill={KODAK} className={s.usbBarL} />
          </g>
        </g>

        {/* Phone, upright on a small stand; USB-C port on its bottom edge */}
        <g transform={`translate(${PHONE.x} ${FLOOR})`}>
          <g className={s.usbPhoneDev}>
            <ellipse cx="75" cy="4" rx="125" ry="11" fill={`url(#${uid}-shadow)`} />
            <rect x="18" y="-28" width="30" height="28" rx="6" fill="#3a3533" />
            <rect x="102" y="-28" width="30" height="28" rx="6" fill="#3a3533" />
            <rect x="0" y="-326" width="150" height="300" rx="26" fill="#0f0d0c" stroke="#9a9aa0" strokeWidth="3" />
            <rect x="8" y="-318" width="134" height="284" rx="20" fill="#1f1a18" />
            <rect x="55" y="-310" width="40" height="11" rx="5.5" fill="#0a0908" />
            <rect x="66" y="-29" width="18" height="6" rx="3" fill="#3a3a3e" />
            {Array.from({ length: 6 }, (_, i) => {
              const p = phoneSlot(i);
              return (
                <g key={i} transform={`translate(${p.x} ${p.y})`}>
                  <rect width="58" height="58" rx="7" fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.14)" strokeDasharray="4 4" />
                  <g className={s[`usbSlotP${i}` as keyof typeof s]}>
                    <rect width="58" height="58" rx="7" fill="#f3f0e8" />
                    <rect x="4" y="4" width="50" height="40" rx="3" fill={`url(#${uid}-tile)`} opacity={0.6 + ((i * 5) % 4) * 0.1} />
                  </g>
                </g>
              );
            })}
            <rect x="13" y="-292" width="124" height="5" rx="2.5" fill="rgba(255,255,255,0.12)" />
            <rect x="13" y="-292" width="124" height="5" rx="2.5" fill={KODAK} className={s.usbBarP} />
          </g>
        </g>

        {/* The cable: one run along the desk, then a tail that plugs into each device */}
        <CableStroke d={main} />
        <CableStroke d={tailA} className={s.usbTailA} pathLength={1} />
        <CableStroke d={tailB} className={s.usbTailB} pathLength={1} />

        {/* A ripple where each device connects */}
        <circle cx={PORT_L.x} cy={PORT_L.y} r="14" fill="none" stroke={KODAK} strokeWidth="3" className={s.usbPulseA} />
        <circle cx={PORT_P.x} cy={PORT_P.y} r="14" fill="none" stroke={KODAK} strokeWidth="3" className={s.usbPulseB} />
      </svg>

      <Camera3D
        rigClassName={s.staticRig}
        rigStyle={{ "--pose": poseCss(POSE) } as CSSProperties}
        right={<UsbPortFace />}
      >
        <UsbCable endRef={probe} />
      </Camera3D>

      {/* Photos travel along the cable; the plug follows the tail in and out */}
      <div className={s.usbLayer}>
        {Array.from({ length: 6 }, (_, i) => (
          <span key={`l${i}`} className={s.usbTile} style={{ offsetPath: q(fullA), animationDelay: `${DEPART_L(i)}s` }} />
        ))}
        {Array.from({ length: 6 }, (_, i) => (
          <span key={`p${i}`} className={s.usbTile} style={{ offsetPath: q(fullB), animationDelay: `${DEPART_P(i)}s` }} />
        ))}
        <span className={s.usbPlugA} style={{ offsetPath: q(tailA) }} />
        <span className={s.usbPlugB} style={{ offsetPath: q(tailB) }} />
      </div>
    </Stage3D>
  );
}
