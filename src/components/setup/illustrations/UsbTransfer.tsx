"use client";

import { BACK, CameraBack } from "./CameraBack";
import { IllustrationStage } from "./Stage";
import { useSvgId } from "./useSvgId";
import s from "./illustrations.module.css";

const FONT = "var(--font-display), system-ui, sans-serif";
const KODAK = "#fdf100";

/**
 * USB transfer: the camera on a data cable to a laptop; photo files travel
 * across and land in a folder window.
 */
export function UsbTransfer({ label, paused }: { label: string; paused?: boolean }) {
  const uid = useSvgId("usb");
  const k = 0.56;
  const tx = 50;
  const ty = 250;
  const px = tx + BACK.w * k;
  const py = ty + BACK.portY * k;
  const tiles = [
    [0, 0],
    [1, 0],
    [2, 0],
    [0, 1],
    [1, 1],
    [2, 1],
  ] as const;

  return (
    <IllustrationStage label={label} paused={paused}>
      <svg viewBox="0 0 1200 900" preserveAspectRatio="xMidYMid meet" aria-hidden>
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

        {/* Camera + cable */}
        <g transform={`translate(${tx} ${ty}) scale(${k})`}>
          <CameraBack>
            <rect x={BACK.w - 7} y={BACK.portY - 14} width="8" height="28" rx="3" fill="#1E1A1B" />
          </CameraBack>
        </g>
        <path
          d={`M${px + 10} ${py}C${px + 70} ${py} ${px + 40} ${py + 76} 690 ${py + 76}`}
          fill="none"
          stroke="#ebe8e1"
          strokeWidth="12"
          strokeLinecap="round"
        />
        <path
          d={`M${px + 10} ${py}C${px + 70} ${py} ${px + 40} ${py + 76} 690 ${py + 76}`}
          fill="none"
          stroke={KODAK}
          strokeOpacity="0.8"
          strokeWidth="3"
          strokeDasharray="10 26"
          className={s.dash}
        />
        <rect x={px - 6} y={py - 14} width="46" height="28" rx="7" fill="#d9d9dc" />

        {/* Files travelling to the laptop */}
        {[s.file, `${s.file} ${s.file2}`, `${s.file} ${s.file3}`].map((cls) => (
          <g key={cls} transform={`translate(${px + 70} ${py + 76})`}>
            <g className={cls}>
              <rect x="-22" y="-22" width="44" height="44" rx="6" fill="#f3f0e8" />
              <rect x="-17" y="-17" width="34" height="27" rx="2" fill={`url(#${uid}-tile)`} />
            </g>
          </g>
        ))}

        {/* Laptop */}
        <rect x="690" y="190" width="440" height="320" rx="20" fill="#0f0d0c" stroke="#9a9aa0" strokeWidth="6" />
        <path d="M640 540H1180L1150 600H670Z" fill={`url(#${uid}-lid)`} />
        <rect x="860" y="540" width="100" height="10" rx="5" fill="#8c8c92" />

        {/* Folder window */}
        <rect x="712" y="212" width="396" height="276" rx="10" fill="#26211f" />
        <rect x="712" y="212" width="396" height="36" rx="10" fill="#3a332f" />
        {[0, 1, 2].map((i) => (
          <circle key={i} cx={734 + i * 20} cy="230" r="5" fill={["#ff5f57", "#febc2e", "#28c840"][i]} />
        ))}
        <text x="910" y="236" textAnchor="middle" fontFamily={FONT} fontWeight="700" fontSize="18" fill="#e3e3e1" fillOpacity="0.8">
          VHSMO
        </text>
        {tiles.map(([c, r]) => (
          <g key={`${c}${r}`} transform={`translate(${742 + c * 120} ${272 + r * 100})`}>
            <rect width="100" height="82" rx="6" fill="#f3f0e8" />
            <rect x="6" y="6" width="88" height="56" rx="3" fill={`url(#${uid}-tile)`} opacity={0.55 + ((c + r) % 3) * 0.2} />
          </g>
        ))}
      </svg>
    </IllustrationStage>
  );
}
