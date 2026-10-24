import Link from "next/link";
import { getDictionary } from "@/lib/dictionaries";
import { localeHref, normalizeLocale, tr } from "@/lib/i18n";
import { getCart } from "@/lib/cart";
import { getCurrentCurrency } from "@/lib/preferences";
import { Price } from "@/components/price";
import { addToCart, applyCoupon, removeCoupon, removeFromCart, updateCartQty } from "@/app/actions/cart";

export const dynamic = "force-dynamic";

export default async function CartPage({
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
  const currency = await getCurrentCurrency();
  const cartHref = localeHref(locale, "/cart");
  const state = typeof query.coupon === "string" ? "applied" : "";

  if (cart.lines.length === 0) {
    return (
      <div className="wrap py-20">
        <div className="mx-auto max-w-lg rounded-3xl border border-line bg-white p-10 text-center">
          <span className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-stone-deep text-2xl">🛒</span>
          <h1 className="mt-5 font-display text-2xl text-ink">{dict.cart.empty}</h1>
          <p className="mt-3 text-sm leading-relaxed text-ink-muted">{dict.cart.emptyDesc}</p>
          <Link href={localeHref(locale, "/products")} className="btn btn-primary mt-7">
            {dict.cart.continueShopping}
          </Link>
        </div>
      </div>
    );
  }

  const couponErrorText =
    cart.couponError === "min"
      ? dict.cart.couponMin
      : cart.couponError === "expired" || cart.couponError === "invalid"
        ? dict.cart.couponInvalid
        : "";

  return (
    <div className="wrap py-10 md:py-14">
      <h1 className="font-display text-3xl text-ink md:text-4xl">{dict.cart.title}</h1>
      <p className="mt-2 text-xs text-ink-muted">
        {dict.cart.weightNote.replace("{weight}", (cart.weightG / 1000).toFixed(1))} · {dict.cart.loginHint}
      </p>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px]">
        <div>
          <div className="overflow-hidden rounded-2xl border border-line bg-white">
            <div className="hidden grid-cols-[1fr_130px_150px_40px] gap-4 border-b border-line px-5 py-3 text-[11px] uppercase tracking-wider text-ink-muted sm:grid">
              <span>{dict.cart.item}</span>
              <span>{dict.cart.price}</span>
              <span>{dict.common.qty}</span>
              <span />
            </div>
            <ul className="divide-y divide-line">
              {cart.lines.map((line) => (
                <li key={line.itemId} className="grid gap-4 px-5 py-5 sm:grid-cols-[1fr_130px_150px_40px] sm:items-center">
                  <div className="flex gap-4">
                    <Link href={localeHref(locale, `/products/${line.slug}`)} className="block h-20 w-24 shrink-0 overflow-hidden rounded-xl border border-line bg-stone-deep">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={line.image || `/images/products/${line.slug}.svg`} alt="" className="h-full w-full object-cover" />
                    </Link>
                    <div>
                      <Link href={localeHref(locale, `/products/${line.slug}`)} className="text-sm font-medium text-ink hover:text-brass-deep">
                        {tr(locale, { zh: line.nameZh, en: line.nameEn })}
                      </Link>
                      {line.variantZh || line.variantEn ? (
                        <p className="mt-1 text-xs text-ink-muted">{tr(locale, { zh: line.variantZh, en: line.variantEn })}</p>
                      ) : null}
                      <p className="mt-1 text-[11px] text-ink-muted">
                        {dict.common.moq} {line.moq} {tr(locale, { zh: line.unitZh, en: line.unitEn })}
                      </p>
                      <form action={removeFromCart} className="mt-2">
                        <input type="hidden" name="locale" value={locale} />
                        <input type="hidden" name="itemId" value={line.itemId} />
                        <input type="hidden" name="redirectTo" value={cartHref} />
                        <button type="submit" className="text-[11px] text-ink-muted underline-offset-2 hover:text-red-700 hover:underline">
                          {dict.cart.remove}
                        </button>
                      </form>
                    </div>
                  </div>

                  <div className="text-sm text-ink">
                    <Price cents={line.priceCents} currency={currency} locale={locale} />
                    <span className="ml-1 text-[11px] text-ink-muted">/ {tr(locale, { zh: line.unitZh, en: line.unitEn })}</span>
                  </div>

                  <div>
                    <div className="flex items-center gap-1.5">
                      <form action={updateCartQty}>
                        <input type="hidden" name="locale" value={locale} />
                        <input type="hidden" name="itemId" value={line.itemId} />
                        <input type="hidden" name="redirectTo" value={cartHref} />
                        <input type="hidden" name="qty" value={Math.max(line.moq, line.qty - 1)} />
                        <button
                          type="submit"
                          disabled={line.qty <= line.moq}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-line text-sm text-ink-soft hover:border-brass disabled:cursor-not-allowed disabled:opacity-40"
                          aria-label="−"
                        >
                          −
                        </button>
                      </form>
                      <form action={updateCartQty}>
                        <input type="hidden" name="locale" value={locale} />
                        <input type="hidden" name="itemId" value={line.itemId} />
                        <input type="hidden" name="redirectTo" value={cartHref} />
                        <input
                          type="number"
                          name="qty"
                          defaultValue={line.qty}
                          min={line.moq}
                          className="field h-8 w-16 text-center text-sm"
                          aria-label={dict.common.qty}
                        />
                        <button type="submit" className="mt-2 block w-full text-[11px] text-brass-deep hover:underline">
                          {tr(locale, { zh: "更新数量", en: "Update" })}
                        </button>
                      </form>
                      <form action={updateCartQty}>
                        <input type="hidden" name="locale" value={locale} />
                        <input type="hidden" name="itemId" value={line.itemId} />
                        <input type="hidden" name="redirectTo" value={cartHref} />
                        <input type="hidden" name="qty" value={line.qty + 1} />
                        <button
                          type="submit"
                          className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-line text-sm text-ink-soft hover:border-brass"
                          aria-label="+"
                        >
                          +
                        </button>
                      </form>
                    </div>
                  </div>

                  <div className="text-right text-sm font-semibold text-ink sm:text-left">
                    <Price cents={line.priceCents * line.qty} currency={currency} locale={locale} />
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <form action={addToCart} className="mt-4 flex flex-wrap items-center gap-2 rounded-2xl border border-dashed border-line bg-white/60 p-4">
            <input type="hidden" name="locale" value={locale} />
            <input type="hidden" name="redirectTo" value={cartHref} />
            <label htmlFor="add-more" className="text-xs text-ink-muted">
              {tr(locale, { zh: "补加商品 ID", en: "Add product ID" })}
            </label>
            <input id="add-more" type="number" name="productId" min={1} className="field h-9 w-24 text-sm" />
            <input type="number" name="qty" min={1} defaultValue={1} className="field h-9 w-16 text-sm" aria-label={dict.common.qty} />
            <button type="submit" className="btn btn-outline h-9 px-3 text-xs">
              {dict.products.addToCart}
            </button>
          </form>
        </div>

        <aside className="h-fit rounded-2xl border border-line bg-white p-6">
          <h2 className="font-display text-xl text-ink">{dict.cart.summary}</h2>
          <dl className="mt-5 space-y-3 text-sm">
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
              <dd className="text-xs text-ink-muted">{dict.cart.shippingCalc}</dd>
            </div>
            <div className="flex justify-between border-t border-line pt-3 text-base font-semibold text-ink">
              <dt>{dict.common.total}</dt>
              <dd>
                <Price cents={Math.max(0, cart.subtotalCents - cart.discountCents)} currency={currency} locale={locale} />
              </dd>
            </div>
          </dl>

          <form action={applyCoupon} className="mt-5">
            <input type="hidden" name="locale" value={locale} />
            <label htmlFor="coupon" className="label">
              {dict.cart.couponLabel}
            </label>
            <div className="mt-2 flex gap-2">
              <input
                id="coupon"
                name="code"
                defaultValue={cart.couponCode}
                placeholder={dict.cart.couponPlaceholder}
                className="field flex-1 uppercase"
                autoComplete="off"
              />
              <button type="submit" className="btn btn-outline px-4">
                {dict.cart.apply}
              </button>
            </div>
            {state && cart.couponCode && !cart.couponError ? (
              <p className="mt-2 text-xs text-brass-deep">{dict.cart.couponApplied.replace("{code}", cart.couponCode)}</p>
            ) : null}
            {couponErrorText ? <p className="mt-2 text-xs text-red-700">{couponErrorText}</p> : null}
          </form>
          {cart.couponCode ? (
            <form action={removeCoupon} className="mt-2">
              <input type="hidden" name="locale" value={locale} />
              <button type="submit" className="text-[11px] text-ink-muted underline-offset-2 hover:text-red-700 hover:underline">
                {dict.cart.couponRemoved}
              </button>
            </form>
          ) : null}

          <Link href={localeHref(locale, "/checkout")} className="btn btn-primary mt-6 w-full">
            {dict.cart.checkout}
          </Link>
          <Link href={localeHref(locale, "/products")} className="btn btn-ghost mt-2 w-full">
            {dict.cart.continueShopping}
          </Link>
          <p className="mt-4 text-[11px] leading-relaxed text-ink-muted">{dict.cart.sampleNote}</p>
        </aside>
      </div>
    </div>
  );
}
