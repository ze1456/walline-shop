import Link from "next/link";
import { getDictionary } from "@/lib/dictionaries";
import type { Locale } from "@/lib/config";
import { localeHref } from "@/lib/i18n";
import { adminSignOut } from "@/app/actions/admin";

export function AdminShell({
  locale,
  active,
  children,
}: {
  locale: Locale;
  active: "dashboard" | "products" | "orders" | "coupons";
  children: React.ReactNode;
}) {
  const dict = getDictionary(locale);
  const items = [
    { key: "dashboard", href: "/admin", label: dict.admin.dashboard },
    { key: "products", href: "/admin/products", label: dict.admin.products },
    { key: "orders", href: "/admin/orders", label: dict.admin.orders },
    { key: "coupons", href: "/admin/coupons", label: dict.admin.coupons },
  ] as const;

  return (
    <div className="min-h-[70vh] bg-stone-deep/40">
      <div className="wrap py-8 md:py-10">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-line pb-5">
          <div>
            <p className="text-[11px] uppercase tracking-[0.24em] text-brass-deep">{dict.admin.title}</p>
            <p className="mt-1 font-display text-2xl text-ink">WALLINE 沃澜</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Link href={localeHref(locale, "/")} className="btn btn-outline text-xs">
              {dict.admin.viewStore}
            </Link>
            <form action={adminSignOut}>
              <input type="hidden" name="locale" value={locale} />
              <button type="submit" className="btn btn-ghost text-xs">
                {dict.admin.logout}
              </button>
            </form>
          </div>
        </div>
        <nav className="mt-5 flex flex-wrap gap-2">
          {items.map((item) => (
            <Link
              key={item.key}
              href={localeHref(locale, item.href)}
              className={`rounded-lg border px-3.5 py-2 text-xs font-medium transition ${
                active === item.key ? "border-ink bg-ink text-white" : "border-line bg-white text-ink-soft hover:border-brass"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="mt-6">{children}</div>
        <p className="mt-8 text-[11px] text-ink-muted">{dict.admin.domainNote}</p>
      </div>
    </div>
  );
}
