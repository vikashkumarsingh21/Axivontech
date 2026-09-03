"use client";

export default function AdminSettingsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white tracking-tight">Settings</h1>
      <p className="text-gray-400">Admin profile and security settings.</p>

      <div className="bg-[#111111] border border-white/10 rounded-xl p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Display Name</label>
          <input type="text" defaultValue="Admin User" disabled
            className="w-full bg-[#1a1a1a] border border-white/5 rounded-lg px-4 py-2 text-sm text-white/50 cursor-not-allowed" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Email</label>
          <input type="email" defaultValue="admin@axivon.dev" disabled
            className="w-full bg-[#1a1a1a] border border-white/5 rounded-lg px-4 py-2 text-sm text-white/50 cursor-not-allowed" />
        </div>
        <p className="text-xs text-gray-600">Contact your Founder to update admin credentials or modify system settings.</p>
      </div>
    </div>
  );
}
