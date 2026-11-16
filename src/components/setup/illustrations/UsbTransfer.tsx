"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { Camera3D, frontPoint, poseCss, project, type Pose } from "./Camera3D";
import { Stage3D } from "./Stage3D";
import { useSvgId } from "./useSvgId";
import { CABLE_END, UsbCable, UsbPortFace } from "./UsbPort";
import s from "./illustrations.module.css";

const FONT = "var(--font-display), system-ui, sans-serif";
const KODAK = "#fdf100";

/** The camera, turned to show its charging / data port, cable plugged in. */
const POSE: Pose = { rx: 0, ry: -66, s: 0.62, tx: -320, ty: 40 };

/** Laptop: drawn in its own units, then scaled into the top right. */
const LAPTOP = { x: 690, y: 150, k: 0.78 } as const;
const lap = (x: number, y: number) => ({
  x: LAPTOP.x + (x - 640) * LAPTOP.k,
  y: LAPTOP.y + (y - 190) * LAPTOP.k,
});
/** Phone, bottom right, USB-C port at the bottom edge. */
const PHONE = { x: 905, y: 520, w: 160, h: 320 } as const;

/**
 * USB transfer: the camera on a data cable. Photos copy to a laptop, then
 * the cable moves to a phone and they copy there too.
 */
