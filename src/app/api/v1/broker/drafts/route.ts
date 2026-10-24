import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireBroker, apiSuccess, handleApiError, ApiError } from "@/lib/api/broker";

const saveDraftSchema = z.object({
  draftType: z.enum(["PROJECT", "LEAD"], {
    errorMap: () => ({ message: "draftType must be 'PROJECT' or 'LEAD'." }),
  }),
  data: z.record(z.unknown()),
  title: z.string().optional().default("Untitled Draft"),
});

export async function GET(req: NextRequest) {
  try {
    const { brokerProfile } = await requireBroker(req);
    const { searchParams } = new URL(req.url);
    const draftType = searchParams.get("type");

    const settingKey = `broker_drafts:${brokerProfile.id}`;
    const setting = await db.organizationSetting.findUnique({
      where: { key: settingKey },
    });

    let drafts: any[] = Array.isArray(setting?.value) ? (setting.value as any[]) : [];
    if (draftType) {
      drafts = drafts.filter((d) => d.draftType === draftType);
    }

    return apiSuccess({ drafts });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const { brokerProfile } = await requireBroker(req);
    const body = await req.json().catch(() => ({}));
    const validated = saveDraftSchema.safeParse(body);
    if (!validated.success) {
      throw new ApiError(400, validated.error.errors[0]?.message || "Invalid draft payload.");
    }

    const { draftType, data, title } = validated.data;
    const settingKey = `broker_drafts:${brokerProfile.id}`;

    const setting = await db.organizationSetting.findUnique({
      where: { key: settingKey },
    });

    let drafts: any[] = Array.isArray(setting?.value) ? (setting.value as any[]) : [];

    // Replace existing draft of same type or append
    const draftId = `DFT-${draftType.toLowerCase()}-${Date.now()}`;
    const newDraft = {
      id: draftId,
      draftType,
      title,
      data,
      updatedAt: new Date().toISOString(),
    };

    drafts = drafts.filter((d) => d.draftType !== draftType); // Keep latest draft per type
    drafts.unshift(newDraft);

    await db.organizationSetting.upsert({
      where: { key: settingKey },
      create: {
        key: settingKey,
        value: drafts,
        description: `Draft forms for broker ${brokerProfile.id}`,
      },
      update: {
        value: drafts,
      },
    });

    return apiSuccess({
      draft: newDraft,
      message: "Draft saved successfully.",
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { brokerProfile } = await requireBroker(req);
    const { searchParams } = new URL(req.url);
    const draftId = searchParams.get("id");
    const draftType = searchParams.get("type");

    const settingKey = `broker_drafts:${brokerProfile.id}`;
    const setting = await db.organizationSetting.findUnique({
      where: { key: settingKey },
    });

    let drafts: any[] = Array.isArray(setting?.value) ? (setting.value as any[]) : [];
    if (draftId) {
      drafts = drafts.filter((d) => d.id !== draftId);
    } else if (draftType) {
      drafts = drafts.filter((d) => d.draftType !== draftType);
    } else {
      drafts = [];
    }

    await db.organizationSetting.update({
      where: { key: settingKey },
      data: { value: drafts },
    });

    return apiSuccess({ message: "Draft cleared successfully." });
  } catch (error) {
    return handleApiError(error);
  }
}
