"use client";

import { useState } from "react";
import { Search, Bell, ChevronDown } from "lucide-react";

interface NavbarProps {
  title?: string;
}

export default function Navbar({ title = "Dashboard" }: NavbarProps) {
  const [searchValue, setSearchValue] = useState("");

  return (
    <div className="flex h-full w-full items-center justify-between gap-4 bg-[#0F1115] px-6">
      <div className="flex min-w-0 shrink-0 flex-col justify-center">
        <h1 className="truncate text-base font-semibold text-white">
          {title}
        </h1>
        <span className="truncate text-xs text-[#B7BDC7]">
          Admin Panel
        </span>
      </div>

      <div className="hidden flex-1 justify-center md:flex">
        <div className="relative w-full max-w-md">
          <Search
            size={16}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#B7BDC7]"
          />
          <input
            type="text"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            placeholder="Search anything..."
            className="w-full rounded-full border border-[#2B323D] bg-[#1B212A] py-2 pl-9 pr-4 text-sm text-white placeholder:text-[#B7BDC7] outline-none transition-colors duration-200 focus:border-[#C08457]"
          />
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-3">
        <button
          type="button"
          className="group relative flex h-9 w-9 items-center justify-center rounded-full border border-[#2B323D] bg-[#1B212A] transition-colors duration-200 hover:border-[#C08457]"
        >
          <Bell
            size={17}
            className="text-[#B7BDC7] transition-colors duration-200 group-hover:text-white"
          />
          <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-[#C08457]" />
        </button>

        <button
          type="button"
          className="flex items-center gap-2 rounded-full border border-[#2B323D] bg-[#1B212A] py-1.5 pl-1.5 pr-3 transition-colors duration-200 hover:border-[#C08457]"
        >
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#C08457] text-xs font-semibold text-[#0F1115]">
            VK
          </div>
          <div className="hidden flex-col items-start leading-tight sm:flex">
            <span className="text-xs font-medium text-white">
              Vikas Kumar
            </span>
            <span className="text-[10px] text-[#B7BDC7]">Founder</span>
          </div>
          <ChevronDown size={14} className="text-[#B7BDC7]" />
        </button>
      </div>
    </div>
  );
}