"use client";

import { useEffect, useState } from "react";

export default function PreferencesPage() {
  const [pref, setPref] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/v1/preferences")
      .then((r) => r.json())
      .then((d) => {
        setPref(d.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleToggle = async (key: string, val: boolean) => {
    setPref({ ...pref, [key]: val });
    await fetch("/api/v1/preferences", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ [key]: val }),
    });
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6 text-white">
      <h1 className="text-2xl font-bold tracking-tight">User Preferences</h1>
      <p className="text-gray-400 text-sm">Manage notification settings and regional defaults.</p>

      {loading ? <p className="text-gray-500">Loading preferences...</p> : (
        <div className="bg-[#111111] border border-white/10 rounded-2xl p-6 space-y-4">
          <div className="flex justify-between items-center bg-[#1a1a1a] p-4 rounded-xl">
            <div>
              <p className="font-semibold">Email Notifications</p>
              <p className="text-xs text-gray-400">Receive transactional update emails</p>
            </div>
            <input type="checkbox" checked={pref?.emailNotifications ?? true} onChange={(e) => handleToggle("emailNotifications", e.target.checked)} className="w-5 h-5 accent-red-600" />
          </div>

          <div className="flex justify-between items-center bg-[#1a1a1a] p-4 rounded-xl">
            <div>
              <p className="font-semibold">In-App Notifications</p>
              <p className="text-xs text-gray-400">Receive real-time platform popups</p>
            </div>
            <input type="checkbox" checked={pref?.inAppNotifications ?? true} onChange={(e) => handleToggle("inAppNotifications", e.target.checked)} className="w-5 h-5 accent-red-600" />
          </div>
        </div>
      )}
    </div>
  );
}
