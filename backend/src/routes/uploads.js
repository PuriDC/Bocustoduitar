import { Router } from "express";
import express from "express";
import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { requireAdmin } from "../middleware/auth.js";
import { writeLimiter } from "../middleware/rateLimit.js";

const router = Router();
const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Where uploaded images land. nginx serves this directory at /uploads/, so the
 * value stored in page_config is a short URL rather than the image itself.
 *
 * Embedding images as data URLs was the original approach and it was wrong
 * twice over: the 20,000 character cap rejected anything above roughly 15 KB,
 * and every visitor would have downloaded every image inline with the content
 * JSON on first paint.
 */
const UPLOAD_DIR = process.env.UPLOAD_DIR || path.resolve(__dirname, "../../uploads");
const MAX_BYTES = 5 * 1024 * 1024;

/** Magic bytes, because a Content-Type header is whatever the client claims. */
const SIGNATURES = [
  { ext: "jpg", type: "image/jpeg", test: (b) => b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff },
  { ext: "png", type: "image/png", test: (b) => b.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) },
  { ext: "gif", type: "image/gif", test: (b) => b.subarray(0, 6).toString("ascii").startsWith("GIF8") },
  {
    ext: "webp",
    type: "image/webp",
    test: (b) => b.subarray(0, 4).toString("ascii") === "RIFF" && b.subarray(8, 12).toString("ascii") === "WEBP"
  }
];

/**
 * SVG is refused on purpose: it is a script-bearing document, and one served
 * from our own origin would be a stored-XSS vector against the admin session.
 */
function identify(buffer) {
  if (buffer.length < 12) return null;
  return SIGNATURES.find((sig) => sig.test(buffer)) ?? null;
}

router.post(
  "/",
  requireAdmin,
  writeLimiter,
  express.raw({ type: ["image/*", "application/octet-stream"], limit: MAX_BYTES }),
  async (req, res) => {
    const body = req.body;
    if (!Buffer.isBuffer(body) || body.length === 0) {
      return res.status(400).json({ error: "ไม่พบไฟล์รูปภาพในคำขอ" });
    }

    const kind = identify(body);
    if (!kind) {
      return res.status(415).json({ error: "รองรับเฉพาะไฟล์ JPG, PNG, GIF และ WebP เท่านั้น" });
    }

    try {
      await fs.mkdir(UPLOAD_DIR, { recursive: true });

      // Content-addressed: re-uploading the same picture reuses one file.
      const digest = crypto.createHash("sha256").update(body).digest("hex").slice(0, 32);
      const filename = `${digest}.${kind.ext}`;
      const target = path.join(UPLOAD_DIR, filename);

      await fs.writeFile(target, body, { flag: "wx" }).catch((err) => {
        if (err.code !== "EEXIST") throw err;
      });

      res.status(201).json({ url: `/uploads/${filename}`, bytes: body.length, type: kind.type });
    } catch (err) {
      console.error("[uploads] write failed:", err);
      res.status(500).json({ error: "บันทึกไฟล์ไม่สำเร็จ" });
    }
  }
);

// express.raw rejects an oversized body with a 413 that would otherwise reach
// the client as HTML from the default error handler.
router.use((err, _req, res, _next) => {
  if (err?.type === "entity.too.large") {
    return res.status(413).json({ error: `ไฟล์ใหญ่เกินไป (สูงสุด ${MAX_BYTES / 1024 / 1024} MB)` });
  }
  console.error("[uploads] error:", err);
  res.status(500).json({ error: "อัปโหลดไม่สำเร็จ" });
});

export default router;
