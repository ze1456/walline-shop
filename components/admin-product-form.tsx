import Link from "next/link";
import type { CategoryRow, ProductRow } from "@/lib/data";
import type { Dictionary } from "@/lib/dictionaries";
import type { Locale } from "@/lib/config";
import { localeHref, tr } from "@/lib/i18n";
import { yuan } from "@/lib/money";
import { saveProduct } from "@/app/actions/admin";

export function AdminProductForm({
  locale,
  dict,
  categories,
  product,
}: {
  locale: Locale;
  dict: Dictionary;
  categories: CategoryRow[];
  product?: ProductRow;
}) {
  const zh = locale === "zh";
  const editing = Boolean(product);
  const inputClass = "field mt-1.5 text-sm";

  return (
    <form action={saveProduct} className="grid gap-5 lg:grid-cols-[1.6fr_1fr]">
      <input type="hidden" name="locale" value={locale} />
      {editing ? <input type="hidden" name="id" value={product!.id} /> : null}

      <section className="rounded-2xl border border-line bg-white p-5">
        <h2 className="font-display text-lg text-ink">{zh ? "基本信息" : "Basics"}</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label" htmlFor="name_zh">
              {dict.admin.productNameZh}
            </label>
            <input id="name_zh" name="name_zh" required defaultValue={product?.name_zh ?? ""} className={inputClass} />
          </div>
          <div>
            <label className="label" htmlFor="name_en">
              {dict.admin.productNameEn}
            </label>
            <input id="name_en" name="name_en" required defaultValue={product?.name_en ?? ""} className={inputClass} />
          </div>
          <div>
            <label className="label" htmlFor="slug">
              {dict.admin.slug}
            </label>
            <input id="slug" name="slug" required defaultValue={product?.slug ?? ""} className={inputClass} placeholder="alu-t-profile-10" />
          </div>
          <div>
            <label className="label" htmlFor="category">
              {dict.admin.category}
            </label>
            <select id="category" name="category" defaultValue={product?.category ?? categories[0]?.slug ?? ""} className={inputClass}>
              {categories.map((category) => (
                <option key={category.slug} value={category.slug}>
                  {zh ? category.name_zh : category.name_en}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label" htmlFor="subtitle_zh">
              {zh ? "副标题（中文）" : "Subtitle (Chinese)"}
            </label>
            <input id="subtitle_zh" name="subtitle_zh" defaultValue={product?.subtitle_zh ?? ""} className={inputClass} />
          </div>
          <div>
            <label className="label" htmlFor="subtitle_en">
              {zh ? "副标题（英文）" : "Subtitle (English)"}
            </label>
            <input id="subtitle_en" name="subtitle_en" defaultValue={product?.subtitle_en ?? ""} className={inputClass} />
          </div>
          <div className="sm:col-span-2">
            <label className="label" htmlFor="description_zh">
              {zh ? "描述（中文，第二段用空行分隔）" : "Description (Chinese, blank line separates)"}
            </label>
            <textarea id="description_zh" name="description_zh" rows={4} defaultValue={product?.description_zh ?? ""} className={inputClass} />
          </div>
          <div className="sm:col-span-2">
            <label className="label" htmlFor="description_en">
              {zh ? "描述（英文）" : "Description (English)"}
            </label>
            <textarea id="description_en" name="description_en" rows={4} defaultValue={product?.description_en ?? ""} className={inputClass} />
          </div>
        </div>

        <h2 className="mt-7 font-display text-lg text-ink">{zh ? "图片" : "Media"}</h2>
        <div className="mt-3">
          <label className="label" htmlFor="image">
            {dict.admin.image}
          </label>
          <input id="image" name="image" defaultValue={product?.image ?? ""} className={inputClass} placeholder="/images/products/alu-t-profile-10.svg" />
          <p className="mt-1 text-[11px] text-ink-muted">
            {zh ? "留空则自动使用 /images/products/{slug}.svg" : "Leave empty to use /images/products/{slug}.svg"}
          </p>
        </div>
      </section>

      <section className="rounded-2xl border border-line bg-white p-5">
        <h2 className="font-display text-lg text-ink">{zh ? "价格与库存" : "Pricing & stock"}</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label" htmlFor="price">
              {dict.admin.price}
            </label>
            <input id="price" name="price" required inputMode="decimal" defaultValue={editing ? yuan(product!.price_cents) : ""} className={inputClass} />
          </div>
          <div>
            <label className="label" htmlFor="compare">
              {dict.admin.comparePrice}
            </label>
            <input id="compare" name="compare" inputMode="decimal" defaultValue={product?.compare_at_cents ? yuan(product.compare_at_cents) : ""} className={inputClass} />
          </div>
          <div>
            <label className="label" htmlFor="unit_zh">
              {dict.admin.unitZh}
            </label>
            <input id="unit_zh" name="unit_zh" defaultValue={product?.unit_zh ?? ""} className={inputClass} />
          </div>
          <div>
            <label className="label" htmlFor="unit_en">
              {dict.admin.unitEn}
            </label>
            <input id="unit_en" name="unit_en" defaultValue={product?.unit_en ?? ""} className={inputClass} />
          </div>
          <div>
            <label className="label" htmlFor="moq">
              {dict.admin.moq}
            </label>
            <input id="moq" name="moq" type="number" min={1} defaultValue={product?.moq ?? 1} className={inputClass} />
          </div>
          <div>
            <label className="label" htmlFor="weight_g">
              {dict.admin.weight}
            </label>
            <input id="weight_g" name="weight_g" type="number" min={1} defaultValue={product?.weight_g ?? 100} className={inputClass} />
          </div>
          <div>
            <label className="label" htmlFor="stock">
              {dict.admin.stock}
            </label>
            <input id="stock" name="stock" type="number" min={0} defaultValue={product?.stock ?? 100} className={inputClass} />
          </div>
          <div>
            <label className="label" htmlFor="sort">
              {zh ? "排序权重" : "Sort weight"}
            </label>
            <input id="sort" name="sort" type="number" defaultValue={product?.sort ?? 100} className={inputClass} />
          </div>
          <div>
            <label className="label" htmlFor="badge_zh">
              {zh ? "角标（中文）" : "Badge (Chinese)"}
            </label>
            <input id="badge_zh" name="badge_zh" defaultValue={product?.badge_zh ?? ""} className={inputClass} />
          </div>
          <div>
            <label className="label" htmlFor="badge_en">
              {zh ? "角标（英文）" : "Badge (English)"}
            </label>
            <input id="badge_en" name="badge_en" defaultValue={product?.badge_en ?? ""} className={inputClass} />
          </div>
        </div>

        <div className="mt-5 flex flex-wrap gap-5 text-xs text-ink-soft">
          <label className="flex items-center gap-2">
            <input type="checkbox" name="featured" defaultChecked={Boolean(product?.featured)} className="h-4 w-4 accent-[#b3894f]" />
            {dict.admin.featured}
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" name="active" defaultChecked={product ? Boolean(product.active) : true} className="h-4 w-4 accent-[#b3894f]" />
            {dict.admin.active}
          </label>
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-3 border-t border-line pt-5">
          <button type="submit" className="btn btn-primary text-sm">
            {editing ? dict.admin.saveChanges : dict.admin.create}
          </button>
          <Link href={localeHref(locale, "/admin/products")} className="btn btn-ghost text-sm">
            {tr(locale, { zh: "取消", en: "Cancel" })}
          </Link>
        </div>
        {editing ? (
          <p className="mt-3 text-[11px] text-ink-muted">
            {tr(locale, {
              zh: "规格与变体请在种子数据或数据库中维护，本表单只更新主信息。",
              en: "Specs and variants stay untouched here; edit the seed or database for those.",
            })}
          </p>
        ) : null}
      </section>
    </form>
  );
}
