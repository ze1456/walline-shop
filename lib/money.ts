import { currencies, type CurrencyCode, type Locale } from "./config";

/** Convert a CNY amount in cents to the target currency's major units. */
export function convertFromCents(centsCny: number, code: CurrencyCode): number {
  const currency = currencies[code] ?? currencies.CNY;
  const major = (centsCny * currency.rate) / 100;
  // JPY and similar zero-decimal currencies: round to whole units.
  const zeroDecimal = ["JPY"].includes(code);
  return zeroDecimal ? Math.round(major) : Math.round(major * 100) / 100;
}

export function formatCurrency(centsCny: number, code: CurrencyCode, locale: Locale): string {
  const amount = convertFromCents(centsCny, code);
  const currency = currencies[code] ?? currencies.CNY;
  const intlLocale = locale === "zh" ? "zh-CN" : currency.formattingLocale;
  try {
    return new Intl.NumberFormat(intlLocale, {
      style: "currency",
      currency: code,
      minimumFractionDigits: code === "JPY" ? 0 : 2,
      maximumFractionDigits: code === "JPY" ? 0 : 2,
    }).format(amount);
  } catch {
    return `${currency.symbol}${amount.toFixed(code === "JPY" ? 0 : 2)}`;
  }
}

/** Format a CNY amount with the ¥ symbol, used in admin views. */
export function formatCny(cents: number): string {
  return new Intl.NumberFormat("zh-CN", { style: "currency", currency: "CNY" }).format(cents / 100);
}

/** For admin/back-office: show the stored CNY amount. */
export function yuan(cents: number): string {
  return (cents / 100).toFixed(2);
}

export function centsFromYuanInput(value: string): number {
  const n = Number.parseFloat(value.replace(/[^\d.]/g, ""));
  if (!Number.isFinite(n)) return 0;
  return Math.round(n * 100);
}

/** Format an order amount stored in CNY cents using the order's captured FX rate. */
export function formatOrderCurrency(centsCny: number, code: string, fxRate: number, locale: Locale): string {
  const rate = currencies[code as CurrencyCode]?.rate ?? fxRate;
  const major = (centsCny * rate) / 100;
  const intlLocale = locale === "zh" ? "zh-CN" : (currencies[code as CurrencyCode]?.formattingLocale ?? "en-US");
  try {
    return new Intl.NumberFormat(intlLocale, {
      style: "currency",
      currency: code,
      minimumFractionDigits: code === "JPY" ? 0 : 2,
      maximumFractionDigits: code === "JPY" ? 0 : 2,
    }).format(code === "JPY" ? Math.round(major) : major);
  } catch {
    return `${code} ${major.toFixed(2)}`;
  }
}
