"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { authenticate, registerUser, createSession, destroySession, getCurrentUser, setSessionCookie, clearSessionCookie, getSessionToken, updateUserProfile } from "@/lib/auth";
import { localeHref, normalizeLocale } from "@/lib/i18n";

export async function signIn(formData: FormData): Promise<void> {
  const locale = normalizeLocale(String(formData.get("locale") ?? ""));
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const user = await authenticate(email, password);
  if (!user) {
    redirect(`${localeHref(locale, "/account/login")}?error=credentials`);
  }
  const token = await createSession(user.id);
  await setSessionCookie(token);
  revalidatePath("/", "layout");
  redirect(localeHref(locale, "/account"));
}

export async function signUp(formData: FormData): Promise<void> {
  const locale = normalizeLocale(String(formData.get("locale") ?? ""));
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  if (password.length < 6) redirect(`${localeHref(locale, "/account/register")}?error=password`);
  const result = await registerUser({ email, password, name });
  if (!result.ok) {
    redirect(`${localeHref(locale, "/account/register")}?error=${result.error}`);
  }
  const token = await createSession(result.user.id);
  await setSessionCookie(token);
  revalidatePath("/", "layout");
  redirect(localeHref(locale, "/account"));
}

export async function signOut(formData: FormData): Promise<void> {
  const locale = normalizeLocale(String(formData.get("locale") ?? ""));
  const token = await getSessionToken();
  if (token) await destroySession(token);
  await clearSessionCookie();
  revalidatePath("/", "layout");
  redirect(localeHref(locale));
}

export async function saveProfile(formData: FormData): Promise<void> {
  const locale = normalizeLocale(String(formData.get("locale") ?? ""));
  const user = await getCurrentUser();
  if (!user) redirect(localeHref(locale, "/account/login"));
  await updateUserProfile(user.id, {
    name: String(formData.get("name") ?? ""),
    phone: String(formData.get("phone") ?? ""),
    company: String(formData.get("company") ?? ""),
    country: String(formData.get("country") ?? "CN"),
  });
  revalidatePath(localeHref(locale, "/account"));
  redirect(`${localeHref(locale, "/account")}?saved=1`);
}
