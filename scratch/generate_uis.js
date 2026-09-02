const fs = require('fs');
const path = require('path');
const baseDir = 'c:/Users/vk010/Downloads/startup/axivon-technologies/axivon-technologies';
function writeFile(relPath, content) {
    const fp = path.join(baseDir, relPath);
    fs.mkdirSync(path.dirname(fp), { recursive: true });
    fs.writeFileSync(fp, content.trim() + '\n');
    console.log('Created: ' + relPath);
}

// 1. Dashboard (Update to use API)
writeFile('src/app/employee/dashboard/page.tsx', `
"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { CheckCircle2, Clock, FileText, AlertCircle, Loader2 } from "lucide-react";

export default function EmployeeDashboard() {
  const [user, setUser] = useState<any>(null);
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/v1/employee/me").then(res => res.json()),
      fetch("/api/v1/employee/dashboard").then(res => res.json())
    ]).then(([meData, dashData]) => {
      if (meData.user) setUser(meData.user);
      if (dashData.success) setData(dashData.data);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px] text-gray-400">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500 mr-3" />
        <span>Loading dashboard...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-white tracking-tight">
          Good Morning, {user?.name || "Employee"}
        </h1>
        <p className="text-gray-400">Here is what's happening today.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Quick Stats Cards */}
        <Card className="p-5 flex flex-col gap-2 bg-[#111111] border-white/5">
          <div className="flex items-center justify-between text-gray-400">
            <span className="text-sm font-medium">Attendance</span>
            <Clock className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-bold text-white">
            {data?.attendance ? (data.attendance.checkOutAt ? 'Completed' : 'Checked In') : 'Not Checked In'}
          </div>
          <p className="text-xs text-gray-500">Check in to start tracking time</p>
        </Card>

        <Card className="p-5 flex flex-col gap-2 bg-[#111111] border-white/5">
          <div className="flex items-center justify-between text-gray-400">
            <span className="text-sm font-medium">Assigned Tasks</span>
            <CheckCircle2 className="w-4 h-4 text-green-400" />
          </div>
          <div className="text-2xl font-bold text-white">{data?.activeTasks || 0} Active</div>
          <p className="text-xs text-gray-500">{data?.todayTasks?.length || 0} due today</p>
        </Card>

        <Card className="p-5 flex flex-col gap-2 bg-[#111111] border-white/5">
          <div className="flex items-center justify-between text-gray-400">
            <span className="text-sm font-medium">Daily Report</span>
            <FileText className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-bold text-white">{data?.pendingReports > 0 ? 'Submitted' : 'Pending'}</div>
          <p className="text-xs text-gray-500">Submit before EOD</p>
        </Card>

        <Card className="p-5 flex flex-col gap-2 bg-[#111111] border-white/5">
          <div className="flex items-center justify-between text-gray-400">
            <span className="text-sm font-medium">Unread Notifications</span>
            <AlertCircle className="w-4 h-4 text-orange-400" />
          </div>
          <div className="text-2xl font-bold text-white">{data?.unreadNotifs || 0} New</div>
          <p className="text-xs text-gray-500">Check announcements</p>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-4">
        <div className="col-span-2 space-y-6">
          <Card className="p-6 bg-[#0a0a0a] border-white/5">
            <h3 className="text-lg font-medium text-white mb-4">Today's Tasks</h3>
            <div className="space-y-3">
              {data?.todayTasks?.length > 0 ? (
                data.todayTasks.map((task: any) => (
                  <div key={task.id} className="flex items-center justify-between p-3 rounded-lg border border-white/5 bg-[#111111]">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-orange-400"></div>
                      <span className="text-sm text-gray-300">{task.title}</span>
                    </div>
                    <span className="text-xs font-medium px-2 py-1 rounded bg-orange-500/10 text-orange-400">{task.status}</span>
                  </div>
                ))
              ) : (
                <div className="text-sm text-gray-500 p-4 text-center border border-dashed border-white/10 rounded-lg">No tasks due today.</div>
              )}
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="p-6 bg-[#0a0a0a] border-white/5">
            <h3 className="text-lg font-medium text-white mb-4">Quick Actions</h3>
            <div className="flex flex-col gap-3">
              <Button onClick={() => window.location.href = '/employee/attendance'} className="w-full justify-start gap-2">
                <Clock className="w-4 h-4" /> Go to Attendance
              </Button>
              <Button onClick={() => window.location.href = '/employee/work-reports'} variant="outline" className="w-full justify-start gap-2">
                <FileText className="w-4 h-4" /> Submit Report
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
`);

