import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requirePermission } from "@/lib/auth/permissions";
import { handleApiError, ApiError } from "@/lib/api-error";
import { z } from "zod";
import bcrypt from "bcryptjs";

const createBrokerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional().nullable(),
  whatsapp: z.string().optional().nullable(),
  password: z.string().min(6, "Password must be at least 6 characters"),
  companyName: z.string().optional().nullable(),
  designation: z.string().optional().nullable(),
  city: z.string().optional().nullable(),
  state: z.string().optional().nullable(),
  country: z.string().optional().nullable(),
  website: z.string().optional().nullable(),
  status: z.enum(["ACTIVE", "INACTIVE"]).optional().default("ACTIVE"),
});

export async function GET(req: Request) {
  try {
    const adminId = req.headers.get("x-user-id");
    await requirePermission(adminId, "users:read");

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const statusFilter = searchParams.get("status") || "";
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.max(1, parseInt(searchParams.get("limit") || "10"));
    const skip = (page - 1) * limit;

    const where: any = {
      userRoles: { some: { role: { name: "BROKER" } } },
    };

    if (statusFilter) {
      where.status = statusFilter;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { brokerProfile: { referralCode: { contains: search, mode: "insensitive" } } },
        { brokerProfile: { companyName: { contains: search, mode: "insensitive" } } },
      ];
    }

    const [brokers, total] = await Promise.all([
      db.user.findMany({
        where,
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          status: true,
          createdAt: true,
          brokerProfile: {
            select: {
              referralCode: true,
              companyName: true,
              designation: true,
              city: true,
              state: true,
              country: true,
              website: true,
            },
          },
          _count: {
            select: {
              ownedLeads: true,
              ownedOpportunities: true,
            },
          },
        },
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      db.user.count({ where }),
    ]);

    return NextResponse.json({
      data: brokers,
      meta: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    return handleApiError(error);
  }
}

export async function POST(req: Request) {
  try {
    const adminId = req.headers.get("x-user-id");
    await requirePermission(adminId, "users:write");

    const body = await req.json();
    const validatedData = createBrokerSchema.parse(body);

    const existingEmail = await db.user.findUnique({
      where: { email: validatedData.email },
    });
    if (existingEmail) {
      throw new ApiError(409, "An account with this email address already exists.");
    }

    let brokerRole = await db.role.findUnique({ where: { name: "BROKER" } });
    if (!brokerRole) {
      brokerRole = await db.role.create({
        data: { name: "BROKER", description: "External Referral Partner" },
      });
    }

    const passwordHash = await bcrypt.hash(validatedData.password, 10);
    const status = validatedData.status || "ACTIVE";

    // Create the User and the associated BrokerProfile
    // Start a transaction since we are dealing with multiple things.
    const newBroker = await db.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          name: validatedData.name,
          email: validatedData.email,
          passwordHash,
          phone: validatedData.phone || null,
          status,
          userRoles: {
            create: {
              role: { connect: { id: brokerRole.id } },
            },
          },
          brokerProfile: {
            create: {
              companyName: validatedData.companyName || null,
              designation: validatedData.designation || null,
              whatsapp: validatedData.whatsapp || null,
              city: validatedData.city || null,
              state: validatedData.state || null,
              country: validatedData.country || null,
              website: validatedData.website || null,
              // referralCode is strictly null until first login
            },
          },
        },
        include: {
          brokerProfile: true,
        },
      });

      await tx.auditLog.create({
        data: {
          userId: adminId,
          action: "BROKER_CREATED",
          resource: "User",
          details: {
            brokerId: user.id,
            name: user.name,
            email: user.email,
            companyName: validatedData.companyName,
          },
        },
      });

      return user;
    });

    return NextResponse.json(
      { data: newBroker },
      { status: 201 }
    );
  } catch (error: any) {
    return handleApiError(error);
  }
}
