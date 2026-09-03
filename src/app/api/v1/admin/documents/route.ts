import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const documents = await db.document.findMany({
      include: { uploadedBy: { select: { name: true, email: true } } },
      orderBy: { createdAt: "desc" },
      take: 50,
    });
    return NextResponse.json({ data: documents });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
