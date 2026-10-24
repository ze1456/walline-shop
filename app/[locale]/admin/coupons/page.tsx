import { redirect } from "next/navigation";
import { getDictionary } from "@/lib/dictionaries";
import type { Locale } from "@/lib/config";
import { localeHref, normalizeLocale, tr } from "@/lib/i18n";
import { isAdmin } from "@/lib/auth";
import { listCoupons } from "@/lib/coupons";
import { formatCny } from "@/lib/money";
import { AdminShell } from "@/components/admin-shell";
import { saveCoupon, toggleCoupon } from "@/app/actions/admin";

export const dynamic = "force-dynamic";

export default async function AdminCouponsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const locale = normalizeLocale((await params).locale) as Locale;
  if (!(await isAdmin())) redirect(localeHref(locale, "/admin/login"));
  const dict = getDictionary(locale);
  const query = await searchParams;
  const coupons = await listCoupons();
  const zh = locale === "zh";
  const inputClass = "field mt-1.5 text-sm";

  return (
    <AdminShell locale={locale} active="coupons">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-2xl text-ink">{dict.admin.coupons}</h1>
      </div>

      {query.saved ? <p className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-800">{dict.admin.saved}</p> : null}

      <div className="mt-5 grid gap-5 lg:grid-cols-[1.5fr_1fr]">
        <div className="overflow-x-auto rounded-2xl border border-line bg-white">
          <table className="w-full min-w-[560px] text-left text-sm">
            <thead className="bg-stone text-[11px] uppercase tracking-wider text-ink-muted">
              <tr>
                <th className="px-4 py-3 font-medium">{dict.admin.couponCode}</th>
                <th className="px-4 py-3 font-medium">{dict.admin.couponValue}</th>
                <th className="px-4 py-3 font-medium">{dict.admin.couponMin}</th>
                <th className="px-4 py-3 font-medium">{dict.admin.couponExpires}</th>
                <th className="px-4 py-3 font-medium">{dict.admin.couponUsed}</th>
                <th className="px-4 py-3 font-medium">{dict.admin.status}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {coupons.map((coupon) => (
                <tr key={coupon.id}>
                  <td className="px-4 py-3 font-mono text-xs font-semibold text-ink">{coupon.code}</td>
                  <td className="px-4 py-3 text-xs text-ink">
                    {coupon.type === "percent" ? `${coupon.value}%` : formatCny(coupon.value)}
                  </td>
                  <td className="px-4 py-3 text-xs text-ink-muted">{coupon.min_subtotal_cents > 0 ? formatCny(coupon.min_subtotal_cents) : "—"}</td>
                  <td className="px-4 py-3 text-xs text-ink-muted">{coupon.expires_at ? coupon.expires_at.slice(0, 10) : "—"}</td>
                  <td className="px-4 py-3 text-xs text-ink-muted">
                    {coupon.used_count}
                    {coupon.max_uses > 0 ? ` / ${coupon.max_uses}` : ""}
                  </td>
                  <td className="px-4 py-3">
                    <form action={toggleCoupon}>
                      <input type="hidden" name="locale" value={locale} />
                      <input type="hidden" name="id" value={coupon.id} />
                      <button
                        type="submit"
                        className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium ${
                          coupon.active ? "bg-emerald-50 text-emerald-800" : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {coupon.active ? dict.admin.couponActive : (zh ? "已停用" : "Disabled")}
                      </button>
                    </form>
                  </td>
                </tr>
              ))}
              {coupons.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-xs text-ink-muted">
                    {dict.admin.noCoupons}
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>

        <section className="h-fit rounded-2xl border border-line bg-white p-5">
          <h2 className="font-display text-lg text-ink">{dict.admin.createCoupon}</h2>
          <form action={saveCoupon} className="mt-4 grid gap-4 sm:grid-cols-2">
            <input type="hidden" name="locale" value={locale} />
            <div className="sm:col-span-2">
              <label className="label" htmlFor="code">
                {dict.admin.couponCode}
              </label>
              <input id="code" name="code" required className={inputClass} placeholder="SPRING20" />
            </div>
            <div>
              <label className="label" htmlFor="type">
                {dict.admin.couponType}
              </label>
              <select id="type" name="type" className={inputClass} defaultValue="percent">
                <option value="percent">{dict.admin.typePercent}</option>
                <option value="fixed">{dict.admin.typeFixed}</option>
              </select>
            </div>
            <div>
              <label className="label" htmlFor="value">
                {dict.admin.couponValue}
              </label>
              <input id="value" name="value" required inputMode="decimal" className={inputClass} placeholder={zh ? "10 或 100" : "10 or 100"} />
            </div>
            <div>
              <label className="label" htmlFor="min">
                {dict.admin.couponMin}
              </label>
              <input id="min" name="min" inputMode="decimal" className={inputClass} placeholder="0" />
            </div>
            <div>
              <label className="label" htmlFor="expires">
                {dict.admin.couponExpires}
              </label>
              <input id="expires" name="expires" type="date" className={inputClass} />
            </div>
            <div className="sm:col-span-2">
              <label className="label" htmlFor="maxUses">
                {dict.admin.couponMaxUses}
              </label>
              <input id="maxUses" name="maxUses" type="number" min={0} defaultValue={0} className={inputClass} />
            </div>
            <label className="flex items-center gap-2 text-xs text-ink-soft sm:col-span-2">
              <input type="checkbox" name="active" defaultChecked className="h-4 w-4 accent-[#b3894f]" />
              {dict.admin.couponActive}
            </label>
            <button type="submit" className="btn btn-primary w-full text-sm sm:col-span-2">
              {dict.admin.createCoupon}
            </button>
            <p className="text-[11px] leading-relaxed text-ink-muted sm:col-span-2">
              {tr(locale, {
                zh: "百分比填 10 表示 9 折；固定金额单位元（人民币）。已存在的优惠码会被覆盖。",
                en: "Percentage: 10 = 10% off. Fixed amount in CNY. Existing codes are overwritten.",
              })}
            </p>
          </form>
        </section>
      </div>
    </AdminShell>
  );
}
