"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  User,
  Mail,
  Shield,
  Phone,
  Building2,
  Briefcase,
  MapPin,
  HeartPulse,
  Edit3,
  Save,
  X,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Loader2,
  Clock,
  ShieldCheck,
  Send,
  Lock,
  ArrowRight,
  Info,
} from "lucide-react";

export interface UserProfileData {
  id: string;
  email: string;
  name: string;
  displayName: string;
  phone: string | null;
  avatarUrl: string | null;
  employeeId: string | null;
  department: string;
  designation: string;
  address: string | null;
  emergencyContact: string | null;
  status: string;
  role: string;
  organizationName: string;
  createdAt: string;
  updatedAt: string;
  pendingEmailChange: {
    newEmail: string;
    expiresAt: string;
    requestedAt: string;
  } | null;
}

interface AccountProfileSettingsProps {
  portalTheme?: "admin" | "executive";
}

export function AccountProfileSettings({ portalTheme = "admin" }: AccountProfileSettingsProps) {
  const [profile, setProfile] = useState<UserProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Profile Edit State
  const [isEditing, setIsEditing] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    address: "",
    emergencyContact: "",
  });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Email Change State
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [newEmailInput, setNewEmailInput] = useState("");
  const [emailInputError, setEmailInputError] = useState<string | null>(null);
  const [requestingEmailChange, setRequestingEmailChange] = useState(false);
  const [cancellingEmailChange, setCancellingEmailChange] = useState(false);

  // Fetch Profile
  const fetchProfile = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/v1/me/profile");
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to load account profile");
      }
      if (data.profile) {
        setProfile(data.profile);
        setFormData({
          name: data.profile.name || "",
          phone: data.profile.phone || "",
          address: data.profile.address || "",
          emergencyContact: data.profile.emergencyContact || "",
        });
      }
    } catch (err: any) {
      setError(err?.message || "An error occurred while fetching your account details.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  // Form Change Handler
  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => {
      const updated = { ...prev, [field]: value };
      const original = profile
        ? {
            name: profile.name || "",
            phone: profile.phone || "",
            address: profile.address || "",
            emergencyContact: profile.emergencyContact || "",
          }
        : {};
      const changed = JSON.stringify(updated) !== JSON.stringify(original);
      setHasUnsavedChanges(changed);
      return updated;
    });

    if (fieldErrors[field]) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  // Cancel Edit
  const handleCancelEdit = () => {
    if (profile) {
      setFormData({
        name: profile.name || "",
        phone: profile.phone || "",
        address: profile.address || "",
        emergencyContact: profile.emergencyContact || "",
      });
    }
    setFieldErrors({});
    setHasUnsavedChanges(false);
    setIsEditing(false);
  };

  // Validate Profile Form
  const validateProfileForm = (): boolean => {
    const errors: Record<string, string> = {};
    if (!formData.name.trim()) {
      errors.name = "Full name is required";
    } else if (formData.name.trim().length < 2) {
      errors.name = "Full name must be at least 2 characters";
    } else if (formData.name.trim().length > 100) {
      errors.name = "Full name cannot exceed 100 characters";
    }

    if (formData.phone && formData.phone.trim()) {
      const phoneRegex = /^[+0-9\s-]*$/;
      if (!phoneRegex.test(formData.phone)) {
        errors.phone = "Invalid phone number format (only +, numbers, spaces, and hyphens allowed)";
      } else if (formData.phone.length > 20) {
        errors.phone = "Phone number is too long";
      }
    }

    if (formData.address && formData.address.length > 255) {
      errors.address = "Address cannot exceed 255 characters";
    }

    if (formData.emergencyContact && formData.emergencyContact.length > 100) {
      errors.emergencyContact = "Emergency contact cannot exceed 100 characters";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Save Profile Changes
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateProfileForm()) return;

    setSavingProfile(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const res = await fetch("/api/v1/me/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name.trim(),
          phone: formData.phone.trim() || null,
          address: formData.address.trim() || null,
          emergencyContact: formData.emergencyContact.trim() || null,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to update profile information");
      }

      setProfile((prev) => (prev ? { ...prev, ...data.profile } : null));
      setSuccessMessage("Profile information updated successfully.");
      setIsEditing(false);
      setHasUnsavedChanges(false);
    } catch (err: any) {
      setError(err?.message || "An error occurred while saving your profile changes.");
    } finally {
      setSavingProfile(false);
    }
  };

  // Request Email Change
  const handleRequestEmailChange = async (e: React.FormEvent) => {
    e.preventDefault();
    const emailToValidate = newEmailInput.trim().toLowerCase();

    if (!emailToValidate) {
      setEmailInputError("Please enter your new email address");
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailToValidate)) {
      setEmailInputError("Please enter a valid email address");
      return;
    }
    if (profile && emailToValidate === profile.email.toLowerCase()) {
      setEmailInputError("The new email address cannot be the same as your current email address");
      return;
    }

    setEmailInputError(null);
    setRequestingEmailChange(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const res = await fetch("/api/v1/me/profile/email-change/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newEmail: emailToValidate }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to initiate email change request");
      }

      setSuccessMessage(data.message || `Verification link sent to ${emailToValidate}`);
      setShowEmailModal(false);
      setNewEmailInput("");

      // Update local profile pending state
      setProfile((prev) =>
        prev
          ? {
              ...prev,
              pendingEmailChange: {
                newEmail: data.pendingEmail,
                expiresAt: data.expiresAt,
                requestedAt: new Date().toISOString(),
              },
            }
          : null
      );
    } catch (err: any) {
      setEmailInputError(err?.message || "An error occurred while requesting email change");
    } finally {
      setRequestingEmailChange(false);
    }
  };

  // Cancel Pending Email Change
  const handleCancelPendingEmail = async () => {
    if (!confirm("Are you sure you want to cancel this pending email change request?")) {
      return;
    }

    setCancellingEmailChange(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const res = await fetch("/api/v1/me/profile/email-change/cancel", {
        method: "POST",
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to cancel pending email change");
      }

      setSuccessMessage("Pending email change request has been cancelled.");
      setProfile((prev) => (prev ? { ...prev, pendingEmailChange: null } : null));
    } catch (err: any) {
      setError(err?.message || "Failed to cancel pending email change");
    } finally {
      setCancellingEmailChange(false);
    }
  };

  const isExecutive = portalTheme === "executive" || profile?.role === "FOUNDER" || profile?.role === "CO_FOUNDER";
  const accentColor = isExecutive ? "#D6B779" : "#10b981";
  const accentBorder = isExecutive ? "border-[#D6B779]/30" : "border-emerald-500/30";
  const accentBgLight = isExecutive ? "bg-[#D6B779]/10 text-[#D6B779]" : "bg-emerald-500/10 text-emerald-400";
  const accentButton = isExecutive
    ? "bg-[#D6B779] hover:bg-[#c4a56a] text-black font-semibold"
    : "bg-emerald-500 hover:bg-emerald-600 text-[#04130E] font-semibold";

  if (loading) {
    return (
      <div className="p-12 text-center bg-[#151A21] border border-[#29313B] rounded-2xl space-y-4">
        <Loader2 className="w-8 h-8 animate-spin mx-auto text-emerald-400" />
        <p className="text-sm text-[#7E8997]">Loading account profile and settings...</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="p-8 text-center bg-[#151A21] border border-[#29313B] rounded-2xl space-y-4">
        <AlertTriangle className="w-10 h-10 text-amber-400 mx-auto" />
        <h3 className="text-base font-semibold text-[#F3F5F7]">Unable to Load Profile</h3>
        <p className="text-xs text-[#7E8997] max-w-md mx-auto">{error || "Account details could not be retrieved."}</p>
        <button
          onClick={fetchProfile}
          className="px-4 py-2 text-xs font-semibold rounded-xl bg-[#1B222B] hover:bg-[#202833] text-[#F3F5F7] border border-[#29313B]"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Alerts */}
      {successMessage && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 flex items-start justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            <span className="text-xs font-medium">{successMessage}</span>
          </div>
          <button
            onClick={() => setSuccessMessage(null)}
            className="text-emerald-400/70 hover:text-emerald-300 p-0.5 rounded-md"
            aria-label="Dismiss alert"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/25 text-red-400 flex items-start justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="w-4 h-4 shrink-0 text-red-400" />
            <span className="text-xs font-medium">{error}</span>
          </div>
          <button
            onClick={() => setError(null)}
            className="text-red-400/70 hover:text-red-300 p-0.5 rounded-md"
            aria-label="Dismiss error"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Account Overview Card */}
      <div className="bg-[#151A21] border border-[#29313B] rounded-2xl p-6 sm:p-7 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5">
          <div className="flex items-center gap-4">
            {/* Avatar / Monogram */}
            <div className="w-16 h-16 rounded-2xl bg-[#1B222B] border border-[#29313B] flex items-center justify-center text-xl font-bold font-mono text-[#F3F5F7] shadow-inner shrink-0">
              {profile.name
                .split(" ")
                .map((n) => n[0])
                .join("")
                .substring(0, 2)
                .toUpperCase() || "AX"}
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h2 className="text-xl font-bold text-[#F3F5F7] tracking-tight">{profile.name}</h2>
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider border ${accentBgLight} ${accentBorder}`}>
                  <ShieldCheck className="w-3.5 h-3.5" />
                  {profile.role}
                </span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  {profile.status}
                </span>
              </div>
              <p className="text-xs text-[#7E8997] mt-1 flex items-center gap-2">
                <span>{profile.designation}</span>
                <span>•</span>
                <span>{profile.organizationName}</span>
              </p>
            </div>
          </div>

          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-[#1B222B] hover:bg-[#202833] text-[#F3F5F7] border border-[#29313B] transition-colors shadow-xs cursor-pointer self-start sm:self-auto"
            >
              <Edit3 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Edit Profile</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Settings Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Profile Details (2 Cols) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-[#151A21] border border-[#29313B] rounded-2xl p-6 sm:p-7 shadow-xs">
            <div className="flex items-center justify-between border-b border-[#1E2530] pb-4 mb-5">
              <div>
                <h3 className="text-base font-bold text-[#F3F5F7]">Personal &amp; Contact Details</h3>
                <p className="text-xs text-[#7E8997] mt-0.5">Manage your personal information and contact preferences.</p>
              </div>
              {hasUnsavedChanges && (
                <span className="text-[11px] font-medium text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                  Unsaved Changes
                </span>
              )}
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Full Name */}
                <div>
                  <label className="block text-xs font-medium text-[#A7B0BC] mb-1.5">
                    Full Name <span className="text-emerald-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    disabled={!isEditing || savingProfile}
                    className={`w-full bg-[#10151B] border rounded-xl px-3.5 py-2.5 text-xs text-[#F3F5F7] placeholder-[#566171] transition-all ${
                      fieldErrors.name
                        ? "border-red-500 focus:ring-1 focus:ring-red-500"
                        : "border-[#29313B] focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20"
                    } ${!isEditing ? "opacity-75 cursor-not-allowed bg-[#0E1116]" : ""}`}
                  />
                  {fieldErrors.name && <p className="text-[11px] text-red-400 mt-1">{fieldErrors.name}</p>}
                </div>

                {/* Display Name */}
                <div>
                  <label className="block text-xs font-medium text-[#A7B0BC] mb-1.5">Display Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    disabled
                    className="w-full bg-[#0E1116] border border-[#1E2530] rounded-xl px-3.5 py-2.5 text-xs text-[#7E8997] cursor-not-allowed"
                  />
                  <p className="text-[10px] text-[#566171] mt-1">Derived from your registered full name</p>
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-xs font-medium text-[#A7B0BC] mb-1.5">Phone Number</label>
                  <div className="relative">
                    <Phone className="w-3.5 h-3.5 text-[#566171] absolute left-3.5 top-3" />
                    <input
                      type="text"
                      placeholder="+91 9876543210"
                      value={formData.phone}
                      onChange={(e) => handleInputChange("phone", e.target.value)}
                      disabled={!isEditing || savingProfile}
                      className={`w-full bg-[#10151B] border rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-[#F3F5F7] placeholder-[#566171] transition-all ${
                        fieldErrors.phone
                          ? "border-red-500 focus:ring-1 focus:ring-red-500"
                          : "border-[#29313B] focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20"
                      } ${!isEditing ? "opacity-75 cursor-not-allowed bg-[#0E1116]" : ""}`}
                    />
                  </div>
                  {fieldErrors.phone && <p className="text-[11px] text-red-400 mt-1">{fieldErrors.phone}</p>}
                </div>

                {/* Emergency Contact */}
                <div>
                  <label className="block text-xs font-medium text-[#A7B0BC] mb-1.5">Emergency Contact</label>
                  <div className="relative">
                    <HeartPulse className="w-3.5 h-3.5 text-[#566171] absolute left-3.5 top-3" />
                    <input
                      type="text"
                      placeholder="Name - Relationship - Phone"
                      value={formData.emergencyContact}
                      onChange={(e) => handleInputChange("emergencyContact", e.target.value)}
                      disabled={!isEditing || savingProfile}
                      className={`w-full bg-[#10151B] border rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-[#F3F5F7] placeholder-[#566171] transition-all ${
                        fieldErrors.emergencyContact
                          ? "border-red-500 focus:ring-1 focus:ring-red-500"
                          : "border-[#29313B] focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20"
                      } ${!isEditing ? "opacity-75 cursor-not-allowed bg-[#0E1116]" : ""}`}
                    />
                  </div>
                  {fieldErrors.emergencyContact && (
                    <p className="text-[11px] text-red-400 mt-1">{fieldErrors.emergencyContact}</p>
                  )}
                </div>
              </div>

              {/* Residential Address */}
              <div>
                <label className="block text-xs font-medium text-[#A7B0BC] mb-1.5">Official Address</label>
                <div className="relative">
                  <MapPin className="w-3.5 h-3.5 text-[#566171] absolute left-3.5 top-3" />
                  <input
                    type="text"
                    placeholder="City, State, Country"
                    value={formData.address}
                    onChange={(e) => handleInputChange("address", e.target.value)}
                    disabled={!isEditing || savingProfile}
                    className={`w-full bg-[#10151B] border rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-[#F3F5F7] placeholder-[#566171] transition-all ${
                      fieldErrors.address
                        ? "border-red-500 focus:ring-1 focus:ring-red-500"
                        : "border-[#29313B] focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20"
                    } ${!isEditing ? "opacity-75 cursor-not-allowed bg-[#0E1116]" : ""}`}
                  />
                </div>
                {fieldErrors.address && <p className="text-[11px] text-red-400 mt-1">{fieldErrors.address}</p>}
              </div>

              {/* Read-Only Organizational Attributes */}
              <div className="pt-4 border-t border-[#1E2530] grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <span className="block text-[11px] font-mono text-[#566171] uppercase tracking-wider mb-1">
                    Department
                  </span>
                  <span className="text-xs font-medium text-[#A7B0BC] flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-[#566171]" />
                    {profile.department}
                  </span>
                </div>
                <div>
                  <span className="block text-[11px] font-mono text-[#566171] uppercase tracking-wider mb-1">
                    Designation
                  </span>
                  <span className="text-xs font-medium text-[#A7B0BC] flex items-center gap-1.5">
                    <Briefcase className="w-3.5 h-3.5 text-[#566171]" />
                    {profile.designation}
                  </span>
                </div>
                <div>
                  <span className="block text-[11px] font-mono text-[#566171] uppercase tracking-wider mb-1">
                    Account Status
                  </span>
                  <span className="text-xs font-medium text-emerald-400 font-mono">
                    {profile.status} (Verified)
                  </span>
                </div>
              </div>

              {/* Form Action Buttons */}
              {isEditing && (
                <div className="pt-5 border-t border-[#1E2530] flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    disabled={savingProfile}
                    className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#1B222B] hover:bg-[#202833] text-[#A7B0BC] hover:text-[#F3F5F7] border border-[#29313B] transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={savingProfile || !hasUnsavedChanges}
                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs transition-all shadow-xs cursor-pointer ${accentButton} disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {savingProfile ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Saving Changes...</span>
                      </>
                    ) : (
                      <>
                        <Save className="w-3.5 h-3.5" />
                        <span>Save Changes</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </form>
          </div>
        </div>

        {/* Right Column: Email & Security Credentials (1 Col) */}
        <div className="space-y-6">
          <div className="bg-[#151A21] border border-[#29313B] rounded-2xl p-6 sm:p-7 shadow-xs space-y-5">
            <div className="border-b border-[#1E2530] pb-4">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-wider mb-1">
                <Lock className="w-4 h-4" />
                <span>Account Credentials</span>
              </div>
              <h3 className="text-base font-bold text-[#F3F5F7]">Email Authentication</h3>
              <p className="text-xs text-[#7E8997] mt-0.5">
                Your primary login email address and security verification.
              </p>
            </div>

            {/* Current Verified Email Card */}
            <div className="p-4 bg-[#10151B] border border-[#29313B] rounded-xl space-y-2">
              <div className="flex items-center justify-between text-[11px] font-mono text-[#566171]">
                <span>CURRENT PRIMARY EMAIL</span>
                <span className="inline-flex items-center gap-1 text-emerald-400 font-semibold">
                  <CheckCircle2 className="w-3 h-3" />
                  Verified
                </span>
              </div>
              <p className="text-sm font-mono text-[#F3F5F7] font-semibold break-all">{profile.email}</p>
              <p className="text-[11px] text-[#7E8997] leading-relaxed">
                All security alerts, approvals, and portal notifications are dispatched to this address.
              </p>
            </div>

            {/* Pending Email Change Notice if active */}
            {profile.pendingEmailChange ? (
              <div className="p-4 bg-amber-500/10 border border-amber-500/25 rounded-xl space-y-3">
                <div className="flex items-center gap-2 text-amber-400 text-xs font-bold">
                  <Clock className="w-4 h-4 shrink-0" />
                  <span>Email Verification Pending</span>
                </div>
                <div>
                  <span className="text-[11px] text-[#A7B0BC] block">Target new address:</span>
                  <span className="font-mono text-xs text-[#F3F5F7] font-semibold break-all">
                    {profile.pendingEmailChange.newEmail}
                  </span>
                </div>
                <p className="text-[11px] text-amber-300/80 leading-relaxed">
                  A verification link was dispatched to this address. Your current email remains active until confirmed.
                </p>
                <div className="pt-1 flex items-center justify-between gap-2">
                  <button
                    onClick={handleCancelPendingEmail}
                    disabled={cancellingEmailChange}
                    className="text-xs text-red-400 hover:text-red-300 font-medium underline flex items-center gap-1 cursor-pointer disabled:opacity-50"
                  >
                    {cancellingEmailChange && <Loader2 className="w-3 h-3 animate-spin" />}
                    <span>Cancel Pending Request</span>
                  </button>
                  <span className="text-[10px] text-[#566171] font-mono">Expires in 60m</span>
                </div>
              </div>
            ) : (
              <div>
                <button
                  onClick={() => {
                    setNewEmailInput("");
                    setEmailInputError(null);
                    setShowEmailModal(true);
                  }}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-[#1B222B] hover:bg-[#202833] text-[#F3F5F7] border border-[#29313B] transition-colors shadow-xs cursor-pointer"
                >
                  <Mail className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Change Email Address</span>
                </button>
              </div>
            )}

            {/* Security Guarantee Note */}
            <div className="p-3.5 rounded-xl bg-[#10151B] border border-[#1E2530] text-[11px] text-[#7E8997] space-y-1.5 leading-relaxed">
              <div className="flex items-center gap-1.5 text-[#A7B0BC] font-semibold">
                <Info className="w-3.5 h-3.5 text-emerald-400" />
                <span>Verification Workflow</span>
              </div>
              <p>
                To protect against account takeover, email changes require cryptographic single-use verification links sent to the new address.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Modal / Inline Overlay for Email Change */}
      {showEmailModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
          <div className="bg-[#151A21] border border-[#29313B] rounded-2xl max-w-md w-full p-6 sm:p-7 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-[#1E2530] pb-3.5">
              <div className="flex items-center gap-2 text-sm font-bold text-[#F3F5F7]">
                <Mail className="w-4 h-4 text-emerald-400" />
                <span>Change Email Address</span>
              </div>
              <button
                onClick={() => setShowEmailModal(false)}
                className="text-[#7E8997] hover:text-[#F3F5F7] p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-[#7E8997] leading-relaxed">
              Enter your new email address. We will dispatch a single-use verification link to that address. Your current address will remain active until you confirm the change.
            </p>

            <form onSubmit={handleRequestEmailChange} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-[#A7B0BC] mb-1.5">New Email Address</label>
                <input
                  type="email"
                  placeholder="name@axivontech.in"
                  value={newEmailInput}
                  onChange={(e) => {
                    setNewEmailInput(e.target.value);
                    if (emailInputError) setEmailInputError(null);
                  }}
                  autoFocus
                  className="w-full bg-[#10151B] border border-[#29313B] focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 rounded-xl px-3.5 py-2.5 text-xs text-[#F3F5F7] placeholder-[#566171] transition-all"
                />
                {emailInputError && (
                  <p className="text-[11px] text-red-400 mt-1.5 flex items-center gap-1">
                    <XCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{emailInputError}</span>
                  </p>
                )}
              </div>

              <div className="p-3 bg-[#10151B] border border-amber-500/20 rounded-xl text-[11px] text-amber-300/80 leading-relaxed">
                <strong>Notice:</strong> Changing an administrative email will record a security audit event and alert your current registered email.
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowEmailModal(false)}
                  disabled={requestingEmailChange}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-[#1B222B] hover:bg-[#202833] text-[#A7B0BC] hover:text-[#F3F5F7] border border-[#29313B] transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={requestingEmailChange || !newEmailInput.trim()}
                  className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs transition-all shadow-xs cursor-pointer ${accentButton} disabled:opacity-50`}
                >
                  {requestingEmailChange ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Sending Link...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Send Verification Link</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
