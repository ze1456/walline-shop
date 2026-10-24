import Link from "next/link";
import { redirect } from "next/navigation";
import { getDictionary } from "@/lib/dictionaries";
import type { Locale } from "@/lib/config";
import { localeHref, normalizeLocale } from "@/lib/i18n";
import { getCurrentUser } from "@/lib/auth";
import { listOrdersForUser } from "@/lib/orders";
import { formatOrderCurrency } from "@/lib/money";
import { StatusBadge } from "@/components/status-badge";

export const dynamic = "force-dynamic";

export default async function AccountOrdersPage({ params }: { params: Promise<{ locale: string }> }) {
  const locale = normalizeLocale((await params).locale) as Locale;
  const user = await getCurrentUser();
  if (!user) redirect(localeHref(locale, "/account/login"));
  const dict = getDictionary(locale);
  const orders = await listOrdersForUser(user.id);

  return (
    <div className="wrap py-10 md:py-14">
      <nav className="flex items-center gap-2 text-xs text-ink-muted">
        <Link href={localeHref(locale, "/account")} className="hover:text-brass-deep">
          {dict.account.title}
        </Link>
        <span>/</span>
        <span className="text-ink">{dict.account.orders}</span>
      </nav>
      <h1 className="mt-3 font-display text-3xl text-ink md:text-4xl">{dict.account.orders}</h1>

      {orders.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-line bg-white p-12 text-center">
          <p className="text-sm text-ink-muted">{dict.account.noOrders}</p>
          <Link href={localeHref(locale, "/products")} className="btn btn-primary mt-5 text-xs">
            {dict.cart.continueShopping}
          </Link>
        </div>
      ) : (
        <div className="mt-6 overflow-x-auto rounded-2xl border border-line bg-white">
          <table className="w-full min-w-[680px] text-left text-sm">
            <thead className="border-b border-line text-[11px] uppercase tracking-wider text-ink-muted">
              <tr>
                <th className="px-5 py-3 font-medium">{dict.checkout.orderNo}</th>
                <th className="px-5 py-3 font-medium">{dict.account.orderDate}</th>
                <th className="px-5 py-3 font-medium">{dict.account.orderStatus}</th>
                <th className="px-5 py-3 font-medium">{dict.account.orderTotal}</th>
                <th className="px-5 py-3 font-medium">{dict.account.orderDetail}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-stone/50">
                  <td className="px-5 py-3 font-mono text-xs font-semibold text-ink">{order.order_no}</td>
                  <td className="px-5 py-3 text-xs text-ink-muted">
                    {new Date(order.created_at.replace(" ", "T")).toLocaleDateString(locale === "zh" ? "zh-CN" : "en-US")}
                  </td>
                  <td className="px-5 py-3">
                    <StatusBadge status={order.status} locale={locale} />
                  </td>
                  <td className="px-5 py-3 text-xs font-semibold text-ink">
                    {formatOrderCurrency(order.total_cents, order.currency, order.fx_rate, locale)}
                  </td>
                  <td className="px-5 py-3">
                    <Link href={localeHref(locale, `/orders/${order.order_no}`)} className="text-xs font-semibold text-brass-deep hover:underline">
                      {dict.common.viewAll} →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <Link href={localeHref(locale, "/account")} className="btn btn-outline mt-6 text-xs">
        ← {dict.account.title}
      </Link>
    </div>
  );
}
