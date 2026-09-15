import jwt from "jsonwebtoken";

/**
 * Same contract as the Bocusto Luthier backend: a Bearer token signed with the
 * shared JWT_SECRET, carrying { id, username, role }. Tokens issued by either
 * site verify here, which is what lets one login open both admin panels.
 */
function readBearerToken(req) {
  const header = req.headers.authorization || "";
  if (!header.startsWith("Bearer ")) return null;
  return header.slice(7).trim() || null;
}

export function requireAuth(req, res, next) {
  const token = readBearerToken(req);
  if (!token) {
    return res.status(401).json({ error: "Authentication required." });
  }
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    return next();
  } catch {
    return res.status(401).json({ error: "Session is invalid or has expired." });
  }
}

export function requireAdmin(req, res, next) {
  requireAuth(req, res, () => {
    if (req.user.role !== "admin") {
      return res.status(403).json({ error: "Administrator access required." });
    }
    return next();
  });
}
