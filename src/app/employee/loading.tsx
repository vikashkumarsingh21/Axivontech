export default function EmployeeLoading() {
  return (
    <div className="space-y-6 max-w-7xl animate-pulse">
      <div className="flex justify-between items-end mb-6">
        <div className="space-y-2">
          <div className="h-8 w-48 bg-[#1A1A1B] border border-[#2E2E30] rounded-lg" />
          <div className="h-4 w-64 bg-[#1A1A1B] rounded-lg" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="bg-[#1A1A1B] border border-[#2E2E30] rounded-xl p-5 h-32 flex flex-col justify-between"
          >
            <div className="h-4 w-24 bg-[#232324] rounded-md" />
            <div className="h-8 w-16 bg-[#232324] rounded-md" />
          </div>
        ))}
      </div>
    </div>
  );
}
