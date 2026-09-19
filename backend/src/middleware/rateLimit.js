/**
 * In-memory rate limiting.
 *
 * Deliberately dependency-free and per-process: this site runs as a single pm2
 * instance, so a shared store would be complexity without benefit. If the app
 * is ever scaled to several instances, move the counters to Redis — until then
 * each process holding its own window is the correct behaviour.
 */

const buckets = new Map();

// Drop expired windows so the map cannot grow without bound.
const SWEEP_INTERVAL_MS = 10 * 60 * 1000;
const sweeper = setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of buckets) {
    if (entry.resetAt <= now) buckets.delete(key);
  }
}, SWEEP_INTERVAL_MS);
sweeper.unref?.();

/**
 * The client address as nginx reports it. `trust proxy` is set on the app, so
 * req.ip is already the left-most X-Forwarded-For entry rather than 127.0.0.1.
 */
function clientIp(req) {
  return req.ip || req.socket?.remoteAddress || "unknown";
}

/**
 * @param {object} options
 * @param {number} options.max        attempts allowed per window
 * @param {number} options.windowMs   window length
 * @param {string} options.message    rejection message
 * @param {(req) => string} [options.keyBy]  defaults to the client address
 */
export function rateLimit({ max, windowMs, message, keyBy }) {
  return (req, res, next) => {
    const key = `${req.baseUrl}${req.path}:${keyBy ? keyBy(req) : clientIp(req)}`;
    const now = Date.now();

    let entry = buckets.get(key);
    if (!entry || entry.resetAt <= now) {
      entry = { count: 0, resetAt: now + windowMs };
      buckets.set(key, entry);
    }

    entry.count += 1;

    const remaining = Math.max(0, max - entry.count);
    res.setHeader("RateLimit-Limit", max);
    res.setHeader("RateLimit-Remaining", remaining);
    res.setHeader("RateLimit-Reset", Math.ceil((entry.resetAt - now) / 1000));

    if (entry.count > max) {
      const retryAfter = Math.ceil((entry.resetAt - now) / 1000);
      res.setHeader("Retry-After", retryAfter);
      return res.status(429).json({ error: message, retryAfter });
    }

    return next();
  };
}

/** Forgets the counter for a key — used so a successful login is not penalised. */
export function clearRateLimit(req, keyBy) {
  buckets.delete(`${req.baseUrl}${req.path}:${keyBy ? keyBy(req) : clientIp(req)}`);
}

/** Sign-in: tight. Counts failures per address and per account name. */
export const loginLimiter = rateLimit({
  max: 8,
  windowMs: 15 * 60 * 1000,
  message: "พยายามเข้าสู่ระบบบ่อยเกินไป กรุณารอสักครู่แล้วลองใหม่"
});

/** A second bucket keyed by the account being targeted, to slow down spraying. */
export const loginIdentityLimiter = rateLimit({
  max: 12,
  windowMs: 15 * 60 * 1000,
  message: "บัญชีนี้ถูกพยายามเข้าสู่ระบบบ่อยเกินไป กรุณารอสักครู่",
  keyBy: (req) => String(req.body?.identifier ?? "").trim().toLowerCase() || "anonymous"
});

/** Public forms: generous for a person, useless for a spam script. */
export const formLimiter = rateLimit({
  max: 10,
  windowMs: 60 * 60 * 1000,
  message: "ส่งข้อมูลบ่อยเกินไป กรุณาลองใหม่ในอีกสักครู่"
});

/** Content writes are already behind an admin token; this only bounds accidents. */
export const writeLimiter = rateLimit({
  max: 120,
  windowMs: 60 * 1000,
  message: "บันทึกบ่อยเกินไป กรุณารอสักครู่"
});
