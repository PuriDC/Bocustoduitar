import { Router } from "express";
import pool from "../config/db.js";
import { requireAdmin } from "../middleware/auth.js";
import { formLimiter } from "../middleware/rateLimit.js";

const router = Router();
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

router.post("/", formLimiter, async (req, res) => {
  const { name, email, subject, message } = req.body ?? {};

  if (typeof name !== "string" || name.trim().length < 2) {
    return res.status(400).json({ error: "Your name is required." });
  }
  if (typeof email !== "string" || !EMAIL_RE.test(email)) {
    return res.status(400).json({ error: "A valid email address is required." });
  }
  if (typeof message !== "string" || message.trim().length < 5) {
    return res.status(400).json({ error: "Please tell us a little about your inquiry." });
  }

  try {
    await pool.query("INSERT INTO inquiries (name, email, subject, message) VALUES (?, ?, ?, ?)", [
      name.trim(),
      email.toLowerCase(),
      typeof subject === "string" ? subject : null,
      message.trim()
    ]);
    res.status(201).json({ message: "Inquiry sent. Our concierge will be in touch shortly." });
  } catch (err) {
    console.error("[contact] insert failed:", err);
    res.status(500).json({ error: "Could not send your inquiry." });
  }
});

router.get("/", requireAdmin, async (_req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM inquiries ORDER BY created_at DESC");
    res.json(rows);
  } catch (err) {
    console.error("[contact] read failed:", err);
    res.status(500).json({ error: "Could not load inquiries." });
  }
});

export default router;
