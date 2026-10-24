import { NextResponse } from "next/server";
import { ZodError } from "zod";

export class ApiError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public details?: unknown,
    public code: string = "API_ERROR",
    public fields?: Record<string, string[]>
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export function handleApiError(error: unknown) {
  console.error("API Error:", error);

  // 1. Zod Validation Errors
  if (error instanceof ZodError) {
    const fields: Record<string, string[]> = {};
    for (const issue of error.issues) {
      const fieldPath = issue.path.join(".") || "root";
      if (!fields[fieldPath]) fields[fieldPath] = [];
      fields[fieldPath].push(issue.message);
    }
    const firstMessage = error.issues[0]?.message || "Validation Error";

    return NextResponse.json(
      {
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: firstMessage,
          fields,
        },
        message: firstMessage,
        details: error.format(),
      },
      { status: 400 }
    );
  }

  // 2. Custom Application ApiError
  if (error instanceof ApiError) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: error.code || "API_ERROR",
          message: error.message,
          ...(error.fields ? { fields: error.fields } : {}),
        },
        message: error.message,
        details: error.details,
      },
      { status: error.statusCode }
    );
  }

  // 3. Prisma Known Request Errors
  if (typeof error === "object" && error !== null && "code" in error) {
    const prismaCode = (error as { code: string }).code;
    const meta = (error as { meta?: any }).meta;

    switch (prismaCode) {
      case "P2002": {
        const target = meta?.target ? (Array.isArray(meta.target) ? meta.target.join(", ") : String(meta.target)) : "field";
        const message = `A duplicate record already exists with the same ${target}.`;
        return NextResponse.json(
          {
            success: false,
            error: {
              code: "DUPLICATE_RECORD",
              message,
              fields: meta?.target ? { [String(meta.target)]: [message] } : undefined,
            },
            message,
          },
          { status: 409 }
        );
      }
      case "P2025": {
        const message = meta?.cause ? String(meta.cause) : "Requested resource not found or access denied.";
        return NextResponse.json(
          {
            success: false,
            error: {
              code: "NOT_FOUND",
              message,
            },
            message,
          },
          { status: 404 }
        );
      }
      case "P2021": {
        console.error("[CRITICAL DB] Table does not exist in schema:", meta?.table);
        const message = "Database schema error: required table is unavailable. Please run pending migrations.";
        return NextResponse.json(
          {
            success: false,
            error: {
              code: "SCHEMA_ERROR",
              message,
            },
            message,
          },
          { status: 500 }
        );
      }
      case "P2022": {
        console.error("[CRITICAL DB] Column does not exist in schema:", meta?.column);
        const message = "Database schema error: required column is unavailable. Please run pending migrations.";
        return NextResponse.json(
          {
            success: false,
            error: {
              code: "SCHEMA_ERROR",
              message,
            },
            message,
          },
          { status: 500 }
        );
      }
      case "P2003": {
        const message = "Operation failed due to a relational dependency constraint.";
        return NextResponse.json(
          {
            success: false,
            error: {
              code: "FOREIGN_KEY_CONSTRAINT",
              message,
            },
            message,
          },
          { status: 400 }
        );
      }
    }
  }

  // 4. Generic Unknown Internal Error (Never leak raw stacks or database credentials)
  const fallbackMessage =
    process.env.NODE_ENV === "development" && error instanceof Error
      ? error.message
      : "Internal Server Error";

  return NextResponse.json(
    {
      success: false,
      error: {
        code: "INTERNAL_SERVER_ERROR",
        message: fallbackMessage,
      },
      message: fallbackMessage,
    },
    { status: 500 }
  );
}
