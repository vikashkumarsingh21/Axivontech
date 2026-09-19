"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Loader2, CheckCircle2, AlertCircle } from "lucide-react";

export function ChangePasswordForm() {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    if (formData.newPassword !== formData.confirmPassword) {
      setError("New passwords do not match.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/v1/employee/profile/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to change password");
      }

      setSuccess(data.message || "Password changed successfully");
      setFormData({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setTimeout(() => setIsOpen(false), 3000);
    } catch (err: any) {
      setError(err.message || "Failed to change password");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) {
    return (
      <Button variant="outline" size="sm" onClick={() => setIsOpen(true)}>
        Change Password
      </Button>
    );
  }

  return (
    <div className="mt-3 p-4 rounded-lg bg-white/5 border border-white/10 space-y-4">
      <h4 className="text-sm font-semibold text-white">Change Password</h4>
      
      {success && (
        <div className="flex items-center gap-2 p-2 rounded bg-emerald-500/10 text-emerald-400 text-xs">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{success}</span>
        </div>
      )}
      
      {error && (
        <div className="flex items-center gap-2 p-2 rounded bg-red-500/10 text-red-400 text-xs">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="block text-xs text-gray-400 mb-1">Current Password</label>
          <Input 
            type="password" 
            required 
            value={formData.currentPassword}
            onChange={(e) => setFormData(prev => ({...prev, currentPassword: e.target.value}))}
          />
        </div>
        <div>
          <label className="block text-xs text-gray-400 mb-1">New Password</label>
          <Input 
            type="password" 
            required
            minLength={8}
            value={formData.newPassword}
            onChange={(e) => setFormData(prev => ({...prev, newPassword: e.target.value}))}
          />
        </div>
        <div>
          <label className="block text-xs text-gray-400 mb-1">Confirm New Password</label>
          <Input 
            type="password" 
            required
            minLength={8}
            value={formData.confirmPassword}
            onChange={(e) => setFormData(prev => ({...prev, confirmPassword: e.target.value}))}
          />
        </div>
        
        <div className="flex items-center justify-end gap-2 pt-2">
          <Button type="button" variant="ghost" size="sm" onClick={() => {
            setIsOpen(false);
            setError(null);
            setSuccess(null);
          }}>
            Cancel
          </Button>
          <Button type="submit" size="sm" disabled={loading}>
            {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
            Save Password
          </Button>
        </div>
      </form>
    </div>
  );
}
