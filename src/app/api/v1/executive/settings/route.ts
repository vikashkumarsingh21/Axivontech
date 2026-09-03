import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requirePermission } from "@/lib/auth/permissions";
import { handleApiError } from "@/lib/api-error";

export async function GET(req: Request) {
  try {
    const userId = req.headers.get("x-user-id");
    await requirePermission(userId, "governance.settings.approve");

    const settings = await db.organizationSetting.findMany();
    return NextResponse.json({ data: settings });
  } catch (error: any) {
    return handleApiError(error);
  }
}

export async function PATCH(req: Request) {
  try {
    const userId = req.headers.get("x-user-id");
    await requirePermission(userId, "governance.settings.approve");

    const body = await req.json();
    const { key, value } = body;

    const setting = await db.organizationSetting.upsert({
      where: { key },
      update: { value, updatedById: userId },
      create: { key, value, updatedById: userId },
    });

    await db.auditLog.create({
      data: { userId, action: "ORGANIZATION_SETTING_UPDATED", resource: "OrganizationSetting", details: { key } },
    });

    return NextResponse.json({ data: setting });
  } catch (error: any) {
    return handleApiError(error);
  }
}
