import { NextRequest, NextResponse } from "next/server";
import { requirePermission } from "@/lib/auth/permissions";
import { handleApiError } from "@/lib/api-error";
import {
  getDepartmentById,
  updateDepartment,
} from "@/lib/services/department.service";

export async function GET(
  req: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
  try {
    const actorId = req.headers.get("x-user-id");
    await requirePermission(actorId, "users:read");

    const department = await getDepartmentById(params.id);

    return NextResponse.json({
      success: true,
      department,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(
  req: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
  try {
    const actorId = req.headers.get("x-user-id");
    await requirePermission(actorId, "users:write");

    const body = await req.json();
    const department = await updateDepartment(params.id, body, actorId);

    return NextResponse.json({
      success: true,
      message: `Department "${department.name}" updated successfully.`,
      department,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

