import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requirePermission } from "@/lib/auth/permissions";
import { handleApiError, ApiError } from "@/lib/api-error";
import crypto from "crypto";

const noteSchema = z.object({
  note: z.string().trim().min(2, "Note must be at least 2 characters long").max(3000),
});

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = req.headers.get("x-user-id");
    if (!userId) throw new ApiError(401, "Unauthorized");
    await requirePermission(userId, "business_partner_application.view");

    const { id } = await params;
    const settingKey = `bpa_notes:${id}`;

    const setting = await db.organizationSetting.findUnique({
      where: { key: settingKey },
    });

    const notes = Array.isArray(setting?.value) ? (setting.value as any[]) : [];
    return NextResponse.json({ success: true, notes }, { status: 200 });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = req.headers.get("x-user-id");
    if (!userId) throw new ApiError(401, "Unauthorized");
    await requirePermission(userId, "business_partner_application.review");

    const { id } = await params;
    const body = await req.json().catch(() => ({}));
    const { note } = noteSchema.parse(body);

    const user = await db.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true },
    });

    const settingKey = `bpa_notes:${id}`;
    const setting = await db.organizationSetting.findUnique({
      where: { key: settingKey },
    });

    const currentNotes = Array.isArray(setting?.value) ? (setting.value as any[]) : [];
    const newNote = {
      id: `NOTE-${Date.now()}-${crypto.randomBytes(2).toString("hex")}`,
      note,
      authorId: userId,
      authorName: user?.name || user?.email || "Admin Staff",
      createdAt: new Date().toISOString(),
    };

    const updatedNotes = [newNote, ...currentNotes];

    await db.organizationSetting.upsert({
      where: { key: settingKey },
      update: { value: updatedNotes },
      create: { key: settingKey, value: updatedNotes },
    });

    // Write audit log
    await db.auditLog.create({
      data: {
        userId,
        action: "APPLICATION_INTERNAL_NOTE_ADDED",
        resource: `BusinessPartnerApplication:${id}`,
        details: { noteId: newNote.id },
      },
    }).catch(() => null);

    return NextResponse.json({ success: true, note: newNote, notes: updatedNotes }, { status: 201 });
  } catch (err) {
    return handleApiError(err);
  }
}
