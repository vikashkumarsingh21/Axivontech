import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { handleApiError, ApiError } from "@/lib/api-error";

export async function GET(req: Request) {
  try {
    const userId = req.headers.get("x-user-id");
    const userRole = req.headers.get("x-user-role");
    if (!userId) throw new ApiError(401, "Unauthorized");

    const { searchParams } = new URL(req.url);
    const query = (searchParams.get("q") || "").trim();
    if (!query || query.length < 2) {
      return NextResponse.json({ data: [] });
    }

    const results: any[] = [];
    const mode = "insensitive" as const;
    const take = 5;

    const isAdmin = ["ADMIN", "FOUNDER", "CO_FOUNDER"].includes(userRole || "");

    // 1. Tasks
    const taskWhere: any = {
      OR: [
        { title: { contains: query, mode } },
        { description: { contains: query, mode } },
      ],
    };
    if (!isAdmin) taskWhere.userId = userId;
    const tasks = await db.task.findMany({ where: taskWhere, take, select: { id: true, title: true, status: true } });
    tasks.forEach((t) =>
      results.push({ type: "Task", id: t.id, title: t.title, subtitle: t.status, link: isAdmin ? "/admin/tasks" : "/employee/tasks" })
    );

    // 2. Announcements (PUBLISHED only for employees)
    const annWhere: any = {
      OR: [
        { title: { contains: query, mode } },
        { content: { contains: query, mode } },
      ],
    };
    if (!isAdmin) annWhere.status = "PUBLISHED";
    const announcements = await db.announcement.findMany({
      where: annWhere,
      take,
      select: { id: true, title: true, status: true, createdAt: true },
    });
    announcements.forEach((a) =>
      results.push({ type: "Announcement", id: a.id, title: a.title, subtitle: a.status, link: isAdmin ? "/admin/announcements" : "/employee/announcements" })
    );

    // 3. Employees (admin only)
    if (isAdmin) {
      const users = await db.user.findMany({
        where: {
          OR: [
            { name: { contains: query, mode } },
            { email: { contains: query, mode } },
            { department: { contains: query, mode } },
          ],
        },
        take,
        select: { id: true, name: true, email: true, department: true },
      });
      users.forEach((u) =>
        results.push({ type: "Employee", id: u.id, title: u.name, subtitle: u.email, link: `/admin/employees` })
      );

      // 4. Projects
      const projects = await db.project.findMany({
        where: {
          OR: [
            { name: { contains: query, mode } },
            { description: { contains: query, mode } },
          ],
        },
        take,
        select: { id: true, name: true, status: true },
      });
      projects.forEach((p) =>
        results.push({ type: "Project", id: p.id, title: p.name, subtitle: p.status, link: "/admin/projects" })
      );

      // 5. Leads (CRM)
      const leads = await db.lead.findMany({
        where: {
          OR: [
            { name: { contains: query, mode } },
            { email: { contains: query, mode } },
            { companyName: { contains: query, mode } },
          ],
        },
        take,
        select: { id: true, name: true, companyName: true, status: true },
      });
      leads.forEach((l) =>
        results.push({ type: "Lead", id: l.id, title: l.name, subtitle: l.companyName || l.status, link: `/admin/crm/leads/${l.id}` })
      );

      // 6. Clients (CRM)
      const clients = await db.crmClient.findMany({
        where: {
          OR: [
            { companyName: { contains: query, mode } },
            { contactName: { contains: query, mode } },
            { email: { contains: query, mode } },
            { industry: { contains: query, mode } },
          ],
        },
        take,
        select: { id: true, companyName: true, contactName: true, email: true, industry: true },
      });
      clients.forEach((c) =>
        results.push({ type: "Client", id: c.id, title: c.companyName, subtitle: c.industry || c.contactName, link: `/admin/crm/clients/${c.id}` })
      );

      // 7. Opportunities (CRM)
      const opportunities = await db.opportunity.findMany({
        where: {
          OR: [
            { name: { contains: query, mode } },
            { description: { contains: query, mode } },
          ],
        },
        take,
        select: { id: true, name: true, stage: true, value: true },
      });
      opportunities.forEach((o) =>
        results.push({ type: "Opportunity", id: o.id, title: o.name, subtitle: o.stage, link: `/admin/crm/pipeline` })
      );

      // 8. Documents
      const documents = await db.document.findMany({
        where: {
          isArchived: false,
          OR: [
            { title: { contains: query, mode } },
            { description: { contains: query, mode } },
          ],
        },
        take,
        select: { id: true, title: true, mimeType: true, visibility: true },
      });
      documents.forEach((d) =>
        results.push({ type: "Document", id: d.id, title: d.title, subtitle: d.mimeType || d.visibility, link: `/admin/documents` })
      );
    }

    return NextResponse.json({ data: results, count: results.length });
  } catch (error: any) {
    return handleApiError(error);
  }
}
