"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { VOICE_LANGUAGES, getLanguage, type VoiceLanguage } from "@/data/voice/languages";

interface LanguagePickerProps {
  label: string;
  value: string;
  /** Code that may not be chosen (the other side of the pair). */
  disallow?: string;
  disabled?: boolean;
  onChange: (code: string) => void;
}

function normalise(value: string): string {
  return value.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();
}

function matches(lang: VoiceLanguage, query: string): boolean {
  if (!query) return true;
  const q = normalise(query.trim());
  return (
    normalise(lang.name).includes(q) ||
    normalise(lang.nativeName).includes(q) ||
    lang.code === q
  );
}

/**
 * Searchable language selector (ARIA combobox + listbox). Keyboard:
 * ↑/↓ move, Home/End jump, Enter selects, Esc closes. Options that would
 * create an invalid pair are disabled rather than silently swapped.
 */
export function LanguagePicker({ label, value, disallow, disabled, onChange }: LanguagePickerProps) {
  const id = useId();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const selected = getLanguage(value);
  const results = useMemo(() => VOICE_LANGUAGES.filter((l) => matches(l, query)), [query]);

  useEffect(() => {
    if (!open) return;
    const selectedIndex = results.findIndex((l) => l.code === value);
    setActiveIndex(selectedIndex >= 0 ? selectedIndex : 0);
    requestAnimationFrame(() => inputRef.current?.focus());
    // Only when opening.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onPointer = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) close(false);
    };
    document.addEventListener("pointerdown", onPointer);
    return () => document.removeEventListener("pointerdown", onPointer);
  }, [open]);

  useEffect(() => {
    const el = listRef.current?.querySelector<HTMLElement>(`[data-index="${activeIndex}"]`);
    el?.scrollIntoView({ block: "nearest" });
  }, [activeIndex, open]);

  function close(returnFocus: boolean) {
    setOpen(false);
    setQuery("");
    if (returnFocus) buttonRef.current?.focus();
  }

  function choose(lang: VoiceLanguage | undefined) {
    if (!lang || lang.code === disallow) return;
    onChange(lang.code);
    close(true);
  }

  function move(delta: number) {
    if (results.length === 0) return;
    setActiveIndex((i) => (i + delta + results.length) % results.length);
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        move(1);
        break;
      case "ArrowUp":
        e.preventDefault();
        move(-1);
        break;
      case "Home":
        e.preventDefault();
        setActiveIndex(0);
        break;
      case "End":
        e.preventDefault();
        setActiveIndex(Math.max(0, results.length - 1));
        break;
      case "Enter":
        e.preventDefault();
        choose(results[activeIndex]);
        break;
      case "Escape":
        e.preventDefault();
        close(true);
        break;
      case "Tab":
        close(false);
        break;
    }
  }

  const listId = `${id}-list`;
  const labelId = `${id}-label`;

  return (
    <div
      ref={rootRef}
      className="relative min-w-0 flex-1"
      onKeyDown={(e) => {
        if (open && e.key === "Escape") {
          e.preventDefault();
          close(true);
        }
      }}
    >
      <span id={labelId} className="mono block text-[11px] uppercase tracking-[0.2em] text-ink-faint">
        {label}
      </span>
      <button
        ref={buttonRef}
        type="button"
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-labelledby={`${labelId} ${id}-value`}
        onClick={() => setOpen((v) => !v)}
        className="group mt-2 flex h-16 w-full items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/[0.03] px-4 text-left transition-colors hover:border-accent-cyan/40 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:border-white/10"
      >
        <span id={`${id}-value`} className="min-w-0">
          <span className="block truncate text-base font-semibold leading-snug text-ink md:text-lg">
            {selected?.name ?? value}
          </span>
          {selected && selected.nativeName !== selected.name && (
            <span
              lang={selected.code}
              dir={selected.dir}
              className="block truncate text-sm leading-snug text-ink-muted"
            >
              {selected.nativeName}
            </span>
          )}
        </span>
        <svg
          viewBox="0 0 16 16"
          className={`h-4 w-4 shrink-0 text-ink-muted transition-transform ${open ? "rotate-180" : ""}`}
          aria-hidden="true"
        >
          <path d="M4 6l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.5" />
        </svg>
      </button>

      {open && (
        <div className="absolute left-0 right-0 z-30 mt-2 overflow-hidden rounded-2xl border border-white/10 bg-surface-raised shadow-[0_24px_60px_-20px_rgba(0,0,0,0.8)] sm:min-w-[300px]">
          <div className="border-b border-line p-2">
            <input
              ref={inputRef}
              type="text"
              role="combobox"
              aria-label={`Search ${label.toLowerCase()} languages`}
              aria-expanded="true"
              aria-controls={listId}
              aria-autocomplete="list"
              aria-activedescendant={results[activeIndex] ? `${id}-opt-${results[activeIndex]!.code}` : undefined}
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setActiveIndex(0);
              }}
              onKeyDown={onKeyDown}
              placeholder="Search languages"
              autoComplete="off"
              spellCheck={false}
              className="w-full rounded-xl bg-white/[0.04] px-3 py-3 text-base text-ink placeholder:text-ink-faint focus:outline-none focus-visible:outline-2 focus-visible:outline-accent-cyan"
            />
          </div>
          <ul
            ref={listRef}
            id={listId}
            role="listbox"
            aria-labelledby={labelId}
            className="max-h-[min(320px,50vh)] overflow-y-auto overscroll-contain p-1.5"
          >
            {results.length === 0 && (
              <li className="px-3 py-4 text-sm text-ink-muted" role="presentation">
                No supported language matches “{query}”.
              </li>
            )}
            {results.map((lang, index) => {
              const isSelected = lang.code === value;
              const isDisallowed = lang.code === disallow;
              return (
                <li
                  key={lang.code}
                  id={`${id}-opt-${lang.code}`}
                  data-index={index}
                  role="option"
                  aria-selected={isSelected}
                  aria-disabled={isDisallowed || undefined}
                  onPointerMove={() => setActiveIndex(index)}
                  // Keep focus in the search field so the keyboard keeps working.
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => choose(lang)}
                  className={`flex min-h-[44px] cursor-pointer items-center justify-between gap-3 rounded-lg px-3 py-2 text-sm ${
                    index === activeIndex ? "bg-white/[0.06]" : ""
                  } ${isDisallowed ? "cursor-not-allowed opacity-40" : ""}`}
                >
                  <span className="min-w-0">
                    <span className={`block truncate ${isSelected ? "font-semibold text-accent-cyan" : "text-ink"}`}>
                      {lang.name}
                    </span>
                    {isDisallowed && (
                      <span className="block text-xs text-ink-faint">Already selected on the other side</span>
                    )}
                  </span>
                  {lang.nativeName !== lang.name && (
                    <span lang={lang.code} dir={lang.dir} className="shrink-0 text-ink-muted">
                      {lang.nativeName}
                    </span>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
