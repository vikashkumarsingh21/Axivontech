import { ColumnDefinition } from "./excel-builder";

export interface ApplicationsExportFilters {
  statuses?: string[];
  search?: string;
  country?: string;
  state?: string;
  city?: string;
  occupation?: string;
  dateFrom?: string;
  dateTo?: string;
  dateField?: "createdAt" | "reviewedAt";
}

export interface ConfirmedPartnersExportFilters {
  statuses?: string[];
  search?: string;
  country?: string;
  state?: string;
  city?: string;
  onboardingState?: "ALL" | "COMPLETED" | "IN_PROGRESS";
  kycStatus?: "ALL" | "VERIFIED" | "PENDING_REVIEW" | "NOT_UPLOADED";
  hasProjects?: boolean;
  hasCommission?: boolean;
  dateFrom?: string;
  dateTo?: string;
}

export interface ExportExecutionParams {
  type: "APPLICATIONS" | "CONFIRMED_PARTNERS" | "SINGLE_PARTNER";
  partnerIdOrUserId?: string;
  filters?: ApplicationsExportFilters | ConfirmedPartnersExportFilters;
  columns?: string[];
  format?: "xlsx" | "csv";
  exportScope?: "ALL_MATCHING" | "SELECTED_IDS" | "LATEST_N";
  selectedIds?: string[];
  latestNCount?: number;
  includeRelatedData?: boolean;
  sensitiveUnmasked?: boolean;
  requestedBy: {
    userId: string;
    name: string;
    email: string;
  };
}

export const APPLICATION_COLUMNS: ColumnDefinition[] = [
  { key: "applicationId", header: "Application ID", width: 18, type: "text" },
  { key: "status", header: "Status", width: 16, type: "text" },
  { key: "fullName", header: "Full Name", width: 22, type: "text" },
  { key: "email", header: "Email Address", width: 26, type: "text" },
  { key: "emailVerified", header: "Email Verified", width: 18, type: "text" },
  { key: "phone", header: "Phone Number", width: 18, type: "text" },
  { key: "country", header: "Country", width: 16, type: "text" },
  { key: "state", header: "State", width: 16, type: "text" },
  { key: "city", header: "City", width: 16, type: "text" },
  { key: "occupation", header: "Occupation", width: 18, type: "text" },
  { key: "currentWork", header: "Current Work / Entity", width: 24, type: "text" },
  { key: "yearsOfExperience", header: "Years Experience", width: 16, type: "integer" },
  { key: "relevantExperience", header: "Relevant Experience", width: 35, type: "text" },
  { key: "clientNetwork", header: "Client Network Reach", width: 35, type: "text" },
  { key: "edu10thSchool", header: "10th School", width: 24, type: "text" },
  { key: "edu10thBoard", header: "10th Board", width: 16, type: "text" },
  { key: "edu10thYear", header: "10th Year", width: 14, type: "text" },
  { key: "edu10thScore", header: "10th Score", width: 14, type: "text" },
  { key: "edu12thSchool", header: "12th School", width: 24, type: "text" },
  { key: "edu12thBoard", header: "12th Board", width: 16, type: "text" },
  { key: "edu12thYear", header: "12th Year", width: 14, type: "text" },
  { key: "edu12thScore", header: "12th Score", width: 14, type: "text" },
  { key: "eduUGDegree", header: "Undergrad Degree", width: 20, type: "text" },
  { key: "eduUGBranch", header: "Undergrad Branch", width: 20, type: "text" },
  { key: "eduUGCollege", header: "Undergrad College", width: 26, type: "text" },
  { key: "eduUGYear", header: "Undergrad Year", width: 14, type: "text" },
  { key: "motivation", header: "Motivation Statement", width: 40, type: "text" },
  { key: "contribution", header: "Expected Contribution", width: 40, type: "text" },
  { key: "additionalInfo", header: "Additional Notes", width: 30, type: "text" },
  { key: "decisionReason", header: "Decision Reason", width: 26, type: "text" },
  { key: "reviewedBy", header: "Reviewed By", width: 20, type: "text" },
  { key: "reviewedAt", header: "Reviewed At", width: 18, type: "date" },
  { key: "createdAt", header: "Application Date", width: 18, type: "date" },
  { key: "updatedAt", header: "Last Updated", width: 18, type: "date" },
];

