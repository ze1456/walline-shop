import { db } from "./db";

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

export function listCategories(): CategoryRow[] {
  return db.prepare("SELECT * FROM categories ORDER BY sort ASC").all() as unknown as CategoryRow[];
}

export function getCategory(slug: string): CategoryRow | undefined {
  return db.prepare("SELECT * FROM categories WHERE slug = ?").get(slug) as unknown as CategoryRow | undefined;
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

export function listProducts(query: ProductQuery = {}): ProductRow[] {
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
  return db
    .prepare(`SELECT * FROM products ${where.sql} ORDER BY ${order} LIMIT ? OFFSET ?`)
    .all(...where.params, limit, offset) as unknown as ProductRow[];
}

export function countProducts(query: ProductQuery = {}): number {
  const where = buildProductWhere(query);
  const row = db.prepare(`SELECT COUNT(*) AS n FROM products ${where.sql}`).get(...where.params) as { n: number };
  return row.n;
}

export function getProductBySlug(slug: string, includeHidden = false): ProductRow | undefined {
  const sql = includeHidden ? "SELECT * FROM products WHERE slug = ?" : "SELECT * FROM products WHERE slug = ? AND active = 1";
  return db.prepare(sql).get(slug) as unknown as ProductRow | undefined;
}

export function getProductById(id: number): ProductRow | undefined {
  return db.prepare("SELECT * FROM products WHERE id = ?").get(id) as unknown as ProductRow | undefined;
}

export function getVariants(productId: number): VariantRow[] {
  return db.prepare("SELECT * FROM variants WHERE product_id = ? ORDER BY sort ASC, id ASC").all(productId) as unknown as VariantRow[];
}

export function getFeaturedProducts(limit = 8): ProductRow[] {
  return db.prepare("SELECT * FROM products WHERE active = 1 AND featured = 1 ORDER BY sort ASC, id ASC LIMIT ?").all(limit) as unknown as ProductRow[];
}

export function getRelatedProducts(product: ProductRow, limit = 4): ProductRow[] {
  return db
    .prepare("SELECT * FROM products WHERE active = 1 AND category = ? AND id != ? ORDER BY sort ASC LIMIT ?")
    .all(product.category, product.id, limit) as unknown as ProductRow[];
}

export function getSampleProduct(): ProductRow | undefined {
  return db.prepare("SELECT * FROM products WHERE slug = 'acc-sample' AND active = 1").get() as unknown as ProductRow | undefined;
}

export function categoryCounts(): Record<string, number> {
  const rows = db.prepare("SELECT category, COUNT(*) AS n FROM products WHERE active = 1 GROUP BY category").all() as unknown as {
    category: string;
    n: number;
  }[];
  return Object.fromEntries(rows.map((r) => [r.category, r.n]));
}

export function getSetting(key: string, fallback = ""): string {
  const row = db.prepare("SELECT value FROM settings WHERE key = ?").get(key) as { value: string } | undefined;
  return row?.value ?? fallback;
}
