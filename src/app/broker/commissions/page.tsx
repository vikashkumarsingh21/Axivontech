"use client";

import { useState, useEffect } from "react";
import { IndianRupee, Clock, CheckCircle, Wallet } from "lucide-react";
import Link from "next/link";

export default function BrokerCommissions() {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch("/api/v1/broker/commissions")
      .then(res => res.json())
      .then(d => {
        setData(d);
        setIsLoading(false);
      });
  }, []);

  if (isLoading) {
    return <div className="p-8 text-center text-gray-500">Loading Commissions...</div>;
  }

  const { data: commissions, stats } = data || { data: [], stats: {} };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">My Commissions</h1>
          <p className="text-gray-400">Track your earnings and payouts.</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-[#111] p-6 rounded-xl border border-white/10">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center">
              <IndianRupee size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-400">Total Generated</p>
              <h3 className="text-xl font-bold text-white">₹{stats?.total?.toLocaleString()}</h3>
            </div>
          </div>
        </div>

        <div className="bg-[#111] p-6 rounded-xl border border-white/10">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-yellow-500/10 text-yellow-500 flex items-center justify-center">
              <Clock size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-400">Pending/Eligible</p>
              <h3 className="text-xl font-bold text-white">₹{stats?.pending?.toLocaleString()}</h3>
            </div>
          </div>
        </div>

        <div className="bg-[#111] p-6 rounded-xl border border-white/10">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
              <CheckCircle size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-400">Approved</p>
              <h3 className="text-xl font-bold text-white">₹{stats?.approved?.toLocaleString()}</h3>
            </div>
          </div>
        </div>

        <div className="bg-[#111] p-6 rounded-xl border border-white/10">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-purple-500/10 text-purple-500 flex items-center justify-center">
              <Wallet size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-400">Paid Out</p>
              <h3 className="text-xl font-bold text-white">₹{stats?.paid?.toLocaleString()}</h3>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-[#111] rounded-xl border border-white/10 overflow-hidden">
        <div className="p-6 border-b border-white/10">
          <h3 className="text-lg font-bold text-white">Commission History</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-white/5 text-left text-sm text-gray-400">
              <tr>
                <th className="p-4 font-medium">Project</th>
                <th className="p-4 font-medium">Project Value</th>
                <th className="p-4 font-medium">Rule</th>
                <th className="p-4 font-medium">Commission Amount</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-sm">
              {commissions.map((comm: any) => (
                <tr key={comm.id} className="hover:bg-white/5 transition-colors">
                  <td className="p-4 text-gray-300">
                    <div>{comm.partnerProject?.projectName}</div>
                    <div className="text-xs text-gray-500">{comm.partnerProject?.projectCode}</div>
                  </td>
                  <td className="p-4 text-gray-300">₹{comm.projectValue?.toLocaleString()}</td>
                  <td className="p-4 text-gray-300">{comm.commissionRule?.name} ({comm.commissionRate}{comm.commissionType === "PERCENTAGE" ? "%" : ""})</td>
                  <td className="p-4 text-white font-medium">₹{comm.commissionAmount?.toLocaleString()}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${
                      comm.status === 'PAID' ? 'bg-emerald-500/10 text-emerald-500' :
                      comm.status === 'APPROVED' ? 'bg-blue-500/10 text-blue-500' :
                      comm.status === 'ELIGIBLE' || comm.status === 'PENDING' ? 'bg-amber-500/10 text-amber-500' :
                      'bg-red-500/10 text-red-500'
                    }`}>
                      {comm.status}
                    </span>
                  </td>
                  <td className="p-4 text-gray-400">
                    {comm.createdAt ? new Date(comm.createdAt).toLocaleDateString() : '-'}
                  </td>
                </tr>
              ))}
              {commissions.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-gray-500">
                    No commission records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
