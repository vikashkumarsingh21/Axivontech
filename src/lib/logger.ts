export type LogLevel = "info" | "warn" | "error" | "debug";

export interface LogPayload {
  message: string;
  service?: string;
  environment?: string;
  correlationId?: string;
  route?: string;
  userId?: string;
  durationMs?: number;
  error?: any;
  metadata?: Record<string, any>;
}

// Redact sensitive keys from log metadata
const SENSITIVE_KEYS = new Set([
  "password",
  "secret",
  "token",
  "authorization",
  "cookie",
  "session",
  "apiKey",
  "creditCard",
]);

function sanitize(obj: any): any {
  if (obj === null || obj === undefined) return obj;
  if (typeof obj !== "object") return obj;

  if (Array.isArray(obj)) {
    return obj.map(sanitize);
  }

  const clean: Record<string, any> = {};
  for (const [key, val] of Object.entries(obj)) {
    if (SENSITIVE_KEYS.has(key.toLowerCase())) {
      clean[key] = "[REDACTED]";
    } else if (typeof val === "object") {
      clean[key] = sanitize(val);
    } else {
      clean[key] = val;
    }
  }
  return clean;
}

export class Logger {
  private static formatLog(level: LogLevel, payload: LogPayload) {
    const { message, service = "axivon-core", correlationId, route, userId, durationMs, error, metadata } = payload;

    const logEntry = {
      timestamp: new Date().toISOString(),
      severity: level.toUpperCase(),
      service,
      environment: process.env.NODE_ENV || "development",
      message,
      ...(correlationId ? { correlationId } : {}),
      ...(route ? { route } : {}),
      ...(userId ? { userId } : {}),
      ...(durationMs !== undefined ? { durationMs } : {}),
      ...(error ? { error: error instanceof Error ? { name: error.name, message: error.message, stack: error.stack } : String(error) } : {}),
      ...(metadata ? { metadata: sanitize(metadata) } : {}),
    };

    return JSON.stringify(logEntry);
  }

  static info(message: string, payload?: Omit<LogPayload, "message">) {
    console.log(this.formatLog("info", { message, ...payload }));
  }

  static warn(message: string, payload?: Omit<LogPayload, "message">) {
    console.warn(this.formatLog("warn", { message, ...payload }));
  }

  static error(message: string, payload?: Omit<LogPayload, "message">) {
    console.error(this.formatLog("error", { message, ...payload }));
  }

  static debug(message: string, payload?: Omit<LogPayload, "message">) {
    if (process.env.NODE_ENV === "development" || process.env.DEBUG === "true") {
      console.debug(this.formatLog("debug", { message, ...payload }));
    }
  }
}
