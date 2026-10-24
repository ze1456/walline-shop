import Link from "next/link";
import { redirect } from "next/navigation";
import { getDictionary } from "@/lib/dictionaries";
import { countries, type Locale } from "@/lib/config";
import { localeHref, normalizeLocale, tr } from "@/lib/i18n";
import { getCurrentUser } from "@/lib/auth";
import { listOrdersForUser } from "@/lib/orders";
import { formatOrderCurrency } from "@/lib/money";
import { signOut, saveProfile } from "@/app/actions/auth";
import { StatusBadge } from "@/components/status-badge";

export const dynamic = "force-dynamic";

export default async function AccountPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const locale = normalizeLocale((await params).locale) as Locale;
  const query = await searchParams;
  const user = await getCurrentUser();
  if (!user) redirect(localeHref(locale, "/account/login"));
  const dict = getDictionary(locale);
  const orders = listOrdersForUser(user.id);

  return (
    <div className="wrap py-10 md:py-14">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">{dict.account.title}</p>
          <h1 className="mt-2 font-display text-3xl text-ink md:text-4xl">{dict.account.welcome.replace("{name}", user.name || user.email)}</h1>
          <p className="mt-2 text-sm text-ink-muted">{user.email}</p>
        </div>
        <form action={signOut}>
          <input type="hidden" name="locale" value={locale} />
          <button type="submit" className="btn btn-outline text-xs">
            {dict.account.logout}
          </button>
        </form>
      </div>

      {query.saved === "1" ? (
        <p className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{dict.admin.saved}</p>
      ) : null}

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_340px]">
        <div>
          <div className="flex items-center justify-between gap-4">
            <h2 className="font-display text-2xl text-ink">{dict.account.orders}</h2>
            <Link href={localeHref(locale, "/account/orders")} className="text-xs font-semibold text-brass-deep hover:underline">
              {dict.common.viewAll} →
            </Link>
          </div>
          {orders.length === 0 ? (
            <div className="mt-4 rounded-2xl border border-line bg-white p-10 text-center">
              <p className="text-sm text-ink-muted">{dict.account.noOrders}</p>
              <p className="mt-1 text-xs text-ink-muted">{dict.account.noOrdersDesc}</p>
              <Link href={localeHref(locale, "/products")} className="btn btn-primary mt-5 text-xs">
                {dict.cart.continueShopping}
              </Link>
            </div>
          ) : (
            <ul className="mt-4 space-y-3">
              {orders.slice(0, 5).map((order) => (
                <li key={order.id}>
                  <Link
                    href={localeHref(locale, `/orders/${order.order_no}`)}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-line bg-white px-5 py-4 transition hover:border-brass"
                  >
                    <div>
                      <p className="font-mono text-sm font-semibold text-ink">{order.order_no}</p>
                      <p className="mt-1 text-[11px] text-ink-muted">
                        {new Date(order.created_at.replace(" ", "T")).toLocaleDateString(locale === "zh" ? "zh-CN" : "en-US")} ·{" "}
                        {order.currency}
                      </p>
                    </div>
                    <StatusBadge status={order.status} locale={locale} />
                    <p className="w-24 text-right text-sm font-semibold text-ink">
                      {formatOrderCurrency(order.total_cents, order.currency, order.fx_rate, locale)}
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>

        <aside className="h-fit rounded-2xl border border-line bg-white p-6">
          <h2 className="font-display text-xl text-ink">{dict.account.profile}</h2>
          <form action={saveProfile} className="mt-4 space-y-3">
            <input type="hidden" name="locale" value={locale} />
            <div>
              <label htmlFor="name" className="label">
                {dict.account.name}
              </label>
              <input id="name" name="name" defaultValue={user.name} className="field mt-1.5" />
            </div>
            <div>
              <label htmlFor="phone" className="label">
                {dict.account.phone}
              </label>
              <input id="phone" name="phone" defaultValue={user.phone} className="field mt-1.5" />
            </div>
            <div>
              <label htmlFor="company" className="label">
                {dict.account.company}
              </label>
              <input id="company" name="company" defaultValue={user.company} className="field mt-1.5" />
            </div>
            <div>
              <label htmlFor="country" className="label">
                {dict.account.country}
              </label>
              <select id="country" name="country" defaultValue={user.country || "CN"} className="field mt-1.5">
                {countries.map((item) => (
                  <option key={item.code} value={item.code}>
                    {tr(locale, { zh: item.nameZh, en: item.nameEn })}
                  </option>
                ))}
              </select>
            </div>
            <button type="submit" className="btn btn-primary w-full text-xs">
              {dict.common.save}
            </button>
          </form>
          <div className="mt-5 border-t border-line pt-4">
            <p className="text-[11px] text-ink-muted">{dict.account.demoHint}</p>
          </div>
        </aside>
      </div>
    </div>
  );
}
