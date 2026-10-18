import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { validateActiveUser } from "@/lib/auth/permissions";
import { handleApiError } from "@/lib/api-error";

export async function GET(req: NextRequest) {
  try {
    const userId = req.headers.get("x-user-id");
    const user = await validateActiveUser(userId);

    const [fullUser, attendanceCount, workReportCount, taskCount, documentCount] = await Promise.all([
      db.user.findUnique({
        where: { id: user.id },
        select: {
          name: true,
          email: true,
          phone: true,
          address: true,
          emergencyContact: true,
          employeeId: true,
          department: true,
          designation: true,
          joiningDate: true,
        },
      }),
      db.attendance.count({ where: { userId: user.id } }),
      db.workReport.count({ where: { userId: user.id } }),
      db.task.count({ where: { userId: user.id } }),
      db.document.count({ where: { isArchived: false } }),
    ]);

    const hasProfileDetails = Boolean(fullUser?.phone && fullUser?.address && fullUser?.emergencyContact);

    const steps = [
      {
        id: "profile",
        title: "Complete Personal & Emergency Profile",
        description: "Add your contact phone number, residential address, and emergency contact details.",
        isCompleted: hasProfileDetails,
        href: "/employee/profile",
        actionLabel: "Update Profile",
      },
      {
        id: "attendance",
        title: "Perform First Workday Check-In",
        description: "Log your daily presence and track active session hours on the Attendance dashboard.",
        isCompleted: attendanceCount > 0,
        href: "/employee/attendance",
        actionLabel: "Go to Attendance",
      },
      {
        id: "work-report",
        title: "Submit First Daily Work Report (EOD)",
        description: "Summarize your day's achievements, hours worked, and roadmap next steps.",
        isCompleted: workReportCount > 0,
        href: "/employee/work-reports",
        actionLabel: "Write Daily Report",
      },
      {
        id: "tasks",
        title: "Review Assigned Sprint Tasks",
        description: "Explore project deliverables assigned to you and update sprint progress.",
        isCompleted: taskCount > 0,
        href: "/employee/tasks",
        actionLabel: "View Assigned Tasks",
      },
      {
        id: "documents",
        title: "Read Employee Policies & Guidelines",
        description: "Familiarize yourself with Axivon Technologies employee handbook and standard processes.",
        isCompleted: documentCount > 0,
        href: "/employee/documents",
        actionLabel: "Browse Documents",
      },
      {
        id: "security",
        title: "Secure Account Credentials",
        description: "Ensure your login credentials and personal passwords meet corporate security standards.",
        isCompleted: true,
        href: "/employee/settings",
        actionLabel: "Security Settings",
      },
    ];

    const completedSteps = steps.filter((s) => s.isCompleted).length;
    const progressPercent = Math.round((completedSteps / steps.length) * 100);

    return NextResponse.json({
      success: true,
      user: {
        name: fullUser?.name || user.name,
        email: fullUser?.email || user.email,
        employeeId: fullUser?.employeeId || "AXV-EMP",
        department: fullUser?.department || user.department,
        designation: fullUser?.designation || user.designation,
        joiningDate: fullUser?.joiningDate,
      },
      steps,
      totalSteps: steps.length,
      completedSteps,
      progressPercent,
    });
  } catch (e) {
    return handleApiError(e);
  }
}
