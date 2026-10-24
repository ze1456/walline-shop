import { DatabaseSync } from "node:sqlite";
import fs from "node:fs";
import path from "node:path";
import { seedDatabase } from "./seed";

const dataDir = path.join(process.cwd(), "data");
const dbFile = process.env.DATABASE_PATH ?? path.join(dataDir, "walline.db");

const SCHEMA = `
PRAGMA journal_mode = WAL;
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS categories (
  slug TEXT PRIMARY KEY,
  name_zh TEXT NOT NULL,
  name_en TEXT NOT NULL,
  tagline_zh TEXT NOT NULL DEFAULT '',
  tagline_en TEXT NOT NULL DEFAULT '',
  description_zh TEXT NOT NULL DEFAULT '',
  description_en TEXT NOT NULL DEFAULT '',
  image TEXT NOT NULL DEFAULT '',
  sort INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS products (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT UNIQUE NOT NULL,
  category TEXT NOT NULL REFERENCES categories(slug),
  name_zh TEXT NOT NULL,
  name_en TEXT NOT NULL,
  subtitle_zh TEXT NOT NULL DEFAULT '',
  subtitle_en TEXT NOT NULL DEFAULT '',
  description_zh TEXT NOT NULL DEFAULT '',
  description_en TEXT NOT NULL DEFAULT '',
  price_cents INTEGER NOT NULL,
  compare_at_cents INTEGER,
  unit_zh TEXT NOT NULL DEFAULT '件',
  unit_en TEXT NOT NULL DEFAULT 'pc',
  moq INTEGER NOT NULL DEFAULT 1,
  weight_g INTEGER NOT NULL DEFAULT 0,
  stock INTEGER NOT NULL DEFAULT 0,
  featured INTEGER NOT NULL DEFAULT 0,
  badge_zh TEXT,
  badge_en TEXT,
  image TEXT NOT NULL DEFAULT '',
  images TEXT NOT NULL DEFAULT '[]',
  specs TEXT NOT NULL DEFAULT '[]',
  sort INTEGER NOT NULL DEFAULT 0,
  active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS variants (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  sku TEXT NOT NULL,
  name_zh TEXT NOT NULL,
  name_en TEXT NOT NULL,
  price_delta_cents INTEGER NOT NULL DEFAULT 0,
  image TEXT NOT NULL DEFAULT '',
  stock INTEGER NOT NULL DEFAULT 100,
  sort INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS carts (
  id TEXT PRIMARY KEY,
  coupon_code TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS cart_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  cart_id TEXT NOT NULL REFERENCES carts(id) ON DELETE CASCADE,
  product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  variant_id INTEGER REFERENCES variants(id) ON DELETE SET NULL,
  qty INTEGER NOT NULL DEFAULT 1,
  added_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE (cart_id, product_id, variant_id)
);

CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name TEXT NOT NULL DEFAULT '',
  phone TEXT NOT NULL DEFAULT '',
  company TEXT NOT NULL DEFAULT '',
  country TEXT NOT NULL DEFAULT 'CN',
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS sessions (
  token TEXT PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS orders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  order_no TEXT UNIQUE NOT NULL,
  user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  locale TEXT NOT NULL DEFAULT 'zh',
  currency TEXT NOT NULL DEFAULT 'CNY',
  fx_rate REAL NOT NULL DEFAULT 1,
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  company TEXT NOT NULL DEFAULT '',
  country TEXT NOT NULL,
  province TEXT NOT NULL DEFAULT '',
  city TEXT NOT NULL DEFAULT '',
  address TEXT NOT NULL,
  postal TEXT NOT NULL DEFAULT '',
  note TEXT NOT NULL DEFAULT '',
  subtotal_cents INTEGER NOT NULL,
  shipping_cents INTEGER NOT NULL,
  discount_cents INTEGER NOT NULL DEFAULT 0,
  total_cents INTEGER NOT NULL,
  coupon_code TEXT NOT NULL DEFAULT '',
  shipping_code TEXT NOT NULL DEFAULT '',
  shipping_days TEXT NOT NULL DEFAULT '',
  payment_method TEXT NOT NULL,
  payment_status TEXT NOT NULL DEFAULT 'unpaid',
  payment_ref TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'pending_payment',
  tracking_no TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  paid_at TEXT
);

CREATE TABLE IF NOT EXISTS order_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id INTEGER REFERENCES products(id) ON DELETE SET NULL,
  slug TEXT NOT NULL DEFAULT '',
  name_zh TEXT NOT NULL,
  name_en TEXT NOT NULL,
  variant_zh TEXT NOT NULL DEFAULT '',
  variant_en TEXT NOT NULL DEFAULT '',
  unit_zh TEXT NOT NULL DEFAULT '',
  unit_en TEXT NOT NULL DEFAULT '',
  image TEXT NOT NULL DEFAULT '',
  unit_price_cents INTEGER NOT NULL,
  qty INTEGER NOT NULL,
  weight_g INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS coupons (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  code TEXT UNIQUE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('percent','fixed')),
  value INTEGER NOT NULL,
  min_subtotal_cents INTEGER NOT NULL DEFAULT 0,
  expires_at TEXT,
  max_uses INTEGER NOT NULL DEFAULT 0,
  used_count INTEGER NOT NULL DEFAULT 0,
  active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS shipping_methods (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  code TEXT UNIQUE NOT NULL,
  name_zh TEXT NOT NULL,
  name_en TEXT NOT NULL,
  carrier_zh TEXT NOT NULL DEFAULT '',
  carrier_en TEXT NOT NULL DEFAULT '',
  country_group TEXT NOT NULL DEFAULT 'global',
  base_cents INTEGER NOT NULL DEFAULT 0,
  per_kg_cents INTEGER NOT NULL DEFAULT 0,
  free_over_cents INTEGER NOT NULL DEFAULT 0,
  days_min INTEGER NOT NULL DEFAULT 3,
  days_max INTEGER NOT NULL DEFAULT 7,
  sort INTEGER NOT NULL DEFAULT 0,
  active INTEGER NOT NULL DEFAULT 1
);

CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_featured ON products(featured);
CREATE INDEX IF NOT EXISTS idx_cart_items_cart ON cart_items(cart_id);
CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_created ON orders(created_at);
CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id);
`;

function createDatabase(): DatabaseSync {
  if (dbFile !== ":memory:") {
    fs.mkdirSync(path.dirname(dbFile), { recursive: true });
  }
  const database = new DatabaseSync(dbFile);
  database.exec(SCHEMA);
  seedDatabase(database);
  return database;
}

const globalForDb = globalThis as unknown as { __wallineDb?: DatabaseSync };

export const db: DatabaseSync = globalForDb.__wallineDb ?? (globalForDb.__wallineDb = createDatabase());

export function nowSql(): string {
  return new Date().toISOString().replace("T", " ").slice(0, 19);
}

export function closeDatabase(): void {
  if (globalForDb.__wallineDb) {
    globalForDb.__wallineDb.close();
    globalForDb.__wallineDb = undefined;
  }
}
