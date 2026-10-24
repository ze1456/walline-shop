import { redirect } from "next/navigation";
import { getOrderByNo, markOrderPaid } from "@/lib/orders";
import { localeHref, normalizeLocale } from "@/lib/i18n";
import { verifyStripeSession } from "@/lib/payments";

export const dynamic = "force-dynamic";

export default async function StripeReturnPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const locale = normalizeLocale((await params).locale);
  const query = await searchParams;
  const orderNo = typeof query.order === "string" ? query.order : "";
  const sessionId = typeof query.session_id === "string" ? query.session_id : "";
  const order = orderNo ? await getOrderByNo(orderNo) : undefined;

  if (order && sessionId && order.payment_status !== "paid") {
    const verified = await verifyStripeSession(sessionId);
    if (verified.paid) await markOrderPaid(order.id, sessionId);
  }

  redirect(localeHref(locale, order ? `/orders/${order.order_no}?paid=1` : "/account/orders"));
}
