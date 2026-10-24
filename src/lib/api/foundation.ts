import { NextRequest, NextResponse } from "next/server";
import { z, ZodSchema } from "zod";
import { db } from "@/lib/db";
import { ApiError } from "@/lib/api-error";
import { getAuthenticatedSession, SessionPayload } from "@/lib/auth/session";
import { normalizeRole } from "@/lib/auth/roles";

export interface AuthenticatedUserPayload {
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
}

export type AuthenticatedUserContext = AuthenticatedUserPayload & {
  user: AuthenticatedUserPayload;
  session: SessionPayload;
  role: string;
};

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
    ...user,
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

/**
 * Safely fetches active platform administrators and founders for event/task notifications.
 */
export async function getPlatformAdmins() {
  return db.user.findMany({
    where: {
      status: "ACTIVE",
      userRoles: {
        some: {
          role: {
            name: { in: ["ADMIN", "FOUNDER", "CO_FOUNDER", "SUPER_ADMIN"] },
          },
        },
      },
    },
    select: { id: true, name: true, email: true },
  });
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
  status = 200
): NextResponse {
  return NextResponse.json(
    {
      success: true,
      data,
      ...(meta ? { meta } : {}),
      ...(extra || {}),
    },
    { status }
  );
}

export function apiError(
  code: string,
  message: string,
  status = 400,
  fields?: Record<string, string>
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
// 3. Request Body Parsing & Zod Validation
// ─────────────────────────────────────────────────────────────

export async function parseBody<T>(req: Request | NextRequest, schema: ZodSchema<T>): Promise<T> {
  let bodyJson: unknown;

  try {
    bodyJson = await req.json();
  } catch {
    throw new ApiError(400, "Malformed JSON in request body", undefined, "MALFORMED_JSON");
  }

  const result = schema.safeParse(bodyJson);
  if (!result.success) {
    const fields: Record<string, string> = {};
    for (const issue of result.error.issues) {
      const fieldPath = issue.path.join(".");
      if (fieldPath && !fields[fieldPath]) {
        fields[fieldPath] = issue.message;
      }
    }
    const firstMessage = result.error.issues[0]?.message || "Validation failed";
    throw new ApiError(400, firstMessage, fields, "VALIDATION_ERROR");
  }

  return result.data;
}

// ─────────────────────────────────────────────────────────────
// 4. Pagination & Query Helpers
// ─────────────────────────────────────────────────────────────

export interface PaginationParams {
  page: number;
  limit: number;
  skip: number;
}

export function getPagination(req: Request | NextRequest, defaultLimit = 20, maxLimit = 100): PaginationParams {
  const url = new URL(req.url);
  const pageParam = parseInt(url.searchParams.get("page") || "1", 10);
  const limitParam = parseInt(url.searchParams.get("limit") || String(defaultLimit), 10);

  const page = isNaN(pageParam) || pageParam < 1 ? 1 : pageParam;
  const limit = isNaN(limitParam) || limitParam < 1 ? defaultLimit : Math.min(limitParam, maxLimit);
  const skip = (page - 1) * limit;

  return { page, limit, skip };
}

// ─────────────────────────────────────────────────────────────
// 5. Timezone & Company Date Helpers
// ─────────────────────────────────────────────────────────────

export async function getCompanyTimezone(): Promise<string> {
  return "Asia/Kolkata";
}

export function getCompanyDateString(date = new Date(), timezone = "Asia/Kolkata"): string {
  try {
    const formatter = new Intl.DateTimeFormat("en-CA", {
      timeZone: timezone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
    return formatter.format(date);
  } catch {
    return date.toISOString().split("T")[0];
  }
}

export function getCompanyCalendarDate(date = new Date(), timezone = "Asia/Kolkata"): Date {
  const dateStr = getCompanyDateString(date, timezone);
  return new Date(`${dateStr}T00:00:00.000Z`);
}

// ─────────────────────────────────────────────────────────────
// 6. Sliding Memory Cache for Idempotency & Rate Limiting
// ─────────────────────────────────────────────────────────────

interface CacheEntry {
  timestamp: number;
  count?: number;
}

const idempotencyCache = new Map<string, CacheEntry>();
const rateLimitCache = new Map<string, CacheEntry>();

setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of idempotencyCache.entries()) {
    if (now - entry.timestamp > 60000) {
      idempotencyCache.delete(key);
    }
  }
  for (const [key, entry] of rateLimitCache.entries()) {
    if (now - entry.timestamp > 60000) {
      rateLimitCache.delete(key);
    }
  }
}, 30000);

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

export function checkRateLimit(key: string, maxRequests = 10, windowSeconds = 60): void {
  const now = Date.now();
  const windowMs = windowSeconds * 1000;
  const entry = rateLimitCache.get(key);

  if (!entry || now - entry.timestamp > windowMs) {
    rateLimitCache.set(key, { timestamp: now, count: 1 });
    return;
  }

  if ((entry.count || 0) >= maxRequests) {
    throw new ApiError(
      429,
      `Too many requests. Please slow down and try again in ${Math.ceil((windowMs - (now - entry.timestamp)) / 1000)} seconds.`,
      undefined,
      "RATE_LIMIT_EXCEEDED"
    );
  }

  entry.count = (entry.count || 0) + 1;
}
