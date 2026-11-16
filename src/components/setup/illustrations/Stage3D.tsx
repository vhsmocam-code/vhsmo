"use client";

import { useEffect, useRef, useState } from "react";
import { LabelFrame } from "./SceneLabel";
import { IllustrationStage } from "./Stage";
import s from "./illustrations.module.css";

/**
 * The stage for CSS-3D scenes. Everything is laid out in a fixed
 * 1200 x 900 "world" that is scaled to fit the 4:3 slot, so scene
 * coordinates stay the same as the SVG scenes.
 *
 * Keep `overflow`, `filter` and partial opacity off anything between the
 * perspective container and the cube: they flatten preserve-3d in WebKit.
 */
export function Stage3D({
  label,
  paused,
  labels,
  children,
}: {
  label: string;
  paused?: boolean;
  /** HTML labels in world units (see SceneLabel), kept out of the scaled world. */
  labels?: React.ReactNode;
  children: React.ReactNode;
}) {
  const wrap = useRef<HTMLDivElement>(null);
  const [fit, setFit] = useState({ k: 0.5, x: 0, y: 0 });

  useEffect(() => {
    const el = wrap.current;
    if (!el) return;
    const update = () => {
      const { width, height } = el.getBoundingClientRect();
      if (!width || !height) return;
      const k = Math.min(width / 1200, height / 900);
      setFit({ k, x: (width - 1200 * k) / 2, y: (height - 900 * k) / 2 });
    };
    update();
    if (typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <IllustrationStage label={label} paused={paused}>
      <div ref={wrap} className={s.world3dWrap}>
        <div
          className={s.world3d}
          style={{ transform: `translate(${fit.x}px, ${fit.y}px) scale(${fit.k})` }}
        >
          {children}
        </div>
      </div>
      {labels && (
        <LabelFrame w={1200} h={900}>
          {labels}
        </LabelFrame>
      )}
    </IllustrationStage>
  );
}
