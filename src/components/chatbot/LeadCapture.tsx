import React, { useState } from "react";
import { Send, CheckCircle } from "lucide-react";

interface LeadCaptureProps {
  onComplete: (name: string) => void;
  onCancel: () => void;
}

export function LeadCapture({ onComplete, onCancel }: LeadCaptureProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    companyName: "",
    serviceInterest: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email) {
      setError("Name and Email are required.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/v1/public/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, source: "WEBSITE_CONTACT" }),
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess(true);
        setTimeout(() => {
          onComplete(formData.name);
        }, 1500);
      } else {
        setError(data.error || "Failed to submit. Please try again.");
      }
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center p-4 text-center bg-[#1c1c1e] rounded-xl border border-[#262626] animate-in fade-in zoom-in duration-300">
        <CheckCircle className="h-8 w-8 text-green-500 mb-2" />
        <h4 className="text-sm font-semibold text-[#f4f4f5]">Request Sent!</h4>
        <p className="text-xs text-gray-400 mt-1">Our team will reach out shortly.</p>
      </div>
    );
  }

  return (
    <div className="bg-[#1c1c1e] rounded-xl border border-[#262626] p-3 text-sm">
      <div className="mb-3 text-xs text-gray-300 font-medium">
        Share your project details with our team:
      </div>
      <form onSubmit={handleSubmit} className="space-y-2">
        <input
          type="text"
          placeholder="Name *"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="w-full rounded-lg bg-[#0f0f0f] border border-[#2a2a2a] px-3 py-2 text-xs text-white focus:border-[#e8a064]/50 focus:outline-none"
          required
        />
        <input
          type="email"
          placeholder="Email *"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          className="w-full rounded-lg bg-[#0f0f0f] border border-[#2a2a2a] px-3 py-2 text-xs text-white focus:border-[#e8a064]/50 focus:outline-none"
          required
        />
        <input
          type="tel"
          placeholder="Phone (optional)"
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          className="w-full rounded-lg bg-[#0f0f0f] border border-[#2a2a2a] px-3 py-2 text-xs text-white focus:border-[#e8a064]/50 focus:outline-none"
        />
        <textarea
          placeholder="Project details or requirements..."
          value={formData.message}
          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
          className="w-full h-16 rounded-lg bg-[#0f0f0f] border border-[#2a2a2a] px-3 py-2 text-xs text-white focus:border-[#e8a064]/50 focus:outline-none resize-none"
        />
        {error && <div className="text-[10px] text-red-400">{error}</div>}
        <div className="flex gap-2 pt-1">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 py-1.5 rounded-lg border border-[#2a2a2a] text-xs text-gray-400 hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg bg-[#e8a064] text-black font-semibold text-xs hover:bg-[#d4915c] transition-colors disabled:opacity-50"
          >
            {loading ? "Sending..." : "Submit"} <Send className="w-3 h-3" />
          </button>
        </div>
      </form>
    </div>
  );
}
