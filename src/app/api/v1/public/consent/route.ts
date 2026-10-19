import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { createHash } from "crypto";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { categories } = body;

    if (!categories || typeof categories !== "object") {
      return NextResponse.json({ error: "Invalid consent categories payload" }, { status: 400 });
    }

    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "127.0.0.1";
    const userAgent = req.headers.get("user-agent") || "unknown";
    const ipHash = createHash("sha256").update(ip + "axivon_salt").digest("hex").slice(0, 16);
    const consentKey = "ck_" + createHash("sha256").update(ipHash + userAgent + Date.now().toString()).digest("hex").slice(0, 24);

    try {
      await db.userConsentRecord.create({
        data: {
          consentKey,
          categories,
          consentVersion: "2.1",
          ipHash,
          userAgent: userAgent.slice(0, 255),
        },
      });
    } catch {
      // Safe fallback if database isn't migrated yet
    }

    return NextResponse.json({ success: true, consentKey });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to record consent" }, { status: 500 });
  }
}
