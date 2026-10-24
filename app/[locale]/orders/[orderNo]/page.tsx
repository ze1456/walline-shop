import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getDictionary } from "@/lib/dictionaries";
import { localeHref, normalizeLocale, tr } from "@/lib/i18n";
import { statusLabels, type OrderStatus, demoPaymentEnabled, type PaymentMethodId } from "@/lib/config";
import { getOrderByNo, getOrderItems } from "@/lib/orders";
import { formatOrderCurrency } from "@/lib/money";
import { paymentFlowFor } from "@/lib/payments";
import { payDemo } from "@/app/actions/checkout";

export const dynamic = "force-dynamic";

const toneClass: Record<string, string> = {
  amber: "bg-amber-50 text-amber-800 border-amber-200",
  emerald: "bg-emerald-50 text-emerald-800 border-emerald-200",
  sky: "bg-sky-50 text-sky-800 border-sky-200",
  indigo: "bg-indigo-50 text-indigo-800 border-indigo-200",
  slate: "bg-stone-deep text-ink-soft border-line",
  rose: "bg-rose-50 text-rose-800 border-rose-200",
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; orderNo: string }>;
}): Promise<Metadata> {
  const { orderNo } = await params;
  return { title: orderNo };
}

export default async function OrderPage({
  params,
}: {
  params: Promise<{ locale: string; orderNo: string }>;
}) {
  const { locale: raw, orderNo } = await params;
  const locale = normalizeLocale(raw);
  if (raw !== locale) notFound();
  const order = await getOrderByNo(decodeURIComponent(orderNo));
  if (!order) notFound();
  const dict = getDictionary(locale);
  const items = await getOrderItems(order.id);
  const label = statusLabels[order.status as OrderStatus] ?? statusLabels.pending_payment;
  const flow = paymentFlowFor(order.payment_method as PaymentMethodId, order.currency);
  const amount = (cents: number) => formatOrderCurrency(cents, order.currency, order.fx_rate, locale);
  const paymentLabels: Record<string, string> = {
    wechat: dict.checkout.paymentWechat,
    alipay: dict.checkout.paymentAlipay,
    stripe: dict.checkout.paymentStripe,
    paypal: dict.checkout.paymentPaypal,
    bank_transfer: dict.checkout.paymentBank,
  };
  const isPaid = order.payment_status === "paid";
  const isUnpaid = order.payment_status === "unpaid";

  const steps: { status: OrderStatus; label: string }[] = [
    { status: "paid", label: tr(locale, { zh: "已付款", en: "Paid" }) },
    { status: "processing", label: tr(locale, { zh: "备货中", en: "Processing" }) },
    { status: "shipped", label: tr(locale, { zh: "已发货", en: "Shipped" }) },
    { status: "completed", label: tr(locale, { zh: "已完成", en: "Completed" }) },
  ];
  const stepOrder = (status: string) => ["pending_payment", "paid", "processing", "shipped", "completed"].indexOf(status);

  return (
    <div className="wrap py-10 md:py-14">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs text-ink-muted">
            {dict.account.orderDetail} · {dict.checkout.orderNo}{" "}
            <span className="font-mono font-semibold text-ink">{order.order_no}</span>
          </p>
          <h1 className="mt-2 font-display text-3xl text-ink md:text-4xl">
            {tr(locale, { zh: "订单已创建", en: "Order placed" })}
          </h1>
          <p className="mt-2 text-sm text-ink-muted">
            {new Date(order.created_at.replace(" ", "T")).toLocaleString(locale === "zh" ? "zh-CN" : "en-US")}
          </p>
        </div>
        <span className={`inline-flex rounded-full border px-3 py-1.5 text-xs font-semibold ${toneClass[label.tone] ?? toneClass.slate}`}>
          {tr(locale, { zh: label.zh, en: label.en })}
        </span>
      </div>

      {isPaid ? (
        <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
          <p className="text-sm font-semibold text-emerald-900">{dict.checkout.successTitle}</p>
          <p className="mt-1 text-xs leading-relaxed text-emerald-800">{dict.checkout.paidDesc}</p>
        </div>
      ) : (
        <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-5">
          <p className="text-sm font-semibold text-amber-900">{dict.checkout.unpaidDesc}</p>
          <p className="mt-1 text-xs leading-relaxed text-amber-800">
            {tr(locale, {
              zh: "订单已生成但尚未付款，请在 24 小时内完成支付以锁定库存。",
              en: "This order is not paid yet. Complete payment within 24 hours to hold your stock.",
            })}
          </p>
        </div>
      )}

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_380px]">
        <div className="space-y-6">
          <section className="rounded-2xl border border-line bg-white p-6">
            <h2 className="font-display text-xl text-ink">{tr(locale, { zh: "订单进度", en: "Progress" })}</h2>
            <ol className="mt-5 grid gap-3 sm:grid-cols-4">
              {steps.map((step) => {
                const done = stepOrder(order.status) >= stepOrder(step.status);
                return (
                  <li key={step.status} className={`rounded-xl border px-3 py-3 text-center text-xs ${done ? "border-brass-deep bg-brass-soft/15 text-ink" : "border-line text-ink-muted"}`}>
                    <span className="block font-semibold">{step.label}</span>
                    <span className="mt-1 block text-[10px] uppercase tracking-wider">{done ? "✓" : "—"}</span>
                  </li>
                );
              })}
            </ol>
            {order.tracking_no ? (
              <p className="mt-4 text-xs text-ink-muted">
                {dict.account.tracking}: <span className="font-mono text-ink">{order.tracking_no}</span>
              </p>
            ) : null}
          </section>

          <section className="overflow-hidden rounded-2xl border border-line bg-white">
            <h2 className="border-b border-line px-6 py-4 font-display text-xl text-ink">{dict.account.itemsCount.replace("{count}", String(items.reduce((sum, item) => sum + item.qty, 0)))}</h2>
            <ul className="divide-y divide-line">
              {items.map((item) => (
                <li key={item.id} className="flex gap-4 px-6 py-4">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={item.image || `/images/products/${item.slug}.svg`} alt="" className="h-16 w-20 shrink-0 rounded-lg border border-line object-cover" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-ink">{tr(locale, { zh: item.name_zh, en: item.name_en })}</p>
                    <p className="mt-1 text-xs text-ink-muted">
                      {item.variant_zh || item.variant_en ? `${tr(locale, { zh: item.variant_zh, en: item.variant_en })} · ` : ""}
                      {amount(item.unit_price_cents)} / {tr(locale, { zh: item.unit_zh, en: item.unit_en })} × {item.qty}
                    </p>
                  </div>
                  <p className="text-sm font-semibold text-ink">{amount(item.unit_price_cents * item.qty)}</p>
                </li>
              ))}
            </ul>
          </section>

          <section className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-line bg-white p-6">
              <h2 className="font-display text-lg text-ink">{dict.account.shippingInfo}</h2>
              <dl className="mt-3 space-y-1.5 text-xs leading-relaxed text-ink-muted">
                <div>
                  <dt className="inline font-medium text-ink">{order.name}</dt>
                  {order.company ? <dd className="inline"> · {order.company}</dd> : null}
                </div>
                <p>{order.phone}</p>
                <p>{order.email}</p>
                <p>
                  {order.address}
                  {order.city ? `, ${order.city}` : ""}
                  {order.province ? `, ${order.province}` : ""} {order.postal}
                </p>
                <p className="font-medium text-ink">{tr(locale, { zh: order.country, en: order.country })}</p>
                {order.note ? (
                  <p className="rounded-lg bg-stone px-2.5 py-2 italic">
                    {tr(locale, { zh: "备注", en: "Note" })}: {order.note}
                  </p>
                ) : null}
              </dl>
            </div>
            <div className="rounded-2xl border border-line bg-white p-6">
              <h2 className="font-display text-lg text-ink">{dict.account.paymentInfo}</h2>
              <dl className="mt-3 space-y-2 text-xs leading-relaxed text-ink-muted">
                <div className="flex justify-between gap-3">
                  <dt>{dict.checkout.payment}</dt>
                  <dd className="text-ink">{paymentLabels[order.payment_method] ?? order.payment_method}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt>{dict.account.orderStatus}</dt>
                  <dd className="text-ink">{isPaid ? tr(locale, { zh: "已支付", en: "Paid" }) : tr(locale, { zh: "未支付", en: "Unpaid" })}</dd>
                </div>
                {order.coupon_code ? (
                  <div className="flex justify-between gap-3">
                    <dt>{dict.cart.couponLabel}</dt>
                    <dd className="text-ink">{order.coupon_code}</dd>
                  </div>
                ) : null}
                <div className="flex justify-between gap-3">
                  <dt>{dict.common.shipping}</dt>
                  <dd className="text-ink">
                    {amount(order.shipping_cents)} · {order.shipping_days} {dict.common.days}
                  </dd>
                </div>
              </dl>

              {isUnpaid && flow === "demo" && demoPaymentEnabled ? (
                <div className="mt-4 rounded-xl border border-dashed border-brass-soft bg-brass-soft/10 p-3">
                  <p className="text-[11px] leading-relaxed text-ink-muted">{dict.checkout.demoDesc}</p>
                  <form action={payDemo} className="mt-2">
                    <input type="hidden" name="locale" value={locale} />
                    <input type="hidden" name="orderNo" value={order.order_no} />
                    <button type="submit" className="btn btn-brass w-full text-xs">
                      {dict.checkout.demoPay}
                    </button>
                  </form>
                </div>
              ) : null}
            </div>
          </section>

          {isUnpaid && flow === "offline" ? (
            <section className="rounded-2xl border border-line bg-white p-6">
              <h2 className="font-display text-lg text-ink">{dict.checkout.bankTitle}</h2>
              <p className="mt-2 text-xs leading-relaxed text-ink-muted">{dict.checkout.bankDesc}</p>
              <dl className="mt-4 grid gap-2 text-xs sm:grid-cols-2">
                {[
                  [dict.checkout.bankAccount, "WALLINE Building Materials Co., Ltd."],
                  [dict.checkout.bankName, "Bank of China, Foshan Nanhai Branch"],
                  [dict.checkout.bankNumber, "6217 8800 0000 0000 000"],
                  [dict.checkout.bankSwift, "BKCHCNBJ"],
                ].map(([term, value]) => (
                  <div key={term} className="rounded-lg bg-stone px-3 py-2">
                    <dt className="text-[10px] uppercase tracking-wider text-ink-muted">{term}</dt>
                    <dd className="mt-0.5 font-medium text-ink">{value}</dd>
                  </div>
                ))}
              </dl>
            </section>
          ) : null}
        </div>

        <aside className="h-fit rounded-2xl border border-line bg-white p-6 lg:sticky lg:top-24">
          <h2 className="font-display text-xl text-ink">{dict.checkout.summary}</h2>
          <dl className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-ink-muted">{dict.common.subtotal}</dt>
              <dd className="text-ink">{amount(order.subtotal_cents)}</dd>
            </div>
            {order.discount_cents > 0 ? (
              <div className="flex justify-between text-brass-deep">
                <dt>{dict.common.discount}</dt>
                <dd>−{amount(order.discount_cents)}</dd>
              </div>
            ) : null}
            <div className="flex justify-between">
              <dt className="text-ink-muted">{dict.common.shipping}</dt>
              <dd className="text-ink">{amount(order.shipping_cents)}</dd>
            </div>
            <div className="flex justify-between border-t border-line pt-3 text-base font-semibold text-ink">
              <dt>{dict.common.total}</dt>
              <dd>{amount(order.total_cents)}</dd>
            </div>
          </dl>
          <p className="mt-2 text-[11px] text-ink-muted">{order.currency} · {dict.common.currencyNote}</p>
          <div className="mt-5 space-y-2">
            <Link href={localeHref(locale, "/account/orders")} className="btn btn-outline w-full text-xs">
              {dict.account.backToOrders}
            </Link>
            <Link href={localeHref(locale, "/products")} className="btn btn-ghost w-full text-xs">
              {dict.checkout.continueShopping}
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}
