import { db } from "./db";
import { countryGroup } from "./config";

export interface ShippingRow {
  id: number;
  code: string;
  name_zh: string;
  name_en: string;
  carrier_zh: string;
  carrier_en: string;
  country_group: "domestic" | "asia" | "global";
  base_cents: number;
  per_kg_cents: number;
  free_over_cents: number;
  days_min: number;
  days_max: number;
  sort: number;
  active: number;
}

export interface ShippingOption extends ShippingRow {
  costCents: number;
  freeApplied: boolean;
}

export function shippingMethodsFor(countryCode: string): ShippingRow[] {
  const group = countryGroup(countryCode);
  return db
    .prepare("SELECT * FROM shipping_methods WHERE active = 1 AND country_group = ? ORDER BY sort ASC")
    .all(group) as unknown as ShippingRow[];
}

/** First kilogram is included in the base rate; each extra started kilo adds per-kg. */
export function shippingCost(method: ShippingRow, weightG: number, subtotalCents: number): { costCents: number; freeApplied: boolean } {
  const kg = Math.max(0, weightG) / 1000;
  const billableKg = Math.max(1, Math.ceil(kg));
  const cost = method.base_cents + method.per_kg_cents * (billableKg - 1);
  const freeApplied = method.free_over_cents > 0 && subtotalCents >= method.free_over_cents;
  return { costCents: freeApplied ? 0 : cost, freeApplied };
}

export function shippingOptions(countryCode: string, weightG: number, subtotalCents: number): ShippingOption[] {
  return shippingMethodsFor(countryCode).map((method) => {
    const { costCents, freeApplied } = shippingCost(method, weightG, subtotalCents);
    return { ...method, costCents, freeApplied };
  });
}

export function getShippingMethod(code: string): ShippingRow | undefined {
  return db.prepare("SELECT * FROM shipping_methods WHERE code = ?").get(code) as unknown as ShippingRow | undefined;
}

export function formatDays(method: { days_min: number; days_max: number }): string {
  return method.days_min === method.days_max ? `${method.days_min}` : `${method.days_min}–${method.days_max}`;
}
