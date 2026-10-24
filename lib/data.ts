import { dbAll, dbGet } from "./db";

export interface CategoryRow {
  slug: string;
  name_zh: string;
  name_en: string;
  tagline_zh: string;
  tagline_en: string;
  description_zh: string;
  description_en: string;
  image: string;
  sort: number;
}

export interface Spec {
  kZh: string;
  kEn: string;
  vZh: string;
  vEn: string;
}

export interface ProductRow {
  id: number;
  slug: string;
  category: string;
  name_zh: string;
  name_en: string;
  subtitle_zh: string;
  subtitle_en: string;
  description_zh: string;
  description_en: string;
  price_cents: number;
  compare_at_cents: number | null;
  unit_zh: string;
  unit_en: string;
  moq: number;
  weight_g: number;
  stock: number;
  featured: number;
  badge_zh: string | null;
  badge_en: string | null;
  image: string;
  images: string;
  specs: string;
  sort: number;
  active: number;
  created_at: string;
  updated_at: string;
}

export interface VariantRow {
  id: number;
  product_id: number;
  sku: string;
  name_zh: string;
  name_en: string;
  price_delta_cents: number;
  image: string;
  stock: number;
  sort: number;
}

export function parseSpecs(raw: string): Spec[] {
  try {
    return JSON.parse(raw) as Spec[];
  } catch {
    return [];
  }
}

export function parseImages(raw: string): string[] {
  try {
    const value = JSON.parse(raw) as unknown;
    return Array.isArray(value) ? (value as string[]) : [];
  } catch {
    return [];
  }
}

export async function listCategories(): Promise<CategoryRow[]> {
  return dbAll<CategoryRow>("SELECT * FROM categories ORDER BY sort ASC");
}

export async function getCategory(slug: string): Promise<CategoryRow | undefined> {
  return dbGet<CategoryRow>("SELECT * FROM categories WHERE slug = ?", [slug]);
}

export interface ProductQuery {
  category?: string;
  q?: string;
  sort?: "recommended" | "price_asc" | "price_desc" | "newest";
  includeHidden?: boolean;
  limit?: number;
  offset?: number;
}

function buildProductWhere(query: ProductQuery): { sql: string; params: (string | number)[] } {
  const clauses: string[] = [];
  const params: (string | number)[] = [];
  if (!query.includeHidden) clauses.push("active = 1");
  if (query.category) {
    clauses.push("category = ?");
    params.push(query.category);
  }
  if (query.q?.trim()) {
    const like = `%${query.q.trim()}%`;
    clauses.push("(name_zh LIKE ? OR name_en LIKE ? OR slug LIKE ? OR subtitle_zh LIKE ? OR subtitle_en LIKE ?)");
    params.push(like, like, like, like, like);
  }
  return { sql: clauses.length ? `WHERE ${clauses.join(" AND ")}` : "", params };
}

export async function listProducts(query: ProductQuery = {}): Promise<ProductRow[]> {
  const where = buildProductWhere(query);
  const order =
    query.sort === "price_asc"
      ? "price_cents ASC"
      : query.sort === "price_desc"
        ? "price_cents DESC"
        : query.sort === "newest"
          ? "id DESC"
          : "featured DESC, sort ASC, id ASC";
  const limit = query.limit ?? 200;
  const offset = query.offset ?? 0;
  return dbAll<ProductRow>(`SELECT * FROM products ${where.sql} ORDER BY ${order} LIMIT ? OFFSET ?`, [
    ...where.params,
    limit,
    offset,
  ]);
}

export async function countProducts(query: ProductQuery = {}): Promise<number> {
  const where = buildProductWhere(query);
  const row = await dbGet<{ n: number }>(`SELECT COUNT(*) AS n FROM products ${where.sql}`, where.params);
  return row?.n ?? 0;
}

export async function getProductBySlug(slug: string, includeHidden = false): Promise<ProductRow | undefined> {
  const sql = includeHidden ? "SELECT * FROM products WHERE slug = ?" : "SELECT * FROM products WHERE slug = ? AND active = 1";
  return dbGet<ProductRow>(sql, [slug]);
}

export async function getProductById(id: number): Promise<ProductRow | undefined> {
  return dbGet<ProductRow>("SELECT * FROM products WHERE id = ?", [id]);
}

export async function getVariants(productId: number): Promise<VariantRow[]> {
  return dbAll<VariantRow>("SELECT * FROM variants WHERE product_id = ? ORDER BY sort ASC, id ASC", [productId]);
}

export async function getFeaturedProducts(limit = 8): Promise<ProductRow[]> {
  return dbAll<ProductRow>("SELECT * FROM products WHERE active = 1 AND featured = 1 ORDER BY sort ASC, id ASC LIMIT ?", [limit]);
}

export async function getRelatedProducts(product: ProductRow, limit = 4): Promise<ProductRow[]> {
  return dbAll<ProductRow>("SELECT * FROM products WHERE active = 1 AND category = ? AND id != ? ORDER BY sort ASC LIMIT ?", [
    product.category,
    product.id,
    limit,
  ]);
}

export async function getSampleProduct(): Promise<ProductRow | undefined> {
  return dbGet<ProductRow>("SELECT * FROM products WHERE slug = 'acc-sample' AND active = 1");
}

export async function categoryCounts(): Promise<Record<string, number>> {
  const rows = await dbAll<{ category: string; n: number }>(
    "SELECT category, COUNT(*) AS n FROM products WHERE active = 1 GROUP BY category",
  );
  return Object.fromEntries(rows.map((r) => [r.category, r.n]));
}

export async function getSetting(key: string, fallback = ""): Promise<string> {
  const row = await dbGet<{ value: string }>("SELECT value FROM settings WHERE key = ?", [key]);
  return row?.value ?? fallback;
}
