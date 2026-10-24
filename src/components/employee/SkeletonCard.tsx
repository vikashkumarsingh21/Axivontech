export function SkeletonCard({ className = "", rows = 3 }: { className?: string; rows?: number }) {
  return (
    <div className={`animate-pulse rounded-xl bg-[#111317] border border-[#1E2530] p-5 space-y-3 ${className}`}>
      <div className="h-3 bg-[#1E2530] rounded w-1/3" />
      <div className="h-5 bg-[#1E2530] rounded w-2/3" />
      {Array.from({ length: Math.max(0, rows - 2) }).map((_, i) => (
        <div
          key={i}
          className="h-3 bg-[#1E2530] rounded"
          style={{ width: `${Math.max(40, 90 - i * 15)}%` }}
        />
      ))}
    </div>
  );
}
