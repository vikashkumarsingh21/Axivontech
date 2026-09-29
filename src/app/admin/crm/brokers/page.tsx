"use client";

import { useState, useEffect } from "react";
import { Plus, Search, Edit2, ShieldOff, ShieldAlert } from "lucide-react";

export default function BrokersPage() {
  const [brokers, setBrokers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    whatsapp: "",
    password: "",
    companyName: "",
    designation: "",
    city: "",
    state: "",
    country: "",
    website: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const fetchBrokers = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/v1/admin/brokers?search=${searchTerm}`);
      if (res.ok) {
        const data = await res.json();
        setBrokers(data.data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBrokers();
  }, [searchTerm]);

  const toggleStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    try {
      await fetch(`/api/v1/admin/brokers/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      fetchBrokers();
    } catch (error) {
      console.error("Failed to update status", error);
    }
  };

  const handleCreateBroker = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/v1/admin/brokers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to create broker");
      }
      
      setIsModalOpen(false);
      setFormData({
        name: "", email: "", phone: "", whatsapp: "", password: "",
        companyName: "", designation: "", city: "",
        state: "", country: "", website: ""
      });
      fetchBrokers();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Brokers / Partners</h1>
          <p className="text-sm text-gray-400">Manage external referral partners.</p>
        </div>
        <button 
          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 flex items-center gap-2 rounded-md transition-colors"
          onClick={() => setIsModalOpen(true)}
        >
          <Plus size={16} /> Add Broker
        </button>
      </div>

      <div className="bg-[#1a1a1a] border border-white/10 rounded-xl overflow-hidden">
        <div className="p-4 border-b border-white/10 flex items-center justify-between">
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
            <input
              type="text"
              placeholder="Search brokers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#0d0d0d] border border-white/10 rounded-md py-2 pl-9 pr-4 text-sm text-white focus:outline-none focus:border-red-500/50"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-400">
            <thead className="bg-[#0d0d0d] text-xs uppercase text-gray-500">
              <tr>
                <th className="px-6 py-3 font-medium">Broker</th>
                <th className="px-6 py-3 font-medium">Contact</th>
                <th className="px-6 py-3 font-medium">Referral Code</th>
                <th className="px-6 py-3 font-medium">Stats</th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center">Loading...</td>
                </tr>
              ) : brokers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center">No brokers found.</td>
                </tr>
              ) : (
                brokers.map((broker) => (
                  <tr key={broker.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-white">{broker.name}</div>
                      <div className="text-xs">{broker.brokerProfile?.companyName || "N/A"}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>{broker.email}</div>
                      <div className="text-xs">{broker.phone || "N/A"}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap font-mono text-red-400">
                      {broker.brokerProfile?.referralCode || "Pending Login"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-xs">Leads: {broker._count?.ownedLeads || 0}</div>
                      <div className="text-xs">Projects: {broker._count?.ownedOpportunities || 0}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-[10px] font-bold rounded-full ${broker.status === 'ACTIVE' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                        {broker.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right space-x-2">
                      <button className="p-1 hover:bg-white/10 rounded text-gray-400 hover:text-white transition-colors" title="Edit">
                        <Edit2 size={16} />
                      </button>
                      <button 
                        className="p-1 hover:bg-white/10 rounded text-gray-400 hover:text-red-400 transition-colors" 
                        title="Toggle Status"
                        onClick={() => toggleStatus(broker.id, broker.status)}
                      >
                        {broker.status === 'ACTIVE' ? <ShieldOff size={16} /> : <ShieldAlert size={16} />}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="bg-[#111] border border-white/10 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6">
            <h2 className="text-xl font-bold text-white mb-6 border-b border-white/10 pb-4">Add New Broker</h2>
            
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-3 rounded-md mb-6 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleCreateBroker} className="space-y-6">
              <div>
                <h3 className="text-sm font-semibold text-gray-300 mb-3 uppercase tracking-wider">Account Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1">Full Name *</label>
                    <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-[#1a1a1a] border border-white/10 rounded-md p-2 text-white text-sm focus:border-red-500/50 focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1">Email Address *</label>
                    <input required type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full bg-[#1a1a1a] border border-white/10 rounded-md p-2 text-white text-sm focus:border-red-500/50 focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1">Phone Number</label>
                    <input type="tel" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full bg-[#1a1a1a] border border-white/10 rounded-md p-2 text-white text-sm focus:border-red-500/50 focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1">WhatsApp Number</label>
                    <input type="tel" value={formData.whatsapp} onChange={e => setFormData({...formData, whatsapp: e.target.value})} className="w-full bg-[#1a1a1a] border border-white/10 rounded-md p-2 text-white text-sm focus:border-red-500/50 focus:outline-none" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-medium text-gray-400 mb-1">Temporary Password *</label>
                    <input required type="text" minLength={6} value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} className="w-full bg-[#1a1a1a] border border-white/10 rounded-md p-2 text-white text-sm focus:border-red-500/50 focus:outline-none" />
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-gray-300 mb-3 uppercase tracking-wider">Business Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1">Company Name</label>
                    <input type="text" value={formData.companyName} onChange={e => setFormData({...formData, companyName: e.target.value})} className="w-full bg-[#1a1a1a] border border-white/10 rounded-md p-2 text-white text-sm focus:border-red-500/50 focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1">Designation</label>
                    <input type="text" value={formData.designation} onChange={e => setFormData({...formData, designation: e.target.value})} className="w-full bg-[#1a1a1a] border border-white/10 rounded-md p-2 text-white text-sm focus:border-red-500/50 focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1">City</label>
                    <input type="text" value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} className="w-full bg-[#1a1a1a] border border-white/10 rounded-md p-2 text-white text-sm focus:border-red-500/50 focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1">State / Province</label>
                    <input type="text" value={formData.state} onChange={e => setFormData({...formData, state: e.target.value})} className="w-full bg-[#1a1a1a] border border-white/10 rounded-md p-2 text-white text-sm focus:border-red-500/50 focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1">Country</label>
                    <input type="text" value={formData.country} onChange={e => setFormData({...formData, country: e.target.value})} className="w-full bg-[#1a1a1a] border border-white/10 rounded-md p-2 text-white text-sm focus:border-red-500/50 focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1">Website URL</label>
                    <input type="url" value={formData.website} onChange={e => setFormData({...formData, website: e.target.value})} className="w-full bg-[#1a1a1a] border border-white/10 rounded-md p-2 text-white text-sm focus:border-red-500/50 focus:outline-none" />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 bg-[#2a2a2a] hover:bg-[#333] text-white rounded-md text-sm transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={isSubmitting} className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md text-sm transition-colors disabled:opacity-50">
                  {isSubmitting ? "Creating..." : "Create Broker"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
