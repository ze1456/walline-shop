import Link from "next/link";
import { brand, paymentMethods, type Locale } from "@/lib/config";
import type { Dictionary } from "@/lib/dictionaries";
import { localeHref, tr } from "@/lib/i18n";
import { listCategories } from "@/lib/data";

export async function Footer({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const categories = await listCategories();
  const infoLinks = ["about", "contact", "shipping", "returns", "privacy", "terms"] as const;
  const infoLabels: Record<(typeof infoLinks)[number], string> = {
    about: dict.footer.about,
    contact: dict.footer.contact,
    shipping: dict.footer.shippingPolicy,
    returns: dict.footer.returns,
    privacy: dict.footer.privacy,
    terms: dict.footer.terms,
  };
  return (
    <footer className="mt-20 border-t border-line bg-ink text-stone">
      <div className="wrap grid gap-10 py-14 md:grid-cols-12">
        <div className="md:col-span-4">
          <p className="font-display text-2xl tracking-[0.22em] text-white">WALLINE</p>
          <p className="mt-1 text-[11px] tracking-[0.3em] text-brass-soft">{locale === "zh" ? "沃 澜 · 建筑装饰线条" : "ARCHITECTURAL TRIM & PANELS"}</p>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-stone/70">{dict.footer.tagline}</p>
          <p className="mt-5 text-sm text-stone/70">{brand.email}</p>
          <p className="text-sm text-stone/70">{locale === "zh" ? brand.phoneZh : brand.phoneEn}</p>
          <p className="mt-4 max-w-xs text-xs leading-relaxed text-stone/50">{locale === "zh" ? brand.addressZh : brand.addressEn}</p>
        </div>

        <div className="md:col-span-2">
          <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-brass-soft">{dict.footer.productsTitle}</h3>
          <ul className="mt-4 space-y-2.5 text-sm text-stone/70">
            {categories.map((category) => (
              <li key={category.slug}>
                <Link href={localeHref(locale, `/products?category=${category.slug}`)} className="transition hover:text-white">
                  {tr(locale, { zh: category.name_zh, en: category.name_en })}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="md:col-span-2">
          <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-brass-soft">{dict.footer.companyTitle}</h3>
          <ul className="mt-4 space-y-2.5 text-sm text-stone/70">
            {infoLinks.slice(0, 2).map((slug) => (
              <li key={slug}>
                <Link href={localeHref(locale, `/${slug}`)} className="transition hover:text-white">
                  {infoLabels[slug]}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="md:col-span-2">
          <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-brass-soft">{dict.footer.supportTitle}</h3>
          <ul className="mt-4 space-y-2.5 text-sm text-stone/70">
            {infoLinks.slice(2).map((slug) => (
              <li key={slug}>
                <Link href={localeHref(locale, `/${slug}`)} className="transition hover:text-white">
                  {infoLabels[slug]}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="md:col-span-2">
          <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-brass-soft">{dict.footer.newsletter}</h3>
          <form className="mt-4 flex flex-col gap-2">
            <input type="email" placeholder={dict.footer.emailPlaceholder} className="rounded-lg border border-stone/25 bg-transparent px-3 py-2 text-sm text-white placeholder:text-stone/40 focus:border-brass-soft focus:outline-none" />
            <button type="button" className="rounded-lg bg-brass px-3 py-2 text-sm font-semibold text-white transition hover:bg-brass-deep">
              {dict.footer.subscribe}
            </button>
          </form>
        </div>
      </div>

      <div className="border-t border-stone/10">
        <div className="wrap flex flex-col gap-4 py-6 md:flex-row md:items-center md:justify-between">
          <p className="text-xs text-stone/50">{dict.footer.copyright.replace("{year}", String(new Date().getFullYear()))}</p>
          <div className="flex flex-wrap items-center gap-2 text-[11px] text-stone/60">
            <span className="uppercase tracking-[0.18em] text-stone/40">{dict.footer.paymentTitle}</span>
            {paymentMethods.map((method) => (
              <span key={method.id} className="rounded border border-stone/20 px-2 py-0.5">
                {tr(locale, { zh: method.nameZh, en: method.nameEn })}
              </span>
            ))}
          </div>
          <p className="text-xs text-stone/50">{dict.footer.madeIn}</p>
        </div>
      </div>
    </footer>
  );
}
