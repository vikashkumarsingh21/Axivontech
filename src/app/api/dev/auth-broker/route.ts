import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { signSession } from "@/lib/auth/session";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const redirectUrl = searchParams.get("redirect") || "/broker/dashboard";

    const user = await db.user.findUnique({
      where: { email: "qa.broker@axivon.dev" },
      include: {
        brokerProfile: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "QA Broker account not found." }, { status: 404 });
    }

    const sessionToken = await signSession({
      userId: user.id,
      role: "BUSINESS_PARTNER",
      sessionId: crypto.randomUUID(),
    });

    await db.session.create({
      data: {
        userId: user.id,
        token: sessionToken,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      },
    });

    const isHttps = req.nextUrl.protocol === "https:" || req.headers.get("x-forwarded-proto") === "https";
    const response = NextResponse.redirect(new URL(redirectUrl, req.url));

    response.cookies.set({
      name: "axivon_session",
      value: sessionToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production" ? true : isHttps,
      sameSite: "lax",
      path: "/",
      maxAge: 24 * 60 * 60,
    });

    return response;
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
