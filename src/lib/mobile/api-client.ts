/**
 * AxivonTech Central Mobile API Client
 * Enterprise-grade, resilient HTTP client specifically engineered for
 * the Axivon Android Mobile Application and Capacitor runtime.
 *
 * Features:
 * - Configurable Base URL (development vs. production HTTPS)
 * - Persistent HTTP-only cookie authentication (credentials: 'include')
 * - Automatic 401 Session Expiry detection & redirect to /app/login
 * - Safe request timeouts with AbortController
 * - Exponential backoff retry for idempotent GET requests
 * - Full JSON serialization and typed error parsing
 * - Multipart/form-data upload with progress/size validation
 * - Blob/streaming file download
 * - Role-scoped typed API methods for Admin, Executive, Manager, Employee, Broker, and Client
 */

export class MobileApiError extends Error {
  public statusCode: number;
  public details?: any;
  public code?: string;

  constructor(message: string, statusCode: number, details?: any, code?: string) {
    super(message);
    this.name = "MobileApiError";
    this.statusCode = statusCode;
    this.details = details;
    this.code = code;
  }
}

export interface RequestOptions extends Omit<RequestInit, "body"> {
  body?: any;
  params?: Record<string, string | number | boolean | undefined | null>;
  timeoutMs?: number;
  retries?: number;
  skipAuthRedirect?: boolean;
}

export interface UploadOptions {
  timeoutMs?: number;
  maxSizeBytes?: number;
}

class MobileApiClient {
  private baseUrl: string;
  private defaultTimeoutMs: number = 15000; // 15 seconds default timeout

  constructor() {
    // 1. Resolve base URL: In WebView/browser, relative URL "" automatically hits host origin
    // In external or standalone test environments, NEXT_PUBLIC_API_BASE_URL can override.
    const configuredBase = process.env.NEXT_PUBLIC_API_BASE_URL?.trim() || "";
    
    // In production, ensure HTTPS if an absolute URL is specified
    if (configuredBase.startsWith("http://") && process.env.NODE_ENV === "production") {
      this.baseUrl = configuredBase.replace("http://", "https://");
    } else {
      this.baseUrl = configuredBase;
    }
  }

  /**
   * Sets or overrides the API base URL at runtime (e.g. for testing)
   */
  public setBaseUrl(url: string) {
    this.baseUrl = url.trim();
  }

  public getBaseUrl(): string {
    return this.baseUrl;
  }

