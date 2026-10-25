import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requirePermission } from "@/lib/auth/permissions";
import { handleApiError, ApiError } from "@/lib/api-error";
import { z } from "zod";
import crypto from "crypto";

const noteSchema = z.object({
  note: z.string().trim().min(2, "Note must be at least 2 characters").max(3000),
});

export async function GET(
  req: Request,
  props: { params: Promise<{ [key: string]: string }> }
) {
  const params = await props.params;
  try {
    const adminId = req.headers.get("x-user-id");
    if (!adminId) throw new ApiError(401, "Unauthorized");
    await requirePermission(adminId, "users:read");

    const identifier = params.id;
    const brokerUser = await db.user.findFirst({
      where: {
        OR: [
          { id: identifier },
          { brokerProfile: { id: identifier } },
          { brokerProfile: { partnerId: identifier } },
        ],
        userRoles: { some: { role: { name: { in: ["BUSINESS_PARTNER", "BROKER"] } } } },
      },
      select: { id: true },
    });

    if (!brokerUser) {
      throw new ApiError(404, "Broker not found.");
    }

    const settingKey = `broker_notes:${brokerUser.id}`;
    const setting = await db.organizationSetting.findUnique({
      where: { key: settingKey },
    });

    const notes = Array.isArray(setting?.value) ? setting.value : [];
    return NextResponse.json({ success: true, notes });
  } catch (error: any) {
    return handleApiError(error);
  }
}

export async function POST(
  req: Request,
  props: { params: Promise<{ [key: string]: string }> }
) {
  const params = await props.params;
  try {
    const adminId = req.headers.get("x-user-id");
    if (!adminId) throw new ApiError(401, "Unauthorized");
    await requirePermission(adminId, "users:write");

    const identifier = params.id;
    const body = await req.json().catch(() => ({}));
    const { note } = noteSchema.parse(body);

    const brokerUser = await db.user.findFirst({
      where: {
        OR: [
          { id: identifier },
          { brokerProfile: { id: identifier } },
          { brokerProfile: { partnerId: identifier } },
        ],
        userRoles: { some: { role: { name: { in: ["BUSINESS_PARTNER", "BROKER"] } } } },
      },
      select: { id: true, name: true, email: true },
    });

    if (!brokerUser) {
      throw new ApiError(404, "Broker not found.");
    }

    const admin = await db.user.findUnique({
      where: { id: adminId },
      select: { name: true, email: true },
    });

    const settingKey = `broker_notes:${brokerUser.id}`;
    const setting = await db.organizationSetting.findUnique({
      where: { key: settingKey },
    });

    const currentNotes = Array.isArray(setting?.value) ? (setting.value as any[]) : [];
    const newNote = {
      id: `BNOTE-${Date.now()}-${crypto.randomBytes(2).toString("hex")}`,
      note,
      authorId: adminId,
      authorName: admin?.name || admin?.email || "Admin",
      createdAt: new Date().toISOString(),
    };

    const updatedNotes = [newNote, ...currentNotes];

    await db.organizationSetting.upsert({
      where: { key: settingKey },
      update: { value: updatedNotes, updatedById: adminId },
      create: { key: settingKey, value: updatedNotes, updatedById: adminId },
    });

    await db.auditLog.create({
      data: {
        userId: adminId,
        action: "BROKER_NOTE_ADDED",
        resource: `User:${brokerUser.id}`,
        details: { noteId: newNote.id },
      },
    }).catch(() => null);

    return NextResponse.json({ success: true, note: newNote, notes: updatedNotes }, { status: 201 });
  } catch (error: any) {
    return handleApiError(error);
  }
}
