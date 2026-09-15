import mysql from "mysql2/promise";
import dotenv from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "bocusto_guitars",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

/**
 * Database that also holds admin accounts (the Bocusto Luthier site). Logins
 * fall back to it so one account opens both admin panels. Set to an empty
 * string to keep this site's accounts entirely separate.
 */
export const SHARED_USERS_DB =
  process.env.SHARED_USERS_DB === undefined ? "bocusto_luthier" : process.env.SHARED_USERS_DB.trim();

/** True when the pool can reach MySQL — used to degrade gracefully, not to gate startup. */
export async function isReachable() {
  try {
    const conn = await pool.getConnection();
    conn.release();
    return true;
  } catch {
    return false;
  }
}

/**
 * Whether this connection can actually read the shared admin accounts.
 *
 * Worth reporting separately: on a server where the app connects as a
 * least-privilege MySQL user, the cross-database SELECT is the piece most
 * likely to be missing, and without this it surfaces only as "wrong password".
 */
export async function sharedUsersStatus() {
  if (!SHARED_USERS_DB) return { status: "disabled" };
  try {
    const [rows] = await pool.query("SELECT COUNT(*) AS n FROM ??  WHERE role = 'admin'", [
      `${SHARED_USERS_DB}.users`
    ]);
    return { status: "ok", database: SHARED_USERS_DB, admins: rows[0].n };
  } catch (err) {
    return { status: "unreachable", database: SHARED_USERS_DB, reason: err.code || err.message };
  }
}

export default pool;
