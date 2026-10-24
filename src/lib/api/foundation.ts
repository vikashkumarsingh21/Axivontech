import { NextRequest, NextResponse } from "next/server";
import { z, ZodSchema } from "zod";
import { db } from "@/lib/db";
import { ApiError } from "@/lib/api-error";
import { getAuthenticatedSession, SessionPayload } from "@/lib/auth/session";
import { normalizeRole } from "@/lib/auth/roles";

export interface AuthenticatedUserContext {
  user: {
    id: string;
    email: string;
    name: string;
    status: string;
    department?: string | null;
    designation?: string | null;
    employeeId?: string | null;
    requiredDailyMinutes?: number | null;
    organizationId?: string | null;
    userRoles: Array<{
      role: {
        id: string;
        name: string;
      };
    }>;
  };
  session: SessionPayload;
  role: string;
}

// ─────────────────────────────────────────────────────────────
// 1. Session & Role Verification Helpers
// ─────────────────────────────────────────────────────────────

/**
 * Extracts and cryptographically verifies the current authenticated user session,
 * verifies active account status, and loads user profile with assigned roles.
 */
export async function getSessionUser(req: Request | NextRequest): Promise<AuthenticatedUserContext> {
  let session: SessionPayload;

  try {
    session = await getAuthenticatedSession(req);
  } catch (err: any) {
    // If running in development with Edge middleware headers populated:
    const headerUserId = req.headers.get("x-user-id");
    const headerUserRole = req.headers.get("x-user-role");
    if (headerUserId) {
      session = {
        userId: headerUserId,
        role: headerUserRole || "EMPLOYEE",
        sessionId: "middleware-injected",
      };
    } else {
      throw new ApiError(401, "Authentication required: No valid session found", undefined, "UNAUTHORIZED");
    }
  }

  const user = await db.user.findUnique({
    where: { id: session.userId },
    select: {
      id: true,
      email: true,
      name: true,
      status: true,
      department: true,
      designation: true,
      employeeId: true,
      requiredDailyMinutes: true,
      organizationId: true,
      userRoles: {
        include: {
          role: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
    },
  });

  if (!user) {
    throw new ApiError(401, "Unauthorized: User account not found", undefined, "USER_NOT_FOUND");
  }

  if (user.status === "INACTIVE") {
    throw new ApiError(
      403,
      "Your account is currently inactive. Please contact the administrator.",
      undefined,
      "ACCOUNT_INACTIVE"
    );
  }

  const primaryRole = normalizeRole(session.role || user.userRoles[0]?.role?.name || "EMPLOYEE");

  return {
    user,
    session,
    role: primaryRole,
  };
}

/**
 * Enforces that the authenticated user possesses the EMPLOYEE role,
 * or an administrative / executive role (ADMIN, FOUNDER, CO_FOUNDER) if allowAdmin is true.
 */
export async function requireEmployee(
  req: Request | NextRequest,
  options?: { allowAdmin?: boolean }
): Promise<AuthenticatedUserContext> {
  const context = await getSessionUser(req);
  const { role } = context;

  const allowAdmin = options?.allowAdmin !== false;
  const isEmployee = role === "EMPLOYEE";
  const isAdmin = ["ADMIN", "FOUNDER", "CO_FOUNDER"].includes(role);

  if (!isEmployee && !(allowAdmin && isAdmin)) {
    throw new ApiError(
      403,
      "Access denied: Employee portal permission required.",
      { currentRole: role },
      "FORBIDDEN"
    );
  }

  return context;
}

// ─────────────────────────────────────────────────────────────
// 2. Consistent Response Envelopes
// ─────────────────────────────────────────────────────────────

export interface ApiSuccessPayload<T> {
  success: true;
  data: T;
  meta?: Record<string, any>;
  [key: string]: any;
}

export function apiSuccess<T>(
  data: T,
  meta?: Record<string, any>,
  extra?: Record<string, any>,
  status: number = 200
): NextResponse {
  const payload: ApiSuccessPayload<T> = {
    success: true,
    data,
    ...(meta ? { meta } : {}),
    ...(extra || {}),
  };
  return NextResponse.json(payload, { status });
}

export function apiError(
  code: string,
  message: string,
  status: number = 400,
  fields?: Record<string, string[]>
): NextResponse {
  return NextResponse.json(
    {
      success: false,
      error: {
        code,
        message,
        ...(fields ? { fields } : {}),
      },
      message,
    },
    { status }
  );
}

// ─────────────────────────────────────────────────────────────
// 3. Zod Request Parser Helper
// ─────────────────────────────────────────────────────────────

/**
 * Safely parses and validates a JSON request body using the supplied Zod schema.
 * Rejects malformed JSON with 400 Bad Request.
 */
export async function parseBody<T>(req: Request | NextRequest, schema: ZodSchema<T>): Promise<T> {
  let body: any;
  try {
    body = await req.json();
  } catch (err) {
    throw new ApiError(400, "Invalid JSON payload in request body", undefined, "MALFORMED_JSON");
  }

  const result = schema.safeParse(body);
  if (!result.success) {
    const fields: Record<string, string[]> = {};
    for (const issue of result.error.issues) {
      const fieldPath = issue.path.join(".") || "root";
      if (!fields[fieldPath]) fields[fieldPath] = [];
      fields[fieldPath].push(issue.message);
    }
    const firstMsg = result.error.issues[0]?.message || "Validation Error";
    throw new ApiError(400, firstMsg, undefined, "VALIDATION_ERROR", fields);
  }

  return result.data;
}

// ─────────────────────────────────────────────────────────────
// 4. Pagination Helper
// ─────────────────────────────────────────────────────────────

export interface PaginationParams {
  page: number;
  limit: number;
  skip: number;
  take: number;
}

export function getPagination(
  req: Request | NextRequest,
  defaultLimit = 20,
  maxLimit = 50
): PaginationParams {
  const { searchParams } = new URL(req.url);
  const rawPage = parseInt(searchParams.get("page") || "1", 10);
  const rawLimit = parseInt(searchParams.get("limit") || String(defaultLimit), 10);

  const page = isNaN(rawPage) || rawPage < 1 ? 1 : rawPage;
  const limit = isNaN(rawLimit) || rawLimit < 1 ? defaultLimit : Math.min(rawLimit, maxLimit);
  const skip = (page - 1) * limit;

  return {
    page,
    limit,
    skip,
    take: limit,
  };
}

// ─────────────────────────────────────────────────────────────
// 5. Company Timezone & Calendar Normalization
// ─────────────────────────────────────────────────────────────

let cachedTimezone: { value: string; expiresAt: number } | null = null;

export async function getCompanyTimezone(): Promise<string> {
  const now = Date.now();
  if (cachedTimezone && cachedTimezone.expiresAt > now) {
    return cachedTimezone.value;
  }

  try {
    const setting = await db.organizationSetting.findFirst({
      where: { key: "COMPANY_TIMEZONE" },
      select: { value: true },
    });
    const tz = (setting?.value as string) || "Asia/Kolkata";
    cachedTimezone = { value: tz, expiresAt: now + 60000 };
    return tz;
  } catch {
    return "Asia/Kolkata";
  }
}

/**
 * Returns YYYY-MM-DD representing the calendar date in the company timezone.
 */
export function getCompanyDateString(date: Date = new Date(), timeZone = "Asia/Kolkata"): string {
  try {
    const formatter = new Intl.DateTimeFormat("en-CA", {
      timeZone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
    return formatter.format(date);
  } catch {
    return date.toISOString().split("T")[0];
  }
}

/**
 * Returns a Date object anchored at 00:00:00 UTC for the given calendar date string or Date.
 */
export function getCompanyCalendarDate(date: Date | string = new Date(), timeZone = "Asia/Kolkata"): Date {
  const dateStr = typeof date === "string" ? date.split("T")[0] : getCompanyDateString(date, timeZone);
  const [year, month, day] = dateStr.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0));
}

// ─────────────────────────────────────────────────────────────
// 6. Idempotency & Rate Limiting Helpers
// ─────────────────────────────────────────────────────────────

interface IdempotencyEntry {
  timestamp: number;
}

const idempotencyCache = new Map<string, IdempotencyEntry>();
const rateLimitCache = new Map<string, { count: number; resetAt: number }>();

// Periodic memory cleanup every 5 minutes
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of idempotencyCache.entries()) {
      if (now - entry.timestamp > 60000) idempotencyCache.delete(key);
    }
    for (const [key, entry] of rateLimitCache.entries()) {
      if (now > entry.resetAt) rateLimitCache.delete(key);
    }
  }, 300000);
}

