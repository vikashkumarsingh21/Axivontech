"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import {
  User, Mail, Shield, AlertTriangle, ArrowLeft, Loader2, Key
} from "lucide-react";
import Link from "next/link";

interface UserDetail {
  id: string;
  name: string;
  email: string;
  department: string;
  designation: string;
  employeeId: string;
  status: string;
  userRoles: { role: { name: string } }[];
}

export default function UserDetailPage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  const [user, setUser] = useState<UserDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  const [emailForm, setEmailForm] = useState("");
  const [roleForm, setRoleForm] = useState("");
  const [passwordForm, setPasswordForm] = useState({ newPassword: "", confirmPassword: "" });

  useEffect(() => {
    fetchUser();
  }, [id]);

  const fetchUser = async () => {
    try {
      const res = await fetch(`/api/v1/executive/people/${id}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setUser(data.data);
      setEmailForm(data.data.email);
      setRoleForm(data.data.userRoles?.[0]?.role?.name || "EMPLOYEE");
    } catch (err: any) {
      setError(err.message || "Failed to load user");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (type: "email" | "status" | "role" | "password") => {
    if (!confirm(`Are you sure you want to perform this sensitive action?`)) return;
    setActionLoading(true);
    setError(null);
    setSuccess(null);

    try {
      if (type === "email" || type === "status") {
        const payload = type === "email" ? { email: emailForm } : { status: user?.status === "ACTIVE" ? "INACTIVE" : "ACTIVE" };
        const res = await fetch(`/api/v1/executive/people/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        setSuccess(data.message);
        fetchUser();
      }
      else if (type === "role") {
        const res = await fetch(`/api/v1/executive/people/${id}/role`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ roleName: roleForm }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        setSuccess(data.message);
        fetchUser();
      }
      else if (type === "password") {
        const res = await fetch(`/api/v1/executive/people/${id}/password-reset`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(passwordForm),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        setSuccess(data.message);
        setPasswordForm({ newPassword: "", confirmPassword: "" });
      }
    } catch (err: any) {
      setError(err.message || `Failed to update ${type}`);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <div className="p-10 flex justify-center"><Loader2 className="animate-spin w-8 h-8 text-blue-500" /></div>;
  if (!user) return <div className="p-10 text-red-500">User not found</div>;

  const currentRole = user.userRoles?.[0]?.role?.name || "EMPLOYEE";

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Link href="/executive/people" className="inline-flex items-center text-sm text-gray-400 hover:text-white transition-colors">
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to People
      </Link>
      
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-2xl">
          {user.name.charAt(0).toUpperCase()}
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            {user.name}
            <span className={`text-xs px-2 py-0.5 rounded ${user.status === "ACTIVE" ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"}`}>
              {user.status}
            </span>
          </h1>
          <p className="text-gray-400">{user.designation} • {user.department}</p>
        </div>
      </div>

      {error && <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg text-sm">{error}</div>}
      {success && <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-lg text-sm">{success}</div>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Email & Status */}
        <Card className="p-6 bg-[#0a0a0a] border-white/5 space-y-6">
          <h3 className="font-semibold text-white flex items-center gap-2">
            <Mail className="w-5 h-5 text-gray-400" /> Account Identity
          </h3>
          <div className="space-y-4">
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Work Email</label>
              <div className="flex gap-2">
                <Input value={emailForm} onChange={(e) => setEmailForm(e.target.value)} />
                <Button variant="outline" disabled={actionLoading || emailForm === user.email} onClick={() => handleUpdate("email")}>Save</Button>
              </div>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-sm text-gray-300 mb-3">Account Status</p>
              <Button 
                variant="outline" 
                className={user.status === "ACTIVE" ? "text-red-400 hover:text-red-300" : "text-emerald-400 hover:text-emerald-300"}
                disabled={actionLoading}
                onClick={() => handleUpdate("status")}
              >
                {user.status === "ACTIVE" ? "Suspend Account" : "Reactivate Account"}
              </Button>
            </div>
          </div>
        </Card>

        {/* Role & Permissions */}
        <Card className="p-6 bg-[#0a0a0a] border-white/5 space-y-6">
          <h3 className="font-semibold text-white flex items-center gap-2">
            <Shield className="w-5 h-5 text-gray-400" /> Role Management
          </h3>
          <div className="space-y-4">
            <div>
              <label className="text-xs text-gray-400 mb-1 block">System Role</label>
              <div className="flex gap-2">
                <select 
                  className="w-full bg-[#111] border border-white/10 rounded-lg px-3 py-2 text-sm text-white"
                  value={roleForm} 
                  onChange={(e) => setRoleForm(e.target.value)}
                >
                  <option value="EMPLOYEE">EMPLOYEE</option>
                  <option value="ADMIN">ADMIN</option>
                  <option value="CO_FOUNDER">CO_FOUNDER</option>
                </select>
                <Button variant="outline" disabled={actionLoading || roleForm === currentRole} onClick={() => handleUpdate("role")}>Save</Button>
              </div>
            </div>
          </div>
        </Card>

        {/* Password Reset - Danger Zone */}
        <Card className="p-6 bg-[#1a0a0a] border-red-500/20 md:col-span-2 space-y-6">
          <h3 className="font-semibold text-red-400 flex items-center gap-2">
            <Key className="w-5 h-5" /> Force Password Reset
          </h3>
          <p className="text-xs text-gray-400">
            Resetting the password will immediately sign out all active sessions for this user. The previous password will be permanently lost.
          </p>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <label className="text-xs text-red-400/70 mb-1 block">New Password</label>
              <Input 
                type="password" 
                value={passwordForm.newPassword} 
                onChange={(e) => setPasswordForm(prev => ({...prev, newPassword: e.target.value}))} 
                placeholder="Minimum 8 characters"
                className="border-red-500/20 focus:border-red-500/50"
              />
            </div>
            <div className="flex-1">
              <label className="text-xs text-red-400/70 mb-1 block">Confirm Password</label>
              <Input 
                type="password" 
                value={passwordForm.confirmPassword} 
                onChange={(e) => setPasswordForm(prev => ({...prev, confirmPassword: e.target.value}))} 
                placeholder="Confirm password"
                className="border-red-500/20 focus:border-red-500/50"
              />
            </div>
            <div className="flex items-end">
              <Button 
                variant="outline" 
                className="text-red-400 hover:text-red-300 border-red-500/30 hover:bg-red-500/10"
                disabled={actionLoading || !passwordForm.newPassword}
                onClick={() => handleUpdate("password")}
              >
                Reset Password
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