export function UsbTransfer({ label, paused }: { label: string; paused?: boolean }) {
  const uid = useSvgId("usb");
  const probe = useRef<HTMLDivElement>(null);
  const [end, setEnd] = useState(() => project(frontPoint(CABLE_END.x, CABLE_END.y), POSE));

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
      const x = Math.round(((pr.left + pr.width / 2 - wr.left) / k) * 10) / 10;
      const y = Math.round(((pr.top + pr.height / 2 - wr.top) / k) * 10) / 10;
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

  const screenL = lap(712, 350);
  // Both runs leave the stub heading down, so the cable sags before it rises.
  const toLaptop = `M${end.x} ${end.y}C${end.x + 25} ${end.y + 80} ${screenL.x - 150} ${screenL.y + 10} ${screenL.x - 6} ${screenL.y}`;
  const portB = { x: PHONE.x + PHONE.w / 2, y: PHONE.y + PHONE.h };
  const toPhone = `M${end.x} ${end.y}C${end.x + 25} ${end.y + 110} ${portB.x} ${portB.y + 80} ${portB.x} ${portB.y + 8}`;

  const start = { x: end.x + 30, y: end.y + 40 };
  const lapTarget = lap(910, 350);
  const phoneTarget = { x: PHONE.x + PHONE.w / 2, y: PHONE.y + PHONE.h * 0.48 };
  const hop = (t: { x: number; y: number }, delay: number) =>
    ({ "--dx": `${t.x - start.x}px`, "--dy": `${t.y - start.y}px`, animationDelay: `${delay}s` }) as CSSProperties;

  const lapTiles = [
    [0, 0],
    [1, 0],
    [2, 0],
    [0, 1],
    [1, 1],
    [2, 1],
  ] as const;

  return (
    <Stage3D label={label} paused={paused}>
      <Camera3D
        rigClassName={s.staticRig}
        rigStyle={{ "--pose": poseCss(POSE) } as CSSProperties}
        right={<UsbPortFace />}
      >
        <UsbCable endRef={probe} />
      </Camera3D>

      <svg className={s.overlay} viewBox="0 0 1200 900" width="1200" height="900" aria-hidden>
        <defs>
          <linearGradient id={`${uid}-tile`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#5b4f45" />
            <stop offset="1" stopColor={KODAK} stopOpacity="0.85" />
          </linearGradient>
          <linearGradient id={`${uid}-lid`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#d9d9dc" />
            <stop offset="1" stopColor="#a9a9ae" />
          </linearGradient>
        </defs>

        {/* Laptop */}
        <g transform={`translate(${LAPTOP.x} ${LAPTOP.y}) scale(${LAPTOP.k}) translate(-640 -190)`}>
          <rect x="690" y="190" width="440" height="320" rx="20" fill="#0f0d0c" stroke="#9a9aa0" strokeWidth="6" />
          <path d="M640 540H1180L1150 600H670Z" fill={`url(#${uid}-lid)`} />
          <rect x="860" y="540" width="100" height="10" rx="5" fill="#8c8c92" />
          <rect x="712" y="212" width="396" height="276" rx="10" fill="#26211f" />
          <rect x="712" y="212" width="396" height="36" rx="10" fill="#3a332f" />
          {[0, 1, 2].map((i) => (
            <circle key={i} cx={734 + i * 20} cy="230" r="5" fill={["#ff5f57", "#febc2e", "#28c840"][i]} />
          ))}
          <text x="910" y="236" textAnchor="middle" fontFamily={FONT} fontWeight="700" fontSize="18" fill="#e3e3e1" fillOpacity="0.8">
            VHSMO
          </text>
          {lapTiles.map(([c, r]) => (
            <g key={`${c}${r}`} transform={`translate(${742 + c * 120} ${272 + r * 100})`}>
              <rect width="100" height="82" rx="6" fill="#f3f0e8" />
              <rect x="6" y="6" width="88" height="56" rx="3" fill={`url(#${uid}-tile)`} opacity={0.55 + ((c + r) % 3) * 0.2} />
            </g>
          ))}
        </g>

        {/* Phone with its gallery */}
        <g>
          <rect x={PHONE.x} y={PHONE.y} width={PHONE.w} height={PHONE.h} rx="28" fill="#0f0d0c" stroke="#9a9aa0" strokeWidth="4" />
          <rect x={PHONE.x + 9} y={PHONE.y + 9} width={PHONE.w - 18} height={PHONE.h - 18} rx="20" fill="#26211f" />
          <rect x={PHONE.x + PHONE.w / 2 - 22} y={PHONE.y + 18} width="44" height="12" rx="6" fill="#0f0d0c" />
          {[0, 1].map((c) =>
            [0, 1, 2, 3].map((r) => (
              <rect
                key={`${c}${r}`}
                x={PHONE.x + 20 + c * 62}
                y={PHONE.y + 48 + r * 64}
                width="56"
                height="56"
                rx="6"
                fill={`url(#${uid}-tile)`}
                opacity={0.5 + ((c + r) % 3) * 0.2}
              />
            )),
          )}
          <rect x={portB.x - 14} y={portB.y - 3} width="28" height="6" rx="3" fill="#3a3a3e" />
        </g>

        {/* Cable to the laptop, then to the phone */}
        <g className={s.cableA}>
          <path d={toLaptop} fill="none" stroke="#ebe8e1" strokeWidth="16" strokeLinecap="round" />
          <path d={toLaptop} fill="none" stroke={KODAK} strokeOpacity="0.8" strokeWidth="3" strokeDasharray="10 26" className={s.dash} />
          <rect x={screenL.x - 22} y={screenL.y - 11} width="20" height="22" rx="5" fill="#d9d9dc" />
        </g>
        <g className={s.cableB}>
          <path d={toPhone} fill="none" stroke="#ebe8e1" strokeWidth="16" strokeLinecap="round" />
          <path d={toPhone} fill="none" stroke={KODAK} strokeOpacity="0.8" strokeWidth="3" strokeDasharray="10 26" className={s.dash} />
          <rect x={portB.x - 11} y={portB.y + 4} width="22" height="20" rx="5" fill="#d9d9dc" />
        </g>

        {/* Photos hop across: three to the laptop, then three to the phone */}
        {[
          [lapTarget, 0.6],
          [lapTarget, 1.3],
          [lapTarget, 2.0],
          [phoneTarget, 5.6],
          [phoneTarget, 6.3],
          [phoneTarget, 7.0],
        ].map(([t, delay], i) => (
          <g key={i} transform={`translate(${start.x} ${start.y})`}>
            <g className={s.hop} style={hop(t as { x: number; y: number }, delay as number)}>
              <rect x="-22" y="-22" width="44" height="44" rx="6" fill="#f3f0e8" />
              <rect x="-17" y="-17" width="34" height="27" rx="2" fill={`url(#${uid}-tile)`} />
            </g>
          </g>
        ))}
      </svg>
    </Stage3D>
  );
}
