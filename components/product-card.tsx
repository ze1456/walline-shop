import Link from "next/link";
import type { CurrencyCode, Locale } from "@/lib/config";
import type { Dictionary } from "@/lib/dictionaries";
import { localeHref, tr } from "@/lib/i18n";
import type { ProductRow } from "@/lib/data";
import { Price } from "./price";

export function ProductCard({
  product,
  locale,
  currency,
  dict,
}: {
  product: ProductRow;
  locale: Locale;
  currency: CurrencyCode;
  dict: Dictionary;
}) {
  const name = tr(locale, { zh: product.name_zh, en: product.name_en });
  const subtitle = tr(locale, { zh: product.subtitle_zh, en: product.subtitle_en });
  const unit = tr(locale, { zh: product.unit_zh, en: product.unit_en });
  const badge = product.badge_zh ? tr(locale, { zh: product.badge_zh, en: product.badge_en ?? product.badge_zh }) : null;
  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-line bg-white transition duration-300 hover:-translate-y-1 hover:border-brass-soft hover:shadow-[0_18px_40px_-28px_rgba(20,26,32,0.55)]">
      <Link href={localeHref(locale, `/products/${product.slug}`)} className="relative block aspect-[4/3] overflow-hidden bg-stone-deep">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={product.image || `/images/products/${product.slug}.svg`}
          alt={name}
          loading="lazy"
          className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.05]"
        />
        {badge ? (
          <span className="absolute left-3 top-3 rounded-full bg-ink/90 px-2.5 py-1 text-[11px] font-semibold tracking-wide text-white">{badge}</span>
        ) : null}
      </Link>
      <div className="flex flex-1 flex-col p-4">
        <Link href={localeHref(locale, `/products/${product.slug}`)} className="font-display text-[17px] leading-snug text-ink transition group-hover:text-brass-deep">
          {name}
        </Link>
        <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-ink-muted">{subtitle}</p>
        <div className="mt-auto flex items-end justify-between pt-4">
          <div>
            <p className="text-[11px] text-ink-muted">
              {dict.common.from} <Price cents={product.price_cents} currency={currency} locale={locale} className="font-semibold text-ink" />
              <span className="text-ink-muted"> / {unit}</span>
            </p>
            <p className="mt-0.5 text-[11px] text-ink-muted">
              {dict.common.moq} {product.moq} {unit}
            </p>
          </div>
          <Link
            href={localeHref(locale, `/products/${product.slug}`)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-line text-ink transition group-hover:border-ink group-hover:bg-ink group-hover:text-white"
            aria-label={dict.products.viewDetail}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4">
              <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
        </div>
      </div>
    </article>
  );
}
