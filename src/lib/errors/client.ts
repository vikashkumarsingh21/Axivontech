/**
 * Axivon Technologies - Centralized Client Error & API Response Handling System
 * 
 * Safely parses all API response and error shapes across the platform.
 * NEVER returns "[object Object]".
 */

export interface ParsedApiResponse<T = any> {
  ok: boolean;
  status: number;
  data: T | null;
  raw: any;
  errorMessage: string | null;
  fieldErrors: Record<string, string>;
  code?: string;
  retryAfter?: number;
}

/**
 * Friendly fallback messages by HTTP status code.
 */
export const STATUS_ERROR_MESSAGES: Record<number, string> = {
  400: "Invalid request. Please check your information and try again.",
  401: "Invalid credentials or session expired. Please sign in again.",
  403: "Access denied. You do not have permission to perform this action.",
  404: "The requested resource was not found.",
  409: "A record with this information already exists.",
  413: "File size exceeds the allowable limit. Please upload a smaller file.",
  422: "Validation error. Please verify the submitted information.",
  429: "Too many attempts. Please try again later.",
  500: "Could not reach the server. Check your connection and try again.",
  502: "Server is temporarily unavailable. Please try again shortly.",
  503: "Service is temporarily unavailable. Please try again shortly.",
  504: "The server took too long to respond. Please try again.",
};

/**
 * Friendly messages by error code string.
 */
export const CODE_ERROR_MESSAGES: Record<string, string> = {
  VALIDATION_ERROR: "Please check the highlighted fields and try again.",
  AUTH_INVALID_CREDENTIALS: "Incorrect email or password.",
  UNAUTHORIZED: "Invalid credentials or session expired. Please sign in again.",
  FORBIDDEN: "Access denied. You do not have permission to perform this action.",
  NOT_FOUND: "The requested resource was not found.",
  DUPLICATE_RECORD: "A record with this information already exists.",
  RATE_LIMIT_EXCEEDED: "Too many attempts. Please slow down and try again.",
  CAPTCHA_REQUIRED: "Please confirm you are not a robot.",
  MISSING_TOKEN: "Please confirm you are not a robot.",
  CAPTCHA_FAILED: "Security verification failed. Please try again.",
  INTERNAL_SERVER_ERROR: "Could not reach the server. Check your connection and try again.",
  NETWORK_ERROR: "Could not reach the server. Check your connection and try again.",
  TIMEOUT: "The request timed out. Please try again.",
};

const OBJECT_STRING_PATTERN = /^\[object\s+\w+\]$/i;

/**
 * Safely extracts a clean, human-readable error string from ANY input shape.
 * NEVER returns "[object Object]".
 */
export function getErrorMessage(input: unknown, status?: number): string {
  const fallback = (status && STATUS_ERROR_MESSAGES[status]) || "Something went wrong. Please try again.";

  if (input === null || input === undefined) {
    return fallback;
  }

  // 1. Primitive string input
  if (typeof input === "string") {
    const trimmed = input.trim();
    if (!trimmed || trimmed === "undefined" || trimmed === "null" || OBJECT_STRING_PATTERN.test(trimmed)) {
      return fallback;
    }
    // HTML 500 error page detection
    if (trimmed.startsWith("<!DOCTYPE") || trimmed.startsWith("<html") || (trimmed.startsWith("<") && trimmed.includes("</html>"))) {
      return (status && STATUS_ERROR_MESSAGES[status]) || "Could not reach the server. Check your connection and try again.";
    }
    // Strip "Error: " prefix if present from Error.prototype.toString()
    if (trimmed.startsWith("Error: ")) {
      const withoutPrefix = trimmed.slice(7).trim();
      if (!withoutPrefix || OBJECT_STRING_PATTERN.test(withoutPrefix)) {
        return fallback;
      }
      return withoutPrefix;
    }
    return trimmed;
  }

  // 2. Error and DOMException instances
  if (input instanceof Error) {
    if (input.name === "AbortError" || input.message?.includes("aborted")) {
      return "The request timed out. Please try again.";
    }
    if (input.name === "TypeError" && (input.message?.includes("Failed to fetch") || input.message?.includes("NetworkError") || input.message?.includes("network"))) {
      return "Could not reach the server. Check your connection and try again.";
    }
    if (input.message && !OBJECT_STRING_PATTERN.test(input.message)) {
      return getErrorMessage(input.message, status);
    }
    return fallback;
  }

  // 3. Array input (e.g. Zod issues or string array)
  if (Array.isArray(input)) {
    if (input.length === 0) return fallback;
    const first = input[0];
    if (typeof first === "string") {
      return getErrorMessage(first, status);
    }
    if (first && typeof first === "object") {
      if ("message" in first && typeof (first as any).message === "string") {
        return getErrorMessage((first as any).message, status);
      }
    }
    return fallback;
  }

  // 4. Object input
  if (typeof input === "object") {
    const obj = input as Record<string, any>;

    // Handle nested error object or string: { error: ... }
    if ("error" in obj && obj.error !== undefined && obj.error !== null) {
      if (typeof obj.error === "string") {
        return getErrorMessage(obj.error, status);
      }
      if (typeof obj.error === "object") {
        // e.g. { error: { message: "...", code: "..." } }
        if (typeof obj.error.message === "string" && obj.error.message.trim() && !OBJECT_STRING_PATTERN.test(obj.error.message)) {
          return getErrorMessage(obj.error.message, status);
        }
        if (typeof obj.error.code === "string" && CODE_ERROR_MESSAGES[obj.error.code]) {
          return CODE_ERROR_MESSAGES[obj.error.code];
        }
        if (obj.error.fields && typeof obj.error.fields === "object") {
          const fieldKeys = Object.keys(obj.error.fields);
          if (fieldKeys.length > 0) {
            const firstVal = obj.error.fields[fieldKeys[0]];
            if (Array.isArray(firstVal) && firstVal[0]) return getErrorMessage(firstVal[0], status);
            if (typeof firstVal === "string") return getErrorMessage(firstVal, status);
          }
        }
      }
    }

    // Handle { message: "..." }
    if (typeof obj.message === "string" && obj.message.trim() && !OBJECT_STRING_PATTERN.test(obj.message)) {
      return getErrorMessage(obj.message, status);
    }

    // Handle chat response or alert: { reply: "..." }
    if (typeof obj.reply === "string" && obj.reply.trim()) {
      return getErrorMessage(obj.reply, status);
    }

    // Handle { code: "..." }
    if (typeof obj.code === "string" && CODE_ERROR_MESSAGES[obj.code]) {
      return CODE_ERROR_MESSAGES[obj.code];
    }

    // Handle { errors: [...] }
    if (Array.isArray(obj.errors) && obj.errors.length > 0) {
      return getErrorMessage(obj.errors, status);
    }

    // Handle Zod details: { details: { _errors: [...], [field]: { _errors: [...] } } }
    if (obj.details && typeof obj.details === "object") {
      const details = obj.details as Record<string, any>;
      if (Array.isArray(details._errors) && details._errors.length > 0) {
        return getErrorMessage(details._errors[0], status);
      }
      for (const k of Object.keys(details)) {
        if (k !== "_errors" && details[k]?._errors?.length > 0) {
          return getErrorMessage(details[k]._errors[0], status);
        }
      }
    }
  }

  return fallback;
}

