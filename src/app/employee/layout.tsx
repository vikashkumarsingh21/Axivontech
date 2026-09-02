import { EmployeeSidebar } from "@/components/portal/EmployeeSidebar";
import { EmployeeNavbar } from "@/components/portal/EmployeeNavbar";

export default function EmployeeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen overflow-hidden bg-[#050505] text-gray-200">
      <EmployeeSidebar />
      <div className="flex flex-col flex-1 overflow-hidden relative">
        <EmployeeNavbar />
        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          <div className="max-w-6xl mx-auto space-y-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
