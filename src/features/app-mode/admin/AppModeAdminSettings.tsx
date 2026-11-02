"use client";

import React, { useState, useEffect } from "react";
import {
  Smartphone,
  ShieldCheck,
  ShieldAlert,
  Save,
  Download,
  AlertTriangle,
  History,
  CheckCircle2,
  RefreshCw,
  ExternalLink,
} from "lucide-react";
import { parseApiResponse } from "@/lib/errors/client";

interface AppConfigState {
  enabled: boolean;
  popupEnabled: boolean;
  latestVersion: string;
  minVersion: string;
  apkUrl: string;
  sha256: string;
  sizeMb: number;
  notes: string;
  envEnabled: boolean;
  updatedAt: string;
}

interface DownloadEvent {
  id: string;
  ip: string;
  userAgent: string;
  timestamp: string;
  userName: string;
  userEmail: string;
  version: string;
}

export function AppModeAdminSettings() {
  const [config, setConfig] = useState<AppConfigState>({
    enabled: false,
    popupEnabled: false,
    latestVersion: "1.0.0",
    minVersion: "1.0.0",
    apkUrl: "",
    sha256: "",
    sizeMb: 5.8,
    notes: "",
    envEnabled: false,
    updatedAt: "",
  });

  const [totalDownloads, setTotalDownloads] = useState<number>(0);
  const [recentDownloads, setRecentDownloads] = useState<DownloadEvent[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/v1/admin/app/settings");
      const parsed = await parseApiResponse(res);
      if (parsed.ok && parsed.data?.data) {
        setConfig(parsed.data.data.config);
        setTotalDownloads(parsed.data.data.totalDownloads);
        setRecentDownloads(parsed.data.data.recentDownloads);
      } else {
        setMessage({ type: "error", text: parsed.errorMessage || "Failed to load settings." });
      }
    } catch {
      setMessage({ type: "error", text: "Network error loading app settings." });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      const res = await fetch("/api/v1/admin/app/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          enabled: config.enabled,
          popupEnabled: config.popupEnabled,
          latestVersion: config.latestVersion,
          minVersion: config.minVersion,
          apkUrl: config.apkUrl,
          sha256: config.sha256,
          sizeMb: Number(config.sizeMb),
          notes: config.notes,
        }),
      });

      const parsed = await parseApiResponse(res);
      if (parsed.ok) {
        setMessage({ type: "success", text: "Mobile app settings and release information saved!" });
        fetchSettings();
      } else {
        setMessage({ type: "error", text: parsed.errorMessage || "Failed to update settings." });
      }
    } catch {
      setMessage({ type: "error", text: "Network error saving settings." });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <div className="flex items-center gap-3 text-neutral-400">
          <RefreshCw className="w-5 h-5 animate-spin text-emerald-400" />
          <span>Loading Mobile App Configuration…</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Smartphone className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight">
                Android App & App-Mode Settings
              </h1>
              <p className="text-sm text-neutral-400">
                Manage mobile WebView app-mode, download modal, APK releases, and version gates.
              </p>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={fetchSettings}
          className="px-3.5 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-xs text-neutral-300 inline-flex items-center gap-2 transition-colors self-start sm:self-auto border border-white/10"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* Notifications */}
      {message && (
        <div
          role="alert"
          className={`p-4 rounded-xl flex items-center gap-3 text-sm ${
            message.type === "success"
              ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-300"
              : "bg-red-500/10 border border-red-500/30 text-red-300"
          }`}
        >
          {message.type === "success" ? (
            <CheckCircle2 className="w-5 h-5 shrink-0" />
          ) : (
            <AlertTriangle className="w-5 h-5 shrink-0" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      {/* Kill Switch Status Banner */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Master Env Flag Card */}
        <div className="p-5 rounded-2xl bg-[#10151B] border border-white/10 flex items-start gap-4">
          <div
            className={`p-3 rounded-xl border ${
              config.envEnabled
                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                : "bg-amber-500/10 text-amber-400 border-amber-500/30"
            }`}
          >
            {config.envEnabled ? <ShieldCheck className="w-6 h-6" /> : <ShieldAlert className="w-6 h-6" />}
          </div>
          <div>
            <span className="text-xs font-mono uppercase tracking-wider text-neutral-400">
              Master Environment Kill Switch
            </span>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-lg font-bold text-white">
                APP_MODE_ENABLED:
              </span>
              <span
                className={`px-2 py-0.5 rounded text-xs font-mono font-bold ${
                  config.envEnabled ? "bg-emerald-500/20 text-emerald-400" : "bg-neutral-800 text-neutral-400"
                }`}
              >
                {config.envEnabled ? "TRUE" : "FALSE"}
              </span>
            </div>
            <p className="mt-2 text-xs text-neutral-400">
              When FALSE at Vercel environment level, all app routing and download routes return 404 immediately.
            </p>
          </div>
        </div>

        {/* Total Downloads Metric Card */}
        <div className="p-5 rounded-2xl bg-[#10151B] border border-white/10 flex items-start gap-4">
          <div className="p-3 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/30">
            <Download className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-mono uppercase tracking-wider text-neutral-400">
              Total APK Downloads
            </span>
            <div className="text-2xl font-bold text-white mt-1">
              {totalDownloads}
            </div>
            <p className="mt-2 text-xs text-neutral-400">
              Audited download requests routed through /download/axivon-app.
            </p>
          </div>
        </div>
      </div>

      {/* Main Settings Form */}
      <form onSubmit={handleSave} className="space-y-6">
        {/* Toggles Section */}
        <div className="p-6 rounded-2xl bg-[#10151B] border border-white/10 space-y-6">
          <h2 className="text-lg font-bold text-white border-b border-white/10 pb-3">
            System & Feature Controls
          </h2>

          <div className="space-y-4">
            {/* Database app.enabled Toggle */}
            <div className="flex items-center justify-between p-4 rounded-xl bg-white/[0.02] border border-white/5">
              <div>
                <label htmlFor="app-enabled" className="text-sm font-semibold text-white block">
                  Organization Setting: app.enabled
                </label>
                <p className="text-xs text-neutral-400 mt-0.5">
                  Secondary software kill switch. Both master env AND this toggle must be active for app mode.
                </p>
              </div>
              <input
                id="app-enabled"
                type="checkbox"
                checked={config.enabled}
                onChange={(e) => setConfig({ ...config, enabled: e.target.checked })}
                className="w-5 h-5 accent-emerald-500 rounded cursor-pointer"
              />
            </div>

            {/* Daily Download Prompt Toggle */}
            <div className="flex items-center justify-between p-4 rounded-xl bg-white/[0.02] border border-white/5">
              <div>
                <label htmlFor="prompt-enabled" className="text-sm font-semibold text-white block">
                  Daily Download Popup: app.downloadPrompt.enabled
                </label>
                <p className="text-xs text-neutral-400 mt-0.5">
                  Displays the once-a-day &ldquo;Get the Axivon app&rdquo; modal to logged-in users on portal load.
                </p>
              </div>
              <input
                id="prompt-enabled"
                type="checkbox"
                checked={config.popupEnabled}
                onChange={(e) => setConfig({ ...config, popupEnabled: e.target.checked })}
                className="w-5 h-5 accent-emerald-500 rounded cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Release Configuration Section */}
        <div className="p-6 rounded-2xl bg-[#10151B] border border-white/10 space-y-6">
          <h2 className="text-lg font-bold text-white border-b border-white/10 pb-3">
            APK Release & Version Management
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                Latest Version (Current)
              </label>
              <input
                type="text"
                value={config.latestVersion}
                onChange={(e) => setConfig({ ...config, latestVersion: e.target.value })}
                placeholder="1.0.0"
                className="w-full h-11 px-3.5 rounded-lg bg-[#0E1116] border border-white/10 text-white text-sm focus:border-emerald-500 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                Minimum Supported Version (Update Gate)
              </label>
              <input
                type="text"
                value={config.minVersion}
                onChange={(e) => setConfig({ ...config, minVersion: e.target.value })}
                placeholder="1.0.0"
                className="w-full h-11 px-3.5 rounded-lg bg-[#0E1116] border border-white/10 text-white text-sm focus:border-emerald-500 focus:outline-none"
                required
              />
              <span className="text-[11px] text-neutral-500 mt-1 block">
                Installed versions below this will encounter the blocking &ldquo;Update Required&rdquo; screen.
              </span>
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                APK Download URL (GitHub Releases Asset URL)
              </label>
              <div className="flex gap-2">
                <input
                  type="url"
                  value={config.apkUrl}
                  onChange={(e) => setConfig({ ...config, apkUrl: e.target.value })}
                  placeholder="https://github.com/axivon/axivon-mobile/releases/download/v1.0.0/axivon-app.apk"
                  className="w-full h-11 px-3.5 rounded-lg bg-[#0E1116] border border-white/10 text-white text-sm focus:border-emerald-500 focus:outline-none font-mono text-xs"
                  required
                />
                {config.apkUrl && (
                  <a
                    href={config.apkUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="h-11 px-3 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-neutral-300 flex items-center justify-center shrink-0"
                    title="Open APK URL"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                APK SHA-256 Checksum (Optional Integrity Check)
              </label>
              <input
                type="text"
                value={config.sha256}
                onChange={(e) => setConfig({ ...config, sha256: e.target.value })}
                placeholder="e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
                className="w-full h-11 px-3.5 rounded-lg bg-[#0E1116] border border-white/10 text-white text-sm focus:border-emerald-500 focus:outline-none font-mono text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                APK File Size (MB)
              </label>
              <input
                type="number"
                step="0.1"
                min="0.1"
                max="50"
                value={config.sizeMb}
                onChange={(e) => setConfig({ ...config, sizeMb: parseFloat(e.target.value) || 0 })}
                placeholder="5.8"
                className="w-full h-11 px-3.5 rounded-lg bg-[#0E1116] border border-white/10 text-white text-sm focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                Release Notes / Changelog
              </label>
              <textarea
                value={config.notes}
                onChange={(e) => setConfig({ ...config, notes: e.target.value })}
                rows={3}
                placeholder="Highlight recent bug fixes, performance optimizations, or new portal features."
                className="w-full p-3.5 rounded-lg bg-[#0E1116] border border-white/10 text-white text-sm focus:border-emerald-500 focus:outline-none leading-relaxed"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={saving}
              className="min-h-[44px] px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-[#04130E] font-semibold text-sm inline-flex items-center gap-2 transition-colors disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? "Saving…" : "Save Release Configuration"}</span>
            </button>
          </div>
        </div>
      </form>

      {/* Recent Downloads Audit Log */}
      <div className="p-6 rounded-2xl bg-[#10151B] border border-white/10 space-y-4">
        <div className="flex items-center gap-2 border-b border-white/10 pb-3">
          <History className="w-5 h-5 text-emerald-400" />
          <h2 className="text-lg font-bold text-white">
            Last 10 Download Events (Audit Log)
          </h2>
        </div>

        {recentDownloads.length === 0 ? (
          <p className="text-sm text-neutral-400 py-4 text-center">
            No download events recorded yet.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-neutral-300">
              <thead className="border-b border-white/10 text-neutral-400 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-2.5 px-3">Timestamp</th>
                  <th className="py-2.5 px-3">User</th>
                  <th className="py-2.5 px-3">IP Address</th>
                  <th className="py-2.5 px-3">Version</th>
                  <th className="py-2.5 px-3">User-Agent</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {recentDownloads.map((log) => (
                  <tr key={log.id} className="hover:bg-white/[0.02]">
                    <td className="py-2.5 px-3 whitespace-nowrap text-neutral-400 font-mono text-[11px]">
                      {new Date(log.timestamp).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })}
                    </td>
                    <td className="py-2.5 px-3 whitespace-nowrap">
                      <span className="font-medium text-white">{log.userName}</span>
                      {log.userEmail !== "—" && (
                        <span className="block text-[11px] text-neutral-500">{log.userEmail}</span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 whitespace-nowrap font-mono text-[11px] text-neutral-400">
                      {log.ip}
                    </td>
                    <td className="py-2.5 px-3 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-emerald-400 font-mono text-[10px]">
                        v{log.version}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 max-w-xs truncate text-neutral-400 text-[11px]" title={log.userAgent}>
                      {log.userAgent}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
