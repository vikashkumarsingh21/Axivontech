"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import {
  CheckCircle2,
  Circle,
  ArrowRight,
  Sparkles,
  BookOpen,
  Calendar,
  Lock,
  Loader2,
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
      <div className="flex items-center justify-center p-20 text-[#7E8997] gap-3">
        <Loader2 className="w-6 h-6 animate-spin text-emerald-500" />
        <span>Loading onboarding checklist...</span>
      </div>
    );
  }

  const progress = data?.progressPercent || 0;

  return (
    <div className="space-y-8 max-w-5xl">
      {/* Header Banner */}
      <Card className="p-6 sm:p-8 bg-gradient-to-r from-[#151A21] via-[#1B222B] to-[#151A21] border-[#29313B] rounded-2xl relative overflow-hidden">
        <div className="relative z-10 space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              Employee Onboarding Portal
            </span>
            <span className="text-xs text-[#7E8997]">
              Employee ID: <strong className="text-[#F3F5F7] font-mono">{data?.user.employeeId}</strong>
            </span>
          </div>

          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#F3F5F7] tracking-tight">
              Welcome to Axivon Technologies, {data?.user.name}!
            </h1>
            <p className="text-sm text-[#A7B0BC] mt-1 max-w-2xl">
              We are thrilled to have you join our engineering and technology team. Complete the
              steps below to ensure your workspace credentials, profiles, and attendance sync are
              fully operational.
            </p>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2 pt-2 max-w-xl">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="text-[#F3F5F7]">Onboarding Completion</span>
              <span className="text-emerald-400">{progress}%</span>
            </div>
            <div className="w-full h-2.5 bg-[#10151B] border border-[#29313B] rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-[11px] text-[#7E8997]">
              {data?.completedSteps} of {data?.totalSteps} milestones achieved
            </p>
          </div>
        </div>
      </Card>

      {/* Checklist Grid */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-[#F3F5F7] flex items-center gap-2">
          <UserCheck className="w-5 h-5 text-emerald-400" />
          <span>Onboarding Action Items</span>
        </h2>

        <div className="grid gap-3.5">
          {data?.steps.map((step, idx) => (
            <Card
              key={step.id}
              className={`p-4 sm:p-5 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                step.isCompleted
                  ? "bg-[#151A21] border-[#29313B]/80"
                  : "bg-[#1B222B] border-amber-500/30 shadow-xs"
              }`}
            >
              <div className="flex items-start gap-3.5 min-w-0 flex-1">
                <div className="mt-0.5 shrink-0">
                  {step.isCompleted ? (
                    <div className="w-7 h-7 rounded-full bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-emerald-400">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-[#10151B] border border-[#364152] flex items-center justify-center text-[#7E8997] font-bold text-xs">
                      {idx + 1}
                    </div>
                  )}
                </div>

                <div className="space-y-1 min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h3
                      className={`text-sm sm:text-base font-semibold ${
                        step.isCompleted ? "text-[#F3F5F7]" : "text-white"
                      }`}
                    >
                      {step.title}
                    </h3>
                    {step.isCompleted && (
                      <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                        Completed
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[#A7B0BC] leading-relaxed">{step.description}</p>
                </div>
              </div>

              <div className="shrink-0 self-end sm:self-center">
                <Link href={step.href}>
                  <Button
                    size="sm"
                    variant={step.isCompleted ? "outline" : "default"}
                    className={`text-xs flex items-center gap-1.5 ${
                      step.isCompleted
                        ? "border-[#29313B] bg-[#10151B] text-[#A7B0BC] hover:text-[#F3F5F7]"
                        : "bg-emerald-500 hover:bg-emerald-600 text-[#04130E] font-semibold"
                    }`}
                  >
                    <span>{step.actionLabel}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Helpful Links & Resources */}
      <Card className="p-6 bg-[#151A21] border-[#29313B] rounded-2xl space-y-4">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-[#A7B0BC] flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-emerald-400" />
          <span>Quick Assistance & Resources</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <Link
            href="/employee/calendar"
            className="p-3 bg-[#10151B] border border-[#1E2530] rounded-xl hover:border-[#364152] transition-colors flex items-center gap-2.5 text-[#F3F5F7]"
          >
            <Calendar className="w-4 h-4 text-[#D6B779]" />
            <div>
              <div className="font-semibold">Company Holidays</div>
              <div className="text-[11px] text-[#7E8997]">View annual paid holidays</div>
            </div>
          </Link>

          <Link
            href="/employee/documents"
            className="p-3 bg-[#10151B] border border-[#1E2530] rounded-xl hover:border-[#364152] transition-colors flex items-center gap-2.5 text-[#F3F5F7]"
          >
            <Shield className="w-4 h-4 text-[#67C5D8]" />
            <div>
              <div className="font-semibold">Employee Handbook</div>
              <div className="text-[11px] text-[#7E8997]">Security & compliance rules</div>
            </div>
          </Link>

          <Link
            href="/employee/support"
            className="p-3 bg-[#10151B] border border-[#1E2530] rounded-xl hover:border-[#364152] transition-colors flex items-center gap-2.5 text-[#F3F5F7]"
          >
            <HelpCircle className="w-4 h-4 text-emerald-400" />
            <div>
              <div className="font-semibold">Help & IT Support</div>
              <div className="text-[11px] text-[#7E8997]">Talk to People Ops or IT</div>
            </div>
          </Link>
        </div>
      </Card>
    </div>
  );
}
