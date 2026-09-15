import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { isReachable, sharedUsersStatus, SHARED_USERS_DB } from "./config/db.js";
import newsletterRouter from "./routes/newsletter.js";
import commissionsRouter from "./routes/commissions.js";
import contactRouter from "./routes/contact.js";
import authRouter from "./routes/auth.js";
import contentRouter from "./routes/content.js";

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

app.use(cors());
app.use(express.json({ limit: "1mb" }));

app.get("/api/health", async (_req, res) => {
  res.json({
    status: "ok",
    database: (await isReachable()) ? "connected" : "unreachable",
    // Reports only reachability and a count — never account details.
    sharedUsers: await sharedUsersStatus()
  });
});

app.use("/api/auth", authRouter);
app.use("/api/content", contentRouter);
app.use("/api/newsletter", newsletterRouter);
app.use("/api/commissions", commissionsRouter);
app.use("/api/contact", contactRouter);

app.listen(PORT, async () => {
  console.log(`Bocusto Guitars API listening on http://localhost:${PORT}`);
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
