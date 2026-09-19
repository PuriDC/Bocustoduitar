import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { isReachable, sharedUsersStatus, SHARED_USERS_DB } from "./config/db.js";
import { requireAdmin } from "./middleware/auth.js";
import newsletterRouter from "./routes/newsletter.js";
import commissionsRouter from "./routes/commissions.js";
import contactRouter from "./routes/contact.js";
import authRouter from "./routes/auth.js";
import contentRouter from "./routes/content.js";
import uploadsRouter from "./routes/uploads.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "../.env") });

if (!process.env.JWT_SECRET) {
  console.error(
    "JWT_SECRET is not set. Anyone could forge an administrator token without it.\n" +
      'Generate one with: node -e "console.log(require(\'crypto\').randomBytes(48).toString(\'base64url\'))"'
  );
  process.exit(1);
}

const app = express();
const PORT = process.env.PORT || 4000;

/**
 * Loopback by default: nginx is the only thing that should reach this process,
 * and binding 0.0.0.0 published the API — and its plaintext login endpoint — on
 * the server's public address, bypassing TLS and every header nginx adds.
 * Containers need 0.0.0.0 to be reachable through a port mapping, so the
 * compose file sets HOST explicitly.
 */
const HOST = process.env.HOST || "127.0.0.1";

// One proxy hop (nginx). Without this every request looks like it came from
// 127.0.0.1 and the rate limiters would share a single bucket for the world.
app.set("trust proxy", 1);
app.disable("x-powered-by");

/**
 * The site is served from the same origin as the API, so cross-origin requests
 * are not part of normal operation. An open `cors()` let any page on the
 * internet POST to the public forms; the allowlist is empty unless
 * ALLOWED_ORIGINS says otherwise.
 */
const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS ?? "")
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      // No Origin header: same-origin navigation, curl, server-to-server.
      if (!origin) return callback(null, true);
      if (ALLOWED_ORIGINS.includes(origin)) return callback(null, true);
      return callback(null, false);
    },
    credentials: false
  })
);

app.use(express.json({ limit: "1mb" }));

/**
 * Public probe stays deliberately boring. The detailed version reported
 * database reachability and the exact number of administrator accounts to
 * anyone who asked, and ran two queries per request while doing it.
 */
app.get("/api/health", (_req, res) => res.json({ status: "ok" }));

app.get("/api/health/details", requireAdmin, async (_req, res) => {
  res.json({
    status: "ok",
    database: (await isReachable()) ? "connected" : "unreachable",
    sharedUsers: await sharedUsersStatus()
  });
});

/**
 * In production nginx serves this directory directly and requests never reach
 * Node; this keeps uploaded images working in development, where Vite proxies
 * /uploads to the API.
 */
app.use(
  "/uploads",
  express.static(process.env.UPLOAD_DIR || path.resolve(__dirname, "../uploads"), {
    maxAge: "1y",
    immutable: true,
    index: false,
    dotfiles: "deny"
  })
);

app.use("/api/auth", authRouter);
app.use("/api/content", contentRouter);
app.use("/api/uploads", uploadsRouter);
app.use("/api/newsletter", newsletterRouter);
app.use("/api/commissions", commissionsRouter);
app.use("/api/contact", contactRouter);

app.use("/api", (_req, res) => res.status(404).json({ error: "Not found." }));

// Last resort: never let a stack trace reach the client.
app.use((err, _req, res, _next) => {
  console.error("[server] unhandled:", err);
  res.status(500).json({ error: "เกิดข้อผิดพลาดภายในระบบ" });
});

app.listen(PORT, HOST, async () => {
  console.log(`Bocusto Guitars API listening on http://${HOST}:${PORT}`);
  if (await isReachable()) {
    console.log(`Database ${process.env.DB_NAME || "bocusto_guitars"} connected.`);
    if (SHARED_USERS_DB) {
      const shared = await sharedUsersStatus();
      if (shared.status === "ok") {
        console.log(`Shared admin logins: ${shared.admins} administrator(s) readable from ${SHARED_USERS_DB}.users`);
      } else {
        console.warn(
          `Shared admin logins DISABLED — cannot read ${SHARED_USERS_DB}.users (${shared.reason}).\n` +
            `  Grant the database user access, e.g.  GRANT SELECT ON ${SHARED_USERS_DB}.users TO '<db_user>'@'localhost';`
        );
      }
    }
  } else {
    console.warn("Database unreachable — the site will serve default content and forms will fail.");
  }
});
