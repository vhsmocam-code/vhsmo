import type { CSSProperties, ReactNode } from "react";
import s from "./illustrations.module.css";

/**
 * A box laid exactly over a scene's world (an SVG viewBox fitted with
 * "meet", or the 3D stage's world), so HTML labels can be placed in scene
 * units. It is a size container: label text scales with the scene but
 * never drops below a readable minimum on phones.
 */
export function LabelFrame({ w, h, children }: { w: number; h: number; children: ReactNode }) {
  return (
    <div
      className={s.labelFrame}
      style={{ aspectRatio: `${w} / ${h}`, width: `min(100cqw, calc(100cqh * ${w} / ${h}))` }}
    >
      {children}
    </div>
  );
}

type Align = "start" | "middle" | "end";

/**
 * One label in scene units: (x, y) is the anchor (vertical centre of the
 * block). Sizes are in scene units; `min*` are the px floors for phones.
 * `className` carries the scene's animation (kept off the positioning box).
 */
export function SceneLabel({
  x,
  y,
  w,
  align = "start",
  className,
  title,
  sub,
  titleSize = 40,
  subSize = 26,
  minTitle = 13,
  minSub = 11,
  titleColor = "#fdf100",
  subColor = "#e3e3e1",
  tracking,
  h,
  children,
}: {
  x: number;
  y: number;
  /** World width and height the coordinates are in. */
  w: number;
  h: number;
  align?: Align;
  className?: string;
  title?: ReactNode;
  sub?: ReactNode[] | ReactNode;
  titleSize?: number;
  subSize?: number;
  minTitle?: number;
  minSub?: number;
  titleColor?: string;
  subColor?: string;
  tracking?: string;
  children?: ReactNode;
}) {
  const shift = align === "start" ? "0%" : align === "middle" ? "-50%" : "-100%";
  const subs = Array.isArray(sub) ? sub : sub ? [sub] : [];
  const style: CSSProperties = {
    left: `${(x / w) * 100}%`,
    top: `${(y / h) * 100}%`,
    transform: `translate(${shift}, -50%)`,
    textAlign: align === "middle" ? "center" : align === "end" ? "right" : "left",
    letterSpacing: tracking,
  };
  return (
    <div className={s.label} style={style}>
      <div className={className}>
        {title != null && (
          <div className={s.labelTitle} style={{ fontSize: `max(${minTitle}px, ${(titleSize / w) * 100}cqw)`, color: titleColor }}>
            {title}
          </div>
        )}
        {subs.map((line, i) => (
          <div key={i} className={s.labelSub} style={{ fontSize: `max(${minSub}px, ${(subSize / w) * 100}cqw)`, color: subColor }}>
            {line}
          </div>
        ))}
        {children}
      </div>
    </div>
  );
}
