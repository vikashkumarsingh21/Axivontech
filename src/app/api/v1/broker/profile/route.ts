import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { handleApiError, ApiError } from "@/lib/api-error";
import {
  requireBroker,
  apiSuccess,
  checkRateLimit,
  checkIdempotency,
  logBrokerAudit,
} from "@/lib/api/broker";
import { z } from "zod";

const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
const ifscRegex = /^[A-Z]{4}0[A-Z0-9]{6}$/;

const updateProfileSchema = z.object({
  name: z.string().min(2, "Full name must be at least 2 characters").max(100).optional(),
  phone: z.string().min(7, "Phone must be at least 7 characters").max(30).optional().nullable(),
  whatsapp: z.string().max(30).optional().nullable(),
  address: z.string().max(300).optional().nullable(),
  companyName: z.string().max(200).optional().nullable(),
  designation: z.string().max(100).optional().nullable(),
  city: z.string().max(100).optional().nullable(),
  state: z.string().max(100).optional().nullable(),
  country: z.string().max(100).optional().nullable(),
  website: z.string().url("Website must be a valid URL").optional().nullable().or(z.literal("")),

  // Tax Identifiers (Optional, but strictly validated if present)
  panNumber: z
    .string()
    .trim()
    .toUpperCase()
    .regex(panRegex, "Invalid PAN format (e.g., ABCDE1234F)")
    .optional()
    .nullable()
    .or(z.literal("")),
  gstNumber: z
    .string()
    .trim()
    .toUpperCase()
    .regex(gstRegex, "Invalid GST format (15 characters, e.g., 22AAAAA0000A1Z5)")
    .optional()
    .nullable()
    .or(z.literal("")),

  // Payout Configuration
  payoutMethod: z.enum(["BANK_TRANSFER", "UPI"]).optional().nullable(),
  payoutDetails: z
    .object({
      accountHolder: z.string().max(150).optional(),
      accountNumber: z.string().min(8).max(30).optional(),
      ifsc: z.string().trim().toUpperCase().optional(),
      bankName: z.string().max(100).optional(),
      upiId: z.string().trim().max(100).optional(),
    })
    .optional()
    .nullable(),
});

function maskAccountNumber(acc?: string | null): string | null {
  if (!acc || acc.length < 4) return null;
  return `••••••••${acc.slice(-4)}`;
}

function maskUpiId(upi?: string | null): string | null {
  if (!upi || !upi.includes("@")) return null;
  const [handle, domain] = upi.split("@");
  const visible = handle.slice(0, 2);
  return `${visible}•••@${domain}`;
}

async function getBrokerExtendedSettings(brokerProfileId: string) {
  try {
    const setting = await db.organizationSetting.findUnique({
      where: { key: `broker_ext:${brokerProfileId}` },
    });
    return (setting?.value as Record<string, any>) || {};
  } catch {
    return {};
  }
}

async function saveBrokerExtendedSettings(brokerProfileId: string, data: Record<string, any>, updatedById: string) {
  await db.organizationSetting.upsert({
    where: { key: `broker_ext:${brokerProfileId}` },
    update: {
      value: data as any,
      updatedById,
    },
    create: {
      key: `broker_ext:${brokerProfileId}`,
      value: data as any,
      updatedById,
    },
  });
}

