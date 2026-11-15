/** Shared SVG helpers for the setup illustrations. */

/**
 * Arc path around (cx, cy). Angles in degrees, 0 = right, measured
 * clockwise (SVG y points down), so 270 is straight up.
 */
export function arcPath(cx: number, cy: number, r: number, from: number, to: number) {
  const rad = (d: number) => (d * Math.PI) / 180;
  const x1 = cx + r * Math.cos(rad(from));
  const y1 = cy + r * Math.sin(rad(from));
  const x2 = cx + r * Math.cos(rad(to));
  const y2 = cy + r * Math.sin(rad(to));
  const large = Math.abs(to - from) > 180 ? 1 : 0;
  return `M${x1.toFixed(2)} ${y1.toFixed(2)}A${r} ${r} 0 ${large} 1 ${x2.toFixed(2)} ${y2.toFixed(2)}`;
}

/**
 * Body palettes. The default ("pink") is sampled from photos of the real
 * VHSMO: a peachy pink. `light` and `shade` drive the soft body gradient,
 * `edge` the rim line. Black and red are kept as alternates.
 */
export const TONES = {
  pink: {
    body: "#F3C1AC",
    edge: "#DDA08A",
    light: "#FBDCCF",
    shade: "#E7B09B",
    embossLight: "#F9D3C3",
    embossDark: "#D2967F",
    frame: "#EFBAA4",
    lensDisc: "#F2C0AB",
  },
  black: {
    body: "#1c1c1c",
    edge: "#050505",
    light: "#3a3a3a",
    shade: "#0e0e0e",
    embossLight: "#3a3a3a",
    embossDark: "#080808",
    frame: "#121212",
    lensDisc: "#141414",
  },
  red: {
    body: "#C41F27",
    edge: "#8E1218",
    light: "#E2555C",
    shade: "#A7161D",
    embossLight: "#DC4A52",
    embossDark: "#951519",
    frame: "#B51A21",
    lensDisc: "#AE1A21",
  },
} as const;

export type Tone = keyof typeof TONES;

export const SILVER = { base: "#D9D9DC", light: "#F4F4F5", dark: "#A3A3A8" } as const;
export const DARK = "#1E1A1B";
/** Darkroom ink for cues drawn on top of the camera. */
export const INK = "#2a2422";