export const CONFIRMED_PARTNER_COLUMNS: ColumnDefinition[] = [
  { key: "partnerId", header: "Partner ID", width: 18, type: "text" },
  { key: "referralCode", header: "Referral Code", width: 18, type: "text" },
  { key: "name", header: "Partner Name", width: 22, type: "text" },
  { key: "email", header: "Work Email", width: 26, type: "text" },
  { key: "phone", header: "Phone Number", width: 18, type: "text" },
  { key: "whatsapp", header: "WhatsApp", width: 18, type: "text" },
  { key: "status", header: "Account Status", width: 16, type: "text" },
  { key: "companyName", header: "Company Name", width: 24, type: "text" },
  { key: "designation", header: "Designation", width: 20, type: "text" },
  { key: "website", header: "Website", width: 24, type: "text" },
  { key: "city", header: "City", width: 16, type: "text" },
  { key: "state", header: "State", width: 16, type: "text" },
  { key: "country", header: "Country", width: 16, type: "text" },
  { key: "address", header: "Address", width: 28, type: "text" },
  { key: "onboardingState", header: "Onboarding State", width: 18, type: "text" },
  { key: "termsAccepted", header: "Terms Accepted", width: 16, type: "text" },
  { key: "termsAcceptedAt", header: "Terms Accepted Date", width: 20, type: "date" },
  { key: "kycStatus", header: "KYC Status", width: 18, type: "text" },
  { key: "panNumber", header: "PAN Number", width: 18, type: "text" },
  { key: "gstNumber", header: "GST Number", width: 20, type: "text" },
  { key: "payoutMethod", header: "Payout Method", width: 18, type: "text" },
  { key: "accountHolder", header: "Bank Account Holder", width: 22, type: "text" },
  { key: "bankName", header: "Bank Name", width: 20, type: "text" },
  { key: "accountNumber", header: "Account Number", width: 22, type: "text" },
  { key: "ifsc", header: "IFSC Code", width: 16, type: "text" },
  { key: "upiId", header: "UPI ID", width: 22, type: "text" },
  { key: "totalLeads", header: "Total Leads", width: 14, type: "integer" },
  { key: "activeProjects", header: "Active Projects", width: 16, type: "integer" },
  { key: "totalProjects", header: "Total Projects", width: 16, type: "integer" },
  { key: "totalCommissionEarned", header: "Commission Earned (₹)", width: 22, type: "currency" },
  { key: "totalCommissionPaid", header: "Commission Paid (₹)", width: 22, type: "currency" },
  { key: "pendingCommission", header: "Pending Commission (₹)", width: 22, type: "currency" },
  { key: "createdAt", header: "Created Date", width: 18, type: "date" },
  { key: "updatedAt", header: "Last Updated", width: 18, type: "date" },
];

export const RELATED_LEADS_COLUMNS: ColumnDefinition[] = [
  { key: "leadCode", header: "Lead Code", width: 16, type: "text" },
  { key: "partnerIdentifier", header: "Partner Identifier", width: 20, type: "text" },
  { key: "name", header: "Lead Name", width: 22, type: "text" },
  { key: "email", header: "Email Address", width: 24, type: "text" },
  { key: "phone", header: "Phone Number", width: 18, type: "text" },
  { key: "companyName", header: "Company", width: 22, type: "text" },
  { key: "serviceInterest", header: "Service Interest", width: 22, type: "text" },
  { key: "status", header: "Pipeline Status", width: 16, type: "text" },
  { key: "qualificationStatus", header: "Qualification", width: 16, type: "text" },
  { key: "budget", header: "Estimated Budget (₹)", width: 20, type: "currency" },
  { key: "createdAt", header: "Lead Created Date", width: 18, type: "date" },
];

export const RELATED_PROJECTS_COLUMNS: ColumnDefinition[] = [
  { key: "projectCode", header: "Project Code", width: 16, type: "text" },
  { key: "projectName", header: "Project Name", width: 24, type: "text" },
  { key: "partnerIdentifier", header: "Partner Identifier", width: 20, type: "text" },
  { key: "clientName", header: "Client Name", width: 22, type: "text" },
  { key: "clientEmail", header: "Client Email", width: 24, type: "text" },
  { key: "companyName", header: "Client Company", width: 22, type: "text" },
  { key: "requiredService", header: "Service Required", width: 22, type: "text" },
  { key: "projectBudget", header: "Estimated Budget", width: 18, type: "text" },
  { key: "finalProjectValue", header: "Final Value (₹)", width: 20, type: "currency" },
  { key: "status", header: "Project Status", width: 20, type: "text" },
  { key: "qaStatus", header: "QA Status", width: 18, type: "text" },
  { key: "progressPercentage", header: "Progress %", width: 14, type: "integer" },
  { key: "startedAt", header: "Started Date", width: 18, type: "date" },
  { key: "completedAt", header: "Completed Date", width: 18, type: "date" },
];

export const RELATED_COMMISSIONS_COLUMNS: ColumnDefinition[] = [
  { key: "id", header: "Commission ID", width: 18, type: "text" },
  { key: "partnerIdentifier", header: "Partner Identifier", width: 20, type: "text" },
  { key: "projectCode", header: "Project Code", width: 16, type: "text" },
  { key: "projectValue", header: "Project Value (₹)", width: 20, type: "currency" },
  { key: "commissionType", header: "Type", width: 16, type: "text" },
  { key: "commissionRate", header: "Rate (%)", width: 14, type: "integer" },
  { key: "commissionAmount", header: "Commission Amount (₹)", width: 22, type: "currency" },
  { key: "status", header: "Commission Status", width: 18, type: "text" },
  { key: "approvedAt", header: "Approved Date", width: 18, type: "date" },
  { key: "paidAt", header: "Paid Date", width: 18, type: "date" },
  { key: "payoutReference", header: "Payout Reference / UTR", width: 24, type: "text" },
  { key: "createdAt", header: "Created Date", width: 18, type: "date" },
];

export const RELATED_PAYMENTS_COLUMNS: ColumnDefinition[] = [
  { key: "id", header: "Payment ID", width: 18, type: "text" },
  { key: "projectCode", header: "Project Code", width: 16, type: "text" },
  { key: "projectPrice", header: "Project Price (₹)", width: 20, type: "currency" },
  { key: "advanceAmount", header: "Advance Amount (₹)", width: 20, type: "currency" },
  { key: "remainingAmount", header: "Remaining Amount (₹)", width: 20, type: "currency" },
  { key: "paymentMethod", header: "Method", width: 14, type: "text" },
  { key: "amountPaid", header: "Amount Paid (₹)", width: 20, type: "currency" },
  { key: "transactionId", header: "Transaction ID / UTR", width: 22, type: "text" },
  { key: "paymentDate", header: "Payment Date", width: 18, type: "date" },
  { key: "status", header: "Payment Status", width: 18, type: "text" },
  { key: "createdAt", header: "Record Created", width: 18, type: "date" },
];
