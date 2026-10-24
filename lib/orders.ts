import { dbAll, dbGet, dbRun } from "./db";
import { loadCart, clearCartItems } from "./cart";
import { getShippingMethod, shippingCost } from "./shipping";
import { evaluateCoupon, redeemCoupon } from "./coupons";
import { currencies, countryGroup, type CurrencyCode, type Locale, type PaymentMethodId } from "./config";

export interface OrderRow {
  id: number;
  order_no: string;
  user_id: number | null;
  locale: string;
  currency: string;
  fx_rate: number;
  email: string;
  name: string;
  phone: string;
  company: string;
  country: string;
  province: string;
  city: string;
  address: string;
  postal: string;
  note: string;
  subtotal_cents: number;
  shipping_cents: number;
  discount_cents: number;
  total_cents: number;
  coupon_code: string;
  shipping_code: string;
  shipping_days: string;
  payment_method: string;
  payment_status: string;
  payment_ref: string;
  status: string;
  tracking_no: string;
  created_at: string;
  updated_at: string;
  paid_at: string | null;
}

export interface OrderItemRow {
  id: number;
  order_id: number;
  product_id: number | null;
  slug: string;
  name_zh: string;
  name_en: string;
  variant_zh: string;
  variant_en: string;
  unit_zh: string;
  unit_en: string;
  image: string;
  unit_price_cents: number;
  qty: number;
  weight_g: number;
}

export interface CheckoutInput {
  cartId: string;
  userId: number | null;
  locale: Locale;
  currency: CurrencyCode;
  email: string;
  name: string;
  phone: string;
  company: string;
  country: string;
  province: string;
  city: string;
  address: string;
  postal: string;
  note: string;
  shippingCode: string;
  paymentMethod: PaymentMethodId;
}

export type CreateOrderResult = { ok: true; order: OrderRow } | { ok: false; error: "empty" | "shipping" | "country" | "invalid" };

async function nextOrderNo(): Promise<string> {
  const now = new Date();
  const stamp = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}`;
  for (let attempt = 0; attempt < 20; attempt += 1) {
    const suffix = String(Math.floor(Math.random() * 900) + 100);
    const candidate = `WL${stamp}${suffix}`;
    const exists = await dbGet("SELECT 1 FROM orders WHERE order_no = ?", [candidate]);
    if (!exists) return candidate;
  }
  return `WL${stamp}${Date.now().toString().slice(-4)}`;
}

export async function createOrderFromCart(input: CheckoutInput): Promise<CreateOrderResult> {
  const cart = await loadCart(input.cartId);
  if (cart.lines.length === 0) return { ok: false, error: "empty" };
  const method = await getShippingMethod(input.shippingCode);
  if (!method) return { ok: false, error: "shipping" };
  if (method.country_group !== countryGroup(input.country)) return { ok: false, error: "country" };
  if (!input.email.includes("@") || !input.name.trim() || !input.address.trim()) return { ok: false, error: "invalid" };

  const { costCents: shippingCents } = shippingCost(method, cart.weightG, cart.subtotalCents);
  let discountCents = 0;
  let couponCode = "";
  if (cart.couponCode) {
    const coupon = await evaluateCoupon(cart.couponCode, cart.subtotalCents);
    if (!coupon.ok) return { ok: false, error: "invalid" };
    discountCents = coupon.discountCents;
    couponCode = coupon.coupon.code;
  }
  const totalCents = Math.max(0, cart.subtotalCents - discountCents) + shippingCents;
  const currency = currencies[input.currency] ?? currencies.CNY;
  const now = new Date().toISOString().replace("T", " ").slice(0, 19);
  const orderNo = await nextOrderNo();

  const result = await dbRun(
    `INSERT INTO orders (
      order_no, user_id, locale, currency, fx_rate, email, name, phone, company, country, province, city,
      address, postal, note, subtotal_cents, shipping_cents, discount_cents, total_cents, coupon_code,
      shipping_code, shipping_days, payment_method, payment_status, status, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'unpaid', 'pending_payment', ?, ?)`,
    [
      orderNo,
      input.userId,
      input.locale,
      input.currency,
      currency.rate,
      input.email.trim(),
      input.name.trim(),
      input.phone.trim(),
      input.company.trim(),
      input.country.toUpperCase(),
      input.province.trim(),
      input.city.trim(),
      input.address.trim(),
      input.postal.trim(),
      input.note.trim(),
      cart.subtotalCents,
      shippingCents,
      discountCents,
      totalCents,
      couponCode,
      method.code,
      `${method.days_min}-${method.days_max}`,
      input.paymentMethod,
      now,
      now,
    ],
  );
  const orderId = result.lastInsertRowid;

  const insertItemSql = `INSERT INTO order_items (
    order_id, product_id, slug, name_zh, name_en, variant_zh, variant_en, unit_zh, unit_en, image,
    unit_price_cents, qty, weight_g
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
  for (const line of cart.lines) {
    await dbRun(insertItemSql, [
      orderId,
      line.productId,
      line.slug,
      line.nameZh,
      line.nameEn,
      line.variantZh,
      line.variantEn,
      line.unitZh,
      line.unitEn,
      line.image,
      line.priceCents,
      line.qty,
      line.weightG,
    ]);
  }

  await clearCartItems(input.cartId);
  if (couponCode) await redeemCoupon(couponCode);
  const order = await getOrderById(orderId);
  return { ok: true, order: order! };
}

