import { formatCurrency } from "@/lib/money";
import type { CurrencyCode, Locale } from "@/lib/config";

export function Price({
  cents,
  currency,
  locale,
  className,
}: {
  cents: number;
  currency: CurrencyCode;
  locale: Locale;
  className?: string;
}) {
  return <span className={className}>{formatCurrency(cents, currency, locale)}</span>;
}
