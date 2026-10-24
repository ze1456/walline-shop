import { currencies, demoPaymentEnabled, type CurrencyCode, type Locale, type PaymentMethodId } from "./config";
import type { OrderRow } from "./orders";

export type PaymentFlow = "stripe" | "paypal" | "demo" | "offline";

export function stripeConfigured(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY);
}

export function paypalConfigured(): boolean {
  return Boolean(process.env.PAYPAL_CLIENT_ID && process.env.PAYPAL_CLIENT_SECRET);
}

/** PayPal does not settle in every currency, notably CNY. */
export const paypalCurrencies: string[] = ["USD", "EUR", "GBP", "AUD", "CAD", "HKD", "SGD", "JPY", "MXN", "BRL", "AED"];

export function paypalSupportsCurrency(code: string): boolean {
  return paypalCurrencies.includes(code);
}

/**
 * Decide how an order will actually be paid:
 * demo mode marks orders paid via an on-site simulation, real PSPs redirect.
 */
export function paymentFlowFor(method: PaymentMethodId, currency: string): PaymentFlow {
  if (method === "bank_transfer") return "offline";
  if (method === "stripe" && stripeConfigured()) return "stripe";
  if (method === "paypal" && paypalConfigured() && paypalSupportsCurrency(currency)) return "paypal";
  if (demoPaymentEnabled) return "demo";
  return "offline";
}

function amountString(centsCny: number, code: string, fxRate: number): string {
  const rate = currencies[code as CurrencyCode]?.rate ?? fxRate;
  const major = (centsCny * rate) / 100;
  return code === "JPY" ? String(Math.round(major)) : major.toFixed(2);
}

function amountMinor(centsCny: number, code: string, fxRate: number): number {
  const rate = currencies[code as CurrencyCode]?.rate ?? fxRate;
  const major = (centsCny * rate) / 100;
  return code === "JPY" ? Math.round(major) : Math.round(major * 100);
}

// ---------------------------------------------------------------------------
// Stripe Checkout (hosted card payment) via the REST API — no SDK dependency.
// ---------------------------------------------------------------------------

export interface PspRedirect {
  ok: boolean;
  url?: string;
  error?: string;
  ref?: string;
}

export async function createStripeCheckout(order: OrderRow, baseUrl: string, locale: Locale): Promise<PspRedirect> {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return { ok: false, error: "stripe_not_configured" };
  const successUrl = `${baseUrl}/${locale}/checkout/return/stripe?order=${encodeURIComponent(order.order_no)}&session_id={CHECKOUT_SESSION_ID}`;
  const cancelUrl = `${baseUrl}/${locale}/checkout/return/cancelled?order=${encodeURIComponent(order.order_no)}`;
  const body = new URLSearchParams({
    mode: "payment",
    success_url: successUrl,
    cancel_url: cancelUrl,
    customer_email: order.email,
    client_reference_id: order.order_no,
    "metadata[order_no]": order.order_no,
    "line_items[0][quantity]": "1",
    "line_items[0][price_data][currency]": order.currency.toLowerCase(),
    "line_items[0][price_data][unit_amount]": String(amountMinor(order.total_cents, order.currency, order.fx_rate)),
    "line_items[0][price_data][product_data][name]": `WALLINE order ${order.order_no}`,
  });
  try {
    const res = await fetch("https://api.stripe.com/v1/checkout/sessions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body,
    });
    const data = (await res.json()) as { id?: string; url?: string; error?: { message?: string } };
    if (!res.ok || !data.url) return { ok: false, error: data.error?.message ?? "stripe_error" };
    return { ok: true, url: data.url, ref: data.id };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "stripe_error" };
  }
}

export async function verifyStripeSession(sessionId: string): Promise<{ paid: boolean; orderNo?: string }> {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return { paid: false };
  try {
    const res = await fetch(`https://api.stripe.com/v1/checkout/sessions/${encodeURIComponent(sessionId)}`, {
      headers: { Authorization: `Bearer ${key}` },
    });
    const data = (await res.json()) as { payment_status?: string; client_reference_id?: string; metadata?: { order_no?: string } };
    return { paid: data.payment_status === "paid", orderNo: data.metadata?.order_no ?? data.client_reference_id };
  } catch {
    return { paid: false };
  }
}

// ---------------------------------------------------------------------------
// PayPal Orders v2 via the REST API.
// ---------------------------------------------------------------------------

function paypalApiBase(): string {
  return process.env.PAYPAL_ENV === "live" ? "https://api-m.paypal.com" : "https://api-m.sandbox.paypal.com";
}

let paypalTokenCache: { token: string; expires: number } | null = null;

async function paypalAccessToken(): Promise<string | null> {
  const id = process.env.PAYPAL_CLIENT_ID;
  const secret = process.env.PAYPAL_CLIENT_SECRET;
  if (!id || !secret) return null;
  if (paypalTokenCache && paypalTokenCache.expires > Date.now() + 30_000) return paypalTokenCache.token;
  try {
    const res = await fetch(`${paypalApiBase()}/v1/oauth2/token`, {
      method: "POST",
      headers: {
        Authorization: `Basic ${Buffer.from(`${id}:${secret}`).toString("base64")}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: "grant_type=client_credentials",
    });
    const data = (await res.json()) as { access_token?: string; expires_in?: number };
    if (!res.ok || !data.access_token) return null;
    paypalTokenCache = { token: data.access_token, expires: Date.now() + (data.expires_in ?? 300) * 1000 };
    return data.access_token;
  } catch {
    return null;
  }
}

export async function createPaypalOrder(order: OrderRow, baseUrl: string, locale: Locale): Promise<PspRedirect> {
  const token = await paypalAccessToken();
  if (!token) return { ok: false, error: "paypal_not_configured" };
  const returnUrl = `${baseUrl}/${locale}/checkout/return/paypal?order=${encodeURIComponent(order.order_no)}`;
  const cancelUrl = `${baseUrl}/${locale}/checkout/return/cancelled?order=${encodeURIComponent(order.order_no)}`;
  try {
    const res = await fetch(`${paypalApiBase()}/v2/checkout/orders`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        intent: "CAPTURE",
        purchase_units: [
          {
            reference_id: order.order_no,
            description: `WALLINE order ${order.order_no}`,
            amount: {
              currency_code: order.currency,
              value: amountString(order.total_cents, order.currency, order.fx_rate),
            },
          },
        ],
        application_context: {
          brand_name: "WALLINE",
          locale: locale === "zh" ? "zh-CN" : "en-US",
          user_action: "PAY_NOW",
          return_url: returnUrl,
          cancel_url: cancelUrl,
        },
      }),
    });
    const data = (await res.json()) as { id?: string; links?: { rel: string; href: string }[]; message?: string };
    if (!res.ok || !data.id) return { ok: false, error: data.message ?? "paypal_error" };
    const approve = data.links?.find((link) => link.rel === "approve")?.href;
    return approve ? { ok: true, url: approve, ref: data.id } : { ok: false, error: "paypal_error" };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "paypal_error" };
  }
}

export async function capturePaypalOrder(paypalOrderId: string): Promise<{ paid: boolean; ref?: string }> {
  const token = await paypalAccessToken();
  if (!token) return { paid: false };
  try {
    const res = await fetch(`${paypalApiBase()}/v2/checkout/orders/${encodeURIComponent(paypalOrderId)}/capture`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    });
    const data = (await res.json()) as { status?: string; id?: string };
    return { paid: data.status === "COMPLETED", ref: data.id };
  } catch {
    return { paid: false };
  }
}
