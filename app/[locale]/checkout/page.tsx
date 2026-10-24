import Link from "next/link";
import { getDictionary } from "@/lib/dictionaries";
import { localeHref, normalizeLocale, tr } from "@/lib/i18n";
import { getCart } from "@/lib/cart";
import { getCurrentUser } from "@/lib/auth";
import { getCurrentCurrency } from "@/lib/preferences";
import { countries, countryByCode, countryGroup, demoPaymentEnabled, paymentMethodsFor, type PaymentMethodId } from "@/lib/config";
import { shippingOptions, formatDays } from "@/lib/shipping";
import { paypalSupportsCurrency } from "@/lib/payments";
import { Price } from "@/components/price";
import { placeOrder } from "@/app/actions/checkout";

export const dynamic = "force-dynamic";

const defaultCountry = "CN";

export default async function CheckoutPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const locale = normalizeLocale((await params).locale);
  const query = await searchParams;
  const dict = getDictionary(locale);
  const cart = await getCart();
  const user = await getCurrentUser();
  const currency = await getCurrentCurrency();

  const countryCode = (typeof query.country === "string" ? query.country.toUpperCase() : "") || user?.country || defaultCountry;
  const country = countryByCode(countryCode) ?? countryByCode(defaultCountry)!;

  if (cart.lines.length === 0) {
    return (
      <div className="wrap py-20">
        <div className="mx-auto max-w-lg rounded-3xl border border-line bg-white p-10 text-center">
          <h1 className="font-display text-2xl text-ink">{dict.cart.title}</h1>
          <p className="mt-3 text-sm text-ink-muted">{dict.checkout.emptyCart}</p>
          <Link href={localeHref(locale, "/products")} className="btn btn-primary mt-6">
            {dict.cart.continueShopping}
          </Link>
        </div>
      </div>
    );
  }

  const options = await shippingOptions(country.code, cart.weightG, cart.subtotalCents);
  const methods = paymentMethodsFor(country.code);
  const paypalOk = paypalSupportsCurrency(currency);
  const paymentLabels: Record<PaymentMethodId, string> = {
    wechat: dict.checkout.paymentWechat,
    alipay: dict.checkout.paymentAlipay,
    stripe: dict.checkout.paymentStripe,
    paypal: dict.checkout.paymentPaypal,
    bank_transfer: dict.checkout.paymentBank,
  };
  const errorCode = typeof query.error === "string" ? query.error : "";
  const errorText =
    errorCode === "empty"
      ? dict.checkout.emptyCart
      : errorCode === "email"
        ? dict.checkout.errorEmail
        : errorCode === "shipping" || errorCode === "country"
          ? dict.checkout.noShipping
          : errorCode === "invalid"
            ? dict.checkout.errorRequired
            : errorCode === "psp"
              ? tr(locale, { zh: "支付渠道暂时不可用，请改用其他支付方式，或在对公电汇信息中完成付款。", en: "The payment provider is unavailable. Choose another method or pay by bank transfer." })
              : "";
  const group = countryGroup(country.code);

  return (
    <div className="wrap py-10 md:py-14">
      <h1 className="font-display text-3xl text-ink md:text-4xl">{dict.checkout.title}</h1>
      <p className="mt-2 text-xs text-ink-muted">
        {dict.cart.weightNote.replace("{weight}", (cart.weightG / 1000).toFixed(1))} · {dict.checkout.shippingHint}
      </p>

      {errorText ? (
        <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{errorText}</div>
      ) : null}

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_380px]">
        <div className="space-y-6">
          <section className="rounded-2xl border border-line bg-white p-6">
            <h2 className="font-display text-xl text-ink">{dict.checkout.shippingAddress}</h2>
            <form action={localeHref(locale, "/checkout")} method="get" className="mt-4 flex flex-wrap items-end gap-3">
              <div className="min-w-[220px] flex-1">
                <label htmlFor="country-picker" className="label">
                  {dict.checkout.country}
                </label>
                <select id="country-picker" name="country" defaultValue={country.code} className="field mt-2">
                  {(["domestic", "asia", "global"] as const).map((groupKey) => (
                    <optgroup
                      key={groupKey}
                      label={tr(locale, { zh: groupKey === "domestic" ? "中国大陆" : groupKey === "asia" ? "亚洲" : "其他地区", en: groupKey === "domestic" ? "Mainland China" : groupKey === "asia" ? "Asia" : "Rest of world" })}
                    >
                      {countries
                        .filter((item) => item.group === groupKey)
                        .map((item) => (
                          <option key={item.code} value={item.code}>
                            {tr(locale, { zh: item.nameZh, en: item.nameEn })}
                          </option>
                        ))}
                    </optgroup>
                  ))}
                </select>
              </div>
              <button type="submit" className="btn btn-outline">
                {tr(locale, { zh: "计算运费", en: "Calculate shipping" })}
              </button>
            </form>
            <p className="mt-3 text-xs text-ink-muted">
              {tr(locale, {
                zh: `当前目的地：${country.nameZh}（${group === "domestic" ? "国内" : group === "asia" ? "亚洲" : "国际"}线路）`,
                en: `Destination: ${country.nameEn} (${group === "domestic" ? "domestic" : group === "asia" ? "Asia" : "international"} route)`,
              })}
            </p>
          </section>

          <form action={placeOrder} className="space-y-6">
            <input type="hidden" name="locale" value={locale} />
            <input type="hidden" name="country" value={country.code} />

            <section className="rounded-2xl border border-line bg-white p-6">
              <h2 className="font-display text-xl text-ink">{dict.checkout.contact}</h2>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label htmlFor="email" className="label">
                    {dict.checkout.email}
                  </label>
                  <input id="email" type="email" name="email" required defaultValue={user?.email ?? ""} className="field mt-2" placeholder="name@company.com" />
                  <p className="mt-1 text-[11px] text-ink-muted">{dict.checkout.emailHint}</p>
                </div>
                <div>
                  <label htmlFor="name" className="label">
                    {dict.checkout.name}
                  </label>
                  <input id="name" name="name" required defaultValue={user?.name ?? ""} className="field mt-2" />
                </div>
                <div>
                  <label htmlFor="phone" className="label">
                    {dict.checkout.phone}
                  </label>
                  <input id="phone" name="phone" defaultValue={user?.phone ?? ""} className="field mt-2" placeholder="+86 138 0000 0000" />
                </div>
                <div>
                  <label htmlFor="company" className="label">
                    {dict.checkout.company} <span className="text-[11px] text-ink-muted">({dict.common.optional})</span>
                  </label>
                  <input id="company" name="company" defaultValue={user?.company ?? ""} className="field mt-2" />
                </div>
                <div>
                  <label htmlFor="postal" className="label">
                    {dict.checkout.postal}
                  </label>
                  <input id="postal" name="postal" className="field mt-2" />
                </div>
                <div>
                  <label htmlFor="province" className="label">
                    {dict.checkout.province}
                  </label>
                  <input id="province" name="province" className="field mt-2" />
                </div>
                <div>
                  <label htmlFor="city" className="label">
                    {dict.checkout.city}
                  </label>
                  <input id="city" name="city" className="field mt-2" />
                </div>
                <div className="sm:col-span-2">
                  <label htmlFor="address" className="label">
                    {dict.checkout.address}
                  </label>
                  <input id="address" name="address" required className="field mt-2" />
                </div>
                <div className="sm:col-span-2">
                  <label htmlFor="note" className="label">
                    {dict.checkout.note} <span className="text-[11px] text-ink-muted">({dict.common.optional})</span>
                  </label>
                  <textarea id="note" name="note" rows={2} className="field mt-2" placeholder={dict.checkout.notePlaceholder} />
                </div>
              </div>
            </section>

            <section className="rounded-2xl border border-line bg-white p-6">
              <h2 className="font-display text-xl text-ink">{dict.checkout.shippingMethod}</h2>
              {options.length === 0 ? (
                <p className="mt-3 text-sm text-ink-muted">{dict.checkout.noShipping}</p>
              ) : (
                <ul className="mt-4 space-y-2">
                  {options.map((option, index) => (
                    <li key={option.code}>
                      <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-line px-4 py-3 transition has-[:checked]:border-brass-deep has-[:checked]:bg-brass-soft/10">
                        <input type="radio" name="shippingCode" value={option.code} defaultChecked={index === 0} required className="mt-1" />
                        <span className="flex-1">
                          <span className="block text-sm font-medium text-ink">
                            {tr(locale, { zh: option.name_zh, en: option.name_en })}
                          </span>
                          <span className="mt-0.5 block text-[11px] text-ink-muted">
                            {tr(locale, { zh: option.carrier_zh, en: option.carrier_en })} · {formatDays(option)} {dict.common.days}
                          </span>
                        </span>
                        <span className="text-sm font-semibold text-ink">
                          {option.freeApplied ? (
                            <span className="text-brass-deep">{dict.common.free}</span>
                          ) : (
                            <Price cents={option.costCents} currency={currency} locale={locale} />
                          )}
                        </span>
                      </label>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section className="rounded-2xl border border-line bg-white p-6">
              <h2 className="font-display text-xl text-ink">{dict.checkout.payment}</h2>
              <ul className="mt-4 grid gap-2 sm:grid-cols-2">
                {methods.map((method, index) => {
                  const disabled = method.id === "paypal" && !paypalOk;
                  return (
                    <li key={method.id}>
                      <label
                        className={`flex cursor-pointer items-center gap-3 rounded-xl border border-line px-4 py-3 transition has-[:checked]:border-brass-deep has-[:checked]:bg-brass-soft/10 ${
                          disabled ? "cursor-not-allowed opacity-50" : ""
                        }`}
                      >
                        <input type="radio" name="paymentMethod" value={method.id} defaultChecked={index === 0 && !disabled} disabled={disabled} required className="mt-0.5" />
                        <span className="text-sm text-ink">{paymentLabels[method.id as PaymentMethodId]}</span>
                      </label>
                    </li>
                  );
                })}
              </ul>
              {!paypalOk && methods.some((method) => method.id === "paypal") ? (
                <p className="mt-2 text-[11px] text-ink-muted">
                  {tr(locale, { zh: "PayPal 不支持当前币种，请切换币种或选择银行卡 / 电汇。", en: "PayPal does not settle in this currency. Switch currency, or pay by card / bank transfer." })}
                </p>
              ) : null}
              {demoPaymentEnabled ? (
                <p className="mt-3 rounded-lg bg-stone-deep/70 px-3 py-2 text-[11px] leading-relaxed text-ink-muted">
                  {dict.checkout.demoDesc}
                </p>
              ) : null}
            </section>

            <div className="flex flex-wrap items-center gap-4">
              <button type="submit" className="btn btn-primary" disabled={options.length === 0}>
                {dict.checkout.placeOrder}
              </button>
              <p className="text-[11px] text-ink-muted">{dict.checkout.terms}</p>
            </div>
          </form>
        </div>

        <aside className="h-fit rounded-2xl border border-line bg-white p-6 lg:sticky lg:top-24">
          <h2 className="font-display text-xl text-ink">{dict.checkout.summary}</h2>
          <ul className="mt-4 max-h-64 space-y-3 overflow-auto pr-1">
            {cart.lines.map((line) => (
              <li key={line.itemId} className="flex gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={line.image || `/images/products/${line.slug}.svg`} alt="" className="h-14 w-16 shrink-0 rounded-lg border border-line object-cover" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-medium text-ink">{tr(locale, { zh: line.nameZh, en: line.nameEn })}</p>
                  <p className="mt-0.5 text-[11px] text-ink-muted">
                    {line.variantZh || line.variantEn ? `${tr(locale, { zh: line.variantZh, en: line.variantEn })} · ` : ""}
                    × {line.qty}
                  </p>
                </div>
                <p className="text-xs font-medium text-ink">
                  <Price cents={line.priceCents * line.qty} currency={currency} locale={locale} />
                </p>
              </li>
            ))}
          </ul>
          <dl className="mt-5 space-y-2 border-t border-line pt-4 text-sm">
            <div className="flex justify-between">
              <dt className="text-ink-muted">{dict.common.subtotal}</dt>
              <dd className="text-ink">
                <Price cents={cart.subtotalCents} currency={currency} locale={locale} />
              </dd>
            </div>
            {cart.discountCents > 0 ? (
              <div className="flex justify-between text-brass-deep">
                <dt>{dict.common.discount}</dt>
                <dd>
                  −<Price cents={cart.discountCents} currency={currency} locale={locale} />
                </dd>
              </div>
            ) : null}
            <div className="flex justify-between">
              <dt className="text-ink-muted">{dict.common.shipping}</dt>
              <dd className="text-[11px] text-ink-muted">{dict.cart.shippingCalc}</dd>
            </div>
            <div className="flex justify-between border-t border-line pt-3 text-base font-semibold text-ink">
              <dt>{dict.common.total}</dt>
              <dd>
                <Price cents={Math.max(0, cart.subtotalCents - cart.discountCents)} currency={currency} locale={locale} />
              </dd>
            </div>
          </dl>
          <p className="mt-3 text-[11px] leading-relaxed text-ink-muted">{dict.common.currencyNote}</p>
        </aside>
      </div>
    </div>
  );
}
