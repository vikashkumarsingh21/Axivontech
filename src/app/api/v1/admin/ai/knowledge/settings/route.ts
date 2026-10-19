import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requirePermission } from "@/lib/auth/permissions";
import { handleApiError, ApiError } from "@/lib/api-error";
import { DEFAULT_CHATBOT_CONFIG } from "@/app/api/chat/config/route";

export async function GET(req: NextRequest) {
  try {
    const userId = req.headers.get("x-user-id");
    await requirePermission(userId, "admin:access");

    const setting = await db.organizationSetting.findUnique({
      where: { key: "CHATBOT_CONFIG" },
    });

    if (setting && typeof setting.value === "object" && setting.value !== null) {
      return NextResponse.json({ success: true, data: setting.value });
    }

    return NextResponse.json({ success: true, data: DEFAULT_CHATBOT_CONFIG });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PUT(req: NextRequest) {
  try {
    const userId = req.headers.get("x-user-id");
    await requirePermission(userId, "admin:access");

    const body = await req.json();
    const { enabled, botName, welcomeHeading, welcomeSubtitle, suggestedQuestions } = body;

    if (typeof enabled !== "boolean") {
      throw new ApiError(400, "Field 'enabled' must be a boolean.");
    }

    const payload = {
      enabled,
      botName: (botName || DEFAULT_CHATBOT_CONFIG.botName).trim(),
      welcomeHeading: (welcomeHeading || DEFAULT_CHATBOT_CONFIG.welcomeHeading).trim(),
      welcomeSubtitle: (welcomeSubtitle || DEFAULT_CHATBOT_CONFIG.welcomeSubtitle).trim(),
      suggestedQuestions: Array.isArray(suggestedQuestions)
        ? suggestedQuestions.map((q: string) => String(q).trim()).filter(Boolean)
        : DEFAULT_CHATBOT_CONFIG.suggestedQuestions,
    };

    const setting = await db.organizationSetting.upsert({
      where: { key: "CHATBOT_CONFIG" },
      update: {
        value: payload,
        updatedById: userId || null,
      },
      create: {
        key: "CHATBOT_CONFIG",
        value: payload,
        updatedById: userId || null,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Chatbot settings saved successfully.",
      data: setting.value,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
