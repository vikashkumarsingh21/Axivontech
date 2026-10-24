# Axivon Technologies - Employee Portal API Contract

This document provides the definitive, production API contract for the Employee Portal backend. All endpoints are secured with cryptographic JOSE JWT session validation and role-based access control (RBAC).

**Base URL:** `/api/v1/employee`  
**Authentication:** `axivon_session` HTTP-only cookie OR `x-user-id` header (development/middleware context).  
**Timezone Reference:** All calendar dates, daily shifts, and streaks are computed relative to company timezone (`Asia/Kolkata`).

---

## 1. Authentication & Session (`/api/v1/employee/me`)

### `GET /api/v1/employee/me`
Retrieves the authenticated employee's core profile, active role array, daily shift requirements, and organization metadata.

- **Query Parameters:** None
- **Request Body:** None
- **Responses:**
  - `200 OK`
    ```json
    {
      "success": true,
      "user": {
        "id": "cuid-string",
        "email": "employee@axivon.com",
        "name": "Alex Developer",
        "phone": "+91 9876543210",
        "avatarUrl": "https://example.com/avatar.jpg",
        "employeeId": "AXV-EMP-1002",
        "department": "Engineering",
        "designation": "Full-Stack Specialist",
        "address": "Bangalore, India",
        "emergencyContact": "+91 9876500000",
        "status": "ACTIVE",
        "requiredDailyMinutes": 480,
        "organizationId": "org-cuid",
        "role": "EMPLOYEE",
        "roles": ["EMPLOYEE"],
        "joinedAt": "2026-01-15T00:00:00.000Z",
        "createdAt": "2026-01-15T00:00:00.000Z"
      }
    }
    ```
  - `401 Unauthorized` (`code: "UNAUTHORIZED"`): Missing or invalid session token.
  - `403 Forbidden` (`code: "ACCOUNT_INACTIVE"`): Account is marked INACTIVE.

---

## 2. Dashboard Aggregator (`/api/v1/employee/dashboard`)

### `GET /api/v1/employee/dashboard`
Aggregated overview payload containing live attendance timer, today's work report, task breakdown, leave stats, unread notifications, upcoming holidays, and recent broadcasts.

- **Query Parameters:** None
- **Request Body:** None
- **Responses:**
  - `200 OK`
    ```json
    {
      "success": true,
      "data": {
        "attendance": {
          "id": "cuid-string",
          "date": "2026-10-24T00:00:00.000Z",
          "checkInAt": "2026-10-24T09:30:00.000Z",
          "checkOutAt": null,
          "isOnBreak": false,
          "grossMinutes": 180,
          "workedMinutes": 150,
          "netMinutes": 150,
          "breakMinutes": 30,
          "requiredDailyMinutes": 480,
          "status": "PRESENT"
        },
        "todayWorkReport": {
          "id": "cuid-string",
          "date": "2026-10-24T00:00:00.000Z",
          "summary": "Completed authentication modules",
          "workPerformed": "Refactored JWT verification and added idempotency checks",
          "hoursWorked": 8.0,
          "status": "SUBMITTED"
        },
        "hasReportToday": true,
        "weeklyHoursLogged": 38.5,
        "taskStats": {
          "total": 12,
          "active": 4,
          "completed": 8,
          "overdue": 1,
          "dueToday": 2
        },
        "recentTasks": [...],
        "dueTodayTasks": [...],
        "overdueTasks": [...],
        "leaveStats": {
          "pendingCount": 1,
          "upcomingApproved": null,
          "balances": {
            "casual": { "total": 12, "used": 2, "pending": 1, "remaining": 10, "available": 9 },
            "sick": { "total": 12, "used": 0, "pending": 0, "remaining": 12, "available": 12 },
            "paid": { "total": 15, "used": 0, "pending": 0, "remaining": 15, "available": 15 }
          }
        },
        "unreadNotifs": 3,
        "recentAnnouncements": [...],
        "upcomingHolidays": [
          {
            "id": "cuid-string",
            "name": "Diwali",
            "date": "2026-11-01",
            "isCompanyHoliday": true,
            "category": "PUBLIC_HOLIDAY"
          }
        ]
      }
    }
    ```

