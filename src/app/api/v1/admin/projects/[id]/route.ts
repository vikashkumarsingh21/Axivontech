import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { validateActiveUser } from "@/lib/auth/permissions";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = req.headers.get("x-user-id");
    const admin = await validateActiveUser(userId);
    const { id } = await params;

    const body = await req.json();
    const { name, description, status, startDate, endDate } = body;

    const existing = await db.project.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const updated = await db.project.update({
      where: { id },
      data: {
        ...(name && { name: name.trim() }),
        ...(description !== undefined && { description: description ? String(description).trim() : null }),
        ...(status && { status }),
        ...(startDate !== undefined && { startDate: startDate ? new Date(startDate) : null }),
        ...(endDate !== undefined && { endDate: endDate ? new Date(endDate) : null }),
      },
    });

    await db.auditLog.create({
      data: {
        userId: admin.id,
        action: "PROJECT_UPDATED",
        resource: `Project:${id}`,
        details: { updatedFields: Object.keys(body) },
      },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: error.status || 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = req.headers.get("x-user-id");
    const admin = await validateActiveUser(userId);
    const { id } = await params;

    const existing = await db.project.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    await db.$transaction([
      db.task.updateMany({ where: { projectId: id }, data: { projectId: null } }),
      db.projectMember.deleteMany({ where: { projectId: id } }),
      db.project.delete({ where: { id } }),
    ]);

    await db.auditLog.create({
      data: {
        userId: admin.id,
        action: "PROJECT_DELETED",
        resource: `Project:${id}`,
        details: { projectName: existing.name },
      },
    });

    return NextResponse.json({ success: true, message: `Project "${existing.name}" deleted.` });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: error.status || 500 });
  }
}
