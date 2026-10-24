import { locales, defaultLocale, type Locale } from "./config";

export function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}

export function normalizeLocale(value: string | undefined): Locale {
  return value && isLocale(value) ? value : defaultLocale;
}

export function otherLocale(locale: Locale): Locale {
  return locale === "zh" ? "en" : "zh";
}

export function localeLabel(locale: Locale): string {
  return locale === "zh" ? "中文" : "English";
}

/** Build a path for a locale, e.g. localeHref("en", "/products") -> "/en/products". */
export function localeHref(locale: Locale, path = "/"): string {
  if (path === "/") return `/${locale}`;
  return `/${locale}${path.startsWith("/") ? path : `/${path}`}`;
}

/** Pick a bilingual pair by locale. */
export function tr<T>(locale: Locale, pair: { zh: T; en: T }): T {
  return locale === "zh" ? pair.zh : pair.en;
}

export const htmlLang: Record<Locale, string> = { zh: "zh-CN", en: "en" };

/** Only allow same-site absolute paths, to keep redirects safe. */
export function safeInternalPath(path: string | null | undefined, fallback = "/"): string {
  if (!path || !path.startsWith("/") || path.startsWith("//")) return fallback;
  return path;
}
