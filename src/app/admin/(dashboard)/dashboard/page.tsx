import DashboardHeader from "@/components/admin/dashboard/DashboardHeader";
import StatisticsGrid from "@/components/admin/dashboard/StatisticsGrid";
import DashboardCharts from "@/components/admin/dashboard/DashboardCharts";
import RecentActivity from "@/components/admin/dashboard/RecentActivity";
import LatestContactLeads from "@/components/admin/dashboard/LatestContactLeads";
import LatestCareers from "@/components/admin/dashboard/LatestCareers";
import SystemStatus from "@/components/admin/dashboard/SystemStatus";

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      {/* Dashboard Header */}
      <DashboardHeader />

      {/* Statistics */}
      <StatisticsGrid />

      {/* Analytics Charts */}
      <DashboardCharts />

      {/* Activity & Contact Leads */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <RecentActivity />
        <LatestContactLeads />
      </div>

      {/* Careers & System Status */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <LatestCareers />
        <SystemStatus />
      </div>
    </div>
  );
}