// 2. Attendance Page
writeFile('src/app/employee/attendance/page.tsx', `
"use client";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Loader2, CheckCircle2 } from "lucide-react";

export default function AttendancePage() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");

  const loadData = () => {
    setLoading(true);
    fetch("/api/v1/employee/attendance")
      .then(res => res.json())
      .then(data => { if(data.success) setRecords(data.records); })
      .catch(e => setError("Failed to load"))
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadData(); }, []);

  const handleAction = async (action: 'check-in' | 'check-out') => {
    setActionLoading(true);
    setError("");
    try {
      const res = await fetch("/api/v1/employee/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, notes: "" })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      loadData();
    } catch(e: any) {
      setError(e.message);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-400">Loading attendance...</div>;

  const todayStr = new Date().toISOString().split('T')[0];
  const todayRecord = records.find((r: any) => r.date.startsWith(todayStr));
  const isCheckedIn = !!todayRecord;
  const isCheckedOut = isCheckedIn && !!todayRecord.checkOutAt;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-white">Attendance</h1>
      {error && <div className="p-4 bg-red-500/10 text-red-400 rounded-lg">{error}</div>}
      
      <Card className="p-6 bg-[#0a0a0a]">
        <h2 className="text-xl text-white mb-4">Today's Status</h2>
        <div className="flex gap-4">
          {!isCheckedIn && (
            <Button onClick={() => handleAction('check-in')} disabled={actionLoading}>
              {actionLoading ? <Loader2 className="animate-spin w-4 h-4 mr-2" /> : <CheckCircle2 className="w-4 h-4 mr-2" />}
              Check In
            </Button>
          )}
          {isCheckedIn && !isCheckedOut && (
            <Button onClick={() => handleAction('check-out')} disabled={actionLoading} variant="danger">
              Check Out
            </Button>
          )}
          {isCheckedOut && (
            <div className="text-emerald-400 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5" /> Completed for today
            </div>
          )}
        </div>
      </Card>

      <Card className="p-6 bg-[#0a0a0a]">
        <h2 className="text-xl text-white mb-4">Recent History</h2>
        {records.length === 0 ? (
          <div className="text-gray-500">No attendance records found.</div>
        ) : (
          <div className="space-y-2">
            {records.map((r: any) => (
              <div key={r.id} className="flex justify-between p-3 border border-white/5 rounded bg-[#111111]">
                <span className="text-gray-300">{new Date(r.date).toLocaleDateString()}</span>
                <span className="text-sm text-gray-400">
                  In: {new Date(r.checkInAt).toLocaleTimeString()} 
                  {r.checkOutAt ? \` | Out: \${new Date(r.checkOutAt).toLocaleTimeString()} (\${r.totalMinutes} mins)\` : ' | Active'}
                </span>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
`);

// 3. Tasks Page
writeFile('src/app/employee/tasks/page.tsx', `
"use client";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export default function TasksPage() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadData = () => {
    setLoading(true);
    fetch("/api/v1/employee/tasks").then(res => res.json()).then(data => {
      if(data.success) setTasks(data.tasks);
      setLoading(false);
    });
  };

  useEffect(() => { loadData(); }, []);

  const updateStatus = async (taskId: string, status: string) => {
    await fetch("/api/v1/employee/tasks", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ taskId, status })
    });
    loadData();
  };

  if (loading) return <div className="p-8 text-center text-gray-400">Loading tasks...</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-white">My Tasks</h1>
      {tasks.length === 0 ? (
        <Card className="p-8 text-center text-gray-500 bg-[#0a0a0a]">No assigned tasks.</Card>
      ) : (
        <div className="grid gap-4">
          {tasks.map((t: any) => (
            <Card key={t.id} className="p-4 bg-[#0a0a0a] flex justify-between items-center">
              <div>
                <h3 className="text-white font-medium">{t.title}</h3>
                <p className="text-sm text-gray-400">Priority: {t.priority} | Due: {t.dueDate ? new Date(t.dueDate).toLocaleDateString() : 'None'}</p>
              </div>
              <div className="flex gap-2 items-center">
                <span className="text-xs bg-white/10 px-2 py-1 rounded text-white">{t.status}</span>
                {t.status !== 'COMPLETED' && (
                  <Button size="sm" onClick={() => updateStatus(t.id, 'COMPLETED')}>Complete</Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
`);

