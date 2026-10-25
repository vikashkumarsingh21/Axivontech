export function SkeletonCard({ className = "", rows = 3 }: { className?: string; rows?: number }) {
  return (
    <div className={`animate-pulse rounded-xl bg-[#1A1A1B] border border-[#2E2E30] p-5 space-y-3.5 shadow-xs ${className}`}>
      <div className="h-3.5 bg-[#232324] rounded-md w-1/3" />
      <div className="h-6 bg-[#28282A] rounded-lg w-2/3" />
      {Array.from({ length: Math.max(0, rows - 2) }).map((_, i) => (
        <div
          key={i}
          className="h-3 bg-[#232324] rounded-md"
          style={{ width: `${Math.max(40, 90 - i * 15)}%` }}
        />
      ))}
    </div>
  );
}
