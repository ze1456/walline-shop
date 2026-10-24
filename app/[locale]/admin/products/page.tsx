import Link from "next/link";
import { redirect } from "next/navigation";
import { getDictionary } from "@/lib/dictionaries";
import type { Locale } from "@/lib/config";
import { localeHref, normalizeLocale, tr } from "@/lib/i18n";
import { isAdmin } from "@/lib/auth";
import { listCategories, listProducts } from "@/lib/data";
import { formatCny } from "@/lib/money";
import { AdminShell } from "@/components/admin-shell";
import { deleteProduct } from "@/app/actions/admin";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const locale = normalizeLocale((await params).locale) as Locale;
  if (!(await isAdmin())) redirect(localeHref(locale, "/admin/login"));
  const dict = getDictionary(locale);
  const query = await searchParams;
  const products = await listProducts({ includeHidden: true, limit: 200 });
  const categories = await listCategories();
  const categoryNames = new Map(categories.map((c) => [c.slug, locale === "zh" ? c.name_zh : c.name_en]));

  return (
    <AdminShell locale={locale} active="products">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-2xl text-ink">{dict.admin.products}</h1>
        <Link href={localeHref(locale, "/admin/products/new")} className="btn btn-primary text-sm">
          + {dict.admin.newProduct}
        </Link>
      </div>

      {query.saved ? <p className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-800">{dict.admin.saved}</p> : null}
      {query.deleted ? <p className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-800">{dict.admin.deleted}</p> : null}

      <div className="mt-5 overflow-x-auto rounded-2xl border border-line bg-white">
        <table className="w-full min-w-[820px] text-left text-sm">
          <thead className="bg-stone text-[11px] uppercase tracking-wider text-ink-muted">
            <tr>
              <th className="px-4 py-3 font-medium">{locale === "zh" ? "产品" : "Product"}</th>
              <th className="px-4 py-3 font-medium">{dict.admin.category}</th>
              <th className="px-4 py-3 font-medium">{dict.admin.price}</th>
              <th className="px-4 py-3 font-medium">{dict.admin.stock}</th>
              <th className="px-4 py-3 font-medium">{dict.admin.status}</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {products.map((product) => (
              <tr key={product.id}>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={product.image} alt="" className="h-11 w-11 rounded-lg border border-line bg-stone object-cover" />
                    <div>
                      <p className="font-medium text-ink">{locale === "zh" ? product.name_zh : product.name_en}</p>
                      <p className="font-mono text-[11px] text-ink-muted">{product.slug}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-xs text-ink-muted">{categoryNames.get(product.category) ?? product.category}</td>
                <td className="px-4 py-3 text-xs font-semibold text-ink">{formatCny(product.price_cents)}</td>
                <td className="px-4 py-3 text-xs">
                  <span className={product.stock < 20 ? "font-semibold text-rose-700" : "text-ink-muted"}>{product.stock}</span>
                  <span className="ml-1 text-[11px] text-ink-muted">{locale === "zh" ? product.unit_zh : product.unit_en}</span>
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${
                      product.active ? "bg-emerald-50 text-emerald-800" : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {product.active ? dict.admin.status_published : dict.admin.status_hidden}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-2">
                    <Link href={localeHref(locale, `/admin/products/${product.id}`)} className="btn btn-outline px-3 py-1.5 text-[11px]">
                      {dict.admin.editProduct}
                    </Link>
                    <form action={deleteProduct}>
                      <input type="hidden" name="locale" value={locale} />
                      <input type="hidden" name="id" value={product.id} />
                      <button type="submit" className="text-[11px] font-medium text-rose-700 hover:underline">
                        {tr(locale, { zh: "删除", en: "Delete" })}
                      </button>
                    </form>
                  </div>
                </td>
              </tr>
            ))}
            {products.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-xs text-ink-muted">
                  {dict.admin.noResults}
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </AdminShell>
  );
}
