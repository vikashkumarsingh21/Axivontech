"use client";

import { useEffect, useState } from "react";
import {
  CalendarCheck,
  Calendar,
  Users,
  CheckCircle2,
  XCircle,
  Clock,
  Loader2,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Search,
} from "lucide-react";

interface AttendanceRecord {
  id: string;
  userId: string;
  date: string;
  checkIn: string | null;
  checkOut: string | null;
  status: string;
  notes: string | null;
  user: {
    id: string;
    name: string;
    email: string;
    designation: string | null;
  };
}

interface AbsentEmployee {
  id: string;
  name: string;
  email: string;
  designation: string | null;
}

export default function ManagerAttendancePage() {
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [departmentName, setDepartmentName] = useState<string>("");
  const [summary, setSummary] = useState({
    totalEmployees: 0,
    present: 0,
    absent: 0,
  });
  const [attendances, setAttendances] = useState<AttendanceRecord[]>([]);
  const [absentEmployees, setAbsentEmployees] = useState<AbsentEmployee[]>([]);
  const [activeTab, setActiveTab] = useState<"ALL" | "PRESENT" | "ABSENT">("ALL");
  const [search, setSearch] = useState("");

  const fetchAttendance = async (date: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/v1/manager/attendance?date=${date}`);
      const json = await res.json();
      if (json.success) {
        setDepartmentName(json.department || "");
        setSummary(json.summary || { totalEmployees: 0, present: 0, absent: 0 });
        setAttendances(json.attendances || []);
        setAbsentEmployees(json.absentEmployees || []);
      } else {
        setError(json.message || "Failed to load department attendance.");
      }
    } catch (err: any) {
      setError(err.message || "Network error loading attendance.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendance(selectedDate);
  }, [selectedDate]);

  const changeDateBy = (days: number) => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + days);
    setSelectedDate(d.toISOString().split("T")[0]);
  };

  const presentPercentage =
    summary.totalEmployees > 0
      ? Math.round((summary.present / summary.totalEmployees) * 100)
      : 0;

  const filteredPresent = attendances.filter(
    (a) =>
      a.user.name.toLowerCase().includes(search.toLowerCase()) ||
      a.user.email.toLowerCase().includes(search.toLowerCase())
  );

  const filteredAbsent = absentEmployees.filter(
    (e) =>
      e.name.toLowerCase().includes(search.toLowerCase()) ||
      e.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-md bg-indigo-600 text-white font-mono font-bold text-xs">
              {departmentName ? departmentName.slice(0, 4).toUpperCase() : "DEPT"}
            </span>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Workforce Presence
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Attendance Roster</h1>
          <p className="text-xs text-slate-600 mt-1">
            Monitor daily attendance, check-in timestamps, and absent team members for {departmentName}.
          </p>
        </div>

        {/* Date Selector Controls */}
        <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl p-1.5 shadow-xs">
          <button
            onClick={() => changeDateBy(-1)}
            className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-white transition-colors"
            title="Previous Day"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="bg-transparent border-none text-xs font-semibold text-slate-800 focus:outline-hidden"
          />

          <button
            onClick={() => changeDateBy(1)}
            className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-white transition-colors"
            title="Next Day"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          <button
            onClick={() => setSelectedDate(new Date().toISOString().split("T")[0])}
            className="px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-bold transition-colors ml-1"
          >
            Today
          </button>
        </div>
      </div>

      {/* Security Scope Notice */}
      <div className="p-4 rounded-xl bg-slate-100/80 border border-slate-200 flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
        <div className="text-xs text-slate-600 leading-relaxed">
          <strong className="text-slate-800">Department Scope Enforcement:</strong> Attendance records are strictly filtered for personnel belonging to <span className="font-semibold text-indigo-700">{departmentName}</span>. Other department rosters remain confidential.
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 block">Department Strength</span>
            <span className="text-2xl font-bold text-slate-900 mt-1 block">
              {summary.totalEmployees}
            </span>
            <span className="text-[11px] text-slate-400 mt-0.5 block">Total active members</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-100 text-slate-600">
            <Users className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 block">Present On Date</span>
            <span className="text-2xl font-bold text-emerald-600 mt-1 block">
              {summary.present}
            </span>
            <span className="text-[11px] text-emerald-600/90 font-medium mt-0.5 block">
              {presentPercentage}% attendance rate
            </span>
          </div>
          <div className="p-3 rounded-xl bg-emerald-50 text-emerald-600">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 block">Absent / Not Checked In</span>
            <span className="text-2xl font-bold text-rose-600 mt-1 block">
              {summary.absent}
            </span>
            <span className="text-[11px] text-rose-600/90 font-medium mt-0.5 block">
              Pending confirmation
            </span>
          </div>
          <div className="p-3 rounded-xl bg-rose-50 text-rose-600">
            <XCircle className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Filter and Tab Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab("ALL")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
              activeTab === "ALL"
                ? "bg-indigo-600 text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            All Personnel ({summary.totalEmployees})
          </button>
          <button
            onClick={() => setActiveTab("PRESENT")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
              activeTab === "PRESENT"
                ? "bg-emerald-600 text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            Present ({summary.present})
          </button>
          <button
            onClick={() => setActiveTab("ABSENT")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
              activeTab === "ABSENT"
                ? "bg-rose-600 text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            Absent ({summary.absent})
          </button>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20"
          />
        </div>
      </div>

      {loading ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-16 text-center space-y-3 shadow-xs">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mx-auto" />
          <h3 className="text-sm font-bold text-slate-900">Loading Attendance Data...</h3>
        </div>
      ) : error ? (
        <div className="bg-white border border-red-200 rounded-2xl p-10 text-center space-y-3 shadow-xs">
          <AlertTriangle className="w-10 h-10 text-red-500 mx-auto" />
          <h3 className="text-base font-bold text-slate-900">Error Loading Attendance</h3>
          <p className="text-xs text-slate-600 max-w-md mx-auto">{error}</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Present Table */}
          {(activeTab === "ALL" || activeTab === "PRESENT") && (
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <h3 className="text-sm font-bold text-slate-900">
                    Present Team Members ({filteredPresent.length})
                  </h3>
                </div>
                <span className="text-xs text-slate-500">Date: {selectedDate}</span>
              </div>

              {filteredPresent.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-500">
                  No present records logged for this date.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-100 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                        <th className="py-2.5 px-3">Team Member</th>
                        <th className="py-2.5 px-3">Designation</th>
                        <th className="py-2.5 px-3">Check-In</th>
                        <th className="py-2.5 px-3">Check-Out</th>
                        <th className="py-2.5 px-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs">
                      {filteredPresent.map((rec) => (
                        <tr key={rec.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="py-3 px-3">
                            <span className="font-semibold text-slate-900 block">{rec.user.name}</span>
                            <span className="text-[11px] text-slate-500 block">{rec.user.email}</span>
                          </td>
                          <td className="py-3 px-3 text-slate-600">
                            {rec.user.designation || "Department Specialist"}
                          </td>
                          <td className="py-3 px-3">
                            <span className="font-mono text-slate-800">
                              {rec.checkIn
                                ? new Date(rec.checkIn).toLocaleTimeString([], {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })
                                : "—"}
                            </span>
                          </td>
                          <td className="py-3 px-3">
                            <span className="font-mono text-slate-800">
                              {rec.checkOut
                                ? new Date(rec.checkOut).toLocaleTimeString([], {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })
                                : "Active On Duty"}
                            </span>
                          </td>
                          <td className="py-3 px-3">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              {rec.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Absent List */}
          {(activeTab === "ALL" || activeTab === "ABSENT") && (
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <XCircle className="w-4 h-4 text-rose-600" />
                  <h3 className="text-sm font-bold text-slate-900">
                    Absent / Not Logged In ({filteredAbsent.length})
                  </h3>
                </div>
                <span className="text-xs text-slate-500">Date: {selectedDate}</span>
              </div>

              {filteredAbsent.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-500">
                  All department personnel are accounted for!
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {filteredAbsent.map((emp) => (
                    <div
                      key={emp.id}
                      className="p-3.5 rounded-xl border border-rose-100 bg-rose-50/30 flex items-center justify-between"
                    >
                      <div>
                        <span className="text-xs font-bold text-slate-900 block">{emp.name}</span>
                        <span className="text-[11px] text-slate-500 block truncate max-w-[180px]">
                          {emp.email}
                        </span>
                        <span className="text-[10px] text-slate-400 block mt-0.5">
                          {emp.designation || "Staff"}
                        </span>
                      </div>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-700 uppercase">
                        Absent
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

