"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/employee/PageHeader";
import { EpButton } from "@/components/employee/EpButton";
import { SkeletonCard } from "@/components/employee/SkeletonCard";
import { ChangePasswordForm } from "@/components/employee/ChangePasswordForm";
import { Input } from "@/components/ui/Input";
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
        throw new Error(data.error || "Failed to load profile");
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
        throw new Error(data.error || "Failed to update profile");
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
      <div className="space-y-6 max-w-5xl">
        <SkeletonCard rows={2} />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <SkeletonCard rows={4} />
          <div className="lg:col-span-2">
            <SkeletonCard rows={6} />
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
      className="space-y-6 max-w-5xl"
    >
      {/* Page Header */}
      <PageHeader
        title="Employee Profile"
        subtitle="Manage your personal information, address details, and view corporate credentials."
        icon={User}
      />

      {/* Notifications */}
      {success && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-[#34D399]/10 border border-[#34D399]/20 text-[#34D399] text-sm">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-[#F87171]/10 border border-[#F87171]/20 text-[#F87171] text-sm">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Profile Overview Card */}
      <Card className="p-6 md:p-8 bg-[#111317] border-[#1E2530] rounded-2xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            {profile?.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={profile.avatarUrl}
                alt={profile.name}
                className="w-20 h-20 rounded-2xl object-cover border border-[#22262D]"
              />
            ) : (
              <div className="w-20 h-20 rounded-2xl bg-[#5FA8A0]/15 text-[#5FA8A0] border border-[#5FA8A0]/30 flex items-center justify-center font-bold text-2xl shadow-lg">
                {profile?.name?.charAt(0).toUpperCase() || "E"}
              </div>
            )}
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-xl md:text-2xl font-bold text-[#E6E8EB]">{profile?.name}</h2>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#5FA8A0]/10 text-[#5FA8A0] border border-[#5FA8A0]/20">
                  {profile?.status || "ACTIVE"}
                </span>
              </div>
              <p className="text-[#8B94A1] text-sm mt-0.5">
                {profile?.designation} • {profile?.department}
              </p>
              <p className="text-[#566171] text-xs mt-1">
                Organization: <span className="text-[#E6E8EB]">{profile?.organizationName}</span>
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 text-xs">
            <Link
              href="/employee/attendance"
              className="px-3 py-1.5 rounded-lg bg-[#5FA8A0]/10 border border-[#5FA8A0]/20 text-[#5FA8A0] font-semibold hover:bg-[#5FA8A0]/20 transition-colors flex items-center gap-1.5"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Attendance & Hours</span>
              <ExternalLink className="w-3 h-3 ml-0.5" />
            </Link>
            <div className="px-3 py-1.5 rounded-lg bg-[#0B0D10] border border-[#1E2530] text-[#8B94A1]">
              ID: <span className="font-mono text-[#E6E8EB]">{profile?.employeeId}</span>
            </div>
            <div className="px-3 py-1.5 rounded-lg bg-[#0B0D10] border border-[#1E2530] text-[#8B94A1]">
              Role: <span className="font-semibold text-[#5FA8A0]">{profile?.role}</span>
            </div>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Organization & Readonly Info */}
        <div className="space-y-6">
          <Card className="p-6 bg-[#111317] border-[#1E2530] rounded-2xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-[#1E2530]">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-[#8B94A1] flex items-center gap-2">
                <Lock className="w-4 h-4 text-[#566171]" />
                Employment Details
              </h3>
              <span className="text-[10px] text-[#8B94A1] bg-[#0B0D10] border border-[#1E2530] px-2 py-0.5 rounded">
                Admin Managed
              </span>
            </div>

            <div className="space-y-4 text-xs sm:text-sm">
              <div className="flex items-start gap-3 text-[#8B94A1]">
                <Mail className="w-4 h-4 text-[#566171] mt-0.5 shrink-0" />
                <div>
                  <p className="text-[11px] text-[#566171]">Work Email</p>
                  <p className="font-medium text-[#E6E8EB]">{profile?.email}</p>
                </div>
              </div>

              <div className="flex items-start gap-3 text-[#8B94A1]">
                <Building2 className="w-4 h-4 text-[#566171] mt-0.5 shrink-0" />
                <div>
                  <p className="text-[11px] text-[#566171]">Department</p>
                  <p className="font-medium text-[#E6E8EB]">{profile?.department}</p>
                </div>
              </div>

              <div className="flex items-start gap-3 text-[#8B94A1]">
                <Briefcase className="w-4 h-4 text-[#566171] mt-0.5 shrink-0" />
                <div>
                  <p className="text-[11px] text-[#566171]">Designation</p>
                  <p className="font-medium text-[#E6E8EB]">{profile?.designation}</p>
                </div>
              </div>

              <div className="flex items-start gap-3 text-[#8B94A1]">
                <Shield className="w-4 h-4 text-[#566171] mt-0.5 shrink-0" />
                <div>
                  <p className="text-[11px] text-[#566171]">System Role</p>
                  <p className="font-medium text-[#5FA8A0]">{profile?.role}</p>
                </div>
              </div>

              <div className="flex items-start gap-3 text-[#8B94A1]">
                <Calendar className="w-4 h-4 text-[#566171] mt-0.5 shrink-0" />
                <div>
                  <p className="text-[11px] text-[#566171]">Joining Date</p>
                  <p className="font-medium text-[#E6E8EB]">
                    {profile?.joiningDate
                      ? new Date(profile.joiningDate).toLocaleDateString()
                      : "N/A"}
                  </p>
                </div>
              </div>
            </div>
          </Card>

          {/* Security Card */}
          <Card className="p-6 bg-[#111317] border-[#1E2530] rounded-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#1E2530]">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-[#8B94A1] flex items-center gap-2">
                <Lock className="w-4 h-4 text-[#566171]" />
                Security
              </h3>
            </div>
            <div className="space-y-4 text-sm">
              <div className="w-full">
                <p className="text-xs text-[#566171] mb-1">Password</p>
                <p className="font-mono text-[#E6E8EB] text-lg tracking-widest leading-none mb-3">
                  ••••••••
                </p>
                <ChangePasswordForm />
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column: Editable Profile Details */}
        <div className="lg:col-span-2">
          <Card className="p-6 md:p-8 bg-[#111317] border-[#1E2530] rounded-2xl">
            <h3 className="text-base font-semibold text-[#E6E8EB] mb-1 flex items-center gap-2">
              <User className="w-5 h-5 text-[#5FA8A0]" />
              Edit Personal Information
            </h3>
            <p className="text-xs text-[#8B94A1] mb-6">
              You are authorized to update your personal contact, residential address, and profile photo.
            </p>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Full Name */}
              <div>
                <label className="block text-xs font-medium text-[#8B94A1] mb-1.5" htmlFor="name">
                  Full Name <span className="text-[#F87171]">*</span>
                </label>
                <Input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  placeholder="e.g. John Doe"
                  required
                  className="bg-[#0B0D10] border-[#1E2530] text-[#E6E8EB] placeholder:text-[#566171] focus-visible:border-[#5FA8A0]"
                />
                {fieldErrors.name && (
                  <p className="text-xs text-[#F87171] mt-1">{fieldErrors.name}</p>
                )}
              </div>

              {/* Phone & Emergency Contact */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-[#8B94A1] mb-1.5" htmlFor="phone">
                    Phone Number
                  </label>
                  <div className="relative">
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleInputChange("phone", e.target.value)}
                      placeholder="+91 98765 43210"
                      className="bg-[#0B0D10] border-[#1E2530] text-[#E6E8EB] placeholder:text-[#566171] focus-visible:border-[#5FA8A0]"
                    />
                    <Phone className="w-4 h-4 text-[#566171] absolute right-3 top-2.5 pointer-events-none" />
                  </div>
                  {fieldErrors.phone && (
                    <p className="text-xs text-[#F87171] mt-1">{fieldErrors.phone}</p>
                  )}
                </div>

                <div>
                  <label
                    className="block text-xs font-medium text-[#8B94A1] mb-1.5"
                    htmlFor="emergencyContact"
                  >
                    Emergency Contact
                  </label>
                  <div className="relative">
                    <Input
                      id="emergencyContact"
                      type="text"
                      value={formData.emergencyContact}
                      onChange={(e) => handleInputChange("emergencyContact", e.target.value)}
                      placeholder="Name / Relationship & Phone"
                      className="bg-[#0B0D10] border-[#1E2530] text-[#E6E8EB] placeholder:text-[#566171] focus-visible:border-[#5FA8A0]"
                    />
                    <HeartPulse className="w-4 h-4 text-[#566171] absolute right-3 top-2.5 pointer-events-none" />
                  </div>
                  {fieldErrors.emergencyContact && (
                    <p className="text-xs text-[#F87171] mt-1">{fieldErrors.emergencyContact}</p>
                  )}
                </div>
              </div>

              {/* Avatar URL */}
              <div>
                <label
                  className="block text-xs font-medium text-[#8B94A1] mb-1.5"
                  htmlFor="avatarUrl"
                >
                  Profile Photo URL
                </label>
                <Input
                  id="avatarUrl"
                  type="url"
                  value={formData.avatarUrl}
                  onChange={(e) => handleInputChange("avatarUrl", e.target.value)}
                  placeholder="https://example.com/avatar.jpg"
                  className="bg-[#0B0D10] border-[#1E2530] text-[#E6E8EB] placeholder:text-[#566171] focus-visible:border-[#5FA8A0]"
                />
                {fieldErrors.avatarUrl && (
                  <p className="text-xs text-[#F87171] mt-1">{fieldErrors.avatarUrl}</p>
                )}
                <p className="text-[11px] text-[#566171] mt-1">
                  Provide a secure, publicly accessible image URL for your profile avatar.
                </p>
              </div>

              {/* Address */}
              <div>
                <label
                  className="block text-xs font-medium text-[#8B94A1] mb-1.5"
                  htmlFor="address"
                >
                  Residential Address
                </label>
                <div className="relative">
                  <Input
                    id="address"
                    type="text"
                    value={formData.address}
                    onChange={(e) => handleInputChange("address", e.target.value)}
                    placeholder="City, State, Country"
                    className="bg-[#0B0D10] border-[#1E2530] text-[#E6E8EB] placeholder:text-[#566171] focus-visible:border-[#5FA8A0]"
                  />
                  <MapPin className="w-4 h-4 text-[#566171] absolute right-3 top-2.5 pointer-events-none" />
                </div>
                {fieldErrors.address && (
                  <p className="text-xs text-[#F87171] mt-1">{fieldErrors.address}</p>
                )}
              </div>

              {/* Submit Button */}
              <div className="pt-4 border-t border-[#1E2530] flex items-center justify-end gap-3">
                <EpButton
                  type="button"
                  variant="outline"
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
                  isLoading={saving}
                  className="text-xs h-9 px-4"
                >
                  Save Changes
                </EpButton>
              </div>
            </form>
          </Card>
        </div>
      </div>
    </motion.div>
  );
}
