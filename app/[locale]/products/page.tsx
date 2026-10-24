import Link from "next/link";
import type { Metadata } from "next";
import { getDictionary } from "@/lib/dictionaries";
import { localeHref, normalizeLocale, tr } from "@/lib/i18n";
import type { Locale } from "@/lib/config";
import { countProducts, listCategories, listProducts } from "@/lib/data";
import { getCurrentCurrency } from "@/lib/preferences";
import { ProductCard } from "@/components/product-card";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const locale = normalizeLocale((await params).locale);
  const dict = getDictionary(locale);
  return { title: dict.products.title, description: dict.products.subtitle.replace("{count}", "22") };
}

type SortKey = "recommended" | "price_asc" | "price_desc" | "newest";
const SORTS: SortKey[] = ["recommended", "price_asc", "price_desc", "newest"];

export default async function ProductsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const locale = normalizeLocale((await params).locale) as Locale;
  const query = await searchParams;
  const dict = getDictionary(locale);
  const currency = await getCurrentCurrency();
  const categories = listCategories();

  const category = typeof query.category === "string" ? query.category : "";
  const q = typeof query.q === "string" ? query.q.trim() : "";
  const sortRaw = typeof query.sort === "string" ? query.sort : "recommended";
  const sort = (SORTS.includes(sortRaw as SortKey) ? sortRaw : "recommended") as SortKey;
  const page = Math.max(1, Number(typeof query.page === "string" ? query.page : 1) || 1);
  const pageSize = 12;

  const filter = { category, q, sort };
  const [products, total] = await Promise.all([
    Promise.resolve(listProducts({ ...filter, limit: pageSize, offset: (page - 1) * pageSize })),
    Promise.resolve(countProducts(filter)),
  ]);
  const pages = Math.max(1, Math.ceil(total / pageSize));
  const activeCategory = categories.find((item) => item.slug === category);

  const buildHref = (overrides: Record<string, string | number>) => {
    const next = new URLSearchParams();
    if (category) next.set("category", category);
    if (q) next.set("q", q);
    if (sort !== "recommended") next.set("sort", sort);
    if (page > 1) next.set("page", String(page));
    for (const [key, value] of Object.entries(overrides)) {
      if (value === "" || value === 0) next.delete(key);
      else next.set(key, String(value));
    }
    const qs = next.toString();
    return localeHref(locale, `/products${qs ? `?${qs}` : ""}`);
  };

  return (
    <div className="wrap py-10 md:py-14">
      <nav className="flex items-center gap-2 text-xs text-ink-muted">
        <Link href={localeHref(locale, "/")} className="hover:text-brass-deep">
          {dict.product.home}
        </Link>
        <span>/</span>
        <span className="text-ink">{activeCategory ? tr(locale, { zh: activeCategory.name_zh, en: activeCategory.name_en }) : dict.products.title}</span>
      </nav>
      <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl text-ink md:text-4xl">
            {activeCategory ? tr(locale, { zh: activeCategory.name_zh, en: activeCategory.name_en }) : dict.products.title}
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink-muted">
            {activeCategory
              ? tr(locale, { zh: activeCategory.description_zh, en: activeCategory.description_en })
              : dict.products.subtitle.replace("{count}", String(total))}
          </p>
        </div>
        <p className="text-xs text-ink-muted">{dict.products.results.replace("{count}", String(total))}</p>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[220px_1fr]">
        <aside>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-brass-deep">{dict.products.filterCategory}</p>
          <ul className="mt-3 space-y-1 text-sm">
            <li>
              <Link
                href={buildHref({ category: "", page: 0 })}
                className={`flex items-center justify-between rounded-lg px-3 py-2 transition ${
                  category === "" ? "bg-ink text-white" : "text-ink-soft hover:bg-stone-deep"
                }`}
              >
                {dict.products.categoryAll}
              </Link>
            </li>
            {categories.map((item) => (
              <li key={item.slug}>
                <Link
                  href={buildHref({ category: item.slug, page: 0 })}
                  className={`flex items-center justify-between rounded-lg px-3 py-2 transition ${
                    category === item.slug ? "bg-ink text-white" : "text-ink-soft hover:bg-stone-deep"
                  }`}
                >
                  <span>{tr(locale, { zh: item.name_zh, en: item.name_en })}</span>
                </Link>
              </li>
            ))}
          </ul>
          <div className="mt-6 rounded-2xl border border-line bg-white p-4 text-xs leading-relaxed text-ink-muted">
            {dict.home.sampleDesc}
            <Link href={localeHref(locale, "/products/acc-sample")} className="mt-2 inline-block font-semibold text-brass-deep hover:underline">
              {dict.home.sampleCta} →
            </Link>
          </div>
        </aside>

        <section>
          <div className="flex flex-wrap items-center gap-3">
            <form action={localeHref(locale, "/products")} method="get" className="flex flex-1 items-center gap-2">
              {category ? <input type="hidden" name="category" value={category} /> : null}
              {sort !== "recommended" ? <input type="hidden" name="sort" value={sort} /> : null}
              <input
                type="search"
                name="q"
                defaultValue={q}
                placeholder={dict.products.searchPlaceholder}
                className="field flex-1"
                aria-label={dict.products.searchPlaceholder}
              />
              <button type="submit" className="btn btn-primary">
                {dict.common.search}
              </button>
            </form>
            <form action={localeHref(locale, "/products")} method="get" className="flex items-center gap-2">
              {category ? <input type="hidden" name="category" value={category} /> : null}
              {q ? <input type="hidden" name="q" value={q} /> : null}
              <label htmlFor="sort" className="text-xs text-ink-muted">
                {dict.products.sortLabel}
              </label>
              <select id="sort" name="sort" defaultValue={sort} className="field w-40">
                <option value="recommended">{dict.products.sortRecommended}</option>
                <option value="price_asc">{dict.products.sortPriceAsc}</option>
                <option value="price_desc">{dict.products.sortPriceDesc}</option>
                <option value="newest">{dict.products.sortNewest}</option>
              </select>
              <button type="submit" className="btn btn-outline">
                {dict.common.search}
              </button>
            </form>
          </div>

          {products.length === 0 ? (
            <div className="mt-10 rounded-2xl border border-line bg-white p-12 text-center">
              <p className="text-sm text-ink-muted">{dict.products.empty}</p>
              <Link href={localeHref(locale, "/products")} className="btn btn-outline mt-5">
                {dict.products.reset}
              </Link>
            </div>
          ) : (
            <div className="mt-6 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} locale={locale} currency={currency} dict={dict} />
              ))}
            </div>
          )}

          {pages > 1 ? (
            <div className="mt-9 flex items-center justify-center gap-2">
              {Array.from({ length: pages }, (_, index) => index + 1).map((number) => (
                <Link
                  key={number}
                  href={buildHref({ page: number })}
                  className={`inline-flex h-9 w-9 items-center justify-center rounded-lg border text-sm transition ${
                    number === page ? "border-ink bg-ink text-white" : "border-line bg-white text-ink-soft hover:border-brass"
                  }`}
                >
                  {number}
                </Link>
              ))}
            </div>
          ) : null}
        </section>
      </div>
    </div>
  );
}
