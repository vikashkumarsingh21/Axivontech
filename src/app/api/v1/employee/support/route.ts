import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { handleApiError, ApiError } from "@/lib/api-error";
import { requireEmployee, checkIdempotency } from "@/lib/api/foundation";

const createTicketSchema = z.object({
  subject: z
    .string()
    .trim()
    .min(5, "Subject must be at least 5 characters")
    .max(200, "Subject cannot exceed 200 characters"),
  message: z
    .string()
    .trim()
    .min(10, "Inquiry message must be at least 10 characters")
    .max(5000, "Message cannot exceed 5000 characters"),
  category: z.string().trim().optional().default("TECHNICAL"),
  priority: z.enum(["LOW", "NORMAL", "HIGH", "URGENT"]).optional().default("NORMAL"),
  attachmentUrl: z.string().trim().url().optional().nullable(),
});

const patchTicketSchema = z.object({
  ticketId: z.string().min(1, "Ticket ID is required"),
  action: z.enum(["CLOSE", "REOPEN"]),
});

export async function GET(req: NextRequest) {
  try {
    const user = await requireEmployee(req);
    const { searchParams } = new URL(req.url);

    const status = searchParams.get("status");
    const category = searchParams.get("category");
    const search = searchParams.get("search")?.trim();

    const where: any = { userId: user.id };

    if (status && status !== "ALL") {
      where.status = status;
    }
    if (category && category !== "ALL") {
      where.category = { contains: category, mode: "insensitive" };
    }
    if (search) {
      where.OR = [
        { ticketNumber: { contains: search, mode: "insensitive" } },
        { subject: { contains: search, mode: "insensitive" } },
        { message: { contains: search, mode: "insensitive" } },
      ];
    }

    const [tickets, allUserTickets] = await Promise.all([
      db.supportTicket.findMany({
        where,
        include: {
          assignedTo: { select: { id: true, name: true, email: true } },
          replies: {
            include: {
              user: { select: { id: true, name: true, avatarUrl: true, role: true } },
            },
            orderBy: { createdAt: "asc" },
          },
        },
        orderBy: { createdAt: "desc" },
      }),
      db.supportTicket.findMany({
        where: { userId: user.id },
        select: { status: true },
      }),
    ]);

    const counts = {
      total: allUserTickets.length,
      open: allUserTickets.filter((t) => t.status === "OPEN").length,
      inProgress: allUserTickets.filter((t) => t.status === "IN_PROGRESS").length,
      resolved: allUserTickets.filter((t) => t.status === "RESOLVED").length,
      closed: allUserTickets.filter((t) => t.status === "CLOSED").length,
    };

    return NextResponse.json({
      success: true,
      tickets,
      data: tickets,
      meta: { counts },
    });
  } catch (e) {
    return handleApiError(e);
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireEmployee(req);
    const body = await req.json().catch(() => ({}));

    // Normalize category mapping
    let rawCategory = (body.category || "TECHNICAL").toUpperCase();
    if (rawCategory.includes("TECH")) rawCategory = "TECHNICAL";
    else if (rawCategory.includes("HR") || rawCategory.includes("LEAVE")) rawCategory = "HR";
    else if (rawCategory.includes("PAY") || rawCategory.includes("BILL")) rawCategory = "PAYROLL";
    else if (rawCategory.includes("ACCESS") || rawCategory.includes("VPN")) rawCategory = "ACCESS";

    const parsed = createTicketSchema.safeParse({
      ...body,
      category: rawCategory,
    });

    if (!parsed.success) {
      throw new ApiError(
        400,
        parsed.error.issues[0]?.message || "Invalid support ticket data",
        "VALIDATION_ERROR"
      );
    }

    const { subject, message, category, priority, attachmentUrl } = parsed.data;

    // Double submit protection
    const idempotencyKey = `ticket:${user.id}:${subject.slice(0, 30)}`;
    if (!checkIdempotency(idempotencyKey, 4000)) {
      throw new ApiError(
        429,
        "A duplicate support request is already processing. Please wait.",
        "DUPLICATE_SUBMISSION"
      );
    }

    // Generate unique ticket number
    const randomSuffix = Math.floor(100 + Math.random() * 900);
    const ticketNumber = `TICK-${Date.now().toString().slice(-6)}-${randomSuffix}`;

    const ticket = await db.supportTicket.create({
      data: {
        ticketNumber,
        userId: user.id,
        category,
        priority,
        subject,
        message,
        attachmentUrl: attachmentUrl || null,
        status: "OPEN",
      },
    });

    // Notify Admins
    try {
      const admins = await db.user.findMany({
        where: {
          role: { in: ["ADMIN", "FOUNDER", "CO_FOUNDER"] },
          status: "ACTIVE",
        },
        select: { id: true },
      });

      if (admins.length > 0) {
        await db.notification.createMany({
          data: admins.map((admin) => ({
            userId: admin.id,
            title: `[Support Ticket ${ticketNumber}] ${category}: ${subject}`,
            message: `${user.name} submitted ticket ${ticketNumber}: "${message.slice(0, 100)}${message.length > 100 ? '...' : ''}"`,
            type: priority === "HIGH" || priority === "URGENT" ? "WARNING" : "INFO",
            link: "/admin/support",
          })),
        });
      }

      // Confirmation notification to employee
      await db.notification.create({
        data: {
          userId: user.id,
          title: `Support Ticket Created: ${ticketNumber}`,
          message: `Your inquiry under ${category} has been logged (${subject}). Our team will review it shortly.`,
          type: "INFO",
          link: "/employee/support",
        },
      });

      const { EventBus } = await import("@/lib/events/bus").catch(() => ({ EventBus: null }));
      if (EventBus) {
        await EventBus.emit({
          eventType: "SUPPORT_TICKET_CREATED",
          actorId: user.id,
          entityType: "SUPPORT_TICKET",
          entityId: ticket.id,
          title: `Support Ticket: ${ticketNumber}`,
          message: `${user.name} logged ticket ${ticketNumber} (${category}): ${subject}`,
          metadata: { ticketNumber, category, priority, ticketId: ticket.id },
        }).catch(() => {});
      }
    } catch (err) {
      console.error("[Support Notification Error]:", err);
    }

    return NextResponse.json(
      {
        success: true,
        ticket,
        message: `Your support request has been logged successfully as ${ticketNumber}.`,
      },
      { status: 201 }
    );
  } catch (e) {
    return handleApiError(e);
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const user = await requireEmployee(req);
    const body = await req.json().catch(() => ({}));

    const parsed = patchTicketSchema.safeParse(body);
    if (!parsed.success) {
      throw new ApiError(
        400,
        parsed.error.issues[0]?.message || "Invalid ticket update payload",
        "VALIDATION_ERROR"
      );
    }

    const { ticketId, action } = parsed.data;

    const ticket = await db.supportTicket.findUnique({
      where: { id: ticketId },
    });

    if (!ticket) throw new ApiError(404, "Support ticket not found");
    if (ticket.userId !== user.id) {
      throw new ApiError(403, "You can only update your own support tickets");
    }

    let newStatus = ticket.status;
    let closedAt = ticket.closedAt;

    if (action === "CLOSE") {
      newStatus = "CLOSED";
      closedAt = new Date();
    } else if (action === "REOPEN") {
      newStatus = "OPEN";
      closedAt = null;
    }

    const updated = await db.supportTicket.update({
      where: { id: ticketId },
      data: {
        status: newStatus,
        closedAt,
      },
    });

    return NextResponse.json({
      success: true,
      ticket: updated,
      message: `Support ticket ${action === "CLOSE" ? "closed" : "reopened"} successfully.`,
    });
  } catch (e) {
    return handleApiError(e);
  }
}
