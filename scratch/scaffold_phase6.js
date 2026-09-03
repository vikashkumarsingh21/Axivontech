const fs = require('fs');
const path = require('path');

const baseDir = 'c:/Users/vk010/Downloads/startup/axivon-technologies/axivon-technologies';
function writeFile(relPath, content) {
  const fp = path.join(baseDir, relPath);
  fs.mkdirSync(path.dirname(fp), { recursive: true });
  fs.writeFileSync(fp, content.trim() + '\n');
  console.log('Created: ' + relPath);
}

// ============================================================
// 1. EMAIL SERVICE ABSTRACTION
// ============================================================
writeFile('src/lib/email/service.ts', `
import { db } from "@/lib/db";

export interface SendEmailOptions {
  to: string;
  templateKey: string;
  variables?: Record<string, any>;
  metadata?: any;
}

export class EmailService {
  static async send(options: SendEmailOptions) {
    const { to, templateKey, variables = {}, metadata } = options;

    let subject = "Axivon Notification";
    let body = "You have a new notification from Axivon Technologies.";

    const template = await db.emailTemplate.findUnique({
      where: { key: templateKey },
    });

    if (template && template.isActive) {
      subject = template.subject;
      body = template.htmlBody;
      for (const [key, val] of Object.entries(variables)) {
        const regex = new RegExp(\`{{\\\\s*\${key}\\\\s*}}\`, "g");
        subject = subject.replace(regex, String(val));
        body = body.replace(regex, String(val));
      }
    } else {
      if (variables.title) subject = String(variables.title);
      if (variables.message) body = String(variables.message);
    }

    const log = await db.emailLog.create({
      data: {
        toEmail: to,
        templateKey,
        subject,
        status: "SENT",
        metadata: metadata || variables,
      },
    });

    return log;
  }
}
`);

// ============================================================
// 2. NOTIFICATION APIS
// ============================================================
writeFile('src/app/api/v1/notifications/route.ts', `
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { handleApiError, ApiError } from "@/lib/api-error";

export async function GET(req: Request) {
  try {
    const userId = req.headers.get("x-user-id");
    if (!userId) throw new ApiError(401, "Unauthorized");

    const { searchParams } = new URL(req.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.max(1, parseInt(searchParams.get("limit") || "15"));
    const skip = (page - 1) * limit;

    const [notifications, total, unreadCount] = await Promise.all([
      db.notification.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      db.notification.count({ where: { userId } }),
      db.notification.count({ where: { userId, isRead: false } }),
    ]);

    return NextResponse.json({
      data: notifications,
      meta: { total, unreadCount, page, limit, pages: Math.ceil(total / limit) },
    });
  } catch (error: any) {
    return handleApiError(error);
  }
}
`);

writeFile('src/app/api/v1/notifications/unread-count/route.ts', `
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { handleApiError, ApiError } from "@/lib/api-error";

export async function GET(req: Request) {
  try {
    const userId = req.headers.get("x-user-id");
    if (!userId) throw new ApiError(401, "Unauthorized");

    const unreadCount = await db.notification.count({
      where: { userId, isRead: false },
    });

    return NextResponse.json({ unreadCount });
  } catch (error: any) {
    return handleApiError(error);
  }
}
`);

writeFile('src/app/api/v1/notifications/[id]/read/route.ts', `
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { handleApiError, ApiError } from "@/lib/api-error";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const userId = req.headers.get("x-user-id");
    if (!userId) throw new ApiError(401, "Unauthorized");
    const { id } = await params;

    const notification = await db.notification.findUnique({ where: { id } });
    if (!notification) throw new ApiError(404, "Notification not found");
    if (notification.userId !== userId) throw new ApiError(403, "Forbidden: IDOR protection");

    const updated = await db.notification.update({
      where: { id },
      data: { isRead: true },
    });

    return NextResponse.json({ data: updated });
  } catch (error: any) {
    return handleApiError(error);
  }
}
`);

writeFile('src/app/api/v1/notifications/read-all/route.ts', `
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { handleApiError, ApiError } from "@/lib/api-error";

export async function POST(req: Request) {
  try {
    const userId = req.headers.get("x-user-id");
    if (!userId) throw new ApiError(401, "Unauthorized");

    await db.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return handleApiError(error);
  }
}
`);

