"use client";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Loader2, CheckCircle2 } from "lucide-react";

export default function AttendancePage() {
  const [records, setRecords] = useState<any[]>([]);
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
                  {r.checkOutAt ? ` | Out: ${new Date(r.checkOutAt).toLocaleTimeString()} (${r.totalMinutes} mins)` : ' | Active'}
                </span>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
