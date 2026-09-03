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
// ADMIN TASKS API
// ============================================================
writeFile('src/app/api/v1/admin/tasks/route.ts', `
import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") || undefined;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = 10;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (status) where.status = status;

    const [tasks, total] = await Promise.all([
      db.task.findMany({
        where,
        include: { user: { select: { id: true, name: true, email: true } }, project: { select: { id: true, name: true } } },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      db.task.count({ where }),
    ]);

    return NextResponse.json({ data: tasks, meta: { total, page, pages: Math.ceil(total / limit) } });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { title, description, userId, projectId, priority, dueDate } = body;

    if (!title || !userId) {
      return NextResponse.json({ error: "title and userId are required" }, { status: 400 });
    }

    const task = await db.task.create({
      data: {
        title,
        description: description || null,
        userId,
        projectId: projectId || null,
        priority: priority || "MEDIUM",
        dueDate: dueDate ? new Date(dueDate) : null,
      },
    });

    // Create notification for assigned user
    await db.notification.create({
      data: {
        userId,
        type: "TASK_ASSIGNED",
        title: "New Task Assigned",
        message: "You have been assigned: " + title,
        link: "/employee/tasks",
      },
    });

    // Audit
    const adminId = req.headers.get("x-user-id");
    await db.auditLog.create({
      data: { userId: adminId, action: "TASK_CREATED", resource: "Task", details: { taskId: task.id, title } },
    });

    return NextResponse.json({ data: task }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
`);

