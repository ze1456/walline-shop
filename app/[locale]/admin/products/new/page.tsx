import { redirect } from "next/navigation";
import { getDictionary } from "@/lib/dictionaries";
import type { Locale } from "@/lib/config";
import { localeHref, normalizeLocale } from "@/lib/i18n";
import { isAdmin } from "@/lib/auth";
import { listCategories } from "@/lib/data";
import { AdminShell } from "@/components/admin-shell";
import { AdminProductForm } from "@/components/admin-product-form";

export const dynamic = "force-dynamic";

export default async function AdminNewProductPage({ params }: { params: Promise<{ locale: string }> }) {
  const locale = normalizeLocale((await params).locale) as Locale;
  if (!(await isAdmin())) redirect(localeHref(locale, "/admin/login"));
  const dict = getDictionary(locale);
  const categories = listCategories();

  return (
    <AdminShell locale={locale} active="products">
      <h1 className="mb-5 font-display text-2xl text-ink">{dict.admin.newProduct}</h1>
      <AdminProductForm locale={locale} dict={dict} categories={categories} />
    </AdminShell>
  );
}
