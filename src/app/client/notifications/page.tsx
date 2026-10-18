"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Bell,
  CheckCircle2,
  AlertCircle,
  Info,
  Clock,
  ArrowRight,
  ExternalLink,
  Check,
  Loader2,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";

interface NotificationItem {
  id: string;
  type: string;
  title: string;
  message: string;
  link?: string | null;
  isRead: boolean;
  createdAt: string;
}

export default function ClientNotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/v1/client/notifications");
      if (res.ok) {
        const json = await res.json();
        setNotifications(json.data || []);
      }
    } catch (err) {
      console.error("Error loading client notifications:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAsRead = async (id: string) => {
    try {
      const res = await fetch(`/api/v1/client/notifications/${id}/read`, {
        method: "PATCH",
      });
      if (res.ok) {
        setNotifications((prev) =>
          prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
        );
      }
    } catch (err) {
      console.error("Error marking notification as read:", err);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "SUCCESS":
        return <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />;
      case "WARNING":
        return <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />;
      case "INFO":
      default:
        return <Info className="w-4 h-4 text-blue-400 shrink-0" />;
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-[#F3F5F7] tracking-tight">
          Client Notification Feed
        </h1>
        <p className="text-sm text-[#7E8997] mt-0.5">
          Real-time alerts regarding milestone completions, UAT readiness, and project announcements.
        </p>
      </div>

      <Card className="bg-[#151A21] border-[#29313B]">
        <CardHeader className="border-b border-[#1E2530] pb-4">
          <CardTitle className="text-[#F3F5F7]">Recent Alerts & Activity</CardTitle>
          <CardDescription className="text-[#7E8997]">
            Chronological history of engagement dispatches.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-16 text-center text-sm text-[#7E8997]">
              Loading alerts...
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-8">
              <EmptyState
                icon={Bell}
                title="Zero Pending Notifications"
                description="You are completely up to date. Engagement updates will appear here."
              />
            </div>
          ) : (
            <div className="divide-y divide-[#1E2530]">
              {notifications.map((n) => (
                <div
                  key={n.id}
                  className={`p-4.5 flex items-start justify-between gap-4 transition-colors ${
                    n.isRead ? "bg-transparent" : "bg-emerald-500/[0.03]"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5">{getTypeIcon(n.type)}</div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs font-bold text-[#F3F5F7]">{n.title}</h4>
                        {!n.isRead && (
                          <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                        )}
                      </div>
                      <p className="text-xs text-[#7E8997] leading-relaxed">{n.message}</p>
                      <div className="flex items-center gap-3 text-[11px] text-[#566171] pt-1">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>{new Date(n.createdAt).toLocaleDateString()}</span>
                        </div>
                        {n.link && (
                          <Link
                            href={n.link}
                            className="text-emerald-400 hover:text-emerald-300 font-semibold inline-flex items-center gap-1"
                          >
                            <span>Open Link</span>
                            <ArrowRight className="w-3 h-3" />
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>

                  {!n.isRead && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleMarkAsRead(n.id)}
                      className="text-xs text-[#7E8997] hover:text-[#F3F5F7] shrink-0"
                    >
                      <Check className="w-3.5 h-3.5 mr-1" />
                      <span>Mark Read</span>
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
