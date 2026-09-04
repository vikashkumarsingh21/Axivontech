import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { handleApiError, ApiError } from "@/lib/api-error";
import { validateActiveUser } from "@/lib/auth/permissions";

export async function GET(req: NextRequest) {
  try {
    const userId = req.headers.get("x-user-id");
    const user = await validateActiveUser(userId);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const records = await db.attendance.findMany({
      where: { userId: user.id },
      orderBy: { date: "desc" },
      take: 60,
    });

    const todayRecord = records.find(
      (r) => new Date(r.date).getTime() === today.getTime()
    );

    const requiredMinutes = user.requiredDailyMinutes || 480;

    let isWorking = false;
    let currentWorkingMinutes = 0;
    let workedMinutes = 0;
    let checkInAt: Date | null = null;
    let checkOutAt: Date | null = null;
    let todayStatus = "NOT_STARTED";

    if (todayRecord) {
      checkInAt = todayRecord.checkInAt;
      checkOutAt = todayRecord.checkOutAt;

      if (!checkOutAt) {
        isWorking = true;
        todayStatus = "IN_PROGRESS";
        const elapsedMs = Math.max(0, Date.now() - new Date(checkInAt).getTime());
        const activeSessionMinutes = Math.floor(elapsedMs / 60000);
        currentWorkingMinutes = activeSessionMinutes;
        workedMinutes = (todayRecord.totalMinutes || 0) + activeSessionMinutes;
      } else {
        isWorking = false;
        workedMinutes = todayRecord.totalMinutes || 0;
        todayStatus = workedMinutes >= requiredMinutes ? "COMPLETE" : "INCOMPLETE";
      }
    }

    const remainingMinutes = Math.max(0, requiredMinutes - workedMinutes);
    const differenceMinutes = workedMinutes - requiredMinutes;

    const history = records.map((r) => {
      const reqMins = r.requiredDailyMinutes || requiredMinutes;
      const totalMins = r.totalMinutes || 0;
      const diffMins = totalMins - reqMins;
      let status = r.status;
      if (!r.checkOutAt) {
        status = "IN_PROGRESS";
      } else if (status === "PRESENT" || status === "HALF_DAY" || status === "LATE") {
        status = totalMins >= reqMins ? "COMPLETE" : "INCOMPLETE";
      }

      return {
        id: r.id,
        date: r.date,
        checkInAt: r.checkInAt,
        checkOutAt: r.checkOutAt,
        workedMinutes: totalMins,
        requiredMinutes: reqMins,
        differenceMinutes: diffMins,
        status,
        notes: r.notes,
      };
    });

    return NextResponse.json({
      success: true,
      today: {
        isWorking,
        checkInAt,
        checkOutAt,
        workingSince: isWorking ? checkInAt : null,
        currentWorkingMinutes,
        workedMinutes,
        requiredMinutes,
        remainingMinutes,
        differenceMinutes,
        status: todayStatus,
      },
      records: history,
    });
  } catch (e) {
    return handleApiError(e);
  }
}

export async function POST(req: NextRequest) {
  try {
    const userId = req.headers.get("x-user-id");
    const user = await validateActiveUser(userId);

    const body = await req.json();
    const { action, notes } = body;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const requiredMinutes = user.requiredDailyMinutes || 480;

    const existing = await db.attendance.findFirst({
      where: { userId: user.id, date: today },
    });

    if (action === "check-in") {
      if (existing && !existing.checkOutAt) {
        throw new ApiError(400, "Already checked in and working today");
      }

      const now = new Date();
      let record;

      if (existing) {
        record = await db.attendance.update({
          where: { id: existing.id },
          data: {
            checkInAt: now,
            checkOutAt: null,
            requiredDailyMinutes: requiredMinutes,
            status: "IN_PROGRESS",
            notes: notes || existing.notes,
          },
        });
      } else {
        record = await db.attendance.create({
          data: {
            userId: user.id,
            date: today,
            checkInAt: now,
            requiredDailyMinutes: requiredMinutes,
            status: "IN_PROGRESS",
            totalMinutes: 0,
            notes,
          },
        });
      }

      return NextResponse.json({
        success: true,
        record,
        message: "Checked in successfully",
      });
    } else if (action === "check-out") {
      if (!existing || existing.checkOutAt) {
        throw new ApiError(400, "You are not currently checked in");
      }

      const checkOutAt = new Date();
      const diffMs = checkOutAt.getTime() - new Date(existing.checkInAt).getTime();
      const sessionMinutes = Math.max(1, Math.floor(diffMs / 60000));
      const totalMinutes = (existing.totalMinutes || 0) + sessionMinutes;

      const reqMins = existing.requiredDailyMinutes || requiredMinutes;
      const status = totalMinutes >= reqMins ? "COMPLETE" : "INCOMPLETE";

      const record = await db.attendance.update({
        where: { id: existing.id },
        data: {
          checkOutAt,
          totalMinutes,
          requiredDailyMinutes: reqMins,
          status,
          notes: notes || existing.notes,
        },
      });

      return NextResponse.json({
        success: true,
        record,
        message: "Checked out successfully",
      });
    }

    throw new ApiError(400, "Invalid action specified");
  } catch (e) {
    return handleApiError(e);
  }
}
