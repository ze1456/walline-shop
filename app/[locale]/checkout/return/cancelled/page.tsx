import Link from "next/link";
import { getDictionary } from "@/lib/dictionaries";
import { getOrderByNo } from "@/lib/orders";
import { localeHref, normalizeLocale, tr } from "@/lib/i18n";

export const dynamic = "force-dynamic";

export default async function CheckoutCancelledPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const locale = normalizeLocale((await params).locale);
  const query = await searchParams;
  const orderNo = typeof query.order === "string" ? query.order : "";
  const order = orderNo ? getOrderByNo(orderNo) : undefined;
  const dict = getDictionary(locale);

  return (
    <div className="wrap py-20">
      <div className="mx-auto max-w-xl rounded-3xl border border-line bg-white p-10 text-center">
        <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-stone-deep text-xl text-brass-deep">!</span>
        <h1 className="mt-5 font-display text-2xl text-ink">{tr(locale, { zh: "支付已取消", en: "Payment cancelled" })}</h1>
        <p className="mt-3 text-sm leading-relaxed text-ink-muted">
          {tr(locale, {
            zh: "订单已经保留，库存会为你锁定 24 小时。你可以回到订单页重新发起支付，或改用对公电汇。",
            en: "Your order is saved and stock is held for 24 hours. Reopen the order to try again, or pay by bank transfer.",
          })}
        </p>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          {order ? (
            <Link href={localeHref(locale, `/orders/${order.order_no}`)} className="btn btn-primary">
              {tr(locale, { zh: "返回订单", en: "Back to order" })}
            </Link>
          ) : null}
          <Link href={localeHref(locale, "/products")} className="btn btn-outline">
            {dict.cart.continueShopping}
          </Link>
        </div>
      </div>
    </div>
  );
}
