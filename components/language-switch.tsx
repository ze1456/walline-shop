"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { otherLocale, localeLabel } from "@/lib/i18n";
import type { Locale } from "@/lib/config";

export function LanguageSwitch({ locale, className }: { locale: Locale; className?: string }) {
  const pathname = usePathname() ?? `/${locale}`;
  const rest = pathname.replace(/^\/(zh|en)(?=\/|$)/, "");
  const target = otherLocale(locale);
  return (
    <Link
      href={`/${target}${rest}`}
      hrefLang={target}
      className={`inline-flex items-center gap-1 rounded-full border border-line px-3 py-1.5 text-xs font-semibold text-ink transition hover:border-ink ${className ?? ""}`}
      aria-label={localeLabel(target)}
    >
      <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" className="h-3.5 w-3.5">
        <circle cx="10" cy="10" r="7.5" />
        <path d="M2.5 10h15M10 2.5c2.2 2 3.4 4.6 3.4 7.5S12.2 15.5 10 17.5C7.8 15.5 6.6 12.9 6.6 10S7.8 4.5 10 2.5Z" />
      </svg>
      {locale === "zh" ? "EN" : "中文"}
    </Link>
  );
}
