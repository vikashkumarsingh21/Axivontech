import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requirePermission } from "@/lib/auth/permissions";
import { handleApiError } from "@/lib/api-error";
import { DEFAULT_FAQS } from "@/lib/content/content-db";

export async function GET(req: NextRequest) {
  try {
    const userId = req.headers.get("x-user-id");
    await requirePermission(userId, "admin:access");

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search")?.toLowerCase();
    const category = searchParams.get("category");
    const status = searchParams.get("status");

    let faqs = await db.websiteFaq.findMany({
      orderBy: { displayOrder: "asc" },
    });

    // If database is empty, seed initial defaults to ensure immediate usability
    if (faqs.length === 0) {
      try {
        await Promise.all(
          DEFAULT_FAQS.map((f, idx) =>
            db.websiteFaq.create({
              data: {
                question: f.question,
                answer: f.answer,
                category: f.category,
                page: f.page,
                displayOrder: idx + 1,
                status: "PUBLISHED",
              },
            })
          )
        );
        faqs = await db.websiteFaq.findMany({ orderBy: { displayOrder: "asc" } });
      } catch {
        // Fallback to static for read-only if seed fails
        faqs = DEFAULT_FAQS as any;
      }
    }

    let filtered = faqs;
    if (category && category !== "ALL") {
      filtered = filtered.filter((f) => f.category === category);
    }
    if (status && status !== "ALL") {
      filtered = filtered.filter((f) => f.status === status);
    }
    if (search) {
      filtered = filtered.filter(
        (f) =>
          f.question.toLowerCase().includes(search) ||
          f.answer.toLowerCase().includes(search)
      );
    }

    const stats = {
      total: faqs.length,
      published: faqs.filter((f) => f.status === "PUBLISHED").length,
      draft: faqs.filter((f) => f.status === "DRAFT").length,
      archived: faqs.filter((f) => f.status === "ARCHIVED").length,
    };

    return NextResponse.json({ faqs: filtered, stats });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const userId = req.headers.get("x-user-id");
    await requirePermission(userId, "admin:access");

    const body = await req.json();
    const { question, answer, category, page, displayOrder, status } = body;

    if (!question || !answer) {
      return NextResponse.json(
        { error: "Question and Answer are required." },
        { status: 400 }
      );
    }

    const count = await db.websiteFaq.count();

    const faq = await db.websiteFaq.create({
      data: {
        question: question.trim(),
        answer: answer.trim(),
        category: category || "GENERAL",
        page: page || "GLOBAL",
        displayOrder: displayOrder !== undefined ? displayOrder : count + 1,
        status: status || "PUBLISHED",
        createdById: userId,
      },
    });

    try {
      revalidatePath("/");
      revalidatePath("/services");
    } catch {
      // safe
    }

    return NextResponse.json({ faq }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
