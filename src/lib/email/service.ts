import { db } from "@/lib/db";

export interface SendEmailOptions {
  to: string;
  templateKey: string;
  variables?: Record<string, any>;
  metadata?: any;
}

export class EmailService {
  static async send(options: SendEmailOptions) {
    const { to, templateKey, variables = {}, metadata } = options;

    let subject = "Axivon Notification";
    let body = "You have a new notification from Axivon Technologies.";

    const template = await db.emailTemplate.findUnique({
      where: { key: templateKey },
    });

    if (template && template.isActive) {
      subject = template.subject;
      body = template.htmlBody;
      for (const [key, val] of Object.entries(variables)) {
        const regex = new RegExp(`{{\\s*${key}\\s*}}`, "g");
        subject = subject.replace(regex, String(val));
        body = body.replace(regex, String(val));
      }
    } else {
      if (variables.title) subject = String(variables.title);
      if (variables.message) body = String(variables.message);
    }

    const log = await db.emailLog.create({
      data: {
        toEmail: to,
        templateKey,
        subject,
        status: "SENT",
        metadata: metadata || variables,
      },
    });

    return log;
  }
}
