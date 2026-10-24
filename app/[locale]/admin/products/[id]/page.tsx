import { notFound, redirect } from "next/navigation";
import { getDictionary } from "@/lib/dictionaries";
import type { Locale } from "@/lib/config";
import { localeHref, normalizeLocale } from "@/lib/i18n";
import { isAdmin } from "@/lib/auth";
import { getProductById, listCategories } from "@/lib/data";
import { AdminShell } from "@/components/admin-shell";
import { AdminProductForm } from "@/components/admin-product-form";

export const dynamic = "force-dynamic";

export default async function AdminEditProductPage({ params }: { params: Promise<{ locale: string; id: string }> }) {
  const resolved = await params;
  const locale = normalizeLocale(resolved.locale) as Locale;
  if (!(await isAdmin())) redirect(localeHref(locale, "/admin/login"));
  const product = await getProductById(Number(resolved.id));
  if (!product) notFound();
  const dict = getDictionary(locale);
  const categories = await listCategories();

  return (
    <AdminShell locale={locale} active="products">
      <h1 className="mb-5 font-display text-2xl text-ink">{dict.admin.editProduct}</h1>
      <AdminProductForm locale={locale} dict={dict} categories={categories} product={product} />
    </AdminShell>
  );
}
