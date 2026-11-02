import { NextRequest, NextResponse } from "next/server";
import { requirePermission } from "@/lib/auth/permissions";
import { handleApiError } from "@/lib/api-error";
import {
  createDepartmentManagerAccount,
  updateDepartment,
} from "@/lib/services/department.service";

export async function POST(
  req: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
  try {
    const actorId = req.headers.get("x-user-id");
    await requirePermission(actorId, "users:write");

    const body = await req.json();
    const result = await createDepartmentManagerAccount(
      {
        ...body,
        departmentId: params.id,
      },
      actorId
    );

    return NextResponse.json(
      {
        success: true,
        message: `Department Manager account for ${result.manager.name} (${result.department.name}) created successfully.`,
        ...result,
      },
      { status: 201 }
    );
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(
  req: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
  try {
    const actorId = req.headers.get("x-user-id");
    await requirePermission(actorId, "users:write");

    const updated = await updateDepartment(params.id, { managerId: null }, actorId);

    return NextResponse.json({
      success: true,
      message: `Manager assignment for department "${updated.name}" has been revoked.`,
      department: updated,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

