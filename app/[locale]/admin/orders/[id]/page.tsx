import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getDictionary } from "@/lib/dictionaries";
import { paymentMethods, statusLabels, type Locale } from "@/lib/config";
import { localeHref, normalizeLocale, tr } from "@/lib/i18n";
import { isAdmin } from "@/lib/auth";
import { getOrderById, getOrderItems } from "@/lib/orders";
import { formatOrderCurrency } from "@/lib/money";
import { AdminShell } from "@/components/admin-shell";
import { StatusBadge } from "@/components/status-badge";
import { updateOrderAdmin } from "@/app/actions/admin";

export const dynamic = "force-dynamic";

const allStatuses = Object.keys(statusLabels) as (keyof typeof statusLabels)[];

export default async function AdminOrderDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string; id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const resolved = await params;
  const locale = normalizeLocale(resolved.locale) as Locale;
  if (!(await isAdmin())) redirect(localeHref(locale, "/admin/login"));
  const order = await getOrderById(Number(resolved.id));
  if (!order) notFound();
  const query = await searchParams;
  const dict = getDictionary(locale);
  const items = await getOrderItems(order.id);
  const amount = (cents: number) => formatOrderCurrency(cents, order.currency, order.fx_rate, locale);
  const paymentName = paymentMethods.find((method) => method.id === order.payment_method);

  return (
    <AdminShell locale={locale} active="orders">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link href={localeHref(locale, "/admin/orders")} className="text-xs text-brass-deep hover:underline">
            ← {dict.admin.backToOrders}
          </Link>
          <h1 className="mt-1 font-mono text-xl font-semibold text-ink">{order.order_no}</h1>
        </div>
        <div className="flex items-center gap-2">
          <StatusBadge status={order.status} locale={locale} />
          <span className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${order.payment_status === "paid" ? "bg-emerald-50 text-emerald-800" : "bg-amber-50 text-amber-800"}`}>
            {order.payment_status === "paid" ? (locale === "zh" ? "已支付" : "Paid") : locale === "zh" ? "未支付" : "Unpaid"}
          </span>
        </div>
      </div>

      {query.saved ? <p className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-800">{dict.admin.saved}</p> : null}

      <div className="mt-5 grid gap-5 lg:grid-cols-[1.6fr_1fr]">
        <div className="space-y-5">
          <section className="overflow-hidden rounded-2xl border border-line bg-white">
            <h2 className="border-b border-line px-5 py-3 font-display text-base text-ink">{dict.admin.items}</h2>
            <table className="w-full text-left text-sm">
              <tbody className="divide-y divide-line">
                {items.map((item) => (
                  <tr key={item.id}>
                    <td className="px-5 py-3">
                      <p className="text-xs font-medium text-ink">{locale === "zh" ? item.name_zh : item.name_en}</p>
                      {item.variant_zh || item.variant_en ? (
                        <p className="text-[11px] text-ink-muted">{locale === "zh" ? item.variant_zh : item.variant_en}</p>
                      ) : null}
                    </td>
                    <td className="px-3 py-3 text-right text-xs text-ink-muted">× {item.qty}</td>
                    <td className="px-5 py-3 text-right text-xs font-semibold text-ink">{amount(item.unit_price_cents * item.qty)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <dl className="space-y-1.5 border-t border-line px-5 py-4 text-xs">
              <div className="flex justify-between text-ink-muted">
                <dt>{tr(locale, { zh: "商品小计", en: "Subtotal" })}</dt>
                <dd>{amount(order.subtotal_cents)}</dd>
              </div>
              {order.discount_cents > 0 ? (
                <div className="flex justify-between text-emerald-700">
                  <dt>
                    {tr(locale, { zh: "优惠", en: "Discount" })} {order.coupon_code ? `(${order.coupon_code})` : ""}
                  </dt>
                  <dd>−{amount(order.discount_cents)}</dd>
                </div>
              ) : null}
              <div className="flex justify-between text-ink-muted">
                <dt>{tr(locale, { zh: "运费", en: "Shipping" })}</dt>
                <dd>{amount(order.shipping_cents)}</dd>
              </div>
              <div className="flex justify-between border-t border-line pt-2 text-sm font-semibold text-ink">
                <dt>{tr(locale, { zh: "合计", en: "Total" })}</dt>
                <dd>{amount(order.total_cents)}</dd>
              </div>
            </dl>
          </section>

          <section className="rounded-2xl border border-line bg-white p-5">
            <h2 className="font-display text-base text-ink">{dict.admin.shippingAddress}</h2>
            <div className="mt-3 grid gap-2 text-xs text-ink-soft sm:grid-cols-2">
              <p>{order.name}</p>
              <p>{order.phone || "—"}</p>
              <p>{order.email}</p>
              <p>{order.company || "—"}</p>
              <p className="sm:col-span-2">
                {order.country} {order.province} {order.city} {order.address}
              </p>
              {order.postal ? <p>{order.postal}</p> : null}
              {order.note ? (
                <p className="sm:col-span-2 rounded-lg bg-stone px-3 py-2">
                  <span className="text-ink-muted">{dict.admin.customerNote}: </span>
                  {order.note}
                </p>
              ) : null}
            </div>
            <p className="mt-3 text-[11px] text-ink-muted">
              {dict.admin.payment}: {paymentName ? (locale === "zh" ? paymentName.nameZh : paymentName.nameEn) : order.payment_method} ·{" "}
              {order.currency} · fx {order.fx_rate}
            </p>
          </section>
        </div>

        <section className="h-fit rounded-2xl border border-line bg-white p-5">
          <h2 className="font-display text-lg text-ink">{dict.admin.updateStatus}</h2>
          <form action={updateOrderAdmin} className="mt-4 space-y-4">
            <input type="hidden" name="locale" value={locale} />
            <input type="hidden" name="id" value={order.id} />
            <div>
              <label className="label" htmlFor="status">
                {dict.admin.status}
              </label>
              <select id="status" name="status" defaultValue={order.status} className="field mt-1.5 text-sm">
                {allStatuses.map((key) => (
                  <option key={key} value={key}>
                    {statusLabels[key][locale]}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label" htmlFor="paymentStatus">
                {dict.admin.updatePayment}
              </label>
              <select id="paymentStatus" name="paymentStatus" defaultValue={order.payment_status} className="field mt-1.5 text-sm">
                <option value="unpaid">{locale === "zh" ? "未支付" : "Unpaid"}</option>
                <option value="paid">{locale === "zh" ? "已支付" : "Paid"}</option>
              </select>
            </div>
            <div>
              <label className="label" htmlFor="trackingNo">
                {dict.admin.trackingNo}
              </label>
              <input id="trackingNo" name="trackingNo" defaultValue={order.tracking_no ?? ""} className="field mt-1.5 text-sm" />
            </div>
            <button type="submit" className="btn btn-primary w-full text-sm">
              {dict.admin.saveChanges}
            </button>
          </form>
          <p className="mt-3 text-[11px] leading-relaxed text-ink-muted">
            {tr(locale, {
              zh: "将支付状态设为已支付会同时扣减库存，请谨慎操作。",
              en: "Marking as paid also decrements stock — use with care.",
            })}
          </p>
        </section>
      </div>
    </AdminShell>
  );
}
