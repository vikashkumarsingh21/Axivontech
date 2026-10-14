// src/components/demo-projects/leadpilot/LeadPilotHeader.tsx
"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Search,
  Bell,
  Plus,
  Menu,
  CheckCircle2,
  DollarSign,
  Users,
  Building2,
  Calendar,
  CheckSquare,
  X,
  ExternalLink,
  ChevronDown,
  RotateCcw,
} from "lucide-react";
import { useLeadPilot } from "@/context/LeadPilotContext";

interface HeaderProps {
  onOpenMobileSidebar: () => void;
  onOpenQuickAdd: (type: "lead" | "contact" | "deal" | "task") => void;
}

export default function LeadPilotHeader({ onOpenMobileSidebar, onOpenQuickAdd }: HeaderProps) {
  const router = useRouter();
  const {
    leads,
    contacts,
    companies,
    deals,
    tasks,
    notifications,
    markNotificationRead,
    markAllNotificationsRead,
    clearNotifications,
    resetDemoData,
  } = useLeadPilot();

  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Notification state
  const [notifOpen, setNotifOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  // Quick Add Dropdown state
  const [quickAddOpen, setQuickAddOpen] = useState(false);
  const quickAddRef = useRef<HTMLDivElement>(null);

  // Profile menu state
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  const unreadNotifs = notifications.filter((n) => !n.read).length;

  // Global search filtering across all entities
  const searchResults = React.useMemo(() => {
    if (!searchQuery.trim()) return null;
    const q = searchQuery.toLowerCase().trim();

    const matchedLeads = leads
      .filter((l) => l.fullName.toLowerCase().includes(q) || l.companyName.toLowerCase().includes(q))
      .slice(0, 3);

    const matchedContacts = contacts
      .filter((c) => c.fullName.toLowerCase().includes(q) || c.companyName.toLowerCase().includes(q))
      .slice(0, 3);

    const matchedCompanies = companies
      .filter((c) => c.name.toLowerCase().includes(q) || c.industry.toLowerCase().includes(q))
      .slice(0, 3);

    const matchedDeals = deals
      .filter((d) => d.name.toLowerCase().includes(q) || d.companyName.toLowerCase().includes(q))
      .slice(0, 3);

    const matchedTasks = tasks
      .filter((t) => t.title.toLowerCase().includes(q))
      .slice(0, 3);

    const totalMatches =
      matchedLeads.length +
      matchedContacts.length +
      matchedCompanies.length +
      matchedDeals.length +
      matchedTasks.length;

    return {
      leads: matchedLeads,
      contacts: matchedContacts,
      companies: matchedCompanies,
      deals: matchedDeals,
      tasks: matchedTasks,
      totalMatches,
    };
  }, [searchQuery, leads, contacts, companies, deals, tasks]);

  // Click outside listener for all dropdowns
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setSearchOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setNotifOpen(false);
      }
      if (quickAddRef.current && !quickAddRef.current.contains(event.target as Node)) {
        setQuickAddOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-30 h-16 bg-[#FFFFFF] border-b border-[#E3E6E1] px-4 sm:px-6 flex items-center justify-between gap-4">
      {/* Left: Mobile Toggle & Global Search */}
      <div className="flex items-center gap-3 flex-1 max-w-lg">
        <button
          onClick={onOpenMobileSidebar}
          className="lg:hidden p-2 rounded-lg text-[#252925] hover:bg-[#F6F7F4] border border-[#E3E6E1] transition-colors"
          aria-label="Open mobile menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Global Search Input */}
        <div ref={searchRef} className="relative flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#747A75]" />
            <input
              type="text"
              placeholder="Search leads, companies, deals, tasks..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setSearchOpen(true);
              }}
              onFocus={() => setSearchOpen(true)}
              className="w-full pl-9 pr-8 py-2 bg-[#F6F7F4] border border-[#E3E6E1] rounded-lg text-xs text-[#252925] placeholder-[#747A75] focus:outline-none focus:ring-1 focus:ring-[#2F806A] focus:border-[#2F806A] transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#747A75] hover:text-[#252925]"
                aria-label="Clear search"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Search Results Dropdown */}
          {searchOpen && searchResults && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-lg border border-[#E3E6E1] overflow-hidden z-50 max-h-[80vh] overflow-y-auto">
              <div className="p-3 bg-[#F6F7F4] border-b border-[#E3E6E1] flex items-center justify-between text-xs">
                <span className="font-semibold text-[#252925]">
                  Search Results ({searchResults.totalMatches})
                </span>
                <span className="text-[11px] text-[#747A75]">Press ESC to close</span>
              </div>

              {searchResults.totalMatches === 0 ? (
                <div className="p-6 text-center text-xs text-[#747A75]">
                  No sample records found matching &ldquo;{searchQuery}&rdquo;.
                </div>
              ) : (
                <div className="p-2 space-y-3">
                  {/* Leads */}
                  {searchResults.leads.length > 0 && (
                    <div>
                      <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-[#747A75] flex items-center gap-1.5">
                        <Users className="h-3 w-3 text-[#2F806A]" />
                        Leads
                      </div>
                      {searchResults.leads.map((l) => (
                        <button
                          key={l.id}
                          onClick={() => {
                            setSearchOpen(false);
                            router.push(`/demo-projects/saas/leadpilot/leads?id=${l.id}`);
                          }}
                          className="w-full text-left px-2.5 py-1.5 rounded-md hover:bg-[#F6F7F4] flex items-center justify-between text-xs transition-colors"
                        >
                          <div>
                            <div className="font-medium text-[#252925]">{l.fullName}</div>
                            <div className="text-[11px] text-[#747A75]">{l.companyName} · {l.interestedService}</div>
                          </div>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#E5F0EB] text-[#2F806A] font-semibold">
                            {l.status}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Deals */}
                  {searchResults.deals.length > 0 && (
                    <div>
                      <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-[#747A75] flex items-center gap-1.5">
                        <DollarSign className="h-3 w-3 text-[#2F806A]" />
                        Deals
                      </div>
                      {searchResults.deals.map((d) => (
                        <button
                          key={d.id}
                          onClick={() => {
                            setSearchOpen(false);
                            router.push(`/demo-projects/saas/leadpilot/deals?id=${d.id}`);
                          }}
                          className="w-full text-left px-2.5 py-1.5 rounded-md hover:bg-[#F6F7F4] flex items-center justify-between text-xs transition-colors"
                        >
                          <div>
                            <div className="font-medium text-[#252925]">{d.name}</div>
                            <div className="text-[11px] text-[#747A75]">{d.companyName} · Stage: {d.stage}</div>
                          </div>
                          <span className="font-semibold text-[#2F806A]">
                            ${d.estimatedValue.toLocaleString()}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Companies */}
                  {searchResults.companies.length > 0 && (
                    <div>
                      <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-[#747A75] flex items-center gap-1.5">
                        <Building2 className="h-3 w-3 text-[#2F806A]" />
                        Companies
                      </div>
                      {searchResults.companies.map((c) => (
                        <button
                          key={c.id}
                          onClick={() => {
                            setSearchOpen(false);
                            router.push(`/demo-projects/saas/leadpilot/companies?id=${c.id}`);
                          }}
                          className="w-full text-left px-2.5 py-1.5 rounded-md hover:bg-[#F6F7F4] flex items-center justify-between text-xs transition-colors"
                        >
                          <div>
                            <div className="font-medium text-[#252925]">{c.name}</div>
                            <div className="text-[11px] text-[#747A75]">{c.industry} · {c.companySize} employees</div>
                          </div>
                          <span className="text-[11px] text-[#747A75]">{c.location}</span>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Tasks */}
                  {searchResults.tasks.length > 0 && (
                    <div>
                      <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-[#747A75] flex items-center gap-1.5">
                        <CheckSquare className="h-3 w-3 text-[#2F806A]" />
                        Tasks
                      </div>
                      {searchResults.tasks.map((t) => (
                        <button
                          key={t.id}
                          onClick={() => {
                            setSearchOpen(false);
                            router.push(`/demo-projects/saas/leadpilot/tasks`);
                          }}
                          className="w-full text-left px-2.5 py-1.5 rounded-md hover:bg-[#F6F7F4] flex items-center justify-between text-xs transition-colors"
                        >
                          <div>
                            <div className="font-medium text-[#252925]">{t.title}</div>
                            <div className="text-[11px] text-[#747A75]">Due: {t.dueDate} · {t.priority} priority</div>
                          </div>
                          <span
                            className={`text-[10px] px-1.5 py-0.5 rounded font-semibold ${
                              t.status === "Completed"
                                ? "bg-[#E5F0EB] text-[#2F806A]"
                                : "bg-[#FFF4E5] text-[#DDA34B]"
                            }`}
                          >
                            {t.status}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2.5 sm:gap-3">
        {/* Quick Add Dropdown */}
        <div ref={quickAddRef} className="relative">
          <button
            onClick={() => setQuickAddOpen(!quickAddOpen)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#2F806A] hover:bg-[#266b58] text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
          >
            <Plus className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Quick Add</span>
            <ChevronDown className="h-3 w-3 opacity-70" />
          </button>

          {quickAddOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-[#E3E6E1] py-1 z-50">
              <button
                onClick={() => {
                  setQuickAddOpen(false);
                  onOpenQuickAdd("lead");
                }}
                className="w-full text-left px-3.5 py-2 text-xs text-[#252925] hover:bg-[#F6F7F4] flex items-center gap-2.5 transition-colors"
              >
                <Users className="h-4 w-4 text-[#2F806A]" />
                <span>Add New Lead</span>
              </button>
              <button
                onClick={() => {
                  setQuickAddOpen(false);
                  onOpenQuickAdd("contact");
                }}
                className="w-full text-left px-3.5 py-2 text-xs text-[#252925] hover:bg-[#F6F7F4] flex items-center gap-2.5 transition-colors"
              >
                <Users className="h-4 w-4 text-[#747A75]" />
                <span>Add Contact</span>
              </button>
              <button
                onClick={() => {
                  setQuickAddOpen(false);
                  onOpenQuickAdd("deal");
                }}
                className="w-full text-left px-3.5 py-2 text-xs text-[#252925] hover:bg-[#F6F7F4] flex items-center gap-2.5 transition-colors"
              >
                <DollarSign className="h-4 w-4 text-[#2F806A]" />
                <span>Create Opportunity</span>
              </button>
              <button
                onClick={() => {
                  setQuickAddOpen(false);
                  onOpenQuickAdd("task");
                }}
                className="w-full text-left px-3.5 py-2 text-xs text-[#252925] hover:bg-[#F6F7F4] flex items-center gap-2.5 transition-colors"
              >
                <CheckSquare className="h-4 w-4 text-[#DDA34B]" />
                <span>Schedule Task</span>
              </button>
            </div>
          )}
        </div>

        {/* Notifications Control */}
        <div ref={notifRef} className="relative">
          <button
            onClick={() => setNotifOpen(!notifOpen)}
            className="relative p-2 rounded-lg text-[#252925] hover:bg-[#F6F7F4] border border-[#E3E6E1] transition-colors"
            aria-label="View notifications"
          >
            <Bell className="h-4 w-4 text-[#252925]" />
            {unreadNotifs > 0 && (
              <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-[#DDA34B] ring-2 ring-white" />
            )}
          </button>

          {notifOpen && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-lg border border-[#E3E6E1] z-50 overflow-hidden">
              <div className="p-3 bg-[#F6F7F4] border-b border-[#E3E6E1] flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-[#252925]">Notifications</h4>
                  <p className="text-[11px] text-[#747A75]">Local demo simulated alerts</p>
                </div>
                <div className="flex items-center gap-2 text-[11px]">
                  {unreadNotifs > 0 && (
                    <button
                      onClick={markAllNotificationsRead}
                      className="text-[#2F806A] font-semibold hover:underline"
                    >
                      Mark all read
                    </button>
                  )}
                  <button
                    onClick={clearNotifications}
                    className="text-[#747A75] hover:text-[#252925]"
                  >
                    Clear
                  </button>
                </div>
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-[#E3E6E1]">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center text-xs text-[#747A75]">
                    No notifications at this time.
                  </div>
                ) : (
                  notifications.map((notif) => (
                    <div
                      key={notif.id}
                      onClick={() => markNotificationRead(notif.id)}
                      className={`p-3 text-xs transition-colors cursor-pointer hover:bg-[#F6F7F4] ${
                        !notif.read ? "bg-[#F0F6F3]" : "bg-white"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-[#252925]">{notif.title}</span>
                        <span className="text-[10px] text-[#747A75]">{notif.timestamp}</span>
                      </div>
                      <p className="mt-1 text-[11px] text-[#555C56] leading-relaxed">
                        {notif.message}
                      </p>
                      {notif.link && (
                        <Link
                          href={notif.link}
                          onClick={() => setNotifOpen(false)}
                          className="mt-1.5 inline-flex items-center gap-1 text-[10px] font-semibold text-[#2F806A] hover:underline"
                        >
                          <span>Open related view</span>
                          <ExternalLink className="h-2.5 w-2.5" />
                        </Link>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Profile Menu */}
        <div ref={profileRef} className="relative">
          <button
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-[#F6F7F4] transition-colors"
          >
            <div className="h-8 w-8 rounded-full bg-[#252925] text-white flex items-center justify-center text-xs font-bold ring-1 ring-[#E3E6E1]">
              AR
            </div>
            <div className="hidden sm:block text-left">
              <div className="text-xs font-bold text-[#252925] leading-none">Alex Rivera</div>
              <div className="text-[10px] text-[#747A75] mt-0.5 leading-none">Account Exec</div>
            </div>
            <ChevronDown className="h-3 w-3 text-[#747A75]" />
          </button>

          {profileOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-[#E3E6E1] py-1 z-50">
              <div className="px-3.5 py-2.5 border-b border-[#E3E6E1] bg-[#F6F7F4]">
                <div className="text-xs font-bold text-[#252925]">Alex Rivera (Demo Rep)</div>
                <div className="text-[11px] text-[#747A75]">alex.rivera@leadpilot-demo.com</div>
              </div>

              <Link
                href="/demo-projects/saas/leadpilot/settings"
                onClick={() => setProfileOpen(false)}
                className="block px-3.5 py-2 text-xs text-[#252925] hover:bg-[#F6F7F4] transition-colors"
              >
                Workspace Settings
              </Link>

              <button
                onClick={() => {
                  setProfileOpen(false);
                  if (window.confirm("Reset all local LeadPilot demonstration records to default state?")) {
                    resetDemoData();
                  }
                }}
                className="w-full text-left px-3.5 py-2 text-xs text-[#DDA34B] hover:bg-[#FFF8EE] flex items-center gap-2 transition-colors border-t border-[#E3E6E1]"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>Reset Demo Records</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