export async function GET(req: NextRequest) {
  try {
    const { brokerProfile, user, brokerId } = await requireBroker(req);

    // Load extended settings (payout, PAN, GST, onboarding checklist)
    const extSettings = await getBrokerExtendedSettings(brokerProfile.id);

    // Compute Onboarding checklist
    const checklist = {
      profileDetails: !!(user.name && user.phone && brokerProfile.companyName && brokerProfile.city),
      payoutConfigured: !!(extSettings.payoutMethod && (extSettings.payoutDetails?.accountNumber || extSettings.payoutDetails?.upiId)),
      kycUploaded: !!(extSettings.panNumber || extSettings.kycDocuments?.panUrl),
      termsAccepted: extSettings.termsAccepted === true,
    };

    const completedCount = Object.values(checklist).filter(Boolean).length;
    const completionPercentage = Math.round((completedCount / 4) * 100);

    const safePayoutDetails = extSettings.payoutDetails
      ? {
          accountHolder: extSettings.payoutDetails.accountHolder || null,
          accountNumberMasked: maskAccountNumber(extSettings.payoutDetails.accountNumber),
          bankName: extSettings.payoutDetails.bankName || null,
          ifsc: extSettings.payoutDetails.ifsc || null,
          upiIdMasked: maskUpiId(extSettings.payoutDetails.upiId),
        }
      : null;

    const profileData = {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      avatarUrl: user.avatarUrl,
      address: user.address,
      status: user.status,
      createdAt: user.createdAt,
      brokerProfile: {
        id: brokerProfile.id,
        partnerId: brokerProfile.partnerId,
        referralCode: brokerProfile.referralCode,
        companyName: brokerProfile.companyName,
        designation: brokerProfile.designation,
        whatsapp: brokerProfile.whatsapp,
        city: brokerProfile.city,
        state: brokerProfile.state,
        country: brokerProfile.country,
        website: brokerProfile.website,
        panNumberMasked: extSettings.panNumber
          ? `${extSettings.panNumber.slice(0, 2)}••••••${extSettings.panNumber.slice(-2)}`
          : null,
        gstNumber: extSettings.gstNumber || null,
        payoutMethod: extSettings.payoutMethod || null,
        payoutDetails: safePayoutDetails,
        createdAt: brokerProfile.createdAt,
        updatedAt: brokerProfile.updatedAt,
      },
      onboarding: {
        completionPercentage,
        isCompleted: completionPercentage === 100,
        checklist,
        termsAcceptedAt: extSettings.termsAcceptedAt || null,
      },
      fieldPermissions: {
        editable: [
          "name",
          "phone",
          "whatsapp",
          "address",
          "companyName",
          "designation",
          "city",
          "state",
          "country",
          "website",
          "panNumber",
          "gstNumber",
          "payoutMethod",
          "payoutDetails",
        ],
        readOnly: ["id", "email", "status", "partnerId", "referralCode", "createdAt"],
      },
    };

    return apiSuccess({ profile: profileData });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { brokerProfile, brokerId, user } = await requireBroker(req);

    checkRateLimit(`broker_profile_patch:${brokerId}`, 10, 60);
    checkIdempotency(`profile_update_${brokerId}`, 1500);

    const body = await req.json().catch(() => ({}));
    const validated = updateProfileSchema.parse(body);

    // Validate payout details if provided
    if (validated.payoutMethod === "BANK_TRANSFER" && validated.payoutDetails) {
      const { accountHolder, accountNumber, ifsc } = validated.payoutDetails;
      if (!accountHolder?.trim() || !accountNumber?.trim() || !ifsc?.trim()) {
        throw new ApiError(
          400,
          "Account holder name, account number, and IFSC are required for Bank Transfer.",
          undefined,
          "INVALID_BANK_DETAILS"
        );
      }
      if (!ifscRegex.test(ifsc.trim())) {
        throw new ApiError(400, "Invalid IFSC code format (e.g., HDFC0001234).", undefined, "INVALID_IFSC");
      }
    } else if (validated.payoutMethod === "UPI" && validated.payoutDetails) {
      const { upiId } = validated.payoutDetails;
      if (!upiId?.trim() || !upiId.includes("@")) {
        throw new ApiError(400, "Valid UPI ID is required (e.g., username@bank).", undefined, "INVALID_UPI");
      }
    }

    // 1. Update User Table
    const userUpdate: any = {};
    if (validated.name !== undefined) userUpdate.name = validated.name.trim();
    if (validated.phone !== undefined) userUpdate.phone = validated.phone?.trim() || null;
    if (validated.address !== undefined) userUpdate.address = validated.address?.trim() || null;

    if (Object.keys(userUpdate).length > 0) {
      await db.user.update({
        where: { id: brokerId },
        data: userUpdate,
      });
    }

    // 2. Update BrokerProfile Table
    const profileUpdate: any = {};
    if (validated.companyName !== undefined) profileUpdate.companyName = validated.companyName?.trim() || null;
    if (validated.designation !== undefined) profileUpdate.designation = validated.designation?.trim() || null;
    if (validated.whatsapp !== undefined) profileUpdate.whatsapp = validated.whatsapp?.trim() || null;
    if (validated.city !== undefined) profileUpdate.city = validated.city?.trim() || null;
    if (validated.state !== undefined) profileUpdate.state = validated.state?.trim() || null;
    if (validated.country !== undefined) profileUpdate.country = validated.country?.trim() || null;
    if (validated.website !== undefined) profileUpdate.website = validated.website?.trim() || null;

    if (Object.keys(profileUpdate).length > 0) {
      await db.brokerProfile.update({
        where: { id: brokerProfile.id },
        data: profileUpdate,
      });
    }

    // 3. Update Extended Settings (payout, PAN, GST)
    const existingExt = await getBrokerExtendedSettings(brokerProfile.id);
    const updatedExt = { ...existingExt };

    if (validated.panNumber !== undefined) updatedExt.panNumber = validated.panNumber ? validated.panNumber.toUpperCase() : null;
    if (validated.gstNumber !== undefined) updatedExt.gstNumber = validated.gstNumber ? validated.gstNumber.toUpperCase() : null;
    if (validated.payoutMethod !== undefined) updatedExt.payoutMethod = validated.payoutMethod;
    if (validated.payoutDetails !== undefined) {
      updatedExt.payoutDetails = {
        ...(existingExt.payoutDetails || {}),
        ...validated.payoutDetails,
      };
    }

    await saveBrokerExtendedSettings(brokerProfile.id, updatedExt, brokerId);

    // Audit Log
    await logBrokerAudit({
      userId: brokerId,
      action: "BROKER_PROFILE_UPDATED",
      resource: `BrokerProfile:${brokerProfile.id}`,
      details: {
        updatedFields: [
          ...Object.keys(userUpdate),
          ...Object.keys(profileUpdate),
          ...(validated.payoutMethod ? ["payoutMethod"] : []),
          ...(validated.panNumber ? ["panNumber"] : []),
          ...(validated.gstNumber ? ["gstNumber"] : []),
        ],
      },
    });

    return apiSuccess(
      {
        message: "Profile updated successfully.",
        payoutConfigured: !!(updatedExt.payoutMethod && updatedExt.payoutDetails),
      },
      undefined,
      { message: "Profile updated successfully." }
    );
  } catch (error) {
    return handleApiError(error);
  }
}
