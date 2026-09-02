"use client";

import { useEffect, useState } from "react";
import { Bell } from "lucide-react";

export function EmployeeNavbar() {
  const [userName, setUserName] = useState("Employee");

  useEffect(() => {
    // Optionally fetch /api/v1/employee/me here to show the user's name
    fetch("/api/v1/employee/me")
      .then(res => res.json())
      .then(data => {
        if (data?.user?.name) setUserName(data.user.name);
      })
      .catch(() => {});
  }, []);

  return (
    <header className="h-16 bg-[#0a0a0a] border-b border-white/5 flex items-center justify-between px-6 sticky top-0 z-20">
      <div className="flex items-center gap-4">
        {/* Mobile menu trigger could go here */}
      </div>

      <div className="flex items-center gap-6">
        <button className="relative text-gray-400 hover:text-white transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-0 right-0 w-2 h-2 bg-blue-500 rounded-full border border-[#0a0a0a]"></span>
        </button>

        <div className="flex items-center gap-3 pl-6 border-l border-white/10">
          <div className="w-8 h-8 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-sm">
            {userName.charAt(0).toUpperCase()}
          </div>
          <div className="hidden md:block text-sm">
            <p className="text-white font-medium">{userName}</p>
          </div>
        </div>
      </div>
    </header>
  );
}
