import { dbAll, dbGet, dbRun } from "./db";

export interface CouponRow {
  id: number;
  code: string;
  type: "percent" | "fixed";
  value: number;
  min_subtotal_cents: number;
  expires_at: string | null;
  max_uses: number;
  used_count: number;
  active: number;
  created_at: string;
}

export type CouponResult =
  | { ok: true; coupon: CouponRow; discountCents: number }
  | { ok: false; error: "invalid" | "expired" | "min" };

export async function getCoupon(code: string): Promise<CouponRow | undefined> {
  return dbGet<CouponRow>("SELECT * FROM coupons WHERE code = ? COLLATE NOCASE", [code.trim()]);
}

export async function listCoupons(): Promise<CouponRow[]> {
  return dbAll<CouponRow>("SELECT * FROM coupons ORDER BY id DESC");
}

/** Validate a coupon against the CNY subtotal and compute the discount in CNY cents. */
export async function evaluateCoupon(code: string, subtotalCents: number): Promise<CouponResult> {
  const coupon = await getCoupon(code);
  if (!coupon || !coupon.active) return { ok: false, error: "invalid" };
  if (coupon.expires_at) {
    const expiry = new Date(`${coupon.expires_at}T23:59:59`);
    if (Number.isFinite(expiry.getTime()) && expiry.getTime() < Date.now()) return { ok: false, error: "expired" };
  }
  if (coupon.max_uses > 0 && coupon.used_count >= coupon.max_uses) return { ok: false, error: "invalid" };
  if (subtotalCents < coupon.min_subtotal_cents) return { ok: false, error: "min" };
  const discountCents =
    coupon.type === "percent"
      ? Math.round((subtotalCents * Math.min(coupon.value, 100)) / 100)
      : Math.min(coupon.value, subtotalCents);
  return { ok: true, coupon, discountCents };
}

export async function redeemCoupon(code: string): Promise<void> {
  await dbRun("UPDATE coupons SET used_count = used_count + 1 WHERE code = ? COLLATE NOCASE", [code]);
}
