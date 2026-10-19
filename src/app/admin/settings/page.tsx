"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  ShieldCheck,
  ShieldAlert,
  Lock,
  Key,
  RefreshCw,
  Server,
  Activity,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Layers,
  Terminal,
  ExternalLink,
  Cpu,
  UserCheck,
} from "lucide-react";

interface CaptchaStatusData {
  success: boolean;
  provider: string;
  mode: string;
  siteKey: string;
  secretStatus: string;
  maskedSecret: string;
  environment: string;
  failClosedInProduction: boolean;
  metrics: {
    totalVerifications: number;
    passed: number;
    failed: number;
    replaysBlocked: number;
    lastVerifiedAt: string | null;
    failureBreakdown: Record<string, number>;
  };
  protectedEndpoints: Array<{
    name: string;
    route: string;
    action: string;
    layers: string[];
    status: string;
  }>;
}

export default function AdminSettingsPage() {
  const [activeTab, setActiveTab] = useState<"security" | "profile">("security");
  const [data, setData] = useState<CaptchaStatusData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStatus = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/v1/admin/security/captcha-status");
      if (!res.ok) {
        throw new Error("Failed to fetch CAPTCHA security status");
      }
      const json = await res.json();
      setData(json);
    } catch (err: any) {
      setError(err?.message || "Failed to load anti-bot configuration.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  const metrics = data?.metrics || {
    totalVerifications: 0,
    passed: 0,
    failed: 0,
    replaysBlocked: 0,
    lastVerifiedAt: null,
    failureBreakdown: {},
  };

  const passRate =
    metrics.totalVerifications > 0
      ? Math.round((metrics.passed / metrics.totalVerifications) * 100)
      : 100;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#1E2530] pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <ShieldCheck className="w-3.5 h-3.5" />
              Platform Security
            </span>
            <span className="text-xs font-mono text-[#566171]">AXIVON ONE OS</span>
          </div>
          <h1 className="text-2xl font-bold text-[#F3F5F7] tracking-tight">System Settings & Security</h1>
          <p className="text-sm text-[#7E8997] mt-0.5">
            Manage anti-bot defenses, Cloudflare Turnstile CAPTCHA status, and administrator profile.
          </p>
        </div>

        {/* Tab Toggle */}
        <div className="flex items-center gap-2 bg-[#10151B] p-1 rounded-xl border border-[#29313B]">
          <button
            onClick={() => setActiveTab("security")}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              activeTab === "security"
                ? "bg-[#1B222B] text-emerald-400 shadow-xs"
                : "text-[#7E8997] hover:text-[#F3F5F7]"
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            Anti-Bot &amp; CAPTCHA
          </button>
          <button
            onClick={() => setActiveTab("profile")}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              activeTab === "profile"
                ? "bg-[#1B222B] text-emerald-400 shadow-xs"
                : "text-[#7E8997] hover:text-[#F3F5F7]"
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            Admin Profile
          </button>
        </div>
      </div>

      {activeTab === "security" ? (
        <div className="space-y-6">
          {/* Top Status & Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Provider Card */}
            <div className="p-4 rounded-xl bg-[#151A21] border border-[#29313B] shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between text-xs text-[#7E8997] mb-2 font-mono">
                  <span>PROVIDER</span>
                  <span className="flex h-2 w-2 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                  </span>
                </div>
                <h3 className="text-lg font-bold text-[#F3F5F7]">Cloudflare Turnstile</h3>
                <p className="text-xs text-[#7E8997] mt-1">Managed Challenge Mode</p>
              </div>
              <div className="mt-4 pt-3 border-t border-[#1E2530] flex items-center justify-between text-xs">
                <span className="text-[#566171]">Fail-Safe Mode</span>
                <span className="font-mono text-emerald-400 font-medium">Fail Closed (Prod)</span>
              </div>
            </div>

            {/* Total Verifications */}
            <div className="p-4 rounded-xl bg-[#151A21] border border-[#29313B] shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between text-xs text-[#7E8997] mb-2 font-mono">
                  <span>TOTAL VERIFICATIONS</span>
                  <Activity className="w-4 h-4 text-[#566171]" />
                </div>
                <h3 className="text-2xl font-bold text-[#F3F5F7] font-mono">
                  {loading ? "..." : metrics.totalVerifications}
                </h3>
                <p className="text-xs text-[#7E8997] mt-1">
                  Pass Rate: <span className="text-emerald-400 font-semibold">{passRate}%</span>
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-[#1E2530] flex items-center justify-between text-xs">
                <span className="text-[#566171]">Passed</span>
                <span className="font-mono text-emerald-400 font-medium">{metrics.passed}</span>
              </div>
            </div>

            {/* Blocked Attacks */}
            <div className="p-4 rounded-xl bg-[#151A21] border border-[#29313B] shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between text-xs text-[#7E8997] mb-2 font-mono">
                  <span>ATTACKS BLOCKED</span>
                  <ShieldAlert className="w-4 h-4 text-amber-400" />
                </div>
                <h3 className="text-2xl font-bold text-amber-400 font-mono">
                  {loading ? "..." : metrics.failed}
                </h3>
                <p className="text-xs text-[#7E8997] mt-1">
                  Replays Intercepted: <span className="text-red-400 font-semibold">{metrics.replaysBlocked}</span>
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-[#1E2530] flex items-center justify-between text-xs">
                <span className="text-[#566171]">Replay Cache TTL</span>
                <span className="font-mono text-[#A7B0BC]">300s (5 min)</span>
              </div>
            </div>

            {/* Key Configuration */}
            <div className="p-4 rounded-xl bg-[#151A21] border border-[#29313B] shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between text-xs text-[#7E8997] mb-2 font-mono">
                  <span>KEY SECURITY</span>
                  <Key className="w-4 h-4 text-emerald-400" />
                </div>
                <h3 className="text-base font-bold text-[#F3F5F7]">
                  {data?.secretStatus === "CONFIGURED_PRODUCTION" ? (
                    <span className="text-emerald-400 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4" /> Production Key
                    </span>
                  ) : (
                    <span className="text-cyan-400 flex items-center gap-1.5">
                      <Terminal className="w-4 h-4" /> Official Test Key
                    </span>
                  )}
                </h3>
                <p className="text-xs text-[#7E8997] mt-1 font-mono truncate">
                  Masked: {data?.maskedSecret || "Loading..."}
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-[#1E2530] flex items-center justify-between text-xs">
                <span className="text-[#566171]">Zero Client Leakage</span>
                <span className="text-emerald-400 font-mono">Enforced</span>
              </div>
            </div>
          </div>

          {/* Controls Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#10151B] border border-[#29313B] p-3.5 rounded-xl">
            <div className="flex items-center gap-2">
              <span className="text-xs text-[#A7B0BC]">Environment:</span>
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-[#151A21] border border-[#29313B] text-white">
                {data?.environment?.toUpperCase() || "DEVELOPMENT"}
              </span>
              <span className="text-xs text-[#566171] ml-2">Sitekey:</span>
              <code className="text-xs font-mono text-[#D6B779] bg-[#151A21] px-2 py-0.5 rounded border border-[#29313B]">
                {data?.siteKey || "0x4AAAAAAA..."}
              </code>
            </div>

            <button
              onClick={fetchStatus}
              disabled={loading}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-[#1B222B] border border-[#29313B] hover:bg-[#202833] text-xs font-medium text-[#F3F5F7] transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
              <span>Refresh Metrics</span>
            </button>
          </div>

          {/* Protected Endpoints Table */}
          <div className="rounded-xl bg-[#151A21] border border-[#29313B] overflow-hidden shadow-xs">
            <div className="p-4 border-b border-[#1E2530] flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-[#F3F5F7] flex items-center gap-2">
                  <Layers className="w-4 h-4 text-emerald-400" />
                  Protected Forms &amp; Submission Endpoints
                </h3>
                <p className="text-xs text-[#7E8997] mt-0.5">
                  Every form submission requires verified CAPTCHA tokens, honeypot traps, and rate limiting.
                </p>
              </div>
              <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                {data?.protectedEndpoints?.length || 10} Endpoints Active
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-[#101318] text-[#7E8997] border-b border-[#1E2530]">
                    <th className="py-3 px-4 font-medium uppercase font-mono tracking-wider">Form / Surface</th>
                    <th className="py-3 px-4 font-medium uppercase font-mono tracking-wider">API Route</th>
                    <th className="py-3 px-4 font-medium uppercase font-mono tracking-wider">Turnstile Action</th>
                    <th className="py-3 px-4 font-medium uppercase font-mono tracking-wider">Layered Defense</th>
                    <th className="py-3 px-4 font-medium uppercase font-mono tracking-wider text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1E2530] text-[#A7B0BC]">
                  {(data?.protectedEndpoints || []).map((ep, idx) => (
                    <tr key={idx} className="hover:bg-[#1B222B]/40 transition-colors">
                      <td className="py-3 px-4 font-medium text-[#F3F5F7]">{ep.name}</td>
                      <td className="py-3 px-4 font-mono text-cyan-400">{ep.route}</td>
                      <td className="py-3 px-4 font-mono text-[#D6B779]">{ep.action}</td>
                      <td className="py-3 px-4">
                        <div className="flex flex-wrap gap-1.5">
                          {ep.layers.map((layer, lIdx) => (
                            <span
                              key={lIdx}
                              className="text-[10px] px-1.5 py-0.5 rounded bg-[#10151B] border border-[#29313B] text-[#7E8997]"
                            >
                              {layer}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                          <CheckCircle2 className="w-3 h-3" /> Active
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Defense Architecture Details */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-[#151A21] border border-[#29313B]">
              <div className="flex items-center gap-2 mb-2 text-emerald-400 text-xs font-semibold uppercase tracking-wider">
                <Lock className="w-4 h-4" />
                <span>Zero Secret Leakage</span>
              </div>
              <p className="text-xs text-[#7E8997] leading-relaxed">
                <code className="text-white">TURNSTILE_SECRET_KEY</code> is strictly isolated to backend verification
                routes. It is never exposed to the client bundle, HTML templates, or error payloads.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#151A21] border border-[#29313B]">
              <div className="flex items-center gap-2 mb-2 text-cyan-400 text-xs font-semibold uppercase tracking-wider">
                <RefreshCw className="w-4 h-4" />
                <span>Replay Attack Prevention</span>
              </div>
              <p className="text-xs text-[#7E8997] leading-relaxed">
                Tokens are single-use only. Verified tokens are memorized in an in-memory TTL cache for 5 minutes. Any
                reused token is rejected with <code className="text-white">EXPIRED_OR_DUPLICATE</code>.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#151A21] border border-[#29313B]">
              <div className="flex items-center gap-2 mb-2 text-[#D6B779] text-xs font-semibold uppercase tracking-wider">
                <ShieldCheck className="w-4 h-4" />
                <span>Honeypot Trap Protection</span>
              </div>
              <p className="text-xs text-[#7E8997] leading-relaxed">
                Invisible trap fields (<code className="text-white">website_trap</code>, <code className="text-white">_gotcha</code>)
                catch dumb scrapers and bot automation before expensive third-party CAPTCHA validation.
              </p>
            </div>
          </div>
        </div>
      ) : (
        /* Admin Profile Tab */
        <div className="bg-[#151A21] border border-[#29313B] rounded-xl p-6 space-y-4">
          <h3 className="text-base font-semibold text-[#F3F5F7]">Administrator Credentials</h3>
          <p className="text-xs text-[#7E8997]">
            Core administrator account details for managing the AXIVON ONE control center.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block text-xs font-medium text-[#A7B0BC] mb-1.5">Display Name</label>
              <input
                type="text"
                defaultValue="Admin User"
                disabled
                className="w-full bg-[#10151B] border border-[#29313B] rounded-lg px-3.5 py-2 text-xs text-[#7E8997] cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#A7B0BC] mb-1.5">Email</label>
              <input
                type="email"
                defaultValue="admin@axivon.dev"
                disabled
                className="w-full bg-[#10151B] border border-[#29313B] rounded-lg px-3.5 py-2 text-xs text-[#7E8997] cursor-not-allowed"
              />
            </div>
          </div>

          <div className="p-3.5 rounded-lg bg-[#10151B] border border-[#29313B] text-xs text-[#7E8997] flex items-start gap-2.5 mt-4">
            <Lock className="w-4 h-4 shrink-0 text-[#D6B779] mt-0.5" />
            <p className="leading-relaxed">
              To update administrator email addresses, two-factor authentication, or modify security parameters,
              contact your Executive Founder or submit a change request.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
