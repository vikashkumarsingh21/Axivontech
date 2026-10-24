import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import {
  requireBroker,
  notifyAdmins,
  logBrokerAudit,
  apiSuccess,
  handleApiError,
  ApiError,
} from "@/lib/api/broker";

const replySchema = z.object({
  message: z.string().trim().min(2, "Reply message cannot be empty.").max(2000),
});

export async function GET(
  req: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  const { id } = await props.params;
  try {
    const { brokerProfile } = await requireBroker(req);
    const settingKey = `broker_support:${brokerProfile.id}`;

    const setting = await db.organizationSetting.findUnique({
      where: { key: settingKey },
    });

    const tickets: any[] = Array.isArray(setting?.value) ? (setting.value as any[]) : [];
    const ticket = tickets.find((t) => t.id === id);

    if (!ticket) {
      throw new ApiError(404, "Support ticket not found.");
    }

    return apiSuccess({ ticket });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(
  req: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  const { id } = await props.params;
  try {
    const { brokerProfile, session, user } = await requireBroker(req);

    const body = await req.json().catch(() => ({}));
    const validated = replySchema.safeParse(body);
    if (!validated.success) {
      throw new ApiError(400, validated.error.errors[0]?.message || "Invalid reply");
    }

    const { message } = validated.data;
    const settingKey = `broker_support:${brokerProfile.id}`;

    const setting = await db.organizationSetting.findUnique({
      where: { key: settingKey },
    });

    const tickets: any[] = Array.isArray(setting?.value) ? (setting.value as any[]) : [];
    const ticketIndex = tickets.findIndex((t) => t.id === id);

    if (ticketIndex === -1) {
      throw new ApiError(404, "Support ticket not found.");
    }

    const newReply = {
      id: `REP-${Date.now()}-${Math.floor(10 + Math.random() * 90)}`,
      senderId: session.userId,
      senderName: user.name,
      senderRole: "BROKER",
      message,
      createdAt: new Date().toISOString(),
    };

    tickets[ticketIndex].replies.push(newReply);
    tickets[ticketIndex].updatedAt = new Date().toISOString();
    if (tickets[ticketIndex].status === "RESOLVED" || tickets[ticketIndex].status === "CLOSED") {
      tickets[ticketIndex].status = "OPEN"; // reopen upon broker reply
    }

    await db.organizationSetting.update({
      where: { key: settingKey },
      data: { value: tickets },
    });

    await notifyAdmins({
      title: `Reply on Partner Ticket ${id}`,
      message: `Broker ${user.name} posted a reply on ticket ${id}: "${message.slice(0, 80)}..."`,
      link: `/admin/crm/partners`,
    });

    return apiSuccess({
      reply: newReply,
      ticket: tickets[ticketIndex],
      message: "Reply sent successfully.",
    });
  } catch (error) {
    return handleApiError(error);
  }
}
