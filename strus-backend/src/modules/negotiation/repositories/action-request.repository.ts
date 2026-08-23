import { prisma } from "../../../core/database/prisma.js";

import type {
  Prisma,
  ActionRequest,
} from "../../../generated/prisma/client.js";

import {
  ActionRequestStatus,
} from "../../../generated/prisma/enums.js";

export class ActionRequestRepository {

  // ==================================================
  // Create
  // ==================================================

  static async create(
    tx: Prisma.TransactionClient,
    data: Prisma.ActionRequestCreateInput
  ): Promise<ActionRequest> {

    return tx.actionRequest.create({

      data,

    });

  }

  // ==================================================
  // Find By Id
  // ==================================================

  static async findById(
    actionRequestId: string
  ) {

    return prisma.actionRequest.findUnique({

      where: {
        id: actionRequestId,
      },

      include: {

        participants: {

          include: {

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
  // Find By Negotiation
  // ==================================================

  static async findByNegotiation(
    negotiationId: string
  ) {

    return prisma.actionRequest.findUnique({

      where: {

        negotiationId,

      },

      include: {

        participants: {

          include: {

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
  // Find Expired
  // ==================================================

  static async findExpired() {

    return prisma.actionRequest.findMany({

      where: {

        status:
          ActionRequestStatus.PENDING,

        deadline: {

          lte: new Date(),

        },

      },

      include: {

        participants: true,

      },

      orderBy: {

        deadline: "asc",

      },

    });

  }

  // ==================================================
  // Update
  // ==================================================

  static async update(
    tx: Prisma.TransactionClient,
    actionRequestId: string,
    data: Prisma.ActionRequestUpdateInput
  ): Promise<ActionRequest> {

    return tx.actionRequest.update({

      where: {

        id: actionRequestId,

      },

      data,

    });

  }


  static async findExpiredByType(
  type: ActionRequest["type"]
) {

  return prisma.actionRequest.findMany({

    where: {

      type,

      status:
        ActionRequestStatus.PENDING,

      deadline: {

        lte: new Date(),

      },

    },

    include: {

      participants: true,

    },

    orderBy: {

      deadline: "asc",

    },

  });

}

// ==================================================
// Expire
// ==================================================

static async expire(
  tx: Prisma.TransactionClient,
  actionRequestId: string
): Promise<ActionRequest> {
  return tx.actionRequest.update({
    where: {
      id: actionRequestId,
    },
    data: {
      status:
        ActionRequestStatus.EXPIRED,
      respondedAt:
        new Date(),
    },
  });
}
}