export function SkeletonCard({ className = "" }: { className?: string }) {
  return (
    <div className={`animate-pulse rounded-xl bg-[#111317] border border-[#1E2530] p-5 ${className}`}>
      <div className="h-3 bg-[#1E2530] rounded w-1/3 mb-3" />
      <div className="h-6 bg-[#1E2530] rounded w-2/3 mb-2" />
      <div className="h-3 bg-[#1E2530] rounded w-1/2" />
    </div>
  );
}
