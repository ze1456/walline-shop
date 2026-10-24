import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getDictionary } from "@/lib/dictionaries";
import { isLocale } from "@/lib/i18n";
import { getCurrentUser } from "@/lib/auth";
import { getCartCount } from "@/lib/cart";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  return {
    title: locale === "zh" ? "WALLINE 沃澜 · 建筑装饰线条与背景墙板" : "WALLINE · Architectural trim & wall panels",
    description:
      locale === "zh"
        ? "工厂直供铝合金装饰线条、竹木纤维线条与背景墙板。国内 48 小时发货，海外 DHL / 海运，中英双语多币种结算。"
        : "Factory-direct aluminium profiles, wood-fibre trims and feature wall panels. 48-hour China dispatch, worldwide DHL & sea freight.",
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale: rawLocale } = await params;
  if (!isLocale(rawLocale)) notFound();
  const locale = rawLocale;
  const dict = getDictionary(locale);
  const [user, cartCount] = await Promise.all([getCurrentUser(), getCartCount()]);
  return (
    <div className="flex min-h-screen flex-col">
      <Header locale={locale} dict={dict} cartCount={cartCount} user={user} />
      <main className="flex-1">{children}</main>
      <Footer locale={locale} dict={dict} />
    </div>
  );
}
