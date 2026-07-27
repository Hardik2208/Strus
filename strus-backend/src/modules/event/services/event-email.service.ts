import { MailService } from "../../../core/email/mail.service.js";

export class EventEmailService {

  // ==================================================
  // Project Activated
  // ==================================================

  static async sendProjectActivatedEmail(
    email: string,
    firstName: string,
    projectTitle: string,
    workspaceName: string
  ) {
    await MailService.sendMail({
      to: email,

      subject: `Your project "${projectTitle}" is now active`,

      html: `
        <h2>Project Activated 🚀</h2>

        <p>Hello ${firstName},</p>

        <p>Your project <strong>${projectTitle}</strong> inside <strong>${workspaceName}</strong> is now active.</p>

        <p>Work can now officially begin.</p>

        <p>Please visit Strus to review milestones, timelines, and project updates.</p>

        <br/>

        <p>— Team Strus</p>
      `,
    });
  }

  // ==================================================
  // Submission Under Review
  // ==================================================

  static async sendSubmissionUnderReviewEmail(
    email: string,
    firstName: string,
    projectTitle: string,
    milestoneTitle: string
  ) {
    await MailService.sendMail({
      to: email,

      subject: `Submission ready for review`,

      html: `
        <h2>Submission Under Review</h2>

        <p>Hello ${firstName},</p>

        <p>A submission has been made for milestone <strong>${milestoneTitle}</strong> in project <strong>${projectTitle}</strong>.</p>

        <p>Please review the submitted work at your earliest convenience.</p>

        <br/>

        <p>— Team Strus</p>
      `,
    });
  }

  // ==================================================
  // Project Completed
  // ==================================================

  static async sendProjectCompletedEmail(
    email: string,
    firstName: string,
    projectTitle: string
  ) {
    await MailService.sendMail({
      to: email,

      subject: `Project completed successfully 🎉`,

      html: `
        <h2>Project Completed</h2>

        <p>Hello ${firstName},</p>

        <p>Your project <strong>${projectTitle}</strong> has been completed successfully.</p>

        <p>Thank you for collaborating through Strus.</p>

        <p>We'd love to hear about your experience. Please leave feedback for everyone involved to help build a trusted professional community.</p>

        <br/>

        <p>— Team Strus</p>
      `,
    });
  }

}