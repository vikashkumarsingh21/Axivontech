import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requirePermission } from "@/lib/auth/permissions";
import { handleApiError, ApiError } from "@/lib/api-error";
import { z } from "zod";
import crypto from "crypto";

const replySchema = z.object({
  message: z.string().trim().max(3000).optional(),
  status: z.enum(["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"]).optional(),
});

export async function GET(
  req: NextRequest,
  props: { params: Promise<{ ticketId: string }> }
) {
  const { ticketId } = await props.params;
  try {
    const adminId = req.headers.get("x-user-id");
    if (!adminId) throw new ApiError(401, "Unauthorized");
    await requirePermission(adminId, "users:read");

    const settings = await db.organizationSetting.findMany({
      where: { key: { startsWith: "broker_support:" } },
    });

    for (const s of settings) {
      if (Array.isArray(s.value)) {
        const found = (s.value as any[]).find((t) => t.id === ticketId);
        if (found) {
          return NextResponse.json({ success: true, ticket: found });
        }
      }
    }

    throw new ApiError(404, "Support ticket not found.");
  } catch (error: any) {
    return handleApiError(error);
  }
}

export async function POST(
  req: NextRequest,
  props: { params: Promise<{ ticketId: string }> }
) {
  const { ticketId } = await props.params;
  try {
    const adminId = req.headers.get("x-user-id");
    if (!adminId) throw new ApiError(401, "Unauthorized");
    await requirePermission(adminId, "users:write");

    const body = await req.json().catch(() => ({}));
    const { message, status } = replySchema.parse(body);

    if (!message && !status) {
      throw new ApiError(400, "Provide a message reply or status update.");
    }

    const adminUser = await db.user.findUnique({
      where: { id: adminId },
      select: { id: true, name: true, email: true },
    });

    const settings = await db.organizationSetting.findMany({
      where: { key: { startsWith: "broker_support:" } },
    });

    let targetSettingKey: string | null = null;
    let targetSettingTickets: any[] = [];
    let targetTicket: any = null;

    for (const s of settings) {
      if (Array.isArray(s.value)) {
        const idx = (s.value as any[]).findIndex((t) => t.id === ticketId);
        if (idx !== -1) {
          targetSettingKey = s.key;
          targetSettingTickets = [...(s.value as any[])];
          targetTicket = targetSettingTickets[idx];
          break;
        }
      }
    }

    if (!targetTicket || !targetSettingKey) {
      throw new ApiError(404, "Support ticket not found.");
    }

    const nowIso = new Date().toISOString();

    if (message) {
      const reply = {
        id: `REP-${Date.now()}-${crypto.randomBytes(2).toString("hex")}`,
        senderId: adminId,
        senderName: adminUser?.name || "AXIVON Support Desk",
        senderRole: "ADMIN",
        message,
        createdAt: nowIso,
      };
      targetTicket.replies = targetTicket.replies || [];
      targetTicket.replies.push(reply);
    }

    if (status) {
      targetTicket.status = status;
    } else if (targetTicket.status === "OPEN") {
      targetTicket.status = "IN_PROGRESS";
    }

    targetTicket.updatedAt = nowIso;

    // Save updated tickets back to OrganizationSetting
    await db.organizationSetting.update({
      where: { key: targetSettingKey },
      data: { value: targetSettingTickets, updatedById: adminId },
    });

    // Notify broker user
    const brokerProfile = await db.brokerProfile.findUnique({
      where: { id: targetTicket.brokerProfileId },
      select: { userId: true },
    });

    if (brokerProfile?.userId) {
      await db.notification.create({
        data: {
          userId: brokerProfile.userId,
          type: "SYSTEM",
          title: `Support Ticket Update: ${targetTicket.subject}`,
          message: message ? `AXIVON Support: "${message.slice(0, 100)}${message.length > 100 ? "..." : ""}"` : `Your ticket is now ${targetTicket.status}.`,
          link: `/broker/support`,
        },
      }).catch(() => null);
    }

    // Write audit log
    await db.auditLog.create({
      data: {
        userId: adminId,
        action: "BROKER_SUPPORT_TICKET_REPLIED",
        resource: `SupportTicket:${ticketId}`,
        details: {
          ticketId,
          brokerProfileId: targetTicket.brokerProfileId,
          status: targetTicket.status,
          hasReply: !!message,
        },
      },
    }).catch(() => null);

    return NextResponse.json({
      success: true,
      ticket: targetTicket,
      message: "Ticket updated successfully.",
    });
  } catch (error: any) {
    return handleApiError(error);
  }
}
