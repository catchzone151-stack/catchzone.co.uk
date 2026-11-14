"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  DEFAULT_SOURCE,
  LANGUAGE_GROUPS,
  VOICE_LANGUAGES,
  getLanguage,
  type LanguageGroupId,
  type VoiceLanguage,
} from "@/data/voice/languages";

function normalise(value: string): string {
  return value.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();
}

type Filter = "all" | LanguageGroupId | "rtl";

/** The 24 official EU languages (ISO 639-1); counted against the catalogue rather than hard-coded. */
const EU_OFFICIAL = ["bg", "hr", "cs", "da", "nl", "en", "et", "fi", "fr", "de", "el", "hu", "ga", "it", "lv", "lt", "mt", "pl", "pt", "ro", "sk", "sl", "es", "sv"];
const EU_OFFICIAL_SUPPORTED = EU_OFFICIAL.filter((c) => getLanguage(c)).length;

/**
 * Searchable, filterable language catalogue. The full grouped list is in
 * the server-rendered HTML (all filters off), so it is crawlable and works
 * without JavaScript; search and filters progressively enhance it.
 */
export function LanguageExplorer() {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("all");

  const q = normalise(query.trim());
  const filtered = useMemo(
    () =>
      VOICE_LANGUAGES.filter((l) => {
        if (filter === "rtl" && l.dir !== "rtl") return false;
        if (filter !== "all" && filter !== "rtl" && !LANGUAGE_GROUPS.find((g) => g.id === filter)?.codes.includes(l.code)) {
          return false;
        }
        if (!q) return true;
        return normalise(l.name).includes(q) || normalise(l.nativeName).includes(q) || l.code === q;
      }),
    [q, filter],
  );

  const grouped = !q && filter === "all";
  const filters: { id: Filter; label: string; count: number }[] = [
    { id: "all", label: "All languages", count: VOICE_LANGUAGES.length },
    ...LANGUAGE_GROUPS.map((g) => ({ id: g.id as Filter, label: g.label, count: g.codes.length })),
    { id: "rtl", label: "Right-to-left scripts", count: VOICE_LANGUAGES.filter((l) => l.dir === "rtl").length },
  ];

  return (
    <div>
      <div className="flex flex-col gap-4">
        <label className="relative block w-full md:max-w-md">
          <span className="sr-only">Search languages</span>
          <svg viewBox="0 0 20 20" className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-faint" aria-hidden="true">
            <circle cx="9" cy="9" r="6" fill="none" stroke="currentColor" strokeWidth="1.5" />
            <path d="M13.5 13.5L17 17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name, native name or code"
            className="min-h-[52px] w-full rounded-full border border-white/10 bg-white/[0.03] pl-11 pr-4 text-base text-ink placeholder:text-ink-faint focus:border-accent-cyan/60 focus:outline-none"
            aria-describedby="language-results-count"
          />
        </label>
        <div role="group" aria-label="Filter languages" className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 sm:flex-wrap sm:overflow-visible">
          {filters.map((f) => (
            <button
              key={f.id}
              type="button"
              aria-pressed={filter === f.id}
              onClick={() => setFilter(f.id)}
              className={`min-h-[40px] shrink-0 rounded-full border px-4 text-sm transition-colors ${
                filter === f.id
                  ? "border-accent-cyan/50 bg-accent-cyan/[0.08] text-ink"
                  : "border-white/10 text-ink-muted hover:border-white/25 hover:text-ink"
              }`}
            >
              {f.label}
              <span className="mono ml-2 text-[11px] text-ink-faint">{f.count}</span>
            </button>
          ))}
        </div>
      </div>

      <p id="language-results-count" className="mt-5 text-sm text-ink-faint" aria-live="polite">
        {grouped
          ? `${VOICE_LANGUAGES.length} supported languages`
          : `${filtered.length} ${filtered.length === 1 ? "language" : "languages"} shown`}
      </p>

      {grouped ? (
        <div className="mt-8 space-y-4">
          {LANGUAGE_GROUPS.map((group) => (
            // Collapsible region. Open by default and always in the HTML, so every
            // language stays visible to visitors without JavaScript and to search engines.
            <details
              key={group.id}
              open
              className="group/region rounded-3xl border border-line bg-white/[0.015] px-4 py-2 sm:px-6"
            >
              <summary className="flex min-h-[56px] cursor-pointer list-none items-center justify-between gap-4 py-2 [&::-webkit-details-marker]:hidden">
                <h2 id={`group-${group.id}`} className="font-display text-xl font-bold text-ink sm:text-2xl">
                  {group.label}
                </h2>
                <span className="flex items-center gap-3">
                  <span className="mono text-xs text-ink-faint">
                    {group.codes.length} {group.codes.length === 1 ? "language" : "languages"}
                  </span>
                  <span
                    className="flex h-8 w-8 items-center justify-center rounded-full border border-white/15 text-ink-muted transition-transform group-open/region:rotate-180"
                    aria-hidden="true"
                  >
                    <svg viewBox="0 0 16 16" className="h-3.5 w-3.5">
                      <path d="M4 6l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.5" />
                    </svg>
                  </span>
                </span>
              </summary>
              {group.id === "europe" && (
                <p className="max-w-2xl text-sm text-ink-muted">
                  Including {EU_OFFICIAL_SUPPORTED} of the 24 official languages of the European Union — useful for UK
                  and EU teams supporting customers across the continent.
                </p>
              )}
              <div className="pb-4">
                <LanguageGrid
                  languages={group.codes
                    .map((c) => getLanguage(c)!)
                    .sort((a, b) => a.name.localeCompare(b.name, "en"))}
                />
              </div>
            </details>
          ))}
        </div>
      ) : filtered.length > 0 ? (
        <LanguageGrid languages={filtered} />
      ) : (
        <p className="mt-10 rounded-2xl border border-white/10 bg-white/[0.02] px-5 py-6 text-sm text-ink-muted">
          No supported language matches “{query}”. Speech translation is only offered in the languages listed on
          this page.
        </p>
      )}
    </div>
  );
}

