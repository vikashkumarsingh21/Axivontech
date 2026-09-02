"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { CheckCircle2, Clock, FileText, AlertCircle } from "lucide-react";

export default function EmployeeDashboard() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/v1/employee/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.user) setUser(data.user);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="text-gray-400">Loading dashboard...</div>;
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
          <div className="text-2xl font-bold text-white">Not Checked In</div>
          <p className="text-xs text-gray-500">Check in to start tracking time</p>
        </Card>

        <Card className="p-5 flex flex-col gap-2 bg-[#111111] border-white/5">
          <div className="flex items-center justify-between text-gray-400">
            <span className="text-sm font-medium">Assigned Tasks</span>
            <CheckCircle2 className="w-4 h-4 text-green-400" />
          </div>
          <div className="text-2xl font-bold text-white">3 Active</div>
          <p className="text-xs text-gray-500">2 due today</p>
        </Card>

        <Card className="p-5 flex flex-col gap-2 bg-[#111111] border-white/5">
          <div className="flex items-center justify-between text-gray-400">
            <span className="text-sm font-medium">Daily Report</span>
            <FileText className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-bold text-white">Pending</div>
          <p className="text-xs text-gray-500">Submit before EOD</p>
        </Card>

        <Card className="p-5 flex flex-col gap-2 bg-[#111111] border-white/5">
          <div className="flex items-center justify-between text-gray-400">
            <span className="text-sm font-medium">Unread Notifications</span>
            <AlertCircle className="w-4 h-4 text-orange-400" />
          </div>
          <div className="text-2xl font-bold text-white">2 New</div>
          <p className="text-xs text-gray-500">Check announcements</p>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-4">
        <div className="col-span-2 space-y-6">
          {/* Main Content Area */}
          <Card className="p-6 bg-[#0a0a0a] border-white/5">
            <h3 className="text-lg font-medium text-white mb-4">Today's Tasks</h3>
            <div className="space-y-3">
              {/* Mock static data for now until API is built in next step */}
              <div className="flex items-center justify-between p-3 rounded-lg border border-white/5 bg-[#111111]">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-orange-400"></div>
                  <span className="text-sm text-gray-300">Update Q3 Marketing Assets</span>
                </div>
                <span className="text-xs font-medium px-2 py-1 rounded bg-orange-500/10 text-orange-400">IN PROGRESS</span>
              </div>
            </div>
            <div className="mt-4">
              <Button variant="outline" size="sm">View All Tasks</Button>
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          {/* Quick Actions Sidebar */}
          <Card className="p-6 bg-[#0a0a0a] border-white/5">
            <h3 className="text-lg font-medium text-white mb-4">Quick Actions</h3>
            <div className="flex flex-col gap-3">
              <Button className="w-full justify-start gap-2">
                <Clock className="w-4 h-4" /> Check In
              </Button>
              <Button variant="outline" className="w-full justify-start gap-2">
                <FileText className="w-4 h-4" /> Submit Report
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
