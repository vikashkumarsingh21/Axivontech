import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { Prisma } from "@prisma/client";
import { requirePermission } from "@/lib/auth/permissions";
import { handleApiError } from "@/lib/api-error";
import {
  DEFAULT_HOMEPAGE_CONTENT,
  DEFAULT_ABOUT_CONTENT,
  DEFAULT_COMPANY_INFO,
  DEFAULT_SEO_SETTINGS,
} from "@/lib/content/content-db";

const DEFAULT_MAP: Record<string, any> = {
  homepage: DEFAULT_HOMEPAGE_CONTENT,
  about: DEFAULT_ABOUT_CONTENT,
  company: DEFAULT_COMPANY_INFO,
  seo: DEFAULT_SEO_SETTINGS,
};

export async function GET(req: NextRequest) {
  try {
    const userId = req.headers.get("x-user-id");
    await requirePermission(userId, "admin:access");

    const { searchParams } = new URL(req.url);
    const key = searchParams.get("key") || "homepage";

    const setting = await db.websiteSetting.findUnique({
      where: { key },
    });

    const defaultData = DEFAULT_MAP[key] || {};

    if (!setting) {
      return NextResponse.json({
        setting: {
          key,
          data: defaultData,
          draftData: null,
          status: "PUBLISHED",
          updatedAt: new Date().toISOString(),
        },
      });
    }

    return NextResponse.json({
      setting: {
        ...setting,
        data: setting.data ? { ...defaultData, ...(setting.data as object) } : defaultData,
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PUT(req: NextRequest) {
  try {
    const userId = req.headers.get("x-user-id");
    await requirePermission(userId, "admin:access");

    const body = await req.json();
    const { key, data, action } = body;

    if (!key || !data) {
      return NextResponse.json(
        { error: "Setting key and data are required." },
        { status: 400 }
      );
    }

    const isDraft = action === "draft";
    const status = isDraft ? "DRAFT" : "PUBLISHED";
    const now = new Date();

    const existing = await db.websiteSetting.findUnique({
      where: { key },
    });

    let updated;
    if (existing) {
      updated = await db.websiteSetting.update({
        where: { key },
        data: {
          status,
          updatedById: userId,
          ...(isDraft
            ? { draftData: data }
            : { data, draftData: Prisma.DbNull, publishedAt: now }),
        },
      });
    } else {
      updated = await db.websiteSetting.create({
        data: {
          key,
          status,
          updatedById: userId,
          data: isDraft ? (DEFAULT_MAP[key] || {}) : data,
          draftData: isDraft ? data : Prisma.DbNull,
          publishedAt: isDraft ? null : now,
        },
      });
    }

    // Cache revalidation on publication
    if (!isDraft) {
      try {
        if (key === "homepage" || key === "seo") {
          revalidatePath("/");
        } else if (key === "about") {
          revalidatePath("/about");
        }
        revalidatePath("/sitemap.xml");
      } catch (err) {
        // Next.js revalidate error in test/dev
      }
    }

    return NextResponse.json({
      success: true,
      message: isDraft ? "Draft saved successfully." : "Changes published to website successfully.",
      setting: updated,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