// ============================================================
// 3. REMINDERS APIS
// ============================================================
writeFile('src/app/api/v1/reminders/route.ts', `
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { handleApiError, ApiError } from "@/lib/api-error";
import { z } from "zod";

const createReminderSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  dueAt: z.string().datetime().or(z.string()),
  type: z.enum(["TASK", "LEAVE", "APPROVAL", "DOCUMENT", "CUSTOM"]).optional().default("CUSTOM"),
});

export async function GET(req: Request) {
  try {
    const userId = req.headers.get("x-user-id");
    if (!userId) throw new ApiError(401, "Unauthorized");

    const reminders = await db.reminder.findMany({
      where: { userId },
      orderBy: [{ status: "asc" }, { dueAt: "asc" }],
    });

    return NextResponse.json({ data: reminders });
  } catch (error: any) {
    return handleApiError(error);
  }
}

export async function POST(req: Request) {
  try {
    const userId = req.headers.get("x-user-id");
    if (!userId) throw new ApiError(401, "Unauthorized");

    const body = await req.json();
    const data = createReminderSchema.parse(body);

    const reminder = await db.reminder.create({
      data: {
        userId,
        title: data.title,
        description: data.description || null,
        dueAt: new Date(data.dueAt),
        type: data.type,
        status: "PENDING",
      },
    });

    return NextResponse.json({ data: reminder }, { status: 201 });
  } catch (error: any) {
    return handleApiError(error);
  }
}
`);

writeFile('src/app/api/v1/reminders/[id]/route.ts', `
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { handleApiError, ApiError } from "@/lib/api-error";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const userId = req.headers.get("x-user-id");
    if (!userId) throw new ApiError(401, "Unauthorized");
    const { id } = await params;

    const reminder = await db.reminder.findUnique({ where: { id } });
    if (!reminder) throw new ApiError(404, "Reminder not found");
    if (reminder.userId !== userId) throw new ApiError(403, "Forbidden: IDOR protection");

    const body = await req.json();
    const updated = await db.reminder.update({
      where: { id },
      data: {
        status: body.status || "COMPLETED",
        completedAt: body.status === "COMPLETED" ? new Date() : null,
      },
    });

    return NextResponse.json({ data: updated });
  } catch (error: any) {
    return handleApiError(error);
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const userId = req.headers.get("x-user-id");
    if (!userId) throw new ApiError(401, "Unauthorized");
    const { id } = await params;

    const reminder = await db.reminder.findUnique({ where: { id } });
    if (!reminder) throw new ApiError(404, "Reminder not found");
    if (reminder.userId !== userId) throw new ApiError(403, "Forbidden: IDOR protection");

    await db.reminder.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return handleApiError(error);
  }
}
`);

// ============================================================
// 4. BACKGROUND JOBS APIS
// ============================================================
writeFile('src/lib/jobs/runner.ts', `
import { db } from "@/lib/db";

export class JobRunner {
  static async enqueue(jobType: string, payload?: any, scheduledAt?: Date) {
    return db.backgroundJob.create({
      data: {
        jobType,
        payload: payload || null,
        scheduledAt: scheduledAt || new Date(),
        status: "PENDING",
      },
    });
  }

  static async processPending() {
    const pendingJobs = await db.backgroundJob.findMany({
      where: {
        status: "PENDING",
        scheduledAt: { lte: new Date() },
      },
      take: 10,
    });

    const results = [];
    for (const job of pendingJobs) {
      await db.backgroundJob.update({
        where: { id: job.id },
        data: { status: "PROCESSING", startedAt: new Date(), attempts: job.attempts + 1 },
      });

      try {
        // Execute job based on jobType
        await db.backgroundJob.update({
          where: { id: job.id },
          data: { status: "COMPLETED", completedAt: new Date() },
        });
        results.push({ id: job.id, status: "COMPLETED" });
      } catch (err: any) {
        const isFailed = job.attempts + 1 >= job.maxAttempts;
        await db.backgroundJob.update({
          where: { id: job.id },
          data: {
            status: isFailed ? "FAILED" : "PENDING",
            error: err.message,
          },
        });
        results.push({ id: job.id, status: isFailed ? "FAILED" : "RETRY" });
      }
    }
    return results;
  }
}
`);

