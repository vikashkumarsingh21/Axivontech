import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { isRateLimited, RATE_LIMIT_PRESETS } from "@/lib/rate-limit";

export async function POST(req: Request) {
  try {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "127.0.0.1";
    const rateLimit = isRateLimited(ip, RATE_LIMIT_PRESETS.PUBLIC_LEADS);
    if (rateLimit.limited) {
      return NextResponse.json(
        { success: false, message: `Too many submissions from this IP. Please try again in ${Math.ceil(rateLimit.resetMs / 60000)} minutes.` },
        { status: 429 }
      );
    }

    const data = await req.json();
    const { name, email, phone, subject, message, company, service } = data;

    if (!name || typeof name !== "string" || !name.trim()) {
      return NextResponse.json(
        { success: false, message: "Full Name is required." },
        { status: 400 }
      );
    }

    if (!email || typeof email !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      return NextResponse.json(
        { success: false, message: "A valid email address is required." },
        { status: 400 }
      );
    }

    // 1. Forward to external script if configured
    fetch(
      "https://script.google.com/macros/s/AKfycbwXF63WF4xQAMDJbv2yLiJSXamBxC47Ndu3M921vKteL3WsHYPnaEih-otyWSf6Xdg6/exec",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }
    ).catch((err) => console.error("Google script webhook error:", err));

    // 2. Create CRM Lead in database automatically
    const normalizedEmail = email.trim().toLowerCase();
      const todayStr = new Date().toISOString().replace(/-/g, "").slice(0, 8);
      const countToday = await db.lead.count({
        where: { leadCode: { startsWith: `LD-${todayStr}` } },
      });
      const leadCode = `LD-${todayStr}-${String(countToday + 1).padStart(4, "0")}`;

      // Check duplicates
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const existing = await db.lead.findFirst({
        where: {
          createdAt: { gte: thirtyDaysAgo },
          email: { equals: normalizedEmail, mode: "insensitive" },
        },
      });

      const lead = await db.lead.create({
        data: {
          leadCode,
          name: name.trim(),
          email: normalizedEmail,
          phone: phone ? String(phone).trim() : null,
          companyName: company ? String(company).trim() : null,
          serviceInterest: service || subject || null,
          message: message ? String(message).trim() : null,
          source: "WEBSITE_CONTACT",
          status: "NEW",
          isDuplicate: !!existing,
          duplicateReason: existing ? `Duplicate of ${existing.leadCode}` : null,
        },
      });

      await db.leadActivity.create({
        data: {
          leadId: lead.id,
          type: "LEAD_CREATED",
          title: "New lead received from public website contact form",
          notes: `Subject/Interest: ${subject || service || "General Contact"}`,
        },
      });

      // Notify Admins & Founders so it immediately surfaces
      const adminRoles = await db.userRole.findMany({
        where: { role: { name: { in: ["ADMIN", "FOUNDER", "CO_FOUNDER"] } } },
        select: { userId: true },
      });
      const recipientIds = Array.from(new Set(adminRoles.map((ur) => ur.userId)));

      if (recipientIds.length > 0) {
        await db.notification.createMany({
          data: recipientIds.map((userId) => ({
            userId,
            type: "SYSTEM",
            title: `New Lead: ${lead.name}`,
            message: `${lead.companyName ? `${lead.companyName} — ` : ""}${lead.serviceInterest || "General Inquiry"} (${lead.leadCode})`,
            link: `/admin/crm/leads/${lead.id}`,
          })),
        }).catch(() => {});
      }

    return NextResponse.json({
      success: true,
      message: "Message sent successfully!",
      leadCode: lead.leadCode,
    });
  } catch (error) {
    console.error("Contact API Error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to submit form" },
      { status: 500 }
    );
  }
}