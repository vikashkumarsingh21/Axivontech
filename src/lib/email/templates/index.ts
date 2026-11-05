import {
  renderEmailHtml,
  renderEmailPlainText,
  formatKolkataDateTime,
  escapeHtml,
} from "./base-layout";

export interface RenderedEmail {
  subject: string;
  html: string;
  text: string;
}

export type EmailTemplateKey =
  | "CONTACT_ENQUIRY_RECEIVED"
  | "CONTACT_ENQUIRY_ACK"
  | "CAREER_APPLICATION_RECEIVED"
  | "CAREER_APPLICATION_ACK"
  | "PARTNER_APPLICATION_RECEIVED"
  | "PARTNER_APPLICATION_ACK"
  | "PARTNER_MEETING_SCHEDULED"
  | "PARTNER_APPLICATION_APPROVED"
  | "PARTNER_APPLICATION_REJECTED"
  | "PARTNER_ACCOUNT_ACTIVATION"
  | "NEW_LEAD_REGISTERED"
  | "LEAD_ACKNOWLEDGEMENT"
  | "LEAD_ASSIGNED"
  | "LEAD_STATUS_UPDATED"
  | "CLIENT_WELCOME"
  | "PROPOSAL_SENT"
  | "CONTRACT_SENT"
  | "CONTRACT_SIGNED"
  | "PAYMENT_RECEIVED"
  | "TASK_ASSIGNED"
  | "LEAVE_REQUEST_SUBMITTED"
  | "LEAVE_APPROVED"
  | "LEAVE_REJECTED"
  | "DEPARTMENT_MANAGER_INVITATION"
  | "PASSWORD_RESET"
  | "PASSWORD_CHANGED"
  | "WELCOME_EMAIL"
  | "EMAIL_CHANGE_VERIFICATION"
  | "EMAIL_CHANGE_SECURITY_ALERT"
  | "EMAIL_CHANGE_CONFIRMED"
  | "GENERIC_NOTIFICATION";

