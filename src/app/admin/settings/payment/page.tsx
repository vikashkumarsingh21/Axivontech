"use client";

import { useState, useEffect } from "react";
import { Building2, Smartphone, Save } from "lucide-react";

export default function AdminPaymentSettingsPage() {
  const [settings, setSettings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [bankForm, setBankForm] = useState({
    isActive: true,
    accountHolderName: "",
    bankName: "",
    accountNumber: "",
    ifscCode: "",
    branch: "",
    accountType: "CURRENT",
  });

  const [upiForm, setUpiForm] = useState({
    isActive: true,
    upiId: "",
    upiName: "",
    qrCodeUrl: "",
  });

  useEffect(() => {
    fetch("/api/v1/admin/payment-settings")
      .then((res) => res.json())
      .then((d) => {
        const data = d.data || [];
        setSettings(data);
        const bank = data.find((s: any) => s.type === "BANK");
        const upi = data.find((s: any) => s.type === "UPI");

        if (bank) {
          setBankForm({
            isActive: bank.isActive,
            accountHolderName: bank.accountHolderName || "",
            bankName: bank.bankName || "",
            accountNumber: bank.accountNumber || "",
            ifscCode: bank.ifscCode || "",
            branch: bank.branch || "",
            accountType: bank.accountType || "CURRENT",
          });
        }
        if (upi) {
          setUpiForm({
            isActive: upi.isActive,
            upiId: upi.upiId || "",
            upiName: upi.upiName || "",
            qrCodeUrl: upi.qrCodeUrl || "",
          });
        }
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  const saveSettings = async (type: "BANK" | "UPI") => {
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const payload = type === "BANK" ? { type: "BANK", ...bankForm } : { type: "UPI", ...upiForm };
      const res = await fetch("/api/v1/admin/payment-settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save settings");
      setSuccess(`${type} settings saved successfully.`);
      
      // Update local state to reflect updatedBy
      setSettings(prev => {
        const other = prev.filter(p => p.type !== type);
        return [...other, data.data];
      });
    } catch (err: any) {
      setError(err.message);
    }
    setSaving(false);
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Loading settings...</div>;

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Payment Settings</h1>
        <p className="text-sm text-gray-400">Configure bank and UPI details for broker advance payments.</p>
      </div>

      {error && <div className="p-4 bg-red-500/10 text-red-400 border border-red-500/20 rounded-md text-sm">{error}</div>}
      {success && <div className="p-4 bg-green-500/10 text-green-400 border border-green-500/20 rounded-md text-sm">{success}</div>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* BANK SECTION */}
        <div className="bg-[#111] border border-white/10 rounded-xl overflow-hidden">
          <div className="p-4 border-b border-white/10 flex items-center justify-between bg-black/20">
            <div className="flex items-center gap-2 text-white font-medium">
              <Building2 size={18} className="text-blue-400" /> Bank Transfer
            </div>
            <label className="flex items-center cursor-pointer gap-2 text-sm text-gray-400">
              <input
                type="checkbox"
                checked={bankForm.isActive}
                onChange={(e) => setBankForm({ ...bankForm, isActive: e.target.checked })}
                className="rounded border-white/20 bg-[#1a1a1a]"
              />
              Active
            </label>
          </div>
          <div className="p-5 space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">Account Holder Name</label>
              <input
                type="text"
                value={bankForm.accountHolderName}
                onChange={(e) => setBankForm({ ...bankForm, accountHolderName: e.target.value })}
                className="w-full bg-[#1a1a1a] border border-white/10 rounded-md p-2 text-white text-sm focus:border-red-500/50 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">Bank Name</label>
              <input
                type="text"
                value={bankForm.bankName}
                onChange={(e) => setBankForm({ ...bankForm, bankName: e.target.value })}
                className="w-full bg-[#1a1a1a] border border-white/10 rounded-md p-2 text-white text-sm focus:border-red-500/50 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">Account Number</label>
              <input
                type="text"
                value={bankForm.accountNumber}
                onChange={(e) => setBankForm({ ...bankForm, accountNumber: e.target.value })}
                className="w-full bg-[#1a1a1a] border border-white/10 rounded-md p-2 text-white text-sm focus:border-red-500/50 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">IFSC Code</label>
              <input
                type="text"
                value={bankForm.ifscCode}
                onChange={(e) => setBankForm({ ...bankForm, ifscCode: e.target.value })}
                className="w-full bg-[#1a1a1a] border border-white/10 rounded-md p-2 text-white text-sm focus:border-red-500/50 focus:outline-none"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">Branch</label>
                <input
                  type="text"
                  value={bankForm.branch}
                  onChange={(e) => setBankForm({ ...bankForm, branch: e.target.value })}
                  className="w-full bg-[#1a1a1a] border border-white/10 rounded-md p-2 text-white text-sm focus:border-red-500/50 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">Account Type</label>
                <select
                  value={bankForm.accountType}
                  onChange={(e) => setBankForm({ ...bankForm, accountType: e.target.value })}
                  className="w-full bg-[#1a1a1a] border border-white/10 rounded-md p-2 text-white text-sm focus:border-red-500/50 focus:outline-none"
                >
                  <option value="CURRENT">Current</option>
                  <option value="SAVINGS">Savings</option>
                </select>
              </div>
            </div>
            
            <div className="pt-4 flex justify-end">
              <button
                onClick={() => saveSettings("BANK")}
                disabled={saving}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded flex items-center gap-2 text-sm transition-colors"
              >
                <Save size={16} /> Save Bank Details
              </button>
            </div>
            {settings.find((s) => s.type === "BANK")?.updatedBy && (
              <p className="text-[10px] text-gray-500 text-right mt-1">
                Last updated by {settings.find((s) => s.type === "BANK").updatedBy.name} on {new Date(settings.find((s) => s.type === "BANK").updatedAt).toLocaleString()}
              </p>
            )}
          </div>
        </div>

        {/* UPI SECTION */}
        <div className="bg-[#111] border border-white/10 rounded-xl overflow-hidden">
          <div className="p-4 border-b border-white/10 flex items-center justify-between bg-black/20">
            <div className="flex items-center gap-2 text-white font-medium">
              <Smartphone size={18} className="text-purple-400" /> UPI Transfer
            </div>
            <label className="flex items-center cursor-pointer gap-2 text-sm text-gray-400">
              <input
                type="checkbox"
                checked={upiForm.isActive}
                onChange={(e) => setUpiForm({ ...upiForm, isActive: e.target.checked })}
                className="rounded border-white/20 bg-[#1a1a1a]"
              />
              Active
            </label>
          </div>
          <div className="p-5 space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">UPI ID</label>
              <input
                type="text"
                value={upiForm.upiId}
                onChange={(e) => setUpiForm({ ...upiForm, upiId: e.target.value })}
                className="w-full bg-[#1a1a1a] border border-white/10 rounded-md p-2 text-white text-sm focus:border-red-500/50 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">UPI Name / Merchant Name</label>
              <input
                type="text"
                value={upiForm.upiName}
                onChange={(e) => setUpiForm({ ...upiForm, upiName: e.target.value })}
                className="w-full bg-[#1a1a1a] border border-white/10 rounded-md p-2 text-white text-sm focus:border-red-500/50 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">QR Code Image URL</label>
              <input
                type="url"
                value={upiForm.qrCodeUrl}
                onChange={(e) => setUpiForm({ ...upiForm, qrCodeUrl: e.target.value })}
                className="w-full bg-[#1a1a1a] border border-white/10 rounded-md p-2 text-white text-sm focus:border-red-500/50 focus:outline-none"
                placeholder="https://..."
              />
            </div>
            
            {upiForm.qrCodeUrl && (
              <div className="mt-4 p-4 border border-white/5 bg-black/20 rounded-lg flex justify-center">
                <img src={upiForm.qrCodeUrl} alt="UPI QR Code" className="max-w-[150px] rounded" />
              </div>
            )}
            
            <div className="pt-4 flex justify-end">
              <button
                onClick={() => saveSettings("UPI")}
                disabled={saving}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded flex items-center gap-2 text-sm transition-colors"
              >
                <Save size={16} /> Save UPI Details
              </button>
            </div>
            {settings.find((s) => s.type === "UPI")?.updatedBy && (
              <p className="text-[10px] text-gray-500 text-right mt-1">
                Last updated by {settings.find((s) => s.type === "UPI").updatedBy.name} on {new Date(settings.find((s) => s.type === "UPI").updatedAt).toLocaleString()}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
