export default function EmployeeLoading() {
  return (
    <div className="space-y-6 max-w-7xl animate-pulse">
      <div className="flex justify-between items-end mb-6">
        <div className="space-y-2">
          <div className="h-8 w-48 bg-[#151A21] border border-[#29313B] rounded-lg" />
          <div className="h-4 w-64 bg-[#151A21] rounded-lg" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="bg-[#151A21] border border-[#29313B] rounded-xl p-5 h-32 flex flex-col justify-between"
          >
            <div className="h-4 w-24 bg-[#1B222B] rounded-md" />
            <div className="h-8 w-16 bg-[#10151B] rounded-md" />
          </div>
        ))}
      </div>
    </div>
  );
}
