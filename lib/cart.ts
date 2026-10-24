import { cookies } from "next/headers";
import crypto from "node:crypto";
import { dbAll, dbGet, dbRun } from "./db";
import { cartCookie } from "./config";
import { evaluateCoupon } from "./coupons";

export interface CartLine {
  itemId: number;
  productId: number;
  variantId: number | null;
  slug: string;
  nameZh: string;
  nameEn: string;
  image: string;
  unitZh: string;
  unitEn: string;
  variantZh: string;
  variantEn: string;
  priceCents: number;
  qty: number;
  weightG: number;
  stock: number;
  moq: number;
}

export interface Cart {
  id: string | null;
  lines: CartLine[];
  count: number;
  subtotalCents: number;
  weightG: number;
  couponCode: string;
  couponError?: "invalid" | "expired" | "min";
  discountCents: number;
}

export function emptyCart(): Cart {
  return { id: null, lines: [], count: 0, subtotalCents: 0, weightG: 0, couponCode: "", discountCents: 0 };
}

interface CartItemJoinRow {
  item_id: number;
  qty: number;
  product_id: number;
  variant_id: number | null;
  slug: string;
  name_zh: string;
  name_en: string;
  image: string;
  unit_zh: string;
  unit_en: string;
  price_cents: number;
  weight_g: number;
  stock: number;
  moq: number;
  variant_name_zh: string | null;
  variant_name_en: string | null;
  variant_delta: number | null;
  variant_image: string | null;
  variant_stock: number | null;
}

export async function loadCart(cartId: string | null | undefined): Promise<Cart> {
  if (!cartId) return emptyCart();
  const record = await dbGet<{ id: string; coupon_code: string }>("SELECT * FROM carts WHERE id = ?", [cartId]);
  if (!record) return emptyCart();
  const rows = await dbAll<CartItemJoinRow>(
    `SELECT ci.id AS item_id, ci.qty, ci.product_id, ci.variant_id,
            p.slug, p.name_zh, p.name_en, p.image, p.unit_zh, p.unit_en,
            p.price_cents, p.weight_g, p.stock, p.moq,
            v.name_zh AS variant_name_zh, v.name_en AS variant_name_en,
            v.price_delta_cents AS variant_delta, v.image AS variant_image, v.stock AS variant_stock
     FROM cart_items ci
     JOIN products p ON p.id = ci.product_id
     LEFT JOIN variants v ON v.id = ci.variant_id
     WHERE ci.cart_id = ?
     ORDER BY ci.id ASC`,
    [cartId],
  );

  const lines: CartLine[] = rows.map((row) => ({
    itemId: row.item_id,
    productId: row.product_id,
    variantId: row.variant_id,
    slug: row.slug,
    nameZh: row.name_zh,
    nameEn: row.name_en,
    image: row.variant_image || row.image,
    unitZh: row.unit_zh,
    unitEn: row.unit_en,
    variantZh: row.variant_name_zh ?? "",
    variantEn: row.variant_name_en ?? "",
    priceCents: row.price_cents + (row.variant_delta ?? 0),
    qty: row.qty,
    weightG: row.weight_g * row.qty,
    stock: row.variant_stock ?? row.stock,
    moq: row.moq,
  }));

  const subtotalCents = lines.reduce((sum, line) => sum + line.priceCents * line.qty, 0);
  const weightG = lines.reduce((sum, line) => sum + line.weightG, 0);
  const count = lines.reduce((sum, line) => sum + line.qty, 0);
  let discountCents = 0;
  let couponError: Cart["couponError"];
  if (record.coupon_code) {
    const result = await evaluateCoupon(record.coupon_code, subtotalCents);
    if (result.ok) discountCents = result.discountCents;
    else couponError = result.error;
  }
  return {
    id: cartId,
    lines,
    count,
    subtotalCents,
    weightG,
    couponCode: record.coupon_code,
    couponError,
    discountCents,
  };
}

