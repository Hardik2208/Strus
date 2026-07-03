import { MailService } from "../../../core/email/mail.service.js";

export class AuthEmailService {

  // ==================================================
  // Password Changed
  // ==================================================

  static async sendPasswordChangedEmail(
    email: string,
    firstName: string
  ) {
    await MailService.sendMail({
      to: email,

      subject:
        "Your Strus password has been changed",

      html: `
        <h2>Password Changed</h2>

        <p>Hello ${firstName},</p>

        <p>Your Strus password has been changed successfully.</p>

        <p>If you did not perform this action, contact Strus support immediately.</p>

        <br/>

        <p>— Team Strus</p>
      `,
    });
  }

  // ==================================================
  // Forgot Password OTP
  // ==================================================

  static async sendForgotPasswordOtp(
    email: string,
    firstName: string,
    otp: string
  ) {
    await MailService.sendMail({
      to: email,

      subject:
        "Reset your Strus password",

      html: `
        <h2>Password Reset Verification</h2>

        <p>Hello ${firstName},</p>

        <p>Your verification code is:</p>

        <h1>${otp}</h1>

        <p>This code expires in 10 minutes.</p>

        <br/>

        <p>— Team Strus</p>
      `,
    });
  }

  // ==================================================
  // Password Reset
  // ==================================================

  static async sendPasswordResetEmail(
    email: string,
    firstName: string
  ) {
    await MailService.sendMail({
      to: email,

      subject:
        "Your Strus password has been reset",

      html: `
        <h2>Password Reset Successful</h2>

        <p>Hello ${firstName},</p>

        <p>Your password has been reset successfully.</p>

        <p>If this wasn't you, contact Strus support immediately.</p>

        <br/>

        <p>— Team Strus</p>
      `,
    });
  }
}