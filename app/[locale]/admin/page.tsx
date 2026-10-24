import Link from "next/link";
import { redirect } from "next/navigation";
import { getDictionary } from "@/lib/dictionaries";
import type { Locale } from "@/lib/config";
import { localeHref, normalizeLocale, tr } from "@/lib/i18n";
import { isAdmin } from "@/lib/auth";
import { countProducts } from "@/lib/data";
import { countOrdersByStatus, listAllOrders, totalRevenueCents } from "@/lib/orders";
import { formatCny } from "@/lib/money";
import { db } from "@/lib/db";
import { AdminShell } from "@/components/admin-shell";
import { StatusBadge } from "@/components/status-badge";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage({ params }: { params: Promise<{ locale: string }> }) {
  const locale = normalizeLocale((await params).locale) as Locale;
  if (!(await isAdmin())) redirect(localeHref(locale, "/admin/login"));
  const dict = getDictionary(locale);

  const orders = listAllOrders({ limit: 8 });
  const byStatus = countOrdersByStatus();
  const pending = (byStatus.pending_payment ?? 0) + (byStatus.paid ?? 0) + (byStatus.processing ?? 0);
  const productCount = countProducts({ includeHidden: true });
  const revenue = totalRevenueCents();

  const lowStock = db
    .prepare("SELECT id, slug, name_zh, name_en, stock, unit_zh, unit_en FROM products WHERE active = 1 ORDER BY stock ASC LIMIT 6")
    .all() as unknown as {
    id: number;
    slug: string;
    name_zh: string;
    name_en: string;
    stock: number;
    unit_zh: string;
    unit_en: string;
  }[];

  const stats = [
    { label: dict.admin.revenue, value: formatCny(revenue), hint: tr(locale, { zh: "已支付订单合计", en: "Paid orders total" }) },
    { label: dict.admin.orderCount, value: String(listAllOrders({ limit: 1000 }).length), hint: tr(locale, { zh: "全部订单", en: "All orders" }) },
    { label: dict.admin.pendingCount, value: String(pending), hint: tr(locale, { zh: "待付款 / 处理中", en: "Awaiting payment / processing" }) },
    { label: dict.admin.productCount, value: String(productCount), hint: tr(locale, { zh: "含已下架", en: "Including hidden" }) },
  ];

  return (
    <AdminShell locale={locale} active="dashboard">
      <h1 className="font-display text-2xl text-ink">{dict.admin.dashboard}</h1>

      <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="card p-5">
            <p className="text-[11px] uppercase tracking-wider text-ink-muted">{stat.label}</p>
            <p className="mt-2 font-display text-2xl text-ink">{stat.value}</p>
            <p className="mt-1 text-[11px] text-ink-muted">{stat.hint}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        <section>
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg text-ink">{dict.admin.recentOrders}</h2>
            <Link href={localeHref(locale, "/admin/orders")} className="text-xs font-medium text-brass-deep hover:underline">
              {dict.admin.allOrders} →
            </Link>
          </div>
          <div className="mt-3 overflow-x-auto rounded-2xl border border-line bg-white">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="bg-stone text-[11px] uppercase tracking-wider text-ink-muted">
                <tr>
                  <th className="px-4 py-3 font-medium">{dict.admin.orderNo}</th>
                  <th className="px-4 py-3 font-medium">{dict.admin.customer}</th>
                  <th className="px-4 py-3 font-medium">{dict.admin.amount}</th>
                  <th className="px-4 py-3 font-medium">{dict.admin.status}</th>
                  <th className="px-4 py-3 font-medium">{dict.admin.date}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {orders.map((order) => (
                  <tr key={order.id}>
                    <td className="px-4 py-3">
                      <Link href={localeHref(locale, `/admin/orders/${order.id}`)} className="font-mono text-xs text-ink hover:text-brass-deep">
                        {order.order_no}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-xs text-ink-soft">{order.name}</td>
                    <td className="px-4 py-3 text-xs font-semibold text-ink">{formatCny(order.total_cents)}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={order.status} locale={locale} />
                    </td>
                    <td className="px-4 py-3 text-[11px] text-ink-muted">{order.created_at.slice(0, 10)}</td>
                  </tr>
                ))}
                {orders.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-10 text-center text-xs text-ink-muted">
                      {dict.admin.noOrders}
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </section>

        <section>
          <h2 className="font-display text-lg text-ink">{tr(locale, { zh: "库存提醒", en: "Low stock" })}</h2>
          <ul className="mt-3 divide-y divide-line rounded-2xl border border-line bg-white">
            {lowStock.map((product) => (
              <li key={product.id} className="flex items-center justify-between gap-3 px-4 py-3">
                <div className="min-w-0">
                  <Link
                    href={localeHref(locale, `/admin/products/${product.id}`)}
                    className="block truncate text-xs font-medium text-ink hover:text-brass-deep"
                  >
                    {locale === "zh" ? product.name_zh : product.name_en}
                  </Link>
                  <p className="font-mono text-[11px] text-ink-muted">{product.slug}</p>
                </div>
                <span className={`shrink-0 text-xs font-semibold ${product.stock < 20 ? "text-rose-700" : "text-ink-soft"}`}>
                  {product.stock} {locale === "zh" ? product.unit_zh : product.unit_en}
                </span>
              </li>
            ))}
          </ul>
          <Link href={localeHref(locale, "/admin/products")} className="btn btn-outline mt-4 w-full text-xs">
            {dict.admin.products}
          </Link>
        </section>
      </div>
    </AdminShell>
  );
}
