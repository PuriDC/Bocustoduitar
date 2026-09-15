/**
 * Creates or updates an administrator in this site's own `users` table.
 *
 *   node src/scripts/createAdmin.js <username> <email> <password> ["Full Name"]
 *
 * Existing Bocusto Luthier admins do not need this — they can already sign in
 * through the shared-user fallback (see SHARED_USERS_DB).
 */
import bcrypt from "bcryptjs";
import pool from "../config/db.js";

const [username, email, password, fullName] = process.argv.slice(2);

if (!username || !email || !password) {
  console.error('Usage: node src/scripts/createAdmin.js <username> <email> <password> ["Full Name"]');
  process.exit(1);
}
if (password.length < 8) {
  console.error("Password must be at least 8 characters.");
  process.exit(1);
}

const hash = await bcrypt.hash(password, 10);

try {
  await pool.query(
    `INSERT INTO users (username, email, password, full_name, role)
     VALUES (?, ?, ?, ?, 'admin')
     ON DUPLICATE KEY UPDATE password = VALUES(password), full_name = VALUES(full_name), role = 'admin'`,
    [username, email, hash, fullName || username]
  );
  console.log(`Administrator "${username}" is ready. Sign in at /admin.`);
} catch (err) {
  console.error("Could not create the administrator:", err.message);
  process.exitCode = 1;
} finally {
  await pool.end();
}
