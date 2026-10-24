import { getDb, DbUser, DbProject, ProjectWithAuthor, DbComment } from "./db";
import crypto from "node:crypto";

function toPlain<T>(obj: T): T {
  if (!obj || typeof obj !== "object") return obj;
  if (Array.isArray(obj)) return obj.map(toPlain) as unknown as T;
  return { ...obj };
}

export function updateUserProfile(
  userId: string,
  data: {
    name?: string;
    avatarUrl?: string;
    bio?: string;
    role?: string;
    githubUrl?: string;
    websiteUrl?: string;
  }
): boolean {
  const db = getDb();
  const fields: string[] = [];
  const params: unknown[] = [];

  if (data.name !== undefined) {
    fields.push("name = ?");
    params.push(data.name.trim());
  }
  if (data.avatarUrl !== undefined) {
    fields.push("avatar_url = ?");
    params.push(data.avatarUrl.trim() || null);
  }
  if (data.bio !== undefined) {
    fields.push("bio = ?");
    params.push(data.bio.trim() || null);
  }
  if (data.role !== undefined) {
    fields.push("role = ?");
    params.push(data.role.trim() || "Developer");
  }
  if (data.githubUrl !== undefined) {
    fields.push("github_url = ?");
    params.push(data.githubUrl.trim() || null);
  }
  if (data.websiteUrl !== undefined) {
    fields.push("website_url = ?");
    params.push(data.websiteUrl.trim() || null);
  }

  if (fields.length === 0) return true;

  params.push(userId);
  const sql = `UPDATE users SET ${fields.join(", ")} WHERE id = ?`;
  const result = db.prepare(sql).run(...params);
  return (result.changes ?? 0) > 0;
}

export function getAllUsers(): Omit<DbUser, "password_hash">[] {
  const db = getDb();
  const rows = db.prepare(`
    SELECT id, username, name, email, avatar_url, bio, role, github_url, website_url, created_at
    FROM users
    ORDER BY created_at ASC
  `).all() as unknown as Omit<DbUser, "password_hash">[];
  return rows.map((r) => toPlain(r));
}

export function getUserById(id: string): Omit<DbUser, "password_hash"> | null {
  const db = getDb();
  const row = db.prepare(`
    SELECT id, username, name, email, avatar_url, bio, role, github_url, website_url, created_at
    FROM users
    WHERE id = ?
  `).get(id) as unknown as Omit<DbUser, "password_hash"> | undefined;
  return row ? toPlain(row) : null;
}

export function getUserByUsername(username: string): Omit<DbUser, "password_hash"> | null {
  const db = getDb();
  const row = db.prepare(`
    SELECT id, username, name, email, avatar_url, bio, role, github_url, website_url, created_at
    FROM users
    WHERE username = ?
  `).get(username) as unknown as Omit<DbUser, "password_hash"> | undefined;
  return row ? toPlain(row) : null;
}

export function getUserByEmail(email: string): DbUser | null {
  const db = getDb();
  const row = db.prepare(`
    SELECT * FROM users WHERE email = ?
  `).get(email) as unknown as DbUser | undefined;
  return row ? toPlain(row) : null;
}

export function getProjects(params: {
  sort?: "trending" | "recent" | "stars" | "views";
  tag?: string;
  search?: string;
  authorId?: string;
  currentUserId?: string | null;
  limit?: number;
}): ProjectWithAuthor[] {
  const db = getDb();
  const { sort = "trending", tag, search, authorId, currentUserId, limit = 50 } = params;

  let query = `
    SELECT 
      p.*,
      u.name AS author_name,
      u.username AS author_username,
      u.avatar_url AS author_avatar,
      u.role AS author_role,
      (SELECT COUNT(*) FROM stars s WHERE s.project_id = p.id) AS stars_count,
      (SELECT COUNT(*) FROM comments c WHERE c.project_id = p.id) AS comments_count,
      ${currentUserId ? `(SELECT COUNT(*) FROM stars s WHERE s.project_id = p.id AND s.user_id = '${currentUserId}') > 0` : "0"} AS has_starred
    FROM projects p
    JOIN users u ON p.author_id = u.id
    WHERE 1=1
  `;

  const queryParams: unknown[] = [];

  if (authorId) {
    query += " AND p.author_id = ?";
    queryParams.push(authorId);
  }

  if (tag && tag !== "All") {
    query += " AND p.tags LIKE ?";
    queryParams.push(`%"${tag}"%`);
  }

  if (search && search.trim()) {
    query += " AND (p.title LIKE ? OR p.tagline LIKE ? OR p.description LIKE ? OR p.tags LIKE ?)";
    const term = `%${search.trim()}%`;
    queryParams.push(term, term, term, term);
  }

  switch (sort) {
    case "recent":
      query += " ORDER BY p.created_at DESC";
      break;
    case "stars":
      query += " ORDER BY stars_count DESC, p.created_at DESC";
      break;
    case "views":
      query += " ORDER BY p.views DESC, p.created_at DESC";
      break;
    case "trending":
    default:
      query += " ORDER BY (stars_count * 3 + p.views) DESC, p.created_at DESC";
      break;
  }

  query += ` LIMIT ${limit}`;

  type ProjectDbRow = Omit<ProjectWithAuthor, "has_starred"> & { has_starred: number };
  const rows = db.prepare(query).all(...queryParams) as unknown as ProjectDbRow[];
  return rows.map((r) => ({
    ...r,
    has_starred: Boolean(r.has_starred),
  }));
}

