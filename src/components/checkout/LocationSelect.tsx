"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { AlertCircle, Check, ChevronDown, Search } from "lucide-react";
import { cardClass, controlClass, disabledClass, labelClass } from "./styles";

export type LocationOption = {
  /** Human-readable name - this is what gets submitted. */
  name: string;
  /** ISO code used internally to fetch dependent lists. */
  isoCode: string;
};

type LocationSelectProps = {
  label: string;
  placeholder: string;
  icon?: React.ReactNode;
  required?: boolean;
  disabled?: boolean;
  /** Selected readable name, or "" when nothing is chosen. */
  value: string;
  options: LocationOption[];
  onSelect: (option: LocationOption) => void;
  onBlur?: () => void;
  error?: string;
  className?: string;
  /** Shown inside the open panel when there are genuinely no options. */
  emptyMessage?: string;
  /**
   * Cap the number of options rendered at once. Keeps very large lists (e.g.
   * every city in a country) from mounting thousands of DOM nodes - the search
   * box still reaches anything past the cap. Omit for no limit (the default).
   */
  maxResults?: number;
};

export function LocationSelect({
  label,
  placeholder,
  icon,
  required,
  disabled,
  value,
  options,
  onSelect,
  onBlur,
  error,
  className,
  emptyMessage = "No results found.",
  maxResults,
}: LocationSelectProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);

  const rootRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const listboxId = useId();

  // True only when `active` last changed via keyboard (or panel open). Hover
  // also moves `active`, but auto-scrolling on hover fights the wheel: options
  // sliding under the cursor fire onMouseEnter → scrollIntoView, cancelling the
  // scroll. So we scroll into view for keys, not for the mouse.
  const keyboardNav = useRef(false);

  const invalid = Boolean(error);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const matches = q
      ? options.filter((o) => o.name.toLowerCase().includes(q))
      : options;
    return maxResults ? matches.slice(0, maxResults) : matches;
  }, [options, query, maxResults]);

  // How many matched before the cap - drives the "keep typing" hint.
  const totalMatches = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options.length;
    return options.reduce(
      (n, o) => (o.name.toLowerCase().includes(q) ? n + 1 : n),
      0,
    );
  }, [options, query]);

  // Close on outside click.
  useEffect(() => {
    if (!open) return;
    const onDocClick = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) close();
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [open]);

  // Focus the search box when the panel opens.
  useEffect(() => {
    if (open) searchRef.current?.focus();
  }, [open]);

  // Keep the highlighted option scrolled into view - keyboard/open only.
  useEffect(() => {
    if (!open || !keyboardNav.current) return;
    keyboardNav.current = false;
    const el = listRef.current?.children[active] as HTMLElement | undefined;
    el?.scrollIntoView({ block: "nearest" });
  }, [active, open]);

  const close = () => {
    setOpen(false);
    setQuery("");
    onBlur?.();
  };

  const openPanel = () => {
    if (disabled) return;
    setOpen(true);
    setQuery("");
    // Highlight the current selection if there is one, and scroll to it.
    keyboardNav.current = true;
    const idx = options.findIndex((o) => o.name === value);
    setActive(idx >= 0 ? idx : 0);
  };

  const choose = (option: LocationOption) => {
    onSelect(option);
    setOpen(false);
    setQuery("");
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
        keyboardNav.current = true;
        setActive((a) => Math.min(a + 1, filtered.length - 1));
        break;
      case "ArrowUp":
        e.preventDefault();
        keyboardNav.current = true;
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
    <div className={className} ref={rootRef}>
      <div
        className={
          cardClass +
          " relative block " +
          (disabled ? disabledClass + " " : "cursor-pointer ") +
          (invalid
            ? "!border-red-400/70 focus-within:!border-red-500 focus-within:!shadow-[0_8px_24px_-10px_rgba(239,68,68,0.45)]"
            : "")
        }
      >
        <button
          type="button"
          disabled={disabled}
          onClick={() => (open ? close() : openPanel())}
          onKeyDown={onKeyDown}
          role="combobox"
          aria-expanded={open}
          aria-haspopup="listbox"
          aria-controls={listboxId}
          aria-invalid={invalid}
          className="flex w-full items-center gap-3 text-left disabled:cursor-not-allowed"
        >
          {icon && <span aria-hidden>{icon}</span>}
          <span className="min-w-0 flex-1">
            <span className={labelClass}>
              {label}
              {required && <span className="text-bluehour"> *</span>}
            </span>
            <span
              className={
                controlClass +
                " block truncate " +
                (value ? "" : "text-darkroom/30")
              }
            >
              {value || placeholder}
            </span>
          </span>
          <ChevronDown
            aria-hidden
            className={
              "h-4 w-4 shrink-0 text-darkroom/35 transition-transform duration-200 " +
              (open ? "rotate-180" : "")
            }
          />
        </button>

        {open && (
          <div className="absolute inset-x-0 top-[calc(100%+0.5rem)] z-30 overflow-hidden rounded-xl border-2 border-darkroom/12 bg-overexpose shadow-[0_16px_40px_-12px_rgba(31,26,24,0.35)]">
            <div className="flex items-center gap-2 border-b border-darkroom/10 px-3 py-2">
              <Search aria-hidden className="h-4 w-4 shrink-0 text-darkroom/35" />
              <input
                ref={searchRef}
                type="text"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  keyboardNav.current = true;
                  setActive(0);
                }}
                onKeyDown={onKeyDown}
                placeholder={`Search ${label.toLowerCase()}…`}
                aria-label={`Search ${label.toLowerCase()}`}
                className="w-full bg-transparent text-base md:text-sm text-darkroom outline-none placeholder:text-darkroom/30"
              />
            </div>
            <ul
              ref={listRef}
              id={listboxId}
              role="listbox"
              aria-label={label}
              // Lenis hijacks wheel events page-wide; this opts the list out so
              // it scrolls on its own. See providers/SmoothScroll.tsx.
              data-lenis-prevent
              className="max-h-60 overflow-y-auto overscroll-contain py-1"
            >
              {filtered.length === 0 ? (
                <li className="px-4 py-3 text-sm text-darkroom/45">
                  {options.length === 0 ? emptyMessage : "No results found."}
                </li>
              ) : (
                filtered.map((option, i) => {
                  const selected = option.name === value;
                  return (
                    <li
                      key={option.isoCode + option.name}
                      role="option"
                      aria-selected={selected}
                      onMouseEnter={() => setActive(i)}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        choose(option);
                      }}
                      className={
                        "flex cursor-pointer items-center justify-between gap-2 px-4 py-2 text-sm text-darkroom " +
                        (i === active ? "bg-bluehour/10" : "")
                      }
                    >
                      <span className="truncate">{option.name}</span>
                      {selected && (
                        <Check className="h-4 w-4 shrink-0 text-bluehour" />
                      )}
                    </li>
                  );
                })
              )}
            </ul>
            {totalMatches > filtered.length && (
              <p className="border-t border-darkroom/10 px-4 py-2 text-xs text-darkroom/45">
                Showing {filtered.length} of {totalMatches} — keep typing to
                narrow.
              </p>
            )}
          </div>
        )}
      </div>

      {invalid && (
        <p className="status-rise mt-1.5 flex items-center gap-1 pl-1 text-xs font-semibold text-red-500">
          <AlertCircle className="size-3.5 shrink-0" />
          {error}
        </p>
      )}
    </div>
  );
}
