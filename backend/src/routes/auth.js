import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import pool, { SHARED_USERS_DB } from "../config/db.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

/**
 * Looks the account up in this site's `users` table first, then — unless
 * SHARED_USERS_DB is blank — in the Bocusto Luthier database on the same MySQL
 * server, so an existing Luthier admin can sign in here without being copied.
 */
async function findUser(identifier) {
  const sql = "SELECT id, username, email, password, full_name, role FROM ?? WHERE username = ? OR email = ? LIMIT 1";

  const [own] = await pool.query(sql, ["users", identifier, identifier]);
  if (own.length) return { ...own[0], source: "bocusto_guitars" };

  if (!SHARED_USERS_DB) return null;
  try {
    const [shared] = await pool.query(sql, [`${SHARED_USERS_DB}.users`, identifier, identifier]);
    if (shared.length) return { ...shared[0], source: SHARED_USERS_DB };
  } catch (err) {
    // The shared database may not exist on this host — that is not a login failure.
    console.warn(`[auth] shared user lookup in ${SHARED_USERS_DB} failed: ${err.code || err.message}`);
  }
  return null;
}

router.post("/login", async (req, res) => {
  const { identifier, password } = req.body ?? {};

  if (typeof identifier !== "string" || typeof password !== "string" || !identifier || !password) {
    return res.status(400).json({ error: "Username and password are required." });
  }

  try {
    const user = await findUser(identifier.trim());
    // Same response for unknown user and wrong password — do not reveal which.
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: "Incorrect username or password." });
    }
    if (user.role !== "admin") {
      return res.status(403).json({ error: "Administrator access required." });
    }

    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || "24h" }
    );

    res.json({
      token,
      user: { id: user.id, username: user.username, fullName: user.full_name, role: user.role, source: user.source }
    });
  } catch (err) {
    console.error("[auth] login failed:", err);
    res.status(500).json({ error: "Could not sign in right now." });
  }
});

// Lets the admin UI check on load whether a stored token is still good.
router.get("/me", requireAuth, (req, res) => {
  res.json({ user: { id: req.user.id, username: req.user.username, role: req.user.role } });
});

export default router;