/** Read-only helper for server components: the current cart, if any. */
export async function getCart(): Promise<Cart> {
  const store = await cookies();
  return loadCart(store.get(cartCookie)?.value);
}

export async function getCartCount(): Promise<number> {
  return (await getCart()).count;
}

async function readCartId(): Promise<string | undefined> {
  const store = await cookies();
  return store.get(cartCookie)?.value;
}

/** Ensure a cart row + cookie exist. Only call from server actions / route handlers. */
export async function ensureCart(): Promise<string> {
  const store = await cookies();
  const existing = store.get(cartCookie)?.value;
  if (existing) {
    const found = await dbGet<{ id: string }>("SELECT id FROM carts WHERE id = ?", [existing]);
    if (found) return found.id;
  }
  const id = crypto.randomBytes(16).toString("hex");
  await dbRun("INSERT INTO carts (id) VALUES (?)", [id]);
  store.set(cartCookie, id, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 60,
    secure: process.env.NODE_ENV === "production",
  });
  return id;
}

export async function addCartItem(cartId: string, productId: number, variantId: number | null, qty: number): Promise<void> {
  const product = await dbGet<{ price_cents: number; stock: number; moq: number }>(
    "SELECT price_cents, stock, moq FROM products WHERE id = ? AND active = 1",
    [productId],
  );
  if (!product) return;
  const existing = await dbGet<{ id: number; qty: number }>(
    "SELECT id, qty FROM cart_items WHERE cart_id = ? AND product_id = ? AND variant_id IS ?",
    [cartId, productId, variantId],
  );
  const desired = Math.max(product.moq, (existing?.qty ?? 0) + Math.max(1, Math.round(qty)));
  const capped = product.stock > 0 ? Math.min(desired, product.stock) : desired;
  if (existing) {
    await dbRun("UPDATE cart_items SET qty = ? WHERE id = ?", [capped, existing.id]);
  } else {
    await dbRun("INSERT INTO cart_items (cart_id, product_id, variant_id, qty) VALUES (?, ?, ?, ?)", [
      cartId,
      productId,
      variantId,
      capped,
    ]);
  }
  await dbRun("UPDATE carts SET updated_at = datetime('now') WHERE id = ?", [cartId]);
}

export async function setCartItemQty(cartId: string, itemId: number, qty: number): Promise<void> {
  if (qty <= 0) {
    await removeCartItem(cartId, itemId);
    return;
  }
  const row = await dbGet<{ id: number; stock: number; moq: number; variant_stock: number | null }>(
    `SELECT ci.id, p.stock, p.moq, v.stock AS variant_stock
     FROM cart_items ci JOIN products p ON p.id = ci.product_id
     LEFT JOIN variants v ON v.id = ci.variant_id
     WHERE ci.id = ? AND ci.cart_id = ?`,
    [itemId, cartId],
  );
  if (!row) return;
  const stock = row.variant_stock ?? row.stock;
  const capped = stock > 0 ? Math.min(Math.max(row.moq, qty), stock) : Math.max(row.moq, qty);
  await dbRun("UPDATE cart_items SET qty = ? WHERE id = ?", [capped, itemId]);
}

export async function removeCartItem(cartId: string, itemId: number): Promise<void> {
  await dbRun("DELETE FROM cart_items WHERE id = ? AND cart_id = ?", [itemId, cartId]);
}

export async function clearCartItems(cartId: string): Promise<void> {
  await dbRun("DELETE FROM cart_items WHERE cart_id = ?", [cartId]);
  await dbRun("UPDATE carts SET coupon_code = '' WHERE id = ?", [cartId]);
}

export async function setCartCoupon(cartId: string, code: string): Promise<void> {
  await dbRun("UPDATE carts SET coupon_code = ?, updated_at = datetime('now') WHERE id = ?", [
    code.trim().toUpperCase(),
    cartId,
  ]);
}

export async function getCurrentCartId(): Promise<string | undefined> {
  return readCartId();
}
