import Link from "next/link";
import { redirect } from "next/navigation";
import { getDictionary } from "@/lib/dictionaries";
import type { Locale } from "@/lib/config";
import { localeHref, normalizeLocale, tr } from "@/lib/i18n";
import { isAdmin } from "@/lib/auth";
import { adminSignIn } from "@/app/actions/admin";

export const dynamic = "force-dynamic";

export default async function AdminLoginPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const locale = normalizeLocale((await params).locale) as Locale;
  if (await isAdmin()) redirect(localeHref(locale, "/admin"));
  const dict = getDictionary(locale);
  const query = await searchParams;
  const failed = Boolean(query.error);

  return (
    <div className="bg-stone-deep/40">
      <div className="wrap flex min-h-[60vh] items-center justify-center py-14">
        <div className="w-full max-w-sm">
          <div className="card p-7">
            <p className="eyebrow">{dict.admin.title}</p>
            <h1 className="mt-2 font-display text-2xl text-ink">{dict.admin.loginTitle}</h1>
            <p className="mt-1 text-xs text-ink-muted">WALLINE 沃澜</p>

            {failed ? (
              <p className="mt-4 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-800">
                {dict.admin.wrongPassword}
              </p>
            ) : null}

            <form action={adminSignIn} className="mt-5 space-y-4">
              <input type="hidden" name="locale" value={locale} />
              <div>
                <label className="label" htmlFor="password">
                  {dict.admin.password}
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  autoComplete="current-password"
                  className="field"
                  placeholder="••••••••"
                />
              </div>
              <button type="submit" className="btn btn-primary w-full">
                {dict.admin.signIn}
              </button>
            </form>

            <p className="mt-4 rounded-lg bg-stone px-3 py-2 text-[11px] leading-relaxed text-ink-muted">
              {tr(locale, {
                zh: "演示环境默认密码：walline-admin（可通过环境变量 ADMIN_PASSWORD 覆盖）。",
                en: "Demo password: walline-admin (override with the ADMIN_PASSWORD env var).",
              })}
            </p>
          </div>

          <div className="mt-4 flex items-center justify-between text-xs text-ink-muted">
            <Link href={localeHref(locale, "/")} className="hover:text-ink">
              {dict.admin.viewStore}
            </Link>
            <Link href={localeHref(locale, "/account/login")} className="hover:text-ink">
              {tr(locale, { zh: "客户登录", en: "Customer sign in" })}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
