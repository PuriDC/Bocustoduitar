import { Router } from "express";
import pool from "../config/db.js";
import { requireAdmin } from "../middleware/auth.js";
import { writeLimiter } from "../middleware/rateLimit.js";

const router = Router();

const KEY_RE = /^[a-z0-9]+(?:\.[a-z0-9_-]+)+$/i;
const MAX_VALUE_LENGTH = 20000;

/**
 * Segments that address an object's own machinery rather than content.
 * Nothing can be written through them today โ€” the frontend only overwrites
 * leaves that are already strings โ€” but keeping them out of the database means
 * that guard is not the only thing standing between a stored key and
 * prototype pollution.
 */
const FORBIDDEN_SEGMENTS = new Set(["__proto__", "prototype", "constructor"]);

function isSafeKey(key) {
  if (!KEY_RE.test(key)) return false;
  return key.split(".").every((segment) => !FORBIDDEN_SEGMENTS.has(segment.toLowerCase()));
}

/**
 * Only overrides live in the database. Keys the admin has never touched are
 * absent, and the frontend falls back to its shipped defaults โ€” so the site
 * renders correctly against an empty table or an unreachable database.
 */
router.get("/", async (_req, res) => {
  try {
    const [rows] = await pool.query("SELECT `key`, `value` FROM page_config");
    const overrides = {};
    for (const row of rows) overrides[row.key] = row.value;
    res.json(overrides);
  } catch (err) {
    console.warn("[content] read failed, serving defaults:", err.code || err.message);
    res.json({});
  }
});

router.put("/", requireAdmin, writeLimiter, async (req, res) => {
  const updates = req.body;
  if (!updates || typeof updates !== "object" || Array.isArray(updates)) {
    return res.status(400).json({ error: "Expected an object of key/value pairs." });
  }

  const entries = Object.entries(updates);
  if (!entries.length) {
    return res.status(400).json({ error: "No changes were submitted." });
  }

  for (const [key, value] of entries) {
    if (!isSafeKey(key)) {
      return res.status(400).json({ error: `Invalid content key: ${key}` });
    }
    if (typeof value !== "string") {
      return res.status(400).json({ error: `Value for ${key} must be a string.` });
    }
    if (value.length > MAX_VALUE_LENGTH) {
      return res.status(400).json({ error: `Value for ${key} is too long.` });
    }
  }

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    for (const [key, value] of entries) {
      await conn.query(
        `INSERT INTO page_config (\`key\`, \`page\`, \`value\`, \`updated_by\`)
         VALUES (?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE \`value\` = VALUES(\`value\`), \`updated_by\` = VALUES(\`updated_by\`)`,
        [key, key.split(".")[0], value, req.user.username ?? null]
      );
    }
    await conn.commit();
    res.json({ message: `Saved ${entries.length} change${entries.length === 1 ? "" : "s"}.`, saved: entries.length });
  } catch (err) {
    await conn.rollback();
    console.error("[content] write failed:", err);
    res.status(500).json({ error: "Could not save your changes." });
  } finally {
    conn.release();
  }
});

/** Drops an override so the field falls back to its shipped default. */
router.delete("/:key", requireAdmin, writeLimiter, async (req, res) => {
  const { key } = req.params;
  if (!isSafeKey(key)) {
    return res.status(400).json({ error: "Invalid content key." });
  }
  try {
    const [result] = await pool.query("DELETE FROM page_config WHERE `key` = ?", [key]);
    res.json({ message: result.affectedRows ? "Reset to default." : "Already at default." });
  } catch (err) {
    console.error("[content] delete failed:", err);
    res.status(500).json({ error: "Could not reset that field." });
  }
});

export default router;
