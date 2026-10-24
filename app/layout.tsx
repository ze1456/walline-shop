import type { Metadata } from "next";
import { headers } from "next/headers";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "WALLINE 沃澜 · 建筑装饰线条与背景墙板",
    template: "%s · WALLINE 沃澜",
  },
  description:
    "WALLINE 沃澜 — 工厂直供铝合金装饰线条、竹木纤维线条与背景墙板，中英双语、多币种结算、国内 48 小时发货与海外 DHL/海运配送。",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  openGraph: {
    title: "WALLINE 沃澜 · 建筑装饰线条与背景墙板",
    description: "Aluminium profiles · wood-fibre trims · feature wall panels, factory direct.",
    type: "website",
  },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const requestHeaders = await headers();
  const locale = requestHeaders.get("x-locale") === "en" ? "en" : "zh";
  return (
    <html lang={locale === "en" ? "en" : "zh-CN"}>
      <body className="min-h-screen bg-stone font-sans text-ink antialiased">{children}</body>
    </html>
  );
}
