import { prisma } from "../../../core/database/prisma.js";

import type {
  Prisma,
  RevisionRequest,
} from "../../../generated/prisma/client.js";

export class RevisionRequestRepository {
  // ==================================================
  // Create
  // ==================================================

  static create(
    tx: Prisma.TransactionClient,
    data: Prisma.RevisionRequestCreateInput
  ): Promise<RevisionRequest> {
    return tx.revisionRequest.create({
      data,
    });
  }

  // ==================================================
  // Find By Id
  // ==================================================

  static findById(
    revisionRequestId: string
  ) {
    return prisma.revisionRequest.findFirst({
      where: {
        id: revisionRequestId,
      },

      include: {
        milestone: true,

        submission: {
          include: {
            attachments: true,

            submittedBy: {
              include: {
                profile: true,
              },
            },
          },
        },

        requestedBy: {
          include: {
            profile: true,
          },
        },
      },
    });
  }

  // ==================================================
  // Find By Submission
  // ==================================================

  static async findBySubmission(
  tx: Prisma.TransactionClient,
  submissionId: string
) {
  return tx.revisionRequest.findUnique({
    where: {
      submissionId,
    },

    include: {
      requestedBy: {
        include: {
          profile: true,
        },
      },

      submission: true,

      milestone: true,
    },
  });
}

  // ==================================================
  // Find Milestone Revisions
  // ==================================================

  static findMilestoneRevisions(
    milestoneId: string
  ) {
    return prisma.revisionRequest.findMany({
      where: {
        milestoneId,
      },

      include: {
        submission: {
          include: {
            submittedBy: {
              include: {
                profile: true,
              },
            },
          },
        },

        requestedBy: {
          include: {
            profile: true,
          },
        },
      },

      orderBy: {
        revisionNumber: "asc",
      },
    });
  }

  // ==================================================
  // Count
  // ==================================================

  static count(
    milestoneId: string
  ) {
    return prisma.revisionRequest.count({
      where: {
        milestoneId,
      },
    });
  }

  // ==================================================
  // Exists
  // ==================================================

  static exists(
    submissionId: string
  ) {
    return prisma.revisionRequest.count({
      where: {
        submissionId,
      },
    });
  }

  // ==================================================
  // Latest
  // ==================================================

  static findLatest(
    milestoneId: string
  ) {
    return prisma.revisionRequest.findFirst({
      where: {
        milestoneId,
      },

      orderBy: {
        revisionNumber: "desc",
      },
    });
  }

}