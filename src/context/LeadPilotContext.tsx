// src/context/LeadPilotContext.tsx
"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";
import {
  Lead,
  Contact,
  Company,
  Deal,
  Task,
  Activity,
  NotificationItem,
  LeadStatus,
  LeadPriority,
  DealStage,
  TaskStatus,
  TaskPriority,
  ActivityType,
  INITIAL_LEADS,
  INITIAL_CONTACTS,
  INITIAL_COMPANIES,
  INITIAL_DEALS,
  INITIAL_TASKS,
  INITIAL_ACTIVITIES,
  INITIAL_NOTIFICATIONS,
} from "@/data/leadpilot-data";

interface LeadPilotContextType {
  // State
  leads: Lead[];
  contacts: Contact[];
  companies: Company[];
  deals: Deal[];
  tasks: Task[];
  activities: Activity[];
  notifications: NotificationItem[];
  isHydrated: boolean;
  selectedTimeRange: "all" | "quarter" | "month" | "year";
  setTimeRange: (range: "all" | "quarter" | "month" | "year") => void;

  // Derived KPIs
  totalLeads: number;
  newLeadsCount: number;
  openDealsCount: number;
  pipelineValue: number;
  tasksDueCount: number;
  qualifiedLeadsCount: number;
  wonRevenue: number;

  // Lead CRUD
  addLead: (lead: Omit<Lead, "id" | "createdAt" | "lastContactedAt">) => void;
  updateLead: (id: string, updates: Partial<Lead>) => void;
  deleteLead: (id: string) => void;
  updateLeadStatus: (id: string, status: LeadStatus) => void;

  // Contact CRUD
  addContact: (contact: Omit<Contact, "id" | "createdAt">) => void;
  updateContact: (id: string, updates: Partial<Contact>) => void;
  deleteContact: (id: string) => void;

  // Company CRUD
  addCompany: (company: Omit<Company, "id" | "createdAt">) => void;
  updateCompany: (id: string, updates: Partial<Company>) => void;
  deleteCompany: (id: string) => void;

  // Deal CRUD
  addDeal: (deal: Omit<Deal, "id" | "createdAt">) => void;
  updateDeal: (id: string, updates: Partial<Deal>) => void;
  deleteDeal: (id: string) => void;
  updateDealStage: (id: string, stage: DealStage) => void;

  // Task CRUD
  addTask: (task: Omit<Task, "id" | "createdAt">) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  toggleTaskStatus: (id: string) => void;
  deleteTask: (id: string) => void;

  // Activity
  addActivity: (activity: Omit<Activity, "id">) => void;

  // Notifications
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  clearNotifications: () => void;

  // Reset
  resetDemoData: () => void;
}

const STORAGE_KEY_PREFIX = "leadpilot_crm_demo_v1_";
const STORAGE_KEYS = {
  LEADS: `${STORAGE_KEY_PREFIX}leads`,
  CONTACTS: `${STORAGE_KEY_PREFIX}contacts`,
  COMPANIES: `${STORAGE_KEY_PREFIX}companies`,
  DEALS: `${STORAGE_KEY_PREFIX}deals`,
  TASKS: `${STORAGE_KEY_PREFIX}tasks`,
  ACTIVITIES: `${STORAGE_KEY_PREFIX}activities`,
  NOTIFICATIONS: `${STORAGE_KEY_PREFIX}notifications`,
};

const LeadPilotContext = createContext<LeadPilotContextType | undefined>(undefined);

