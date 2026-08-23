import { prisma } from "../../../core/database/prisma.js";

import type {
  Prisma,
  Negotiation,
} from "../../../generated/prisma/client.js";

import {
  SettlementProposal,
} from "../../../generated/prisma/enums.js";

import type {
  CreateNegotiationInput,
} from "../types/create-negotiation.types.js";

import {
  NegotiationStatus,
  NegotiationContinuationStatus,
  PartyResponseStatus,
} from "../../../generated/prisma/enums.js";

export class NegotiationRepository {

// ==================================================
// Create
// ==================================================

static async create(
  tx: Prisma.TransactionClient,
  input: CreateNegotiationInput
): Promise<Negotiation> {

  let proposedSettlement: SettlementProposal;

  if (input.proposedPercentage === 0) {

    proposedSettlement =
      SettlementProposal.NO_PAYMENT;

  } else if (
    input.proposedPercentage === 100
  ) {

    proposedSettlement =
      SettlementProposal.FULL_PAYMENT;

  } else {

    proposedSettlement =
      SettlementProposal.PARTIAL_PAYMENT;

  }

  return tx.negotiation.create({

    data: {

      projectId:
        input.projectId,

      milestoneId:
        input.milestoneId,

      negotiationNumber:
        input.negotiationNumber,

      initiatedById:
        input.initiatedById,

      proposedSettlement,

      proposedPercentage:
        input.proposedPercentage,

      proposedAmount:
        input.proposedAmount,

      reason:
        input.reason,

      status:
        input.status,

      waitingStatus:
        input.waitingStatus,

      responseDeadline:
        input.responseDeadline,

    },

  });

}

  // ==================================================
  // Find By Id
  // ==================================================

  static async findById(
    negotiationId: string
  ): Promise<Negotiation | null> {
    return prisma.negotiation.findUnique({
      where: {
        id: negotiationId,
      },
    });
  }

  // ==================================================
  // Find Details
  // ==================================================

static async findDetails(
  negotiationId: string
): Promise<
  Prisma.NegotiationGetPayload<{
    include: {
      initiatedBy: {
        include: {
          profile: true;
        };
      };
      project: {
        select: {
          id: true;
          createdById: true;
          title: true;
          status: true;
        };
      };
      milestone: {
        include: {
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
  return prisma.negotiation.findUnique({

    where: {
      id: negotiationId,
    },

    include: {

      initiatedBy: {
        include: {
          profile: true,
        },
      },

      project: {
        select: {

          id: true,

          createdById: true,

          title: true,

          status: true,

        },
      },

      milestone: {

        include: {

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
// Find Latest By Milestone
// ==================================================

static async findLatestByMilestone(
  milestoneId: string
): Promise<Negotiation | null> {

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
// Find Pending By Milestone
// ==================================================

static async findPendingByMilestone(
  milestoneId: string
): Promise<Negotiation | null> {

  return prisma.negotiation.findFirst({

    where: {

      milestoneId,

      status:
        NegotiationStatus.PENDING,

    },

    orderBy: {

      negotiationNumber: "desc",

    },

  });

}

// ==================================================
// Find By Number
// ==================================================

static async findByNumber(
  milestoneId: string,
  negotiationNumber: number
): Promise<Negotiation | null> {

  return prisma.negotiation.findFirst({

    where: {

      milestoneId,

      negotiationNumber,

    },

  });

}

// ==================================================
// Find By Milestone
// ==================================================

static async findByMilestone(
  milestoneId: string,
  page: number,
  limit: number
) {

  const skip =
    (page - 1) * limit;

  const [
    negotiations,
    total,
  ] = await prisma.$transaction([

    prisma.negotiation.findMany({

      where: {
        milestoneId,
      },

      orderBy: {
        negotiationNumber: "asc",
      },

      skip,

      take: limit,

      include: {

        initiatedBy: {
          include: {
            profile: true,
          },
        },

      },

    }),

    prisma.negotiation.count({

      where: {
        milestoneId,
      },

    }),

  ]);

  return {

    negotiations,

    total,

  };

}

// ==================================================
// Find Expired Negotiations
// ==================================================

static async findExpiredNegotiations() {

  return prisma.negotiation.findMany({

    where: {

      status:
        NegotiationStatus.PENDING,

      responseDeadline: {

        lte: new Date(),

      },

    },

    include: {

      project: {

        select: {

          id: true,

          createdById: true,

          title: true,

        },

      },

      milestone: {

        include: {

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

      initiatedBy: {

        include: {

          profile: true,

        },

      },

    },

    orderBy: {

      responseDeadline: "asc",

    },

  });

}

    // ==================================================
  // Update
  // ==================================================

static async update(
  tx: Prisma.TransactionClient,
  negotiationId: string,
  data: Prisma.NegotiationUpdateInput
): Promise<Negotiation> {

  return tx.negotiation.update({

    where: {
      id: negotiationId,
    },

    data,

  });

}

// ==================================================
// Accept Negotiation
// ==================================================

static async accept(
  tx: Prisma.TransactionClient,
  negotiationId: string
): Promise<Negotiation> {

  return tx.negotiation.update({

    where: {
      id: negotiationId,
    },

    data: {

      status:
        NegotiationStatus.ACCEPTED,

      waitingStatus:
        PartyResponseStatus.COMPLETED,

      respondedAt:
        new Date(),

    },

  });

}


// ==================================================
// Decline Negotiation
// ==================================================

static async decline(
  tx: Prisma.TransactionClient,
  negotiationId: string
): Promise<Negotiation> {

  return tx.negotiation.update({

    where: {
      id: negotiationId,
    },

    data: {

      status:
        NegotiationStatus.DECLINED,

      waitingStatus:
        PartyResponseStatus.COMPLETED,

      respondedAt:
        new Date(),

    },

  });

}

// ==================================================
// Expire Negotiation
// ==================================================

static async expire(
  tx: Prisma.TransactionClient,
  negotiationId: string
): Promise<Negotiation> {

  return tx.negotiation.update({

    where: {
      id: negotiationId,
    },

    data: {

      status:
        NegotiationStatus.EXPIRED,

      waitingStatus:
        PartyResponseStatus.EXPIRED,

      respondedAt:
        new Date(),

    },

  });

}
}