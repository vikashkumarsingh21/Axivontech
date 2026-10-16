// src/components/demo-projects/leadpilot/LeadPilotModals.tsx
"use client";

import React, { useState } from "react";
import { X, Users, DollarSign, CheckSquare, Building2, Plus, Sparkles } from "lucide-react";
import { useLeadPilot } from "@/context/LeadPilotContext";
import {
  LeadStatus,
  LeadPriority,
  DealStage,
  TaskPriority,
  TEAM_MEMBERS,
} from "@/data/leadpilot-data";

interface ModalProps {
  type: "lead" | "contact" | "deal" | "task" | null;
  onClose: () => void;
}

export default function LeadPilotModals({ type, onClose }: ModalProps) {
  const { companies, contacts, leads, addLead, addContact, addDeal, addTask } = useLeadPilot();

  // Lead Form State
  const [leadForm, setLeadForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    companyName: companies[0]?.name || "New Company",
    jobTitle: "Founder / Executive",
    source: "Website Form" as const,
    interestedService: "Custom CRM & Workflow Automation",
    status: "New" as LeadStatus,
    priority: "High" as LeadPriority,
    assignedOwner: TEAM_MEMBERS[0],
    estimatedValue: 35000,
    notes: "",
  });

  // Contact Form State
  const [contactForm, setContactForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    companyId: companies[0]?.id || "",
    companyName: companies[0]?.name || "",
    jobTitle: "Commercial Lead",
    assignedOwner: TEAM_MEMBERS[0],
    notes: "",
  });

  // Deal Form State
  const [dealForm, setDealForm] = useState({
    name: "",
    companyId: companies[0]?.id || "",
    companyName: companies[0]?.name || "",
    primaryContactId: contacts[0]?.id || "",
    primaryContactName: contacts[0]?.fullName || "",
    estimatedValue: 45000,
    stage: "Discovery" as DealStage,
    probability: 30,
    expectedCloseDate: "",
    assignedOwner: TEAM_MEMBERS[0],
    notes: "",
  });

  // Task Form State
  const [taskForm, setTaskForm] = useState({
    title: "",
    description: "",
    relatedLeadId: leads[0]?.id || "",
    relatedLeadName: leads[0]?.fullName || "",
    dueDate: "",
    priority: "High" as TaskPriority,
    status: "To Do" as const,
    assignedOwner: TEAM_MEMBERS[0],
  });

  if (!type) return null;

  const handleSubmitLead = (e: React.FormEvent) => {
    e.preventDefault();
    if (!leadForm.fullName.trim() || !leadForm.email.trim()) return;

    const matchedComp = companies.find((c) => c.name.toLowerCase() === leadForm.companyName.toLowerCase());
    addLead({
      fullName: leadForm.fullName.trim(),
      email: leadForm.email.trim(),
      phone: leadForm.phone.trim() || "+1 (555) 010-0900",
      companyId: matchedComp ? matchedComp.id : `comp-${Date.now()}`,
      companyName: leadForm.companyName.trim(),
      jobTitle: leadForm.jobTitle.trim(),
      source: leadForm.source,
      interestedService: leadForm.interestedService,
      status: leadForm.status,
      priority: leadForm.priority,
      assignedOwner: leadForm.assignedOwner,
      estimatedValue: Number(leadForm.estimatedValue) || 10000,
      nextFollowUpAt: new Date(Date.now() + 4 * 86400000).toISOString().split("T")[0],
      notes: leadForm.notes || "Initial inbound lead created via quick form.",
    });
    onClose();
  };

  const handleSubmitContact = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactForm.fullName.trim() || !contactForm.email.trim()) return;

    const selectedComp = companies.find((c) => c.id === contactForm.companyId) || companies[0];
    addContact({
      fullName: contactForm.fullName.trim(),
      email: contactForm.email.trim(),
      phone: contactForm.phone.trim() || "+1 (555) 012-3456",
      companyId: selectedComp?.id || "comp-1",
      companyName: selectedComp?.name || "Independent",
      jobTitle: contactForm.jobTitle.trim(),
      assignedOwner: contactForm.assignedOwner,
      notes: contactForm.notes,
    });
    onClose();
  };

  const handleSubmitDeal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!dealForm.name.trim()) return;

    const selectedComp = companies.find((c) => c.id === dealForm.companyId) || companies[0];
    const selectedCnt = contacts.find((c) => c.id === dealForm.primaryContactId) || contacts[0];

    addDeal({
      name: dealForm.name.trim(),
      companyId: selectedComp?.id || "comp-1",
      companyName: selectedComp?.name || "Nexus Flow Systems",
      primaryContactId: selectedCnt?.id || "cnt-1",
      primaryContactName: selectedCnt?.fullName || "Primary Contact",
      estimatedValue: Number(dealForm.estimatedValue) || 20000,
      stage: dealForm.stage,
      probability: Number(dealForm.probability) || 40,
      expectedCloseDate: dealForm.expectedCloseDate,
      assignedOwner: dealForm.assignedOwner,
      notes: dealForm.notes,
    });
    onClose();
  };

  const handleSubmitTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskForm.title.trim()) return;

    const selectedLead = leads.find((l) => l.id === taskForm.relatedLeadId);
    addTask({
      title: taskForm.title.trim(),
      description: taskForm.description.trim(),
      relatedLeadId: selectedLead?.id,
      relatedLeadName: selectedLead?.fullName,
      relatedCompanyId: selectedLead?.companyId,
      relatedCompanyName: selectedLead?.companyName,
      dueDate: taskForm.dueDate,
      priority: taskForm.priority,
      status: taskForm.status,
      assignedOwner: taskForm.assignedOwner,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-[#E3E6E1] overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 bg-[#F6F7F4] border-b border-[#E3E6E1] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-[#2F806A] text-white flex items-center justify-center">
              {type === "lead" && <Users className="h-4 w-4" />}
              {type === "contact" && <Users className="h-4 w-4" />}
              {type === "deal" && <DollarSign className="h-4 w-4" />}
              {type === "task" && <CheckSquare className="h-4 w-4" />}
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#252925]">
                {type === "lead" && "Add New Lead"}
                {type === "contact" && "Add New Contact"}
                {type === "deal" && "Create New Sales Opportunity"}
                {type === "task" && "Schedule CRM Task"}
              </h3>
              <p className="text-[11px] text-[#747A75]">Interactive local demo record</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-[#747A75] hover:text-[#252925] hover:bg-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Lead Form */}
        {type === "lead" && (
          <form onSubmit={handleSubmitLead} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#252925] mb-1">Full Name *</label>
                <input
                  required
                  type="text"
                  placeholder="e.g. Jordan Hayes"
                  value={leadForm.fullName}
                  onChange={(e) => setLeadForm({ ...leadForm, fullName: e.target.value })}
                  className="w-full px-3 py-2 border border-[#E3E6E1] rounded-lg text-xs text-[#252925] focus:outline-none focus:ring-1 focus:ring-[#2F806A]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#252925] mb-1">Work Email *</label>
                <input
                  required
                  type="email"
                  placeholder="jordan@example-company.com"
                  value={leadForm.email}
                  onChange={(e) => setLeadForm({ ...leadForm, email: e.target.value })}
                  className="w-full px-3 py-2 border border-[#E3E6E1] rounded-lg text-xs text-[#252925] focus:outline-none focus:ring-1 focus:ring-[#2F806A]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#252925] mb-1">Company Name</label>
                <input
                  type="text"
                  placeholder="e.g. Sterling Analytics"
                  value={leadForm.companyName}
                  onChange={(e) => setLeadForm({ ...leadForm, companyName: e.target.value })}
                  className="w-full px-3 py-2 border border-[#E3E6E1] rounded-lg text-xs text-[#252925] focus:outline-none focus:ring-1 focus:ring-[#2F806A]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#252925] mb-1">Phone Number</label>
                <input
                  type="text"
                  placeholder="+1 (555) 019-2831"
                  value={leadForm.phone}
                  onChange={(e) => setLeadForm({ ...leadForm, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-[#E3E6E1] rounded-lg text-xs text-[#252925] focus:outline-none focus:ring-1 focus:ring-[#2F806A]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#252925] mb-1">Status</label>
                <select
                  value={leadForm.status}
                  onChange={(e) => setLeadForm({ ...leadForm, status: e.target.value as LeadStatus })}
                  className="w-full px-2.5 py-2 border border-[#E3E6E1] rounded-lg text-xs text-[#252925] bg-white focus:outline-none focus:ring-1 focus:ring-[#2F806A]"
                >
                  <option value="New">New</option>
                  <option value="Contacted">Contacted</option>
                  <option value="Qualified">Qualified</option>
                  <option value="Proposal">Proposal</option>
                  <option value="Won">Won</option>
                  <option value="Lost">Lost</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#252925] mb-1">Priority</label>
                <select
                  value={leadForm.priority}
                  onChange={(e) => setLeadForm({ ...leadForm, priority: e.target.value as LeadPriority })}
                  className="w-full px-2.5 py-2 border border-[#E3E6E1] rounded-lg text-xs text-[#252925] bg-white focus:outline-none focus:ring-1 focus:ring-[#2F806A]"
                >
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#252925] mb-1">Est. Value ($)</label>
                <input
                  type="number"
                  value={leadForm.estimatedValue}
                  onChange={(e) => setLeadForm({ ...leadForm, estimatedValue: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-[#E3E6E1] rounded-lg text-xs text-[#252925] focus:outline-none focus:ring-1 focus:ring-[#2F806A]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#252925] mb-1">Assigned Rep</label>
              <select
                value={leadForm.assignedOwner}
                onChange={(e) => setLeadForm({ ...leadForm, assignedOwner: e.target.value })}
                className="w-full px-3 py-2 border border-[#E3E6E1] rounded-lg text-xs text-[#252925] bg-white focus:outline-none focus:ring-1 focus:ring-[#2F806A]"
              >
                {TEAM_MEMBERS.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#252925] mb-1">Interested Solution</label>
              <input
                type="text"
                value={leadForm.interestedService}
                onChange={(e) => setLeadForm({ ...leadForm, interestedService: e.target.value })}
                className="w-full px-3 py-2 border border-[#E3E6E1] rounded-lg text-xs text-[#252925] focus:outline-none focus:ring-1 focus:ring-[#2F806A]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#252925] mb-1">Initial Notes</label>
              <textarea
                rows={2}
                placeholder="Key discovery notes or qualification requirements..."
                value={leadForm.notes}
                onChange={(e) => setLeadForm({ ...leadForm, notes: e.target.value })}
                className="w-full px-3 py-2 border border-[#E3E6E1] rounded-lg text-xs text-[#252925] focus:outline-none focus:ring-1 focus:ring-[#2F806A]"
              />
            </div>

            <div className="pt-2 flex items-center justify-end gap-3 border-t border-[#E3E6E1]">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-[#747A75] hover:text-[#252925] transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-[#2F806A] hover:bg-[#266b58] text-white rounded-lg text-xs font-semibold shadow-xs transition-colors flex items-center gap-1.5"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Save Lead Record</span>
              </button>
            </div>
          </form>
        )}

        {/* Contact Form */}
        {type === "contact" && (
          <form onSubmit={handleSubmitContact} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
            <div>
              <label className="block text-xs font-semibold text-[#252925] mb-1">Full Name *</label>
              <input
                required
                type="text"
                placeholder="e.g. Katherine Pierce"
                value={contactForm.fullName}
                onChange={(e) => setContactForm({ ...contactForm, fullName: e.target.value })}
                className="w-full px-3 py-2 border border-[#E3E6E1] rounded-lg text-xs text-[#252925] focus:outline-none focus:ring-1 focus:ring-[#2F806A]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#252925] mb-1">Email *</label>
                <input
                  required
                  type="email"
                  placeholder="katherine@example.com"
                  value={contactForm.email}
                  onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                  className="w-full px-3 py-2 border border-[#E3E6E1] rounded-lg text-xs text-[#252925] focus:outline-none focus:ring-1 focus:ring-[#2F806A]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#252925] mb-1">Phone</label>
                <input
                  type="text"
                  placeholder="+1 (555) 018-9281"
                  value={contactForm.phone}
                  onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-[#E3E6E1] rounded-lg text-xs text-[#252925] focus:outline-none focus:ring-1 focus:ring-[#2F806A]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#252925] mb-1">Company</label>
                <select
                  value={contactForm.companyId}
                  onChange={(e) => setContactForm({ ...contactForm, companyId: e.target.value })}
                  className="w-full px-3 py-2 border border-[#E3E6E1] rounded-lg text-xs text-[#252925] bg-white focus:outline-none focus:ring-1 focus:ring-[#2F806A]"
                >
                  {companies.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#252925] mb-1">Job Title</label>
                <input
                  type="text"
                  placeholder="e.g. VP Marketing"
                  value={contactForm.jobTitle}
                  onChange={(e) => setContactForm({ ...contactForm, jobTitle: e.target.value })}
                  className="w-full px-3 py-2 border border-[#E3E6E1] rounded-lg text-xs text-[#252925] focus:outline-none focus:ring-1 focus:ring-[#2F806A]"
                />
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-3 border-t border-[#E3E6E1]">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-[#747A75] hover:text-[#252925] transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-[#2F806A] hover:bg-[#266b58] text-white rounded-lg text-xs font-semibold shadow-xs transition-colors flex items-center gap-1.5"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Save Contact</span>
              </button>
            </div>
          </form>
        )}

        {/* Deal Form */}
        {type === "deal" && (
          <form onSubmit={handleSubmitDeal} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
            <div>
              <label className="block text-xs font-semibold text-[#252925] mb-1">Opportunity Name *</label>
              <input
                required
                type="text"
                placeholder="e.g. Nexus Flow — Enterprise Subscription"
                value={dealForm.name}
                onChange={(e) => setDealForm({ ...dealForm, name: e.target.value })}
                className="w-full px-3 py-2 border border-[#E3E6E1] rounded-lg text-xs text-[#252925] focus:outline-none focus:ring-1 focus:ring-[#2F806A]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#252925] mb-1">Company</label>
                <select
                  value={dealForm.companyId}
                  onChange={(e) => setDealForm({ ...dealForm, companyId: e.target.value })}
                  className="w-full px-3 py-2 border border-[#E3E6E1] rounded-lg text-xs text-[#252925] bg-white focus:outline-none focus:ring-1 focus:ring-[#2F806A]"
                >
                  {companies.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#252925] mb-1">Estimated Value ($)</label>
                <input
                  type="number"
                  value={dealForm.estimatedValue}
                  onChange={(e) => setDealForm({ ...dealForm, estimatedValue: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-[#E3E6E1] rounded-lg text-xs text-[#252925] focus:outline-none focus:ring-1 focus:ring-[#2F806A]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#252925] mb-1">Stage</label>
                <select
                  value={dealForm.stage}
                  onChange={(e) => setDealForm({ ...dealForm, stage: e.target.value as DealStage })}
                  className="w-full px-2.5 py-2 border border-[#E3E6E1] rounded-lg text-xs text-[#252925] bg-white focus:outline-none focus:ring-1 focus:ring-[#2F806A]"
                >
                  <option value="Discovery">Discovery</option>
                  <option value="Qualification">Qualification</option>
                  <option value="Proposal">Proposal</option>
                  <option value="Negotiation">Negotiation</option>
                  <option value="Won">Won</option>
                  <option value="Lost">Lost</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#252925] mb-1">Probability (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={dealForm.probability}
                  onChange={(e) => setDealForm({ ...dealForm, probability: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-[#E3E6E1] rounded-lg text-xs text-[#252925] focus:outline-none focus:ring-1 focus:ring-[#2F806A]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#252925] mb-1">Expected Close</label>
                <input
                  type="date"
                  value={dealForm.expectedCloseDate}
                  onChange={(e) => setDealForm({ ...dealForm, expectedCloseDate: e.target.value })}
                  className="w-full px-2.5 py-2 border border-[#E3E6E1] rounded-lg text-xs text-[#252925] focus:outline-none focus:ring-1 focus:ring-[#2F806A]"
                />
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-3 border-t border-[#E3E6E1]">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-[#747A75] hover:text-[#252925] transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-[#2F806A] hover:bg-[#266b58] text-white rounded-lg text-xs font-semibold shadow-xs transition-colors flex items-center gap-1.5"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Create Deal</span>
              </button>
            </div>
          </form>
        )}

        {/* Task Form */}
        {type === "task" && (
          <form onSubmit={handleSubmitTask} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
            <div>
              <label className="block text-xs font-semibold text-[#252925] mb-1">Task Title *</label>
              <input
                required
                type="text"
                placeholder="e.g. Schedule discovery call with VP of Engineering"
                value={taskForm.title}
                onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                className="w-full px-3 py-2 border border-[#E3E6E1] rounded-lg text-xs text-[#252925] focus:outline-none focus:ring-1 focus:ring-[#2F806A]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#252925] mb-1">Related Lead (Optional)</label>
              <select
                value={taskForm.relatedLeadId}
                onChange={(e) => setTaskForm({ ...taskForm, relatedLeadId: e.target.value })}
                className="w-full px-3 py-2 border border-[#E3E6E1] rounded-lg text-xs text-[#252925] bg-white focus:outline-none focus:ring-1 focus:ring-[#2F806A]"
              >
                <option value="">None / General Task</option>
                {leads.map((l) => (
                  <option key={l.id} value={l.id}>{l.fullName} ({l.companyName})</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#252925] mb-1">Due Date</label>
                <input
                  type="date"
                  value={taskForm.dueDate}
                  onChange={(e) => setTaskForm({ ...taskForm, dueDate: e.target.value })}
                  className="w-full px-3 py-2 border border-[#E3E6E1] rounded-lg text-xs text-[#252925] focus:outline-none focus:ring-1 focus:ring-[#2F806A]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#252925] mb-1">Priority</label>
                <select
                  value={taskForm.priority}
                  onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value as TaskPriority })}
                  className="w-full px-3 py-2 border border-[#E3E6E1] rounded-lg text-xs text-[#252925] bg-white focus:outline-none focus:ring-1 focus:ring-[#2F806A]"
                >
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#252925] mb-1">Description</label>
              <textarea
                rows={2}
                placeholder="Action items, prep notes, or deliverables required..."
                value={taskForm.description}
                onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
                className="w-full px-3 py-2 border border-[#E3E6E1] rounded-lg text-xs text-[#252925] focus:outline-none focus:ring-1 focus:ring-[#2F806A]"
              />
            </div>

            <div className="pt-2 flex items-center justify-end gap-3 border-t border-[#E3E6E1]">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-[#747A75] hover:text-[#252925] transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-[#2F806A] hover:bg-[#266b58] text-white rounded-lg text-xs font-semibold shadow-xs transition-colors flex items-center gap-1.5"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Save Task</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
