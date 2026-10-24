import { cookies } from "next/headers";
import { getDb, DbUser } from "./db";
import crypto from "node:crypto";
import bcrypt from "bcryptjs";

const SESSION_COOKIE = "devcraft_session";
const SESSION_EXPIRY_DAYS = 30;

export async function getCurrentUser(): Promise<Omit<DbUser, "password_hash"> | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const db = getDb();
  const row = db.prepare(`
    SELECT 
      u.id, u.username, u.name, u.email, u.avatar_url, u.bio, u.role, u.github_url, u.website_url, u.created_at
    FROM sessions s
    JOIN users u ON s.user_id = u.id
    WHERE s.token = ? AND datetime(s.expires_at) > datetime('now')
  `).get(token) as unknown as Omit<DbUser, "password_hash"> | undefined;

  return row ? { ...row } : null;
}

export async function createSession(userId: string): Promise<string> {
  const db = getDb();
  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + SESSION_EXPIRY_DAYS * 24 * 60 * 60 * 1000).toISOString();

  db.prepare(`
    INSERT INTO sessions (token, user_id, expires_at)
    VALUES (?, ?, ?)
  `).run(token, userId, expiresAt);

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.COOKIE_SECURE === "true" || (process.env.NODE_ENV === "production" && process.env.VERCEL === "1"),
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_EXPIRY_DAYS * 24 * 60 * 60,
  });

  return token;
}

export async function destroySession(): Promise<void> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (token) {
    const db = getDb();
    db.prepare("DELETE FROM sessions WHERE token = ?").run(token);
    cookieStore.delete(SESSION_COOKIE);
  }
}

export async function loginWithCredentials(
  emailOrUsername: string,
  plainPassword: string
): Promise<{ success: boolean; error?: string; user?: Omit<DbUser, "password_hash"> }> {
  const db = getDb();
  const user = db.prepare(`
    SELECT * FROM users WHERE email = ? OR username = ?
  `).get(emailOrUsername, emailOrUsername) as unknown as DbUser | undefined;

  if (!user) {
    return { success: false, error: "Invalid credentials" };
  }

  const isValid = await bcrypt.compare(plainPassword, user.password_hash);
  if (!isValid) {
    return { success: false, error: "Invalid credentials" };
  }

  await createSession(user.id);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { password_hash, ...safeUser } = user;
  return { success: true, user: safeUser };
}

export async function registerUser(data: {
  name: string;
  username: string;
  email: string;
  password: string;
  role?: string;
  bio?: string;
}): Promise<{ success: boolean; error?: string; user?: Omit<DbUser, "password_hash"> }> {
  const db = getDb();

  const existingEmail = db.prepare("SELECT id FROM users WHERE email = ?").get(data.email);
  if (existingEmail) {
    return { success: false, error: "Email is already taken" };
  }

  const existingUsername = db.prepare("SELECT id FROM users WHERE username = ?").get(data.username);
  if (existingUsername) {
    return { success: false, error: "Username is already taken" };
  }

  const id = "usr_" + crypto.randomUUID().slice(0, 8);
  const passwordHash = await bcrypt.hash(data.password, 10);
  const avatarUrl = `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(data.username)}`;

  db.prepare(`
    INSERT INTO users (id, username, name, email, password_hash, avatar_url, bio, role)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id,
    data.username.toLowerCase().trim(),
    data.name.trim(),
    data.email.toLowerCase().trim(),
    passwordHash,
    avatarUrl,
    data.bio || "Creator on DevCraft",
    data.role || "Developer"
  );

  await createSession(id);

  const newUser = db.prepare(`
    SELECT id, username, name, email, avatar_url, bio, role, github_url, website_url, created_at
    FROM users WHERE id = ?
  `).get(id) as unknown as Omit<DbUser, "password_hash">;

  return { success: true, user: newUser };
}
