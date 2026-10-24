export function SkeletonCard({ className = "", rows = 3 }: { className?: string; rows?: number }) {
  return (
    <div className={`animate-pulse rounded-2xl bg-slate-900/80 border border-slate-800/80 p-5 space-y-3.5 shadow-sm ${className}`}>
      <div className="h-3.5 bg-slate-800/80 rounded-md w-1/3" />
      <div className="h-6 bg-slate-800 rounded-lg w-2/3" />
      {Array.from({ length: Math.max(0, rows - 2) }).map((_, i) => (
        <div
          key={i}
          className="h-3 bg-slate-800/60 rounded-md"
          style={{ width: `${Math.max(40, 90 - i * 15)}%` }}
        />
      ))}
    </div>
  );
}
