import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import {
  requireBroker,
  checkRateLimit,
  logBrokerAudit,
  notifyAdmins,
  apiSuccess,
  handleApiError,
  ApiError,
} from "@/lib/api/broker";

const createTicketSchema = z.object({
  subject: z.string().trim().min(3, "Subject must be at least 3 characters.").max(150),
  category: z.string().min(1, "Select a valid support category."),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).optional().default("MEDIUM"),
  message: z.string().trim().min(10, "Message must be at least 10 characters.").max(2000),
});

export async function GET(req: NextRequest) {
  try {
    const { brokerProfile } = await requireBroker(req);
    const settingKey = `broker_support:${brokerProfile.id}`;

    const setting = await db.organizationSetting.findUnique({
      where: { key: settingKey },
    });

    const tickets: any[] = Array.isArray(setting?.value) ? (setting.value as any[]) : [];
    tickets.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

    return apiSuccess({
      tickets,
      total: tickets.length,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const { brokerProfile, session, user } = await requireBroker(req);

    // Rate limit: max 5 tickets per 10 minutes
    checkRateLimit(req, "create-support-ticket", 5, 600);

    const body = await req.json().catch(() => ({}));
    const validated = createTicketSchema.safeParse(body);
    if (!validated.success) {
      throw new ApiError(400, validated.error.issues[0]?.message || "Invalid ticket data.");
    }

    const { subject, category, priority, message } = validated.data;
    const ticketId = `SPT-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;

    const newTicket = {
      id: ticketId,
      brokerProfileId: brokerProfile.id,
      brokerName: user.name,
      brokerEmail: user.email,
      subject,
      category,
      priority,
      status: "OPEN",
      message,
      replies: [
        {
          id: `REP-${Date.now()}-1`,
          senderId: session.userId,
          senderName: user.name,
          senderRole: "BROKER",
          message,
          createdAt: new Date().toISOString(),
        },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const settingKey = `broker_support:${brokerProfile.id}`;
    const setting = await db.organizationSetting.findUnique({
      where: { key: settingKey },
    });

    const existingTickets: any[] = Array.isArray(setting?.value) ? (setting.value as any[]) : [];
    existingTickets.unshift(newTicket);

    await db.organizationSetting.upsert({
      where: { key: settingKey },
      create: {
        key: settingKey,
        value: existingTickets,
      },
      update: {
        value: existingTickets,
      },
    });

    await logBrokerAudit(
      session.userId,
      "SUPPORT_TICKET_CREATED",
      "SupportTicket",
      { ticketId, subject, category, priority }
    );

    await notifyAdmins({
      title: "New Partner Support Request",
      message: `Broker ${user.name} submitted ticket ${ticketId}: "${subject}" [${category}]`,
      link: `/admin/crm/partners`,
    });

    return apiSuccess({
      ticket: newTicket,
      message: "Support ticket registered. Our partner relations team typically responds within 24 hours.",
    });
  } catch (error) {
    return handleApiError(error);
  }
}
