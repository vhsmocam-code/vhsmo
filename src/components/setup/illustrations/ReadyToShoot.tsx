"use client";

import { CameraFront, FRONT } from "./CameraFront";
import { IllustrationStage } from "./Stage";
import { useSvgId } from "./useSvgId";
import s from "./illustrations.module.css";

/**
 * Step 03 - the front of the camera: shutter press, flash, and a fresh
 * frame joins the roll. The prints are abstract exposures, not photos.
 */
export function ReadyToShoot({ label, paused }: { label: string; paused?: boolean }) {
  const uid = useSvgId("shoot");
  const k = 0.8;
  const tx = 130;
  const ty = 140;
  const fx = tx + FRONT.flash.x * k;
  const fy = ty + FRONT.flash.y * k;

  const print = (key: string, x: number, y: number, rot: number, className?: string) => (
    <g key={key} transform={`translate(${x} ${y}) rotate(${rot})`}>
      <g className={className}>
        <rect x="-120" y="-145" width="240" height="290" rx="6" fill="#f3f0e8" />
        <rect x="-104" y="-129" width="208" height="208" rx="2" fill={`url(#${uid}-exp)`} />
        <rect x="-104" y="-129" width="208" height="208" rx="2" fill={`url(#${uid}-leak)`} />
      </g>
    </g>
  );

  return (
    <IllustrationStage label={label} paused={paused}>
      <svg viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid meet" aria-hidden>
        <defs>
          <radialGradient id={`${uid}-flash`}>
            <stop offset="0" stopColor="#fff" stopOpacity="1" />
            <stop offset="0.35" stopColor="#fff" stopOpacity="0.55" />
            <stop offset="1" stopColor="#fff" stopOpacity="0" />
          </radialGradient>
          <linearGradient id={`${uid}-exp`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#3a3330" />
            <stop offset="0.6" stopColor="#5b4f45" />
            <stop offset="1" stopColor="#b08a52" />
          </linearGradient>
          <radialGradient id={`${uid}-leak`} cx="0.85" cy="0.15" r="0.9">
            <stop offset="0" stopColor="#fdf100" stopOpacity="0.55" />
            <stop offset="0.4" stopColor="#ff8a3d" stopOpacity="0.2" />
            <stop offset="1" stopColor="#ff8a3d" stopOpacity="0" />
          </radialGradient>
        </defs>

        <g transform={`translate(${tx} ${ty}) scale(${k})`}>
          <CameraFront shutterClassName={s.shutter} />
        </g>
        <circle cx={fx} cy={fy} r="230" fill={`url(#${uid}-flash)`} className={s.flashGlow} />

        {/* The roll so far, and the new frame */}
        {print("p1", 1290, 410, 7)}
        {print("p2", 1250, 430, -5)}
        {print("p3", 1270, 420, 2, s.printIn)}

        <g fontFamily="var(--font-display), system-ui, sans-serif" fill="#e3e3e1">
          <text x="1270" y="660" textAnchor="middle" fontSize="20" fontWeight="600" letterSpacing="5" fillOpacity="0.55">
            FRAME
          </text>
          <g fontSize="64" fontWeight="800">
            <text x="1270" y="735" textAnchor="middle" className={s.countOld}>
              023
            </text>
            <text x="1270" y="735" textAnchor="middle" fill="#fdf100" className={s.countNew}>
              024
            </text>
          </g>
        </g>

        <rect width="1600" height="900" fill="#fff" className={s.panelFlash} />
      </svg>
    </IllustrationStage>
  );
}
