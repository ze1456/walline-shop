"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { currencyCookie, currencies, type CurrencyCode } from "@/lib/config";
import { safeInternalPath } from "@/lib/i18n";

export async function setCurrency(formData: FormData): Promise<void> {
  const code = String(formData.get("code") ?? "");
  const path = safeInternalPath(String(formData.get("path") ?? "/"));
  if (code in currencies) {
    const store = await cookies();
    store.set(currencyCookie, code as CurrencyCode, {
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
      sameSite: "lax",
    });
  }
  redirect(path);
}
