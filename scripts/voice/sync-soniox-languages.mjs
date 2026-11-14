#!/usr/bin/env node
/**
 * Regenerates src/data/voice/soniox-languages.json — the single source of
 * truth for every CatchZone Voice language list (Conversation Studio
 * selectors, /voice/languages, /voice/business, API validation).
 *
 * Source of truth: Soniox's official documentation tables for
 *   - Speech-to-Text supported languages
 *   - Speech translation supported languages
 *   - Text-to-Speech supported languages
 * The script refuses to write a catalogue unless all three tables agree,
 * because the demo needs every language to work for recognition,
 * translation AND spoken output.
 *
 * Optional live verification: if SONIOX_API_KEY is set (a key with only the
 * "Model listing" permission is sufficient), the script also calls
 * GET https://api.soniox.com/v1/models and GET https://tts-rt.soniox.com/models
 * and fails if the API's language codes differ from the documentation.
 * Model listing returns metadata only; it does not process audio.
 *
 * Native names and writing direction are derived from the Unicode CLDR data
 * bundled with Node (Intl.DisplayNames / Intl.Locale) rather than typed by
 * hand.
 *
 * Usage: node scripts/voice/sync-soniox-languages.mjs
 */
import { writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const DOCS = {
  stt: "https://docs.soniox.com/stt/concepts/supported-languages.mdx",
  translation: "https://docs.soniox.com/translation/supported-languages.mdx",
  tts: "https://docs.soniox.com/tts/concepts/supported-languages.mdx",
};
const STT_MODEL = "stt-rt-v6";
const TTS_MODEL = "tts-rt-v2";

const here = path.dirname(fileURLToPath(import.meta.url));
const outFile = path.resolve(here, "../../src/data/voice/soniox-languages.json");

/** Parses the "| Language | ISO Code |" markdown table from a docs page. */
function parseTable(markdown) {
  const rows = [];
  for (const line of markdown.split("\n")) {
    const m = line.match(/^\|\s*([^|]+?)\s*\|\s*([a-z]{2,3})\s*\|\s*$/);
    if (m && m[1] !== "Language") rows.push({ name: m[1], code: m[2] });
  }
  return rows;
}

async function fetchText(url, init) {
  const res = await fetch(url, init);
  if (!res.ok) throw new Error(`${url} → HTTP ${res.status}`);
  return res.text();
}

function sameCodes(a, b) {
  const x = [...a].sort().join(",");
  const y = [...b].sort().join(",");
  return x === y;
}

function direction(code) {
  const locale = new Intl.Locale(code).maximize();
  const info = typeof locale.getTextInfo === "function" ? locale.getTextInfo() : locale.textInfo;
  return info?.direction === "rtl" ? "rtl" : "ltr";
}

/**
 * CLDR's short-form endonyms are ambiguous for a few codes (e.g. it renders
 * `tl` as "Filipino", which is not what Soniox documents). These overrides
 * keep the native label consistent with the documented language.
 */
const NATIVE_NAME_OVERRIDES = {
  tl: "Tagalog",
  id: "Bahasa Indonesia",
  ms: "Bahasa Melayu",
};

/**
 * Pulls script restrictions from the TTS page, e.g.
 * "* **Serbian (`sr`)** and **Bosnian (`bs`)**: Latin script only (not Cyrillic)."
 */
function parseScriptNotes(markdown) {
  const notes = {};
  for (const line of markdown.split("\n")) {
    if (!/only \(not /i.test(line)) continue;
    const note = line.split(":").slice(1).join(":").trim().replace(/\.$/, "");
    for (const m of line.matchAll(/\(`([a-z]{2,3})`\)/g)) notes[m[1]] = note;
  }
  return notes;
}

function nativeName(code) {
  if (NATIVE_NAME_OVERRIDES[code]) return NATIVE_NAME_OVERRIDES[code];
  const name = new Intl.DisplayNames([code], { type: "language", fallback: "none" }).of(code);
  if (!name) return null;
  // Capitalise the first letter for scripts that have case (e.g. "español" → "Español").
  return name.charAt(0).toLocaleUpperCase(code) + name.slice(1);
}

const tables = {};
let ttsScriptNotes = {};
for (const [key, url] of Object.entries(DOCS)) {
  const markdown = await fetchText(url);
  tables[key] = parseTable(markdown);
  if (key === "tts") ttsScriptNotes = parseScriptNotes(markdown);
  if (tables[key].length < 10) throw new Error(`Could not parse language table from ${url}`);
}

const sttCodes = tables.stt.map((l) => l.code);
for (const key of ["translation", "tts"]) {
  if (!sameCodes(sttCodes, tables[key].map((l) => l.code))) {
    throw new Error(`Soniox ${key} language table differs from the STT table — review before publishing.`);
  }
}

const apiKey = process.env.SONIOX_API_KEY;
let apiVerified = false;
if (apiKey) {
  const headers = { Authorization: `Bearer ${apiKey}` };
  const stt = JSON.parse(await fetchText("https://api.soniox.com/v1/models", { headers }));
  const sttModel = (stt.models ?? []).find((m) => m.id === STT_MODEL);
  if (!sttModel) throw new Error(`${STT_MODEL} not found in GET /v1/models`);
  if (!sameCodes(sttCodes, sttModel.languages.map((l) => l.code))) {
    throw new Error(`${STT_MODEL} API languages differ from the documentation table.`);
  }
  const tts = JSON.parse(await fetchText("https://tts-rt.soniox.com/models", { headers }));
  const ttsModel = (tts.models ?? tts).find?.((m) => m.id === TTS_MODEL);
  if (ttsModel && !sameCodes(sttCodes, ttsModel.languages.map((l) => l.code))) {
    throw new Error(`${TTS_MODEL} API languages differ from the documentation table.`);
  }
  apiVerified = true;
}

const languages = tables.stt.map(({ name, code }) => ({
  code,
  name,
  nativeName: nativeName(code) ?? name,
  dir: direction(code),
  ...(ttsScriptNotes[code] ? { speechOutputNote: ttsScriptNotes[code] } : {}),
}));

const catalogue = {
  $comment:
    "GENERATED by scripts/voice/sync-soniox-languages.mjs — do not edit by hand. Re-run the script to refresh.",
  provider: "Soniox",
  sttModel: STT_MODEL,
  ttsModel: TTS_MODEL,
  sources: Object.values(DOCS),
  retrievedAt: new Date().toISOString().slice(0, 10),
  verifiedAgainstApi: apiVerified,
  translation: "any-pair",
  languages,
};

await writeFile(outFile, `${JSON.stringify(catalogue, null, 2)}\n`);
console.log(`Wrote ${languages.length} languages to ${path.relative(process.cwd(), outFile)} (API verified: ${apiVerified}).`);
