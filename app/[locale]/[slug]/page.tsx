import Link from "next/link";
import { notFound } from "next/navigation";
import { infoPages } from "@/lib/content";
import { brand, type Locale } from "@/lib/config";
import { getDictionary } from "@/lib/dictionaries";
import { localeHref, normalizeLocale } from "@/lib/i18n";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const resolved = await params;
  const locale = normalizeLocale(resolved.locale);
  const page = infoPages[resolved.slug];
  if (!page) return {};
  return { title: page.title[locale], description: page.intro[locale] };
}

export default async function InfoPage({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const resolved = await params;
  const locale = normalizeLocale(resolved.locale) as Locale;
  const page = infoPages[resolved.slug];
  if (!page) notFound();
  const dict = getDictionary(locale);
  const zh = locale === "zh";

  return (
    <article className="wrap py-12 md:py-16">
      <nav className="text-[11px] text-ink-muted">
        <Link href={localeHref(locale, "/")} className="hover:text-brass-deep">
          {dict.nav.home}
        </Link>
        <span className="mx-2">/</span>
        <span className="text-ink-soft">{page.title[locale]}</span>
      </nav>

      <header className="mt-6 max-w-3xl">
        <p className="eyebrow">{zh ? "了解我们" : "Information"}</p>
        <h1 className="mt-2 font-display text-3xl text-ink md:text-4xl">{page.title[locale]}</h1>
        <p className="mt-4 text-sm leading-relaxed text-ink-soft">{page.intro[locale]}</p>
      </header>

      <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_260px]">
        <div className="space-y-8">
          {page.sections.map((section) => (
            <section key={section.heading.zh} className="rounded-2xl border border-line bg-white p-6">
              <h2 className="font-display text-xl text-ink">{section.heading[locale]}</h2>
              <div className="prose-block mt-3 space-y-3">
                {section.body[locale].map((paragraph) => (
                  <p key={paragraph} className="text-sm leading-relaxed text-ink-soft">
                    {paragraph}
                  </p>
                ))}
              </div>
            </section>
          ))}
        </div>

        <aside className="h-fit space-y-4">
          <div className="rounded-2xl bg-ink p-5 text-white">
            <p className="text-[11px] uppercase tracking-[0.2em] text-brass-soft">{zh ? "联系业务" : "Talk to sales"}</p>
            <p className="mt-3 text-sm leading-relaxed text-white/70">
              {zh ? "提供图纸或尺寸清单，我们会在 1 个工作日内回复报价。" : "Send drawings or a take-off list — quotation within one business day."}
            </p>
            <a href={`mailto:${brand.email}`} className="btn btn-brass mt-4 w-full text-xs">
              {brand.email}
            </a>
            <p className="mt-3 text-[11px] text-white/50">{zh ? brand.phoneZh : brand.phoneEn}</p>
          </div>
          <div className="rounded-2xl border border-line bg-stone p-5 text-xs text-ink-muted">
            <p className="font-semibold text-ink">{zh ? "需要产品资料？" : "Need product data?"}</p>
            <p className="mt-2 leading-relaxed">
              {zh ? "下载规格表或申请样品册，含型号、颜色与装箱数据。" : "Request the specification sheet or a sample book with profiles, finishes and packing data."}
            </p>
            <Link href={localeHref(locale, "/products/acc-sample")} className="mt-3 inline-flex text-xs font-semibold text-brass-deep hover:underline">
              {zh ? "查看样品册 →" : "View sample book →"}
            </Link>
          </div>
        </aside>
      </div>
    </article>
  );
}
