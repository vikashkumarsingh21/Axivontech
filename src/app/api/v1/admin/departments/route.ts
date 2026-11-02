import { NextRequest, NextResponse } from "next/server";
import { requirePermission } from "@/lib/auth/permissions";
import { handleApiError } from "@/lib/api-error";
import {
  listAllDepartments,
  createDepartment,
} from "@/lib/services/department.service";

export async function GET(req: NextRequest) {
  try {
    const actorId = req.headers.get("x-user-id");
    await requirePermission(actorId, "users:read");

    const { searchParams } = new URL(req.url);
    const includeInactive = searchParams.get("includeInactive") === "true";

    const departments = await listAllDepartments(includeInactive);

    return NextResponse.json({
      success: true,
      departments,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const actorId = req.headers.get("x-user-id");
    await requirePermission(actorId, "users:write");

    const body = await req.json();
    const department = await createDepartment(body, actorId);

    return NextResponse.json(
      {
        success: true,
        message: `Department "${department.name}" (${department.code}) created successfully.`,
        department,
      },
      { status: 201 }
    );
  } catch (error) {
    return handleApiError(error);
  }
}

