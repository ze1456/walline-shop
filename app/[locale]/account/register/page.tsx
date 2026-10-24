import Link from "next/link";
import { redirect } from "next/navigation";
import { getDictionary } from "@/lib/dictionaries";
import { countries } from "@/lib/config";
import { localeHref, normalizeLocale, tr } from "@/lib/i18n";
import { getCurrentUser } from "@/lib/auth";
import { signUp } from "@/app/actions/auth";

export const dynamic = "force-dynamic";

export default async function RegisterPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const locale = normalizeLocale((await params).locale);
  const query = await searchParams;
  const user = await getCurrentUser();
  if (user) redirect(localeHref(locale, "/account"));
  const dict = getDictionary(locale);
  const error = typeof query.error === "string" ? query.error : "";
  const errorText =
    error === "exists" ? dict.account.errorExists : error === "password" ? dict.account.errorPassword : error === "invalid" ? dict.account.errorEmail : "";

  return (
    <div className="wrap py-14">
      <div className="mx-auto w-full max-w-md">
        <h1 className="font-display text-3xl text-ink">{dict.account.registerTitle}</h1>
        <p className="mt-2 text-sm text-ink-muted">
          {tr(locale, { zh: "注册后即可保存收货信息、查看订单与物流。", en: "Create an account to save addresses and follow your orders." })}
        </p>
        {errorText ? <p className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{errorText}</p> : null}
        <form action={signUp} className="mt-7 space-y-4 rounded-2xl border border-line bg-white p-6">
          <input type="hidden" name="locale" value={locale} />
          <div>
            <label htmlFor="email" className="label">
              {dict.account.email}
            </label>
            <input id="email" type="email" name="email" required autoComplete="email" className="field mt-2" />
          </div>
          <div>
            <label htmlFor="password" className="label">
              {dict.account.password}
            </label>
            <input id="password" type="password" name="password" required minLength={8} autoComplete="new-password" className="field mt-2" />
            <p className="mt-1 text-[11px] text-ink-muted">{dict.account.passwordHint}</p>
          </div>
          <div>
            <label htmlFor="name" className="label">
              {dict.account.name}
            </label>
            <input id="name" name="name" required autoComplete="name" className="field mt-2" />
          </div>
          <div>
            <label htmlFor="country" className="label">
              {dict.account.country}
            </label>
            <select id="country" name="country" defaultValue="CN" className="field mt-2">
              {countries.map((item) => (
                <option key={item.code} value={item.code}>
                  {tr(locale, { zh: item.nameZh, en: item.nameEn })}
                </option>
              ))}
            </select>
          </div>
          <button type="submit" className="btn btn-primary w-full">
            {dict.account.signUp}
          </button>
          <p className="text-center text-xs text-ink-muted">
            {dict.account.haveAccount}{" "}
            <Link href={localeHref(locale, "/account/login")} className="font-semibold text-brass-deep hover:underline">
              {dict.account.toLogin}
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