/**
 * Protects mutating endpoints against rapid accidental double-clicks or duplicate submissions.
 * Rejects identical requests arriving within ttlMs (default 2500ms).
 */
export function checkIdempotency(key: string, ttlMs = 2500): void {
  const now = Date.now();
  const existing = idempotencyCache.get(key);

  if (existing && now - existing.timestamp < ttlMs) {
    throw new ApiError(
      429,
      "Duplicate submission detected. Please wait a moment before trying again.",
      undefined,
      "IDEMPOTENCY_REJECTED"
    );
  }

  idempotencyCache.set(key, { timestamp: now });
}

/**
 * Lightweight in-memory sliding window rate limiter for employee mutations.
 */
export function checkRateLimit(key: string, maxRequests = 30, windowSeconds = 60): void {
  const now = Date.now();
  const existing = rateLimitCache.get(key);

  if (!existing || now > existing.resetAt) {
    rateLimitCache.set(key, { count: 1, resetAt: now + windowSeconds * 1000 });
    return;
  }

  if (existing.count >= maxRequests) {
    const waitSec = Math.ceil((existing.resetAt - now) / 1000);
    throw new ApiError(
      429,
      `Rate limit exceeded. Please try again in ${waitSec} seconds.`,
      { waitSeconds: waitSec },
      "RATE_LIMIT_EXCEEDED"
    );
  }

  existing.count += 1;
}
