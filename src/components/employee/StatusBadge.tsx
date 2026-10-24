const variants = {
  success: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  error: "bg-red-500/10 text-red-400 border-red-500/20",
  warning: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  info: "bg-[var(--ep-accent-soft)] text-[#5FA8A0] border-[var(--ep-accent-border)]",
  neutral: "bg-[#171A1F] text-[#8B94A1] border-[#22262D]",
  purple: "bg-purple-500/10 text-purple-400 border-purple-500/20",
};

export function StatusBadge({ 
  children, 
  variant = "neutral" 
}: { 
  children: React.ReactNode; 
  variant?: keyof typeof variants 
}) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${variants[variant]}`}>
      {children}
    </span>
  );
}
