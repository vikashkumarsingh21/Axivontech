"use client";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export default function TasksPage() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = () => {
    setLoading(true);
    fetch("/api/v1/employee/tasks").then(res => res.json()).then(data => {
      if(data.success) setTasks(data.tasks);
      setLoading(false);
    });
  };

  useEffect(() => { loadData(); }, []);

  const updateStatus = async (taskId: string, status: string) => {
    await fetch("/api/v1/employee/tasks", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ taskId, status })
    });
    loadData();
  };

  if (loading) return <div className="p-8 text-center text-gray-400">Loading tasks...</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-white">My Tasks</h1>
      {tasks.length === 0 ? (
        <Card className="p-8 text-center text-gray-500 bg-[#0a0a0a]">No assigned tasks.</Card>
      ) : (
        <div className="grid gap-4">
          {tasks.map((t: any) => (
            <Card key={t.id} className="p-4 bg-[#0a0a0a] flex justify-between items-center">
              <div>
                <h3 className="text-white font-medium">{t.title}</h3>
                <p className="text-sm text-gray-400">Priority: {t.priority} | Due: {t.dueDate ? new Date(t.dueDate).toLocaleDateString() : 'None'}</p>
              </div>
              <div className="flex gap-2 items-center">
                <span className="text-xs bg-white/10 px-2 py-1 rounded text-white">{t.status}</span>
                {t.status !== 'COMPLETED' && (
                  <Button size="sm" onClick={() => updateStatus(t.id, 'COMPLETED')}>Complete</Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
