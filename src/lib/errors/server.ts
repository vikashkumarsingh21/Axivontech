import { NextResponse } from "next/server";
import { ZodError } from "zod";

export interface StandardApiErrorPayload {
  success: false;
  error: {
    code: string;
    message: string;
    fields?: Record<string, string[]>;
  };
  message: string;
  details?: unknown;
}

export interface CreateErrorResponseOptions {
  status: number;
  code: string;
  message: string;
  fields?: Record<string, string[]>;
  details?: unknown;
  retryAfter?: number;
}

/**
 * Creates a standardized API error response.
 * Always conforms to: { success: false, error: { code, message, fields? }, message }
 * Preserves top-level `message` for backward compatibility with legacy consumers.
 */
export function createErrorResponse(options: CreateErrorResponseOptions): NextResponse<StandardApiErrorPayload> {
  const { status, code, message, fields, details, retryAfter } = options;

  const payload: StandardApiErrorPayload = {
    success: false,
    error: {
      code,
      message,
      ...(fields && Object.keys(fields).length > 0 ? { fields } : {}),
    },
    message,
    ...(details && process.env.NODE_ENV !== "production" ? { details } : {}),
  };

  const headers: Record<string, string> = {};
  if (retryAfter !== undefined && retryAfter > 0) {
    headers["Retry-After"] = String(retryAfter);
  }

  return NextResponse.json(payload, {
    status,
    headers: Object.keys(headers).length > 0 ? headers : undefined,
  });
}

/**
 * Custom application error class with status code and optional machine code / fields.
 */
export class ServerApiError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public details?: unknown,
    public code: string = "API_ERROR",
    public fields?: Record<string, string[]>
  ) {
    super(message);
    this.name = "ServerApiError";
  }
}

/**
 * Central server-side error handler that maps exceptions to standard HTTP responses.
 * Never leaks Prisma stack traces, database schema details, or system credentials.
 */
export function handleServerApiError(error: unknown): NextResponse {
  // 1. Zod Validation Errors
  if (error instanceof ZodError) {
    const fields: Record<string, string[]> = {};
    for (const issue of error.issues) {
      const fieldPath = issue.path.join(".") || "root";
      if (!fields[fieldPath]) fields[fieldPath] = [];
      fields[fieldPath].push(issue.message);
    }
    const firstMessage = error.issues[0]?.message || "Validation Error";

    return createErrorResponse({
      status: 400,
      code: "VALIDATION_ERROR",
      message: firstMessage,
      fields,
      details: process.env.NODE_ENV !== "production" ? error.format() : undefined,
    });
  }

  // 2. Custom Application ApiError
  if (error && typeof error === "object" && "statusCode" in error && typeof (error as any).statusCode === "number") {
    const apiErr = error as any;
    return createErrorResponse({
      status: apiErr.statusCode || 500,
      code: apiErr.code || "API_ERROR",
      message: apiErr.message || "An unexpected error occurred.",
      fields: apiErr.fields,
      details: apiErr.details,
    });
  }

  // 3. Prisma Known Request Errors
  if (typeof error === "object" && error !== null && "code" in error) {
    const prismaCode = (error as { code: string }).code;
    const meta = (error as { meta?: any }).meta;

    switch (prismaCode) {
      case "P2002": {
        const target = meta?.target ? (Array.isArray(meta.target) ? meta.target.join(", ") : String(meta.target)) : "record";
        const message = `A duplicate record already exists with the same ${target}.`;
        return createErrorResponse({
          status: 409,
          code: "DUPLICATE_RECORD",
          message,
          fields: meta?.target ? { [String(meta.target)]: [message] } : undefined,
        });
      }
      case "P2025": {
        const message = "The requested resource was not found or access is denied.";
        return createErrorResponse({
          status: 404,
          code: "NOT_FOUND",
          message,
        });
      }
      case "P2003": {
        const message = "Operation failed due to a relational dependency constraint.";
        return createErrorResponse({
          status: 400,
          code: "FOREIGN_KEY_CONSTRAINT",
          message,
        });
      }
      case "P2021":
      case "P2022": {
        console.error("[CRITICAL DB SCHEMA ERROR]", error);
        const message = process.env.NODE_ENV === "production"
          ? "Database service is temporarily unavailable."
          : `Database schema error: table or column unavailable (${prismaCode}).`;
        return createErrorResponse({
          status: 500,
          code: "SCHEMA_ERROR",
          message,
        });
      }
    }
  }

  // 4. Generic Unknown Internal Error (Never leak stack traces in production)
  console.error("[CRITICAL SERVER UNHANDLED ERROR]:", error);
  const fallbackMessage =
    process.env.NODE_ENV === "development" && error instanceof Error
      ? error.message
      : "Internal Server Error";

  return createErrorResponse({
    status: 500,
    code: "INTERNAL_SERVER_ERROR",
    message: fallbackMessage,
  });
}