export function getProjectById(id: string, currentUserId?: string | null): ProjectWithAuthor | null {
  const db = getDb();
  const query = `
    SELECT 
      p.*,
      u.name AS author_name,
      u.username AS author_username,
      u.avatar_url AS author_avatar,
      u.role AS author_role,
      (SELECT COUNT(*) FROM stars s WHERE s.project_id = p.id) AS stars_count,
      (SELECT COUNT(*) FROM comments c WHERE c.project_id = p.id) AS comments_count,
      ${currentUserId ? `(SELECT COUNT(*) FROM stars s WHERE s.project_id = p.id AND s.user_id = '${currentUserId}') > 0` : "0"} AS has_starred
    FROM projects p
    JOIN users u ON p.author_id = u.id
    WHERE p.id = ?
  `;

  type ProjectDbRow = Omit<ProjectWithAuthor, "has_starred"> & { has_starred: number };
  const row = db.prepare(query).get(id) as unknown as ProjectDbRow | undefined;
  if (!row) return null;

  return {
    ...row,
    has_starred: Boolean(row.has_starred),
  };
}

export function incrementViews(projectId: string): void {
  const db = getDb();
  db.prepare("UPDATE projects SET views = views + 1 WHERE id = ?").run(projectId);
}

export function toggleStar(projectId: string, userId: string): { starred: boolean; totalStars: number } {
  const db = getDb();
  const existing = db.prepare("SELECT id FROM stars WHERE project_id = ? AND user_id = ?").get(projectId, userId);

  if (existing) {
    db.prepare("DELETE FROM stars WHERE project_id = ? AND user_id = ?").run(projectId, userId);
  } else {
    const starId = "star_" + crypto.randomUUID();
    db.prepare("INSERT INTO stars (id, project_id, user_id) VALUES (?, ?, ?)").run(starId, projectId, userId);
  }

  const countRow = db.prepare("SELECT COUNT(*) AS total FROM stars WHERE project_id = ?").get(projectId) as unknown as { total: number };
  return {
    starred: !existing,
    totalStars: countRow?.total ?? 0,
  };
}

export function getComments(projectId: string): DbComment[] {
  const db = getDb();
  const query = `
    SELECT 
      c.id,
      c.content,
      c.project_id,
      c.user_id,
      c.created_at,
      u.name AS user_name,
      u.username AS user_username,
      u.avatar_url AS user_avatar,
      u.role AS user_role
    FROM comments c
    JOIN users u ON c.user_id = u.id
    WHERE c.project_id = ?
    ORDER BY c.created_at ASC
  `;
  const rows = db.prepare(query).all(projectId) as unknown as DbComment[];
  return rows.map((r) => toPlain(r));
}

export function addComment(projectId: string, userId: string, content: string): DbComment {
  const db = getDb();
  const id = "cmt_" + crypto.randomUUID();
  db.prepare("INSERT INTO comments (id, project_id, user_id, content) VALUES (?, ?, ?, ?)").run(
    id,
    projectId,
    userId,
    content.trim()
  );

  const query = `
    SELECT 
      c.id,
      c.content,
      c.project_id,
      c.user_id,
      c.created_at,
      u.name AS user_name,
      u.username AS user_username,
      u.avatar_url AS user_avatar,
      u.role AS user_role
    FROM comments c
    JOIN users u ON c.user_id = u.id
    WHERE c.id = ?
  `;
  const row = db.prepare(query).get(id) as unknown as DbComment;
  return toPlain(row);
}

export function updateComment(commentId: string, userId: string, content: string): DbComment | null {
  const db = getDb();
  const res = db.prepare("UPDATE comments SET content = ? WHERE id = ? AND user_id = ?").run(
    content.trim(),
    commentId,
    userId
  );
  if ((res.changes ?? 0) === 0) return null;

  const query = `
    SELECT 
      c.id,
      c.content,
      c.project_id,
      c.user_id,
      c.created_at,
      u.name AS user_name,
      u.username AS user_username,
      u.avatar_url AS user_avatar,
      u.role AS user_role
    FROM comments c
    JOIN users u ON c.user_id = u.id
    WHERE c.id = ?
  `;
  const row = db.prepare(query).get(commentId) as unknown as DbComment;
  return toPlain(row);
}

export function deleteComment(commentId: string, userId: string): boolean {
  const db = getDb();
  const res = db.prepare("DELETE FROM comments WHERE id = ? AND user_id = ?").run(commentId, userId);
  return (res.changes ?? 0) > 0;
}

export function createProject(data: {
  title: string;
  tagline: string;
  description: string;
  tags: string[];
  coverImage?: string;
  codeSnippet?: string;
  demoUrl?: string;
  githubUrl?: string;
  authorId: string;
}): string {
  const db = getDb();
  const id = "prj_" + crypto.randomUUID().slice(0, 8);
  const tagsJson = JSON.stringify(data.tags);

  db.prepare(`
    INSERT INTO projects (
      id, title, tagline, description, tags, cover_image, code_snippet, demo_url, github_url, author_id
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id,
    data.title,
    data.tagline,
    data.description,
    tagsJson,
    data.coverImage || null,
    data.codeSnippet || null,
    data.demoUrl || null,
    data.githubUrl || null,
    data.authorId
  );

  return id;
}

export function deleteProject(id: string, authorId: string): boolean {
  const db = getDb();
  const res = db.prepare("DELETE FROM projects WHERE id = ? AND author_id = ?").run(id, authorId);
  return (res.changes ?? 0) > 0;
}

export function getStats(): { totalProjects: number; totalStars: number; totalCreators: number } {
  const db = getDb();
  const p = (db.prepare("SELECT COUNT(*) as count FROM projects").get() as unknown as { count: number }).count;
  const s = (db.prepare("SELECT COUNT(*) as count FROM stars").get() as unknown as { count: number }).count;
  const u = (db.prepare("SELECT COUNT(*) as count FROM users").get() as unknown as { count: number }).count;
  return { totalProjects: p, totalStars: s, totalCreators: u };
}
