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

          orderBy: {
            createdAt: "asc",
          },

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
  // Find By Id - Transaction
  // ==================================================

  static async findByIdTx(
    tx: Prisma.TransactionClient,
    actionRequestId: string
  ) {

    return tx.actionRequest.findUnique({

      where: {
        id: actionRequestId,
      },

      include: {

        participants: {

          orderBy: {
            createdAt: "asc",
          },

        },

      },

    });

  }

  // ==================================================
  // Find Pending Expired Requests
  // ==================================================

  static async findExpired(
    tx?: Prisma.TransactionClient
  ) {

    const client =
      tx ?? prisma;

    return client.actionRequest.findMany({

      where: {

        status:
          ActionRequestStatus.PENDING,

        deadline: {

          lte:
            new Date(),

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

        id:
          actionRequestId,

      },

      data,

    });

  }

  // ==================================================
  // Complete
  // ==================================================

  static async complete(
    tx: Prisma.TransactionClient,
    actionRequestId: string
  ): Promise<ActionRequest> {

    return tx.actionRequest.update({

      where: {

        id:
          actionRequestId,

        status:
          ActionRequestStatus.PENDING,

      },

      data: {

        status:
          ActionRequestStatus.COMPLETED,

        completedAt:
          new Date(),

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

        id:
          actionRequestId,

        status:
          ActionRequestStatus.PENDING,

      },

      data: {

        status:
          ActionRequestStatus.EXPIRED,

      },

    });

  }

}