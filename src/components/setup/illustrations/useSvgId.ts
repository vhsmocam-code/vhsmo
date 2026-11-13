"use client";

import { useId } from "react";

/** useId, made safe to use inside url(#...) references. */
export function useSvgId(prefix = "v") {
  return `${prefix}${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;
}
