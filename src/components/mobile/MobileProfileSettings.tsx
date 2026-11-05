"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  User,
  Mail,
  Lock,
  Shield,
  Fingerprint,
  Smartphone,
  RefreshCw,
  LogOut,
  ChevronRight,
  AlertCircle,
  CheckCircle2,
  Download,
  KeyRound,
  Loader2,
  Building,
  Info,
} from "lucide-react";
import { BottomSheet } from "./BottomSheet";
import {
  isBiometricsAvailable,
  isBiometricsEnrolled,
  enableBiometrics,
  disableBiometrics,
} from "@/lib/mobile/biometrics";

interface MobileProfileSettingsProps {
  user: {
    id?: string;
    name?: string;
    email?: string;
    role?: string;
    department?: string;
    designation?: string;
    phone?: string;
    employeeCode?: string;
    createdAt?: string;
  };
}

export function MobileProfileSettings({ user }: MobileProfileSettingsProps) {
  // Biometrics state
  const [biometricsSupported, setBiometricsSupported] = useState(false);
  const [biometricsActive, setBiometricsActive] = useState(false);
  const [biometricsLoading, setBiometricsLoading] = useState(false);
  const [biometricsMessage, setBiometricsMessage] = useState<string | null>(null);

  // App version check state
  const [checkingVersion, setCheckingVersion] = useState(false);
  const [versionInfo, setVersionInfo] = useState<any>(null);
  const [versionStatus, setVersionStatus] = useState<string | null>(null);

  // Change password bottom sheet
  const [passwordSheetOpen, setPasswordSheetOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);

  useEffect(() => {
    isBiometricsAvailable().then((supported) => {
      setBiometricsSupported(supported);
      setBiometricsActive(isBiometricsEnrolled());
    });
  }, []);

  const handleToggleBiometrics = async () => {
    if (!user?.email) return;
    setBiometricsLoading(true);
    setBiometricsMessage(null);
    try {
      if (biometricsActive) {
        disableBiometrics();
        setBiometricsActive(false);
        setBiometricsMessage("Biometric sign-in has been disabled.");
      } else {
        const success = await enableBiometrics(user.email);
        if (success) {
          setBiometricsActive(true);
          setBiometricsMessage("Biometric sign-in enabled successfully for your account.");
        } else {
          setBiometricsMessage("Unable to configure biometrics on this device.");
        }
      }
    } catch {
      setBiometricsMessage("Biometric setup was cancelled or failed.");
    } finally {
      setBiometricsLoading(false);
      setTimeout(() => setBiometricsMessage(null), 4000);
    }
  };

  const handleCheckUpdate = async () => {
    setCheckingVersion(true);
    setVersionStatus(null);
    try {
      const res = await fetch("/api/v1/app/version");
      if (res.ok) {
        const json = await res.json();
        setVersionInfo(json.data);
        setVersionStatus("App is running the latest enterprise version (v" + (json.data?.version || "1.0.0") + ").");
      } else {
        setVersionStatus("Unable to reach update servers. Check your connection.");
      }
    } catch {
      setVersionStatus("Network error checking for updates.");
    } finally {
      setCheckingVersion(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(null);

    if (newPassword !== confirmPassword) {
      setPasswordError("New password and confirmation do not match.");
      return;
    }
    if (newPassword.length < 10) {
      setPasswordError("New password must be at least 10 characters long.");
      return;
    }

    setPasswordLoading(true);
    try {
      const res = await fetch("/api/v1/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword, confirmPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || data.message || "Failed to update password.");
      }
      setPasswordSuccess("Your password was updated successfully. Please log in with the new password on next session.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => {
        setPasswordSheetOpen(false);
        setPasswordSuccess(null);
      }, 2500);
    } catch (err: any) {
      setPasswordError(err.message || "Failed to update password.");
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/v1/auth/logout", { method: "POST" });
    } catch {
      // Ignore
    }
    window.location.href = "/app/login?logged_out=1";
  };

  const initials =
    user?.name
      ?.split(" ")
      .filter(Boolean)
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "AX";

  return (
    <div className="space-y-4">
      {/* ── User Profile Header Card (Clean White Surface) ─────────────── */}
      <section className="rounded-2xl bg-white border border-slate-200/90 p-5 shadow-xs text-center flex flex-col items-center">
        <div className="h-20 w-20 rounded-2xl bg-teal-50 border-2 border-teal-500/30 flex items-center justify-center text-2xl font-extrabold text-teal-800 mb-3 shadow-xs">
          {initials}
        </div>
        <h2 className="text-lg font-bold text-slate-900">{user?.name || "User"}</h2>
        <span className="text-xs font-semibold text-slate-500 mt-0.5">{user?.email || "—"}</span>

        <div className="flex flex-wrap items-center justify-center gap-2 mt-3">
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-teal-50 text-teal-700 border border-teal-200">
            <span className="w-1.5 h-1.5 rounded-full bg-teal-500" />
            <span>{user?.role || "EMPLOYEE"}</span>
          </span>

          {Boolean(user?.department) && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200">
              <span>{user.department}</span>
            </span>
          )}

          {Boolean(user?.designation) && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200">
              <span>{user.designation}</span>
            </span>
          )}
        </div>
      </section>

      {/* ── Account Information & Read-Only Email Policy ───────────────── */}
      <section className="rounded-2xl bg-white border border-slate-200/90 shadow-xs divide-y divide-slate-100 overflow-hidden">
        <div className="px-4 py-3 bg-slate-50 flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Account Profile
          </span>
          <span className="text-[11px] font-semibold text-teal-600">Verified Identity</span>
        </div>

        {/* Registered Email (STRICTLY READ-ONLY) */}
        <div className="p-4 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 text-xs font-semibold text-slate-600">
              <Mail className="h-4 w-4 text-slate-400" />
              <span>Registered Email Address</span>
            </div>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
              <Lock className="h-3 w-3" />
              <span>Locked</span>
            </span>
          </div>

          <div className="text-sm font-bold text-slate-900 bg-slate-50 border border-slate-200/80 rounded-xl px-3 py-2 select-all tabular-nums">
            {user?.email || "—"}
          </div>

          {/* Admin restriction notice */}
          <div className="flex items-start gap-2 p-2.5 rounded-xl bg-amber-50/70 border border-amber-200/80 text-amber-900 text-[11px] leading-relaxed">
            <Info className="h-3.5 w-3.5 text-amber-700 shrink-0 mt-0.5" />
            <span>
              Your registered email address can only be updated by an authorized administrator.
            </span>
          </div>
        </div>

        {/* Name */}
        <div className="flex items-center justify-between p-4">
          <span className="text-xs text-slate-500">Full Name</span>
          <span className="text-xs font-bold text-slate-900">{user?.name || "—"}</span>
        </div>

        {/* Phone */}
        {Boolean(user?.phone) && (
          <div className="flex items-center justify-between p-4">
            <span className="text-xs text-slate-500">Phone</span>
            <span className="text-xs font-bold text-slate-900">{user.phone}</span>
          </div>
        )}

        {/* Employee Code */}
        {Boolean(user?.employeeCode) && (
          <div className="flex items-center justify-between p-4">
            <span className="text-xs text-slate-500">Employee ID</span>
            <span className="text-xs font-bold font-mono text-slate-900">{user.employeeCode}</span>
          </div>
        )}
      </section>

      {/* ── App Security & Authentication ──────────────────────────────── */}
      <section className="rounded-2xl bg-white border border-slate-200/90 shadow-xs divide-y divide-slate-100 overflow-hidden">
        <div className="px-4 py-3 bg-slate-50">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Security & Credentials
          </span>
        </div>

        {/* Biometric Login Toggle */}
        <div className="p-4 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-600">
                <Fingerprint className="h-4 w-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-900 block">Biometric Sign-In</span>
                <span className="text-[11px] text-slate-500">Fingerprint or Face unlock</span>
              </div>
            </div>

            <button
              type="button"
              disabled={biometricsLoading || !biometricsSupported}
              onClick={handleToggleBiometrics}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-hidden ${
                biometricsActive ? "bg-teal-600" : "bg-slate-200"
              } ${!biometricsSupported ? "opacity-50 cursor-not-allowed" : ""}`}
              aria-label="Toggle Biometrics"
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-md transition-transform ${
                  biometricsActive ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>

          {Boolean(biometricsMessage) && (
            <div className="text-[11px] text-teal-700 font-medium bg-teal-50 p-2 rounded-lg border border-teal-100">
              {biometricsMessage}
            </div>
          )}

          {!biometricsSupported && (
            <p className="text-[11px] text-slate-400">
              Hardware biometrics not supported on this device.
            </p>
          )}
        </div>

        {/* Change Password button */}
        <button
          type="button"
          onClick={() => setPasswordSheetOpen(true)}
          className="w-full flex items-center justify-between p-4 hover:bg-slate-50 active:bg-slate-100 transition-colors text-left"
        >
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600">
              <KeyRound className="h-4 w-4" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-900 block">Change Account Password</span>
              <span className="text-[11px] text-slate-500">Update your workplace password</span>
            </div>
          </div>
          <ChevronRight className="h-4 w-4 text-slate-400" />
        </button>
      </section>

      {/* ── App Version & Updates ──────────────────────────────────────── */}
      <section className="rounded-2xl bg-white border border-slate-200/90 shadow-xs divide-y divide-slate-100 overflow-hidden">
        <div className="px-4 py-3 bg-slate-50 flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Application Information
          </span>
          <span className="text-[11px] font-bold text-slate-600 font-mono">v1.0.0 (Build 100)</span>
        </div>

        <div className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600">
                <Smartphone className="h-4 w-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-900 block">AxivonTech Android App</span>
                <span className="text-[11px] text-slate-500">Package: com.axivon.app</span>
              </div>
            </div>

            <button
              type="button"
              disabled={checkingVersion}
              onClick={handleCheckUpdate}
              className="flex items-center gap-1.5 py-1.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 text-xs font-bold active:scale-95 transition-transform"
            >
              <RefreshCw className={`h-3 w-3 ${checkingVersion ? "animate-spin text-teal-600" : ""}`} />
              <span>{checkingVersion ? "Checking..." : "Check Updates"}</span>
            </button>
          </div>

          {Boolean(versionStatus) && (
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 font-medium leading-relaxed">
              {versionStatus}
            </div>
          )}
        </div>
      </section>

      {/* ── Logout Action (Safe Red Button) ────────────────────────────── */}
      <button
        type="button"
        onClick={handleLogout}
        className="w-full h-12 flex items-center justify-center gap-2 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 font-bold text-xs hover:bg-rose-100 active:scale-[0.99] transition-all shadow-xs"
      >
        <LogOut className="h-4 w-4" />
        <span>Log Out of Workplace App</span>
      </button>

      {/* ── Change Password Bottom Sheet ───────────────────────────────── */}
      <BottomSheet
        isOpen={passwordSheetOpen}
        onClose={() => setPasswordSheetOpen(false)}
        title="Change Password"
        description="Update your corporate workplace password."
      >
        <form onSubmit={handleChangePassword} className="space-y-3.5 py-1">
          {Boolean(passwordError) && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium">
              {passwordError}
            </div>
          )}

          {Boolean(passwordSuccess) && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium">
              {passwordSuccess}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Current Password
            </label>
            <input
              type="password"
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full h-11 px-3.5 rounded-xl border border-slate-200 bg-white text-slate-900 text-sm focus:outline-hidden focus:border-teal-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              New Password (minimum 10 characters)
            </label>
            <input
              type="password"
              required
              minLength={10}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full h-11 px-3.5 rounded-xl border border-slate-200 bg-white text-slate-900 text-sm focus:outline-hidden focus:border-teal-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Confirm New Password
            </label>
            <input
              type="password"
              required
              minLength={10}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full h-11 px-3.5 rounded-xl border border-slate-200 bg-white text-slate-900 text-sm focus:outline-hidden focus:border-teal-500"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={passwordLoading}
              className="w-full h-11 flex items-center justify-center gap-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-xs active:scale-[0.99] transition-all disabled:opacity-50"
            >
              {passwordLoading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              <span>Save New Password</span>
            </button>
          </div>
        </form>
      </BottomSheet>
    </div>
  );
}
