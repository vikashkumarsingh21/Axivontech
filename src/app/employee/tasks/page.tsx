"use client";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { CheckSquare, Calendar, AlertCircle, Loader2 } from "lucide-react";

export default function TasksPage() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = () => {
    setLoading(true);
    fetch("/api/v1/employee/tasks")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setTasks(data.tasks);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  const updateStatus = async (taskId: string, status: string) => {
    await fetch("/api/v1/employee/tasks", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ taskId, status }),
    });
    loadData();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12 text-gray-400 gap-3">
        <Loader2 className="animate-spin w-5 h-5 text-indigo-400" />
        <span>Loading tasks...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">My Tasks</h1>
        <p className="text-sm text-gray-400 mt-1">Track and update status of your assigned tasks</p>
      </div>

      {tasks.length === 0 ? (
        <Card className="p-8 text-center text-gray-500 bg-[#0a0a0c] border border-gray-800">
          No assigned tasks found.
        </Card>
      ) : (
        <div className="grid gap-4">
          {tasks.map((t: any) => (
            <Card
              key={t.id}
              className="p-4 sm:p-5 bg-[#0a0a0c] border border-gray-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl hover:border-gray-700 transition-all"
            >
              <div className="space-y-1.5 min-w-0 flex-1">
                <h3 className="text-white font-semibold text-base truncate">{t.title}</h3>
                {t.description && (
                  <p className="text-xs text-gray-400 line-clamp-2">{t.description}</p>
                )}
                <div className="flex flex-wrap items-center gap-2 pt-1 text-xs text-gray-400">
                  <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-gray-300">
                    Priority: <span className="font-medium text-white">{t.priority}</span>
                  </span>
                  {t.dueDate && (
                    <span className="flex items-center gap-1 text-gray-400">
                      <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                      Due: {new Date(t.dueDate).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                <span
                  className={`text-xs px-2.5 py-1 rounded-full font-semibold border ${
                    t.status === "COMPLETED"
                      ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                      : "bg-blue-500/10 text-blue-400 border-blue-500/30"
                  }`}
                >
                  {t.status}
                </span>
                {t.status !== "COMPLETED" && (
                  <Button
                    size="sm"
                    onClick={() => updateStatus(t.id, "COMPLETED")}
                    className="flex items-center gap-1.5"
                  >
                    <CheckSquare className="w-4 h-4" />
                    Complete
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
