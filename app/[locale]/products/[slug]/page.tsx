import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { fill, getDictionary } from "@/lib/dictionaries";
import { localeHref, normalizeLocale, tr } from "@/lib/i18n";
import { getCategory, getProductBySlug, getRelatedProducts, getVariants, parseImages, parseSpecs } from "@/lib/data";
import { getCurrentCurrency } from "@/lib/preferences";
import { formatCurrency } from "@/lib/money";
import { addToCart, buyNow } from "@/app/actions/cart";
import { ProductGallery } from "@/components/product-gallery";
import { Price } from "@/components/price";
import { ProductCard } from "@/components/product-card";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale: raw, slug } = await params;
  const locale = normalizeLocale(raw);
  const product = await getProductBySlug(slug);
  if (!product) return {};
  const name = tr(locale, { zh: product.name_zh, en: product.name_en });
  return { title: name, description: tr(locale, { zh: product.subtitle_zh, en: product.subtitle_en }) };
}

export default async function ProductDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string; slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { locale: raw, slug } = await params;
  const locale = normalizeLocale(raw);
  if (raw !== locale) notFound();
  const query = await searchParams;
  const product = await getProductBySlug(slug);
  if (!product || !product.active) notFound();

  const dict = getDictionary(locale);
  const currency = await getCurrentCurrency();
  const variants = await getVariants(product.id);
  const specs = parseSpecs(product.specs);
  const images = parseImages(product.images);
  const gallery = images.length > 0 ? images : [product.image || `/images/products/${product.slug}.svg`];
  const related = await getRelatedProducts(product, 4);
  const category = await getCategory(product.category);
  const backHref = localeHref(locale, `/products?category=${product.category}`);
  const added = query.added === "1";
  const name = tr(locale, { zh: product.name_zh, en: product.name_en });
  const subtitle = tr(locale, { zh: product.subtitle_zh, en: product.subtitle_en });
  const description = tr(locale, { zh: product.description_zh, en: product.description_en });
  const unit = tr(locale, { zh: product.unit_zh, en: product.unit_en });
  const stock = product.stock;
  const stockLabel = stock <= 0 ? dict.product.stockOut : stock < 40 ? dict.product.stockLow : dict.product.stockIn;

  return (
    <div className="wrap py-10 md:py-14">
      <nav className="flex flex-wrap items-center gap-2 text-xs text-ink-muted">
        <Link href={localeHref(locale, "/")} className="hover:text-brass-deep">
          {dict.product.home}
        </Link>
        <span>/</span>
        <Link href={localeHref(locale, "/products")} className="hover:text-brass-deep">
          {dict.product.breadcrumbProducts}
        </Link>
        <span>/</span>
        {category ? (
          <>
            <Link href={backHref} className="hover:text-brass-deep">
              {tr(locale, { zh: category.name_zh, en: category.name_en })}
            </Link>
            <span>/</span>
          </>
        ) : null}
        <span className="text-ink">{name}</span>
      </nav>

      {added ? (
        <div className="mt-5 rounded-xl border border-brass-soft bg-brass-soft/15 px-4 py-3 text-sm text-brass-deep">
          {dict.product.addedToCart} ·{" "}
          <Link href={localeHref(locale, "/cart")} className="font-semibold underline">
            {dict.nav.cart}
          </Link>
        </div>
      ) : null}

      <div className="mt-6 grid gap-10 lg:grid-cols-2">
        <div>
          <ProductGallery images={gallery} alt={name} />
        </div>

        <div>
          <div className="flex flex-wrap items-center gap-2">
            {product.badge_zh || product.badge_en ? (
              <span className="rounded-full bg-brass-soft/30 px-2.5 py-1 text-[11px] font-semibold text-brass-deep">
                {tr(locale, { zh: product.badge_zh, en: product.badge_en })}
              </span>
            ) : null}
            <span className="rounded-full bg-stone-deep px-2.5 py-1 text-[11px] text-ink-muted">{stockLabel}</span>
          </div>
          <h1 className="mt-4 font-display text-3xl leading-tight text-ink md:text-4xl">{name}</h1>
          <p className="mt-3 text-sm leading-relaxed text-ink-muted">{subtitle}</p>

          <div className="mt-6 flex flex-wrap items-end gap-3 border-y border-line py-5">
            <span className="font-display text-3xl text-ink">
              <Price cents={product.price_cents} currency={currency} locale={locale} />
            </span>
            <span className="pb-1 text-xs text-ink-muted">/ {unit}</span>
            {product.compare_at_cents ? (
              <span className="pb-1 text-sm text-ink-muted line-through">
                {formatCurrency(product.compare_at_cents, currency, locale)}
              </span>
            ) : null}
            <span className="mb-1 ml-auto text-[11px] text-ink-muted">{dict.product.moqNote.replace("{moq}", String(product.moq)).replace("{unit}", unit)}</span>
          </div>

          <p className="mt-3 text-xs leading-relaxed text-ink-muted">{dict.product.unitPriceNote.replace("{unit}", unit)}</p>

          <form action={addToCart} className="mt-6 space-y-5">
            <input type="hidden" name="locale" value={locale} />
            <input type="hidden" name="productId" value={product.id} />
            <input type="hidden" name="redirectTo" value={localeHref(locale, `/products/${product.slug}`)} />

            {variants.length > 0 ? (
              <div>
                <p className="label">{dict.product.variantLabel}</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {variants.map((variant, index) => (
                    <label
                      key={variant.id}
                      className="cursor-pointer rounded-xl border border-line bg-white px-3.5 py-2.5 text-xs text-ink-soft transition has-[:checked]:border-brass-deep has-[:checked]:bg-brass-soft/10 has-[:checked]:text-ink"
                    >
                      <input type="radio" name="variantId" value={variant.id} defaultChecked={index === 0} className="sr-only" />
                      <span className="font-medium">{tr(locale, { zh: variant.name_zh, en: variant.name_en })}</span>
                      {variant.price_delta_cents !== 0 ? (
                        <span className="ml-1.5 text-brass-deep">
                          {variant.price_delta_cents > 0 ? "+" : ""}
                          {formatCurrency(variant.price_delta_cents, currency, locale)}
                        </span>
                      ) : null}
                    </label>
                  ))}
                </div>
              </div>
            ) : null}

            <div className="flex flex-wrap items-end gap-4">
              <div>
                <label htmlFor="qty" className="label">
                  {dict.product.qtyLabel}
                </label>
                <input
                  id="qty"
                  type="number"
                  name="qty"
                  min={product.moq}
                  step={1}
                  defaultValue={product.moq}
                  className="field mt-2 w-28"
                />
              </div>
              <button type="submit" className="btn btn-primary" disabled={stock <= 0}>
                {dict.product.addToCart}
              </button>
              <button type="submit" formAction={buyNow} className="btn btn-outline" disabled={stock <= 0}>
                {dict.product.buyNow}
              </button>
            </div>
          </form>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link href={localeHref(locale, "/products/acc-sample")} className="text-xs font-semibold text-brass-deep underline-offset-4 hover:underline">
              {dict.product.sampleCta} →
            </Link>
            <Link href={localeHref(locale, "/contact")} className="text-xs font-semibold text-ink-muted underline-offset-4 hover:text-brass-deep hover:underline">
              {dict.product.contactBtn} →
            </Link>
          </div>

          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-line bg-white p-4">
              <p className="text-xs font-semibold text-ink">{dict.product.shippingTitle}</p>
              <p className="mt-1.5 text-xs leading-relaxed text-ink-muted">{dict.product.shippingDesc}</p>
            </div>
            <div className="rounded-2xl border border-line bg-white p-4">
              <p className="text-xs font-semibold text-ink">{dict.product.bulkTitle}</p>
              <p className="mt-1.5 text-xs leading-relaxed text-ink-muted">{fill(dict.product.bulkDesc, { amount: formatCurrency(500000, currency, locale) })}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-14 grid gap-10 lg:grid-cols-[1.2fr_1fr]">
        <section>
          <h2 className="font-display text-2xl text-ink">{dict.product.descriptionTitle}</h2>
          <div className="prose-block mt-4 max-w-none">
            {description.split("\n").filter(Boolean).map((paragraph) => (
              <p key={paragraph} className="mt-3 text-sm leading-relaxed text-ink-muted">
                {paragraph}
              </p>
            ))}
          </div>
        </section>
        <section>
          <h2 className="font-display text-2xl text-ink">{dict.product.specsTitle}</h2>
          <dl className="mt-4 divide-y divide-line overflow-hidden rounded-2xl border border-line bg-white">
            {specs.map((spec) => (
              <div key={`${spec.kZh}-${spec.vZh}`} className="flex items-center justify-between gap-4 px-4 py-3 text-sm">
                <dt className="text-ink-muted">{tr(locale, { zh: spec.kZh, en: spec.kEn })}</dt>
                <dd className="text-right font-medium text-ink">{tr(locale, { zh: spec.vZh, en: spec.vEn })}</dd>
              </div>
            ))}
          </dl>
        </section>
      </div>

      {related.length > 0 ? (
        <section className="mt-16">
          <div className="flex items-end justify-between gap-4">
            <h2 className="font-display text-2xl text-ink">{dict.product.relatedTitle}</h2>
            <Link href={backHref} className="text-xs font-semibold text-brass-deep hover:underline">
              {dict.common.viewAll} →
            </Link>
          </div>
          <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {related.map((item) => (
              <ProductCard key={item.id} product={item} locale={locale} currency={currency} dict={dict} />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