  /**
   * Constructs full URL including query parameters
   */
  private buildUrl(path: string, params?: Record<string, string | number | boolean | undefined | null>): string {
    let cleanPath = path.startsWith("/") ? path : `/${path}`;
    const urlString = this.baseUrl ? `${this.baseUrl}${cleanPath}` : cleanPath;

    if (!params || Object.keys(params).length === 0) {
      return urlString;
    }

    const query = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== null) {
        query.append(key, String(value));
      }
    }

    const queryString = query.toString();
    if (!queryString) return urlString;
    return urlString.includes("?") ? `${urlString}&${queryString}` : `${urlString}?${queryString}`;
  }

  /**
   * Core HTTP request handler
   */
  public async request<T = any>(path: string, options: RequestOptions = {}): Promise<T> {
    const {
      method = "GET",
      params,
      body,
      headers: customHeaders = {},
      timeoutMs = this.defaultTimeoutMs,
      retries = method === "GET" ? 2 : 0, // Only retry idempotent GET requests
      skipAuthRedirect = false,
      signal: externalSignal,
      ...fetchRest
    } = options;

    const url = this.buildUrl(path, params);

    // Prepare standard mobile headers
    const headers: Record<string, string> = {
      Accept: "application/json",
      "X-Requested-With": "AxivonApp",
      "X-Axivon-Client": "AndroidMobileApp/1.0.0",
      ...(customHeaders as Record<string, string>),
    };

    let serializedBody: any = undefined;
    if (body !== undefined && body !== null) {
      if (body instanceof FormData) {
        serializedBody = body;
        // Let browser set multipart boundary
        delete headers["Content-Type"];
      } else {
        headers["Content-Type"] = "application/json";
        serializedBody = JSON.stringify(body);
      }
    }

    let attempt = 0;
    while (true) {
      attempt++;
      const controller = new AbortController();
      let timeoutId: NodeJS.Timeout | null = null;

      if (timeoutMs > 0) {
        timeoutId = setTimeout(() => {
          controller.abort(new Error(`Request timed out after ${timeoutMs}ms`));
        }, timeoutMs);
      }

      // Combine with external signal if provided
      if (externalSignal) {
        externalSignal.addEventListener("abort", () => controller.abort(externalSignal.reason));
      }

      try {
        const response = await fetch(url, {
          method,
          headers,
          body: serializedBody,
          credentials: "include", // Persistent native HTTP-only cookie session
          signal: controller.signal,
          ...fetchRest,
        });

        if (timeoutId) clearTimeout(timeoutId);

        // Handle HTTP 401 Unauthorized: Session Expired / Invalid
        if (response.status === 401 && !skipAuthRedirect) {
          if (typeof window !== "undefined" && !window.location.pathname.startsWith("/app/login")) {
            // Force redirect to dedicated mobile login
            window.location.replace("/app/login?session_expired=1");
          }
        }

        // Parse response content
        const contentType = response.headers.get("content-type") || "";
        let responseData: any = null;

        if (contentType.includes("application/json")) {
          responseData = await response.json();
        } else {
          responseData = await response.text();
        }

        if (!response.ok) {
          const errorMessage =
            (typeof responseData === "object" && responseData !== null
              ? responseData.message || responseData.error
              : responseData) || `Request failed with status ${response.status}`;
          
          const code = typeof responseData === "object" ? responseData.code : undefined;
          const details = typeof responseData === "object" ? responseData.details : undefined;

          throw new MobileApiError(
            typeof errorMessage === "string" ? errorMessage : JSON.stringify(errorMessage),
            response.status,
            details,
            code
          );
        }

        return responseData as T;
      } catch (error: any) {
        if (timeoutId) clearTimeout(timeoutId);

        // Do not retry on explicit cancellation or client errors (4xx)
        if (error instanceof MobileApiError && error.statusCode >= 400 && error.statusCode < 500) {
          throw error;
        }

        if (attempt <= retries) {
          // Exponential backoff jitter: 200ms, 400ms...
          const delay = Math.pow(2, attempt) * 100 + Math.random() * 50;
          await new Promise((resolve) => setTimeout(resolve, delay));
          continue;
        }

        if (error.name === "AbortError") {
          throw new MobileApiError("Request was cancelled or timed out.", 408);
        }

        if (error instanceof MobileApiError) {
          throw error;
        }

        throw new MobileApiError(error.message || "Network request failed. Please check your connection.", 0, error);
      }
    }
  }

  /**
   * Helper for GET requests
   */
  public get<T = any>(path: string, params?: Record<string, any>, options?: Omit<RequestOptions, "method" | "params">): Promise<T> {
    return this.request<T>(path, { ...options, method: "GET", params });
  }

  /**
   * Helper for POST requests
   */
  public post<T = any>(path: string, body?: any, options?: Omit<RequestOptions, "method" | "body">): Promise<T> {
    return this.request<T>(path, { ...options, method: "POST", body });
  }

  /**
   * Helper for PATCH requests
   */
  public patch<T = any>(path: string, body?: any, options?: Omit<RequestOptions, "method" | "body">): Promise<T> {
    return this.request<T>(path, { ...options, method: "PATCH", body });
  }

  /**
   * Helper for PUT requests
   */
  public put<T = any>(path: string, body?: any, options?: Omit<RequestOptions, "method" | "body">): Promise<T> {
    return this.request<T>(path, { ...options, method: "PUT", body });
  }

  /**
   * Helper for DELETE requests
   */
  public delete<T = any>(path: string, options?: Omit<RequestOptions, "method">): Promise<T> {
    return this.request<T>(path, { ...options, method: "DELETE" });
  }

  /**
   * Secure file upload with size validation
   */
  public async upload<T = any>(
    path: string,
    formData: FormData,
    options: UploadOptions = {}
  ): Promise<T> {
    const { timeoutMs = 60000, maxSizeBytes = 15 * 1024 * 1024 } = options; // 15MB limit

    // Validate size if file entry exists
    for (const [key, value] of formData.entries()) {
      if (typeof File !== "undefined" && value instanceof File) {
        if (value.size > maxSizeBytes) {
          throw new MobileApiError(
            `File "${value.name}" exceeds maximum allowed size of ${(maxSizeBytes / 1024 / 1024).toFixed(1)}MB.`,
            413
          );
        }
      }
    }

    return this.post<T>(path, formData, { timeoutMs, retries: 0 });
  }

  /**
   * File download helper
   */
  public async download(path: string, filename?: string): Promise<Blob> {
    const url = this.buildUrl(path);
    const response = await fetch(url, {
      method: "GET",
      credentials: "include",
      headers: {
        "X-Requested-With": "AxivonApp",
      },
    });

    if (!response.ok) {
      throw new MobileApiError(`Download failed with status ${response.status}`, response.status);
    }

    const blob = await response.blob();
    return blob;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // TYPED BUSINESS DOMAIN NAMESPACES
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Authentication & Session
   */
  public readonly auth = {
    login: (credentials: { email: string; password: string; captchaToken?: string }) =>
      this.post("/api/v1/auth/login", credentials, { skipAuthRedirect: true }),

    getSession: () =>
      this.get("/api/v1/auth/session", undefined, { skipAuthRedirect: true }),

    logout: () =>
      this.post("/api/v1/auth/logout", {}, { skipAuthRedirect: true }),

    changePassword: (data: { currentPassword: string; newPassword: string }) =>
      this.post("/api/v1/auth/change-password", data),
  };

  /**
   * Employee Domain
   */
  public readonly employee = {
    getDashboard: () => this.get("/api/v1/employee/dashboard"),
    
    getAttendance: (params?: { month?: number; year?: number }) =>
      this.get("/api/v1/employee/attendance", params),
    
    checkIn: (payload?: { latitude?: number; longitude?: number; note?: string }) =>
      this.post("/api/v1/employee/attendance/check-in", payload),
    
    checkOut: (payload?: { latitude?: number; longitude?: number; note?: string }) =>
      this.post("/api/v1/employee/attendance/check-out", payload),
    
    toggleBreak: (payload?: { action: "START" | "END" }) =>
      this.post("/api/v1/employee/attendance/break", payload),

    getTasks: (params?: { status?: string; priority?: string }) =>
      this.get("/api/v1/employee/tasks", params),

    updateTaskStatus: (taskId: string, status: "TODO" | "IN_PROGRESS" | "COMPLETED") =>
      this.patch(`/api/v1/employee/tasks/${taskId}`, { status }),

    getWorkReports: (params?: { page?: number; limit?: number }) =>
      this.get("/api/v1/employee/work-reports", params),

    submitWorkReport: (data: { summary: string; tasksDone: string[]; blockers?: string; hoursSpent?: number }) =>
      this.post("/api/v1/employee/work-reports", data),

    getLeave: () => this.get("/api/v1/employee/leave"),

    applyLeave: (data: { leaveType: string; startDate: string; endDate: string; reason: string }) =>
      this.post("/api/v1/employee/leave", data),

    getNotifications: (params?: { unreadOnly?: boolean }) =>
      this.get("/api/v1/employee/notifications", params),

    getProfile: () => this.get("/api/v1/employee/profile"),
  };

  /**
   * Broker / Business Partner Domain
   */
  public readonly broker = {
    getDashboard: () => this.get("/api/v1/broker/dashboard"),

    getLeads: (params?: { status?: string; search?: string; page?: number; limit?: number }) =>
      this.get("/api/v1/broker/leads", params),

    registerLead: (data: {
      clientName: string;
      clientEmail: string;
      clientPhone: string;
      companyName?: string;
      projectType?: string;
      estimatedBudget?: string | number;
      notes?: string;
    }) => this.post("/api/v1/broker/leads", data),

    getProjects: () => this.get("/api/v1/broker/projects"),

    getCommissions: (params?: { status?: string }) =>
      this.get("/api/v1/broker/commissions", params),

    requestPayout: (data: { commissionId: string; paymentMethod: "UPI" | "BANK_TRANSFER"; paymentDetails: any }) =>
      this.post("/api/v1/broker/payouts", data),

    getContracts: () => this.get("/api/v1/broker/contracts"),

    getProfile: () => this.get("/api/v1/broker/profile"),

    updateProfile: (data: any) => this.patch("/api/v1/broker/profile", data),
  };

  /**
   * Department Manager Domain
   */
  public readonly manager = {
    getDashboard: () => this.get("/api/v1/manager/dashboard"),

    getEmployees: () => this.get("/api/v1/manager/employees"),

    getTasks: (params?: { status?: string; assigneeId?: string }) =>
      this.get("/api/v1/manager/tasks", params),

    assignTask: (data: { title: string; description?: string; assigneeId: string; priority: string; dueDate?: string }) =>
      this.post("/api/v1/manager/tasks", data),

    getAttendance: (params?: { date?: string }) =>
      this.get("/api/v1/manager/attendance", params),

    getLeaveRequests: (params?: { status?: string }) =>
      this.get("/api/v1/manager/leave", params),

    reviewLeave: (leaveId: string, action: "APPROVE" | "REJECT", reviewNote?: string) =>
      this.patch("/api/v1/manager/leave", { leaveId, action, reviewNote }),

    getWorkReports: (params?: { date?: string }) =>
      this.get("/api/v1/manager/work-reports", params),
  };

  /**
   * Admin Domain
   */
  public readonly admin = {
    getDashboard: () => this.get("/api/v1/admin/dashboard"),

    getApplications: (params?: { status?: string; search?: string }) =>
      this.get("/api/v1/admin/business-partner/applications", params),

    approveApplication: (applicationId: string, payload: any) =>
      this.post(`/api/v1/admin/business-partner/applications/${applicationId}/create-account`, payload),

    getEmployees: (params?: { departmentId?: string; status?: string }) =>
      this.get("/api/v1/admin/employees", params),

    getDepartments: () => this.get("/api/v1/admin/departments"),

    getTasks: () => this.get("/api/v1/admin/tasks"),

    getAttendance: () => this.get("/api/v1/admin/attendance"),

    getLeads: () => this.get("/api/v1/admin/leads"),
  };

  /**
   * Executive Domain (Founder & Co-Founder Governance)
   */
  public readonly executive = {
    getDashboard: () => this.get("/api/v1/executive/dashboard"),

    getApprovals: () => this.get("/api/v1/executive/approvals"),

    reviewApproval: (approvalId: string, action: "APPROVE" | "REJECT", comment?: string) =>
      this.post(`/api/v1/executive/approvals/${approvalId}/review`, { action, comment }),

    getPeople: () => this.get("/api/v1/executive/people"),

    getReports: (params?: { type?: string; period?: string }) =>
      this.get("/api/v1/executive/reports", params),
  };

  /**
   * Client Domain
   */
  public readonly client = {
    getDashboard: () => this.get("/api/v1/client/dashboard"),

    getProjects: () => this.get("/api/v1/client/projects"),

    getDocuments: () => this.get("/api/v1/client/documents"),

    getInvoices: () => this.get("/api/v1/client/invoices"),

    getTickets: () => this.get("/api/v1/client/support"),

    createTicket: (data: { subject: string; message: string; priority: string; projectId?: string }) =>
      this.post("/api/v1/client/support", data),
  };

  /**
   * Shared Notifications
   */
  public readonly notifications = {
    getAll: (params?: { page?: number; limit?: number; unreadOnly?: boolean }) =>
      this.get("/api/v1/notifications", params),

    getUnreadCount: () =>
      this.get("/api/v1/notifications/unread-count"),

    markRead: (notificationId: string) =>
      this.patch(`/api/v1/notifications/${notificationId}/read`),

    markAllRead: () =>
      this.post("/api/v1/notifications/read-all"),
  };
}

// Export singleton instance for app-wide use
export const mobileApi = new MobileApiClient();
