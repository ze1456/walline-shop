"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { addCartItem, ensureCart, getCurrentCartId, removeCartItem, setCartCoupon, setCartItemQty } from "@/lib/cart";
import { localeHref, normalizeLocale, safeInternalPath } from "@/lib/i18n";

function pathFrom(formData: FormData, locale: string, fallback: string): string {
  return safeInternalPath(String(formData.get("redirectTo") ?? ""), localeHref(normalizeLocale(locale), fallback));
}

export async function addToCart(formData: FormData): Promise<void> {
  const locale = normalizeLocale(String(formData.get("locale") ?? ""));
  const back = pathFrom(formData, locale, "/cart");
  const productId = Number(formData.get("productId") ?? 0);
  const variantRaw = String(formData.get("variantId") ?? "");
  const variantId = variantRaw ? Number(variantRaw) : null;
  const qty = Math.max(1, Number(formData.get("qty") ?? 1) || 1);
  if (!productId) redirect(back);
  const cartId = await ensureCart();
  await addCartItem(cartId, productId, Number.isFinite(variantId) ? variantId : null, qty);
  revalidatePath("/", "layout");
  redirect(`${back}${back.includes("?") ? "&" : "?"}added=1`);
}

export async function buyNow(formData: FormData): Promise<void> {
  const locale = normalizeLocale(String(formData.get("locale") ?? ""));
  const productId = Number(formData.get("productId") ?? 0);
  const variantRaw = String(formData.get("variantId") ?? "");
  const variantId = variantRaw ? Number(variantRaw) : null;
  const qty = Math.max(1, Number(formData.get("qty") ?? 1) || 1);
  if (!productId) redirect(localeHref(locale, "/cart"));
  const cartId = await ensureCart();
  await addCartItem(cartId, productId, Number.isFinite(variantId) ? variantId : null, qty);
  revalidatePath("/", "layout");
  redirect(localeHref(locale, "/checkout"));
}

export async function updateCartQty(formData: FormData): Promise<void> {
  const locale = normalizeLocale(String(formData.get("locale") ?? ""));
  const back = pathFrom(formData, locale, "/cart");
  const cartId = await getCurrentCartId();
  const itemId = Number(formData.get("itemId") ?? 0);
  const qty = Number(formData.get("qty") ?? 0);
  if (cartId && itemId) await setCartItemQty(cartId, itemId, qty);
  revalidatePath("/", "layout");
  redirect(back);
}

export async function removeFromCart(formData: FormData): Promise<void> {
  const locale = normalizeLocale(String(formData.get("locale") ?? ""));
  const back = pathFrom(formData, locale, "/cart");
  const cartId = await getCurrentCartId();
  const itemId = Number(formData.get("itemId") ?? 0);
  if (cartId && itemId) await removeCartItem(cartId, itemId);
  revalidatePath("/", "layout");
  redirect(back);
}

export async function applyCoupon(formData: FormData): Promise<void> {
  const locale = normalizeLocale(String(formData.get("locale") ?? ""));
  const cartId = await getCurrentCartId();
  const code = String(formData.get("code") ?? "").trim();
  const back = localeHref(locale, "/cart");
  if (!cartId || !code) redirect(back);
  await setCartCoupon(cartId, code);
  revalidatePath("/", "layout");
  redirect(`${back}?coupon=${encodeURIComponent(code)}`);
}

export async function removeCoupon(formData: FormData): Promise<void> {
  const locale = normalizeLocale(String(formData.get("locale") ?? ""));
  const cartId = await getCurrentCartId();
  if (cartId) await setCartCoupon(cartId, "");
  revalidatePath("/", "layout");
  redirect(localeHref(locale, "/cart"));
}
