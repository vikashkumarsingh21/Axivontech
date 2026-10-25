"use client";

import { getErrorMessage, parseApiResponse } from "@/lib/errors/client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { PageHeader } from "@/components/employee/PageHeader";
import { EpButton } from "@/components/employee/EpButton";
import { SkeletonCard } from "@/components/employee/SkeletonCard";
import { ChangePasswordForm } from "@/components/employee/ChangePasswordForm";
import {
  User,
  Mail,
  Phone,
  Building2,
  Briefcase,
  Calendar,
  Shield,
  MapPin,
  HeartPulse,
  Lock,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
} from "lucide-react";

interface EmployeeProfileData {
  id: string;
  email: string;
  name: string;
  phone: string | null;
  avatarUrl: string | null;
  employeeId: string;
  department: string;
  designation: string;
  address: string | null;
  emergencyContact: string | null;
  status: string;
  joiningDate: string;
  organizationName: string;
  role: string;
}

export default function EmployeeProfilePage() {
  const [profile, setProfile] = useState<EmployeeProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form fields state
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    avatarUrl: "",
    address: "",
    emergencyContact: "",
  });

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/v1/employee/profile");
      const data = await res.json();

      if (!res.ok) {
        throw new Error(getErrorMessage(data) || "Failed to load profile");
      }

      if (data.profile) {
        setProfile(data.profile);
        setFormData({
          name: data.profile.name || "",
          phone: data.profile.phone || "",
          avatarUrl: data.profile.avatarUrl || "",
          address: data.profile.address || "",
          emergencyContact: data.profile.emergencyContact || "",
        });
      }
    } catch (err: any) {
      setError(err.message || "An error occurred while fetching your profile");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (fieldErrors[field]) {
      setFieldErrors((prev) => {
        const updated = { ...prev };
        delete updated[field];
        return updated;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);
    setFieldErrors({});

    const errors: Record<string, string> = {};
    if (!formData.name.trim()) {
      errors.name = "Name cannot be empty";
    }
    if (formData.phone && !/^[+0-9\s-]*$/.test(formData.phone)) {
      errors.phone = "Invalid phone number format";
    }
    if (formData.avatarUrl && !formData.avatarUrl.startsWith("http")) {
      errors.avatarUrl = "Must be a valid HTTP/HTTPS URL";
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setSaving(false);
      return;
    }

    try {
      const res = await fetch("/api/v1/employee/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          phone: formData.phone.trim() || null,
          avatarUrl: formData.avatarUrl.trim() || null,
          address: formData.address.trim() || null,
          emergencyContact: formData.emergencyContact.trim() || null,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.details && Array.isArray(data.details)) {
          const detailMap: Record<string, string> = {};
          data.details.forEach((d: any) => {
            if (d.path?.[0]) detailMap[d.path[0]] = d.message;
          });
          setFieldErrors(detailMap);
        }
        throw new Error(getErrorMessage(data) || "Failed to update profile");
      }

      setSuccess("Profile information updated successfully.");
      if (profile) {
        setProfile({
          ...profile,
          ...data.profile,
        });
      }
    } catch (err: any) {
      setError(err.message || "Failed to save profile changes");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 max-w-5xl pb-12">
        <SkeletonCard />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <SkeletonCard />
          <div className="lg:col-span-2">
            <SkeletonCard />
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="space-y-6 max-w-5xl pb-12"
    >
      {/* Page Header */}
      <PageHeader
        title="Employee Profile"
        subtitle="Manage your personal information, address details, and view corporate credentials."
        icon={User}
      />

      {/* Notifications */}
      {success && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-[#4F9D83]/10 border border-[#4F9D83]/25 text-[#4F9D83] text-sm">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-[#C46A62]/10 border border-[#C46A62]/25 text-[#C46A62] text-sm">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Profile Overview Card */}
      <div className="p-6 md:p-8 bg-[#1A1A1B] border border-[#2E2E30] rounded-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            {profile?.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={profile.avatarUrl}
                alt={profile.name}
                className="w-20 h-20 rounded-xl object-cover border border-[#2E2E30]"
              />
            ) : (
              <div className="w-20 h-20 rounded-xl bg-[#232324] text-[#4F9D83] border border-[#2E2E30] flex items-center justify-center font-bold text-2xl shadow-sm">
                {profile?.name?.charAt(0).toUpperCase() || "E"}
              </div>
            )}
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-xl md:text-2xl font-semibold text-[#EDEBE6]">{profile?.name}</h2>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#5FAE7E]/10 text-[#5FAE7E] border border-[#5FAE7E]/30">
                  {profile?.status || "ACTIVE"}
                </span>
              </div>
              <p className="text-[#8A867E] text-sm mt-0.5">
                {profile?.designation} • {profile?.department}
              </p>
              <p className="text-[#8A867E]/80 text-xs mt-1">
                Organization: <span className="text-[#EDEBE6]">{profile?.organizationName}</span>
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 text-xs">
            <Link
              href="/employee/attendance"
              className="px-3 py-1.5 rounded-lg bg-[#4F9D83]/10 border border-[#4F9D83]/25 text-[#4F9D83] font-medium hover:bg-[#4F9D83]/20 transition-colors flex items-center gap-1.5"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Attendance & Hours</span>
              <ExternalLink className="w-3 h-3 ml-0.5" />
            </Link>
            <div className="px-3 py-1.5 rounded-lg bg-[#232324] border border-[#2E2E30] text-[#8A867E]">
              ID: <span className="font-mono text-[#EDEBE6]">{profile?.employeeId}</span>
            </div>
            <div className="px-3 py-1.5 rounded-lg bg-[#232324] border border-[#2E2E30] text-[#8A867E]">
              Role: <span className="font-medium text-[#4F9D83]">{profile?.role}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Organization & Readonly Info */}
        <div className="space-y-6">
          <div className="p-6 bg-[#1A1A1B] border border-[#2E2E30] rounded-xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-[#2E2E30]">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-[#8A867E] flex items-center gap-2">
                <Lock className="w-4 h-4 text-[#8A867E]" />
                Employment Details
              </h3>
              <span className="text-[10px] text-[#8A867E] bg-[#232324] border border-[#2E2E30] px-2 py-0.5 rounded">
                Admin Managed
              </span>
            </div>

            <div className="space-y-4 text-xs sm:text-sm">
              <div className="flex items-start gap-3 text-[#8A867E]">
                <Mail className="w-4 h-4 text-[#8A867E] mt-0.5 shrink-0" />
                <div>
                  <p className="text-[11px] text-[#8A867E]">Work Email</p>
                  <p className="font-medium text-[#EDEBE6]">{profile?.email}</p>
                </div>
              </div>

              <div className="flex items-start gap-3 text-[#8A867E]">
                <Building2 className="w-4 h-4 text-[#8A867E] mt-0.5 shrink-0" />
                <div>
                  <p className="text-[11px] text-[#8A867E]">Department</p>
                  <p className="font-medium text-[#EDEBE6]">{profile?.department}</p>
                </div>
              </div>

              <div className="flex items-start gap-3 text-[#8A867E]">
                <Briefcase className="w-4 h-4 text-[#8A867E] mt-0.5 shrink-0" />
                <div>
                  <p className="text-[11px] text-[#8A867E]">Designation</p>
                  <p className="font-medium text-[#EDEBE6]">{profile?.designation}</p>
                </div>
              </div>

              <div className="flex items-start gap-3 text-[#8A867E]">
                <Shield className="w-4 h-4 text-[#8A867E] mt-0.5 shrink-0" />
                <div>
                  <p className="text-[11px] text-[#8A867E]">System Role</p>
                  <p className="font-medium text-[#4F9D83]">{profile?.role}</p>
                </div>
              </div>

              <div className="flex items-start gap-3 text-[#8A867E]">
                <Calendar className="w-4 h-4 text-[#8A867E] mt-0.5 shrink-0" />
                <div>
                  <p className="text-[11px] text-[#8A867E]">Joining Date</p>
                  <p className="font-medium text-[#EDEBE6]">
                    {profile?.joiningDate
                      ? new Date(profile.joiningDate).toLocaleDateString()
                      : "N/A"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Security Card */}
          <div className="p-6 bg-[#1A1A1B] border border-[#2E2E30] rounded-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#2E2E30]">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-[#8A867E] flex items-center gap-2">
                <Lock className="w-4 h-4 text-[#8A867E]" />
                Security
              </h3>
            </div>
            <div className="space-y-4 text-sm">
              <div className="w-full">
                <p className="text-xs text-[#8A867E] mb-1">Password</p>
                <p className="font-mono text-[#EDEBE6] text-lg tracking-widest leading-none mb-3">
                  ••••••••
                </p>
                <ChangePasswordForm />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Editable Profile Details */}
        <div className="lg:col-span-2">
          <div className="p-6 md:p-8 bg-[#1A1A1B] border border-[#2E2E30] rounded-xl">
            <h3 className="text-base font-semibold text-[#EDEBE6] mb-1 flex items-center gap-2">
              <User className="w-5 h-5 text-[#4F9D83]" />
              Edit Personal Information
            </h3>
            <p className="text-xs text-[#8A867E] mb-6">
              You are authorized to update your personal contact, residential address, and profile photo.
            </p>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Full Name */}
              <div>
                <label className="block text-xs font-medium text-[#B3AFA6] mb-1.5" htmlFor="name">
                  Full Name <span className="text-[#C46A62]">*</span>
                </label>
                <input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  placeholder="e.g. John Doe"
                  required
                  className="w-full bg-[#232324] border border-[#2E2E30] rounded-lg px-3 py-2 text-xs sm:text-sm text-[#EDEBE6] placeholder:text-[#7C786F] focus:outline-hidden focus:border-[#4F9D83] focus:ring-1 focus:ring-[#4F9D83]"
                />
                {fieldErrors.name && (
                  <p className="text-xs text-[#C46A62] mt-1">{fieldErrors.name}</p>
                )}
              </div>

              {/* Phone & Emergency Contact */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-[#B3AFA6] mb-1.5" htmlFor="phone">
                    Phone Number
                  </label>
                  <div className="relative">
                    <input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleInputChange("phone", e.target.value)}
                      placeholder="+91 98765 43210"
                      className="w-full bg-[#232324] border border-[#2E2E30] rounded-lg px-3 py-2 text-xs sm:text-sm text-[#EDEBE6] placeholder:text-[#7C786F] focus:outline-hidden focus:border-[#4F9D83] focus:ring-1 focus:ring-[#4F9D83]"
                    />
                    <Phone className="w-4 h-4 text-[#8A867E] absolute right-3 top-2.5 pointer-events-none" />
                  </div>
                  {fieldErrors.phone && (
                    <p className="text-xs text-[#C46A62] mt-1">{fieldErrors.phone}</p>
                  )}
                </div>

                <div>
                  <label
                    className="block text-xs font-medium text-[#B3AFA6] mb-1.5"
                    htmlFor="emergencyContact"
                  >
                    Emergency Contact
                  </label>
                  <div className="relative">
                    <input
                      id="emergencyContact"
                      type="text"
                      value={formData.emergencyContact}
                      onChange={(e) => handleInputChange("emergencyContact", e.target.value)}
                      placeholder="Name / Relationship & Phone"
                      className="w-full bg-[#232324] border border-[#2E2E30] rounded-lg px-3 py-2 text-xs sm:text-sm text-[#EDEBE6] placeholder:text-[#7C786F] focus:outline-hidden focus:border-[#4F9D83] focus:ring-1 focus:ring-[#4F9D83]"
                    />
                    <HeartPulse className="w-4 h-4 text-[#8A867E] absolute right-3 top-2.5 pointer-events-none" />
                  </div>
                  {fieldErrors.emergencyContact && (
                    <p className="text-xs text-[#C46A62] mt-1">{fieldErrors.emergencyContact}</p>
                  )}
                </div>
              </div>

              {/* Avatar URL */}
              <div>
                <label
                  className="block text-xs font-medium text-[#B3AFA6] mb-1.5"
                  htmlFor="avatarUrl"
                >
                  Profile Photo URL
                </label>
                <input
                  id="avatarUrl"
                  type="url"
                  value={formData.avatarUrl}
                  onChange={(e) => handleInputChange("avatarUrl", e.target.value)}
                  placeholder="https://example.com/avatar.jpg"
                  className="w-full bg-[#232324] border border-[#2E2E30] rounded-lg px-3 py-2 text-xs sm:text-sm text-[#EDEBE6] placeholder:text-[#7C786F] focus:outline-hidden focus:border-[#4F9D83] focus:ring-1 focus:ring-[#4F9D83]"
                />
                {fieldErrors.avatarUrl && (
                  <p className="text-xs text-[#C46A62] mt-1">{fieldErrors.avatarUrl}</p>
                )}
                <p className="text-[11px] text-[#8A867E] mt-1">
                  Provide a secure, publicly accessible image URL for your profile avatar.
                </p>
              </div>

              {/* Address */}
              <div>
                <label
                  className="block text-xs font-medium text-[#B3AFA6] mb-1.5"
                  htmlFor="address"
                >
                  Residential Address
                </label>
                <div className="relative">
                  <input
                    id="address"
                    type="text"
                    value={formData.address}
                    onChange={(e) => handleInputChange("address", e.target.value)}
                    placeholder="City, State, Country"
                    className="w-full bg-[#232324] border border-[#2E2E30] rounded-lg px-3 py-2 text-xs sm:text-sm text-[#EDEBE6] placeholder:text-[#7C786F] focus:outline-hidden focus:border-[#4F9D83] focus:ring-1 focus:ring-[#4F9D83]"
                  />
                  <MapPin className="w-4 h-4 text-[#8A867E] absolute right-3 top-2.5 pointer-events-none" />
                </div>
                {fieldErrors.address && (
                  <p className="text-xs text-[#C46A62] mt-1">{fieldErrors.address}</p>
                )}
              </div>

              {/* Submit Button */}
              <div className="pt-4 border-t border-[#2E2E30] flex items-center justify-end gap-3">
                <EpButton
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={fetchProfile}
                  disabled={saving}
                  className="text-xs h-9 px-4"
                >
                  Reset
                </EpButton>
                <EpButton
                  type="submit"
                  variant="primary"
                  size="sm"
                  loading={saving}
                  className="text-xs h-9 px-4"
                >
                  Save Changes
                </EpButton>
              </div>
            </form>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
