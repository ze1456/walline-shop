import { cookies } from "next/headers";
import crypto from "node:crypto";
import { db } from "./db";
import { hashPassword, verifyPassword } from "./password";
import { sessionCookie, adminCookie } from "./config";

export interface UserRow {
  id: number;
  email: string;
  password_hash: string;
  name: string;
  phone: string;
  company: string;
  country: string;
  created_at: string;
}

const SESSION_DAYS = 30;

function randomToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

export function createSession(userId: number): string {
  const token = randomToken();
  const expires = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000).toISOString().replace("T", " ").slice(0, 19);
  db.prepare("INSERT INTO sessions (token, user_id, expires_at) VALUES (?, ?, ?)").run(token, userId, expires);
  return token;
}

export function destroySession(token: string): void {
  db.prepare("DELETE FROM sessions WHERE token = ?").run(token);
}

export function getUserBySession(token: string): UserRow | undefined {
  return db
    .prepare(
      `SELECT u.* FROM sessions s JOIN users u ON u.id = s.user_id
       WHERE s.token = ? AND s.expires_at > datetime('now')`,
    )
    .get(token) as unknown as UserRow | undefined;
}

/** Read the current user in a server component or server action. */
export async function getCurrentUser(): Promise<UserRow | undefined> {
  const store = await cookies();
  const token = store.get(sessionCookie)?.value;
  if (!token) return undefined;
  return getUserBySession(token);
}

export async function getSessionToken(): Promise<string | undefined> {
  const store = await cookies();
  return store.get(sessionCookie)?.value;
}

export function getUserByEmail(email: string): UserRow | undefined {
  return db.prepare("SELECT * FROM users WHERE email = ? COLLATE NOCASE").get(email.trim()) as unknown as UserRow | undefined;
}

export function getUserById(id: number): UserRow | undefined {
  return db.prepare("SELECT * FROM users WHERE id = ?").get(id) as unknown as UserRow | undefined;
}

export type RegisterResult = { ok: true; user: UserRow } | { ok: false; error: "exists" | "invalid" };

export function registerUser(input: { email: string; password: string; name: string; country?: string }): RegisterResult {
  const email = input.email.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || input.password.length < 6) return { ok: false, error: "invalid" };
  if (getUserByEmail(email)) return { ok: false, error: "exists" };
  db.prepare("INSERT INTO users (email, password_hash, name, country) VALUES (?, ?, ?, ?)").run(
    email,
    hashPassword(input.password),
    input.name.trim(),
    input.country ?? "CN",
  );
  const user = getUserByEmail(email)!;
  return { ok: true, user };
}

export function authenticate(email: string, password: string): UserRow | undefined {
  const user = getUserByEmail(email);
  if (!user) return undefined;
  return verifyPassword(password, user.password_hash) ? user : undefined;
}

export function updateUserProfile(userId: number, input: { name: string; phone: string; company: string; country: string }): void {
  db.prepare("UPDATE users SET name = ?, phone = ?, company = ?, country = ? WHERE id = ?").run(
    input.name.trim(),
    input.phone.trim(),
    input.company.trim(),
    input.country,
    userId,
  );
}

export function countUsers(): number {
  return (db.prepare("SELECT COUNT(*) AS n FROM users").get() as { n: number }).n;
}

// ---------------------------------------------------------------------------
// Admin auth: single shared password (ADMIN_PASSWORD) guarded by an HMAC cookie.
// ---------------------------------------------------------------------------

const ADMIN_MAX_AGE = 60 * 60 * 12;

function adminSecret(): string {
  return process.env.ADMIN_SECRET ?? `${process.env.ADMIN_PASSWORD ?? "walline-admin"}::walline-admin-secret`;
}

function adminPassword(): string {
  return process.env.ADMIN_PASSWORD ?? "walline-admin";
}

function signAdminPayload(payload: string): string {
  return crypto.createHmac("sha256", adminSecret()).update(payload).digest("hex");
}

export function createAdminToken(): string {
  const expires = Date.now() + ADMIN_MAX_AGE * 1000;
  const payload = `admin.${expires}`;
  return `${payload}.${signAdminPayload(payload)}`;
}

export function isValidAdminToken(token: string | undefined): boolean {
  if (!token) return false;
  const parts = token.split(".");
  if (parts.length !== 3) return false;
  const [scope, expires, signature] = parts;
  if (scope !== "admin") return false;
  const exp = Number(expires);
  if (!Number.isFinite(exp) || exp < Date.now()) return false;
  const expected = signAdminPayload(`${scope}.${expires}`);
  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

export function checkAdminPassword(password: string): boolean {
  const a = Buffer.from(password);
  const b = Buffer.from(adminPassword());
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

export async function isAdmin(): Promise<boolean> {
  const store = await cookies();
  return isValidAdminToken(store.get(adminCookie)?.value);
}

export async function setAdminCookie(): Promise<void> {
  const store = await cookies();
  store.set(adminCookie, createAdminToken(), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: ADMIN_MAX_AGE,
    secure: process.env.NODE_ENV === "production",
  });
}

export async function clearAdminCookie(): Promise<void> {
  const store = await cookies();
  store.delete(adminCookie);
}

export async function setSessionCookie(token: string): Promise<void> {
  const store = await cookies();
  store.set(sessionCookie, token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_DAYS * 24 * 60 * 60,
    secure: process.env.NODE_ENV === "production",
  });
}

export async function clearSessionCookie(): Promise<void> {
  const store = await cookies();
  store.delete(sessionCookie);
}
