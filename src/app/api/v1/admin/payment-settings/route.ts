import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requirePermission } from "@/lib/auth/permissions";
import { handleApiError, ApiError } from "@/lib/api-error";

export async function GET(req: Request) {
  try {
    const userId = req.headers.get("x-user-id");
    await requirePermission(userId, "users:read");

    const settings = await db.paymentSettings.findMany({
      include: { updatedBy: { select: { name: true } } },
      orderBy: { type: "asc" },
    });

    return NextResponse.json({ data: settings });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(req: Request) {
  try {
    const userId = req.headers.get("x-user-id");
    await requirePermission(userId, "users:write");

    const body = await req.json();
    const { type, isActive, accountHolderName, bankName, accountNumber, ifscCode, branch, accountType, upiId, upiName, qrCodeUrl } = body;

    if (!type || (type !== "BANK" && type !== "UPI")) {
      throw new ApiError(400, "Type must be BANK or UPI.");
    }

    // Upsert: find existing active setting of this type, or create new
    const existing = await db.paymentSettings.findFirst({ where: { type } });

    let settings;
    if (existing) {
      settings = await db.paymentSettings.update({
        where: { id: existing.id },
        data: {
          isActive: isActive !== undefined ? isActive : true,
          accountHolderName: type === "BANK" ? accountHolderName || null : existing.accountHolderName,
          bankName: type === "BANK" ? bankName || null : existing.bankName,
          accountNumber: type === "BANK" ? accountNumber || null : existing.accountNumber,
          ifscCode: type === "BANK" ? ifscCode || null : existing.ifscCode,
          branch: type === "BANK" ? branch || null : existing.branch,
          accountType: type === "BANK" ? accountType || null : existing.accountType,
          upiId: type === "UPI" ? upiId || null : existing.upiId,
          upiName: type === "UPI" ? upiName || null : existing.upiName,
          qrCodeUrl: type === "UPI" ? qrCodeUrl || null : existing.qrCodeUrl,
          updatedById: userId,
        },
      });
    } else {
      settings = await db.paymentSettings.create({
        data: {
          type,
          isActive: isActive !== undefined ? isActive : true,
          accountHolderName: accountHolderName || null,
          bankName: bankName || null,
          accountNumber: accountNumber || null,
          ifscCode: ifscCode || null,
          branch: branch || null,
          accountType: accountType || null,
          upiId: upiId || null,
          upiName: upiName || null,
          qrCodeUrl: qrCodeUrl || null,
          updatedById: userId,
        },
      });
    }

    await db.auditLog.create({
      data: { userId, action: "PAYMENT_SETTINGS_UPDATED", resource: "PaymentSettings", details: { type, settingsId: settings.id } },
    });

    return NextResponse.json({ data: settings });
  } catch (error) {
    return handleApiError(error);
  }
}
