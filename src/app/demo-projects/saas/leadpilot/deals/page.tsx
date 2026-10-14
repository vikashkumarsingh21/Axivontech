// src/app/demo-projects/saas/leadpilot/deals/page.tsx
"use client";

import React, { useState, useMemo } from "react";
import {
  DollarSign,
  Search,
  Filter,
  Plus,
  TrendingUp,
  Building2,
  Calendar,
  ChevronRight,
  Trash2,
  CheckCircle2,
  XCircle,
  LayoutGrid,
  List,
} from "lucide-react";
import { useLeadPilot } from "@/context/LeadPilotContext";
import { Deal, DealStage } from "@/data/leadpilot-data";

export default function LeadPilotDealsPage() {
  const { deals, deleteDeal, updateDealStage, companies } = useLeadPilot();
  const [viewMode, setViewMode] = useState<"board" | "table">("board");
  const [searchQuery, setSearchQuery] = useState("");
  const [stageFilter, setStageFilter] = useState("All");

  const DEAL_STAGES: DealStage[] = [
    "Discovery",
    "Qualification",
    "Proposal",
    "Negotiation",
    "Won",
    "Lost",
  ];

  const filteredDeals = useMemo(() => {
    let result = [...deals];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (d) =>
          d.name.toLowerCase().includes(q) ||
          d.companyName.toLowerCase().includes(q) ||
          d.primaryContactName.toLowerCase().includes(q)
      );
    }

    if (stageFilter !== "All") {
      result = result.filter((d) => d.stage === stageFilter);
    }

    return result;
  }, [deals, searchQuery, stageFilter]);

  const totalValue = filteredDeals.reduce((sum, d) => sum + d.estimatedValue, 0);

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-[#252925]">
            Sales Deals & Pipeline
          </h1>
          <p className="mt-0.5 text-xs text-[#747A75]">
            Manage stage probabilities, revenue forecasts, and commercial closing timelines.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center p-1 bg-white rounded-xl border border-[#E3E6E1] shadow-2xs">
            <button
              onClick={() => setViewMode("board")}
              className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                viewMode === "board"
                  ? "bg-[#252925] text-white"
                  : "text-[#747A75] hover:text-[#252925]"
              }`}
            >
              <LayoutGrid className="h-4 w-4" />
              <span className="hidden sm:inline">Pipeline Board</span>
            </button>
            <button
              onClick={() => setViewMode("table")}
              className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                viewMode === "table"
                  ? "bg-[#252925] text-white"
                  : "text-[#747A75] hover:text-[#252925]"
              }`}
            >
              <List className="h-4 w-4" />
              <span className="hidden sm:inline">Deals List</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filter and summary bar */}
      <div className="bg-white p-4 rounded-2xl border border-[#E3E6E1] shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3 flex-1 max-w-md">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#747A75]" />
            <input
              type="text"
              placeholder="Filter deals by name, company..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-[#F6F7F4] border border-[#E3E6E1] rounded-lg text-xs text-[#252925] focus:outline-none focus:ring-1 focus:ring-[#2F806A]"
            />
          </div>
          <select
            value={stageFilter}
            onChange={(e) => setStageFilter(e.target.value)}
            className="px-3 py-2 bg-[#F6F7F4] border border-[#E3E6E1] rounded-lg text-xs text-[#252925] focus:outline-none focus:ring-1 focus:ring-[#2F806A]"
          >
            <option value="All">All Stages</option>
            {DEAL_STAGES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        <div className="text-xs text-[#747A75] flex items-center gap-2">
          <span>Active Pipeline Volume:</span>
          <span className="font-extrabold text-[#2F806A] text-sm">
            ${totalValue.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Pipeline Kanban Board */}
      {viewMode === "board" && (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 overflow-x-auto pb-4">
          {DEAL_STAGES.map((stage) => {
            const stageDeals = filteredDeals.filter((d) => d.stage === stage);
            const stageTotal = stageDeals.reduce((sum, d) => sum + d.estimatedValue, 0);

            return (
              <div
                key={stage}
                className="bg-[#F6F7F4] rounded-2xl p-3 border border-[#E3E6E1] flex flex-col min-w-[230px]"
              >
                <div className="flex items-center justify-between pb-2 mb-3 border-b border-[#E3E6E1]">
                  <div>
                    <h3 className="text-xs font-bold text-[#252925]">{stage}</h3>
                    <div className="text-[10px] text-[#747A75]">
                      ${stageTotal >= 1000 ? `${(stageTotal / 1000).toFixed(0)}k` : stageTotal}
                    </div>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white text-[#252925] border border-[#E3E6E1]">
                    {stageDeals.length}
                  </span>
                </div>

                <div className="space-y-2.5 flex-1 overflow-y-auto max-h-[620px] pr-1">
                  {stageDeals.length === 0 ? (
                    <div className="py-8 text-center text-[11px] text-[#747A75] border border-dashed border-[#E3E6E1] rounded-xl">
                      No deals in {stage}
                    </div>
                  ) : (
                    stageDeals.map((deal) => (
                      <div
                        key={deal.id}
                        className="bg-white p-3 rounded-xl border border-[#E3E6E1] shadow-2xs hover:shadow-xs transition-shadow"
                      >
                        <div className="flex items-start justify-between gap-1">
                          <span className="text-xs font-bold text-[#252925] line-clamp-1">
                            {deal.name}
                          </span>
                          <button
                            onClick={() => {
                              if (window.confirm(`Delete deal ${deal.name}?`)) {
                                deleteDeal(deal.id);
                              }
                            }}
                            className="text-[#747A75] hover:text-red-600 transition-colors"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>

                        <div className="text-[11px] text-[#747A75] mt-0.5 truncate">
                          {deal.companyName}
                        </div>

                        <div className="mt-2 text-xs font-extrabold text-[#2F806A]">
                          ${deal.estimatedValue.toLocaleString()}
                        </div>

                        <div className="mt-2 pt-2 border-t border-[#E3E6E1]/70 flex items-center justify-between text-[10px] text-[#747A75]">
                          <span>{deal.probability}% win probability</span>
                          <span>Due {deal.expectedCloseDate.slice(5)}</span>
                        </div>

                        {/* Interactive stage advancement */}
                        <div className="mt-2 pt-1.5 border-t border-[#E3E6E1]/50 flex items-center justify-between text-[10px]">
                          <span className="text-[#848C85]">Move Stage:</span>
                          <select
                            value={deal.stage}
                            onChange={(e) => updateDealStage(deal.id, e.target.value as DealStage)}
                            className="bg-[#F6F7F4] border border-[#E3E6E1] rounded px-1 py-0.5 text-[#252925] focus:outline-none"
                          >
                            {DEAL_STAGES.map((s) => (
                              <option key={s} value={s}>{s}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Table view */}
      {viewMode === "table" && (
        <div className="bg-white rounded-2xl border border-[#E3E6E1] shadow-xs overflow-hidden">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#F6F7F4] border-b border-[#E3E6E1] text-[#747A75] font-semibold">
                <th className="py-3 px-4">Deal Name</th>
                <th className="py-3 px-4">Company</th>
                <th className="py-3 px-4">Stage</th>
                <th className="py-3 px-4 text-right">Value</th>
                <th className="py-3 px-4">Probability</th>
                <th className="py-3 px-4">Expected Close</th>
                <th className="py-3 px-4">Owner</th>
                <th className="py-3 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E3E6E1]">
              {filteredDeals.map((deal) => (
                <tr key={deal.id} className="hover:bg-[#F6F7F4]/60 transition-colors">
                  <td className="py-3 px-4 font-bold text-[#252925]">{deal.name}</td>
                  <td className="py-3 px-4 text-[#555C56]">{deal.companyName}</td>
                  <td className="py-3 px-4">
                    <select
                      value={deal.stage}
                      onChange={(e) => updateDealStage(deal.id, e.target.value as DealStage)}
                      className="px-2 py-1 rounded bg-[#E5F0EB] text-[#2F806A] text-[11px] font-semibold border border-[#2F806A]/20"
                    >
                      {DEAL_STAGES.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </td>
                  <td className="py-3 px-4 text-right font-extrabold text-[#2F806A]">
                    ${deal.estimatedValue.toLocaleString()}
                  </td>
                  <td className="py-3 px-4 text-[#747A75]">{deal.probability}%</td>
                  <td className="py-3 px-4 text-[#747A75]">{deal.expectedCloseDate}</td>
                  <td className="py-3 px-4 text-[#252925]">{deal.assignedOwner.split(" ")[0]}</td>
                  <td className="py-3 px-4 text-center">
                    <button
                      onClick={() => {
                        if (window.confirm(`Delete deal ${deal.name}?`)) {
                          deleteDeal(deal.id);
                        }
                      }}
                      className="text-[#747A75] hover:text-red-600 transition-colors"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