function LanguageGrid({ languages }: { languages: VoiceLanguage[] }) {
  return (
    <ul className="mt-4 grid grid-cols-1 gap-2 min-[420px]:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
      {languages.map((l) => {
        // Pair with English by default; English itself pairs with Spanish.
        const from = l.code === DEFAULT_SOURCE ? "en" : DEFAULT_SOURCE;
        const to = l.code === DEFAULT_SOURCE ? "es" : l.code;
        const fromName = getLanguage(from)?.name;
        const toName = getLanguage(to)?.name;
        return (
          <li key={l.code}>
            {/* The whole card opens the Conversation Studio with this pair selected. */}
            <Link
              href={`/voice?from=${from}&to=${to}#studio`}
              aria-label={`${l.name}${l.nativeName !== l.name ? ` (${l.nativeName})` : ""} — try ${fromName} and ${toName} in the Conversation Studio`}
              className="group flex min-h-[64px] items-center justify-between gap-3 rounded-2xl border border-white/[0.08] bg-white/[0.02] px-4 py-3 transition-colors hover:border-accent-cyan/40 hover:bg-white/[0.04]"
            >
              <span className="min-w-0">
                <span className="block truncate text-sm font-semibold text-ink">{l.name}</span>
                {l.nativeName !== l.name && (
                  <span lang={l.code} dir={l.dir} className="block truncate text-sm text-ink-muted">
                    {l.nativeName}
                  </span>
                )}
                {(l.dir === "rtl" || l.speechOutputNote) && (
                  <span className="mt-1 block text-[11px] leading-snug text-ink-faint">
                    {[l.dir === "rtl" ? "Right-to-left" : null, l.speechOutputNote ? `Voice: ${l.speechOutputNote}` : null]
                      .filter(Boolean)
                      .join(" · ")}
                  </span>
                )}
              </span>
              <span className="flex shrink-0 flex-col items-end gap-1">
                <span className="mono rounded-md border border-white/10 px-1.5 py-0.5 text-[10px] uppercase text-ink-faint">
                  {l.code}
                </span>
                <span aria-hidden="true" className="text-xs text-accent-cyan opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
                  Try →
                </span>
              </span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
