import { Router } from "express";
import pool from "../config/db.js";
import { requireAdmin } from "../middleware/auth.js";
import { formLimiter } from "../middleware/rateLimit.js";

const router = Router();
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

router.post("/subscribe", formLimiter, async (req, res) => {
  const { email } = req.body ?? {};

  if (typeof email !== "string" || !EMAIL_RE.test(email)) {
    return res.status(400).json({ error: "A valid email address is required." });
  }

  try {
    await pool.query("INSERT IGNORE INTO subscribers (email) VALUES (?)", [email.toLowerCase()]);
    res.status(201).json({ message: "Subscribed to the Inner Circle." });
  } catch (err) {
    console.error("[newsletter] insert failed:", err);
    res.status(500).json({ error: "Could not complete your subscription." });
  }
});

router.get("/", requireAdmin, async (_req, res) => {
  try {
    const [rows] = await pool.query("SELECT id, email, created_at FROM subscribers ORDER BY created_at DESC");
    res.json(rows);
  } catch (err) {
    console.error("[newsletter] read failed:", err);
    res.status(500).json({ error: "Could not load subscribers." });
  }
});

export default router;
