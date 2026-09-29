"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Search, ChevronRight, CreditCard } from "lucide-react";

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  useEffect(() => {
    fetchPayments();
  }, [search, statusFilter]);

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (statusFilter) params.set("status", statusFilter);
      
      const res = await fetch(`/api/v1/admin/partner-payments?${params}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to fetch payments");
      setPayments(data.data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white">Partner Payments</h1>
          <p className="text-sm text-gray-400">Review and verify advance payments submitted by brokers.</p>
        </div>
      </div>

      <div className="bg-[#111] border border-white/10 rounded-xl overflow-hidden">
        <div className="p-4 border-b border-white/10 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={15} />
            <input
              type="text"
              placeholder="Search by project, client..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#0d0d0d] border border-white/10 rounded-md py-2 pl-9 pr-3 text-sm text-white focus:outline-none focus:border-red-500/50"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-[#0d0d0d] border border-white/10 rounded-md py-2 px-3 text-sm text-gray-400 focus:outline-none"
          >
            <option value="">All Statuses</option>
            <option value="PENDING">Pending Submission</option>
            <option value="SUBMITTED">Submitted (Needs Review)</option>
            <option value="UNDER_REVIEW">Under Review</option>
            <option value="VERIFIED">Verified</option>
            <option value="REJECTED">Rejected</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-400">
            <thead className="bg-[#0d0d0d] text-xs uppercase text-gray-500">
              <tr>
                <th className="px-6 py-3">Project</th>
                <th className="px-6 py-3">Broker</th>
                <th className="px-6 py-3">Amount Paid</th>
                <th className="px-6 py-3">Method & UTR</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Date</th>
                <th className="px-6 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-10 text-center">Loading...</td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={7} className="px-6 py-10 text-center text-red-500">{error}</td>
                </tr>
              ) : payments.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-10 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <CreditCard size={32} className="text-gray-600 mb-3" />
                      <p>No payments found.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                payments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-white/5 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="font-medium text-white">{payment.partnerProject.clientName}</div>
                      <div className="text-xs text-gray-500 font-mono">{payment.partnerProject.projectCode}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-white">{payment.partnerProject.brokerProfile.user.name}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-white">{payment.currency} {payment.amountPaid?.toLocaleString() || "0"}</div>
                      <div className="text-xs text-gray-500">of {payment.currency} {payment.advanceAmount?.toLocaleString()}</div>
                    </td>
                    <td className="px-6 py-4">
                      {payment.paymentMethod ? (
                        <>
                          <div className="text-white">{payment.paymentMethod}</div>
                          <div className="text-xs text-gray-500 font-mono">{payment.transactionId}</div>
                        </>
                      ) : (
                        <span className="text-gray-600">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded text-[10px] font-bold ${
                        payment.status === "VERIFIED" ? "bg-emerald-500/10 text-emerald-400" :
                        payment.status === "REJECTED" ? "bg-red-500/10 text-red-400" :
                        payment.status === "SUBMITTED" || payment.status === "UNDER_REVIEW" ? "bg-blue-500/10 text-blue-400" :
                        "bg-amber-500/10 text-amber-400"
                      }`}>
                        {payment.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {payment.submittedAt ? new Date(payment.submittedAt).toLocaleDateString() : "—"}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link href={`/admin/crm/partner-projects/${payment.partnerProject.id}`}>
                        <button className="p-1 bg-white/5 hover:bg-white/10 rounded text-gray-300 hover:text-white transition-colors text-xs px-3 py-1">
                          Review
                        </button>
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