export function renderEmailTemplate(
  key: string,
  variables: Record<string, any> = {}
): RenderedEmail {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://axivontech.in";
  const nowStr = formatKolkataDateTime();

  switch (key) {
    // ── 1. Contact Form Templates ───────────────────────────────────────────
    case "CONTACT_ENQUIRY_RECEIVED": {
      const clientName = variables.name || variables.clientName || variables.fullName || "Client";
      const subject = `[AxivonTech] New Contact Enquiry Received — ${clientName} [${variables.leadCode || "Inbound"}]`;
      const html = renderEmailHtml({
        title: "New Website Contact Enquiry",
        previewText: `New enquiry received from ${clientName} (${variables.service || "General"}).`,
        badge: { text: "New Enquiry", variant: "blue" },
        referenceId: variables.leadCode,
        paragraphs: [
          `A new contact enquiry has been submitted through the public website contact form on ${nowStr}.`,
        ],
        detailsTable: [
          { label: "Applicant Name", value: escapeHtml(clientName) },
          { label: "Email Address", value: `<a href="mailto:${variables.email}">${escapeHtml(variables.email)}</a>` },
          { label: "Phone Number", value: escapeHtml(variables.phone || "Not provided") },
          { label: "Company / Brand", value: escapeHtml(variables.company || "Independent") },
          { label: "Subject / Service", value: escapeHtml(variables.service || "General Inquiry") },
          { label: "Submission Time", value: nowStr },
        ],
        highlightBox: {
          title: "Message / Project Brief",
          content: escapeHtml(variables.message || "No message provided."),
          variant: "info",
        },
        ctaButton: variables.link
          ? { text: "Open Enquiry in Admin CRM", url: variables.link }
          : undefined,
      });

      const text = renderEmailPlainText({
        title: "New Website Contact Enquiry",
        referenceId: variables.leadCode,
        badge: { text: "New Enquiry" },
        paragraphs: [`A new contact enquiry was submitted on ${nowStr}.`],
        detailsTable: [
          { label: "Name", value: variables.name || "N/A" },
          { label: "Email", value: variables.email || "N/A" },
          { label: "Phone", value: variables.phone || "Not provided" },
          { label: "Company", value: variables.company || "Independent" },
          { label: "Subject", value: variables.service || "General Inquiry" },
          { label: "Submission Time", value: nowStr },
        ],
        highlightBox: {
          title: "Message",
          content: variables.message || "No message provided.",
        },
        ctaButton: variables.link
          ? { text: "Open CRM", url: variables.link }
          : undefined,
      });

      return { subject, html, text };
    }

    case "CONTACT_ENQUIRY_ACK": {
      const clientName = variables.name || variables.clientName || variables.fullName || "Valued Client";
      const subject = `Thank You for Contacting Axivon Technologies [${variables.leadCode || "Ref"}]`;
      const html = renderEmailHtml({
        title: "Thank You for Contacting Axivon Technologies",
        previewText: "We have received your enquiry and our team will review it shortly.",
        badge: { text: "Received", variant: "emerald" },
        referenceId: variables.leadCode,
        greeting: clientName,
        paragraphs: [
          `Thank you for reaching out to Axivon Technologies regarding <strong>${escapeHtml(variables.service || "our services")}</strong>.`,
          "We have successfully received your message. Our solutions architecture team is reviewing your requirements and will reach out with next steps.",
        ],
        detailsTable: [
          { label: "Enquiry Reference", value: escapeHtml(variables.leadCode || "N/A") },
          { label: "Service / Topic", value: escapeHtml(variables.service || "General Consultation") },
          { label: "Recorded At", value: nowStr },
        ],
        highlightBox: {
          title: "Direct Assistance & Escalation",
          content: `If you have immediate technical or proposal requirements, you may reach our direct line at <strong>+91 91572 26367</strong> or write to <strong>axivontech.in@gmail.com</strong> quoting reference <code>${escapeHtml(variables.leadCode || "")}</code>.`,
          variant: "info",
        },
      });

      const text = renderEmailPlainText({
        title: "Thank You for Contacting Axivon Technologies",
        referenceId: variables.leadCode,
        greeting: variables.name || "Valued Client",
        paragraphs: [
          `Thank you for reaching out regarding ${variables.service || "our services"}.`,
          "We have received your message. Our solutions architecture team will review your requirements and follow up.",
        ],
        detailsTable: [
          { label: "Reference", value: variables.leadCode || "N/A" },
          { label: "Topic", value: variables.service || "General Consultation" },
          { label: "Recorded", value: nowStr },
        ],
      });

      return { subject, html, text };
    }

    // ── 2. Career & Internship Applications ──────────────────────────────────
    case "CAREER_APPLICATION_RECEIVED": {
      const subject = `[AxivonTech] New Career Application Received — ${variables.position || "Candidate"}`;
      const html = renderEmailHtml({
        title: "New Career / Internship Application",
        previewText: `Application submitted by ${variables.fullName || "Candidate"} for ${variables.position || "Open Role"}.`,
        badge: { text: "Job Application", variant: "blue" },
        referenceId: variables.applicationId,
        paragraphs: [
          `A new candidate application has been submitted via the careers portal on ${nowStr}.`,
        ],
        detailsTable: [
          { label: "Candidate Name", value: escapeHtml(variables.fullName || "N/A") },
          { label: "Email Address", value: `<a href="mailto:${variables.email}">${escapeHtml(variables.email)}</a>` },
          { label: "Phone Number", value: escapeHtml(variables.phone || "Not provided") },
          { label: "Applied Position", value: `<strong>${escapeHtml(variables.position || "General")}</strong>` },
          { label: "Current Location", value: escapeHtml(variables.location || "N/A") },
          { label: "Experience Level", value: escapeHtml(variables.experience || "Not specified") },
          { label: "Resume Reference", value: `<a href="${variables.resumeUrl}" target="_blank">View Resume Document</a>` },
          { label: "Portfolio / LinkedIn", value: escapeHtml(variables.portfolio || variables.linkedin || "N/A") },
        ],
        ctaButton: variables.resumeUrl
          ? { text: "Review Candidate Resume", url: variables.resumeUrl }
          : undefined,
      });

      const text = renderEmailPlainText({
        title: "New Career Application",
        referenceId: variables.applicationId,
        paragraphs: [`Application received for ${variables.position || "role"} on ${nowStr}.`],
        detailsTable: [
          { label: "Candidate", value: variables.fullName || "N/A" },
          { label: "Email", value: variables.email || "N/A" },
          { label: "Position", value: variables.position || "General" },
          { label: "Resume", value: variables.resumeUrl || "N/A" },
        ],
      });

      return { subject, html, text };
    }

    case "CAREER_APPLICATION_ACK": {
      const subject = "Your Application Has Been Received — Axivon Technologies";
      const html = renderEmailHtml({
        title: "Application Received Successfully",
        previewText: `Thank you for applying for ${variables.position || "a role"} at Axivon Technologies.`,
        badge: { text: "Application Logged", variant: "emerald" },
        referenceId: variables.applicationId,
        greeting: variables.fullName || "Applicant",
        paragraphs: [
          `Thank you for your interest in joining Axivon Technologies. We have received your application for the position of <strong>${escapeHtml(variables.position || "the role")}</strong>.`,
          "Our engineering leadership and talent acquisition team are currently reviewing your profile and credentials. If your qualifications match our current requirements, we will reach out to schedule an introductory conversation.",
        ],
        detailsTable: [
          { label: "Position Applied", value: escapeHtml(variables.position || "Open Position") },
          { label: "Application ID", value: escapeHtml(variables.applicationId || "Logged") },
          { label: "Submission Date", value: nowStr },
        ],
        highlightBox: {
          title: "Hiring Process Information",
          content: "Our typical review process takes between 3 to 7 business days. You do not need to resubmit your application during this period.",
          variant: "info",
        },
      });

      const text = renderEmailPlainText({
        title: "Application Received",
        referenceId: variables.applicationId,
        greeting: variables.fullName || "Applicant",
        paragraphs: [
          `Thank you for applying for ${variables.position || "the role"} at Axivon Technologies.`,
          "Our team is reviewing your profile and will contact you if your skills match our requirements.",
        ],
      });

      return { subject, html, text };
    }

    // ── 3. Partner / Broker Application System ──────────────────────────────
    case "PARTNER_APPLICATION_RECEIVED": {
      const subject = `[AxivonTech] New Business Partner Application — ${variables.applicationId || "BPA"}`;
      const html = renderEmailHtml({
        title: "New Business Partner Application",
        previewText: `New partner application from ${variables.name || "Applicant"} (${variables.applicationId}).`,
        badge: { text: "Partner Application", variant: "amber" },
        referenceId: variables.applicationId,
        paragraphs: [
          `A new Business Partner / Broker application has been submitted on ${nowStr}.`,
        ],
        detailsTable: [
          { label: "Applicant Name", value: escapeHtml(variables.name || "N/A") },
          { label: "Application ID", value: escapeHtml(variables.applicationId || "N/A") },
          { label: "Partner Role", value: escapeHtml(variables.occupation || "Broker Partner") },
          { label: "Submission Date", value: nowStr },
        ],
        ctaButton: {
          text: "Review Partner Application in Admin Portal",
          url: `${appUrl}/admin/business-partners/applications`,
        },
      });

      const text = renderEmailPlainText({
        title: "New Partner Application",
        referenceId: variables.applicationId,
        paragraphs: [`New partner application submitted by ${variables.name || "Applicant"}.`],
        ctaButton: {
          text: "Review in Admin Portal",
          url: `${appUrl}/admin/business-partners/applications`,
        },
      });

      return { subject, html, text };
    }

    case "PARTNER_APPLICATION_ACK": {
      const subject = "We Have Received Your Business Partner Application — Axivon Technologies";
      const html = renderEmailHtml({
        title: "Business Partner Application Received",
        previewText: `Your partner application ${variables.applicationId} is in review.`,
        badge: { text: "In Review", variant: "blue" },
        referenceId: variables.applicationId,
        greeting: variables.name || "Partner Applicant",
        paragraphs: [
          `Thank you for applying to join the <strong>Axivon Technologies Business Partner &amp; Broker Network</strong>.`,
          "We have successfully received your credentials and background information. Our partner development team is evaluating your application.",
        ],
        detailsTable: [
          { label: "Application ID", value: `<strong style="font-family: monospace;">${escapeHtml(variables.applicationId || "N/A")}</strong>` },
          { label: "Status", value: "Submitted / Under Initial Review" },
          { label: "Date Submitted", value: nowStr },
        ],
        highlightBox: {
          title: "Next Steps in Partner Onboarding",
          content: "1. Our team verifies partner eligibility and regional coverage.<br />2. If shortlisted, you will receive an invitation to schedule an onboarding consultation.<br />3. Upon approval, your dedicated Broker Portal login and referral credentials will be provisioned.",
          variant: "info",
        },
      });

      const text = renderEmailPlainText({
        title: "Partner Application Received",
        referenceId: variables.applicationId,
        greeting: variables.name || "Partner Applicant",
        paragraphs: [
          "Thank you for applying to join the Axivon Technologies Business Partner Network.",
          "Our partner development team is evaluating your application.",
        ],
      });

      return { subject, html, text };
    }

    case "PARTNER_MEETING_SCHEDULED": {
      const subject = "Your AxivonTech Partner Meeting Has Been Scheduled";
      const html = renderEmailHtml({
        title: "Partner Consultation Scheduled",
        previewText: `Your partner meeting is scheduled for ${variables.meetingDate || "upcoming"}.`,
        badge: { text: "Meeting Scheduled", variant: "emerald" },
        referenceId: variables.applicationId,
        greeting: variables.name || "Partner",
        paragraphs: [
          "We are pleased to invite you to an onboarding and alignment consultation for the Axivon Business Partner Network.",
          "Please review the scheduled date, time, and session details below:",
        ],
        detailsTable: [
          { label: "Meeting Date & Time", value: `<strong>${escapeHtml(variables.meetingDate || "To Be Announced")}</strong>` },
          { label: "Meeting Format", value: escapeHtml(variables.meetingType || "ONLINE") },
          { label: "Access Link / Venue", value: `<a href="${variables.locationOrLink}" target="_blank">${escapeHtml(variables.locationOrLink || "Link to be provided prior to call")}</a>` },
          { label: "Application ID", value: escapeHtml(variables.applicationId || "N/A") },
        ],
        highlightBox: {
          title: "Meeting Preparation",
          content: escapeHtml(variables.instructions || "Please have your business background, regional enterprise contacts, and preferred domain focus areas ready for discussion."),
          variant: "info",
        },
        ctaButton: variables.locationOrLink && variables.locationOrLink.startsWith("http")
          ? { text: "Join Meeting Room", url: variables.locationOrLink }
          : undefined,
      });

      const text = renderEmailPlainText({
        title: "Partner Consultation Scheduled",
        referenceId: variables.applicationId,
        greeting: variables.name || "Partner",
        paragraphs: [
          "Your onboarding consultation for the Axivon Partner Network has been scheduled.",
          `Date & Time: ${variables.meetingDate || "TBA"}`,
          `Format: ${variables.meetingType || "ONLINE"}`,
          `Link/Venue: ${variables.locationOrLink || "TBA"}`,
        ],
      });

      return { subject, html, text };
    }

    case "PARTNER_APPLICATION_APPROVED": {
      const partnerName = variables.name || variables.partnerName || variables.fullName || "Partner";
      const subject = "Congratulations! Your AxivonTech Partner Application Is Approved";
      const html = renderEmailHtml({
        title: "Partner Application Approved",
        previewText: "Your application to join the Axivon Business Partner Network has been officially approved.",
        badge: { text: "Approved", variant: "emerald" },
        referenceId: variables.applicationId,
        greeting: partnerName,
        paragraphs: [
          `We are pleased to inform you that your application (<strong>${escapeHtml(variables.applicationId || "")}</strong>) has been <strong>officially approved</strong>.`,
          "You are now authorized to register leads, introduce enterprise projects, and earn verified broker commissions across our service portfolio.",
          "Your dedicated Broker Portal login account and secure password setup link are being generated.",
        ],
        detailsTable: [
          { label: "Partner Name", value: escapeHtml(partnerName) },
          { label: "Application ID", value: escapeHtml(variables.applicationId || "N/A") },
          { label: "Approval Date", value: nowStr },
        ],
        highlightBox: {
          title: "Account Activation Notice",
          content: "You will receive a separate secure password setup invitation. Please complete your password setup upon receipt to access your real-time commission dashboard.",
          variant: "success",
        },
      });

      const text = renderEmailPlainText({
        title: "Partner Application Approved",
        referenceId: variables.applicationId,
        greeting: variables.name || "Partner",
        paragraphs: [
          "Your application has been officially approved.",
          "You are now authorized to introduce enterprise projects and earn verified commissions.",
        ],
      });

      return { subject, html, text };
    }

    case "PARTNER_APPLICATION_REJECTED": {
      const subject = "Update Regarding Your AxivonTech Partner Application";
      const html = renderEmailHtml({
        title: "Partner Application Status Update",
        previewText: "Important update regarding your Axivon Business Partner application.",
        badge: { text: "Decision Recorded", variant: "gray" },
        referenceId: variables.applicationId,
        greeting: variables.name || "Applicant",
        paragraphs: [
          `Thank you for taking the time to apply to the Axivon Technologies Business Partner Network and for sharing your background with us.`,
          "After careful consideration of our current regional quotas and strategic coverage requirements, we are unable to advance your partner application at this time.",
          "We sincerely appreciate your interest in Axivon Technologies and wish you the very best in your business endeavors.",
        ],
        detailsTable: [
          { label: "Application ID", value: escapeHtml(variables.applicationId || "N/A") },
          { label: "Review Date", value: nowStr },
        ],
      });

      const text = renderEmailPlainText({
        title: "Partner Application Status Update",
        referenceId: variables.applicationId,
        greeting: variables.name || "Applicant",
        paragraphs: [
          "Thank you for applying to the Axivon Business Partner Network.",
          "Due to current regional capacity, we are unable to approve your application at this time.",
        ],
      });

      return { subject, html, text };
    }

    case "PARTNER_ACCOUNT_ACTIVATION": {
      const subject = "Your AxivonTech Partner Account Is Ready";
      const loginUrl = `${appUrl}/login`;
      const html = renderEmailHtml({
        title: "Welcome to the Axivon Partner Network",
        previewText: "Your broker partner account is ready. Complete your secure password setup to access your portal.",
        badge: { text: "Account Ready", variant: "emerald" },
        referenceId: variables.partnerId,
        greeting: variables.name || "Partner",
        paragraphs: [
          "Your official Axivon Technologies Business Partner account has been provisioned and is ready for activation.",
          "To begin registering leads, generating client project links, and viewing contractual milestones, please activate your account and establish your confidential password.",
        ],
        detailsTable: [
          { label: "Login ID (Email)", value: `<strong style="font-family: monospace;">${escapeHtml(variables.email || variables.to || variables.loginId || "")}</strong>` },
          { label: "Partner ID", value: `<span style="font-family: monospace;">${escapeHtml(variables.partnerId || "AXP-NEW")}</span>` },
          { label: "Referral Code", value: `<strong style="color: #C2A878; font-family: monospace;">${escapeHtml(variables.referralCode || "PENDING")}</strong>` },
          { label: "Broker Portal URL", value: `<a href="${loginUrl}">${loginUrl}</a>` },
        ],
        highlightBox: variables.temporaryPassword
          ? {
              title: "Temporary Account Credentials",
              content: `Your temporary login password is: <strong style="font-family: monospace; font-size: 15px; background: #e5e7eb; padding: 2px 6px; border-radius: 4px;">${escapeHtml(variables.temporaryPassword)}</strong><br /><span style="font-size: 12px; color: #6b7280;">You will be prompted to choose a permanent private password upon initial login.</span>`,
              variant: "warning",
            }
          : undefined,
        ctaButton: {
          text: "Activate Partner Account & Set Password",
          url: variables.activationLink || variables.activationUrl || loginUrl,
        },
        securityNote: "For your security, this single-use activation link expires in 48 hours. Never share this link or your password with anyone. Axivon staff will never request your password.",
      });

      const text = renderEmailPlainText({
        title: "Your AxivonTech Partner Account Is Ready",
        referenceId: variables.partnerId,
        greeting: variables.name || "Partner",
        paragraphs: [
          "Your official Business Partner account has been provisioned.",
          `Login ID (Email): ${variables.email || variables.to || variables.loginId || "N/A"}`,
          `Partner ID: ${variables.partnerId || "AXP-NEW"}`,
          `Referral Code: ${variables.referralCode || "N/A"}`,
          variables.temporaryPassword ? `Temporary Password: ${variables.temporaryPassword}` : "",
        ].filter(Boolean),
        ctaButton: {
          text: "Set Your Password",
          url: variables.activationLink || variables.activationUrl || loginUrl,
        },
        securityNote: "Single-use activation link expires in 48 hours.",
      });

      return { subject, html, text };
    }

    // ── 4. CRM & Sales Workflows ─────────────────────────────────────────────
    case "NEW_LEAD_REGISTERED": {
      const leadName = variables.name || variables.clientName || variables.fullName || "";
      const subject = `[AxivonTech CRM] New Lead Registered — ${leadName ? `${leadName} [${variables.leadCode || "Lead"}]` : (variables.leadCode || "Lead")}`;
      const html = renderEmailHtml({
        title: "New Lead Registered in CRM",
        previewText: `New lead registered: ${variables.name || "Client"} (${variables.leadCode}).`,
        badge: { text: "CRM Lead", variant: "emerald" },
        referenceId: variables.leadCode,
        paragraphs: [
          `A new enterprise lead has been registered in the CRM on ${nowStr}.`,
        ],
        detailsTable: [
          { label: "Client Name", value: escapeHtml(variables.name || "N/A") },
          { label: "Email Address", value: escapeHtml(variables.email || "N/A") },
          { label: "Phone Number", value: escapeHtml(variables.phone || "N/A") },
          { label: "Company / Brand", value: escapeHtml(variables.company || "Independent") },
          { label: "Required Service", value: `<strong>${escapeHtml(variables.service || "Software Development")}</strong>` },
          { label: "Estimated Budget", value: escapeHtml(variables.budget || "Flexible") },
          { label: "Assigned Broker", value: escapeHtml(variables.brokerName || "Direct Website / Internal") },
        ],
        highlightBox: {
          title: "Project Brief",
          content: escapeHtml(variables.message || "No brief specified."),
          variant: "info",
        },
        ctaButton: variables.link
          ? { text: "View Lead in AXIVON ONE CRM", url: variables.link }
          : undefined,
      });

      const text = renderEmailPlainText({
        title: "New Lead Registered",
        referenceId: variables.leadCode,
        paragraphs: [`New lead registered: ${variables.name || "Client"} on ${nowStr}.`],
        detailsTable: [
          { label: "Name", value: variables.name || "N/A" },
          { label: "Company", value: variables.company || "Independent" },
          { label: "Service", value: variables.service || "N/A" },
        ],
      });

      return { subject, html, text };
    }

    case "LEAD_ASSIGNED": {
      const subject = `New Lead Assigned to You — ${variables.leadCode || "Axivon CRM"}`;
      const html = renderEmailHtml({
        title: "Lead Assignment Notification",
        previewText: `You have been assigned to handle lead ${variables.leadCode || ""}.`,
        badge: { text: "Assigned to You", variant: "blue" },
        referenceId: variables.leadCode,
        greeting: variables.assigneeName || "Team Member",
        paragraphs: [
          `You have been assigned as the primary representative for prospective client <strong>${escapeHtml(variables.clientName || "Client")}</strong>.`,
          "Please review the client brief and initiate the initial technical qualification call within the designated response window.",
        ],
        detailsTable: [
          { label: "Client Name", value: escapeHtml(variables.clientName || "N/A") },
          { label: "Lead Code", value: escapeHtml(variables.leadCode || "N/A") },
          { label: "Service Focus", value: escapeHtml(variables.service || "Custom Software") },
          { label: "Assigned By", value: escapeHtml(variables.assignedBy || "Administrator") },
        ],
        ctaButton: variables.link
          ? { text: "Open Lead Details", url: variables.link }
          : undefined,
      });

      const text = renderEmailPlainText({
        title: "Lead Assigned",
        referenceId: variables.leadCode,
        greeting: variables.assigneeName || "Team Member",
        paragraphs: [`Lead ${variables.leadCode} has been assigned to you.`],
      });

      return { subject, html, text };
    }

    // ── 5. Project & Financial Workflows ──────────────────────────────────────
    case "PAYMENT_RECEIVED": {
      const subject = `Payment Received — Axivon Technologies [${variables.paymentCode || "Receipt"}]`;
      const html = renderEmailHtml({
        title: "Payment Receipt Confirmation",
        previewText: `Verified payment of ${variables.amount || ""} received.`,
        badge: { text: "Payment Verified", variant: "emerald" },
        referenceId: variables.paymentCode,
        greeting: variables.clientName || "Valued Client",
        paragraphs: [
          `We have successfully received and verified your payment of <strong>${escapeHtml(variables.amount || "₹0")}</strong> for project <strong>${escapeHtml(variables.projectName || "Enterprise Software")}</strong>.`,
          "Your transaction has been recorded in the client ledger and your project milestone status has been updated accordingly.",
        ],
        detailsTable: [
          { label: "Receipt / UTR Ref", value: escapeHtml(variables.paymentCode || "N/A") },
          { label: "Invoice Number", value: escapeHtml(variables.invoiceNumber || "N/A") },
          { label: "Amount Settled", value: `<strong>${escapeHtml(variables.amount || "₹0")}</strong>` },
          { label: "Payment Date", value: nowStr },
          { label: "Project Code", value: escapeHtml(variables.projectCode || "N/A") },
        ],
        highlightBox: {
          title: "Milestone Progression",
          content: "Development and milestone execution continue according to your project schedule. Verified project delivery reports will be published in your Client Portal.",
          variant: "success",
        },
      });

      const text = renderEmailPlainText({
        title: "Payment Confirmation",
        referenceId: variables.paymentCode,
        greeting: variables.clientName || "Valued Client",
        paragraphs: [
          `Payment of ${variables.amount || "₹0"} verified for ${variables.projectName || "Project"}.`,
        ],
      });

      return { subject, html, text };
    }

    // ── 6. Employee & Department Management ──────────────────────────────────
    case "TASK_ASSIGNED": {
      const subject = `New Task Assigned to You — ${variables.taskTitle || "Axivon Workspace"}`;
      const html = renderEmailHtml({
        title: "New Task Assignment",
        previewText: `New task assigned: ${variables.taskTitle || ""}. Priority: ${variables.priority || "NORMAL"}.`,
        badge: { text: variables.priority || "NORMAL", variant: variables.priority === "URGENT" || variables.priority === "HIGH" ? "red" : "blue" },
        greeting: variables.employeeName || "Team Member",
        paragraphs: [
          `A new task has been assigned to you by <strong>${escapeHtml(variables.assignedBy || "Management")}</strong>.`,
        ],
        detailsTable: [
          { label: "Task Title", value: `<strong>${escapeHtml(variables.taskTitle || "N/A")}</strong>` },
          { label: "Priority", value: escapeHtml(variables.priority || "NORMAL") },
          { label: "Due Date", value: escapeHtml(variables.dueDate || "Not specified") },
          { label: "Project", value: escapeHtml(variables.projectName || "Internal Operations") },
        ],
        ctaButton: {
          text: "View Task & Begin Work",
          url: `${appUrl}/employee/tasks`,
        },
      });

      const text = renderEmailPlainText({
        title: "Task Assigned",
        greeting: variables.employeeName || "Team Member",
        paragraphs: [
          `Task assigned: ${variables.taskTitle || "N/A"}.`,
          `Priority: ${variables.priority || "NORMAL"}`,
          `Due: ${variables.dueDate || "N/A"}`,
        ],
      });

      return { subject, html, text };
    }

    case "LEAVE_REQUEST_SUBMITTED": {
      const subject = `New Leave Request — ${variables.employeeName || "Employee"}`;
      const html = renderEmailHtml({
        title: "Leave Application Submitted",
        previewText: `${variables.employeeName || "Employee"} submitted a leave request.`,
        badge: { text: "Pending Approval", variant: "amber" },
        greeting: variables.managerName || "Department Manager",
        paragraphs: [
          `<strong>${escapeHtml(variables.employeeName || "An employee")}</strong> has submitted a new leave application requiring your managerial review.`,
        ],
        detailsTable: [
          { label: "Employee Name", value: escapeHtml(variables.employeeName || "N/A") },
          { label: "Leave Type", value: escapeHtml(variables.leaveType || "CASUAL") },
          { label: "Start Date", value: escapeHtml(variables.startDate || "N/A") },
          { label: "End Date", value: escapeHtml(variables.endDate || "N/A") },
          { label: "Total Days", value: `${escapeHtml(variables.totalDays || "1")} Day(s)` },
        ],
        highlightBox: {
          title: "Reason Provided by Employee",
          content: escapeHtml(variables.reason || "No specific reason provided."),
          variant: "info",
        },
        ctaButton: {
          text: "Review & Decide in Manager Portal",
          url: `${appUrl}/manager/leaves`,
        },
      });

      const text = renderEmailPlainText({
        title: "Leave Request Submitted",
        greeting: variables.managerName || "Manager",
        paragraphs: [
          `${variables.employeeName || "Employee"} submitted a leave request for ${variables.totalDays || "1"} day(s).`,
          `Dates: ${variables.startDate || "N/A"} to ${variables.endDate || "N/A"}`,
        ],
      });

      return { subject, html, text };
    }

    case "LEAVE_APPROVED": {
      const subject = "Your Leave Request Has Been Approved — Axivon Technologies";
      const html = renderEmailHtml({
        title: "Leave Request Approved",
        previewText: "Your leave application has been approved by your department manager.",
        badge: { text: "Approved", variant: "emerald" },
        greeting: variables.employeeName || "Team Member",
        paragraphs: [
          "Your leave application has been <strong>approved</strong> by your department leadership.",
          "Your attendance and leave quota records have been updated accordingly.",
        ],
        detailsTable: [
          { label: "Leave Type", value: escapeHtml(variables.leaveType || "CASUAL") },
          { label: "Start Date", value: escapeHtml(variables.startDate || "N/A") },
          { label: "End Date", value: escapeHtml(variables.endDate || "N/A") },
          { label: "Approved By", value: escapeHtml(variables.managerName || "Department Manager") },
        ],
      });

      const text = renderEmailPlainText({
        title: "Leave Approved",
        greeting: variables.employeeName || "Team Member",
        paragraphs: ["Your leave application has been approved."],
      });

      return { subject, html, text };
    }

    case "LEAVE_REJECTED": {
      const subject = "Update on Your Leave Request — Axivon Technologies";
      const html = renderEmailHtml({
        title: "Leave Request Decision",
        previewText: "Your leave application could not be approved at this time.",
        badge: { text: "Rejected", variant: "red" },
        greeting: variables.employeeName || "Team Member",
        paragraphs: [
          "Your leave application could not be approved for the requested dates.",
        ],
        detailsTable: [
          { label: "Leave Type", value: escapeHtml(variables.leaveType || "CASUAL") },
          { label: "Dates Requested", value: `${escapeHtml(variables.startDate || "")} to ${escapeHtml(variables.endDate || "")}` },
          { label: "Reviewed By", value: escapeHtml(variables.managerName || "Management") },
        ],
        highlightBox: {
          title: "Manager Feedback / Note",
          content: escapeHtml(variables.reason || "Please consult with your department manager regarding project coverage."),
          variant: "alert",
        },
      });

      const text = renderEmailPlainText({
        title: "Leave Request Update",
        greeting: variables.employeeName || "Team Member",
        paragraphs: ["Your leave application could not be approved."],
      });

      return { subject, html, text };
    }

    // ── 7. Account & Security Events ─────────────────────────────────────────
    case "PASSWORD_RESET": {
      const subject = "Password Reset Request — Axivon Technologies";
      const html = renderEmailHtml({
        title: "Password Reset Request",
        previewText: "A password reset request was initiated for your Axivon Technologies account.",
        badge: { text: "Security Action", variant: "amber" },
        greeting: variables.name || "User",
        paragraphs: [
          "We received a request to reset the password for your Axivon Technologies account.",
          "To choose a new confidential password, please click the secure link below:",
        ],
        ctaButton: {
          text: "Reset Confidential Password",
          url: variables.resetLink || `${appUrl}/login`,
        },
        securityNote: "This single-use reset link expires in 60 minutes. If you did not initiate this request, your account may be compromised. Please contact axivontech.in@gmail.com immediately.",
      });

      const text = renderEmailPlainText({
        title: "Password Reset Request",
        greeting: variables.name || "User",
        paragraphs: [
          "We received a request to reset your password.",
          `Reset Link: ${variables.resetLink || `${appUrl}/login`}`,
        ],
        securityNote: "Link expires in 60 minutes. If you did not request this, contact support immediately.",
      });

      return { subject, html, text };
    }

    case "PASSWORD_CHANGED": {
      const subject = "Security Alert: Your Password Was Changed — Axivon Technologies";
      const html = renderEmailHtml({
        title: "Password Changed Successfully",
        previewText: "Your account password was recently updated.",
        badge: { text: "Security Alert", variant: "emerald" },
        greeting: variables.name || "User",
        paragraphs: [
          "This is a confirmation that the confidential password for your Axivon Technologies account was successfully changed on " + nowStr + ".",
          "If you made this change, you can safely disregard this email.",
        ],
        highlightBox: {
          title: "Did You Not Make This Change?",
          content: "If you did not authorize this change, please contact administration immediately at <strong>axivontech.in@gmail.com</strong> or your company technical liaison to freeze access.",
          variant: "alert",
        },
      });

      const text = renderEmailPlainText({
        title: "Password Changed",
        greeting: variables.name || "User",
        paragraphs: [
          `Your password was changed on ${nowStr}. If you did not do this, contact support immediately.`,
        ],
      });

      return { subject, html, text };
    }

    case "WELCOME_EMAIL": {
      const subject = `Welcome ${variables.name || "Team Member"} to Axivon`;
      const html = renderEmailHtml({
        title: "Welcome to Axivon Technologies",
        previewText: "Your account is active.",
        greeting: variables.name || "Team Member",
        paragraphs: [
          "Welcome to Axivon Technologies! Your account has been provisioned and is ready for use.",
          "You can access your portal at any time to manage your tasks, projects, and collaboration.",
        ],
        ctaButton: {
          text: "Log In to Your Portal",
          url: variables.loginUrl || `${appUrl}/login`,
        },
      });
      const text = renderEmailPlainText({
        title: "Welcome to Axivon",
        greeting: variables.name || "Team Member",
        paragraphs: [
          "Welcome to Axivon Technologies! Your account has been provisioned.",
          `Log in here: ${variables.loginUrl || `${appUrl}/login`}`,
        ],
      });
      return { subject, html, text };
    }

    // ── Default Fallback ─────────────────────────────────────────────────────
    default: {
      const subject = variables.title || "Notification from Axivon Technologies";
      const message = variables.message || "You have a new update regarding your Axivon Technologies services.";
      const html = renderEmailHtml({
        title: variables.title || "Axivon Notification",
        paragraphs: [escapeHtml(message)],
        ctaButton: variables.link
          ? { text: "View in Axivon Portal", url: variables.link }
          : undefined,
      });

      const text = renderEmailPlainText({
        title: variables.title || "Axivon Notification",
        paragraphs: [message],
        ctaButton: variables.link
          ? { text: "View Details", url: variables.link }
          : undefined,
      });

      return { subject, html, text };
    }
  }
}
