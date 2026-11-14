import catalogue from "./soniox-languages.json";

/**
 * CatchZone Voice language catalogue — the ONLY language list used on the
 * site (Conversation Studio selectors, /voice/languages, /voice/business and
 * server-side validation in /api/voice/*).
 *
 * The underlying data is generated from Soniox's official documentation by
 * `scripts/voice/sync-soniox-languages.mjs`; never hand-edit the JSON. Soniox
 * documents the same 60 languages for speech recognition, translation (any
 * supported pair) and text-to-speech, and the sync script refuses to write a
 * catalogue if those three tables ever diverge.
 */

export type TextDirection = "ltr" | "rtl";

export interface VoiceLanguage {
  /** ISO 639-1 code exactly as Soniox documents it. */
  code: string;
  /** English name exactly as Soniox documents it. */
  name: string;
  /** Endonym from Unicode CLDR (see sync script for the few overrides). */
  nativeName: string;
  dir: TextDirection;
  /** Documented script restriction for spoken (TTS) output, if any. */
  speechOutputNote?: string;
}

export type LanguageGroupId =
  | "europe"
  | "middle-east-central-asia"
  | "south-asia"
  | "east-southeast-asia"
  | "africa";

export interface LanguageGroup {
  id: LanguageGroupId;
  label: string;
  codes: string[];
}

/**
 * Presentation grouping only (by where each language is principally
 * associated). It is not a statement about dialect or regional-accent
 * coverage, and widely spoken languages such as English, Spanish, French,
 * Portuguese and Arabic are of course used far beyond their group.
 */
export const LANGUAGE_GROUPS: LanguageGroup[] = [
  {
    id: "europe",
    label: "European languages",
    codes: [
      "sq", "eu", "be", "bs", "bg", "ca", "hr", "cs", "da", "nl", "en", "et",
      "fi", "fr", "gl", "de", "el", "hu", "it", "lv", "lt", "mk", "no", "pl",
      "pt", "ro", "ru", "sr", "sk", "sl", "es", "sv", "uk", "cy",
    ],
  },
  {
    id: "middle-east-central-asia",
    label: "Middle East, Caucasus & Central Asia",
    codes: ["ar", "az", "fa", "he", "kk", "tr"],
  },
  {
    id: "south-asia",
    label: "South Asia",
    codes: ["bn", "gu", "hi", "kn", "ml", "mr", "pa", "ta", "te", "ur"],
  },
  {
    id: "east-southeast-asia",
    label: "East & Southeast Asia",
    codes: ["zh", "id", "ja", "ko", "ms", "tl", "th", "vi"],
  },
  {
    id: "africa",
    label: "Africa",
    codes: ["af", "sw"],
  },
];

export const VOICE_LANGUAGES: VoiceLanguage[] = (catalogue.languages as VoiceLanguage[])
  .slice()
  .sort((a, b) => a.name.localeCompare(b.name, "en"));

export const LANGUAGE_COUNT = VOICE_LANGUAGES.length;

export const CATALOGUE_META = {
  provider: catalogue.provider,
  sttModel: catalogue.sttModel,
  ttsModel: catalogue.ttsModel,
  sources: catalogue.sources,
  retrievedAt: catalogue.retrievedAt,
  verifiedAgainstApi: catalogue.verifiedAgainstApi,
} as const;

const BY_CODE = new Map(VOICE_LANGUAGES.map((l) => [l.code, l]));

export function getLanguage(code: string): VoiceLanguage | undefined {
  return BY_CODE.get(code);
}

export function isSupportedLanguage(code: unknown): code is string {
  return typeof code === "string" && BY_CODE.has(code);
}

/**
 * A translation pair is valid when both languages are in the catalogue and
 * differ. Soniox documents translation between any pair of its supported
 * languages; translating a language into itself is meaningless and refused.
 */
export function isValidPair(source: unknown, target: unknown): boolean {
  return isSupportedLanguage(source) && isSupportedLanguage(target) && source !== target;
}

export function groupOf(code: string): LanguageGroup | undefined {
  return LANGUAGE_GROUPS.find((g) => g.codes.includes(code));
}

export const DEFAULT_SOURCE = "en";
export const DEFAULT_TARGET = "es";

// Build-time integrity guard: every catalogue language must be grouped once,
// and every grouped code must exist. Fails the build rather than silently
// rendering an incomplete list if the catalogue changes.
(() => {
  const grouped = LANGUAGE_GROUPS.flatMap((g) => g.codes);
  const missing = VOICE_LANGUAGES.filter((l) => !grouped.includes(l.code)).map((l) => l.code);
  const unknown = grouped.filter((c) => !BY_CODE.has(c));
  const dupes = grouped.filter((c, i) => grouped.indexOf(c) !== i);
  if (missing.length || unknown.length || dupes.length) {
    throw new Error(
      `Voice language groups out of sync with catalogue. missing=${missing} unknown=${unknown} duplicate=${dupes}`,
    );
  }
  if (!BY_CODE.has(DEFAULT_SOURCE) || !BY_CODE.has(DEFAULT_TARGET)) {
    throw new Error("Default Voice languages missing from catalogue.");
  }
})();
