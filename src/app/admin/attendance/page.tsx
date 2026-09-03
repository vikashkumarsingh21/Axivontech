"use client";

import { useEffect, useState } from "react";

export default function AttendancePage() {
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/v1/admin/attendance")
      .then(r => r.json())
      .then(d => { setRecords(d.data || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white tracking-tight">Attendance</h1>
      
      <div className="bg-[#111111] border border-white/10 rounded-xl overflow-hidden">
        <table className="w-full text-left text-sm text-gray-400">
          <thead className="bg-[#1a1a1a] text-gray-300 text-xs uppercase font-semibold border-b border-white/10">
            <tr>
              <th className="px-4 py-3">Employee</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={3} className="p-4 text-center">Loading...</td></tr>
            ) : records.length === 0 ? (
              <tr><td colSpan={3} className="p-4 text-center">No records found.</td></tr>
            ) : (
              records.map(r => (
                <tr key={r.id} className="border-b border-white/5">
                  <td className="px-4 py-3 text-white font-medium">{r.user?.name}</td>
                  <td className="px-4 py-3">{new Date(r.date).toLocaleDateString()}</td>
                  <td className="px-4 py-3">{r.status}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