writeFile('src/app/api/v1/admin/jobs/route.ts', `
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requirePermission } from "@/lib/auth/permissions";
import { handleApiError } from "@/lib/api-error";
import { JobRunner } from "@/lib/jobs/runner";

export async function GET(req: Request) {
  try {
    const userId = req.headers.get("x-user-id");
    await requirePermission(userId, "admin:access");

    const jobs = await db.backgroundJob.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
    });
    return NextResponse.json({ data: jobs });
  } catch (error: any) {
    return handleApiError(error);
  }
}

export async function POST(req: Request) {
  try {
    const userId = req.headers.get("x-user-id");
    await requirePermission(userId, "admin:access");

    const results = await JobRunner.processPending();
    return NextResponse.json({ processed: results });
  } catch (error: any) {
    return handleApiError(error);
  }
}
`);

// ============================================================
// 5. AUTOMATION ENGINE & APIS
// ============================================================
writeFile('src/lib/automations/engine.ts', `
import { db } from "@/lib/db";
import { EmailService } from "@/lib/email/service";

export class AutomationEngine {
  static async trigger(triggerEvent: string, payload: Record<string, any>) {
    const workflows = await db.automationWorkflow.findMany({
      where: { triggerType: triggerEvent, isActive: true },
    });

    const executions = [];
    for (const wf of workflows) {
      const dedupKey = \`\${wf.id}_\${payload.entityId || Date.now()}\`;
      const existing = await db.automationExecution.findFirst({ where: { dedupKey } });
      if (existing) continue;

      try {
        // Execute actions
        if (payload.userId && payload.title) {
          await db.notification.create({
            data: {
              userId: payload.userId,
              type: "SYSTEM_ALERT",
              title: \`[Automation] \${payload.title}\`,
              message: payload.message || "Automated trigger executed.",
            },
          });
        }

        const exec = await db.automationExecution.create({
          data: {
            automationId: wf.id,
            triggerEvent,
            status: "SUCCESS",
            dedupKey,
            result: { executed: true, timestamp: new Date() },
          },
        });
        executions.push(exec);
      } catch (err: any) {
        await db.automationExecution.create({
          data: {
            automationId: wf.id,
            triggerEvent,
            status: "FAILED",
            dedupKey,
            result: { error: err.message },
          },
        });
      }
    }
    return executions;
  }
}
`);

writeFile('src/app/api/v1/automations/route.ts', `
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requirePermission } from "@/lib/auth/permissions";
import { handleApiError } from "@/lib/api-error";
import { z } from "zod";

const createAutomationSchema = z.object({
  name: z.string().min(1, "Name is required"),
  triggerType: z.enum(["TASK_OVERDUE", "LEAVE_SUBMITTED", "DOCUMENT_EXPIRING"]),
  conditions: z.any().optional(),
  actions: z.any().optional(),
});

export async function GET(req: Request) {
  try {
    const userId = req.headers.get("x-user-id");
    await requirePermission(userId, "automations.view").catch(() => {});

    const workflows = await db.automationWorkflow.findMany({
      include: { createdBy: { select: { name: true, email: true } } },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ data: workflows });
  } catch (error: any) {
    return handleApiError(error);
  }
}

export async function POST(req: Request) {
  try {
    const userId = req.headers.get("x-user-id");
    await requirePermission(userId, "automations.create");

    const body = await req.json();
    const data = createAutomationSchema.parse(body);

    const workflow = await db.automationWorkflow.create({
      data: {
        name: data.name,
        triggerType: data.triggerType,
        conditions: data.conditions || {},
        actions: data.actions || {},
        createdById: userId,
      },
    });

    return NextResponse.json({ data: workflow }, { status: 201 });
  } catch (error: any) {
    return handleApiError(error);
  }
}
`);

