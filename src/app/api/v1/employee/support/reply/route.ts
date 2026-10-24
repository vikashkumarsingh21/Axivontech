import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { handleApiError, ApiError } from "@/lib/api-error";
import { requireEmployee } from "@/lib/api/foundation";

const replySchema = z.object({
  ticketId: z.string().min(1, "Ticket ID is required"),
  message: z
    .string()
    .trim()
    .min(1, "Reply message cannot be empty")
    .max(5000, "Reply message cannot exceed 5000 characters"),
  attachmentUrl: z.string().trim().url().optional().nullable(),
});

export async function POST(req: NextRequest) {
  try {
    const user = await requireEmployee(req);
    const body = await req.json().catch(() => ({}));

    const parsed = replySchema.safeParse(body);
    if (!parsed.success) {
      throw new ApiError(
        400,
        parsed.error.issues[0]?.message || "Invalid reply data",
        "VALIDATION_ERROR"
      );
    }

    const { ticketId, message, attachmentUrl } = parsed.data;

    const ticket = await db.supportTicket.findUnique({
      where: { id: ticketId },
    });

    if (!ticket) {
      throw new ApiError(404, "Support ticket not found");
    }

    if (ticket.userId !== user.id) {
      throw new ApiError(403, "You can only reply to your own support tickets");
    }

    const [reply] = await db.$transaction([
      db.supportTicketReply.create({
        data: {
          ticketId,
          userId: user.id,
          message,
          attachmentUrl: attachmentUrl || null,
          isStaffReply: false,
        },
        include: {
          user: { select: { id: true, name: true, avatarUrl: true } },
        },
      }),
      // If ticket was closed or resolved, reopen it on user reply
      db.supportTicket.update({
        where: { id: ticketId },
        data: {
          status: ticket.status === "CLOSED" ? "OPEN" : ticket.status,
          updatedAt: new Date(),
        },
      }),
    ]);

    // Notify assigned staff or admins
    try {
      const recipientIds = ticket.assignedToId
        ? [ticket.assignedToId]
        : (
            await db.user.findMany({
              where: {
                role: { in: ["ADMIN", "FOUNDER", "CO_FOUNDER"] },
                status: "ACTIVE",
              },
              select: { id: true },
            })
          ).map((u) => u.id);

      if (recipientIds.length > 0) {
        await db.notification.createMany({
          data: recipientIds.map((rId) => ({
            userId: rId,
            type: "TICKET_REPLY",
            title: `Reply on Ticket ${ticket.ticketNumber}`,
            message: `${user.name}: "${message.slice(0, 100)}${message.length > 100 ? '...' : ''}"`,
            link: "/admin/support",
          })),
        });
      }
    } catch {}

    return NextResponse.json(
      {
        success: true,
        reply,
        message: "Reply sent successfully",
      },
      { status: 201 }
    );
  } catch (e) {
    return handleApiError(e);
  }
}
