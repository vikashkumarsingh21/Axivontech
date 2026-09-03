"use client";

import { useEffect, useState } from "react";
import { ShieldAlert } from "lucide-react";

export default function ExecutiveAuditPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/v1/executive/audit").then((r) => r.json()),
      fetch("/api/v1/executive/security-events").then((r) => r.json()),
    ]).then(([lData, eData]) => {
      setLogs(lData.data || []);
      setEvents(eData.data || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white tracking-tight">Governance Audit & Security Center</h1>
      <p className="text-gray-400 text-sm">Audit log and privileged security event monitoring.</p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[#111111] border border-white/10 rounded-2xl p-6 space-y-4">
          <h2 className="text-lg font-bold text-white">Privileged Security Events</h2>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {events.length === 0 ? <p className="text-gray-500 text-sm">No security events logged.</p> : (
              events.map((e) => (
                <div key={e.id} className="p-3 bg-[#1a1a1a] rounded-xl text-xs flex justify-between">
                  <span className="font-mono text-amber-400">{e.eventType}</span>
                  <span className="text-gray-400">{new Date(e.createdAt).toLocaleString()}</span>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="bg-[#111111] border border-white/10 rounded-2xl p-6 space-y-4">
          <h2 className="text-lg font-bold text-white">Audit Log</h2>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {logs.length === 0 ? <p className="text-gray-500 text-sm">No audit logs.</p> : (
              logs.map((l) => (
                <div key={l.id} className="p-3 bg-[#1a1a1a] rounded-xl text-xs flex justify-between">
                  <div>
                    <span className="font-semibold text-white">{l.user?.name || "System"}</span>
                    <span className="ml-2 font-mono text-gray-400">{l.action}</span>
                  </div>
                  <span className="text-gray-500">{new Date(l.createdAt).toLocaleTimeString()}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
