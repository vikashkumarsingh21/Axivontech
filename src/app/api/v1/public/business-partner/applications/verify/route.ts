import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { handleApiError, ApiError } from "@/lib/api-error";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get("token");

    if (!token) {
      return NextResponse.json({ error: "Verification token is missing" }, { status: 400 });
    }

    const application = await db.businessPartnerApplication.findFirst({
      where: { verificationToken: token },
    });

    if (!application) {
      return NextResponse.json({ error: "Invalid or expired verification token" }, { status: 400 });
    }

    if (application.emailVerifiedAt) {
      return NextResponse.json({ message: "Email is already verified" }, { status: 200 });
    }

    await db.businessPartnerApplication.update({
      where: { id: application.id },
      data: {
        emailVerifiedAt: new Date(),
        verificationToken: null,
      },
    });

    // Provide a simple HTML response for the user
    const htmlResponse = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Email Verified - AXIVON</title>
        <style>
          body { font-family: system-ui, -apple-system, sans-serif; background-color: #0a0a0a; color: #fff; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; }
          .container { text-align: center; padding: 2rem; border-radius: 8px; background: #111; max-width: 400px; box-shadow: 0 4px 6px rgba(0,0,0,0.3); }
          .icon { font-size: 48px; color: #10b981; margin-bottom: 1rem; }
          h1 { margin: 0 0 1rem; font-size: 1.5rem; }
          p { color: #a1a1aa; line-height: 1.5; margin-bottom: 1.5rem; }
          a { display: inline-block; padding: 0.5rem 1.5rem; background: #e8a064; color: #000; text-decoration: none; border-radius: 4px; font-weight: 500; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="icon">✓</div>
          <h1>Email Verified Successfully</h1>
          <p>Thank you for verifying your email address. Your business partner application is now fully submitted and under review.</p>
          <a href="/business-partner">Return to AXIVON</a>
        </div>
      </body>
      </html>
    `;

    return new NextResponse(htmlResponse, {
      status: 200,
      headers: { "Content-Type": "text/html" },
    });
  } catch (err) {
    return handleApiError(err);
  }
}
