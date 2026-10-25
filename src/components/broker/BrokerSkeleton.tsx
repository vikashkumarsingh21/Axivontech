import React from "react";

export function BrokerSkeletonCard({ className = "" }: { className?: string }) {
  return (
    <div className={`rounded-xl border border-[#22262D] bg-[#111317] p-5 animate-pulse ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="h-4 w-28 bg-[#1B2027] rounded" />
        <div className="h-6 w-14 bg-[#1B2027] rounded-full" />
      </div>
      <div className="h-8 w-36 bg-[#1B2027] rounded mb-2" />
      <div className="h-3 w-48 bg-[#1B2027] rounded" />
    </div>
  );
}

export function BrokerSkeletonMetrics({ count = 4 }: { count?: number }) {
  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-${count} gap-4`}>
      {Array.from({ length: count }).map((_, i) => (
        <BrokerSkeletonCard key={i} />
      ))}
    </div>
  );
}

export function BrokerSkeletonTable({
  rows = 5,
  cols = 5,
  className = "",
}: {
  rows?: number;
  cols?: number;
  className?: string;
}) {
  return (
    <div className={`rounded-xl border border-[#22262D] bg-[#111317] overflow-hidden ${className}`}>
      {/* Table Header */}
      <div className="px-5 py-3.5 border-b border-[#1E232B] flex items-center gap-4 bg-[#0E1013]">
        {Array.from({ length: cols }).map((_, idx) => (
          <div key={idx} className="h-3 bg-[#1B2027] rounded flex-1" />
        ))}
      </div>
      {/* Table Rows */}
      <div className="divide-y divide-[#1E232B] animate-pulse">
        {Array.from({ length: rows }).map((_, rIdx) => (
          <div key={rIdx} className="px-5 py-4 flex items-center gap-4">
            {Array.from({ length: cols }).map((_, cIdx) => (
              <div
                key={cIdx}
                className="h-4 bg-[#171A1F] rounded flex-1"
                style={{ width: `${Math.floor(60 + ((rIdx * 17 + cIdx * 23) % 40))}%` }}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export function BrokerSkeletonDetail({ className = "" }: { className?: string }) {
  return (
    <div className={`space-y-6 animate-pulse ${className}`}>
      <div className="h-8 w-64 bg-[#1B2027] rounded" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="h-48 bg-[#111317] border border-[#22262D] rounded-xl p-5" />
          <div className="h-64 bg-[#111317] border border-[#22262D] rounded-xl p-5" />
        </div>
        <div className="space-y-4">
          <div className="h-56 bg-[#111317] border border-[#22262D] rounded-xl p-5" />
          <div className="h-40 bg-[#111317] border border-[#22262D] rounded-xl p-5" />
        </div>
      </div>
    </div>
  );
}
