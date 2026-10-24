"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getCurrentCartId } from "@/lib/cart";
import { getCurrentUser } from "@/lib/auth";
import { createOrderFromCart, getOrderByNo, markOrderPaid, setOrderPaymentRef } from "@/lib/orders";
import { getCurrentCurrency } from "@/lib/preferences";
import { localeHref, normalizeLocale } from "@/lib/i18n";
import { createPaypalOrder, createStripeCheckout, paymentFlowFor } from "@/lib/payments";
import { getBaseUrl } from "@/lib/site";
import type { PaymentMethodId } from "@/lib/config";

const paymentIds: PaymentMethodId[] = ["wechat", "alipay", "stripe", "paypal", "bank_transfer"];

export async function placeOrder(formData: FormData): Promise<void> {
  const locale = normalizeLocale(String(formData.get("locale") ?? ""));
  const checkoutUrl = localeHref(locale, "/checkout");
  const cartId = await getCurrentCartId();
  if (!cartId) redirect(checkoutUrl);

  const user = await getCurrentUser();
  const currency = await getCurrentCurrency();
  const requestedMethod = String(formData.get("paymentMethod") ?? "bank_transfer") as PaymentMethodId;
  const paymentMethod = paymentIds.includes(requestedMethod) ? requestedMethod : "bank_transfer";

  const result = await createOrderFromCart({
    cartId,
    userId: user?.id ?? null,
    locale,
    currency,
    email: String(formData.get("email") ?? ""),
    name: String(formData.get("name") ?? ""),
    phone: String(formData.get("phone") ?? ""),
    company: String(formData.get("company") ?? ""),
    country: String(formData.get("country") ?? ""),
    province: String(formData.get("province") ?? ""),
    city: String(formData.get("city") ?? ""),
    address: String(formData.get("address") ?? ""),
    postal: String(formData.get("postal") ?? ""),
    note: String(formData.get("note") ?? ""),
    shippingCode: String(formData.get("shippingCode") ?? ""),
    paymentMethod,
  });

  if (!result.ok) redirect(`${checkoutUrl}?error=${result.error}`);
  const order = result.order;
  revalidatePath("/", "layout");

  const orderUrl = localeHref(locale, `/orders/${order.order_no}`);
  const flow = paymentFlowFor(paymentMethod, order.currency);
  if (flow === "demo" || flow === "offline") redirect(orderUrl);

  const baseUrl = await getBaseUrl();
  if (flow === "stripe") {
    const checkout = await createStripeCheckout(order, baseUrl, locale);
    if (checkout.ok && checkout.url) {
      await setOrderPaymentRef(order.id, checkout.ref ?? "");
      redirect(checkout.url);
    }
    redirect(`${orderUrl}?error=psp`);
  }

  const paypal = await createPaypalOrder(order, baseUrl, locale);
  if (paypal.ok && paypal.url) {
    await setOrderPaymentRef(order.id, paypal.ref ?? "");
    redirect(paypal.url);
  }
  redirect(`${orderUrl}?error=psp`);
}

/** Demo-mode payment: simulate a successful payment for an unpaid order. */
export async function payDemo(formData: FormData): Promise<void> {
  const locale = normalizeLocale(String(formData.get("locale") ?? ""));
  const orderNo = String(formData.get("orderNo") ?? "");
  const order = await getOrderByNo(orderNo);
  if (!order) redirect(localeHref(locale, "/account/orders"));
  const flow = paymentFlowFor(order.payment_method as PaymentMethodId, order.currency);
  if (flow === "demo" && order.payment_status !== "paid") {
    await markOrderPaid(order.id, "demo");
    revalidatePath("/", "layout");
  }
  redirect(`${localeHref(locale, `/orders/${order.order_no}`)}?paid=1`);
}
