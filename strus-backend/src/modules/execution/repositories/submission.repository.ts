import { prisma } from "../../../core/database/prisma.js";

import type {
  Prisma,
  MilestoneSubmission,
} from "../../../generated/prisma/client.js";

export class SubmissionRepository {
  // ==================================================
  // Create Submission
  // ==================================================

  static create(
    tx: Prisma.TransactionClient,
    data: Prisma.MilestoneSubmissionCreateInput
  ): Promise<MilestoneSubmission> {
    return tx.milestoneSubmission.create({
      data,
    });
  }

  // ==================================================
  // Create Attachments
  // ==================================================

  static createAttachments(
    tx: Prisma.TransactionClient,
    data: Prisma.SubmissionAttachmentCreateManyInput[]
  ) {
    return tx.submissionAttachment.createMany({
      data,
    });
  }

  // ==================================================
  // Find Milestone
  // ==================================================

  static findMilestone(
    milestoneId: string
  ) {
    return prisma.milestone.findFirst({
      where: {
        id: milestoneId,
        deletedAt: null,
      },

      include: {
        agreementParticipant: true,

        project: {
          include: {
            agreement: {
              include: {
                participants: true,
              },
            },
          },
        },
      },
    });
  }

  // ==================================================
  // Latest Submission
  // ==================================================

  static findLatestSubmission(
    milestoneId: string
  ) {
    return prisma.milestoneSubmission.findFirst({
      where: {
        milestoneId,
        deletedAt: null,
      },

      orderBy: {
        submissionNumber: "desc",
      },
    });
  }

  // ==================================================
  // Find Submission
  // ==================================================

  static findById(
  submissionId: string
) {
  return prisma.milestoneSubmission.findFirst({
    where: {
      id: submissionId,

      deletedAt: null,
    },

    include: {
      milestone: true,

      attachments: true,

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
    },
  });
}

  // ==================================================
  // Find Milestone Submissions
  // ==================================================

  static findMilestoneSubmissions(
    milestoneId: string
  ) {
    return prisma.milestoneSubmission.findMany({
      where: {
        milestoneId,
        deletedAt: null,
      },

      include: {
        attachments: true,

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
      },

      orderBy: {
        submissionNumber: "desc",
      },
    });
  }

  // ==================================================
  // Find Attachments
  // ==================================================

  static findAttachments(
    submissionId: string
  ) {
    return prisma.submissionAttachment.findMany({
      where: {
        submissionId,
      },
    });
  }

  // ==================================================
  // Update Status
  // ==================================================

  static updateStatus(
    tx: Prisma.TransactionClient,
    submissionId: string,
    data: Prisma.MilestoneSubmissionUpdateInput
  ) {
    return tx.milestoneSubmission.update({
      where: {
        id: submissionId,
      },

      data,
    });
  }

  // ==================================================
  // Soft Delete
  // ==================================================

  static softDelete(
    tx: Prisma.TransactionClient,
    submissionId: string
  ) {
    return tx.milestoneSubmission.update({
      where: {
        id: submissionId,
      },

      data: {
        deletedAt: new Date(),
      },
    });
  }

  // ==================================================
// Pending Review
// ==================================================

static findPendingReview(
  submissionId: string
) {
  return prisma.milestoneSubmission.findFirst({
    where: {
      id: submissionId,

      deletedAt: null,
    },

    include: {
      milestone: {
        include: {
          project: {
            include: {
              workspace: true,
            },
          },

          agreementParticipant: true,
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

// ==================================================
// Pending Workspace Reviews
// ==================================================

static findWorkspacePendingReviews(
  workspaceId: string,
  userId: string
) {
  return prisma.milestoneSubmission.findMany({
    where: {
      deletedAt: null,

      status: {
        in: [
          "SUBMITTED",
          "UNDER_REVIEW",
        ],
      },

      milestone: {
        project: {
          workspaceId,
        },
      },
    },

    include: {
      milestone: true,

      submittedBy: {
        include: {
          profile: true,
        },
      },

      attachments: true,
    },

    orderBy: {
      submittedAt: "asc",
    },
  });
}
}