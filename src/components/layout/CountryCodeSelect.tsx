"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { Country } from "country-state-city";
import { Check, ChevronDown, Search } from "lucide-react";

export type CountryCode = {
  /** ISO-2 code - the stable key. */
  isoCode: string;
  name: string;
  flag: string;
  /** Dial code without the leading "+". */
  dial: string;
};

/** Every dial code, India first so the common case is one click away. */
export const COUNTRY_CODES: CountryCode[] = (() => {
  const all = Country.getAllCountries()
    .filter((c) => Boolean(c.phonecode))
    .map((c) => ({
      isoCode: c.isoCode,
      name: c.name,
      flag: c.flag,
      // The dataset stores these as "91", "+91" and "1-268" depending on the row.
      dial: c.phonecode.replace(/^\+/, ""),
    }))
    .sort((a, b) => a.name.localeCompare(b.name));

  const india = all.find((c) => c.isoCode === "IN");
  return india ? [india, ...all.filter((c) => c !== india)] : all;
})();

export const DEFAULT_COUNTRY: CountryCode = COUNTRY_CODES[0] ?? {
  isoCode: "IN",
  name: "India",
  flag: "🇮🇳",
  dial: "91",
};

type Props = {
  value: CountryCode;
  onChange: (country: CountryCode) => void;
  disabled?: boolean;
};

/**
 * Country dial-code picker for the waitlist modal - same searchable listbox
 * interaction as the checkout's LocationSelect, sized to sit inside the
 * WhatsApp field.
 */
export function CountryCodeSelect({ value, onChange, disabled }: Props) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  /** Flip above the trigger when the panel would run off the bottom. */
  const [dropUp, setDropUp] = useState(false);

  const rootRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const listboxId = useId();

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase().replace(/^\+/, "");
    if (!q) return COUNTRY_CODES;
    return COUNTRY_CODES.filter(
      (c) => c.name.toLowerCase().includes(q) || c.dial.startsWith(q),
    );
  }, [query]);

  // Close on outside click.
  useEffect(() => {
    if (!open) return;
    const onDocClick = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) close();
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // Focus the search box when the panel opens.
  useEffect(() => {
    if (open) searchRef.current?.focus();
  }, [open]);

  // Keep the highlighted option scrolled into view.
  useEffect(() => {
    if (!open) return;
    const el = listRef.current?.children[active] as HTMLElement | undefined;
    el?.scrollIntoView({ block: "nearest" });
  }, [active, open]);

  const close = () => {
    setOpen(false);
    setQuery("");
  };

  const openPanel = () => {
    if (disabled) return;
    const rect = rootRef.current?.getBoundingClientRect();
    const viewportH = window.innerHeight;
    if (rect && viewportH > 0) {
      // ~300px of panel; prefer whichever side has room for it.
      const below = viewportH - rect.bottom;
      setDropUp(below < 300 && rect.top > below);
    }
    setOpen(true);
    setQuery("");
    const idx = COUNTRY_CODES.findIndex((c) => c.isoCode === value.isoCode);
    setActive(idx >= 0 ? idx : 0);
  };

  const choose = (country: CountryCode) => {
    onChange(country);
    close();
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (!open) {
      if (e.key === "Enter" || e.key === " " || e.key === "ArrowDown") {
        e.preventDefault();
        openPanel();
      }
      return;
    }
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setActive((a) => Math.min(a + 1, filtered.length - 1));
        break;
      case "ArrowUp":
        e.preventDefault();
        setActive((a) => Math.max(a - 1, 0));
        break;
      case "Enter":
        e.preventDefault();
        if (filtered[active]) choose(filtered[active]);
        break;
      case "Escape":
        e.preventDefault();
        close();
        break;
      case "Tab":
        close();
        break;
    }
  };

  return (
    <div ref={rootRef} className="relative shrink-0">
      <button
        type="button"
        disabled={disabled}
        onClick={() => (open ? close() : openPanel())}
        onKeyDown={onKeyDown}
        role="combobox"
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-controls={listboxId}
        aria-label={`Country code: ${value.name} +${value.dial}`}
        className="flex items-center gap-1.5 rounded-xl border-2 border-darkroom/15 bg-overexpose px-3 py-3 text-sm text-darkroom outline-none transition-colors hover:border-darkroom/30 focus:border-darkroom disabled:cursor-not-allowed disabled:opacity-55"
      >
        
       
        <span className="font-semibold tabular-nums">+{value.dial}</span>
        <ChevronDown
          aria-hidden
          className={
            "size-4 shrink-0 text-darkroom/35 transition-transform duration-200 " +
            (open ? "rotate-180" : "")
          }
        />
      </button>

      {open && (
        <div
          className={
            "absolute left-0 z-30 w-64 max-w-[calc(100vw-4rem)] overflow-hidden rounded-xl border-2 border-darkroom/12 bg-overexpose shadow-[0_16px_40px_-12px_rgba(31,26,24,0.35)] " +
            (dropUp ? "bottom-[calc(100%+0.5rem)]" : "top-[calc(100%+0.5rem)]")
          }
        >
          <div className="flex items-center gap-2 border-b border-darkroom/10 px-3 py-2">
            <Search aria-hidden className="size-4 shrink-0 text-darkroom/35" />
            <input
              ref={searchRef}
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setActive(0);
              }}
              onKeyDown={onKeyDown}
              placeholder="Search country or code…"
              aria-label="Search country or code"
              className="w-full bg-transparent text-base md:text-sm text-darkroom outline-none placeholder:text-darkroom/30"
            />
          </div>
          <ul
            ref={listRef}
            id={listboxId}
            role="listbox"
            aria-label="Country code"
            // Lenis hijacks wheel events page-wide; this opts the list out so
            // it scrolls on its own. See providers/SmoothScroll.tsx.
            data-lenis-prevent
            className="max-h-60 overflow-y-auto overscroll-contain py-1"
          >
            {filtered.length === 0 ? (
              <li className="px-4 py-3 text-sm text-darkroom/45">
                No results found.
              </li>
            ) : (
              filtered.map((country, i) => {
                const selected = country.isoCode === value.isoCode;
                return (
                  <li
                    key={country.isoCode}
                    role="option"
                    aria-selected={selected}
                    onMouseEnter={() => setActive(i)}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      choose(country);
                    }}
                    className={
                      "flex cursor-pointer items-center gap-2 px-3 py-2 text-sm text-darkroom " +
                      (i === active ? "bg-bluehour/10" : "")
                    }
                  >
                    <span className="min-w-0 flex-1 truncate">
                      {country.name}
                    </span>
                    <span className="shrink-0 tabular-nums text-darkroom/55">
                      +{country.dial}
                    </span>
                    {selected && (
                      <Check className="size-4 shrink-0 text-bluehour" />
                    )}
                  </li>
                );
              })
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
