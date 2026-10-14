// src/app/demo-projects/saas/leadpilot/contacts/page.tsx
"use client";

import React, { useState, useMemo } from "react";
import {
  Users,
  Search,
  Filter,
  Plus,
  Mail,
  Phone,
  Building2,
  Trash2,
  Edit2,
  Eye,
  X,
} from "lucide-react";
import { useLeadPilot } from "@/context/LeadPilotContext";
import { Contact } from "@/data/leadpilot-data";

export default function LeadPilotContactsPage() {
  const { contacts, deleteContact, companies } = useLeadPilot();
  const [searchQuery, setSearchQuery] = useState("");
  const [companyFilter, setCompanyFilter] = useState("All");
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);

  const filteredContacts = useMemo(() => {
    let result = [...contacts];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (c) =>
          c.fullName.toLowerCase().includes(q) ||
          c.companyName.toLowerCase().includes(q) ||
          c.email.toLowerCase().includes(q) ||
          c.jobTitle.toLowerCase().includes(q)
      );
    }

    if (companyFilter !== "All") {
      result = result.filter((c) => c.companyName === companyFilter);
    }

    return result;
  }, [contacts, searchQuery, companyFilter]);

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-[#252925]">
            Contact Directory
          </h1>
          <p className="mt-0.5 text-xs text-[#747A75]">
            Directory of company stakeholders, champions, and enterprise decision makers.
          </p>
        </div>
      </div>

      {/* Filter bar */}
      <div className="bg-white p-4 rounded-2xl border border-[#E3E6E1] shadow-2xs grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="relative sm:col-span-2">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#747A75]" />
          <input
            type="text"
            placeholder="Search contacts by name, role, email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-[#F6F7F4] border border-[#E3E6E1] rounded-lg text-xs text-[#252925] focus:outline-none focus:ring-1 focus:ring-[#2F806A]"
          />
        </div>

        <div>
          <select
            value={companyFilter}
            onChange={(e) => setCompanyFilter(e.target.value)}
            className="w-full px-3 py-2 bg-[#F6F7F4] border border-[#E3E6E1] rounded-lg text-xs text-[#252925] focus:outline-none focus:ring-1 focus:ring-[#2F806A]"
          >
            <option value="All">All Companies</option>
            {companies.map((comp) => (
              <option key={comp.id} value={comp.name}>{comp.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Contacts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredContacts.length === 0 ? (
          <div className="col-span-full py-12 text-center text-xs text-[#747A75] bg-white rounded-2xl border border-[#E3E6E1]">
            No contacts found matching the search criteria.
          </div>
        ) : (
          filteredContacts.map((contact) => (
            <div
              key={contact.id}
              className="bg-white p-5 rounded-2xl border border-[#E3E6E1] shadow-2xs hover:shadow-xs transition-shadow flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-[#E5F0EB] text-[#2F806A] font-bold text-xs flex items-center justify-center shrink-0">
                      {contact.fullName.split(" ").map((n) => n[0]).join("")}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-[#252925]">{contact.fullName}</h3>
                      <p className="text-[11px] text-[#747A75]">{contact.jobTitle}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      if (window.confirm(`Delete contact ${contact.fullName}?`)) {
                        deleteContact(contact.id);
                      }
                    }}
                    className="p-1 text-[#747A75] hover:text-red-600 rounded transition-colors"
                    title="Delete contact"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>

                <div className="mt-4 pt-3 border-t border-[#E3E6E1] space-y-2 text-xs text-[#555C56]">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-3.5 w-3.5 text-[#747A75]" />
                    <span className="font-medium text-[#252925]">{contact.companyName}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="h-3.5 w-3.5 text-[#747A75]" />
                    <span className="truncate">{contact.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-3.5 w-3.5 text-[#747A75]" />
                    <span>{contact.phone}</span>
                  </div>
                </div>

                {contact.notes && (
                  <p className="mt-3 text-[11px] text-[#747A75] bg-[#F6F7F4] p-2.5 rounded-lg line-clamp-2">
                    {contact.notes}
                  </p>
                )}
              </div>

              <div className="mt-4 pt-2.5 border-t border-[#E3E6E1] flex items-center justify-between text-[11px] text-[#747A75]">
                <span>Owner: {contact.assignedOwner.split(" ")[0]}</span>
                <span className="font-medium">Added {contact.createdAt}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
