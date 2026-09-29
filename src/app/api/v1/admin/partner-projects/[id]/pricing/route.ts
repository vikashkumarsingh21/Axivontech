import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requirePermission } from "@/lib/auth/permissions";
import { handleApiError, ApiError } from "@/lib/api-error";
import { calculateAdvance } from "@/lib/finance";
import { z } from "zod";

const pricingSchema = z.object({
  finalProjectValue: z.number().positive("Project value must be positive"),
});

export async function POST(req: NextRequest, props: { params: Promise<{ [key: string]: string }> }) {
  const params = await props.params;
  try {
    const { id } = await params;
    const userId = req.headers.get("x-user-id");
    
    // Require explicit permission (Admin or Finance)
    const actor = await requirePermission(userId, "crm.project.pricing");

    const project = await db.partnerProject.findUnique({
      where: { id },
      include: {
        payment: true,
        brokerProfile: { select: { userId: true } },
      }
    });

    if (!project) throw new ApiError(404, "Project not found.");

    // The project must be ACCEPTED (or similar approved state) to finalize pricing
    if (project.status !== "ACCEPTED" && project.status !== "PROPOSAL_SENT" && project.status !== "NEGOTIATION") {
      throw new ApiError(400, "Project must be accepted before finalizing pricing.");
    }

    if (project.payment) {
      throw new ApiError(400, "Final pricing has already been established for this project.");
    }

    const body = await req.json().catch(() => ({}));
    const parsed = pricingSchema.safeParse(body);
    if (!parsed.success) {
      throw new ApiError(400, parsed.error.issues[0].message);
    }

    const { finalProjectValue } = parsed.data;
    const advanceAmount = calculateAdvance(finalProjectValue);
    const remainingAmount = finalProjectValue - advanceAmount;

    // Execute as an atomic transaction
    const result = await db.$transaction(async (tx) => {
      // 1. Create the Payment record to lock in the pricing
      const payment = await tx.partnerPayment.create({
        data: {
          partnerProjectId: project.id,
          projectPrice: finalProjectValue,
          advancePercentage: 40,
          advanceAmount: advanceAmount,
          remainingAmount: remainingAmount,
          status: "PENDING", // Ready for Phase 7/8
        },
      });

      // 2. Update the project status to indicate pricing is finalized (moves to CONTRACT_SENT or PAYMENT_PENDING)
      // Here we just prepare it for the next phase. 
      const updatedProject = await tx.partnerProject.update({
        where: { id: project.id },
        data: {
          status: "PAYMENT_PENDING", 
        },
      });

      // 3. Create Audit Activity
      await tx.activity.create({
        data: {
          actorId: actor.id,
          action: "PRICING_FINALIZED",
          entityType: "PARTNER_PROJECT",
          entityId: project.id,
          summary: `Final project value set to ${finalProjectValue} (Advance: ${advanceAmount})`,
          // Do NOT expose these numbers to public metadata
        }
      });
      
      // 4. Notify Partner
      await tx.notification.create({
        data: {
          userId: project.brokerProfile.userId,
          type: "SYSTEM",
          title: "Project Pricing Finalized",
          message: `The final pricing and advance amount for ${project.projectCode} has been calculated.`,
          link: `/broker/projects/${project.id}`,
        }
      });

      return { project: updatedProject, payment };
    });

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    return handleApiError(error);
  }
}