export async function getOrderById(id: number): Promise<OrderRow | undefined> {
  return dbGet<OrderRow>("SELECT * FROM orders WHERE id = ?", [id]);
}

export async function getOrderByNo(orderNo: string): Promise<OrderRow | undefined> {
  return dbGet<OrderRow>("SELECT * FROM orders WHERE order_no = ?", [orderNo.trim()]);
}

export async function getOrderItems(orderId: number): Promise<OrderItemRow[]> {
  return dbAll<OrderItemRow>("SELECT * FROM order_items WHERE order_id = ? ORDER BY id ASC", [orderId]);
}

export async function listOrdersForUser(userId: number): Promise<OrderRow[]> {
  return dbAll<OrderRow>("SELECT * FROM orders WHERE user_id = ? ORDER BY id DESC", [userId]);
}

export interface AdminOrderQuery {
  status?: string;
  q?: string;
  limit?: number;
  offset?: number;
}

export async function listAllOrders(query: AdminOrderQuery = {}): Promise<OrderRow[]> {
  const clauses: string[] = [];
  const params: (string | number)[] = [];
  if (query.status) {
    clauses.push("status = ?");
    params.push(query.status);
  }
  if (query.q?.trim()) {
    const like = `%${query.q.trim()}%`;
    clauses.push("(order_no LIKE ? OR email LIKE ? OR name LIKE ? OR phone LIKE ?)");
    params.push(like, like, like, like);
  }
  const where = clauses.length ? `WHERE ${clauses.join(" AND ")}` : "";
  return dbAll<OrderRow>(`SELECT * FROM orders ${where} ORDER BY id DESC LIMIT ? OFFSET ?`, [
    ...params,
    query.limit ?? 100,
    query.offset ?? 0,
  ]);
}

export async function countOrdersByStatus(): Promise<Record<string, number>> {
  const rows = await dbAll<{ status: string; n: number }>("SELECT status, COUNT(*) AS n FROM orders GROUP BY status");
  return Object.fromEntries(rows.map((row) => [row.status, row.n]));
}

export async function totalRevenueCents(): Promise<number> {
  const row = await dbGet<{ total: number }>(
    "SELECT COALESCE(SUM(total_cents), 0) AS total FROM orders WHERE payment_status = 'paid'",
  );
  return row?.total ?? 0;
}

export async function markOrderPaid(orderId: number, paymentRef = ""): Promise<void> {
  const order = await getOrderById(orderId);
  if (!order || order.payment_status === "paid") return;
  const now = new Date().toISOString().replace("T", " ").slice(0, 19);
  await dbRun(
    "UPDATE orders SET payment_status = 'paid', status = 'paid', paid_at = ?, payment_ref = ?, updated_at = ? WHERE id = ?",
    [now, paymentRef, now, orderId],
  );
  const items = await getOrderItems(orderId);
  for (const item of items) {
    if (item.product_id) {
      await dbRun("UPDATE products SET stock = MAX(0, stock - ?) WHERE id = ?", [item.qty, item.product_id]);
    }
  }
}

export async function updateOrderStatus(orderId: number, status: string, trackingNo?: string): Promise<void> {
  const now = new Date().toISOString().replace("T", " ").slice(0, 19);
  if (typeof trackingNo === "string") {
    await dbRun("UPDATE orders SET status = ?, tracking_no = ?, updated_at = ? WHERE id = ?", [status, trackingNo, now, orderId]);
  } else {
    await dbRun("UPDATE orders SET status = ?, updated_at = ? WHERE id = ?", [status, now, orderId]);
  }
}

export async function markOrderRefunded(orderId: number): Promise<void> {
  const now = new Date().toISOString().replace("T", " ").slice(0, 19);
  await dbRun("UPDATE orders SET status = 'refunded', payment_status = 'refunded', updated_at = ? WHERE id = ?", [now, orderId]);
}

export async function setOrderPaymentRef(orderId: number, ref: string): Promise<void> {
  await dbRun("UPDATE orders SET payment_ref = ? WHERE id = ?", [ref, orderId]);
}

/** Format an order amount stored in CNY cents into the order's currency. */
export function orderMoney(centsCny: number, order: Pick<OrderRow, "currency" | "fx_rate">): number {
  const rate = currencies[order.currency as CurrencyCode]?.rate ?? order.fx_rate;
  const major = (centsCny * rate) / 100;
  return order.currency === "JPY" ? Math.round(major) : Math.round(major * 100) / 100;
}
