import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requirePermission } from "@/lib/auth/permissions";
import { handleApiError, ApiError } from "@/lib/api-error";
import { z } from "zod";

export async function GET(
  req: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const adminId = req.headers.get("x-user-id");
    await requirePermission(adminId, "users:read");
    const { id } = await props.params;

    const team = await db.partnerProjectMember.findMany({
      where: { partnerProjectId: id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true,
            department: true,
            designation: true,
          }
        }
      }
    });

    return NextResponse.json({ data: team });
  } catch (error) {
    return handleApiError(error);
  }
}

const AssignMemberSchema = z.object({
  userId: z.string().min(1),
  role: z.string().min(1).default("MEMBER"),
});

export async function POST(
  req: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const adminId = req.headers.get("x-user-id");
    await requirePermission(adminId, "users:write");
    const { id } = await props.params;

    const body = await req.json();
    const parsed = AssignMemberSchema.safeParse(body);
    if (!parsed.success) {
      throw new ApiError(400, "Invalid payload");
    }
    const { userId, role } = parsed.data;

    const project = await db.partnerProject.findUnique({ where: { id } });
    if (!project) throw new ApiError(404, "Project not found");

    const member = await db.partnerProjectMember.upsert({
      where: {
        partnerProjectId_userId: {
          partnerProjectId: id,
          userId,
        }
      },
      update: { role },
      create: {
        partnerProjectId: id,
        userId,
        role,
      },
      include: {
        user: {
          select: { id: true, name: true, email: true }
        }
      }
    });

    if (adminId) {
      await db.auditLog.create({
        data: {
          userId: adminId,
          action: "PARTNER_PROJECT_MEMBER_ASSIGNED",
          resource: "PartnerProject",
          details: { partnerProjectId: id, assignedUserId: userId, role },
        }
      });
    }

    return NextResponse.json({ data: member });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(
  req: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const adminId = req.headers.get("x-user-id");
    await requirePermission(adminId, "users:write");
    const { id } = await props.params;

    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    if (!userId) throw new ApiError(400, "userId is required");

    await db.partnerProjectMember.delete({
      where: {
        partnerProjectId_userId: {
          partnerProjectId: id,
          userId,
        }
      }
    });

    if (adminId) {
      await db.auditLog.create({
        data: {
          userId: adminId,
          action: "PARTNER_PROJECT_MEMBER_REMOVED",
          resource: "PartnerProject",
          details: { partnerProjectId: id, removedUserId: userId },
        }
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}
