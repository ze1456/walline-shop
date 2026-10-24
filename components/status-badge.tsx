import { statusLabels, type OrderStatus, type Locale } from "@/lib/config";

const tones: Record<string, string> = {
  amber: "bg-amber-50 text-amber-800 border-amber-200",
  emerald: "bg-emerald-50 text-emerald-800 border-emerald-200",
  sky: "bg-sky-50 text-sky-800 border-sky-200",
  indigo: "bg-indigo-50 text-indigo-800 border-indigo-200",
  slate: "bg-stone-deep text-ink-soft border-line",
  rose: "bg-rose-50 text-rose-800 border-rose-200",
};

export function StatusBadge({ status, locale }: { status: string; locale: Locale }) {
  const label = statusLabels[status as OrderStatus] ?? statusLabels.pending_payment;
  return (
    <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${tones[label.tone] ?? tones.slate}`}>
      {locale === "zh" ? label.zh : label.en}
    </span>
  );
}
