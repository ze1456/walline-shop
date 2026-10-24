import { cookies } from "next/headers";
import { currencyCookie, currencies, type CurrencyCode } from "./config";

export async function getCurrentCurrency(): Promise<CurrencyCode> {
  const store = await cookies();
  const value = store.get(currencyCookie)?.value;
  if (value && value in currencies) return value as CurrencyCode;
  return "CNY";
}
