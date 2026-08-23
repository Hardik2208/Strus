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

  // ==================================================
// Negotiation Created
// ==================================================

static async sendNegotiationCreatedEmail(
  email: string,
  firstName: string,
  projectTitle: string,
  milestoneTitle: string
) {
  await MailService.sendMail({
    to: email,

    subject: `Negotiation request received for "${milestoneTitle}"`,

    html: `
      <h2>Negotiation Request Received</h2>

      <p>Hello ${firstName},</p>

      <p>The client has requested changes for milestone
      <strong>${milestoneTitle}</strong> in project
      <strong>${projectTitle}</strong>.</p>

      <p>Please review the proposed changes and respond within
      <strong>7 days</strong>.</p>

      <p>If no response is received within the allowed period,
      the negotiation will automatically expire.</p>

      <br/>

      <p>— Team Strus</p>
    `,
  });
}

// ==================================================
// Negotiation Accepted
// ==================================================

static async sendNegotiationAcceptedEmail(
  email: string,
  firstName: string,
  projectTitle: string,
  milestoneTitle: string
) {
  await MailService.sendMail({
    to: email,

    subject: `Negotiation accepted for "${milestoneTitle}"`,

    html: `
      <h2>Negotiation Accepted</h2>

      <p>Hello ${firstName},</p>

      <p>Your negotiation request for milestone
      <strong>${milestoneTitle}</strong> in project
      <strong>${projectTitle}</strong>
      has been accepted.</p>

      <p>The updated milestone terms are now in effect.</p>

      <br/>

      <p>— Team Strus</p>
    `,
  });
}

// ==================================================
// Negotiation Declined
// ==================================================

static async sendNegotiationDeclinedEmail(
  email: string,
  firstName: string,
  projectTitle: string,
  milestoneTitle: string
) {
  await MailService.sendMail({
    to: email,

    subject: `Negotiation declined for "${milestoneTitle}"`,

    html: `
      <h2>Negotiation Declined</h2>

      <p>Hello ${firstName},</p>

      <p>Your negotiation request for milestone
      <strong>${milestoneTitle}</strong> in project
      <strong>${projectTitle}</strong>
      was declined.</p>

      <p>You may review the negotiation and determine the next
      appropriate action.</p>

      <br/>

      <p>— Team Strus</p>
    `,
  });
}

// ==================================================
// Negotiation Expired
// ==================================================

static async sendNegotiationExpiredEmail(
  email: string,
  firstName: string,
  projectTitle: string,
  milestoneTitle: string
) {
  await MailService.sendMail({
    to: email,

    subject: `Negotiation expired for "${milestoneTitle}"`,

    html: `
      <h2>Negotiation Expired</h2>

      <p>Hello ${firstName},</p>

      <p>Your negotiation request for milestone
      <strong>${milestoneTitle}</strong> in project
      <strong>${projectTitle}</strong>
      expired because no response was received within the
      7-day negotiation period.</p>

      <p>If changes are still required, you may create a new
      negotiation request.</p>

      <br/>

      <p>— Team Strus</p>
    `,
  });
}

// ==================================================
// Dispute Created
// ==================================================

static async sendDisputeCreatedEmail(
  email: string,
  firstName: string,
  projectTitle: string,
  milestoneTitle: string
) {
  await MailService.sendMail({
    to: email,

    subject: `A dispute has been opened for "${milestoneTitle}"`,

    html: `
      <h2>Dispute Opened</h2>

      <p>Hello ${firstName},</p>

      <p>A dispute has been opened regarding milestone
      <strong>${milestoneTitle}</strong>
      in project
      <strong>${projectTitle}</strong>.</p>

      <p>Please review the dispute details and participate in
      resolving the issue as soon as possible.</p>

      <p>You will receive updates whenever the dispute progresses.</p>

      <br/>

      <p>— Team Strus</p>
    `,
  });
}

// ==================================================
// Dispute Resolution Proposed
// ==================================================

static async sendDisputeResolutionProposedEmail(
  email: string,
  firstName: string,
  projectTitle: string,
  milestoneTitle: string
) {
  await MailService.sendMail({
    to: email,

    subject: `Resolution proposed for "${milestoneTitle}" dispute`,

    html: `
      <h2>Resolution Proposed</h2>

      <p>Hello ${firstName},</p>

      <p>A proposed resolution has been submitted for the dispute
      concerning milestone
      <strong>${milestoneTitle}</strong>
      in project
      <strong>${projectTitle}</strong>.</p>

      <p>Please review the proposed resolution and continue
      following the dispute process within Strus.</p>

      <br/>

      <p>— Team Strus</p>
    `,
  });
}

// ==================================================
// Dispute Resolved
// ==================================================

static async sendDisputeResolvedEmail(
  email: string,
  firstName: string,
  projectTitle: string,
  milestoneTitle: string
) {
  await MailService.sendMail({
    to: email,

    subject: `Dispute resolved for "${milestoneTitle}"`,

    html: `
      <h2>Dispute Resolved</h2>

      <p>Hello ${firstName},</p>

      <p>The dispute regarding milestone
      <strong>${milestoneTitle}</strong>
      in project
      <strong>${projectTitle}</strong>
      has been resolved.</p>

      <p>The project can now continue according to the agreed
      resolution.</p>

      <br/>

      <p>— Team Strus</p>
    `,
  });
}

// ==================================================
// Dispute Closed
// ==================================================

static async sendDisputeClosedEmail(
  email: string,
  firstName: string,
  projectTitle: string,
  milestoneTitle: string
) {
  await MailService.sendMail({
    to: email,

    subject: `Dispute closed for "${milestoneTitle}"`,

    html: `
      <h2>Dispute Closed</h2>

      <p>Hello ${firstName},</p>

      <p>The dispute concerning milestone
      <strong>${milestoneTitle}</strong>
      in project
      <strong>${projectTitle}</strong>
      has been officially closed.</p>

      <p>Thank you for participating in the resolution process
      through Strus.</p>

      <br/>

      <p>— Team Strus</p>
    `,
  });
}
}