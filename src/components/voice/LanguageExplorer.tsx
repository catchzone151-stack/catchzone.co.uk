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
        <div className="mt-8 space-y-14">
          {LANGUAGE_GROUPS.map((group) => (
            <section key={group.id} aria-labelledby={`group-${group.id}`}>
              <div className="flex items-baseline justify-between gap-4 border-b border-line pb-3">
                <h2 id={`group-${group.id}`} className="font-display text-2xl font-bold text-ink">
                  {group.label}
                </h2>
                <span className="mono text-xs text-ink-faint">{group.codes.length}</span>
              </div>
              {group.id === "europe" && (
                <p className="mt-3 max-w-2xl text-sm text-ink-muted">
                  Including {EU_OFFICIAL_SUPPORTED} of the 24 official languages of the European Union — useful for UK
                  and EU teams supporting customers across the continent.
                </p>
              )}
              <LanguageGrid
                languages={group.codes
                  .map((c) => getLanguage(c)!)
                  .sort((a, b) => a.name.localeCompare(b.name, "en"))}
              />
            </section>
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
    <ul className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {languages.map((l) => {
        // Pair with English by default; English itself pairs with Spanish.
        const from = l.code === DEFAULT_SOURCE ? "en" : DEFAULT_SOURCE;
        const to = l.code === DEFAULT_SOURCE ? "es" : l.code;
        return (
          <li key={l.code} className="group relative rounded-2xl border border-white/[0.08] bg-white/[0.02] p-4 transition-colors hover:border-accent-cyan/35">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="font-semibold text-ink">{l.name}</p>
                {l.nativeName !== l.name && (
                  <p lang={l.code} dir={l.dir} className="mt-1 truncate text-lg text-ink-muted">
                    {l.nativeName}
                  </p>
                )}
              </div>
              <span className="mono mt-0.5 shrink-0 rounded-md border border-white/10 px-1.5 py-0.5 text-[11px] uppercase text-ink-faint">
                {l.code}
              </span>
            </div>
            {(l.dir === "rtl" || l.speechOutputNote) && (
              <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px] text-ink-faint">
                {l.dir === "rtl" && <span className="rounded-full bg-white/[0.05] px-2 py-0.5">Right-to-left</span>}
                {l.speechOutputNote && (
                  <span className="rounded-full bg-white/[0.05] px-2 py-0.5">Spoken output: {l.speechOutputNote}</span>
                )}
              </div>
            )}
            <Link
              href={`/voice?from=${from}&to=${to}#studio`}
              className="mt-3 inline-flex min-h-[32px] items-center text-xs font-semibold text-accent-cyan after:absolute after:inset-0 after:rounded-2xl hover:underline"
              aria-label={`Try ${getLanguage(from)?.name} and ${getLanguage(to)?.name} in the Conversation Studio`}
            >
              Try {getLanguage(from)?.name} ⇄ {getLanguage(to)?.name} →
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