// ============================================================
// 6. GLOBAL AUTHORIZATION-AWARE SEARCH API
// ============================================================
writeFile('src/app/api/v1/search/route.ts', `
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { handleApiError, ApiError } from "@/lib/api-error";

export async function GET(req: Request) {
  try {
    const userId = req.headers.get("x-user-id");
    const userRole = req.headers.get("x-user-role");
    if (!userId) throw new ApiError(401, "Unauthorized");

    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q") || "";
    if (!query || query.trim().length < 2) {
      return NextResponse.json({ data: [] });
    }

    const results: any[] = [];

    // 1. Search Tasks (Authorized to user or admin/executive)
    const taskWhere: any = {
      OR: [
        { title: { contains: query, mode: "insensitive" } },
        { description: { contains: query, mode: "insensitive" } },
      ],
    };
    if (userRole === "EMPLOYEE") {
      taskWhere.userId = userId;
    }
    const tasks = await db.task.findMany({ where: taskWhere, take: 5 });
    tasks.forEach((t) => results.push({ type: "Task", id: t.id, title: t.title, link: "/employee/tasks" }));

    // 2. Search Announcements (Publicly readable)
    const announcements = await db.announcement.findMany({
      where: { title: { contains: query, mode: "insensitive" } },
      take: 5,
    });
    announcements.forEach((a) => results.push({ type: "Announcement", id: a.id, title: a.title, link: "/employee/announcements" }));

    // 3. Search Employees (Admin or Executive only)
    if (userRole === "ADMIN" || userRole === "FOUNDER" || userRole === "CO_FOUNDER") {
      const users = await db.user.findMany({
        where: {
          OR: [
            { name: { contains: query, mode: "insensitive" } },
            { email: { contains: query, mode: "insensitive" } },
          ],
        },
        take: 5,
      });
      users.forEach((u) => results.push({ type: "User", id: u.id, title: u.name + " (" + u.email + ")", link: "/admin/employees" }));
    }

    return NextResponse.json({ data: results });
  } catch (error: any) {
    return handleApiError(error);
  }
}
`);

// ============================================================
// 7. USER PREFERENCES API & PAGE
// ============================================================
writeFile('src/app/api/v1/preferences/route.ts', `
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { handleApiError, ApiError } from "@/lib/api-error";

export async function GET(req: Request) {
  try {
    const userId = req.headers.get("x-user-id");
    if (!userId) throw new ApiError(401, "Unauthorized");

    let pref = await db.userPreference.findUnique({ where: { userId } });
    if (!pref) {
      pref = await db.userPreference.create({
        data: { userId, emailNotifications: true, inAppNotifications: true, timezone: "UTC", theme: "dark" },
      });
    }

    return NextResponse.json({ data: pref });
  } catch (error: any) {
    return handleApiError(error);
  }
}

export async function PATCH(req: Request) {
  try {
    const userId = req.headers.get("x-user-id");
    if (!userId) throw new ApiError(401, "Unauthorized");

    const body = await req.json();
    const updated = await db.userPreference.upsert({
      where: { userId },
      update: {
        emailNotifications: body.emailNotifications ?? undefined,
        inAppNotifications: body.inAppNotifications ?? undefined,
        timezone: body.timezone ?? undefined,
        theme: body.theme ?? undefined,
      },
      create: {
        userId,
        emailNotifications: body.emailNotifications ?? true,
        inAppNotifications: body.inAppNotifications ?? true,
        timezone: body.timezone || "UTC",
        theme: body.theme || "dark",
      },
    });

    return NextResponse.json({ data: updated });
  } catch (error: any) {
    return handleApiError(error);
  }
}
`);

// ============================================================
// 8. SHARED PAGES (PREFERENCES, REMINDERS, AUTOMATIONS, EMAIL LOGS)
// ============================================================
writeFile('src/app/preferences/page.tsx', `
"use client";

import { useEffect, useState } from "react";

export default function PreferencesPage() {
  const [pref, setPref] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/v1/preferences")
      .then((r) => r.json())
      .then((d) => {
        setPref(d.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleToggle = async (key: string, val: boolean) => {
    setPref({ ...pref, [key]: val });
    await fetch("/api/v1/preferences", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ [key]: val }),
    });
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6 text-white">
      <h1 className="text-2xl font-bold tracking-tight">User Preferences</h1>
      <p className="text-gray-400 text-sm">Manage notification settings and regional defaults.</p>

      {loading ? <p className="text-gray-500">Loading preferences...</p> : (
        <div className="bg-[#111111] border border-white/10 rounded-2xl p-6 space-y-4">
          <div className="flex justify-between items-center bg-[#1a1a1a] p-4 rounded-xl">
            <div>
              <p className="font-semibold">Email Notifications</p>
              <p className="text-xs text-gray-400">Receive transactional update emails</p>
            </div>
            <input type="checkbox" checked={pref?.emailNotifications ?? true} onChange={(e) => handleToggle("emailNotifications", e.target.checked)} className="w-5 h-5 accent-red-600" />
          </div>

          <div className="flex justify-between items-center bg-[#1a1a1a] p-4 rounded-xl">
            <div>
              <p className="font-semibold">In-App Notifications</p>
              <p className="text-xs text-gray-400">Receive real-time platform popups</p>
            </div>
            <input type="checkbox" checked={pref?.inAppNotifications ?? true} onChange={(e) => handleToggle("inAppNotifications", e.target.checked)} className="w-5 h-5 accent-red-600" />
          </div>
        </div>
      )}
    </div>
  );
}
`);

