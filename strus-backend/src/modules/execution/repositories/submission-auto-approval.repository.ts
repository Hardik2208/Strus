import { prisma } from "../../../core/database/prisma.js";

import {
  SubmissionStatus,
} from "../../../generated/prisma/enums.js";

export class SubmissionAutoApprovalRepository {
  // ==================================================
  // Expired Pending Reviews
  // ==================================================

  static async findExpiredSubmissions() {
    const cutoff = new Date(
      Date.now() - 72 * 60 * 60 * 1000
    );

    return prisma.milestoneSubmission.findMany({
      where: {
        status:
          SubmissionStatus.SUBMITTED,

        reviewedAt: null,

        submittedAt: {
          lte: cutoff,
        },

        deletedAt: null,
      },

      include: {
        milestone: {
          include: {
            project: true,
          },
        },

        submittedBy: {
          include: {
            profile: true,
          },
        },

        reviewedBy: {
          include: {
            profile: true,
          },
        },

        attachments: true,
      },
    });
  }
}