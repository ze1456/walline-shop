import Link from "next/link";
import type { Metadata } from "next";
import { getDictionary } from "@/lib/dictionaries";
import { brand, type Locale } from "@/lib/config";
import { isLocale, localeHref, tr } from "@/lib/i18n";
import { categoryCounts, getFeaturedProducts, getSampleProduct, listCategories } from "@/lib/data";
import { getCurrentCurrency } from "@/lib/preferences";
import { ProductCard } from "@/components/product-card";
import { Price } from "@/components/price";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const zh = locale !== "en";
  return {
    title: zh ? "WALLINE 沃澜 · 工厂直供装饰线条与墙板" : "WALLINE · Factory-direct trim & wall panels",
  };
}

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) return null;
  const locale = raw as Locale;
  const dict = getDictionary(locale);
  const currency = await getCurrentCurrency();
  const categories = await listCategories();
  const counts = await categoryCounts();
  const featured = await getFeaturedProducts(8);
  const sample = await getSampleProduct();

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-line bg-stone">
        <div className="absolute inset-0 hero-grid opacity-70" aria-hidden="true" />
        <div className="absolute -right-40 top-1/2 h-[34rem] w-[34rem] -translate-y-1/2 rounded-full bg-brass-soft/20 blur-3xl" aria-hidden="true" />
        <div className="wrap relative grid gap-12 py-14 md:py-20 lg:grid-cols-2 lg:items-center">
          <div>
            <p className="eyebrow">{dict.home.eyebrow}</p>
            <h1 className="mt-5 font-display text-4xl leading-[1.1] tracking-tight text-ink sm:text-5xl lg:text-6xl">
              {locale === "zh" ? (
                <>
                  为空间，
                  <br />
                  做出<span className="text-brass-deep italic">干净的边界</span>
                </>
              ) : (
                <>
                  Clean edges
                  <br />
                  for <span className="text-brass-deep italic">every surface</span>
                </>
              )}
            </h1>
            <p className="mt-6 max-w-xl text-[15px] leading-relaxed text-ink-muted">{dict.home.subtitle}</p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link href={localeHref(locale, "/products")} className="btn btn-primary">
                {dict.home.ctaPrimary}
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4">
                  <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Link>
              <Link href={localeHref(locale, "/products/acc-sample")} className="btn btn-outline">
                {dict.home.ctaSecondary}
              </Link>
            </div>
            <dl className="mt-10 grid grid-cols-2 gap-x-6 gap-y-5 border-t border-line pt-7 sm:grid-cols-4">
              {[
                { value: String(brand.years), label: dict.home.statsYears },
                { value: `${brand.projects}+`, label: dict.home.statsProjects },
                { value: String(brand.countries), label: dict.home.statsCountries },
                { value: brand.factoryArea, label: dict.home.statsArea },
              ].map((stat) => (
                <div key={stat.label}>
                  <dt className="font-display text-2xl text-ink">{stat.value}</dt>
                  <dd className="mt-1 text-[11px] leading-tight text-ink-muted">{stat.label}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="relative mx-auto w-full max-w-lg lg:max-w-none">
            <div className="grid grid-cols-5 gap-3">
              <div className="col-span-3 overflow-hidden rounded-2xl border border-line bg-white shadow-[0_30px_60px_-40px_rgba(20,26,32,0.6)]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={featured[0]?.image ?? "/images/products/panel-flat-300.svg"} alt="" className="h-72 w-full object-cover sm:h-80" />
              </div>
              <div className="col-span-2 mt-10 space-y-3">
                <div className="overflow-hidden rounded-2xl border border-line bg-white shadow-[0_30px_60px_-40px_rgba(20,26,32,0.5)]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={featured[1]?.image ?? "/images/products/alu-t-profile-10.svg"} alt="" className="h-44 w-full object-cover" />
                </div>
                <div className="rounded-2xl border border-line bg-ink p-5 text-stone">
                  <p className="text-[11px] uppercase tracking-[0.2em] text-brass-soft">{tr(locale, { zh: "现货色卡", en: "In-stock finishes" })}</p>
                  <p className="mt-2 font-display text-lg leading-snug text-white">
                    {tr(locale, { zh: "4 种标准色，整批同色", en: "4 standard finishes, one consistent batch" })}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="wrap py-16 md:py-20">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow">{dict.products.filterCategory}</p>
            <h2 className="mt-3 font-display text-3xl text-ink md:text-4xl">{dict.home.categoriesTitle}</h2>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-ink-muted">{dict.home.categoriesSubtitle}</p>
          </div>
          <Link href={localeHref(locale, "/products")} className="text-sm font-semibold text-brass-deep underline-offset-4 hover:underline">
            {dict.common.viewAll} →
          </Link>
        </div>
        <div className="mt-9 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {categories.map((category) => (
            <Link
              key={category.slug}
              href={localeHref(locale, `/products?category=${category.slug}`)}
              className="group relative overflow-hidden rounded-2xl border border-line bg-white"
            >
              <div className="aspect-[5/3] overflow-hidden bg-stone-deep">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={category.image || `/images/categories/${category.slug}.svg`}
                  alt={tr(locale, { zh: category.name_zh, en: category.name_en })}
                  className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                />
              </div>
              <div className="p-4">
                <p className="font-display text-lg text-ink">{tr(locale, { zh: category.name_zh, en: category.name_en })}</p>
                <p className="mt-1 text-xs leading-relaxed text-ink-muted">{tr(locale, { zh: category.tagline_zh, en: category.tagline_en })}</p>
                <p className="mt-3 text-[11px] font-semibold text-brass-deep">
                  {counts[category.slug] ?? 0} {tr(locale, { zh: "款在售", en: "products" })} →
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured */}
      <section className="border-y border-line bg-white/50">
        <div className="wrap py-16 md:py-20">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="eyebrow">{tr(locale, { zh: "常备现货", en: "Always in stock" })}</p>
              <h2 className="mt-3 font-display text-3xl text-ink md:text-4xl">{dict.home.featuredTitle}</h2>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-ink-muted">{dict.home.featuredSubtitle}</p>
            </div>
            <Link href={localeHref(locale, "/products")} className="btn btn-outline">
              {dict.common.viewAll}
            </Link>
          </div>
          <div className="mt-9 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {featured.map((product) => (
              <ProductCard key={product.id} product={product} locale={locale} currency={currency} dict={dict} />
            ))}
          </div>
        </div>
      </section>

      {/* Why us */}
      <section className="wrap py-16 md:py-20">
        <div className="grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <p className="eyebrow">{tr(locale, { zh: "制造能力", en: "Manufacturing" })}</p>
            <h2 className="mt-3 font-display text-3xl text-ink md:text-4xl">{dict.home.whyTitle}</h2>
            <p className="mt-3 text-sm leading-relaxed text-ink-muted">{dict.home.whySubtitle}</p>
            <Link href={localeHref(locale, "/about")} className="mt-6 inline-flex text-sm font-semibold text-brass-deep underline-offset-4 hover:underline">
              {dict.footer.about} →
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:col-span-8">
            {dict.home.features.map((feature, index) => (
              <div key={feature.title} className="rounded-2xl border border-line bg-white p-6">
                <span className="font-display text-lg text-brass">{String(index + 1).padStart(2, "0")}</span>
                <h3 className="mt-3 text-[15px] font-semibold text-ink">{feature.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-muted">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Sample kit */}
      {sample ? (
        <section className="wrap pb-16 md:pb-20">
          <div className="overflow-hidden rounded-3xl bg-ink text-stone">
            <div className="grid items-center gap-8 p-8 md:grid-cols-2 md:p-12">
              <div>
                <p className="text-[11px] uppercase tracking-[0.28em] text-brass-soft">{dict.common.sampleBadge}</p>
                <h2 className="mt-4 font-display text-3xl leading-tight text-white md:text-4xl">{dict.home.sampleTitle}</h2>
                <p className="mt-4 max-w-md text-sm leading-relaxed text-stone/70">{dict.home.sampleDesc}</p>
                <div className="mt-7 flex flex-wrap items-center gap-4">
                  <Link href={localeHref(locale, `/products/${sample.slug}`)} className="btn btn-brass">
                    {dict.home.sampleCta} · <Price cents={sample.price_cents} currency={currency} locale={locale} />
                  </Link>
                  <Link href={localeHref(locale, "/contact")} className="text-sm font-semibold text-stone/80 underline-offset-4 hover:text-white hover:underline">
                    {dict.home.ctaButton}
                  </Link>
                </div>
              </div>
              <div className="relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={sample.image} alt={tr(locale, { zh: sample.name_zh, en: sample.name_en })} className="mx-auto w-full max-w-sm rounded-2xl border border-stone/15" />
              </div>
            </div>
          </div>
        </section>
      ) : null}

      {/* Process */}
      <section className="border-t border-line bg-white/60">
        <div className="wrap py-16 md:py-20">
          <div className="max-w-2xl">
            <p className="eyebrow">{tr(locale, { zh: "服务流程", en: "Process" })}</p>
            <h2 className="mt-3 font-display text-3xl text-ink md:text-4xl">{dict.home.processTitle}</h2>
            <p className="mt-3 text-sm leading-relaxed text-ink-muted">{dict.home.processSubtitle}</p>
          </div>
          <ol className="mt-9 grid gap-4 md:grid-cols-4">
            {dict.home.steps.map((step, index) => (
              <li key={step.title} className="rounded-2xl border border-line bg-white p-6">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-stone-deep font-display text-sm text-brass-deep">
                  {index + 1}
                </span>
                <h3 className="mt-4 text-[15px] font-semibold text-ink">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-muted">{step.desc}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* FAQ + CTA */}
      <section className="wrap grid gap-10 py-16 md:py-20 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <p className="eyebrow">FAQ</p>
          <h2 className="mt-3 font-display text-3xl text-ink md:text-4xl">{dict.home.faqTitle}</h2>
          <div className="mt-7 divide-y divide-line border-y border-line">
            {dict.home.faq.map((item) => (
              <details key={item.q} className="group py-4">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-[15px] font-medium text-ink">
                  {item.q}
                  <span className="text-brass transition group-open:rotate-45">＋</span>
                </summary>
                <p className="mt-3 pr-8 text-sm leading-relaxed text-ink-muted">{item.a}</p>
              </details>
            ))}
          </div>
        </div>
        <div className="lg:col-span-5">
          <div className="h-full rounded-3xl border border-line bg-stone-deep/60 p-8">
            <h2 className="font-display text-2xl text-ink">{dict.home.ctaTitle}</h2>
            <p className="mt-3 text-sm leading-relaxed text-ink-muted">{dict.home.ctaDesc}</p>
            <div className="mt-6 space-y-3 text-sm">
              <a href={`mailto:${brand.email}`} className="btn btn-primary w-full">
                {brand.email}
              </a>
              <a href={`tel:${brand.phoneZh.replace(/\s/g, "")}`} className="btn btn-outline w-full">
                {locale === "zh" ? brand.phoneZh : brand.phoneEn}
              </a>
            </div>
            <p className="mt-6 text-xs leading-relaxed text-ink-muted">{dict.home.trustTitle}</p>
          </div>
        </div>
      </section>
    </>
  );
}
