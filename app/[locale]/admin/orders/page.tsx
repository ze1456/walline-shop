import Link from "next/link";
import { redirect } from "next/navigation";
import { getDictionary } from "@/lib/dictionaries";
import { statusLabels, type Locale } from "@/lib/config";
import { localeHref, normalizeLocale, tr } from "@/lib/i18n";
import { isAdmin } from "@/lib/auth";
import { listAllOrders } from "@/lib/orders";
import { formatOrderCurrency } from "@/lib/money";
import { AdminShell } from "@/components/admin-shell";
import { StatusBadge } from "@/components/status-badge";

export const dynamic = "force-dynamic";

const allStatuses = Object.keys(statusLabels) as (keyof typeof statusLabels)[];

export default async function AdminOrdersPage({
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
  const status = typeof query.status === "string" && query.status in statusLabels ? query.status : undefined;
  const q = typeof query.q === "string" ? query.q : undefined;
  const orders = await listAllOrders({ status, q, limit: 100 });

  return (
    <AdminShell locale={locale} active="orders">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <h1 className="font-display text-2xl text-ink">{dict.admin.allOrders}</h1>
        <form method="get" className="flex flex-wrap items-center gap-2">
          <input name="q" defaultValue={q ?? ""} placeholder={tr(locale, { zh: "订单号 / 客户 / 邮箱", en: "Order no. / name / email" })} className="field w-52 py-2 text-xs" />
          <select name="status" defaultValue={status ?? ""} className="field w-36 py-2 text-xs">
            <option value="">{tr(locale, { zh: "全部状态", en: "All statuses" })}</option>
            {allStatuses.map((key) => (
              <option key={key} value={key}>
                {statusLabels[key][locale]}
              </option>
            ))}
          </select>
          <button type="submit" className="btn btn-outline px-3 py-2 text-xs">
            {tr(locale, { zh: "筛选", en: "Filter" })}
          </button>
        </form>
      </div>

      <div className="mt-5 overflow-x-auto rounded-2xl border border-line bg-white">
        <table className="w-full min-w-[860px] text-left text-sm">
          <thead className="bg-stone text-[11px] uppercase tracking-wider text-ink-muted">
            <tr>
              <th className="px-4 py-3 font-medium">{dict.admin.orderNo}</th>
              <th className="px-4 py-3 font-medium">{dict.admin.date}</th>
              <th className="px-4 py-3 font-medium">{dict.admin.customer}</th>
              <th className="px-4 py-3 font-medium">{dict.admin.amount}</th>
              <th className="px-4 py-3 font-medium">{dict.admin.status}</th>
              <th className="px-4 py-3 font-medium">{dict.admin.payment}</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {orders.map((order) => (
              <tr key={order.id} className="hover:bg-stone/50">
                <td className="px-4 py-3 font-mono text-xs font-semibold text-ink">{order.order_no}</td>
                <td className="px-4 py-3 text-xs text-ink-muted">{order.created_at.slice(0, 16)}</td>
                <td className="px-4 py-3 text-xs">
                  <p className="text-ink">{order.name}</p>
                  <p className="text-[11px] text-ink-muted">
                    {order.country} · {order.email}
                  </p>
                </td>
                <td className="px-4 py-3 text-xs font-semibold text-ink">{formatOrderCurrency(order.total_cents, order.currency, order.fx_rate, locale)}</td>
                <td className="px-4 py-3">
                  <StatusBadge status={order.status} locale={locale} />
                </td>
                <td className="px-4 py-3 text-xs">
                  <span className={order.payment_status === "paid" ? "text-emerald-700" : "text-amber-700"}>
                    {order.payment_status === "paid" ? (locale === "zh" ? "已支付" : "Paid") : locale === "zh" ? "未支付" : "Unpaid"}
                  </span>
                  <span className="ml-1 text-[11px] text-ink-muted">{order.payment_method}</span>
                </td>
                <td className="px-4 py-3 text-right">
                  <Link href={localeHref(locale, `/admin/orders/${order.id}`)} className="btn btn-outline px-3 py-1.5 text-[11px]">
                    {dict.admin.detail}
                  </Link>
                </td>
              </tr>
            ))}
            {orders.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-xs text-ink-muted">
                  {dict.admin.noOrders}
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </AdminShell>
  );
}
