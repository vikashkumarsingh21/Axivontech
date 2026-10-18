import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { validateActiveUser } from "@/lib/auth/permissions";
import { handleApiError, ApiError } from "@/lib/api-error";

export async function POST(req: NextRequest) {
  try {
    const userId = req.headers.get("x-user-id");
    const user = await validateActiveUser(userId);

    const body = await req.json().catch(() => ({}));
    const { subject, category, message, priority } = body;

    if (!subject?.trim() || !message?.trim()) {
      throw new ApiError(400, "Subject and inquiry message are required");
    }

    // Identify Admin / HR recipients
    const adminRoles = await db.userRole.findMany({
      where: {
        role: {
          name: { in: ["ADMIN", "SUPER_ADMIN", "FOUNDER", "HR"] },
        },
      },
      select: { userId: true },
    });

    const adminUserIds = Array.from(new Set(adminRoles.map((r) => r.userId))).filter(
      (id) => id !== user.id
    );

    // Create notifications for admins
    if (adminUserIds.length > 0) {
      await db.notification.createMany({
        data: adminUserIds.map((adminId) => ({
          userId: adminId,
          title: `[Support Desk] ${category || "General"}: ${subject.trim()}`,
          message: `${user.name} (${user.email}) submitted a support inquiry: "${message.trim()}"`,
          type: priority === "HIGH" ? "WARNING" : "INFO",
          metadata: {
            fromUserId: user.id,
            fromUserName: user.name,
            fromEmail: user.email,
            category: category || "General",
            priority: priority || "NORMAL",
          },
        })),
      });
    }

    // Confirmation notification to employee
    await db.notification.create({
      data: {
        userId: user.id,
        title: `Support Inquiry Received: ${subject.trim()}`,
        message: `Your inquiry under ${category || "General"} has been dispatched to HR & Technical Administration. Reference ID logged.`,
        type: "INFO",
      },
    });

    return NextResponse.json({
      success: true,
      message: "Your support request has been logged and assigned to the support desk.",
    });
  } catch (e) {
    return handleApiError(e);
  }
}
