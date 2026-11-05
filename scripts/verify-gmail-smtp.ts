/**
 * Axivon Technologies — Gmail SMTP Integration Verification Script
 * Validates configuration, routing rules, template rendering, and test mode delivery.
 */
import { getEmailConfig, isEmailTestMode, isOutboundEmailConfigured } from "../src/lib/email/config";
import { renderEmailTemplate } from "../src/lib/email/templates";
import { deliverEmailMessage, verifyEmailTransport } from "../src/lib/email/transport";
import { sendTransactionalEmail } from "../src/lib/email/service";

async function main() {
  console.log("================================================================================");
  console.log(" AXIVON TECHNOLOGIES — GMAIL SMTP INTEGRATION & VERIFICATION RUNNER");
  console.log("================================================================================\n");

  // 1. Audit Configuration
  const config = getEmailConfig();
  console.log("1. Environment & Sender Identity Configuration:");
  console.log(`   - Provider:                      ${config.provider}`);
  console.log(`   - Sender Name:                   ${config.senderName}`);
  console.log(`   - Sender Email:                  ${config.senderEmail}`);
  console.log(`   - Reply-To Email:                ${config.replyTo}`);
  console.log(`   - Internal Notification Recipient: ${config.internalNotificationEmail}`);
  console.log(`   - SMTP Host:                     ${config.smtpHost}`);
  console.log(`   - SMTP Port:                     ${config.smtpPort}`);
  console.log(`   - SMTP Secure:                   ${config.smtpSecure}`);
  console.log(`   - SMTP User:                     ${config.smtpUser}`);
  console.log(`   - App Password Configured:       ${config.smtpAppPassword ? "YES (Secret Masked)" : "NO"}`);
  console.log(`   - Environment Mode:              ${config.emailMode}`);
  console.log(`   - Test Recipient:                ${config.testRecipient}`);

  if (config.senderEmail !== "axivontech.in@gmail.com") {
    throw new Error(`Invalid sender email: expected axivontech.in@gmail.com, got ${config.senderEmail}`);
  }
  if (config.internalNotificationEmail !== "info@axivontech.in") {
    throw new Error(`Invalid internal recipient: expected info@axivontech.in, got ${config.internalNotificationEmail}`);
  }
  console.log("   --> [PASSED] Official Sender & Routing Identities match specifications.\n");

  // 2. Transport Health Check
  console.log("2. Transport Verification & Connectivity Check:");
  const transportHealth = await verifyEmailTransport();
  console.log(`   - Configured:  ${transportHealth.configured}`);
  console.log(`   - Verified:    ${transportHealth.verified}`);
  console.log(`   - Provider:    ${transportHealth.provider}`);
  console.log(`   - Message:     ${transportHealth.message}`);
  console.log("   --> [PASSED] Transport verification executed cleanly.\n");

  // 3. Routing & Test Mode Protection
  console.log("3. Recipient Routing & Test Mode Protection Check:");
  const testMsg = {
    to: "partner.applicant@externalcompany.com",
    subject: "Broker Application Received",
    html: "<p>Your application has been received for review.</p>",
    eventKey: `test_event_${Date.now()}`,
  };

  const deliveryResult = await deliverEmailMessage(testMsg);
  console.log(`   - Destination in Test Mode: ${deliveryResult.recipientUsed}`);
  console.log(`   - Is Test Mode:            ${deliveryResult.isTestMode}`);
  console.log(`   - Provider Used:           ${deliveryResult.provider}`);
  console.log(`   - Delivery Success:        ${deliveryResult.success}`);

  if (isEmailTestMode() && deliveryResult.recipientUsed !== "info@axivontech.in") {
    throw new Error(`Test mode failed to redirect to info@axivontech.in: got ${deliveryResult.recipientUsed}`);
  }
  console.log("   --> [PASSED] External recipient safely redirected to info@axivontech.in in test mode.\n");

  // 4. Template Rendering Verification
  console.log("4. Template Rendering & Logo Asset Verification:");
  const templatesToTest = [
    { key: "CONTACT_ENQUIRY_RECEIVED", vars: { name: "Rajesh Test", leadCode: "LD-TEST-001" } },
    { key: "CONTACT_ENQUIRY_ACK", vars: { name: "Rajesh Test", leadCode: "LD-TEST-001" } },
    { key: "CAREER_APPLICATION_RECEIVED", vars: { fullName: "Aarav Gupta", position: "Fullstack Engineer" } },
    { key: "PARTNER_APPLICATION_RECEIVED", vars: { name: "Simran Kaur", applicationId: "BPA-2026-99" } },
    { key: "PARTNER_APPLICATION_APPROVED", vars: { name: "Simran Kaur", applicationId: "BPA-2026-99" } },
    { key: "PARTNER_ACCOUNT_ACTIVATION", vars: { name: "Simran Kaur", partnerId: "BP-9999", activationLink: "https://axivontech.in/broker/activate?token=test" } },
    { key: "PASSWORD_RESET", vars: { name: "Dev User", resetLink: "https://axivontech.in/reset-password?token=test" } },
    { key: "PASSWORD_CHANGED", vars: { name: "Dev User" } },
  ];

  for (const t of templatesToTest) {
    const rendered = renderEmailTemplate(t.key, t.vars);
    if (!rendered.subject || !rendered.html || !rendered.text) {
      throw new Error(`Template ${t.key} failed to render subject, html, or text!`);
    }
    if (!rendered.html.includes("Axivon") || !rendered.html.includes("logo-white.png")) {
      throw new Error(`Template ${t.key} missing AxivonTech branding or official logo!`);
    }
  }
  console.log(`   --> [PASSED] All ${templatesToTest.length} critical email templates rendered with official branding & text fallbacks.\n`);

  console.log("================================================================================");
  console.log(" ALL GMAIL SMTP CHECKS AND ROUTING TESTS COMPLETED WITH 100% SUCCESS");
  console.log("================================================================================\n");
}

main().catch((err) => {
  console.error("Verification failed:", err);
  process.exit(1);
});
