/** Field styling shared with the existing checkout design system, so the
 *  autocomplete + address fields read as one with the rest of the form. */

export const fieldCard =
  "group rounded-xl border-2 border-darkroom/12 bg-overexpose px-4 py-2.5 shadow-[0_1px_2px_rgba(31,26,24,0.05)] transition-all duration-200 hover:border-darkroom/25 focus-within:border-bluehour focus-within:shadow-[0_8px_24px_-10px_rgba(16,147,255,0.5)]";

export const fieldLabel =
  "block text-[0.62rem] font-bold uppercase tracking-[0.15em] text-darkroom/45 transition-colors group-focus-within:text-bluehour";

export const fieldControl =
  "w-full bg-transparent text-sm text-darkroom outline-none placeholder:text-darkroom/30";

export const fieldIcon =
  "h-4 w-4 shrink-0 text-darkroom/35 transition-colors group-focus-within:text-bluehour";

/** Inert / locked field: clearly reads as non-editable, not just dimmed. Uses
 *  important overrides so it wins over the hover + focus states baked into
 *  `fieldCard`. */
export const fieldDisabled =
  "cursor-not-allowed opacity-80 !border-dashed !border-darkroom/15 !bg-darkroom/[0.05] !shadow-none hover:!border-darkroom/15";