// ============================================================
// ADMIN TASKS UI
// ============================================================
writeFile('src/app/admin/tasks/page.tsx', `
"use client";

import { useEffect, useState } from "react";
import { CheckSquare } from "lucide-react";

export default function AdminTasksPage() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");

  useEffect(() => {
    const url = filter ? "/api/v1/admin/tasks?status=" + filter : "/api/v1/admin/tasks";
    fetch(url)
      .then(r => r.json())
      .then(d => { setTasks(d.data || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [filter]);

  const statusColors: Record<string, string> = {
    TODO: "bg-gray-500/10 text-gray-400",
    IN_PROGRESS: "bg-blue-500/10 text-blue-400",
    BLOCKED: "bg-red-500/10 text-red-400",
    COMPLETED: "bg-green-500/10 text-green-400",
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Tasks</h1>
          <p className="text-gray-400 mt-1">Create, assign and monitor tasks.</p>
        </div>
      </div>

      <div className="flex gap-2 flex-wrap">
        {["", "TODO", "IN_PROGRESS", "BLOCKED", "COMPLETED"].map(s => (
          <button key={s} onClick={() => setFilter(s)}
            className={\`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors \${filter === s ? "bg-white/10 border-white/20 text-white" : "border-white/5 text-gray-500 hover:text-white"}\`}>
            {s || "All"}
          </button>
        ))}
      </div>

      <div className="bg-[#111111] border border-white/10 rounded-xl overflow-hidden">
        <table className="w-full text-left text-sm text-gray-400">
          <thead className="bg-[#1a1a1a] text-gray-300 text-xs uppercase font-semibold border-b border-white/10">
            <tr>
              <th className="px-4 py-3">Task</th>
              <th className="px-4 py-3">Assignee</th>
              <th className="px-4 py-3">Project</th>
              <th className="px-4 py-3">Priority</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Due Date</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="p-4 text-center">Loading...</td></tr>
            ) : tasks.length === 0 ? (
              <tr><td colSpan={6} className="p-4 text-center">No tasks found.</td></tr>
            ) : (
              tasks.map(t => (
                <tr key={t.id} className="border-b border-white/5 hover:bg-white/5">
                  <td className="px-4 py-3 text-white font-medium">{t.title}</td>
                  <td className="px-4 py-3">{t.user?.name || "-"}</td>
                  <td className="px-4 py-3">{t.project?.name || "-"}</td>
                  <td className="px-4 py-3">{t.priority}</td>
                  <td className="px-4 py-3">
                    <span className={\`px-2 py-1 rounded-full text-xs \${statusColors[t.status] || ""}\`}>{t.status}</span>
                  </td>
                  <td className="px-4 py-3">{t.dueDate ? new Date(t.dueDate).toLocaleDateString() : "-"}</td>
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

// ============================================================
// ADMIN WORK REPORTS API
// ============================================================
writeFile('src/app/api/v1/admin/work-reports/route.ts', `
import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") || undefined;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = 10;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (status) where.status = status;

    const [reports, total] = await Promise.all([
      db.workReport.findMany({
        where,
        include: { user: { select: { id: true, name: true, email: true } } },
        orderBy: { date: "desc" },
        skip,
        take: limit,
      }),
      db.workReport.count({ where }),
    ]);

    return NextResponse.json({ data: reports, meta: { total, page, pages: Math.ceil(total / limit) } });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
`);

// ============================================================
// ADMIN WORK REPORTS UI
// ============================================================
writeFile('src/app/admin/work-reports/page.tsx', `
"use client";

import { useEffect, useState } from "react";

export default function AdminWorkReportsPage() {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/v1/admin/work-reports")
      .then(r => r.json())
      .then(d => { setReports(d.data || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white tracking-tight">Work Reports</h1>
      <p className="text-gray-400">Review employee daily work reports.</p>

      <div className="bg-[#111111] border border-white/10 rounded-xl overflow-hidden">
        <table className="w-full text-left text-sm text-gray-400">
          <thead className="bg-[#1a1a1a] text-gray-300 text-xs uppercase font-semibold border-b border-white/10">
            <tr>
              <th className="px-4 py-3">Employee</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Summary</th>
              <th className="px-4 py-3">Hours</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} className="p-4 text-center">Loading...</td></tr>
            ) : reports.length === 0 ? (
              <tr><td colSpan={5} className="p-4 text-center">No work reports found.</td></tr>
            ) : (
              reports.map(r => (
                <tr key={r.id} className="border-b border-white/5 hover:bg-white/5">
                  <td className="px-4 py-3 text-white font-medium">{r.user?.name || "-"}</td>
                  <td className="px-4 py-3">{new Date(r.date).toLocaleDateString()}</td>
                  <td className="px-4 py-3 max-w-xs truncate">{r.summary}</td>
                  <td className="px-4 py-3">{r.hoursWorked ?? "-"}</td>
                  <td className="px-4 py-3">
                    <span className={\`px-2 py-1 rounded-full text-xs \${r.status === "REVIEWED" ? "bg-green-500/10 text-green-400" : "bg-yellow-500/10 text-yellow-400"}\`}>
                      {r.status}
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

// ============================================================
// ADMIN LEAVE API
// ============================================================
writeFile('src/app/api/v1/admin/leaves/route.ts', `
import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") || undefined;

    const where: any = {};
    if (status) where.status = status;

    const leaves = await db.leaveRequest.findMany({
      where,
      include: { user: { select: { id: true, name: true, email: true } } },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    return NextResponse.json({ data: leaves });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
`);

// ============================================================
// ADMIN LEAVE UI
// ============================================================
writeFile('src/app/admin/leave/page.tsx', `
"use client";

import { useEffect, useState } from "react";

export default function AdminLeavePage() {
  const [leaves, setLeaves] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const loadLeaves = () => {
    setLoading(true);
    fetch("/api/v1/admin/leaves")
      .then(r => r.json())
      .then(d => { setLeaves(d.data || []); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(() => { loadLeaves(); }, []);

  const handleAction = async (id: string, action: "APPROVED" | "REJECTED") => {
    setActionLoading(id);
    try {
      await fetch("/api/v1/admin/leaves/" + id + "/" + action.toLowerCase().replace("d", ""), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: action === "REJECTED" ? "Not approved at this time" : undefined }),
      });
      loadLeaves();
    } catch (e) {}
    setActionLoading(null);
  };

  const statusColors: Record<string, string> = {
    PENDING: "bg-yellow-500/10 text-yellow-400",
    APPROVED: "bg-green-500/10 text-green-400",
    REJECTED: "bg-red-500/10 text-red-400",
    CANCELLED: "bg-gray-500/10 text-gray-400",
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white tracking-tight">Leave Management</h1>
      <p className="text-gray-400">Approve or reject employee leave requests.</p>

      <div className="bg-[#111111] border border-white/10 rounded-xl overflow-hidden">
        <table className="w-full text-left text-sm text-gray-400">
          <thead className="bg-[#1a1a1a] text-gray-300 text-xs uppercase font-semibold border-b border-white/10">
            <tr>
              <th className="px-4 py-3">Employee</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">From</th>
              <th className="px-4 py-3">To</th>
              <th className="px-4 py-3">Reason</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} className="p-4 text-center">Loading...</td></tr>
            ) : leaves.length === 0 ? (
              <tr><td colSpan={7} className="p-4 text-center">No leave requests found.</td></tr>
            ) : (
              leaves.map(l => (
                <tr key={l.id} className="border-b border-white/5 hover:bg-white/5">
                  <td className="px-4 py-3 text-white font-medium">{l.user?.name || "-"}</td>
                  <td className="px-4 py-3">{l.leaveType}</td>
                  <td className="px-4 py-3">{new Date(l.startDate).toLocaleDateString()}</td>
                  <td className="px-4 py-3">{new Date(l.endDate).toLocaleDateString()}</td>
                  <td className="px-4 py-3 max-w-xs truncate">{l.reason}</td>
                  <td className="px-4 py-3">
                    <span className={\`px-2 py-1 rounded-full text-xs \${statusColors[l.status] || ""}\`}>{l.status}</span>
                  </td>
                  <td className="px-4 py-3">
                    {l.status === "PENDING" ? (
                      <div className="flex gap-2">
                        <button onClick={() => handleAction(l.id, "APPROVED")} disabled={actionLoading === l.id}
                          className="px-2 py-1 bg-green-600 hover:bg-green-700 text-white text-xs rounded transition-colors disabled:opacity-50">
                          Approve
                        </button>
                        <button onClick={() => handleAction(l.id, "REJECTED")} disabled={actionLoading === l.id}
                          className="px-2 py-1 bg-red-600 hover:bg-red-700 text-white text-xs rounded transition-colors disabled:opacity-50">
                          Reject
                        </button>
                      </div>
                    ) : "-"}
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

// ============================================================
// ADMIN LEAVE APPROVE/REJECT APIs
// ============================================================
writeFile('src/app/api/v1/admin/leaves/[id]/approve/route.ts', `
import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const adminId = req.headers.get("x-user-id");

    const leave = await db.leaveRequest.findUnique({ where: { id } });
    if (!leave) return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (leave.status !== "PENDING") return NextResponse.json({ error: "Already processed" }, { status: 400 });

    await db.leaveRequest.update({ where: { id }, data: { status: "APPROVED" } });

    await db.notification.create({
      data: { userId: leave.userId, type: "LEAVE_APPROVED", title: "Leave Approved", message: "Your leave request has been approved.", link: "/employee/leave" },
    });

    await db.auditLog.create({
      data: { userId: adminId, action: "LEAVE_APPROVED", resource: "LeaveRequest", details: { leaveId: id } },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
`);

writeFile('src/app/api/v1/admin/leaves/[id]/reject/route.ts', `
import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const adminId = req.headers.get("x-user-id");
    const body = await req.json();

    const leave = await db.leaveRequest.findUnique({ where: { id } });
    if (!leave) return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (leave.status !== "PENDING") return NextResponse.json({ error: "Already processed" }, { status: 400 });

    await db.leaveRequest.update({ where: { id }, data: { status: "REJECTED" } });

    await db.notification.create({
      data: { userId: leave.userId, type: "SYSTEM", title: "Leave Rejected", message: body.reason || "Your leave request has been rejected.", link: "/employee/leave" },
    });

    await db.auditLog.create({
      data: { userId: adminId, action: "LEAVE_REJECTED", resource: "LeaveRequest", details: { leaveId: id, reason: body.reason } },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
`);

// ============================================================
// ADMIN ANNOUNCEMENTS API
// ============================================================
writeFile('src/app/api/v1/admin/announcements/route.ts', `
import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const announcements = await db.announcement.findMany({ orderBy: { createdAt: "desc" }, take: 50 });
    return NextResponse.json({ data: announcements });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { title, content, priority } = body;
    if (!title || !content) return NextResponse.json({ error: "title and content are required" }, { status: 400 });

    const announcement = await db.announcement.create({
      data: { title, content, priority: priority || "NORMAL" },
    });

    const adminId = req.headers.get("x-user-id");
    await db.auditLog.create({
      data: { userId: adminId, action: "ANNOUNCEMENT_PUBLISHED", resource: "Announcement", details: { announcementId: announcement.id, title } },
    });

    return NextResponse.json({ data: announcement }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
`);

// ============================================================
// ADMIN ANNOUNCEMENTS UI
// ============================================================
writeFile('src/app/admin/announcements/page.tsx', `
"use client";

import { useEffect, useState } from "react";
import { Plus } from "lucide-react";

export default function AdminAnnouncementsPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [priority, setPriority] = useState("NORMAL");
  const [submitting, setSubmitting] = useState(false);

  const load = () => {
    setLoading(true);
    fetch("/api/v1/admin/announcements")
      .then(r => r.json())
      .then(d => { setItems(d.data || []); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    await fetch("/api/v1/admin/announcements", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, content, priority }),
    });
    setTitle(""); setContent(""); setShowForm(false); setSubmitting(false);
    load();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Announcements</h1>
          <p className="text-gray-400 mt-1">Create and manage company announcements.</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
          <Plus className="w-4 h-4" /> New Announcement
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="bg-[#111111] border border-white/10 rounded-xl p-6 space-y-4">
          <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Title" required
            className="w-full bg-[#1a1a1a] border border-white/5 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-red-500/50" />
          <textarea value={content} onChange={e => setContent(e.target.value)} placeholder="Content" required rows={4}
            className="w-full bg-[#1a1a1a] border border-white/5 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-red-500/50" />
          <select value={priority} onChange={e => setPriority(e.target.value)}
            className="bg-[#1a1a1a] border border-white/5 rounded-lg px-4 py-2 text-sm text-white focus:outline-none">
            <option value="LOW">Low</option>
            <option value="NORMAL">Normal</option>
            <option value="HIGH">High</option>
            <option value="URGENT">Urgent</option>
          </select>
          <button type="submit" disabled={submitting} className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50">
            {submitting ? "Publishing..." : "Publish"}
          </button>
        </form>
      )}

      <div className="space-y-4">
        {loading ? <p className="text-gray-400">Loading...</p> : items.length === 0 ? <p className="text-gray-400">No announcements.</p> : (
          items.map(a => (
            <div key={a.id} className="bg-[#111111] border border-white/10 rounded-xl p-5">
              <div className="flex justify-between items-start">
                <h3 className="text-white font-semibold">{a.title}</h3>
                <span className={\`px-2 py-1 rounded-full text-xs \${a.priority === "URGENT" ? "bg-red-500/10 text-red-400" : a.priority === "HIGH" ? "bg-orange-500/10 text-orange-400" : "bg-gray-500/10 text-gray-400"}\`}>
                  {a.priority}
                </span>
              </div>
              <p className="text-gray-400 text-sm mt-2">{a.content}</p>
              <p className="text-gray-600 text-xs mt-3">{new Date(a.createdAt).toLocaleString()}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
`);

// ============================================================
// ADMIN NOTIFICATIONS API
// ============================================================
writeFile('src/app/api/v1/admin/notifications/route.ts', `
import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const notifications = await db.notification.findMany({
      include: { user: { select: { name: true, email: true } } },
      orderBy: { createdAt: "desc" },
      take: 50,
    });
    return NextResponse.json({ data: notifications });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { userId, type, title, message, link } = body;
    if (!userId || !title || !message) return NextResponse.json({ error: "userId, title, and message are required" }, { status: 400 });

    const notification = await db.notification.create({
      data: { userId, type: type || "SYSTEM", title, message, link: link || null },
    });

    return NextResponse.json({ data: notification }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
`);

// ============================================================
// ADMIN NOTIFICATIONS UI
// ============================================================
writeFile('src/app/admin/notifications/page.tsx', `
"use client";

import { useEffect, useState } from "react";

export default function AdminNotificationsPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/v1/admin/notifications")
      .then(r => r.json())
      .then(d => { setItems(d.data || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white tracking-tight">Notifications</h1>
      <p className="text-gray-400">View system notifications sent to employees.</p>

      <div className="space-y-3">
        {loading ? <p className="text-gray-400">Loading...</p> : items.length === 0 ? <p className="text-gray-400">No notifications.</p> : (
          items.map(n => (
            <div key={n.id} className={\`bg-[#111111] border border-white/10 rounded-xl p-4 \${n.isRead ? "opacity-60" : ""}\`}>
              <div className="flex justify-between">
                <div>
                  <p className="text-white font-medium text-sm">{n.title}</p>
                  <p className="text-gray-400 text-sm mt-1">{n.message}</p>
                  <p className="text-gray-600 text-xs mt-2">To: {n.user?.name} &middot; {new Date(n.createdAt).toLocaleString()}</p>
                </div>
                <span className={\`text-xs px-2 py-1 rounded-full h-fit \${n.isRead ? "bg-gray-500/10 text-gray-500" : "bg-blue-500/10 text-blue-400"}\`}>
                  {n.isRead ? "Read" : "Unread"}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
`);

// ============================================================
// ADMIN DOCUMENTS API
// ============================================================
writeFile('src/app/api/v1/admin/documents/route.ts', `
import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const documents = await db.document.findMany({
      include: { uploadedBy: { select: { name: true, email: true } } },
      orderBy: { createdAt: "desc" },
      take: 50,
    });
    return NextResponse.json({ data: documents });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
`);

// ============================================================
// ADMIN DOCUMENTS UI
// ============================================================
writeFile('src/app/admin/documents/page.tsx', `
"use client";

import { useEffect, useState } from "react";
import { FileText } from "lucide-react";

export default function AdminDocumentsPage() {
  const [docs, setDocs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/v1/admin/documents")
      .then(r => r.json())
      .then(d => { setDocs(d.data || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white tracking-tight">Documents</h1>
      <p className="text-gray-400">Manage company documents and policies.</p>

      <div className="bg-[#111111] border border-white/10 rounded-xl overflow-hidden">
        <table className="w-full text-left text-sm text-gray-400">
          <thead className="bg-[#1a1a1a] text-gray-300 text-xs uppercase font-semibold border-b border-white/10">
            <tr>
              <th className="px-4 py-3">Title</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Uploaded By</th>
              <th className="px-4 py-3">Date</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={4} className="p-4 text-center">Loading...</td></tr>
            ) : docs.length === 0 ? (
              <tr><td colSpan={4} className="p-4 text-center">No documents found.</td></tr>
            ) : (
              docs.map(d => (
                <tr key={d.id} className="border-b border-white/5 hover:bg-white/5">
                  <td className="px-4 py-3 text-white font-medium flex items-center gap-2">
                    <FileText className="w-4 h-4 text-gray-500" /> {d.title}
                  </td>
                  <td className="px-4 py-3">{d.category}</td>
                  <td className="px-4 py-3">{d.uploadedBy?.name || "-"}</td>
                  <td className="px-4 py-3">{new Date(d.createdAt).toLocaleDateString()}</td>
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

// ============================================================
// ADMIN ACTIVITY/AUDIT API
// ============================================================
writeFile('src/app/api/v1/admin/audit/route.ts', `
import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = 20;
    const skip = (page - 1) * limit;

    const [logs, total] = await Promise.all([
      db.auditLog.findMany({
        include: { user: { select: { name: true, email: true } } },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      db.auditLog.count(),
    ]);

    return NextResponse.json({ data: logs, meta: { total, page, pages: Math.ceil(total / limit) } });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
`);

// ============================================================
// ADMIN ACTIVITY/AUDIT UI
// ============================================================
writeFile('src/app/admin/activity/page.tsx', `
"use client";

import { useEffect, useState } from "react";

export default function AdminActivityPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/v1/admin/audit")
      .then(r => r.json())
      .then(d => { setLogs(d.data || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white tracking-tight">Activity / Audit Log</h1>
      <p className="text-gray-400">Track sensitive administrative actions.</p>

      <div className="bg-[#111111] border border-white/10 rounded-xl overflow-hidden">
        <table className="w-full text-left text-sm text-gray-400">
          <thead className="bg-[#1a1a1a] text-gray-300 text-xs uppercase font-semibold border-b border-white/10">
            <tr>
              <th className="px-4 py-3">Actor</th>
              <th className="px-4 py-3">Action</th>
              <th className="px-4 py-3">Resource</th>
              <th className="px-4 py-3">Timestamp</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={4} className="p-4 text-center">Loading...</td></tr>
            ) : logs.length === 0 ? (
              <tr><td colSpan={4} className="p-4 text-center">No audit events recorded.</td></tr>
            ) : (
              logs.map(l => (
                <tr key={l.id} className="border-b border-white/5 hover:bg-white/5">
                  <td className="px-4 py-3 text-white">{l.user?.name || "System"}</td>
                  <td className="px-4 py-3 font-mono text-xs">{l.action}</td>
                  <td className="px-4 py-3">{l.resource}</td>
                  <td className="px-4 py-3">{new Date(l.createdAt).toLocaleString()}</td>
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

// ============================================================
// ADMIN SETTINGS UI
// ============================================================
writeFile('src/app/admin/settings/page.tsx', `
"use client";

export default function AdminSettingsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white tracking-tight">Settings</h1>
      <p className="text-gray-400">Admin profile and security settings.</p>

      <div className="bg-[#111111] border border-white/10 rounded-xl p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Display Name</label>
          <input type="text" defaultValue="Admin User" disabled
            className="w-full bg-[#1a1a1a] border border-white/5 rounded-lg px-4 py-2 text-sm text-white/50 cursor-not-allowed" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Email</label>
          <input type="email" defaultValue="admin@axivon.dev" disabled
            className="w-full bg-[#1a1a1a] border border-white/5 rounded-lg px-4 py-2 text-sm text-white/50 cursor-not-allowed" />
        </div>
        <p className="text-xs text-gray-600">Contact your Founder to update admin credentials or modify system settings.</p>
      </div>
    </div>
  );
}
`);

console.log("\\nAll remaining admin modules scaffolded successfully.");
