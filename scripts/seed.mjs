// Seed / reset the local SQLite database without starting the app.
// Usage:
//   node --import ./scripts/register-ts.mjs scripts/seed.mjs
//   node --import ./scripts/register-ts.mjs scripts/seed.mjs --reset
import fs from "node:fs";
import path from "node:path";

const reset = process.argv.includes("--reset");
const dbPath = process.env.DATABASE_PATH ?? path.join(process.cwd(), "data", "walline.db");

if (reset) {
  for (const suffix of ["", "-wal", "-shm"]) {
    const file = `${dbPath}${suffix}`;
    if (fs.existsSync(file)) fs.rmSync(file);
  }
  console.log(`Removed ${dbPath}`);
}

const { db, closeDatabase } = await import("../lib/db.ts");

const tables = db
  .prepare("SELECT name FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%' ORDER BY name")
  .all()
  .map((row) => row.name);
const counts = {}
  for (const table of tables) {
    counts[table] = db.prepare(`SELECT COUNT(*) AS n FROM ${table}`).get().n;
  }

console.log(`Database: ${dbPath}`);
console.table(counts);
closeDatabase();
