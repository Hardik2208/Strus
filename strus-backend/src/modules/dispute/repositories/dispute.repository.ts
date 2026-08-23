import { prisma } from "../../../core/database/prisma.js";

import type {
  Prisma,
  Dispute,
} from "../../../generated/prisma/client.js";

import type {
  CreateDisputeInput,
} from "../types/create-dispute.types.js";

export class DisputeRepository {

  // ==================================================
  // Create
  // ==================================================

  static async create(
  tx: Prisma.TransactionClient,
  input: CreateDisputeInput
): Promise<Dispute> {

  return tx.dispute.create({

    data: {

      milestoneId:
        input.milestoneId,

      createdById:
        input.createdById,

      origin:
        input.origin,

      status:
        input.status,

      reason:
        input.reason,

      requestedResolution:
        input.requestedResolution,

      holdStartedAt:
        input.holdStartedAt,

    },

  });

}

  // ==================================================
  // Find By Id
  // ==================================================

  static async findById(
    disputeId: string
  ): Promise<Dispute | null> {

    return prisma.dispute.findUnique({

      where: {
        id: disputeId,
      },

    });

  }

  // ==================================================
  // Find Details
  // ==================================================

  static async findDetails(
    disputeId: string
  ): Promise<
    Prisma.DisputeGetPayload<{

      include: {

        createdBy: {
          include: {
            profile: true;
          };
        };

        milestone: {

          include: {

            project: {

              select: {

                id: true;

                createdById: true;

                title: true;

                status: true;

              };

            };

            agreementParticipant: {

              include: {

                user: {

                  include: {

                    profile: true;

                  };

                };

              };

            };

          };

        };

      };

    }> | null
  > {

    return prisma.dispute.findUnique({

      where: {

        id:
          disputeId,

      },

      include: {

        createdBy: {

          include: {

            profile: true,

          },

        },

        milestone: {

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

                user: {

                  include: {

                    profile: true,

                  },

                },

              },

            },

          },

        },

      },

    });

  }

  // ==================================================
  // Find By Milestone
  // ==================================================

  static async findByMilestone(
    milestoneId: string
  ): Promise<Dispute | null> {

    return prisma.dispute.findUnique({

      where: {

        milestoneId,

      },

    });

  }

  // ==================================================
  // Find All
  // ==================================================

  static async findAll(
    page: number,
    limit: number
  ) {

    const skip =
      (page - 1) * limit;

    const [
      disputes,
      total,
    ] = await prisma.$transaction([

      prisma.dispute.findMany({

        orderBy: {

          createdAt: "desc",

        },

        skip,

        take: limit,

      }),

      prisma.dispute.count(),

    ]);

    return {

      disputes,

      total,

    };

  }

  // ==================================================
  // Update
  // ==================================================

  static async update(
    tx: Prisma.TransactionClient,
    disputeId: string,
    data: Prisma.DisputeUpdateInput
  ): Promise<Dispute> {

    return tx.dispute.update({

      where: {

        id:
          disputeId,

      },

      data,

    });

  }

}