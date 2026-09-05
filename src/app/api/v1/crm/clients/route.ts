import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requirePermission } from "@/lib/auth/permissions";
import { handleApiError, ApiError } from "@/lib/api-error";

export async function GET(req: NextRequest) {
  try {
    const userId = req.headers.get("x-user-id");
    await requirePermission(userId, "crm.client.view");

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "10")));
    const skip = (page - 1) * limit;

    const where: any = {};
    if (search) {
      where.OR = [
        { companyName: { contains: search, mode: "insensitive" } },
        { contactName: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { clientCode: { contains: search, mode: "insensitive" } },
      ];
    }

    const [clients, total] = await Promise.all([
      db.crmClient.findMany({
        where,
        include: {
          owner: { select: { id: true, name: true, email: true } },
          _count: { select: { opportunities: true, leads: true, contacts: true } },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      db.crmClient.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: clients,
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
    const actor = await requirePermission(userId, "crm.client.create");

    const body = await req.json();
    const { companyName, contactName, email, phone, website, industry, ownerId } = body;

    if (!companyName || !contactName || !email) {
      throw new ApiError(400, "companyName, contactName, and email are required.");
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Check duplicate
    const existing = await db.crmClient.findFirst({
      where: { email: { equals: normalizedEmail, mode: "insensitive" } },
    });
    if (existing) {
      throw new ApiError(400, `A client with email ${normalizedEmail} already exists (${existing.clientCode}).`);
    }

    const clientCount = await db.crmClient.count();
    const todayStr = new Date().toISOString().replace(/-/g, "").slice(0, 8);
    const clientCode = `CL-${todayStr}-${String(clientCount + 1).padStart(4, "0")}`;

    const client = await db.crmClient.create({
      data: {
        clientCode,
        companyName: companyName.trim(),
        contactName: contactName.trim(),
        email: normalizedEmail,
        phone: phone ? String(phone).trim() : null,
        website: website ? String(website).trim() : null,
        industry: industry ? String(industry).trim() : null,
        ownerId: ownerId || actor.id,
        status: "ACTIVE",
        contacts: {
          create: {
            name: contactName.trim(),
            email: normalizedEmail,
            phone: phone ? String(phone).trim() : null,
            isPrimary: true,
            role: "Primary Contact",
          },
        },
      },
      include: {
        owner: { select: { id: true, name: true, email: true } },
      },
    });

    // Audit log
    await db.auditLog.create({
      data: {
        userId: actor.id,
        action: "CRM_CLIENT_CREATED",
        resource: `Client:${client.id}`,
        details: { clientCode, companyName, email },
      },
    });

    return NextResponse.json({ success: true, data: client }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
