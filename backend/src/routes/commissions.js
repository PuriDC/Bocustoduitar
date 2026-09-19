import { Router } from "express";
import pool from "../config/db.js";
import { requireAdmin } from "../middleware/auth.js";
import { formLimiter } from "../middleware/rateLimit.js";

const router = Router();
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

router.post("/", formLimiter, async (req, res) => {
  const { name, email, model, message } = req.body ?? {};

  if (typeof name !== "string" || name.trim().length < 2) {
    return res.status(400).json({ error: "Your name is required." });
  }
  if (typeof email !== "string" || !EMAIL_RE.test(email)) {
    return res.status(400).json({ error: "A valid email address is required." });
  }

  try {
    await pool.query("INSERT INTO commissions (name, email, model, message) VALUES (?, ?, ?, ?)", [
      name.trim(),
      email.toLowerCase(),
      typeof model === "string" ? model : null,
      typeof message === "string" ? message.trim() : ""
    ]);
    res.status(201).json({ message: "Commission request received. The studio will reply within two business days." });
  } catch (err) {
    console.error("[commissions] insert failed:", err);
    res.status(500).json({ error: "Could not submit your request." });
  }
});

router.get("/", requireAdmin, async (_req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM commissions ORDER BY created_at DESC");
    res.json(rows);
  } catch (err) {
    console.error("[commissions] read failed:", err);
    res.status(500).json({ error: "Could not load commission requests." });
  }
});

export default router;
