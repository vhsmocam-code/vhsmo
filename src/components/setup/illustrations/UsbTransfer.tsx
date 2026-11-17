"use client";

import { useEffect, useState, type CSSProperties } from "react";
import { CAM3D, Camera3D, centerOn, frontPoint, poseCss, project, type Pose } from "./Camera3D";
import { SceneLabel } from "./SceneLabel";
import { Stage3D } from "./Stage3D";
import { useSvgId } from "./useSvgId";
import { CABLE_END, UsbCable, UsbPortFace } from "./UsbPort";
import s from "./illustrations.module.css";

const KODAK = "#fdf100";

/** The desk line, and the camera standing on it, turned to show the port. */
const FLOOR = 770;
const POSE: Pose = centerOn(
  frontPoint(CAM3D.w / 2, CAM3D.h, 0),
  { rx: 0, ry: -64, s: 0.6, tx: 0, ty: 0 },
  { x: 330, y: FLOOR - 14 },
);

/** The phone stands upright on a small stand; its USB-C port is on the bottom edge. */
const PHONE = { x: 740, w: 170, h: 340, foot: 28 } as const;
const PORT_P = { x: PHONE.x + PHONE.w / 2, y: FLOOR - PHONE.foot - 3 } as const;
/** Height of the cable's centre line where it lies on the desk. */
const DESK = FLOOR - 9;

const r1 = (v: number) => Math.round(v * 10) / 10;

/** A cable drawn as a round tube: dark edge, off-white body, thin highlight. */
function CableStroke({ d }: { d: string }) {
  return (
    <g fill="none" strokeLinecap="round" strokeLinejoin="round">
      <path d={d} stroke="#5d5851" strokeWidth="21" />
      <path d={d} stroke="#ebe8e1" strokeWidth="16" />
      <path d={d} stroke="#ffffff" strokeOpacity="0.85" strokeWidth="3.5" transform="translate(0 -3.2)" />
    </g>
  );
}

/**
 * USB transfer, kept minimal: the camera sits on a desk, wired to a phone.
 * Six photos appear on the phone one by one while a bar fills, then
 * "Saved to your phone". One 8 s CSS loop; the static state (reduced
 * motion) is the finished copy.
 */
export function UsbTransfer({ label, paused }: { label: string; paused?: boolean }) {
  const uid = useSvgId("usb");
  // A callback ref: the 3D rig mounts later (near the screen), so measure
  // when the stub appears, not on the first render.
  const [probe, setProbe] = useState<HTMLDivElement | null>(null);
  const [end, setEnd] = useState(() => {
    const p = project(frontPoint(CABLE_END.x, CABLE_END.y), POSE);
    return { x: r1(p.x), y: r1(p.y) };
  });

  // The cable stub is drawn in 3D; measure where its end actually lands so
  // the 2D cable joins it exactly.
  useEffect(() => {
    const el = probe;
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
  }, [probe]);

  // Down from the stub to the desk, along it, then up into the phone's port.
  const cable =
    `M${end.x} ${end.y}C${end.x} ${r1(end.y + 50)} ${r1(end.x + 30)} ${DESK} ${r1(end.x + 90)} ${DESK}` +
    `L${PORT_P.x - 80} ${DESK}C${PORT_P.x - 20} ${DESK} ${PORT_P.x} ${PORT_P.y + 30} ${PORT_P.x} ${PORT_P.y + 14}`;

  const slot = (i: number) => ({ x: 18 + (i % 2) * 72, y: -306 + Math.floor(i / 2) * 72 });

  return (
    <Stage3D
      label={label}
      paused={paused}
      labels={
        <>
          <SceneLabel w={1200} h={900} x={PORT_P.x} y={372} align="middle" className={s.usbChipCopy} title="Copying your photos…" titleSize={30} minTitle={12} titleColor="#e3e3e1" />
          <SceneLabel w={1200} h={900} x={PORT_P.x} y={372} align="middle" className={s.usbChipDone} title="Saved to your phone" titleSize={30} minTitle={12} />
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
          <radialGradient id={`${uid}-shadow`}>
            <stop offset="0" stopColor="#000" stopOpacity="0.5" />
            <stop offset="1" stopColor="#000" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Camera shadow on the desk */}
        <ellipse cx="330" cy={FLOOR - 8} rx="190" ry="18" fill={`url(#${uid}-shadow)`} />

        {/* Phone */}
        <g transform={`translate(${PHONE.x} ${FLOOR})`}>
          <ellipse cx={PHONE.w / 2} cy="4" rx="135" ry="12" fill={`url(#${uid}-shadow)`} />
          <rect x="22" y={-PHONE.foot} width="30" height={PHONE.foot} rx="6" fill="#3a3533" />
          <rect x={PHONE.w - 52} y={-PHONE.foot} width="30" height={PHONE.foot} rx="6" fill="#3a3533" />
          <rect x="0" y={-PHONE.foot - PHONE.h} width={PHONE.w} height={PHONE.h} rx="28" fill="#0f0d0c" stroke="#9a9aa0" strokeWidth="3" />
          <rect x="9" y={-PHONE.foot - PHONE.h + 9} width={PHONE.w - 18} height={PHONE.h - 18} rx="21" fill="#1f1a18" />
          <rect x={PHONE.w / 2 - 20} y={-PHONE.foot - PHONE.h + 17} width="40" height="12" rx="6" fill="#0a0908" />
          <rect x="18" y="-330" width="64" height="9" rx="4.5" fill="rgba(255,255,255,0.16)" />
          {Array.from({ length: 6 }, (_, i) => {
            const p = slot(i);
            return (
              <g key={i} transform={`translate(${p.x} ${p.y})`}>
                <rect width="62" height="62" rx="8" fill="rgba(255,255,255,0.05)" />
                <g className={s[`usbSlot${i}` as keyof typeof s]}>
                  <rect width="62" height="62" rx="8" fill="#f3f0e8" />
                  <rect x="4" y="4" width="54" height="42" rx="4" fill={`url(#${uid}-tile)`} opacity={0.6 + ((i * 5) % 4) * 0.1} />
                </g>
              </g>
            );
          })}
          <rect x="18" y="-80" width="134" height="6" rx="3" fill="rgba(255,255,255,0.12)" />
          <rect x="18" y="-80" width="134" height="6" rx="3" fill={KODAK} className={s.usbBar} />
        </g>

        {/* The cable, plugged in the whole time */}
        <CableStroke d={cable} />
        <rect x={PORT_P.x - 10} y={PORT_P.y} width="20" height="20" rx="4" fill="#dcd8d0" stroke="#5d5851" strokeWidth="2.5" />
      </svg>

      <Camera3D
        rigClassName={s.staticRig}
        rigStyle={{ "--pose": poseCss(POSE) } as CSSProperties}
        right={<UsbPortFace />}
      >
        <UsbCable endRef={setProbe} />
      </Camera3D>
    </Stage3D>
  );
}
