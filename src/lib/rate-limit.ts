/**
 * In-memory sliding window rate limiter helper for production security
 */
export interface RateLimitOptions {
  windowMs: number;
  maxRequests: number;
}

interface RateLimitRecord {
  timestamps: number[];
}

const rateLimitStore = new Map<string, RateLimitRecord>();

// Garbage collection for stale keys every 10 minutes
const cleanupTimer = setInterval(() => {
  const now = Date.now();
  for (const [key, record] of rateLimitStore.entries()) {
    record.timestamps = record.timestamps.filter((t) => now - t < 3600000);
    if (record.timestamps.length === 0) {
      rateLimitStore.delete(key);
    }
  }
}, 600000);

if (typeof cleanupTimer.unref === "function") {
  cleanupTimer.unref();
}

export function isRateLimited(key: string, options: RateLimitOptions): { limited: boolean; remaining: number; resetMs: number } {
  const now = Date.now();
  const { windowMs, maxRequests } = options;

  let record = rateLimitStore.get(key);
  if (!record) {
    record = { timestamps: [] };
    rateLimitStore.set(key, record);
  }

  // Filter timestamps within the current sliding window
  record.timestamps = record.timestamps.filter((t) => now - t < windowMs);

  if (record.timestamps.length >= maxRequests) {
    const oldestTimestamp = record.timestamps[0];
    const resetMs = Math.max(0, windowMs - (now - oldestTimestamp));
    return {
      limited: true,
      remaining: 0,
      resetMs,
    };
  }

  record.timestamps.push(now);
  const remaining = Math.max(0, maxRequests - record.timestamps.length);

  return {
    limited: false,
    remaining,
    resetMs: windowMs,
  };
}

export const RATE_LIMIT_PRESETS = {
  AUTH_LOGIN: { windowMs: 60 * 1000, maxRequests: 5 },          // 5 attempts per min
  PUBLIC_LEADS: { windowMs: 15 * 60 * 1000, maxRequests: 10 },    // 10 leads per 15 min
  RESUME_UPLOAD: { windowMs: 15 * 60 * 1000, maxRequests: 5 },    // 5 uploads per 15 min
  SENSITIVE_API: { windowMs: 60 * 1000, maxRequests: 30 },        // 30 req per min
  GENERAL_API: { windowMs: 60 * 1000, maxRequests: 100 },         // 100 req per min
  EMAIL_CHANGE_REQUEST: { windowMs: 15 * 60 * 1000, maxRequests: 3 }, // 3 requests per 15 min
  EMAIL_CHANGE_VERIFY: { windowMs: 15 * 60 * 1000, maxRequests: 10 }, // 10 attempts per 15 min
  PROFILE_UPDATE: { windowMs: 60 * 1000, maxRequests: 30 },       // 30 req per min
};