// 4. Work Reports Page
writeFile('src/app/employee/work-reports/page.tsx', `
"use client";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export default function ReportsPage() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState("");
  const [work, setWork] = useState("");

  const loadData = () => {
    setLoading(true);
    fetch("/api/v1/employee/work-reports").then(res => res.json()).then(data => {
      if(data.success) setReports(data.reports);
      setLoading(false);
    });
  };

  useEffect(() => { loadData(); }, []);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    await fetch("/api/v1/employee/work-reports", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ date: new Date().toISOString(), summary, workPerformed: work, hoursWorked: 8 })
    });
    setSummary(""); setWork("");
    loadData();
  };

  if (loading) return <div className="p-8 text-center text-gray-400">Loading reports...</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-white">Work Reports</h1>
      
      <Card className="p-6 bg-[#0a0a0a]">
        <h2 className="text-xl text-white mb-4">Submit Daily Report</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input placeholder="Summary of the day" value={summary} onChange={e => setSummary(e.target.value)} required />
          <Input placeholder="Detailed work performed" value={work} onChange={e => setWork(e.target.value)} required />
          <Button type="submit">Submit Report</Button>
        </form>
      </Card>

      <Card className="p-6 bg-[#0a0a0a]">
        <h2 className="text-xl text-white mb-4">Past Reports</h2>
        {reports.length === 0 ? <div className="text-gray-500">No reports found.</div> : (
          <div className="space-y-3">
            {reports.map((r: any) => (
              <div key={r.id} className="p-3 border border-white/5 rounded bg-[#111111]">
                <div className="text-white font-medium">{new Date(r.date).toLocaleDateString()} - {r.summary}</div>
                <div className="text-sm text-gray-400 mt-1">{r.workPerformed}</div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
`);

// 5. Leave Page
writeFile('src/app/employee/leave/page.tsx', `
"use client";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export default function LeavePage() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [form, setForm] = useState({ type: "SICK", start: "", end: "", reason: "" });

  const loadData = () => {
    setLoading(true);
    fetch("/api/v1/employee/leave").then(res => res.json()).then(data => {
      if(data.success) setRequests(data.requests);
      setLoading(false);
    });
  };

  useEffect(() => { loadData(); }, []);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    await fetch("/api/v1/employee/leave", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ leaveType: form.type, startDate: form.start, endDate: form.end, reason: form.reason })
    });
    loadData();
  };

  if (loading) return <div className="p-8 text-center text-gray-400">Loading leave requests...</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-white">Leave Management</h1>
      
      <Card className="p-6 bg-[#0a0a0a]">
        <h2 className="text-xl text-white mb-4">New Request</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input type="date" value={form.start} onChange={e => setForm({...form, start: e.target.value})} required />
          <Input type="date" value={form.end} onChange={e => setForm({...form, end: e.target.value})} required />
          <Input placeholder="Reason" value={form.reason} onChange={e => setForm({...form, reason: e.target.value})} required />
          <Button type="submit">Submit Request</Button>
        </form>
      </Card>

      <Card className="p-6 bg-[#0a0a0a]">
        <h2 className="text-xl text-white mb-4">My Requests</h2>
        {requests.length === 0 ? <div className="text-gray-500">No requests found.</div> : (
          <div className="space-y-3">
            {requests.map((r: any) => (
              <div key={r.id} className="p-3 border border-white/5 rounded flex justify-between items-center bg-[#111111]">
                <div>
                  <div className="text-white font-medium">{r.leaveType}</div>
                  <div className="text-sm text-gray-400">{new Date(r.startDate).toLocaleDateString()} to {new Date(r.endDate).toLocaleDateString()}</div>
                </div>
                <span className="text-xs px-2 py-1 bg-white/10 text-white rounded">{r.status}</span>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
`);

