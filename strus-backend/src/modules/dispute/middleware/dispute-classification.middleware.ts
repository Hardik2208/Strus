import {
  DisputeOrigin,
  MilestoneStatus,
  SubmissionStatus,
} from "../../../generated/prisma/enums.js";

import {
  DisputeHelperRepository,
} from "../repositories/dispute-helper.repository.js";

export class DisputeClassificationMiddleware {

  // ==================================================
  // Determine Dispute Type
  // ==================================================

  static async determineDisputeType(
    milestoneId: string
  ): Promise<DisputeOrigin> {

    // ================================================
    // Load Milestone
    // ================================================

    const milestone =
      await DisputeHelperRepository.findMilestoneForDispute(
        milestoneId
      );

    if (!milestone) {

      throw new Error(
        "Milestone not found."
      );

    }

    // ================================================
    // Existing Dispute
    // ================================================

    if (
      milestone.dispute
    ) {

      throw new Error(
        "A dispute already exists for this milestone."
      );

    }

    // ================================================
    // Latest Submission
    // ================================================

    const latestSubmission =
      milestone.submissions[0];

    // ================================================
    // PRE SUBMISSION
    // ================================================

    if (!latestSubmission) {

      if (
        milestone.status !==
        MilestoneStatus.IN_PROGRESS
      ) {

        throw new Error(
          "Pre-submission disputes can only be created for milestones in progress."
        );

      }

      return DisputeOrigin.PRE_SUBMISSION;

    }

    // ================================================
    // POST SUBMISSION
    // ================================================

    if (

      latestSubmission.status ===
      SubmissionStatus.REJECTED &&

      milestone.status ===
      MilestoneStatus.REVISION_LIMIT_REACHED

    ) {

      return DisputeOrigin.POST_SUBMISSION;

    }

    // ================================================
    // Invalid
    // ================================================

    throw new Error(
      "This milestone is not eligible for dispute creation."
    );

  }

}