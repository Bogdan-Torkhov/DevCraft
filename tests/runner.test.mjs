import { test, describe, before, beforeEach } from "node:test";
import assert from "node:assert/strict";
import { DatabaseSync } from "node:sqlite";
import bcrypt from "bcryptjs";
import crypto from "node:crypto";

describe("DevCraft Core Functions & Engine Automated Tests", () => {
  let db;

  // Helper to initialize fresh in-memory schema
  function setupTestDb() {
    const memDb = new DatabaseSync(":memory:");
    memDb.exec("PRAGMA foreign_keys = ON;");
    memDb.exec(`
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
        tags TEXT NOT NULL,
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
    return memDb;
  }

  beforeEach(() => {
    db = setupTestDb();
  });

  describe("1. User Authentication & Registration", () => {
    test("hashes password and verifies credentials successfully", async () => {
      const password = "SuperSecretPassword123!";
      const hash = await bcrypt.hash(password, 10);
      assert.ok(hash.startsWith("$2"), "Hash should be valid bcrypt");

      const isValid = await bcrypt.compare(password, hash);
      assert.equal(isValid, true, "Valid password should match hash");

      const isInvalid = await bcrypt.compare("WrongPassword", hash);
      assert.equal(isInvalid, false, "Invalid password should fail");
    });

    test("inserts new user and enforces uniqueness constraints", async () => {
      const hash = await bcrypt.hash("pass123", 10);
      db.prepare(`
        INSERT INTO users (id, username, name, email, password_hash, role)
        VALUES (?, ?, ?, ?, ?, ?)
      `).run("u1", "testuser", "Test User", "test@example.com", hash, "Developer");

      const user = db.prepare("SELECT * FROM users WHERE id = ?").get("u1");
      assert.ok(user, "User should be retrieved");
      assert.equal(user.username, "testuser");
      assert.equal(user.email, "test@example.com");

      // Attempt duplicate username
      assert.throws(() => {
        db.prepare(`
          INSERT INTO users (id, username, name, email, password_hash)
          VALUES (?, ?, ?, ?, ?)
        `).run("u2", "testuser", "Another User", "diff@example.com", hash);
      }, /UNIQUE constraint failed/);

      // Attempt duplicate email
      assert.throws(() => {
        db.prepare(`
          INSERT INTO users (id, username, name, email, password_hash)
          VALUES (?, ?, ?, ?, ?)
        `).run("u3", "newuser", "Another User", "test@example.com", hash);
      }, /UNIQUE constraint failed/);
    });

    test("manages session tokens and handles expiration", () => {
      db.prepare(`
        INSERT INTO users (id, username, name, email, password_hash)
        VALUES ('u1', 'user1', 'User One', 'u1@test.com', 'hash')
      `).run();

      const token = crypto.randomBytes(32).toString("hex");
      const futureDate = new Date(Date.now() + 86400000).toISOString();

      db.prepare("INSERT INTO sessions (token, user_id, expires_at) VALUES (?, ?, ?)").run(
        token,
        "u1",
        futureDate
      );

      const session = db.prepare(`
        SELECT s.*, u.username FROM sessions s
        JOIN users u ON s.user_id = u.id
        WHERE s.token = ? AND datetime(s.expires_at) > datetime('now')
      `).get(token);

      assert.ok(session, "Active session should be found");
      assert.equal(session.username, "user1");

      // Test expired session
      const expiredToken = "expired_token";
      const pastDate = new Date(Date.now() - 86400000).toISOString();
      db.prepare("INSERT INTO sessions (token, user_id, expires_at) VALUES (?, ?, ?)").run(
        expiredToken,
        "u1",
        pastDate
      );

      const expiredSession = db.prepare(`
        SELECT * FROM sessions WHERE token = ? AND datetime(expires_at) > datetime('now')
      `).get(expiredToken);
      assert.equal(expiredSession, undefined, "Expired session should not be returned");
    });
  });

  describe("2. Project Showcase & Sandbox Engine", () => {
    beforeEach(() => {
      db.prepare(`
        INSERT INTO users (id, username, name, email, password_hash, role)
        VALUES 
          ('u1', 'elena', 'Elena Rostova', 'elena@test.com', 'hash', 'Designer'),
          ('u2', 'marcus', 'Marcus Chen', 'marcus@test.com', 'hash', 'Engineer')
      `).run();
    });

    test("creates project with tags and runnable code snippet", () => {
      const code = "<html><body><h1>Hello</h1></body></html>";
      const tags = JSON.stringify(["React", "Tailwind", "Canvas"]);

      db.prepare(`
        INSERT INTO projects (id, title, tagline, description, tags, code_snippet, author_id)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run("p1", "Interactive Bento", "Bento with glow", "Description here", tags, code, "u1");

      const project = db.prepare("SELECT * FROM projects WHERE id = ?").get("p1");
      assert.ok(project);
      assert.equal(project.title, "Interactive Bento");
      assert.equal(project.code_snippet, code);
      assert.deepEqual(JSON.parse(project.tags), ["React", "Tailwind", "Canvas"]);
    });

    test("increments view counter accurately", () => {
      db.prepare(`
        INSERT INTO projects (id, title, tagline, description, tags, author_id)
        VALUES ('p1', 'Test', 'Tag', 'Desc', '[]', 'u1')
      `).run();

      db.prepare("UPDATE projects SET views = views + 1 WHERE id = 'p1'").run();
      db.prepare("UPDATE projects SET views = views + 1 WHERE id = 'p1'").run();

      const project = db.prepare("SELECT views FROM projects WHERE id = 'p1'").get();
      assert.equal(project.views, 2);
    });

    test("toggles star and enforces single star per user per project", () => {
      db.prepare(`
        INSERT INTO projects (id, title, tagline, description, tags, author_id)
        VALUES ('p1', 'Star Test', 'Tag', 'Desc', '[]', 'u1')
      `).run();

      // Star project
      db.prepare("INSERT INTO stars (id, project_id, user_id) VALUES (?, ?, ?)").run("s1", "p1", "u2");
      let starCount = db.prepare("SELECT COUNT(*) as count FROM stars WHERE project_id = 'p1'").get().count;
      assert.equal(starCount, 1);

      // Attempt duplicate star
      assert.throws(() => {
        db.prepare("INSERT INTO stars (id, project_id, user_id) VALUES (?, ?, ?)").run("s2", "p1", "u2");
      }, /UNIQUE constraint failed/);

      // Un-star project
      db.prepare("DELETE FROM stars WHERE project_id = 'p1' AND user_id = 'u2'").run();
      starCount = db.prepare("SELECT COUNT(*) as count FROM stars WHERE project_id = 'p1'").get().count;
      assert.equal(starCount, 0);
    });

    test("filters projects by tag and keyword search", () => {
      db.prepare(`
        INSERT INTO projects (id, title, tagline, description, tags, views, author_id)
        VALUES 
          ('p1', 'Cyber Matrix', 'Futuristic HUD', 'Awesome UI', '["React", "CSSArt"]', 100, 'u1'),
          ('p2', 'Particle Net', 'WebGL nodes', 'Canvas simulation', '["WebGL", "Canvas"]', 50, 'u2'),
          ('p3', 'Tilt Card', '3D rotation', 'CSS transforms', '["React", "Components"]', 80, 'u1')
      `).run();

      // Filter by tag React
      const reactProjects = db.prepare(`SELECT id FROM projects WHERE tags LIKE '%"React"%'`).all();
      assert.equal(reactProjects.length, 2);

      // Search keyword 'HUD'
      const searchHud = db.prepare(`SELECT id FROM projects WHERE title LIKE '%HUD%' OR tagline LIKE '%HUD%'`).all();
      assert.equal(searchHud.length, 1);
      assert.equal(searchHud[0].id, "p1");
    });
  });

  describe("3. Peer Comments & Discussion System", () => {
    beforeEach(() => {
      db.prepare(`
        INSERT INTO users (id, username, name, email, password_hash)
        VALUES 
          ('u1', 'elena', 'Elena', 'e@test.com', 'h'),
          ('u2', 'marcus', 'Marcus', 'm@test.com', 'h')
      `).run();

      db.prepare(`
        INSERT INTO projects (id, title, tagline, description, tags, author_id)
        VALUES ('p1', 'Project One', 'Tag', 'Desc', '[]', 'u1')
      `).run();
    });

    test("adds, edits, and deletes comments with author authorization", () => {
      // 1. Add comment
      db.prepare("INSERT INTO comments (id, project_id, user_id, content) VALUES ('c1', 'p1', 'u2', 'Great work!')").run();
      let comment = db.prepare("SELECT * FROM comments WHERE id = 'c1'").get();
      assert.equal(comment.content, "Great work!");

      // 2. Edit comment by author (u2)
      const updateResult = db.prepare("UPDATE comments SET content = ? WHERE id = ? AND user_id = ?").run(
        "Updated: Truly fantastic work!",
        "c1",
        "u2"
      );
      assert.equal(updateResult.changes, 1);
      comment = db.prepare("SELECT content FROM comments WHERE id = 'c1'").get();
      assert.equal(comment.content, "Updated: Truly fantastic work!");

      // 3. Unauthorized edit attempt by another user (u1)
      const unauthorizedUpdate = db.prepare("UPDATE comments SET content = ? WHERE id = ? AND user_id = ?").run(
        "Hacked content",
        "c1",
        "u1"
      );
      assert.equal(unauthorizedUpdate.changes, 0, "Non-author must not be allowed to update");

      // 4. Delete comment by author
      const deleteResult = db.prepare("DELETE FROM comments WHERE id = ? AND user_id = ?").run("c1", "u2");
      assert.equal(deleteResult.changes, 1);

      const deleted = db.prepare("SELECT * FROM comments WHERE id = 'c1'").get();
      assert.equal(deleted, undefined);
    });

    test("cascades deletion when parent project is deleted", () => {
      db.prepare("INSERT INTO comments (id, project_id, user_id, content) VALUES ('c1', 'p1', 'u2', 'Comment')").run();
      db.prepare("INSERT INTO stars (id, project_id, user_id) VALUES ('s1', 'p1', 'u2')").run();

      // Delete parent project
      db.prepare("DELETE FROM projects WHERE id = 'p1'").run();

      const commentsLeft = db.prepare("SELECT COUNT(*) as count FROM comments WHERE project_id = 'p1'").get().count;
      const starsLeft = db.prepare("SELECT COUNT(*) as count FROM stars WHERE project_id = 'p1'").get().count;

      assert.equal(commentsLeft, 0, "Comments must be cascade deleted");
      assert.equal(starsLeft, 0, "Stars must be cascade deleted");
    });
  });

  describe("4. Creator Profile & Customization", () => {
    test("updates avatar, bio, and social links", () => {
      db.prepare(`
        INSERT INTO users (id, username, name, email, password_hash, role, bio)
        VALUES ('u1', 'creator', 'Creator Name', 'c@test.com', 'h', 'Junior Dev', 'Old Bio')
      `).run();

      const newAvatar = "https://images.unsplash.com/custom-avatar.jpg";
      const newBio = "Senior Design Engineer building futuristic interfaces.";
      const newRole = "Design Systems Lead";
      const newGithub = "https://github.com/creator";
      const newWebsite = "https://creator.design";

      db.prepare(`
        UPDATE users SET 
          avatar_url = ?,
          bio = ?,
          role = ?,
          github_url = ?,
          website_url = ?
        WHERE id = 'u1'
      `).run(newAvatar, newBio, newRole, newGithub, newWebsite);

      const updated = db.prepare("SELECT * FROM users WHERE id = 'u1'").get();
      assert.equal(updated.avatar_url, newAvatar);
      assert.equal(updated.bio, newBio);
      assert.equal(updated.role, newRole);
      assert.equal(updated.github_url, newGithub);
      assert.equal(updated.website_url, newWebsite);
    });

    test("preserves and retrieves accurate user registration date (joined date)", () => {
      const fixedDate = "2025-06-15 10:30:00";
      db.prepare(`
        INSERT INTO users (id, username, name, email, password_hash, created_at)
        VALUES ('u2', 'alex', 'Alex', 'alex@test.com', 'hash', ?)
      `).run(fixedDate);

      const user = db.prepare("SELECT created_at FROM users WHERE id = 'u2'").get();
      assert.ok(user.created_at);
      const parsedDate = new Date(user.created_at);
      assert.ok(!isNaN(parsedDate.getTime()), "created_at must parse into a valid Date object");
      assert.equal(parsedDate.getFullYear(), 2025);
    });
  });

  describe("5. Security, Passwords & Validation", () => {
    test("enforces password confirmation validation logic", () => {
      function validateRegistration(password, confirmPassword) {
        if (!password || password.length < 6) {
          return { error: "Password must be at least 6 characters" };
        }
        if (password !== confirmPassword) {
          return { error: "Passwords do not match" };
        }
        return { success: true };
      }

      assert.deepEqual(validateRegistration("short", "short"), { error: "Password must be at least 6 characters" });
      assert.deepEqual(validateRegistration("securePassword123", "differentPassword"), { error: "Passwords do not match" });
      assert.deepEqual(validateRegistration("securePassword123", "securePassword123"), { success: true });
    });
  });
});