---

## 3. Attendance & Sessions (`/api/v1/employee/attendance`)

### `GET /api/v1/employee/attendance`
Retrieves daily attendance logs, live session state, breaks, and monthly summaries.

- **Query Parameters:**
  - `view`: `"live"` (returns today's active session only), `"monthly"` (returns month aggregates), or `"full"` (default)
  - `month`: `1-12` (default: current month)
  - `year`: `YYYY` (default: current year)
- **Responses:**
  - `200 OK`
    ```json
    {
      "success": true,
      "records": [
        {
          "id": "cuid-string",
          "date": "2026-10-24T00:00:00.000Z",
          "checkInAt": "2026-10-24T09:30:00.000Z",
          "checkOutAt": "2026-10-24T18:00:00.000Z",
          "grossMinutes": 510,
          "breakMinutes": 45,
          "netMinutes": 465,
          "status": "PRESENT",
          "completionStatus": "COMPLETE",
          "isLate": false,
          "isEarlyExit": false,
          "breaks": [
            {
              "id": "cuid-string",
              "type": "LUNCH",
              "startTime": "2026-10-24T13:00:00.000Z",
              "endTime": "2026-10-24T13:45:00.000Z",
              "durationMinutes": 45
            }
          ]
        }
      ],
      "todayRecord": {...},
      "live": {
        "isCheckedIn": true,
        "isOnBreak": false,
        "workedMinutes": 240,
        "breakMinutes": 30,
        "targetMinutes": 480
      },
      "monthlySummary": {
        "presentDays": 20,
        "halfDays": 1,
        "lateDays": 2,
        "absentDays": 0,
        "totalNetMinutes": 9600,
        "averageHoursPerDay": 8.0
      }
    }
    ```

### `POST /api/v1/employee/attendance`
Performs attendance lifecycle actions (`check-in`, `check-out`, `break-start`, `break-end`).

- **Request Body:**
  ```json
  {
    "action": "check-in" | "check-out" | "break-start" | "break-end",
    "breakType": "LUNCH" | "TEA" | "SHORT_BREAK" | "PERSONAL" | "OTHER",
    "notes": "Optional remark"
  }
  ```
- **Business Rules:**
  - Server time is always enforced (`now()`). Client cannot forge timestamps.
  - Automatically closes dangling unclosed sessions from previous calendar days.
  - Multi-session support: checking in after checking out logs intermittent gap as `type: "OTHER"`.
  - Rejects double check-in without check-out (`400 Bad Request`).
  - Rejects break start when not checked in or already on break (`400 Bad Request`).
  - Rejects break end when not currently on a break (`400 Bad Request`).
- **Responses:**
  - `200 OK`: `{ "success": true, "record": {...}, "message": "Action completed" }`
  - `400 Bad Request`: `{ "success": false, "error": { "code": "INVALID_STATE", "message": "..." } }`

---

## 4. Attendance Regularization (`/api/v1/employee/attendance/regularize`)

### `POST /api/v1/employee/attendance/regularize`
Submits a regularization request for past missed check-in/out or incorrect timings.

- **Request Body:**
  ```json
  {
    "date": "2026-10-20",
    "requestedCheckIn": "09:30",
    "requestedCheckOut": "18:30",
    "reason": "Client on-site meeting with external vendor team",
    "attendanceId": "optional-cuid-to-link-existing-record"
  }
  ```
- **Business Rules:**
  - Strict past date validation: cannot regularize today or future dates (`400 Bad Request`).
  - Maximum retroactive window: 30 days.
  - `requestedCheckOut` must be strictly later than `requestedCheckIn`.
  - Duplicate pending requests for the same date are rejected (`409 Conflict`).
  - Dispatches immediate notifications to Administrators.
- **Responses:**
  - `201 Created`: `{ "success": true, "request": {...}, "message": "Regularization request submitted." }`

### `PATCH /api/v1/employee/attendance/regularize`
Cancels an existing pending regularization request.

- **Request Body:**
  ```json
  {
    "requestId": "cuid-string",
    "action": "CANCEL"
  }
  ```
- **Business Rules:**
  - IDOR protected: can only cancel requests owned by the authenticated employee.
  - Can only cancel if status is `PENDING`. Rejects if already approved or rejected.
- **Responses:**
  - `200 OK`: `{ "success": true, "message": "Regularization request cancelled." }`

---

## 5. Leave Management (`/api/v1/employee/leave`)

### `GET /api/v1/employee/leave`
Returns employee leave requests, approval metadata, and calculated leave balances.

- **Query Parameters:**
  - `status`: `"ALL"` | `"PENDING"` | `"APPROVED"` | `"REJECTED"` | `"CANCELLED"`
  - `year`: `YYYY` (default: current year)
- **Responses:**
  - `200 OK`
    ```json
    {
      "success": true,
      "requests": [
        {
          "id": "cuid-string",
          "leaveType": "CASUAL",
          "startDate": "2026-11-10T00:00:00.000Z",
          "endDate": "2026-11-12T00:00:00.000Z",
          "isHalfDay": false,
          "halfDayType": null,
          "reason": "Family event",
          "status": "APPROVED",
          "approvedBy": { "id": "admin-id", "name": "HR Manager", "email": "hr@axivon.com" },
          "createdAt": "2026-10-20T10:00:00.000Z"
        }
      ],
      "balances": {
        "casual": { "total": 12, "used": 3, "pending": 0, "remaining": 9, "available": 9 },
        "sick": { "total": 12, "used": 1, "pending": 0, "remaining": 11, "available": 11 },
        "paid": { "total": 15, "used": 0, "pending": 2, "remaining": 15, "available": 13 },
        "remote": { "total": 24, "used": 4, "pending": 0, "remaining": 20, "available": 20 },
        "unpaid": { "total": 0, "used": 0, "pending": 0, "remaining": 0, "available": 0 }
      },
      "meta": {
        "stats": { "total": 4, "pending": 1, "approved": 3, "rejected": 0, "cancelled": 0 },
        "year": 2026
      }
    }
    ```

### `POST /api/v1/employee/leave`
Submits a new leave request with balance deduction and overlap validation.

- **Request Body:**
  ```json
  {
    "leaveType": "CASUAL" | "SICK" | "PAID" | "REMOTE" | "UNPAID",
    "startDate": "2026-11-15",
    "endDate": "2026-11-17",
    "reason": "Planned medical check-up and recovery",
    "isHalfDay": false,
    "halfDayType": "FIRST_HALF" | "SECOND_HALF" | null
  }
  ```
- **Business Rules:**
  - If `isHalfDay` is true, `startDate` and `endDate` must be the identical date.
  - Retroactive requests older than 30 days are prohibited (`400 Bad Request`).
  - Checks for overlapping `PENDING` or `APPROVED` leaves for this user (`400 Bad Request`).
  - Balance validation: Verifies `availableDays >= requestedDays`. If insufficient, throws `400 Bad Request`.
  - Transactional update: increments `pendingDays` on `LeaveBalance`.
  - Dispatches notifications to Administrators.
- **Responses:**
  - `201 Created`: `{ "success": true, "request": {...}, "balances": {...}, "message": "..." }`

### `PATCH /api/v1/employee/leave`
Cancels a leave request and restores leave balances.

- **Request Body:**
  ```json
  {
    "requestId": "cuid-string",
    "action": "CANCEL"
  }
  ```
- **Business Rules:**
  - IDOR protected: user must own the leave request.
  - If `PENDING`: cancels request and decrements `pendingDays` on `LeaveBalance`.
  - If `APPROVED`: only permitted if `startDate > today` (future leave). Decrements `usedDays` and increments `remainingDays`.
  - If leave already started or past: rejects with `400 Bad Request` ("Cannot cancel leave that has already started").
- **Responses:**
  - `200 OK`: `{ "success": true, "request": {...}, "message": "Leave request cancelled successfully." }`

---

## 6. Sprint Tasks (`/api/v1/employee/tasks`)

### `GET /api/v1/employee/tasks`
Returns sprint tasks assigned strictly to the employee with project metadata and comment history.

- **Query Parameters:**
  - `status`: `"ALL"` | `"TODO"` | `"IN_PROGRESS"` | `"BLOCKED"` | `"COMPLETED"`
  - `priority`: `"ALL"` | `"LOW"` | `"MEDIUM"` | `"HIGH"` | `"CRITICAL"` | `"URGENT"`
  - `projectId`: filter by project ID
  - `search`: search query in title and description
  - `page`: page number (default: 1)
  - `limit`: items per page (default: 50, max: 100)
- **Responses:**
  - `200 OK`
    ```json
    {
      "success": true,
      "tasks": [
        {
          "id": "cuid-string",
          "title": "Build user auth flow",
          "description": "Implement Next.js server actions and Zod schemas",
          "priority": "HIGH",
          "status": "IN_PROGRESS",
          "dueDate": "2026-10-30T18:00:00.000Z",
          "isOverdue": false,
          "project": {
            "id": "cuid-string",
            "name": "Axivon ERP Portal",
            "status": "ACTIVE"
          },
          "comments": [
            {
              "id": "cuid-string",
              "content": "API contract verified with backend team",
              "createdAt": "2026-10-24T12:00:00.000Z",
              "user": { "id": "user-id", "name": "Alex", "avatarUrl": null }
            }
          ]
        }
      ],
      "meta": {
        "counts": {
          "total": 10,
          "todo": 3,
          "inProgress": 4,
          "blocked": 1,
          "completed": 2,
          "overdue": 1,
          "dueSoon": 2
        },
        "filteredCount": 10
      }
    }
    ```

### `PATCH /api/v1/employee/tasks`
Updates task status (TODO, IN_PROGRESS, BLOCKED, COMPLETED).

- **Request Body:**
  ```json
  {
    "taskId": "cuid-string",
    "status": "TODO" | "IN_PROGRESS" | "BLOCKED" | "COMPLETED"
  }
  ```
- **Business Rules:**
  - IDOR protected: user must be the assignee of the task.
  - When marked `COMPLETED` or `BLOCKED`, automatically notifies project managers and platform admins.
- **Responses:**
  - `200 OK`: `{ "success": true, "task": {...}, "message": "Task status updated to COMPLETED" }`

### `POST /api/v1/employee/tasks`
Adds a discussion comment to a task.

- **Request Body:**
  ```json
  {
    "taskId": "cuid-string",
    "content": "Merged PR #42 with test fixtures."
  }
  ```
- **Responses:**
  - `201 Created`: `{ "success": true, "comment": {...}, "message": "Comment added successfully" }`

---

## 7. Daily Work Reports (`/api/v1/employee/work-reports`)

### `GET /api/v1/employee/work-reports`
Returns daily work reports, submission streaks, and monthly totals.

- **Query Parameters:**
  - `month`: `YYYY-MM` (e.g. `2026-10`)
  - `startDate`, `endDate`: ISO date strings
- **Responses:**
  - `200 OK`
    ```json
    {
      "success": true,
      "reports": [...],
      "meta": {
        "streak": 14,
        "totalReportsThisMonth": 22,
        "totalHoursThisMonth": 176.5,
        "todayReportSubmitted": true
      }
    }
    ```

### `POST /api/v1/employee/work-reports`
Creates or updates a daily work report.

- **Request Body:**
  ```json
  {
    "date": "2026-10-24",
    "summary": "Completed backend audit and API implementations",
    "workPerformed": "Detailed breakdown of tasks completed and test suite execution",
    "tasksCompleted": "Task #12, Task #15",
    "challenges": "Transient Neon connection timeout resolved with pooler retry",
    "nextSteps": "Frontend component integration",
    "hoursWorked": 8.0,
    "status": "SUBMITTED"
  }
  ```
- **Business Rules:**
  - `hoursWorked` bounds check: must be strictly between `0.1` and `24.0`.
  - Future date rejection: cannot log reports for future dates (`400 Bad Request`).
  - Max retroactive window: 14 days.
  - Cutoff edit window: reports older than 48 hours are locked and cannot be edited.
  - Idempotency protected against rapid double-clicks.
- **Responses:**
  - `200 OK`: `{ "success": true, "report": {...}, "message": "Work report submitted successfully." }`

---

## 8. Assigned Projects (`/api/v1/employee/projects`)

### `GET /api/v1/employee/projects`
Returns projects where employee is an explicit member or task assignee.

- **Query Parameters:**
  - `status`: `"ALL"` | `"ACTIVE"` | `"COMPLETED"` | `"ON_HOLD"`
  - `search`: search query
- **Security Rule:**
  - Strictly filtered to user's assigned projects. Never returns unassigned company-wide client projects.
- **Responses:**
  - `200 OK`
    ```json
    {
      "success": true,
      "projects": [
        {
          "id": "cuid-string",
          "name": "Fintech Mobile Application",
          "description": "Secure banking application client deliverable",
          "status": "ACTIVE",
          "myRole": "MEMBER",
          "myTaskStats": {
            "total": 6,
            "completed": 4,
            "pending": 2,
            "completionPercentage": 67
          },
          "_count": { "tasks": 24, "members": 5 }
        }
      ],
      "data": [...]
    }
    ```

---

## 9. Documents & Compliance (`/api/v1/employee/documents`)

### `GET /api/v1/employee/documents`
Returns company handbooks, policies, and templates accessible to the employee.

- **Query Parameters:**
  - `category`: `"ALL"` | `"COMPANY_POLICY"` | `"GUIDELINE"` | `"HR_DOCUMENT"` | `"TEMPLATE"`
  - `search`: search query
- **Responses:**
  - `200 OK`
    ```json
    {
      "success": true,
      "documents": [
        {
          "id": "cuid-string",
          "title": "Employee Handbook 2026",
          "description": "Company operational and conduct guidelines",
          "category": "COMPANY_POLICY",
          "fileUrl": "https://storage.axivon.com/handbook.pdf",
          "fileType": "application/pdf",
          "fileSize": 2048500,
          "isAcknowledged": true,
          "acknowledgedAt": "2026-10-15T09:00:00.000Z",
          "versionCount": 2
        }
      ]
    }
    ```

### `POST /api/v1/employee/documents/acknowledge`
Acknowledges and signs off on a corporate policy or document.

- **Request Body:**
  ```json
  {
    "documentId": "cuid-string"
  }
  ```
- **Responses:**
  - `200 OK`: `{ "success": true, "acknowledgment": {...}, "message": "Document acknowledged successfully." }`

---

## 10. Announcements (`/api/v1/employee/announcements`)

### `GET /api/v1/employee/announcements`
Returns targeted company announcements with per-employee read states.

- **Query Parameters:**
  - `unreadOnly`: `true` | `false`
  - `priority`: `"ALL"` | `"NORMAL"` | `"HIGH"` | `"URGENT"`
  - `search`: search query
- **Responses:**
  - `200 OK`
    ```json
    {
      "success": true,
      "announcements": [
        {
          "id": "cuid-string",
          "title": "Quarterly All-Hands Meeting",
          "content": "Scheduled for October 31 at 4:00 PM IST.",
          "priority": "HIGH",
          "publishAt": "2026-10-24T00:00:00.000Z",
          "isRead": false,
          "readAt": null
        }
      ],
      "meta": { "total": 8, "unreadCount": 3, "readCount": 5 }
    }
    ```

### `POST /api/v1/employee/announcements/read` (or `POST /api/v1/employee/announcements`)
Marks an announcement as read.

- **Request Body:**
  ```json
  {
    "announcementId": "cuid-string"
  }
  ```
- **Responses:**
  - `200 OK`: `{ "success": true, "message": "Announcement marked as read" }`

---

## 11. Notifications (`/api/v1/employee/notifications`)

### `GET /api/v1/employee/notifications`
- **Query Parameters:**
  - `unreadOnly`: `true` | `false`
  - `type`: filter by notification type
  - `page`: page number
  - `limit`: page size (default: 50, max: 100)
- **Responses:**
  - `200 OK`: `{ "success": true, "notifications": [...], "unreadCount": 2, "meta": {...} }`

### `PATCH /api/v1/employee/notifications`
Marks a single notification or all notifications as read.

- **Request Body:**
  - Single: `{ "id": "cuid-string" }`
  - Mark All: `{ "markAll": true }`
- **Responses:**
  - `200 OK`: `{ "success": true, "message": "..." }`

### `DELETE /api/v1/employee/notifications`
Deletes a notification or clears all read notifications.

- **Request Body or Query:**
  - Single: `{ "id": "cuid-string" }`
  - Clear All Read: `{ "clearAllRead": true }`
- **Responses:**
  - `200 OK`: `{ "success": true, "count": 5, "message": "Cleared 5 read notification(s)." }`

---

## 12. Support Desk (`/api/v1/employee/support`)

### `GET /api/v1/employee/support`
Returns employee's support tickets with replies and status counts.

- **Query Parameters:**
  - `status`: `"ALL"` | `"OPEN"` | `"IN_PROGRESS"` | `"RESOLVED"` | `"CLOSED"`
  - `category`: `"TECHNICAL"` | `"HR"` | `"PAYROLL"` | `"ACCESS"` | `"GENERAL"`
  - `search`: search query
- **Responses:**
  - `200 OK`
    ```json
    {
      "success": true,
      "tickets": [
        {
          "id": "cuid-string",
          "ticketNumber": "TICK-839201-492",
          "category": "TECHNICAL",
          "priority": "HIGH",
          "subject": "VPN Certificate Renewal",
          "message": "Certificate expired this morning",
          "status": "OPEN",
          "createdAt": "2026-10-24T10:00:00.000Z",
          "replies": [...]
        }
      ],
      "meta": {
        "counts": { "total": 3, "open": 1, "inProgress": 1, "resolved": 1, "closed": 0 }
      }
    }
    ```

### `POST /api/v1/employee/support`
Creates a new support inquiry ticket.

- **Request Body:**
  ```json
  {
    "category": "TECHNICAL" | "HR" | "PAYROLL" | "ACCESS" | "GENERAL",
    "priority": "LOW" | "NORMAL" | "HIGH" | "URGENT",
    "subject": "Database credential rotation request",
    "message": "Detailed description of the inquiry",
    "attachmentUrl": "optional-url"
  }
  ```
- **Responses:**
  - `201 Created`: `{ "success": true, "ticket": {...}, "message": "Your support request has been logged successfully as TICK-XXXXXX." }`

### `POST /api/v1/employee/support/reply`
Appends a reply to an existing support ticket thread.

- **Request Body:**
  ```json
  {
    "ticketId": "cuid-string",
    "message": "Attached screenshot showing error dialog",
    "attachmentUrl": "https://storage.axivon.com/screenshot.png"
  }
  ```
- **Responses:**
  - `201 Created`: `{ "success": true, "reply": {...}, "message": "Reply sent successfully" }`

### `PATCH /api/v1/employee/support`
Closes or reopens an existing support ticket.

- **Request Body:**
  ```json
  {
    "ticketId": "cuid-string",
    "action": "CLOSE" | "REOPEN"
  }
  ```
- **Responses:**
  - `200 OK`: `{ "success": true, "ticket": {...}, "message": "..." }`

---

## 13. Profile, Settings & Onboarding

### `GET /api/v1/employee/profile`
Returns employee profile details, designation, department, organization name, and joined date.

### `PATCH /api/v1/employee/profile`
Updates allowed employee profile fields (`name`, `phone`, `avatarUrl`, `address`, `emergencyContact`). Rejects privilege escalation attempts.

### `POST /api/v1/employee/profile/password`
Changes account password with strength validation, CAPTCHA verification, password history check, and invalidation of other active sessions.

### `GET /api/v1/employee/settings` & `PATCH /api/v1/employee/settings`
Manages workspace preferences (`emailNotifications`, `inAppNotifications`, `timezone`, `theme`). Persisted to `UserPreference` table.

### `GET /api/v1/employee/onboarding`
Returns onboarding steps checklist, completion status, and progress percentage.
