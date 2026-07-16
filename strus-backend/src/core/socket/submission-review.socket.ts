import { getIO } from "./socket.js";

import { SocketEvents } from "./socket-events.js";

export class SubmissionReviewSocket {
  // ==================================================
  // Pending Reviews Updated
  // ==================================================

  static emitPendingReviewUpdated(
    workspaceId: string
  ): void {
    getIO()
      .to(`workspace:${workspaceId}`)
      .emit(
        SocketEvents.PENDING_REVIEWS_UPDATED,
        {
          workspaceId,
        }
      );
  }

  // ==================================================
  // Submission Approved
  // ==================================================

  static emitSubmissionApproved(
    workspaceId: string,
    submissionId: string,
    milestoneId: string
  ): void {
    getIO()
      .to(`workspace:${workspaceId}`)
      .emit(
        SocketEvents.SUBMISSION_APPROVED,
        {
          submissionId,
          milestoneId,
        }
      );
  }

  // ==================================================
  // Revision Requested
  // ==================================================

  static emitRevisionRequested(
    workspaceId: string,
    submissionId: string,
    milestoneId: string
  ): void {
    getIO()
      .to(`workspace:${workspaceId}`)
      .emit(
        SocketEvents.SUBMISSION_REVISION_REQUESTED,
        {
          submissionId,
          milestoneId,
        }
      );
  }
}