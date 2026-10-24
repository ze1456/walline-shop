import { redirect } from "next/navigation";
import { getOrderByNo, markOrderPaid } from "@/lib/orders";
import { localeHref, normalizeLocale } from "@/lib/i18n";
import { capturePaypalOrder } from "@/lib/payments";

export const dynamic = "force-dynamic";

export default async function PaypalReturnPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const locale = normalizeLocale((await params).locale);
  const query = await searchParams;
  const orderNo = typeof query.order === "string" ? query.order : "";
  const paypalOrderId = typeof query.token === "string" ? query.token : "";
  const order = orderNo ? await getOrderByNo(orderNo) : undefined;

  if (order && paypalOrderId && order.payment_status !== "paid") {
    const captured = await capturePaypalOrder(paypalOrderId);
    if (captured.paid) await markOrderPaid(order.id, captured.ref ?? paypalOrderId);
  }

  redirect(localeHref(locale, order ? `/orders/${order.order_no}?paid=1` : "/account/orders"));
}
