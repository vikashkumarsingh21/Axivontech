import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requirePermission } from "@/lib/auth/permissions";
import { handleApiError, ApiError } from "@/lib/api-error";

export async function GET(req: NextRequest) {
  try {
    const userId = req.headers.get("x-user-id");
    const user = await requirePermission(userId, "crm.lead.view");

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "";
    const qualification = searchParams.get("qualification") || "";
    const ownerId = searchParams.get("ownerId") || "";
    const source = searchParams.get("source") || "";
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "10")));
    const skip = (page - 1) * limit;

    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { phone: { contains: search, mode: "insensitive" } },
        { companyName: { contains: search, mode: "insensitive" } },
        { leadCode: { contains: search, mode: "insensitive" } },
      ];
    }

    if (status) where.status = status;
    if (qualification) where.qualificationStatus = qualification;
    if (ownerId) where.ownerId = ownerId;
    if (source) where.source = source;

    const [leads, total] = await Promise.all([
      db.lead.findMany({
        where,
        include: {
          owner: { select: { id: true, name: true, email: true, department: true } },
          _count: { select: { activities: true, followUps: true, opportunities: true } },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      db.lead.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: leads,
      meta: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const userId = req.headers.get("x-user-id");
    const user = await requirePermission(userId, "crm.lead.create");

    const body = await req.json();
    const { name, email, phone, companyName, website, serviceInterest, message, source, campaign, ownerId } = body;

    if (!name || !email) {
      throw new ApiError(400, "Name and Email are required.");
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Generate Lead Code
    const todayStr = new Date().toISOString().replace(/-/g, "").slice(0, 8);
    const countToday = await db.lead.count({
      where: { leadCode: { startsWith: `LD-${todayStr}` } },
    });
    const leadCode = `LD-${todayStr}-${String(countToday + 1).padStart(4, "0")}`;

    // Check duplicate
    const existing = await db.lead.findFirst({
      where: { email: { equals: normalizedEmail, mode: "insensitive" } },
    });

    const lead = await db.lead.create({
      data: {
        leadCode,
        name: name.trim(),
        email: normalizedEmail,
        phone: phone ? String(phone).trim() : null,
        companyName: companyName ? String(companyName).trim() : null,
        website: website ? String(website).trim() : null,
        serviceInterest: serviceInterest ? String(serviceInterest).trim() : null,
        message: message ? String(message).trim() : null,
        source: source || "MANUAL",
        campaign: campaign || null,
        ownerId: ownerId || user.id,
        status: "NEW",
        qualificationStatus: "UNQUALIFIED",
        isDuplicate: !!existing,
        duplicateReason: existing ? `Duplicate of ${existing.leadCode}` : null,
      },
      include: {
        owner: { select: { id: true, name: true, email: true } },
      },
    });

    // Create activity log
    await db.leadActivity.create({
      data: {
        leadId: lead.id,
        actorId: user.id,
        type: "LEAD_CREATED",
        title: "Lead manually created",
        notes: `Created by ${user.name}`,
      },
    });

    // Audit log
    await db.auditLog.create({
      data: {
        userId: user.id,
        action: "CRM_LEAD_CREATED",
        resource: `Lead:${lead.id}`,
        details: { leadCode: lead.leadCode, name: lead.name, email: lead.email },
      },
    });

    return NextResponse.json({ success: true, data: lead }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
