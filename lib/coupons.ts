import { db } from "./db";

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

export function getCoupon(code: string): CouponRow | undefined {
  return db.prepare("SELECT * FROM coupons WHERE code = ? COLLATE NOCASE").get(code.trim()) as unknown as CouponRow | undefined;
}

export function listCoupons(): CouponRow[] {
  return db.prepare("SELECT * FROM coupons ORDER BY id DESC").all() as unknown as CouponRow[];
}

/** Validate a coupon against the CNY subtotal and compute the discount in CNY cents. */
export function evaluateCoupon(code: string, subtotalCents: number): CouponResult {
  const coupon = getCoupon(code);
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

export function redeemCoupon(code: string): void {
  db.prepare("UPDATE coupons SET used_count = used_count + 1 WHERE code = ? COLLATE NOCASE").run(code);
}
