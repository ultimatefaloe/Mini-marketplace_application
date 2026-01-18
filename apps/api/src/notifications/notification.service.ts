import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import notificationapi from "notificationapi-node-server-sdk";

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  constructor(private readonly config: ConfigService) {
    const clientId = this.config.get<string>("NOTIFICATION_CLIENTID");
    const secret = this.config.get<string>("NOTIFICATION_SECRET");

    if (!clientId || !secret) {
      this.logger.error("Notification API credentials are missing");
      throw new Error("Notification API is not properly configured");
    }

    // IMPORTANT: init() does NOT return anything
    notificationapi.init(clientId, secret);

    this.logger.log("Notification API initialized successfully");
  }

  async sendEmail(data: { to: string; subject: string; html: string }) {
    try {
      if (!data.to || !data.subject || !data.html) {
        this.logger.warn("sendEmail called with incomplete data", data);
        return;
      }

      const response = await notificationapi.send({
        type: "meudeliver_notification",
        to: {
          id: data.to,
          email: data.to,
          // number: '+15005550006' // Replace with your phone number, use format [+][country code][area code][local number]
        },
        email: {
          subject: data.subject,
          html: data.html,
        },
        // sms: {
        //   message: 'Your verification code is: 123456'
        // }
      });

    } catch (error) {
      this.logger.error(
        `Failed to send email to ${data.to}`,
        error instanceof Error ? error.stack : undefined,
      );
    }
  }
}
