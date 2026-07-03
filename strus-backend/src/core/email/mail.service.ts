import { transporter } from "./mailer.js";

export class MailService {
  static async sendMail(data: {
    to: string;

    subject: string;

    html: string;
  }): Promise<void> {
    await transporter.sendMail({
      from:
        process.env.SMTP_FROM,

      to: data.to,

      subject: data.subject,

      html: data.html,
    });
  }
}