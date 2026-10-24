"use client";

import { usePathname } from "next/navigation";
import { setCurrency } from "@/app/actions/preferences";
import { currencyList, type CurrencyCode } from "@/lib/config";

export function CurrencyForm({ currency, className }: { currency: CurrencyCode; className?: string }) {
  const pathname = usePathname() ?? "/";
  return (
    <form action={setCurrency} className={className}>
      <input type="hidden" name="path" value={pathname} />
      <label className="sr-only" htmlFor="currency-select">
        Currency
      </label>
      <select
        id="currency-select"
        name="code"
        defaultValue={currency}
        onChange={(event) => event.currentTarget.form?.requestSubmit()}
        className="cursor-pointer rounded-full border border-line bg-transparent px-3 py-1.5 text-xs font-semibold text-ink outline-none transition hover:border-ink focus:border-brass"
      >
        {currencyList.map((item) => (
          <option key={item.code} value={item.code}>
            {item.code}
          </option>
        ))}
      </select>
    </form>
  );
}
