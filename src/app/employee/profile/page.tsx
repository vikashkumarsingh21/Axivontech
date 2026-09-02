"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
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
  Loader2,
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

  useEffect(() => {
    fetchProfile();
  }, []);

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

    // Client-side quick checks
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
      <div className="flex items-center justify-center min-h-[400px] text-gray-400">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500 mr-3" />
        <span>Loading employee profile...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-5xl">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight">Employee Profile</h1>
        <p className="text-gray-400 text-sm mt-1">
          Manage your personal information and view your employment credentials.
        </p>
      </div>

      {/* Notifications */}
      {success && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Profile Overview Card */}
      <Card className="p-6 md:p-8 bg-[#0e0e0e] border-white/5 relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            {profile?.avatarUrl ? (
              <img
                src={profile.avatarUrl}
                alt={profile.name}
                className="w-20 h-20 rounded-2xl object-cover border border-white/10"
              />
            ) : (
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-800 text-white flex items-center justify-center font-bold text-2xl shadow-lg border border-white/10">
                {profile?.name?.charAt(0).toUpperCase() || "E"}
              </div>
            )}
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-xl md:text-2xl font-bold text-white">{profile?.name}</h2>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  {profile?.status || "ACTIVE"}
                </span>
              </div>
              <p className="text-gray-400 text-sm mt-0.5">
                {profile?.designation} • {profile?.department}
              </p>
              <p className="text-gray-500 text-xs mt-1">
                Organization: <span className="text-gray-300">{profile?.organizationName}</span>
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 text-xs">
            <div className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/5 text-gray-300">
              ID: <span className="font-mono text-white">{profile?.employeeId}</span>
            </div>
            <div className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/5 text-gray-300">
              Role: <span className="font-semibold text-blue-400">{profile?.role}</span>
            </div>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Organization & Readonly Info */}
        <div className="space-y-6">
          <Card className="p-6 bg-[#0a0a0a] border-white/5 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-white/5">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-400 flex items-center gap-2">
                <Lock className="w-4 h-4 text-gray-500" />
                Employment Details
              </h3>
              <span className="text-[10px] text-gray-500 bg-white/5 px-2 py-0.5 rounded">Admin Managed</span>
            </div>

            <div className="space-y-4 text-sm">
              <div className="flex items-start gap-3 text-gray-300">
                <Mail className="w-4 h-4 text-gray-500 mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs text-gray-500">Work Email</p>
                  <p className="font-medium text-white">{profile?.email}</p>
                </div>
              </div>

              <div className="flex items-start gap-3 text-gray-300">
                <Building2 className="w-4 h-4 text-gray-500 mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs text-gray-500">Department</p>
                  <p className="font-medium text-white">{profile?.department}</p>
                </div>
              </div>

              <div className="flex items-start gap-3 text-gray-300">
                <Briefcase className="w-4 h-4 text-gray-500 mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs text-gray-500">Designation</p>
                  <p className="font-medium text-white">{profile?.designation}</p>
                </div>
              </div>

              <div className="flex items-start gap-3 text-gray-300">
                <Shield className="w-4 h-4 text-gray-500 mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs text-gray-500">System Role</p>
                  <p className="font-medium text-blue-400">{profile?.role}</p>
                </div>
              </div>

              <div className="flex items-start gap-3 text-gray-300">
                <Calendar className="w-4 h-4 text-gray-500 mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs text-gray-500">Joining Date</p>
                  <p className="font-medium text-white">
                    {profile?.joiningDate ? new Date(profile.joiningDate).toLocaleDateString() : "N/A"}
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column: Editable Profile Details */}
        <div className="lg:col-span-2">
          <Card className="p-6 md:p-8 bg-[#0a0a0a] border-white/5">
            <h3 className="text-base font-semibold text-white mb-2 flex items-center gap-2">
              <User className="w-5 h-5 text-blue-400" />
              Edit Personal Information
            </h3>
            <p className="text-xs text-gray-500 mb-6">
              You are authorized to update your personal contact and address details.
            </p>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Full Name */}
              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1.5" htmlFor="name">
                  Full Name <span className="text-red-400">*</span>
                </label>
                <Input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  placeholder="e.g. John Doe"
                  required
                />
                {fieldErrors.name && (
                  <p className="text-xs text-red-400 mt-1">{fieldErrors.name}</p>
                )}
              </div>

              {/* Phone & Emergency Contact */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1.5" htmlFor="phone">
                    Phone Number
                  </label>
                  <div className="relative">
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleInputChange("phone", e.target.value)}
                      placeholder="+91 98765 43210"
                    />
                    <Phone className="w-4 h-4 text-gray-500 absolute right-3 top-2.5 pointer-events-none" />
                  </div>
                  {fieldErrors.phone && (
                    <p className="text-xs text-red-400 mt-1">{fieldErrors.phone}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1.5" htmlFor="emergencyContact">
                    Emergency Contact
                  </label>
                  <div className="relative">
                    <Input
                      id="emergencyContact"
                      type="text"
                      value={formData.emergencyContact}
                      onChange={(e) => handleInputChange("emergencyContact", e.target.value)}
                      placeholder="Name / Relationship & Phone"
                    />
                    <HeartPulse className="w-4 h-4 text-gray-500 absolute right-3 top-2.5 pointer-events-none" />
                  </div>
                  {fieldErrors.emergencyContact && (
                    <p className="text-xs text-red-400 mt-1">{fieldErrors.emergencyContact}</p>
                  )}
                </div>
              </div>

              {/* Avatar URL */}
              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1.5" htmlFor="avatarUrl">
                  Profile Photo URL
                </label>
                <Input
                  id="avatarUrl"
                  type="url"
                  value={formData.avatarUrl}
                  onChange={(e) => handleInputChange("avatarUrl", e.target.value)}
                  placeholder="https://example.com/avatar.jpg"
                />
                {fieldErrors.avatarUrl && (
                  <p className="text-xs text-red-400 mt-1">{fieldErrors.avatarUrl}</p>
                )}
                <p className="text-[11px] text-gray-500 mt-1">
                  Provide a secure, publicly accessible image URL for your profile avatar.
                </p>
              </div>

              {/* Address */}
              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1.5" htmlFor="address">
                  Residential Address
                </label>
                <div className="relative">
                  <Input
                    id="address"
                    type="text"
                    value={formData.address}
                    onChange={(e) => handleInputChange("address", e.target.value)}
                    placeholder="City, State, Country"
                  />
                  <MapPin className="w-4 h-4 text-gray-500 absolute right-3 top-2.5 pointer-events-none" />
                </div>
                {fieldErrors.address && (
                  <p className="text-xs text-red-400 mt-1">{fieldErrors.address}</p>
                )}
              </div>

              {/* Submit Button */}
              <div className="pt-4 border-t border-white/5 flex items-center justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={fetchProfile}
                  disabled={saving}
                >
                  Reset
                </Button>
                <Button type="submit" size="sm" disabled={saving}>
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving Changes...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
}
