"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { PageHeader } from "@/components/employee/PageHeader";
import { EpButton } from "@/components/employee/EpButton";
import { StatusBadge } from "@/components/employee/StatusBadge";
import { SkeletonCard } from "@/components/employee/SkeletonCard";
import {
  CheckCircle2,
  ArrowRight,
  Sparkles,
  BookOpen,
  Calendar,
  UserCheck,
  Shield,
  HelpCircle,
} from "lucide-react";

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  isCompleted: boolean;
  href: string;
  actionLabel: string;
}

interface OnboardingData {
  user: {
    name: string;
    email: string;
    employeeId: string;
    department: string;
    designation: string;
    joiningDate?: string;
  };
  steps: OnboardingStep[];
  totalSteps: number;
  completedSteps: number;
  progressPercent: number;
}

export default function OnboardingPage() {
  const [data, setData] = useState<OnboardingData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/v1/employee/onboarding")
      .then((res) => res.json())
      .then((resData) => {
        if (resData.success) {
          setData(resData);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-6 max-w-5xl pb-12">
        <SkeletonCard />
        <div className="space-y-3">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      </div>
    );
  }

  const progress = data?.progressPercent || 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="space-y-8 max-w-5xl pb-12"
    >
      {/* Page Header */}
      <PageHeader
        title="Employee Onboarding Portal"
        subtitle="Complete your workspace checklist, update credentials, and get started at Axivon Technologies."
        icon={UserCheck}
      />

      {/* Header Banner */}
      <div className="p-6 sm:p-8 bg-[#1A1A1B] border border-[#2E2E30] rounded-xl relative overflow-hidden">
        <div className="relative z-10 space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[#4F9D83]/10 text-[#4F9D83] border border-[#4F9D83]/30 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Onboarding Checklist</span>
            </span>
            <span className="text-xs text-[#8A867E]">
              Employee ID:{" "}
              <strong className="text-[#EDEBE6] font-mono">{data?.user.employeeId}</strong>
            </span>
          </div>

          <div>
            <h2 className="text-xl sm:text-2xl font-semibold text-[#EDEBE6] tracking-tight">
              Welcome to Axivon Technologies, {data?.user.name}!
            </h2>
            <p className="text-xs sm:text-sm text-[#8A867E] mt-1 max-w-2xl leading-relaxed">
              We are thrilled to have you join our team. Complete the steps below to ensure your
              workspace credentials, profiles, and attendance sync are fully operational.
            </p>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2 pt-2 max-w-xl">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="text-[#EDEBE6]">Onboarding Completion</span>
              <span className="text-[#4F9D83] font-bold">{progress}%</span>
            </div>
            <div className="w-full h-2.5 bg-[#121212] border border-[#2E2E30] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#4F9D83] rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-[11px] text-[#8A867E]">
              {data?.completedSteps} of {data?.totalSteps} milestones achieved
            </p>
          </div>
        </div>
      </div>

      {/* Checklist Grid */}
      <div className="space-y-4">
        <h3 className="text-base font-semibold text-[#EDEBE6] flex items-center gap-2">
          <UserCheck className="w-5 h-5 text-[#4F9D83]" />
          <span>Onboarding Action Items</span>
        </h3>

        <div className="grid gap-3.5">
          {data?.steps.map((step, idx) => (
            <div
              key={step.id}
              className={`p-4 sm:p-5 rounded-xl border transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                step.isCompleted
                  ? "bg-[#1A1A1B] border-[#2E2E30]"
                  : "bg-[#232324] border-[#4F9D83]/40 shadow-xs"
              }`}
            >
              <div className="flex items-start gap-3.5 min-w-0 flex-1">
                <div className="mt-0.5 shrink-0">
                  {step.isCompleted ? (
                    <div className="w-7 h-7 rounded-full bg-[#4F9D83]/10 border border-[#4F9D83]/25 flex items-center justify-center text-[#4F9D83]">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-[#121212] border border-[#2E2E30] flex items-center justify-center text-[#8A867E] font-semibold text-xs">
                      {idx + 1}
                    </div>
                  )}
                </div>

                <div className="space-y-1 min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h4
                      className={`text-sm sm:text-base font-medium ${
                        step.isCompleted ? "text-[#EDEBE6]" : "text-[#EDEBE6] font-semibold"
                      }`}
                    >
                      {step.title}
                    </h4>
                    {step.isCompleted && <StatusBadge status="COMPLETED" />}
                  </div>
                  <p className="text-xs text-[#8A867E] leading-relaxed">{step.description}</p>
                </div>
              </div>

              <div className="shrink-0 self-end sm:self-center">
                <Link href={step.href}>
                  <EpButton
                    size="sm"
                    variant={step.isCompleted ? "secondary" : "primary"}
                    className="text-xs h-8 px-3"
                  >
                    <span>{step.actionLabel}</span>
                    <ArrowRight className="w-3.5 h-3.5 ml-1" />
                  </EpButton>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Helpful Links & Resources */}
      <div className="p-6 bg-[#1A1A1B] border border-[#2E2E30] rounded-xl space-y-4">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-[#8A867E] flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-[#4F9D83]" />
          <span>Quick Assistance & Resources</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <Link
            href="/employee/calendar"
            className="p-3 bg-[#121212]/60 border border-[#2E2E30] rounded-xl hover:border-[#3A3A3D] transition-colors flex items-center gap-2.5 text-[#EDEBE6]"
          >
            <Calendar className="w-4 h-4 text-[#C9A15B] shrink-0" />
            <div>
              <div className="font-medium">Company Holidays</div>
              <div className="text-[11px] text-[#8A867E]">View annual paid holidays</div>
            </div>
          </Link>

          <Link
            href="/employee/documents"
            className="p-3 bg-[#121212]/60 border border-[#2E2E30] rounded-xl hover:border-[#3A3A3D] transition-colors flex items-center gap-2.5 text-[#EDEBE6]"
          >
            <Shield className="w-4 h-4 text-[#8E9AAF] shrink-0" />
            <div>
              <div className="font-semibold">Employee Handbook</div>
              <div className="text-[11px] text-[#8A867E]">Security & compliance rules</div>
            </div>
          </Link>

          <Link
            href="/employee/support"
            className="p-3 bg-[#121212]/60 border border-[#2E2E30] rounded-xl hover:border-[#3A3A3D] transition-colors flex items-center gap-2.5 text-[#EDEBE6]"
          >
            <HelpCircle className="w-4 h-4 text-[#4F9D83] shrink-0" />
            <div>
              <div className="font-semibold">Help & IT Support</div>
              <div className="text-[11px] text-[#8A867E]">Talk to People Ops or IT</div>
            </div>
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
