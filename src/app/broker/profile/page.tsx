"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import {
  User,
  Building,
  CreditCard,
  Lock,
  Copy,
  Check,
  ExternalLink,
  ShieldCheck,
  Key,
  Camera,
  AlertCircle,
  CheckCircle2,
  Calendar,
  Save,
  DollarSign,
  Sparkles,
} from "lucide-react";
import { BrokerPageHeader } from "@/components/broker/BrokerPageHeader";
import { BrokerCard } from "@/components/broker/BrokerCard";
import { BrokerButton } from "@/components/broker/BrokerButton";
import { BrokerSkeletonDetail } from "@/components/broker/BrokerSkeleton";
import { formatDateIN } from "@/components/broker/BrokerFormatters";

export default function BrokerProfilePage() {
  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [updatingPassword, setUpdatingPassword] = useState(false);
  const [globalSuccess, setGlobalSuccess] = useState<string | null>(null);
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState<string | null>(null);

  // Form Profile State
  const [userProfile, setUserProfile] = useState({
    id: "",
    name: "",
    email: "",
    phone: "",
    address: "",
    avatarUrl: "",
    partnerId: "",
    referralCode: "",
    companyName: "",
    designation: "",
    whatsapp: "",
    city: "",
    state: "",
    country: "India",
    website: "",
    panNumberMasked: "",
    gstNumber: "",
    payoutMethod: "BANK_TRANSFER",
    payoutDetails: {
      accountHolder: "",
      accountNumberMasked: "",
      bankName: "",
      ifsc: "",
      upiIdMasked: "",
    },
    createdAt: "",
  });

  // Password Change State
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);

  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/v1/broker/profile");
      if (res.ok) {
        const json = await res.json();
        const p = json.data?.profile;
        const bp = p?.brokerProfile;
        const pd = bp?.payoutDetails;

        setUserProfile({
          id: p?.id || "",
          name: p?.name || "",
          email: p?.email || "",
          phone: p?.phone || "",
          address: p?.address || "",
          avatarUrl: p?.avatarUrl || "",
          partnerId: bp?.partnerId || "",
          referralCode: bp?.referralCode || "",
          companyName: bp?.companyName || "",
          designation: bp?.designation || "",
          whatsapp: bp?.whatsapp || "",
          city: bp?.city || "",
          state: bp?.state || "",
          country: bp?.country || "India",
          website: bp?.website || "",
          panNumberMasked: bp?.panNumberMasked || "",
          gstNumber: bp?.gstNumber || "",
          payoutMethod: bp?.payoutMethod || "BANK_TRANSFER",
          payoutDetails: {
            accountHolder: pd?.accountHolder || "",
            accountNumberMasked: pd?.accountNumberMasked || "",
            bankName: pd?.bankName || "",
            ifsc: pd?.ifsc || "",
            upiIdMasked: pd?.upiIdMasked || "",
          },
          createdAt: p?.createdAt || "",
        });
      }
    } catch (e) {
      console.error("Failed to load profile", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedLink(key);
    setTimeout(() => setCopiedLink(null), 2000);
  };

  // Save General Profile Info
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setGlobalError(null);
    setGlobalSuccess(null);

    try {
      setSavingProfile(true);
      const res = await fetch("/api/v1/broker/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: userProfile.name,
          phone: userProfile.phone,
          whatsapp: userProfile.whatsapp,
          address: userProfile.address,
          companyName: userProfile.companyName,
          designation: userProfile.designation,
          city: userProfile.city,
          state: userProfile.state,
          country: userProfile.country,
          website: userProfile.website || undefined,
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error?.message || "Failed to update profile settings.");
      }

      setGlobalSuccess("Partner profile updated successfully.");
      fetchProfile();
    } catch (err: any) {
      setGlobalError(err.message);
    } finally {
      setSavingProfile(false);
    }
  };

  // Password Strength Meter
  const passwordStrength = useMemo(() => {
    const pw = passwordForm.newPassword;
    if (!pw) return 0;
    let score = 0;
    if (pw.length >= 8) score += 25;
    if (/[A-Z]/.test(pw)) score += 25;
    if (/[0-9]/.test(pw)) score += 25;
    if (/[^A-Za-z0-9]/.test(pw)) score += 25;
    return score;
  }, [passwordForm.newPassword]);

  // Update Password
  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(null);

    if (passwordForm.newPassword.length < 8) {
      setPasswordError("New password must be at least 8 characters.");
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError("Passwords do not match.");
      return;
    }

    try {
      setUpdatingPassword(true);
      const res = await fetch("/api/v1/broker/profile/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error?.message || "Failed to update password.");
      }

      setPasswordSuccess("Security password changed successfully.");
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err: any) {
      setPasswordError(err.message);
    } finally {
      setUpdatingPassword(false);
    }
  };

  // Avatar Upload
  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("avatar", file);

    try {
      const res = await fetch("/api/v1/broker/profile/avatar", {
        method: "POST",
        body: formData,
      });
      const json = await res.json();
      if (res.ok && json.data?.avatarUrl) {
        setUserProfile((prev) => ({ ...prev, avatarUrl: json.data.avatarUrl }));
        setGlobalSuccess("Profile avatar updated successfully.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto space-y-6">
        <BrokerSkeletonDetail />
      </div>
    );
  }

  const baseUrl = typeof window !== "undefined" ? window.location.origin : "https://axivontech.in";
  const leadUrl = `${baseUrl}/lead/${userProfile.referralCode}`;
  const projectUrl = `${baseUrl}/project/start/${userProfile.referralCode}`;

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      {/* Page Header */}
      <BrokerPageHeader
        title="Partner Account & Settings"
        subtitle="Manage business credentials, banking payout routes, tax compliance, and account security."
        badge={
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#C2A878]/15 text-[#C2A878] border border-[#C2A878]/30 font-mono">
            {userProfile.partnerId || "PARTNER"}
          </span>
        }
      />

      {globalSuccess && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{globalSuccess}</span>
          </div>
          <button onClick={() => setGlobalSuccess(null)} className="text-emerald-400 hover:text-emerald-300">
            Dismiss
          </button>
        </div>
      )}

      {globalError && (
        <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{globalError}</span>
          </div>
          <button onClick={() => setGlobalError(null)} className="text-rose-400 hover:text-rose-300">
            Dismiss
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Editable Information */}
        <div className="lg:col-span-8 space-y-6">
          {/* Business & Personal Details Card */}
          <BrokerCard
            title="Business & Commercial Information"
            subtitle="Updates will reflect across all generated partner contracts and invoices."
          >
            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-[#8B94A1] mb-1">Full Legal Name</label>
                  <input
                    type="text"
                    required
                    value={userProfile.name}
                    onChange={(e) => setUserProfile({ ...userProfile, name: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-[#171A1F] border border-[#22262D] text-xs text-[#E6E8EB] focus:outline-none focus:border-[#C2A878]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#8B94A1] mb-1">Email Address</label>
                  <input
                    type="email"
                    readOnly
                    value={userProfile.email}
                    className="w-full px-3 py-2 rounded-lg bg-[#0E1013] border border-[#22262D] text-xs text-[#8B94A1] cursor-not-allowed font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#8B94A1] mb-1">Mobile Phone</label>
                  <input
                    type="text"
                    value={userProfile.phone}
                    onChange={(e) => setUserProfile({ ...userProfile, phone: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-[#171A1F] border border-[#22262D] text-xs text-[#E6E8EB] focus:outline-none focus:border-[#C2A878]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#8B94A1] mb-1">WhatsApp</label>
                  <input
                    type="text"
                    value={userProfile.whatsapp}
                    onChange={(e) => setUserProfile({ ...userProfile, whatsapp: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-[#171A1F] border border-[#22262D] text-xs text-[#E6E8EB] focus:outline-none focus:border-[#C2A878]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#8B94A1] mb-1">Company / Agency Name</label>
                  <input
                    type="text"
                    value={userProfile.companyName}
                    onChange={(e) => setUserProfile({ ...userProfile, companyName: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-[#171A1F] border border-[#22262D] text-xs text-[#E6E8EB] focus:outline-none focus:border-[#C2A878]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#8B94A1] mb-1">Designation</label>
                  <input
                    type="text"
                    value={userProfile.designation}
                    onChange={(e) => setUserProfile({ ...userProfile, designation: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-[#171A1F] border border-[#22262D] text-xs text-[#E6E8EB] focus:outline-none focus:border-[#C2A878]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#8B94A1] mb-1">City</label>
                  <input
                    type="text"
                    value={userProfile.city}
                    onChange={(e) => setUserProfile({ ...userProfile, city: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-[#171A1F] border border-[#22262D] text-xs text-[#E6E8EB] focus:outline-none focus:border-[#C2A878]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#8B94A1] mb-1">Website</label>
                  <input
                    type="text"
                    value={userProfile.website}
                    onChange={(e) => setUserProfile({ ...userProfile, website: e.target.value })}
                    placeholder="https://..."
                    className="w-full px-3 py-2 rounded-lg bg-[#171A1F] border border-[#22262D] text-xs text-[#E6E8EB] focus:outline-none focus:border-[#C2A878]"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-[#1E232B] flex items-center justify-end">
                <BrokerButton
                  type="submit"
                  variant="primary"
                  size="sm"
                  loading={savingProfile}
                  icon={<Save className="w-3.5 h-3.5" />}
                >
                  Save Changes
                </BrokerButton>
              </div>
            </form>
          </BrokerCard>

          {/* Password Security Card with Strength Meter */}
          <BrokerCard
            title="Account Password & Security"
            subtitle="Ensure your account uses a strong, unique password."
          >
            <form onSubmit={handleUpdatePassword} className="space-y-4 max-w-md">
              {passwordError && (
                <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{passwordError}</span>
                </div>
              )}

              {passwordSuccess && (
                <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{passwordSuccess}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-[#8B94A1] mb-1">Current Password</label>
                <input
                  type="password"
                  required
                  value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                  className="w-full px-3 py-1.5 rounded-lg bg-[#171A1F] border border-[#22262D] text-xs text-[#E6E8EB] focus:outline-none focus:border-[#C2A878]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#8B94A1] mb-1">New Password</label>
                <input
                  type="password"
                  required
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                  className="w-full px-3 py-1.5 rounded-lg bg-[#171A1F] border border-[#22262D] text-xs text-[#E6E8EB] focus:outline-none focus:border-[#C2A878]"
                />
                {/* Strength Meter Bar */}
                {passwordForm.newPassword && (
                  <div className="mt-2 space-y-1">
                    <div className="w-full h-1.5 bg-[#0E1013] rounded-full overflow-hidden border border-[#22262D]">
                      <div
                        className={`h-full transition-all duration-300 ${
                          passwordStrength < 50
                            ? "bg-rose-500 w-1/3"
                            : passwordStrength < 75
                            ? "bg-amber-400 w-2/3"
                            : "bg-emerald-500 w-full"
                        }`}
                      />
                    </div>
                    <span className="text-[10px] text-[#8B94A1] block">
                      {passwordStrength < 50
                        ? "Weak (combine letters, numbers, symbols)"
                        : passwordStrength < 75
                        ? "Moderate password strength"
                        : "Strong password"}
                    </span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-[#8B94A1] mb-1">Confirm New Password</label>
                <input
                  type="password"
                  required
                  value={passwordForm.confirmPassword}
                  onChange={(e) =>
                    setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })
                  }
                  className="w-full px-3 py-1.5 rounded-lg bg-[#171A1F] border border-[#22262D] text-xs text-[#E6E8EB] focus:outline-none focus:border-[#C2A878]"
                />
              </div>

              <div className="pt-2">
                <BrokerButton
                  type="submit"
                  variant="primary"
                  size="sm"
                  loading={updatingPassword}
                  icon={<Key className="w-3.5 h-3.5" />}
                >
                  Update Password
                </BrokerButton>
              </div>
            </form>
          </BrokerCard>
        </div>

        {/* Right Column: Payout Details & Referral Links */}
        <div className="lg:col-span-4 space-y-6">
          {/* Avatar & Accreditation Profile */}
          <BrokerCard className="text-center p-6 space-y-4">
            <div className="relative w-20 h-20 mx-auto rounded-full bg-[#171A1F] border-2 border-[#C2A878] flex items-center justify-center text-xl font-bold text-[#C2A878] overflow-hidden">
              {userProfile.avatarUrl ? (
                <img src={userProfile.avatarUrl} alt={userProfile.name} className="w-full h-full object-cover" />
              ) : (
                userProfile.name.charAt(0) || "P"
              )}
              <label className="absolute inset-0 bg-black/40 hover:bg-black/60 flex items-center justify-center text-white opacity-0 hover:opacity-100 transition-opacity cursor-pointer">
                <Camera className="w-5 h-5" />
                <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
              </label>
            </div>

            <div>
              <h3 className="text-sm font-bold text-[#E6E8EB]">{userProfile.name}</h3>
              <p className="text-xs text-[#8B94A1]">{userProfile.companyName || "Accredited Partner"}</p>
              <span className="inline-block mt-2 font-mono text-[11px] text-[#C2A878] px-2.5 py-0.5 rounded-full bg-[#C2A878]/10 border border-[#C2A878]/25">
                {userProfile.partnerId}
              </span>
            </div>

            <div className="pt-3 border-t border-[#1E232B] text-xs text-[#8B94A1] flex justify-between">
              <span>Member Since:</span>
              <span className="text-[#E6E8EB]">{formatDateIN(userProfile.createdAt)}</span>
            </div>
          </BrokerCard>

          {/* Masked Payout Accounts */}
          <BrokerCard title="Disbursement Routing" subtitle="Masked for security">
            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-lg bg-[#0E1013] border border-[#22262D] space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-[#8B94A1]">Method:</span>
                  <span className="font-semibold text-[#E6E8EB]">
                    {userProfile.payoutMethod === "BANK_TRANSFER" ? "Bank Account (NEFT)" : "UPI ID"}
                  </span>
                </div>
                {userProfile.payoutMethod === "BANK_TRANSFER" ? (
                  <>
                    <div className="flex justify-between">
                      <span className="text-[#8B94A1]">Account:</span>
                      <span className="font-mono text-[#E6E8EB]">
                        {userProfile.payoutDetails?.accountNumberMasked || "Not Set"}
                      </span>
                    </div>
                    {userProfile.payoutDetails?.bankName && (
                      <div className="flex justify-between">
                        <span className="text-[#8B94A1]">Bank:</span>
                        <span className="text-[#E6E8EB]">{userProfile.payoutDetails.bankName}</span>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="flex justify-between">
                    <span className="text-[#8B94A1]">UPI ID:</span>
                    <span className="font-mono text-[#E6E8EB]">
                      {userProfile.payoutDetails?.upiIdMasked || "Not Set"}
                    </span>
                  </div>
                )}
              </div>

              {/* Tax Identifiers */}
              <div className="p-3 rounded-lg bg-[#0E1013] border border-[#22262D] space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-[#8B94A1]">PAN (TDS 5%):</span>
                  <span className="font-mono text-[#C2A878] font-bold">
                    {userProfile.panNumberMasked || "Not Verified"}
                  </span>
                </div>
                {userProfile.gstNumber && (
                  <div className="flex justify-between">
                    <span className="text-[#8B94A1]">GSTIN:</span>
                    <span className="font-mono text-[#E6E8EB]">{userProfile.gstNumber}</span>
                  </div>
                )}
              </div>

              <Link href="/broker/onboarding" className="block text-center pt-1">
                <span className="text-xs text-[#C2A878] hover:underline font-medium inline-flex items-center gap-1">
                  <span>Update Banking / Tax in Onboarding</span>
                  <ExternalLink className="w-3 h-3" />
                </span>
              </Link>
            </div>
          </BrokerCard>

          {/* Referral Credentials */}
          {userProfile.referralCode && (
            <BrokerCard title="Referral Links">
              <div className="space-y-3 text-xs">
                <div>
                  <span className="text-[#8B94A1] block mb-1">Code:</span>
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono font-bold text-sm text-[#C2A878] bg-[#0E1013] px-2.5 py-1 rounded border border-[#22262D]">
                      {userProfile.referralCode}
                    </span>
                    <BrokerButton
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(userProfile.referralCode, "code")}
                    >
                      {copiedLink === "code" ? "Copied" : "Copy"}
                    </BrokerButton>
                  </div>
                </div>

                <div>
                  <span className="text-[#8B94A1] block mb-1">Lead Intake URL:</span>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="text"
                      readOnly
                      value={leadUrl}
                      className="flex-1 px-2.5 py-1 rounded bg-[#0E1013] border border-[#22262D] text-[11px] font-mono text-[#8B94A1]"
                    />
                    <BrokerButton
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(leadUrl, "lead")}
                    >
                      {copiedLink === "lead" ? "Copied" : "Copy"}
                    </BrokerButton>
                  </div>
                </div>
              </div>
            </BrokerCard>
          )}
        </div>
      </div>
    </div>
  );
}
