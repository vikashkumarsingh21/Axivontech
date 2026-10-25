import { NextResponse } from "next/server";
import { handleServerApiError, createErrorResponse } from "./errors/server";

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

export function handleApiError(error: unknown): NextResponse {
  return handleServerApiError(error);
}

export { createErrorResponse };