// 6. Notifications Page
writeFile('src/app/employee/notifications/page.tsx', `
"use client";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export default function NotificationsPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadData = () => {
    setLoading(true);
    fetch("/api/v1/employee/notifications").then(res => res.json()).then(data => {
      if(data.success) setItems(data.notifications);
      setLoading(false);
    });
  };

  useEffect(() => { loadData(); }, []);

  const markRead = async (id: string) => {
    await fetch("/api/v1/employee/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id })
    });
    loadData();
  };

  if (loading) return <div className="p-8 text-center text-gray-400">Loading notifications...</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-white">Notifications</h1>
      {items.length === 0 ? <Card className="p-8 text-center text-gray-500 bg-[#0a0a0a]">No notifications.</Card> : (
        <div className="space-y-3">
          {items.map((n: any) => (
            <Card key={n.id} className={\`p-4 \${n.isRead ? 'bg-[#111111]' : 'bg-[#1a1a1a] border-blue-500/30'}\`}>
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-white font-medium">{n.title}</h3>
                  <p className="text-sm text-gray-400 mt-1">{n.message}</p>
                </div>
                {!n.isRead && <Button size="sm" variant="outline" onClick={() => markRead(n.id)}>Mark Read</Button>}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
`);

// 7. Announcements Page
writeFile('src/app/employee/announcements/page.tsx', `
"use client";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";

export default function AnnouncementsPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/v1/employee/announcements").then(res => res.json()).then(data => {
      if(data.success) setItems(data.announcements);
      setLoading(false);
    });
  }, []);

  if (loading) return <div className="p-8 text-center text-gray-400">Loading announcements...</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-white">Company Announcements</h1>
      {items.length === 0 ? <Card className="p-8 text-center text-gray-500 bg-[#0a0a0a]">No announcements.</Card> : (
        <div className="space-y-4">
          {items.map((a: any) => (
            <Card key={a.id} className="p-5 bg-[#0a0a0a]">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-lg font-semibold text-white">{a.title}</h3>
                <span className="text-xs text-gray-500">{new Date(a.publishedAt).toLocaleDateString()}</span>
              </div>
              <p className="text-gray-300">{a.content}</p>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
`);

// 8. Documents Page
writeFile('src/app/employee/documents/page.tsx', `
"use client";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { FileText } from "lucide-react";

export default function DocumentsPage() {
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/v1/employee/documents").then(res => res.json()).then(data => {
      if(data.success) setDocs(data.documents);
      setLoading(false);
    });
  }, []);

  if (loading) return <div className="p-8 text-center text-gray-400">Loading documents...</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-white">Documents & Resources</h1>
      {docs.length === 0 ? <Card className="p-8 text-center text-gray-500 bg-[#0a0a0a]">No documents available.</Card> : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {docs.map((d: any) => (
            <Card key={d.id} className="p-4 bg-[#0a0a0a] flex items-start gap-4">
              <FileText className="w-8 h-8 text-blue-400 shrink-0" />
              <div>
                <h3 className="text-white font-medium">{d.title}</h3>
                <p className="text-xs text-gray-500 mt-1 capitalize">{d.category.toLowerCase().replace('_', ' ')}</p>
                <a href={d.fileUrl} target="_blank" rel="noreferrer" className="text-sm text-blue-400 hover:underline mt-2 inline-block">View Document</a>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
`);

// 9. Settings Page
writeFile('src/app/employee/settings/page.tsx', `
"use client";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-white">Settings</h1>
      <Card className="p-6 bg-[#0a0a0a]">
        <h2 className="text-xl text-white mb-4">Account Preferences</h2>
        <p className="text-gray-400 mb-6">Settings are currently managed by your organization administrator.</p>
        <Button variant="outline" disabled>Change Password (Disabled)</Button>
      </Card>
    </div>
  );
}
`);
