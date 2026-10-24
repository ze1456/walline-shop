import { db } from "./db";
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

function nextOrderNo(): string {
  const now = new Date();
  const stamp = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}`;
  for (let attempt = 0; attempt < 20; attempt += 1) {
    const suffix = String(Math.floor(Math.random() * 900) + 100);
    const candidate = `WL${stamp}${suffix}`;
    const exists = db.prepare("SELECT 1 FROM orders WHERE order_no = ?").get(candidate);
    if (!exists) return candidate;
  }
  return `WL${stamp}${Date.now().toString().slice(-4)}`;
}

export function createOrderFromCart(input: CheckoutInput): CreateOrderResult {
  const cart = loadCart(input.cartId);
  if (cart.lines.length === 0) return { ok: false, error: "empty" };
  const method = getShippingMethod(input.shippingCode);
  if (!method) return { ok: false, error: "shipping" };
  if (method.country_group !== countryGroup(input.country)) return { ok: false, error: "country" };
  if (!input.email.includes("@") || !input.name.trim() || !input.address.trim()) return { ok: false, error: "invalid" };

  const { costCents: shippingCents } = shippingCost(method, cart.weightG, cart.subtotalCents);
  let discountCents = 0;
  let couponCode = "";
  if (cart.couponCode) {
    const coupon = evaluateCoupon(cart.couponCode, cart.subtotalCents);
    if (!coupon.ok) return { ok: false, error: "invalid" };
    discountCents = coupon.discountCents;
    couponCode = coupon.coupon.code;
  }
  const totalCents = Math.max(0, cart.subtotalCents - discountCents) + shippingCents;
  const currency = currencies[input.currency] ?? currencies.CNY;
  const now = new Date().toISOString().replace("T", " ").slice(0, 19);
  const orderNo = nextOrderNo();

  const result = db
    .prepare(
      `INSERT INTO orders (
        order_no, user_id, locale, currency, fx_rate, email, name, phone, company, country, province, city,
        address, postal, note, subtotal_cents, shipping_cents, discount_cents, total_cents, coupon_code,
        shipping_code, shipping_days, payment_method, payment_status, status, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'unpaid', 'pending_payment', ?, ?)`,
    )
    .run(
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
    );
  const orderId = Number(result.lastInsertRowid);

  const insertItem = db.prepare(
    `INSERT INTO order_items (
      order_id, product_id, slug, name_zh, name_en, variant_zh, variant_en, unit_zh, unit_en, image,
      unit_price_cents, qty, weight_g
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  );
  for (const line of cart.lines) {
    insertItem.run(
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
    );
  }

  clearCartItems(input.cartId);
  if (couponCode) redeemCoupon(couponCode);
  return { ok: true, order: getOrderById(orderId)! };
}

export function getOrderById(id: number): OrderRow | undefined {
  return db.prepare("SELECT * FROM orders WHERE id = ?").get(id) as unknown as OrderRow | undefined;
}

export function getOrderByNo(orderNo: string): OrderRow | undefined {
  return db.prepare("SELECT * FROM orders WHERE order_no = ?").get(orderNo.trim()) as unknown as OrderRow | undefined;
}

export function getOrderItems(orderId: number): OrderItemRow[] {
  return db.prepare("SELECT * FROM order_items WHERE order_id = ? ORDER BY id ASC").all(orderId) as unknown as OrderItemRow[];
}

export function listOrdersForUser(userId: number): OrderRow[] {
  return db.prepare("SELECT * FROM orders WHERE user_id = ? ORDER BY id DESC").all(userId) as unknown as OrderRow[];
}

export interface AdminOrderQuery {
  status?: string;
  q?: string;
  limit?: number;
  offset?: number;
}

export function listAllOrders(query: AdminOrderQuery = {}): OrderRow[] {
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
  return db
    .prepare(`SELECT * FROM orders ${where} ORDER BY id DESC LIMIT ? OFFSET ?`)
    .all(...params, query.limit ?? 100, query.offset ?? 0) as unknown as OrderRow[];
}

export function countOrdersByStatus(): Record<string, number> {
  const rows = db.prepare("SELECT status, COUNT(*) AS n FROM orders GROUP BY status").all() as unknown as {
    status: string;
    n: number;
  }[];
  return Object.fromEntries(rows.map((row) => [row.status, row.n]));
}

export function totalRevenueCents(): number {
  const row = db
    .prepare("SELECT COALESCE(SUM(total_cents), 0) AS total FROM orders WHERE payment_status = 'paid'")
    .get() as { total: number };
  return row.total;
}

export function markOrderPaid(orderId: number, paymentRef = ""): void {
  const order = getOrderById(orderId);
  if (!order || order.payment_status === "paid") return;
  const now = new Date().toISOString().replace("T", " ").slice(0, 19);
  db.prepare(
    "UPDATE orders SET payment_status = 'paid', status = 'paid', paid_at = ?, payment_ref = ?, updated_at = ? WHERE id = ?",
  ).run(now, paymentRef, now, orderId);
  for (const item of getOrderItems(orderId)) {
    if (item.product_id) {
      db.prepare("UPDATE products SET stock = MAX(0, stock - ?) WHERE id = ?").run(item.qty, item.product_id);
    }
  }
}

export function updateOrderStatus(orderId: number, status: string, trackingNo?: string): void {
  const now = new Date().toISOString().replace("T", " ").slice(0, 19);
  if (typeof trackingNo === "string") {
    db.prepare("UPDATE orders SET status = ?, tracking_no = ?, updated_at = ? WHERE id = ?").run(status, trackingNo, now, orderId);
  } else {
    db.prepare("UPDATE orders SET status = ?, updated_at = ? WHERE id = ?").run(status, now, orderId);
  }
}

export function markOrderRefunded(orderId: number): void {
  const now = new Date().toISOString().replace("T", " ").slice(0, 19);
  db.prepare("UPDATE orders SET status = 'refunded', payment_status = 'refunded', updated_at = ? WHERE id = ?").run(now, orderId);
}

export function setOrderPaymentRef(orderId: number, ref: string): void {
  db.prepare("UPDATE orders SET payment_ref = ? WHERE id = ?").run(ref, orderId);
}

/** Format an order amount stored in CNY cents into the order's currency. */
export function orderMoney(centsCny: number, order: Pick<OrderRow, "currency" | "fx_rate">): number {
  const rate = currencies[order.currency as CurrencyCode]?.rate ?? order.fx_rate;
  const major = (centsCny * rate) / 100;
  return order.currency === "JPY" ? Math.round(major) : Math.round(major * 100) / 100;
}
