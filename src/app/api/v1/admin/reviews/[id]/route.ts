import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { validateActiveUser } from "@/lib/auth/permissions";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const userId = req.headers.get("x-user-id");
    await validateActiveUser(userId);

    const review = await db.clientReview.findUnique({
      where: { id: id },
    });

    if (!review) {
      return NextResponse.json({ success: false, error: "Review not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, review });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: error.status || 500 });
  }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const userId = req.headers.get("x-user-id");
    const admin = await validateActiveUser(userId);

    const body = await req.json();
    const { status, isFeatured, reviewText } = body;

    const existingReview = await db.clientReview.findUnique({
      where: { id: id },
    });

    if (!existingReview) {
      return NextResponse.json({ success: false, error: "Review not found" }, { status: 404 });
    }

    const data: any = {};
    if (status !== undefined) {
      data.status = status;
      if (status === 'APPROVED') {
        data.approvedAt = new Date();
        data.approvedBy = admin.id;
      } else if (status === 'REJECTED') {
        data.rejectedAt = new Date();
        data.rejectedBy = admin.id;
        data.isFeatured = false; // Auto unfeature if rejected
      } else if (status === 'ARCHIVED') {
        data.isFeatured = false;
      }
    }
    
    if (isFeatured !== undefined) {
      if (isFeatured && existingReview.status !== 'APPROVED' && data.status !== 'APPROVED') {
        return NextResponse.json({ success: false, error: "Only approved reviews can be featured" }, { status: 400 });
      }
      data.isFeatured = isFeatured;
    }
    
    if (reviewText !== undefined) {
      data.reviewText = reviewText;
    }

    const updatedReview = await db.clientReview.update({
      where: { id: id },
      data,
    });

    await db.auditLog.create({
      data: {
        userId: admin.id,
        action: "REVIEW_UPDATED",
        resource: `ClientReview:${id}`,
        details: { status: updatedReview.status, isFeatured: updatedReview.isFeatured },
      },
    });

    return NextResponse.json({ success: true, review: updatedReview });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: error.status || 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const userId = req.headers.get("x-user-id");
    const admin = await validateActiveUser(userId);

    await db.clientReview.delete({
      where: { id: id },
    });

    await db.auditLog.create({
      data: {
        userId: admin.id,
        action: "REVIEW_DELETED",
        resource: `ClientReview:${id}`,
        details: {},
      },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: error.status || 500 });
  }
}
