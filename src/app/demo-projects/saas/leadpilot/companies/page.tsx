// src/app/demo-projects/saas/leadpilot/companies/page.tsx
"use client";

import React, { useState, useMemo } from "react";
import {
  Building2,
  Search,
  Filter,
  Users,
  DollarSign,
  ExternalLink,
  MapPin,
  Trash2,
  Briefcase,
} from "lucide-react";
import { useLeadPilot } from "@/context/LeadPilotContext";

export default function LeadPilotCompaniesPage() {
  const { companies, deleteCompany, deals, contacts } = useLeadPilot();
  const [searchQuery, setSearchQuery] = useState("");
  const [industryFilter, setIndustryFilter] = useState("All");

  const filteredCompanies = useMemo(() => {
    let result = [...companies];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.industry.toLowerCase().includes(q) ||
          c.location.toLowerCase().includes(q)
      );
    }

    if (industryFilter !== "All") {
      result = result.filter((c) => c.industry === industryFilter);
    }

    return result;
  }, [companies, searchQuery, industryFilter]);

  const industries = Array.from(new Set(companies.map((c) => c.industry)));

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-[#252925]">
            Company Directory
          </h1>
          <p className="mt-0.5 text-xs text-[#747A75]">
            Account intelligence, org scale, associated contacts, and total deal exposure.
          </p>
        </div>
      </div>

      {/* Filter bar */}
      <div className="bg-white p-4 rounded-2xl border border-[#E3E6E1] shadow-2xs grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="relative sm:col-span-2">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#747A75]" />
          <input
            type="text"
            placeholder="Search accounts by name, sector, location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-[#F6F7F4] border border-[#E3E6E1] rounded-lg text-xs text-[#252925] focus:outline-none focus:ring-1 focus:ring-[#2F806A]"
          />
        </div>

        <div>
          <select
            value={industryFilter}
            onChange={(e) => setIndustryFilter(e.target.value)}
            className="w-full px-3 py-2 bg-[#F6F7F4] border border-[#E3E6E1] rounded-lg text-xs text-[#252925] focus:outline-none focus:ring-1 focus:ring-[#2F806A]"
          >
            <option value="All">All Industries</option>
            {industries.map((ind) => (
              <option key={ind} value={ind}>{ind}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Companies List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCompanies.length === 0 ? (
          <div className="col-span-full py-12 text-center text-xs text-[#747A75] bg-white rounded-2xl border border-[#E3E6E1]">
            No companies found matching the criteria.
          </div>
        ) : (
          filteredCompanies.map((company) => {
            const companyContacts = contacts.filter((c) => c.companyId === company.id);
            const companyDeals = deals.filter((d) => d.companyId === company.id);
            const totalDealValue = companyDeals.reduce((sum, d) => sum + d.estimatedValue, 0);

            return (
              <div
                key={company.id}
                className="bg-white p-5 rounded-2xl border border-[#E3E6E1] shadow-2xs hover:shadow-xs transition-shadow flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-[#252925] text-white flex items-center justify-center shrink-0 font-bold text-xs">
                        <Building2 className="h-5 w-5 text-[#2F806A]" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-[#252925]">{company.name}</h3>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#E5F0EB] text-[#2F806A]">
                          {company.industry}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        if (window.confirm(`Delete company ${company.name}?`)) {
                          deleteCompany(company.id);
                        }
                      }}
                      className="p-1 text-[#747A75] hover:text-red-600 rounded transition-colors"
                      title="Delete company"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  <div className="mt-4 space-y-2 text-xs text-[#555C56]">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-3.5 w-3.5 text-[#747A75]" />
                      <span>{company.location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-3.5 w-3.5 text-[#747A75]" />
                      <span>{company.companySize} employees · {companyContacts.length} linked contacts</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-3.5 w-3.5 text-[#2F806A]" />
                      <span className="font-semibold text-[#2F806A]">
                        ${totalDealValue.toLocaleString()} active deal exposure
                      </span>
                    </div>
                  </div>

                  {company.notes && (
                    <p className="mt-3 text-[11px] text-[#747A75] bg-[#F6F7F4] p-2.5 rounded-lg line-clamp-2">
                      {company.notes}
                    </p>
                  )}
                </div>

                <div className="mt-4 pt-2.5 border-t border-[#E3E6E1] flex items-center justify-between text-[11px] text-[#747A75]">
                  <span>Lead Rep: {company.assignedOwner.split(" ")[0]}</span>
                  <a
                    href={company.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[#2F806A] font-semibold hover:underline"
                  >
                    <span>Website</span>
                    <ExternalLink className="h-2.5 w-2.5" />
                  </a>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
