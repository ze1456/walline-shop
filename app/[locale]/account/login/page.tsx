import Link from "next/link";
import { redirect } from "next/navigation";
import { getDictionary } from "@/lib/dictionaries";
import { brand } from "@/lib/config";
import { localeHref, normalizeLocale, tr } from "@/lib/i18n";
import { getCurrentUser } from "@/lib/auth";
import { signIn } from "@/app/actions/auth";

export const dynamic = "force-dynamic";

export default async function LoginPage({
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

  return (
    <div className="wrap grid gap-10 py-14 lg:grid-cols-2 lg:items-center">
      <div className="mx-auto w-full max-w-md">
        <h1 className="font-display text-3xl text-ink">{dict.account.loginTitle}</h1>
        <p className="mt-2 text-sm text-ink-muted">{tr(locale, { zh: "登录后可查看订单、物流与专属工程价。", en: "Sign in to see your orders, tracking and trade pricing." })}</p>
        {error ? (
          <p className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
            {error === "credentials" ? dict.account.errorCredentials : dict.account.errorEmail}
          </p>
        ) : null}
        <form action={signIn} className="mt-7 space-y-4 rounded-2xl border border-line bg-white p-6">
          <input type="hidden" name="locale" value={locale} />
          <div>
            <label htmlFor="email" className="label">
              {dict.account.email}
            </label>
            <input id="email" type="email" name="email" required autoComplete="email" className="field mt-2" placeholder="demo@walline.com" />
          </div>
          <div>
            <label htmlFor="password" className="label">
              {dict.account.password}
            </label>
            <input id="password" type="password" name="password" required autoComplete="current-password" className="field mt-2" placeholder="demo1234" />
          </div>
          <button type="submit" className="btn btn-primary w-full">
            {dict.account.signIn}
          </button>
          <p className="text-center text-xs text-ink-muted">
            {dict.account.noAccount}{" "}
            <Link href={localeHref(locale, "/account/register")} className="font-semibold text-brass-deep hover:underline">
              {dict.account.toRegister}
            </Link>
          </p>
          <p className="rounded-lg bg-stone px-3 py-2 text-[11px] text-ink-muted">{dict.account.demoHint}</p>
        </form>
      </div>
      <div className="hidden rounded-3xl bg-ink p-10 text-stone lg:block">
        <p className="text-[11px] uppercase tracking-[0.28em] text-brass-soft">{tr(locale, { zh: "工程客户服务", en: "Trade account" })}</p>
        <h2 className="mt-4 font-display text-3xl leading-tight text-white">
          {tr(locale, { zh: `从样品到整柜，${brand.nameZh} 全程跟进`, en: "From samples to full containers, WALLINE follows through" })}
        </h2>
        <ul className="mt-8 space-y-4 text-sm text-stone/75">
          {[
            { zh: "订单与物流实时可查", en: "Live order and shipment tracking" },
            { zh: "整箱 / 整柜批量价格", en: "Carton and container pricing" },
            { zh: "来图定制与同批调色", en: "Custom profiles and batch colour matching" },
            { zh: "外贸单证与清关支持", en: "Export documents and customs support" },
          ].map((item) => (
            <li key={item.en} className="flex gap-3">
              <span className="text-brass-soft">—</span>
              {tr(locale, item)}
            </li>
          ))}
        </ul>
        <a href={`mailto:${brand.email}`} className="mt-10 inline-flex text-sm font-semibold text-brass-soft hover:underline">
          {brand.email}
        </a>
      </div>
    </div>
  );
}
