export default function BrokerLoading() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end mb-6">
        <div className="space-y-2">
          <div className="h-8 w-48 bg-white/5 rounded-lg animate-pulse" />
          <div className="h-4 w-64 bg-white/5 rounded-lg animate-pulse" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-[#111111] border border-white/10 rounded-xl p-5 h-32 animate-pulse flex flex-col justify-between">
            <div className="h-4 w-24 bg-white/5 rounded-md" />
            <div className="h-8 w-16 bg-white/10 rounded-md" />
          </div>
        ))}
      </div>
    </div>
  );
}
