"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { checkAdminPassword, clearAdminCookie, isAdmin, setAdminCookie } from "@/lib/auth";
import { db } from "@/lib/db";
import { centsFromYuanInput } from "@/lib/money";
import { localeHref, normalizeLocale } from "@/lib/i18n";
import { markOrderPaid, updateOrderStatus } from "@/lib/orders";

function adminHome(locale: string): string {
  return localeHref(normalizeLocale(locale), "/admin");
}

function loginUrl(locale: string): string {
  return localeHref(normalizeLocale(locale), "/admin/login");
}

async function requireAdmin(locale: string): Promise<void> {
  if (!(await isAdmin())) redirect(loginUrl(locale));
}

function text(formData: FormData, key: string): string {
  return String(formData.get(key) ?? "").trim();
}

function int(formData: FormData, key: string, fallback = 0): number {
  const value = Number(formData.get(key));
  return Number.isFinite(value) ? Math.trunc(value) : fallback;
}

export async function adminSignIn(formData: FormData): Promise<void> {
  const locale = normalizeLocale(String(formData.get("locale") ?? ""));
  const password = String(formData.get("password") ?? "");
  if (!checkAdminPassword(password)) redirect(`${adminHome(locale)}/login?error=1`);
  await setAdminCookie();
  redirect(adminHome(locale));
}

export async function adminSignOut(formData: FormData): Promise<void> {
  const locale = normalizeLocale(String(formData.get("locale") ?? ""));
  await clearAdminCookie();
  redirect(adminHome(locale));
}
export async function saveProduct(formData: FormData): Promise<void> {
  const locale = normalizeLocale(String(formData.get("locale") ?? ""));
  await requireAdmin(locale);
  const id = int(formData, "id");
  const slug = text(formData, "slug");
  if (!slug) redirect(`${adminHome(locale)}/products`);
  const values = [
    slug,
    text(formData, "category"),
    text(formData, "name_zh"),
    text(formData, "name_en"),
    text(formData, "subtitle_zh"),
    text(formData, "subtitle_en"),
    text(formData, "description_zh"),
    text(formData, "description_en"),
    centsFromYuanInput(text(formData, "price")),
    centsFromYuanInput(text(formData, "compare") || "0"),
    text(formData, "unit_zh"),
    text(formData, "unit_en"),
    int(formData, "moq", 1) || 1,
    int(formData, "weight_g", 100) || 100,
    int(formData, "stock"),
    formData.get("featured") ? 1 : 0,
    text(formData, "badge_zh"),
    text(formData, "badge_en"),
    text(formData, "image") || `/images/products/${slug}.svg`,
    formData.get("active") ? 1 : 0,
    int(formData, "sort", 100),
  ];

  if (id > 0) {
    db.prepare(
      `UPDATE products SET slug = ?, category = ?, name_zh = ?, name_en = ?, subtitle_zh = ?, subtitle_en = ?,
        description_zh = ?, description_en = ?, price_cents = ?, compare_at_cents = ?, unit_zh = ?, unit_en = ?,
        moq = ?, weight_g = ?, stock = ?, featured = ?, badge_zh = ?, badge_en = ?, image = ?, active = ?, sort = ?,
        updated_at = datetime('now')
       WHERE id = ?`,
    ).run(...values, id);
  } else {
    db.prepare(
      `INSERT INTO products (
        slug, category, name_zh, name_en, subtitle_zh, subtitle_en, description_zh, description_en,
        price_cents, compare_at_cents, unit_zh, unit_en, moq, weight_g, stock, featured, badge_zh, badge_en,
        image, active, sort, images, specs
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    ).run(...values, JSON.stringify([`/images/products/${slug}.svg`]), "[]");
  }
  revalidatePath("/", "layout");
  redirect(`${adminHome(locale)}/products?saved=1`);
}

export async function deleteProduct(formData: FormData): Promise<void> {
  const locale = normalizeLocale(String(formData.get("locale") ?? ""));
  await requireAdmin(locale);
  const id = int(formData, "id");
  if (id > 0) {
    db.prepare("DELETE FROM variants WHERE product_id = ?").run(id);
    db.prepare("DELETE FROM products WHERE id = ?").run(id);
  }
  revalidatePath("/", "layout");
  redirect(`${adminHome(locale)}/products?deleted=1`);
}

export async function updateOrderAdmin(formData: FormData): Promise<void> {
  const locale = normalizeLocale(String(formData.get("locale") ?? ""));
  await requireAdmin(locale);
  const id = int(formData, "id");
  const status = text(formData, "status");
  const tracking = text(formData, "trackingNo");
  const paymentStatus = text(formData, "paymentStatus");
  if (id > 0) {
    if (status) updateOrderStatus(id, status, tracking);
    if (paymentStatus === "paid") markOrderPaid(id, "admin");
  }
  revalidatePath("/", "layout");
  redirect(`${adminHome(locale)}/orders/${id}?saved=1`);
}

export async function saveCoupon(formData: FormData): Promise<void> {
  const locale = normalizeLocale(String(formData.get("locale") ?? ""));
  await requireAdmin(locale);
  const code = text(formData, "code").toUpperCase();
  if (!code) redirect(`${adminHome(locale)}/coupons`);
  const type = text(formData, "type") === "fixed" ? "fixed" : "percent";
  const rawValue = text(formData, "value");
  const value = type === "fixed" ? centsFromYuanInput(rawValue) : Math.max(1, Math.round(Number(rawValue) || 0));
  const existing = db.prepare("SELECT id FROM coupons WHERE code = ?").get(code) as { id: number } | undefined;
  const row = [
    type,
    value,
    centsFromYuanInput(text(formData, "min") || "0"),
    text(formData, "expires") || null,
    Math.max(0, int(formData, "maxUses")),
    formData.get("active") ? 1 : 0,
  ];
  if (existing) {
    db.prepare("UPDATE coupons SET type = ?, value = ?, min_subtotal_cents = ?, expires_at = ?, max_uses = ?, active = ? WHERE id = ?").run(
      ...row,
      existing.id,
    );
  } else {
    db.prepare(
      "INSERT INTO coupons (code, type, value, min_subtotal_cents, expires_at, max_uses, used_count, active, created_at) VALUES (?, ?, ?, ?, ?, ?, 0, ?, datetime('now'))",
    ).run(code, ...row);
  }
  redirect(`${adminHome(locale)}/coupons?saved=1`);
}

export async function toggleCoupon(formData: FormData): Promise<void> {
  const locale = normalizeLocale(String(formData.get("locale") ?? ""));
  await requireAdmin(locale);
  const id = int(formData, "id");
  if (id > 0) db.prepare("UPDATE coupons SET active = 1 - active WHERE id = ?").run(id);
  redirect(`${adminHome(locale)}/coupons`);
}