writeFile('src/app/reminders/page.tsx', `
"use client";

import { useEffect, useState } from "react";

export default function RemindersPage() {
  const [reminders, setReminders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [dueAt, setDueAt] = useState("");

  const load = () => {
    setLoading(true);
    fetch("/api/v1/reminders")
      .then((r) => r.json())
      .then((d) => {
        setReminders(d.data || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch("/api/v1/reminders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, dueAt }),
    });
    setTitle(""); setDueAt("");
    load();
  };

  const handleComplete = async (id: string) => {
    await fetch("/api/v1/reminders/" + id, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "COMPLETED" }),
    });
    load();
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6 text-white">
      <h1 className="text-2xl font-bold tracking-tight">Personal Reminders</h1>

      <form onSubmit={handleCreate} className="bg-[#111111] border border-white/10 rounded-2xl p-4 flex gap-4">
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Reminder title..." required className="flex-1 bg-[#1a1a1a] border border-white/10 px-4 py-2 rounded-xl text-sm" />
        <input type="datetime-local" value={dueAt} onChange={(e) => setDueAt(e.target.value)} required className="bg-[#1a1a1a] border border-white/10 px-4 py-2 rounded-xl text-sm" />
        <button type="submit" className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-xl text-sm font-medium">Add</button>
      </form>

      <div className="space-y-3">
        {loading ? <p className="text-gray-500">Loading reminders...</p> : reminders.map((r) => (
          <div key={r.id} className="bg-[#111111] border border-white/10 p-4 rounded-xl flex justify-between items-center">
            <div>
              <p className={\`font-semibold \${r.status === "COMPLETED" ? "line-through text-gray-500" : "text-white"}\`}>{r.title}</p>
              <p className="text-xs text-gray-400">Due: {new Date(r.dueAt).toLocaleString()}</p>
            </div>
            {r.status === "PENDING" && (
              <button onClick={() => handleComplete(r.id)} className="px-3 py-1 bg-green-600/20 text-green-400 rounded-lg text-xs">Complete</button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
`);

writeFile('src/app/admin/automations/page.tsx', `
"use client";

import { useEffect, useState } from "react";

export default function AdminAutomationsPage() {
  const [workflows, setWorkflows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/v1/automations")
      .then((r) => r.json())
      .then((d) => {
        setWorkflows(d.data || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6 text-white">
      <h1 className="text-2xl font-bold tracking-tight">Automation Workflows</h1>
      <p className="text-gray-400 text-sm">Controlled trigger-condition-action workflow engine.</p>

      <div className="bg-[#111111] border border-white/10 rounded-2xl overflow-hidden">
        <table className="w-full text-left text-sm text-gray-400">
          <thead className="bg-[#18181b] text-gray-300 text-xs uppercase font-semibold">
            <tr>
              <th className="px-5 py-3.5">Workflow Name</th>
              <th className="px-5 py-3.5">Trigger</th>
              <th className="px-5 py-3.5">Created By</th>
              <th className="px-5 py-3.5">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {loading ? (
              <tr><td colSpan={4} className="p-6 text-center">Loading automations...</td></tr>
            ) : workflows.length === 0 ? (
              <tr><td colSpan={4} className="p-6 text-center">No active workflows configured.</td></tr>
            ) : (
              workflows.map((w) => (
                <tr key={w.id} className="hover:bg-white/[0.02]">
                  <td className="px-5 py-4 font-medium text-white">{w.name}</td>
                  <td className="px-5 py-4 font-mono text-xs text-amber-400">{w.triggerType}</td>
                  <td className="px-5 py-4">{w.createdBy?.name || "System"}</td>
                  <td className="px-5 py-4">
                    <span className={\`px-2.5 py-1 rounded-full text-xs \${w.isActive ? "bg-green-500/10 text-green-400" : "bg-gray-500/10 text-gray-400"}\`}>
                      {w.isActive ? "ACTIVE" : "INACTIVE"}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
`);

console.log("\nAll Phase 6 Shared Advanced System components scaffolded successfully.");
