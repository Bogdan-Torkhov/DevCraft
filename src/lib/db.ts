import { DatabaseSync } from "node:sqlite";
import path from "node:path";
import fs from "node:fs";

// Ensure data directory exists
const dataDir = path.join(process.cwd(), "data");
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, "devcraft.db");

// Singleton connection across Next.js dev hot-reloads
declare global {
  // eslint-disable-next-line no-var
  var __devcraft_db: DatabaseSync | undefined;
}

export function getDb(): DatabaseSync {
  if (!global.__devcraft_db) {
    const db = new DatabaseSync(dbPath);
    db.exec("PRAGMA foreign_keys = ON;");
    db.exec("PRAGMA journal_mode = WAL;");
    initSchema(db);
    global.__devcraft_db = db;
    // Auto-seed asynchronously or lazily
    import("./seed").then((m) => m.ensureDatabaseSeeded().catch(console.error));
  }
  return global.__devcraft_db;
}

export function initSchema(db: DatabaseSync) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      avatar_url TEXT,
      bio TEXT,
      role TEXT DEFAULT 'Developer',
      github_url TEXT,
      website_url TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS projects (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      tagline TEXT NOT NULL,
      description TEXT NOT NULL,
      tags TEXT NOT NULL, -- JSON array string
      cover_image TEXT,
      code_snippet TEXT,
      demo_url TEXT,
      github_url TEXT,
      views INTEGER DEFAULT 0,
      author_id TEXT NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS comments (
      id TEXT PRIMARY KEY,
      content TEXT NOT NULL,
      project_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS stars (
      id TEXT PRIMARY KEY,
      project_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(project_id, user_id),
      FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS sessions (
      token TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      expires_at TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `);
}

export interface DbUser {
  id: string;
  username: string;
  name: string;
  email: string;
  password_hash: string;
  avatar_url: string | null;
  bio: string | null;
  role: string;
  github_url: string | null;
  website_url: string | null;
  created_at: string;
}

export interface DbProject {
  id: string;
  title: string;
  tagline: string;
  description: string;
  tags: string; // JSON string
  cover_image: string | null;
  code_snippet: string | null;
  demo_url: string | null;
  github_url: string | null;
  views: number;
  author_id: string;
  created_at: string;
  updated_at: string;
}

export interface ProjectWithAuthor extends DbProject {
  author_name: string;
  author_username: string;
  author_avatar: string | null;
  author_role: string;
  stars_count: number;
  comments_count: number;
  has_starred?: boolean;
}

export interface DbComment {
  id: string;
  content: string;
  project_id: string;
  user_id: string;
  created_at: string;
  user_name: string;
  user_username: string;
  user_avatar: string | null;
  user_role: string;
}
