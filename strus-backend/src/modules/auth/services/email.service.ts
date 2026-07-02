import { transporter } from "../utils/mail.util.js";

import { env } from "../../../core/config/env.js";

export class EmailService {
  static async sendVerificationOtp(
    email: string,
    firstName: string,
    otp: string
  ) {
    await transporter.sendMail({
      from: `"${env.APP_NAME}" <${env.SMTP_FROM}>`,

      to: email,

      subject: "Verify your email",

      html: `
        <div
          style="
            max-width:600px;
            margin:auto;
            font-family:Arial,sans-serif;
          "
        >
          <h2>Hello ${firstName},</h2>

          <p>
            Your verification code is
          </p>

          <h1
            style="
              letter-spacing:8px;
              font-size:34px;
            "
          >
            ${otp}
          </h1>

          <p>
            If you didn't request this,
            simply ignore this email.
          </p>

          <p>

            — Team Strus

          </p>
        </div>
      `,
    });
  }
}