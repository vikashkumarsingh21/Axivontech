"use client";

import { useEffect, useState } from "react";
import { Settings } from "lucide-react";

export default function ExecutiveSettingsPage() {
  const [settings, setSettings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/v1/executive/settings")
      .then((r) => r.json())
      .then((d) => {
        setSettings(d.data || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white tracking-tight">Executive Settings</h1>
      <p className="text-gray-400 text-sm">Company policies, organizational defaults, and security configuration.</p>

      <div className="bg-[#111111] border border-white/10 rounded-2xl p-6 space-y-4">
        <h2 className="text-lg font-bold text-white">Company Policy Settings</h2>
        {loading ? <p className="text-gray-500 text-sm">Loading settings...</p> : (
          <div className="space-y-3">
            <div className="p-4 bg-[#1a1a1a] rounded-xl flex justify-between items-center text-sm">
              <span className="text-white font-medium">Default Attendance Policy</span>
              <span className="text-amber-400 font-mono text-xs">Standard (09:00 - 18:00 IST)</span>
            </div>
            <div className="p-4 bg-[#1a1a1a] rounded-xl flex justify-between items-center text-sm">
              <span className="text-white font-medium">Privileged Session Timeout</span>
              <span className="text-amber-400 font-mono text-xs">30 Minutes</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
