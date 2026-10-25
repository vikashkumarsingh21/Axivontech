"use client";

import { toast } from "@/lib/notifications/toast";
import { getErrorMessage, parseApiResponse } from "@/lib/errors/client";

import { useEffect, useState } from "react";
import {
  User,
  Mail,
  Phone,
  MapPin,
  ShieldCheck,
  CheckCircle2,
  Save,
  Loader2,
  Lock,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

interface ClientProfile {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  address?: string | null;
  avatarUrl?: string | null;
  status: string;
}

export default function ClientProfilePage() {
  const [profile, setProfile] = useState<ClientProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    fetch("/api/v1/client/me")
      .then((res) => res.json())
      .then((json) => {
        if (json?.data) {
          setProfile(json.data);
          setPhone(json.data.phone || "");
          setAddress(json.data.address || "");
        }
      })
      .catch((err) => console.error("Error loading client profile:", err))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      setSaveSuccess(false);

      const res = await fetch("/api/v1/client/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, address }),
      });

      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || "Failed to update profile");
      }

      setSaveSuccess(true);
    } catch (err: any) {
      toast.error(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-20 space-y-3">
        <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
        <p className="text-sm text-[#7E8997]">Loading account profile...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-[#F3F5F7] tracking-tight">
          Client Account Profile
        </h1>
        <p className="text-sm text-[#7E8997] mt-0.5">
          Manage corporate communication contacts and inspect authorization credentials.
        </p>
      </div>

      {saveSuccess && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4 flex items-center gap-3 text-emerald-400 text-xs font-semibold">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>Profile contact details updated successfully.</span>
        </div>
      )}

      {/* Identity Card */}
      <Card className="bg-[#151A21] border-[#29313B]">
        <CardHeader className="border-b border-[#1E2530] pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-[#F3F5F7]">Identity & Access Rights</CardTitle>
              <CardDescription className="text-[#7E8997]">
                Authenticated client credential recognized by the AXIVON ONE enterprise gateway.
              </CardDescription>
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Client Partner</span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <span className="text-xs text-[#566171] uppercase font-bold tracking-wider">Full Name</span>
              <p className="text-sm font-semibold text-[#F3F5F7] mt-1">{profile?.name || "Client"}</p>
            </div>
            <div>
              <span className="text-xs text-[#566171] uppercase font-bold tracking-wider">Corporate Email</span>
              <p className="text-sm font-mono text-[#A7B0BC] mt-1">{profile?.email}</p>
            </div>
            <div>
              <span className="text-xs text-[#566171] uppercase font-bold tracking-wider">Account Status</span>
              <div className="mt-1">
                <Badge variant="success">{profile?.status || "ACTIVE"}</Badge>
              </div>
            </div>
            <div>
              <span className="text-xs text-[#566171] uppercase font-bold tracking-wider">Session Security</span>
              <div className="flex items-center gap-1.5 mt-1 text-xs text-[#A7B0BC]">
                <Lock className="w-3.5 h-3.5 text-emerald-400" />
                <span>HMAC-Signed HttpOnly Token</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Editable Contact Form */}
      <Card className="bg-[#151A21] border-[#29313B]">
        <CardHeader className="border-b border-[#1E2530] pb-4">
          <CardTitle className="text-[#F3F5F7]">Communication & Business Address</CardTitle>
          <CardDescription className="text-[#7E8997]">
            Update phone and address for formal delivery notifications and invoice correspondence.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={handleSave} className="space-y-4 max-w-xl">
            <div>
              <label className="block text-xs font-semibold text-[#A7B0BC] mb-1">
                Direct Phone / WhatsApp
              </label>
              <div className="relative">
                <Input
                  placeholder="+91 98765 43210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#A7B0BC] mb-1">
                Corporate Address
              </label>
              <textarea
                rows={3}
                placeholder="Suite, Building, Street, City, State, Country"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full p-3 rounded-lg border border-[#29313B] bg-[#10151B] text-xs text-[#F3F5F7] focus:outline-none focus:border-emerald-500 placeholder:text-[#566171]"
              />
            </div>

            <Button type="submit" variant="primary" disabled={saving}>
              {saving ? <Loader2 className="w-4 h-4 animate-spin mr-1.5" /> : <Save className="w-4 h-4 mr-1.5" />}
              <span>{saving ? "Saving Changes..." : "Save Contact Info"}</span>
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
