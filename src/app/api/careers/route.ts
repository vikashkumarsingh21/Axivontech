import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { isCareersPageEnabled } from "@/lib/careers/careers-db";
import { verifyFormProtection } from "@/lib/captcha";
import { RATE_LIMIT_PRESETS } from "@/lib/rate-limit";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: Request) {
  try {
    const careersEnabled = await isCareersPageEnabled();
    if (!careersEnabled) {
      return NextResponse.json(
        {
          success: false,
          message: "Recruitment is currently closed and applications are not being accepted at this time.",
        },
        { status: 403 }
      );
    }

    const body = await req.json().catch(() => ({}));

    // Server-side dual protection: Privacy Policy acknowledgement + Google reCAPTCHA v2 / Turnstile
    const protection = await verifyFormProtection(req, body, {
      action: "career_application",
      rateLimitPreset: RATE_LIMIT_PRESETS.PUBLIC_LEADS,
      requirePolicyAcknowledgement: true,
      policySlug: "privacy-policy",
    });
    if (!protection.success && protection.errorResponse) {
      return protection.errorResponse;
    }

    const fullName = typeof body.fullName === "string" ? body.fullName.trim() : "";
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const phone = typeof body.phone === "string" ? body.phone.trim() : "";
    const position = typeof body.position === "string" ? body.position.trim() : "";
    const jobId = typeof body.jobId === "string" ? body.jobId.trim() : undefined;
    const location = typeof body.location === "string" ? body.location.trim() : "";
    const experience = typeof body.experience === "string" ? body.experience.trim() : "";
    const linkedin = typeof body.linkedin === "string" ? body.linkedin.trim() : "";
    const github = typeof body.github === "string" ? body.github.trim() : "";
    const portfolio = typeof body.portfolio === "string" ? body.portfolio.trim() : "";
    const resumeUrl = typeof body.resumeUrl === "string" ? body.resumeUrl.trim() : "";
    const resumeFileName = typeof body.resumeFileName === "string" ? body.resumeFileName.trim() : "";
    const coverLetter = typeof body.coverLetter === "string" ? body.coverLetter.trim() : "";

    // 1. Required fields validation
    if (!fullName || !email || !position || !location || !resumeUrl) {
      return NextResponse.json(
        {
          success: false,
          message: "Please fill all required fields: Full Name, Email, Position, Location, and Resume Link.",
        },
        { status: 400 }
      );
    }

    // 2. Email format validation
    if (!EMAIL_REGEX.test(email)) {
      return NextResponse.json(
        {
          success: false,
          message: "Please enter a valid email address.",
        },
        { status: 400 }
      );
    }

    // 3. Find matching job posting (by ID or title or slug)
    let matchedJob = null;
    try {
      if (jobId) {
        matchedJob = await db.jobPosting.findUnique({ where: { id: jobId } });
      } else {
        matchedJob = await db.jobPosting.findFirst({
          where: {
            OR: [
              { title: { equals: position, mode: "insensitive" } },
              { slug: { equals: position, mode: "insensitive" } },
            ],
          },
        });
      }

      // If job is found and closed/archived, prevent new applications
      if (matchedJob && (matchedJob.status === "CLOSED" || matchedJob.status === "ARCHIVED")) {
        return NextResponse.json(
          {
            success: false,
            message: "This position is currently closed and is no longer accepting new applications.",
          },
          { status: 403 }
        );
      }
    } catch (e: any) {
      console.warn("[Career API] DB job match check skipped:", e?.message);
    }

    // 4. Check for duplicate spam submissions within last 15 minutes
    try {
      const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);
      const recentDup = await db.careerApplication.findFirst({
        where: {
          email,
          createdAt: { gte: fifteenMinutesAgo },
          OR: [
            { jobId: matchedJob?.id || undefined },
            { jobTitle: matchedJob?.title || position },
          ],
        },
      });

      if (recentDup) {
        return NextResponse.json(
          {
            success: true,
            message: "We have already received your application for this position recently. Our hiring team is reviewing your profile.",
            applicationId: recentDup.id,
          },
          { status: 200 }
        );
      }
    } catch (e: any) {
      // Ignore if DB not reachable
    }

    // 5. Persist application in local database
    let savedApplication = null;
    try {
      savedApplication = await db.careerApplication.create({
        data: {
          jobId: matchedJob?.id || null,
          jobTitle: matchedJob?.title || position,
          fullName,
          email,
          phone: phone || null,
          location: location || null,
          experience: experience || null,
          resumeUrl,
          resumeFileName: resumeFileName || null,
          portfolioUrl: portfolio || null,
          linkedinUrl: linkedin || null,
          githubUrl: github || null,
          coverLetter: coverLetter || null,
          status: "NEW",
        },
      });
    } catch (dbErr: any) {
      console.error("[Career API] Failed to persist in database:", dbErr?.message);
    }

    // 6. Dispatch Automated Transactional Email Notifications
    const appRef = savedApplication?.id || `APP-${Date.now()}`;
    try {
      const { sendTransactionalEmail } = await import("@/lib/email/service");
      const { getEmailConfig } = await import("@/lib/email/config");
      const emailConfig = getEmailConfig();

      // 6a. Internal Alert to axivontech.in@gmail.com
      await sendTransactionalEmail({
        to: emailConfig.internalNotificationEmail,
        templateKey: "CAREER_APPLICATION_RECEIVED",
        eventKey: `career_internal:${appRef}`,
        variables: {
          fullName,
          email,
          phone: phone || "Not provided",
          position: matchedJob?.title || position,
          location: location || "Not specified",
          experience: experience || "Not specified",
          resumeUrl,
          portfolio: portfolio || undefined,
          linkedin: linkedin || undefined,
          applicationId: appRef,
        },
        metadata: {
          applicationId: appRef,
          position: matchedJob?.title || position,
          type: "INTERNAL_CAREER_APPLICATION_ALERT",
        },
      });

      // 6b. Candidate Acknowledgement Email
      if (email) {
        await sendTransactionalEmail({
          to: email,
          templateKey: "CAREER_APPLICATION_ACK",
          eventKey: `career_ack:${appRef}`,
          variables: {
            fullName,
            position: matchedJob?.title || position,
            applicationId: appRef,
          },
          metadata: {
            applicationId: appRef,
            position: matchedJob?.title || position,
            type: "CANDIDATE_CAREER_APPLICATION_ACK",
          },
        });
      }
    } catch (emailErr: any) {
      console.warn("[Career API] Email dispatch warning:", emailErr?.message);
    }

    // 7. Forward application to external webhook integration only if securely configured via env
    const payload = {
      fullName,
      email,
      phone,
      position: matchedJob?.title || position,
      location,
      linkedin,
      github,
      portfolio,
      resumeUrl,
      coverLetter,
      submittedAt: new Date().toISOString(),
      applicationId: savedApplication?.id || "direct-submit",
    };

    const webhookUrl = process.env.GOOGLE_SHEETS_CAREERS_WEBHOOK_URL?.trim();
    let scriptResponseText = "";
    if (webhookUrl && webhookUrl.startsWith("https://")) {
      try {
        const response = await fetch(webhookUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
          signal: AbortSignal.timeout(10000),
        });
        scriptResponseText = await response.text();
      } catch (err: any) {
        console.warn("[Career API] Forwarding to careers webhook timed out or failed:", err.message);
      }
    }

    return NextResponse.json(
      {
        success: true,
        message: "Your application has been received successfully. Our team will review your profile and reach out within 3–7 business days.",
        applicationId: savedApplication?.id,
        reference: scriptResponseText ? "confirmed" : "logged",
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("[Career API] Unhandled Error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "An unexpected error occurred while processing your application. Please try again or email your resume directly to info@axivontech.in.",
      },
      { status: 500 }
    );
  }
}