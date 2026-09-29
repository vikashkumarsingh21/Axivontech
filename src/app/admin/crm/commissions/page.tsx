"use client";

import { useState, useEffect } from "react";
import { Check, X, CreditCard } from "lucide-react";

export default function AdminCommissions() {
  const [commissions, setCommissions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch("/api/v1/admin/commissions")
      .then(res => res.json())
      .then(d => {
        setCommissions(d.data || []);
        setIsLoading(false);
      });
  }, []);

  const handleAction = async (id: string, action: string) => {
    if (!confirm(`Are you sure you want to ${action} this commission?`)) return;
    try {
      const res = await fetch(`/api/v1/admin/commissions/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action })
      });
      if (res.ok) {
        alert(`Commission ${action}d successfully`);
        setCommissions(prev => prev.map(c => c.id === id ? { ...c, status: action === 'approve' ? 'APPROVED' : action === 'pay' ? 'PAID' : 'REJECTED' } : c));
      } else {
        const error = await res.json();
        alert(error.error || "Action failed");
      }
    } catch (e) {
      alert("Error performing action");
    }
  };

  if (isLoading) return <div className="p-8 text-center">Loading Commissions...</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6 text-white">Commissions Administration</h1>
      <div className="bg-[#111] rounded-xl border border-white/10 overflow-hidden">
        <table className="w-full text-left text-sm text-gray-300">
          <thead className="bg-white/5 font-medium">
            <tr>
              <th className="p-4">Broker</th>
              <th className="p-4">Project</th>
              <th className="p-4">Rule</th>
              <th className="p-4">Amount</th>
              <th className="p-4">Status</th>
              <th className="p-4">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {commissions.map((c) => (
              <tr key={c.id}>
                <td className="p-4">
                  <p className="text-white">{c.brokerProfile?.user?.name}</p>
                  <p className="text-xs text-gray-500">{c.brokerProfile?.user?.email}</p>
                </td>
                <td className="p-4">
                  <p>{c.partnerProject?.projectName}</p>
                  <p className="text-xs text-gray-500">{c.partnerProject?.projectCode}</p>
                </td>
                <td className="p-4">{c.commissionRule?.name || "Manual"}</td>
                <td className="p-4 font-bold text-white">₹{c.commissionAmount?.toLocaleString()}</td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded text-xs font-bold ${
                    c.status === 'PAID' ? 'bg-emerald-500/10 text-emerald-500' :
                    c.status === 'APPROVED' ? 'bg-blue-500/10 text-blue-500' :
                    c.status === 'ELIGIBLE' ? 'bg-amber-500/10 text-amber-500' :
                    'bg-red-500/10 text-red-500'
                  }`}>{c.status}</span>
                </td>
                <td className="p-4 flex gap-2">
                  {c.status === 'ELIGIBLE' && (
                    <>
                      <button onClick={() => handleAction(c.id, 'approve')} className="p-2 bg-blue-500/10 text-blue-500 rounded hover:bg-blue-500/20" title="Approve">
                        <Check size={16} />
                      </button>
                      <button onClick={() => handleAction(c.id, 'reject')} className="p-2 bg-red-500/10 text-red-500 rounded hover:bg-red-500/20" title="Reject">
                        <X size={16} />
                      </button>
                    </>
                  )}
                  {c.status === 'APPROVED' && (
                    <button onClick={() => handleAction(c.id, 'pay')} className="p-2 bg-emerald-500/10 text-emerald-500 rounded hover:bg-emerald-500/20" title="Mark Paid">
                      <CreditCard size={16} />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
