import { prisma } from "../../../core/database/prisma.js";

import type { Prisma } from "../../../generated/prisma/client.js";

import {
  MilestoneStatus,
} from "../../../generated/prisma/enums.js";

import { SubmissionRepository } from "../../execution/repositories/submission.repository.js";
import { MilestoneExtensionRepository } from "../../execution/repositories/milestone-extension.repository.js";

export class NegotiationHelperRepository {

  // ==================================================
  // Milestone
  // ==================================================

  static async findMilestoneForNegotiation(
    milestoneId: string
  ) {
    return prisma.milestone.findUnique({

      where: {
        id: milestoneId,
      },

      include: {

        project: {

          select: {

            id: true,

            createdById: true,

            title: true,

            status: true,

          },

        },

        agreementParticipant: {

          include: {

            agreement: {

              select: {

                id: true,

              },

            },

            user: {

              include: {

                profile: true,

              },

            },

          },

        },

      },

    });

  }

  // ==================================================
  // Update Milestone Status
  // ==================================================

  static async updateMilestoneStatus(
    tx: Prisma.TransactionClient,
    milestoneId: string,
    status: MilestoneStatus
  ) {

    return tx.milestone.update({

      where: {
        id: milestoneId,
      },

      data: {
        status,
      },

    });

  }

  // ==================================================
  // Latest Submission
  // ==================================================

  static async findLatestSubmission(
    milestoneId: string
  ) {

    return SubmissionRepository.findLatestSubmission(
      milestoneId
    );

  }

  // ==================================================
  // Latest Approved Extension
  // ==================================================

  static async findLatestApprovedExtension(
    milestoneId: string
  ) {

    return MilestoneExtensionRepository.findLatestApproved(
      milestoneId
    );

  }

  // ==================================================
  // Project Client
  // ==================================================

  static async findProjectClient(
    projectId: string
  ) {

    return prisma.project.findUnique({

      where: {
        id: projectId,
      },

      select: {

        id: true,

        createdById: true,

      },

    });

  }

  // ==================================================
  // Agreement Participant By User
  // ==================================================

  static async findParticipantByUser(
    agreementId: string,
    userId: string
  ) {

    return prisma.agreementParticipant.findFirst({

      where: {

        agreementId,

        userId,

      },

    });

  }

  // ==================================================
  // Find Negotiation Owner
  // ==================================================

  static async isNegotiationProfessional(
    milestoneId: string,
    userId: string
  ) {

    const milestone =
      await prisma.milestone.findUnique({

        where: {
          id: milestoneId,
        },

        select: {

          agreementParticipant: {

            select: {

              userId: true,

            },

          },

        },

      });

    return (
      milestone?.agreementParticipant.userId ===
      userId
    );

  }

  // ==================================================
// Find Milestone
// ==================================================

static async findMilestone(
  milestoneId: string
) {

  return prisma.milestone.findUnique({

    where: {
      id: milestoneId,
    },

  });

}

// ==================================================
// Find Negotiation For Response
// ==================================================

static async findNegotiationForResponse(
  negotiationId: string
) {

  return prisma.negotiation.findUnique({

    where: {
      id: negotiationId,
    },

    include: {

      project: {

        select: {

          id: true,

          createdById: true,

        },

      },

      milestone: {

        include: {

          agreementParticipant: {

            select: {

              id: true,

              userId: true,

            },

          },

        },

      },

    },

  });

}
}