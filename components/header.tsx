import Link from "next/link";
import { brand, currencyList, type Locale } from "@/lib/config";
import type { Dictionary } from "@/lib/dictionaries";
import { localeHref, tr } from "@/lib/i18n";
import { formatCurrency } from "@/lib/money";
import { getCurrentCurrency } from "@/lib/preferences";
import type { UserRow } from "@/lib/auth";
import { CurrencyForm } from "./currency-form";
import { LanguageSwitch } from "./language-switch";

export function Logo({ locale }: { locale: Locale }) {
  return (
    <Link href={localeHref(locale)} className="flex items-center gap-2.5" aria-label={brand.name}>
      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-ink text-brass-soft">
        <svg viewBox="0 0 64 64" className="h-6 w-6" fill="none" aria-hidden="true">
          <path d="M12 42 L23 20 L32 38 L41 20 L52 42" stroke="currentColor" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
          <rect x="12" y="49" width="40" height="3.5" rx="1.75" fill="currentColor" />
        </svg>
      </span>
      <span className="leading-none">
        <span className="block font-display text-lg tracking-[0.22em] text-ink">WALLINE</span>
        <span className="mt-1 block text-[11px] tracking-[0.3em] text-ink-muted">{locale === "zh" ? "沃 澜" : "TRIM & PANELS"}</span>
      </span>
    </Link>
  );
}

export async function Header({
  locale,
  dict,
  cartCount,
  user,
}: {
  locale: Locale;
  dict: Dictionary;
  cartCount: number;
  user: UserRow | undefined;
}) {
  const currency = await getCurrentCurrency();
  const nav = [
    { href: localeHref(locale), label: dict.nav.home },
    { href: localeHref(locale, "/products"), label: dict.nav.products },
    { href: localeHref(locale, "/about"), label: dict.nav.about },
    { href: localeHref(locale, "/contact"), label: dict.nav.contact },
  ];
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-stone/95 backdrop-blur">
      <div className="bg-ink text-stone">
        <div className="wrap flex h-9 items-center justify-between text-[11px] tracking-wide sm:text-xs">
          <p>
            {tr(locale, {
              zh: `工厂直供 · 中国内地满 ${formatCurrency(99900, currency, locale)} 包邮`,
              en: `Factory direct · free China shipping over ${formatCurrency(99900, currency, locale)}`,
            })}
          </p>
          <p className="hidden sm:block">
            {tr(locale, {
              zh: `海外 DHL / 海运双通道 · ${brand.email}`,
              en: `Worldwide DHL & sea freight · ${brand.email}`,
            })}
          </p>
        </div>
      </div>

      <div className="wrap flex h-16 items-center gap-3 md:h-20 md:gap-6">
        <Logo locale={locale} />

        <nav className="hidden items-center gap-1 md:flex">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-full px-3 py-2 text-sm font-medium text-ink-soft transition hover:bg-stone-deep hover:text-ink"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-1.5 sm:gap-3">
          <CurrencyForm currency={currency} className="hidden sm:block" />
          <LanguageSwitch locale={locale} className="hidden sm:inline-flex" />
          <Link
            href={user ? localeHref(locale, "/account") : localeHref(locale, "/account/login")}
            className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-2 text-sm font-medium text-ink transition hover:text-brass-deep"
            aria-label={dict.nav.account}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className="h-5 w-5">
              <circle cx="12" cy="8" r="3.6" />
              <path d="M4.5 20c1.2-3.6 4-5.4 7.5-5.4s6.3 1.8 7.5 5.4" strokeLinecap="round" />
            </svg>
            <span className="hidden lg:inline">{user ? user.name || dict.nav.account : dict.nav.signIn}</span>
          </Link>
          <Link
            href={localeHref(locale, "/cart")}
            className="relative inline-flex items-center gap-1.5 rounded-full bg-ink px-3.5 py-2 text-sm font-semibold text-white transition hover:bg-ink-soft"
            aria-label={dict.nav.cart}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className="h-5 w-5">
              <path d="M4 5h2l2.2 11.2a1.5 1.5 0 0 0 1.5 1.2h7.9a1.5 1.5 0 0 0 1.5-1.2L21 9H7" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="10" cy="20" r="1.2" />
              <circle cx="18" cy="20" r="1.2" />
            </svg>
            <span className="hidden sm:inline">{dict.nav.cart}</span>
            {cartCount > 0 ? (
              <span className="absolute -right-1 -top-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-brass px-1 text-[11px] font-bold text-white">
                {cartCount > 99 ? "99+" : cartCount}
              </span>
            ) : null}
          </Link>
        </div>
      </div>

      <div className="wrap flex items-center gap-2 overflow-x-auto border-t border-line/70 py-2 md:hidden">
        {nav.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="whitespace-nowrap rounded-full border border-line px-3 py-1.5 text-xs font-medium text-ink-soft"
          >
            {item.label}
          </Link>
        ))}
        <LanguageSwitch locale={locale} className="shrink-0 sm:hidden" />
        <CurrencyForm currency={currency} className="shrink-0 sm:hidden" />
      </div>
    </header>
  );
}

export function currencyCodes(): string[] {
  return currencyList.map((item) => item.code);
}
