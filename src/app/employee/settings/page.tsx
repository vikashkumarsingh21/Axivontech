"use client";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-white">Settings</h1>
      <Card className="p-6 bg-[#0a0a0a]">
        <h2 className="text-xl text-white mb-4">Account Preferences</h2>
        <p className="text-gray-400 mb-6">Settings are currently managed by your organization administrator.</p>
        <Button variant="outline" disabled>Change Password (Disabled)</Button>
      </Card>
    </div>
  );
}