export function LeadPilotProvider({ children }: { children: React.ReactNode }) {
  const [leads, setLeads] = useState<Lead[]>(INITIAL_LEADS);
  const [contacts, setContacts] = useState<Contact[]>(INITIAL_CONTACTS);
  const [companies, setCompanies] = useState<Company[]>(INITIAL_COMPANIES);
  const [deals, setDeals] = useState<Deal[]>(INITIAL_DEALS);
  const [tasks, setTasks] = useState<Task[]>(INITIAL_TASKS);
  const [activities, setActivities] = useState<Activity[]>(INITIAL_ACTIVITIES);
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);
  const [isHydrated, setIsHydrated] = useState(false);
  const [selectedTimeRange, setTimeRange] = useState<"all" | "quarter" | "month" | "year">("quarter");

  // Load from LocalStorage after hydration
  useEffect(() => {
    try {
      const storedLeads = localStorage.getItem(STORAGE_KEYS.LEADS);
      const storedContacts = localStorage.getItem(STORAGE_KEYS.CONTACTS);
      const storedCompanies = localStorage.getItem(STORAGE_KEYS.COMPANIES);
      const storedDeals = localStorage.getItem(STORAGE_KEYS.DEALS);
      const storedTasks = localStorage.getItem(STORAGE_KEYS.TASKS);
      const storedActivities = localStorage.getItem(STORAGE_KEYS.ACTIVITIES);
      const storedNotifs = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);

      if (storedLeads) setLeads(JSON.parse(storedLeads));
      if (storedContacts) setContacts(JSON.parse(storedContacts));
      if (storedCompanies) setCompanies(JSON.parse(storedCompanies));
      if (storedDeals) setDeals(JSON.parse(storedDeals));
      if (storedTasks) setTasks(JSON.parse(storedTasks));
      if (storedActivities) setActivities(JSON.parse(storedActivities));
      if (storedNotifs) setNotifications(JSON.parse(storedNotifs));
    } catch (err) {
      console.warn("LeadPilot localStorage load fallback to initial state:", err);
    } finally {
      setIsHydrated(true);
    }
  }, []);

  // Save changes to localStorage when state updates
  useEffect(() => {
    if (!isHydrated) return;
    try {
      localStorage.setItem(STORAGE_KEYS.LEADS, JSON.stringify(leads));
      localStorage.setItem(STORAGE_KEYS.CONTACTS, JSON.stringify(contacts));
      localStorage.setItem(STORAGE_KEYS.COMPANIES, JSON.stringify(companies));
      localStorage.setItem(STORAGE_KEYS.DEALS, JSON.stringify(deals));
      localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
      localStorage.setItem(STORAGE_KEYS.ACTIVITIES, JSON.stringify(activities));
      localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifications));
    } catch (err) {
      console.warn("LeadPilot localStorage save failed:", err);
    }
  }, [leads, contacts, companies, deals, tasks, activities, notifications, isHydrated]);

  // Derived KPIs
  const totalLeads = leads.length;
  const newLeadsCount = leads.filter((l) => l.status === "New").length;
  const openDeals = useMemo(() => deals.filter((d) => d.stage !== "Won" && d.stage !== "Lost"), [deals]);
  const openDealsCount = openDeals.length;
  const pipelineValue = useMemo(() => openDeals.reduce((sum, d) => sum + (d.estimatedValue || 0), 0), [openDeals]);
  const wonRevenue = useMemo(() => deals.filter((d) => d.stage === "Won").reduce((sum, d) => sum + (d.estimatedValue || 0), 0), [deals]);
  const tasksDueCount = useMemo(() => tasks.filter((t) => t.status !== "Completed").length, [tasks]);
  const qualifiedLeadsCount = leads.filter((l) => l.status === "Qualified" || l.status === "Proposal").length;

  // Helper for current date
  const todayIso = new Date().toISOString().split("T")[0];
  const currentTime = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false });

  // ── Lead Operations ──────────────────────────────────────────
  const addLead = useCallback(
    (leadData: Omit<Lead, "id" | "createdAt" | "lastContactedAt">) => {
      const newId = `lead-${Date.now()}`;
      const newLead: Lead = {
        ...leadData,
        id: newId,
        createdAt: todayIso,
        lastContactedAt: todayIso,
      };

      setLeads((prev) => [newLead, ...prev]);

      // Automatically log activity
      const newAct: Activity = {
        id: `act-${Date.now()}`,
        type: "Status Change",
        title: `New lead created: ${newLead.fullName}`,
        description: `Lead added for ${newLead.companyName} (${newLead.interestedService}).`,
        relatedLeadId: newId,
        relatedLeadName: newLead.fullName,
        relatedCompanyId: newLead.companyId,
        relatedCompanyName: newLead.companyName,
        performedBy: "Alex Rivera (Account Exec)",
        date: todayIso,
        time: currentTime,
      };
      setActivities((prev) => [newAct, ...prev]);

      // Add Notification
      const newNotif: NotificationItem = {
        id: `notif-${Date.now()}`,
        title: "New Lead Created",
        message: `${newLead.fullName} from ${newLead.companyName} was added to the CRM.`,
        type: "lead",
        timestamp: "Just now",
        read: false,
        link: "/demo-projects/saas/leadpilot/leads",
      };
      setNotifications((prev) => [newNotif, ...prev]);
    },
    [todayIso, currentTime]
  );

  const updateLead = useCallback((id: string, updates: Partial<Lead>) => {
    setLeads((prev) =>
      prev.map((lead) => {
        if (lead.id === id) {
          return { ...lead, ...updates };
        }
        return lead;
      })
    );
  }, []);

  const deleteLead = useCallback((id: string) => {
    setLeads((prev) => prev.filter((lead) => lead.id !== id));
  }, []);

  const updateLeadStatus = useCallback(
    (id: string, newStatus: LeadStatus) => {
      setLeads((prev) =>
        prev.map((lead) => {
          if (lead.id === id) {
            return {
              ...lead,
              status: newStatus,
              lastContactedAt: todayIso,
            };
          }
          return lead;
        })
      );

      const targetLead = leads.find((l) => l.id === id);
      if (targetLead && targetLead.status !== newStatus) {
        const newAct: Activity = {
          id: `act-${Date.now()}`,
          type: "Status Change",
          title: `Lead stage changed to ${newStatus}`,
          description: `${targetLead.fullName} (${targetLead.companyName}) moved to ${newStatus}.`,
          relatedLeadId: id,
          relatedLeadName: targetLead.fullName,
          relatedCompanyId: targetLead.companyId,
          relatedCompanyName: targetLead.companyName,
          performedBy: "Alex Rivera (Account Exec)",
          date: todayIso,
          time: currentTime,
        };
        setActivities((prev) => [newAct, ...prev]);
      }
    },
    [leads, todayIso, currentTime]
  );

  // ── Contact Operations ────────────────────────────────────────
  const addContact = useCallback(
    (contactData: Omit<Contact, "id" | "createdAt">) => {
      const newContact: Contact = {
        ...contactData,
        id: `cnt-${Date.now()}`,
        createdAt: todayIso,
      };
      setContacts((prev) => [newContact, ...prev]);
    },
    [todayIso]
  );

  const updateContact = useCallback((id: string, updates: Partial<Contact>) => {
    setContacts((prev) => prev.map((cnt) => (cnt.id === id ? { ...cnt, ...updates } : cnt)));
  }, []);

  const deleteContact = useCallback((id: string) => {
    setContacts((prev) => prev.filter((cnt) => cnt.id !== id));
  }, []);

  // ── Company Operations ────────────────────────────────────────
  const addCompany = useCallback(
    (companyData: Omit<Company, "id" | "createdAt">) => {
      const newCompany: Company = {
        ...companyData,
        id: `comp-${Date.now()}`,
        createdAt: todayIso,
      };
      setCompanies((prev) => [newCompany, ...prev]);
    },
    [todayIso]
  );

  const updateCompany = useCallback((id: string, updates: Partial<Company>) => {
    setCompanies((prev) => prev.map((comp) => (comp.id === id ? { ...comp, ...updates } : comp)));
  }, []);

  const deleteCompany = useCallback((id: string) => {
    setCompanies((prev) => prev.filter((comp) => comp.id !== id));
  }, []);

  // ── Deal Operations ───────────────────────────────────────────
  const addDeal = useCallback(
    (dealData: Omit<Deal, "id" | "createdAt">) => {
      const newDeal: Deal = {
        ...dealData,
        id: `deal-${Date.now()}`,
        createdAt: todayIso,
      };
      setDeals((prev) => [newDeal, ...prev]);

      const newAct: Activity = {
        id: `act-${Date.now()}`,
        type: "Status Change",
        title: `Deal created: ${newDeal.name}`,
        description: `Opportunity created with estimated value $${newDeal.estimatedValue.toLocaleString()}.`,
        relatedCompanyId: newDeal.companyId,
        relatedCompanyName: newDeal.companyName,
        performedBy: newDeal.assignedOwner,
        date: todayIso,
        time: currentTime,
      };
      setActivities((prev) => [newAct, ...prev]);
    },
    [todayIso, currentTime]
  );

  const updateDeal = useCallback((id: string, updates: Partial<Deal>) => {
    setDeals((prev) => prev.map((deal) => (deal.id === id ? { ...deal, ...updates } : deal)));
  }, []);

  const deleteDeal = useCallback((id: string) => {
    setDeals((prev) => prev.filter((deal) => deal.id !== id));
  }, []);

  const updateDealStage = useCallback(
    (id: string, newStage: DealStage) => {
      setDeals((prev) =>
        prev.map((deal) => {
          if (deal.id === id) {
            let newProb = deal.probability;
            if (newStage === "Won") newProb = 100;
            else if (newStage === "Lost") newProb = 0;
            else if (newStage === "Negotiation") newProb = 80;
            else if (newStage === "Proposal") newProb = 60;
            else if (newStage === "Qualification") newProb = 40;
            else if (newStage === "Discovery") newProb = 20;

            return { ...deal, stage: newStage, probability: newProb };
          }
          return deal;
        })
      );

      const targetDeal = deals.find((d) => d.id === id);
      if (targetDeal && targetDeal.stage !== newStage) {
        const newAct: Activity = {
          id: `act-${Date.now()}`,
          type: "Status Change",
          title: `Deal moved to ${newStage}: ${targetDeal.name}`,
          description: `Stage updated to ${newStage} ($${targetDeal.estimatedValue.toLocaleString()}).`,
          relatedCompanyId: targetDeal.companyId,
          relatedCompanyName: targetDeal.companyName,
          performedBy: "Alex Rivera (Account Exec)",
          date: todayIso,
          time: currentTime,
        };
        setActivities((prev) => [newAct, ...prev]);
      }
    },
    [deals, todayIso, currentTime]
  );

  // ── Task Operations ───────────────────────────────────────────
  const addTask = useCallback(
    (taskData: Omit<Task, "id" | "createdAt">) => {
      const newTask: Task = {
        ...taskData,
        id: `task-${Date.now()}`,
        createdAt: todayIso,
      };
      setTasks((prev) => [newTask, ...prev]);

      const newAct: Activity = {
        id: `act-${Date.now()}`,
        type: "Task Update",
        title: `Task scheduled: ${newTask.title}`,
        description: `Due on ${newTask.dueDate}. Assigned to ${newTask.assignedOwner}.`,
        relatedLeadId: newTask.relatedLeadId,
        relatedLeadName: newTask.relatedLeadName,
        relatedCompanyId: newTask.relatedCompanyId,
        relatedCompanyName: newTask.relatedCompanyName,
        performedBy: "Alex Rivera (Account Exec)",
        date: todayIso,
        time: currentTime,
      };
      setActivities((prev) => [newAct, ...prev]);
    },
    [todayIso, currentTime]
  );

  const updateTask = useCallback((id: string, updates: Partial<Task>) => {
    setTasks((prev) => prev.map((task) => (task.id === id ? { ...task, ...updates } : task)));
  }, []);

  const toggleTaskStatus = useCallback(
    (id: string) => {
      setTasks((prev) =>
        prev.map((task) => {
          if (task.id === id) {
            const nextStatus: TaskStatus = task.status === "Completed" ? "To Do" : "Completed";
            return {
              ...task,
              status: nextStatus,
              completedAt: nextStatus === "Completed" ? todayIso : undefined,
            };
          }
          return task;
        })
      );
    },
    [todayIso]
  );

  const deleteTask = useCallback((id: string) => {
    setTasks((prev) => prev.filter((task) => task.id !== id));
  }, []);

  // ── Activity Operations ───────────────────────────────────────
  const addActivity = useCallback((actData: Omit<Activity, "id">) => {
    const newAct: Activity = {
      ...actData,
      id: `act-${Date.now()}`,
    };
    setActivities((prev) => [newAct, ...prev]);
  }, []);

  // ── Notification Operations ───────────────────────────────────
  const markNotificationRead = useCallback((id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  }, []);

  const markAllNotificationsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  // ── Reset Demo Data ───────────────────────────────────────────
  const resetDemoData = useCallback(() => {
    setLeads(INITIAL_LEADS);
    setContacts(INITIAL_CONTACTS);
    setCompanies(INITIAL_COMPANIES);
    setDeals(INITIAL_DEALS);
    setTasks(INITIAL_TASKS);
    setActivities(INITIAL_ACTIVITIES);
    setNotifications(INITIAL_NOTIFICATIONS);

    try {
      Object.values(STORAGE_KEYS).forEach((k) => localStorage.removeItem(k));
    } catch (e) {
      console.warn("Could not clear localStorage keys:", e);
    }
  }, []);

  return (
    <LeadPilotContext.Provider
      value={{
        leads,
        contacts,
        companies,
        deals,
        tasks,
        activities,
        notifications,
        isHydrated,
        selectedTimeRange,
        setTimeRange,
        totalLeads,
        newLeadsCount,
        openDealsCount,
        pipelineValue,
        tasksDueCount,
        qualifiedLeadsCount,
        wonRevenue,
        addLead,
        updateLead,
        deleteLead,
        updateLeadStatus,
        addContact,
        updateContact,
        deleteContact,
        addCompany,
        updateCompany,
        deleteCompany,
        addDeal,
        updateDeal,
        deleteDeal,
        updateDealStage,
        addTask,
        updateTask,
        toggleTaskStatus,
        deleteTask,
        addActivity,
        markNotificationRead,
        markAllNotificationsRead,
        clearNotifications,
        resetDemoData,
      }}
    >
      {children}
    </LeadPilotContext.Provider>
  );
}

export function useLeadPilot() {
  const context = useContext(LeadPilotContext);
  if (!context) {
    throw new Error("useLeadPilot must be used within a LeadPilotProvider");
  }
  return context;
}
