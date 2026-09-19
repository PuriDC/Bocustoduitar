/**
 * Reports whether the shared administrator accounts are readable.
 *
 *   node src/scripts/checkShared.js
 *
 * The deploy scripts used to read this from `GET /api/health`, but that probe
 * is public and no longer says anything beyond {"status":"ok"} — the detail
 * moved behind an administrator token so a passer-by could not count the
 * accounts. Run on the server, where the database credentials are already to
 * hand, no token is needed.
 *
 * Exit code 0 when the accounts are readable, 1 when they are not, so a script
 * can branch on it.
 */
import pool, { sharedUsersStatus, SHARED_USERS_DB } from "../config/db.js";

try {
  if (!SHARED_USERS_DB) {
    console.log("shared logins are switched off (SHARED_USERS_DB is empty)");
    process.exit(0);
  }

  const status = await sharedUsersStatus();
  if (status.status === "ok") {
    console.log(`${status.admins} administrator(s) readable from ${status.database}.users`);
    process.exit(0);
  }

  console.error(`cannot read ${status.database}.users (${status.reason})`);
  console.error(`  GRANT SELECT ON ${status.database}.users TO '<db_user>'@'localhost'; FLUSH PRIVILEGES;`);
  process.exit(1);
} finally {
  await pool.end();
}
