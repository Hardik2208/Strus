import { prisma } from "../../../core/database/prisma.js";

import type {
  Prisma,
} from "../../../generated/prisma/client.js";

import type {
  MilestoneStatus,
} from "../../../generated/prisma/enums.js";

export class DisputeHelperRepository {

  // ==================================================
  // Find Milestone For Dispute
  // ==================================================

  static async findMilestoneForDispute(
    milestoneId: string
  ) {

    return prisma.milestone.findUnique({

      where: {
        id: milestoneId,
      },

      include: {

        project: true,

        agreementParticipant: {

          include: {

            user: {

              include: {

                profile: true,

              },

            },

          },

        },

        submissions: {

          where: {

            deletedAt: null,

          },

          orderBy: {

            submissionNumber: "desc",

          },

          take: 1,

        },

        dispute: true,

      },

    });

  }

  // ==================================================
  // Find Existing Dispute
  // ==================================================

  static async findExistingDispute(
    milestoneId: string
  ) {

    return prisma.dispute.findUnique({

      where: {

        milestoneId,

      },

    });

  }

  // ==================================================
  // Find Latest Negotiation
  // ==================================================

  static async findLatestNegotiation(
    milestoneId: string
  ) {

    return prisma.negotiation.findFirst({

      where: {

        milestoneId,

      },

      orderBy: {

        negotiationNumber: "desc",

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
  // Increment Negotiation Count
  // ==================================================

  static async incrementNegotiationCount(
    tx: Prisma.TransactionClient,
    disputeId: string
  ) {

    return tx.dispute.update({

      where: {

        id: disputeId,

      },

      data: {

        negotiationCount: {

          increment: 1,

        },

      },

    });

  }

}