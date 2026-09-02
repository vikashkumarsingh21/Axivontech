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
