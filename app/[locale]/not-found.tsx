import Link from "next/link";
import { getDictionary } from "@/lib/dictionaries";
import type { Locale } from "@/lib/config";
import { localeHref, normalizeLocale } from "@/lib/i18n";

export default async function LocaleNotFound({ params }: { params?: Promise<{ locale?: string }> }) {
  const locale = normalizeLocale((await params)?.locale ?? "") as Locale;
  const dict = getDictionary(locale);

  return (
    <div className="wrap py-24 text-center">
      <p className="eyebrow">404</p>
      <h1 className="mt-3 font-display text-3xl text-ink">{locale === "zh" ? "没有找到这个页面" : "This page slipped off the wall"}</h1>
      <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-ink-muted">
        {locale === "zh" ? "链接可能已更新，或产品已下架。试试从产品目录重新开始。" : "The link may have moved, or the product was retired. Start again from the catalogue."}
      </p>
      <div className="mt-7 flex flex-wrap justify-center gap-3">
        <Link href={localeHref(locale, "/")} className="btn btn-outline text-sm">
          {dict.nav.home}
        </Link>
        <Link href={localeHref(locale, "/products")} className="btn btn-primary text-sm">
          {dict.nav.products}
        </Link>
      </div>
    </div>
  );
}