/**
 * Safely extracts per-field error messages from error.fields or Zod issues.
 * Returns a clean Record<string, string>.
 */
export function getFieldErrors(input: unknown): Record<string, string> {
  const result: Record<string, string> = {};
  if (!input || typeof input !== "object") {
    return result;
  }

  const obj = input as Record<string, any>;

  // 1. Check error.fields: { [key]: string | string[] }
  const fields = obj?.error?.fields || obj?.fields;
  if (fields && typeof fields === "object") {
    for (const [key, val] of Object.entries(fields)) {
      if (typeof val === "string" && val.trim()) {
        result[key] = val.trim();
      } else if (Array.isArray(val) && val.length > 0 && typeof val[0] === "string") {
        result[key] = val[0].trim();
      }
    }
  }

  // 2. Check Zod issues array: [{ path: ['email'], message: '...' }]
  const issues = obj?.error?.issues || obj?.issues || (Array.isArray(obj?.errors) ? obj.errors : null);
  if (Array.isArray(issues)) {
    for (const issue of issues) {
      if (issue && typeof issue === "object") {
        const pathKey = Array.isArray(issue.path) ? issue.path.join(".") : issue.path ? String(issue.path) : null;
        if (pathKey && issue.message && typeof issue.message === "string" && !result[pathKey]) {
          result[pathKey] = issue.message.trim();
        }
      }
    }
  }

  // 3. Check Zod format details: { [field]: { _errors: ['...'] } }
  const details = obj?.details;
  if (details && typeof details === "object") {
    for (const [key, val] of Object.entries(details)) {
      if (key !== "_errors" && val && typeof val === "object" && Array.isArray((val as any)._errors)) {
        const first = (val as any)._errors[0];
        if (typeof first === "string" && !result[key]) {
          result[key] = first.trim();
        }
      }
    }
  }

  return result;
}

/**
 * Safely parses any fetch Response into a structured result.
 * Never throws from invalid JSON or empty body.
 */
export async function parseApiResponse<T = any>(res: Response): Promise<ParsedApiResponse<T>> {
  const status = res.status;
  const ok = res.ok;

  let raw: any = null;
  let text = "";

  try {
    text = await res.text();
    if (text && text.trim().length > 0) {
      raw = JSON.parse(text);
    }
  } catch {
    // Non-JSON response (e.g. HTML 500 error or empty text)
    raw = text;
  }

  // Extract retry-after header if present (standard seconds or HTTP-date)
  let retryAfter: number | undefined;
  const retryHeader = res.headers?.get?.("Retry-After");
  if (retryHeader) {
    const parsed = parseInt(retryHeader, 10);
    if (!Number.isNaN(parsed)) {
      retryAfter = parsed;
    }
  } else if (raw && typeof raw === "object" && typeof raw.retryAfter === "number") {
    retryAfter = raw.retryAfter;
  }

  let errorMessage: string | null = null;
  let fieldErrors: Record<string, string> = {};
  let code: string | undefined = raw?.error?.code || raw?.code;

  if (!ok) {
    // Handle 429 rate limit specially with countdown seconds
    if (status === 429) {
      code = code || "RATE_LIMIT_EXCEEDED";
      if (retryAfter !== undefined && retryAfter > 0) {
        errorMessage = `Too many attempts. Please try again in ${retryAfter} second${retryAfter === 1 ? "" : "s"}.`;
      } else {
        errorMessage = "Too many attempts. Please try again later.";
      }
    } else {
      errorMessage = getErrorMessage(raw, status);
    }
    fieldErrors = getFieldErrors(raw);
  }

  const data: T | null = ok ? (raw?.data !== undefined ? raw.data : raw) : null;

  return {
    ok,
    status,
    data,
    raw,
    errorMessage,
    fieldErrors,
    code,
    retryAfter,
  };
}
