/**
 * Language support for the public site.
 *
 * The content tree itself stays single-shaped: every leaf is a string, exactly
 * as `defaults.ts` declares it. A language lives in the *override key* instead,
 * as a trailing segment — `home.hero.title.th` and `home.hero.title.en` are two
 * translations of the one `home.hero.title` leaf.
 *
 * Keeping the language in a suffix rather than a prefix matters: the backend
 * derives the `page` column from the first segment of the key, so `th.home.…`
 * would file every Thai row under a page called "th".
 */

export const LANGS = ["en", "th"] as const;
export type Lang = (typeof LANGS)[number];

/** English is what `defaults.ts` is written in, so it is the safest fallback. */
export const DEFAULT_LANG: Lang = "en";

const STORAGE_KEY = "bocusto.lang";

export function isLang(value: unknown): value is Lang {
  return typeof value === "string" && (LANGS as readonly string[]).includes(value);
}

/** `home.hero.title` + `th` -> `home.hero.title.th` */
export function langKey(key: string, lang: Lang): string {
  return `${key}.${lang}`;
}

/**
 * Splits the flat override map the API returns into one map per language,
 * with the language suffix stripped so the paths line up with the tree again.
 *
 * Keys saved before the site spoke two languages carry no suffix. They were
 * written against the English defaults, so that is where they are counted.
 */
export function splitOverridesByLang(overrides: Record<string, string>): Record<Lang, Record<string, string>> {
  const byLang: Record<Lang, Record<string, string>> = { en: {}, th: {} };
  const entries = Object.entries(overrides);

  // Legacy rows first, so that an explicit `<path>.en` always wins over the
  // unsuffixed row it replaces — whichever order the database returned them in.
  for (const [key, value] of entries) {
    const suffix = key.slice(key.lastIndexOf(".") + 1);
    if (!isLang(suffix)) byLang.en[key] = value;
  }

  for (const [key, value] of entries) {
    const cut = key.lastIndexOf(".");
    const suffix = key.slice(cut + 1);
    if (isLang(suffix)) byLang[suffix][key.slice(0, cut)] = value;
  }

  return byLang;
}

/**
 * Every key a value for `path` could be stored under, newest spelling first.
 * English has two because rows written before the site spoke two languages
 * carry no suffix.
 */
export function storageKeysFor(path: string, lang: Lang): string[] {
  return lang === "en" ? [langKey(path, "en"), path] : [langKey(path, lang)];
}

/** Drops the suffix from the drafts that belong to `lang`, ignoring the rest. */
export function draftsForLang(drafts: Record<string, string>, lang: Lang): Record<string, string> {
  const suffix = `.${lang}`;
  const result: Record<string, string> = {};

  for (const [key, value] of Object.entries(drafts)) {
    if (key.endsWith(suffix)) result[key.slice(0, -suffix.length)] = value;
  }

  return result;
}

/**
 * The visitor's last choice, then the browser's preference, then English.
 * Storage throws in private windows and when site data is blocked, so every
 * read and write here has to survive failing.
 */
export function readStoredLang(): Lang {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (isLang(stored)) return stored;
  } catch {
    // Ignore: an unreadable store just means we fall through to the browser.
  }

  try {
    if (navigator.language.toLowerCase().startsWith("th")) return "th";
  } catch {
    // Ignore: `navigator` is absent when this runs outside a browser.
  }

  return DEFAULT_LANG;
}

export function storeLang(lang: Lang): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, lang);
  } catch {
    // Ignore: remembering the choice is a convenience, not a requirement.
  }
}
