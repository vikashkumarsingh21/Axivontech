"use client";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export default function LeavePage() {
  const [requests, setRequests] = useState<any[]>([]);
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
