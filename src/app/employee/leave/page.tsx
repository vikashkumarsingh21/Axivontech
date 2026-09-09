"use client";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Coffee, Calendar, Loader2, Send } from "lucide-react";

export default function LeavePage() {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ type: "SICK", start: "", end: "", reason: "" });

  const loadData = () => {
    setLoading(true);
    fetch("/api/v1/employee/leave")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setRequests(data.requests || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await fetch("/api/v1/employee/leave", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          leaveType: form.type,
          startDate: form.start,
          endDate: form.end,
          reason: form.reason,
        }),
      });
      setForm({ type: "SICK", start: "", end: "", reason: "" });
      loadData();
    } finally {
      setSubmitting(false);
    }
  };

  const statusBadge = (status: string) => {
    switch (status) {
      case "APPROVED":
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/30";
      case "REJECTED":
        return "bg-red-500/10 text-red-400 border-red-500/30";
      default:
        return "bg-amber-500/10 text-amber-400 border-amber-500/30";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12 text-gray-400 gap-3">
        <Loader2 className="animate-spin w-5 h-5 text-indigo-400" />
        <span>Loading leave requests...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Leave Management</h1>
        <p className="text-sm text-gray-400 mt-1">Apply for time off and review request approvals</p>
      </div>

      <Card className="p-4 sm:p-6 bg-[#0a0a0c] border border-gray-800 rounded-xl space-y-4">
        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
          <Coffee className="w-5 h-5 text-indigo-400" />
          <span>New Leave Request</span>
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1.5">Leave Type</label>
              <select
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
                className="w-full bg-[#111111] border border-gray-800 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="SICK">Sick Leave</option>
                <option value="CASUAL">Casual Leave</option>
                <option value="PAID">Paid Time Off</option>
                <option value="UNPAID">Unpaid Leave</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1.5">Start Date</label>
              <Input
                type="date"
                value={form.start}
                onChange={(e) => setForm({ ...form, start: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1.5">End Date</label>
              <Input
                type="date"
                value={form.end}
                onChange={(e) => setForm({ ...form, end: e.target.value })}
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1.5">Reason for Leave</label>
            <Input
              placeholder="e.g. Medical emergency / Personal reasons"
              value={form.reason}
              onChange={(e) => setForm({ ...form, reason: e.target.value })}
              required
            />
          </div>

          <div className="flex justify-end">
            <Button type="submit" disabled={submitting} className="flex items-center gap-2 w-full sm:w-auto">
              {submitting ? <Loader2 className="animate-spin w-4 h-4" /> : <Send className="w-4 h-4" />}
              <span>{submitting ? "Submitting..." : "Submit Leave Request"}</span>
            </Button>
          </div>
        </form>
      </Card>

      <Card className="p-4 sm:p-6 bg-[#0a0a0c] border border-gray-800 rounded-xl space-y-4">
        <h2 className="text-lg font-semibold text-white">My Leave Requests</h2>
        {requests.length === 0 ? (
          <div className="text-gray-500 text-sm py-4 text-center">No leave requests found.</div>
        ) : (
          <div className="space-y-3">
            {requests.map((r: any) => (
              <div
                key={r.id}
                className="p-4 border border-gray-800 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#111111]"
              >
                <div className="space-y-1">
                  <div className="text-white font-semibold text-sm flex items-center gap-2">
                    <span>{r.leaveType} LEAVE</span>
                  </div>
                  <div className="text-xs text-gray-400 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                    <span>
                      {new Date(r.startDate).toLocaleDateString()} to{" "}
                      {new Date(r.endDate).toLocaleDateString()}
                    </span>
                  </div>
                  {r.reason && <p className="text-xs text-gray-400 mt-1">{r.reason}</p>}
                </div>
                <div className="shrink-0 self-start sm:self-center">
                  <span className={`text-xs px-2.5 py-1 rounded-full font-semibold border ${statusBadge(r.status)}`}>
                    {r.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
