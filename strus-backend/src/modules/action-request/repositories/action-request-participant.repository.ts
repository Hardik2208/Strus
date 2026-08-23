import { prisma } from "../../../core/database/prisma.js";

import type {
  Prisma,
  ActionRequestParticipant,
} from "../../../generated/prisma/client.js";

import {
  ActionParticipantStatus,
} from "../../../generated/prisma/enums.js";

export class ActionRequestParticipantRepository {

  // ==================================================
  // Create Many
  // ==================================================

  static async createMany(
    tx: Prisma.TransactionClient,
    data: Prisma.ActionRequestParticipantCreateManyInput[]
  ): Promise<void> {

    await tx.actionRequestParticipant.createMany({
      data,
    });

  }

  // ==================================================
  // Find By Request
  // ==================================================

  static async findByRequest(
    actionRequestId: string
  ) {

    return prisma.actionRequestParticipant.findMany({

      where: {
        actionRequestId,
      },

      include: {

        user: {
          include: {
            profile: true,
          },
        },

      },

      orderBy: {
        createdAt: "asc",
      },

    });

  }

  // ==================================================
  // Find By Request - Transaction
  // ==================================================

  static async findByRequestTx(
    tx: Prisma.TransactionClient,
    actionRequestId: string
  ) {

    return tx.actionRequestParticipant.findMany({

      where: {
        actionRequestId,
      },

      orderBy: {
        createdAt: "asc",
      },

    });

  }

  // ==================================================
  // Find Participant
  // ==================================================

  static async findParticipant(
    actionRequestId: string,
    userId: string
  ) {

    return prisma.actionRequestParticipant.findUnique({

      where: {

        actionRequestId_userId: {
          actionRequestId,
          userId,
        },

      },

    });

  }

  // ==================================================
  // Find Participant - Transaction
  // ==================================================

  static async findParticipantTx(
    tx: Prisma.TransactionClient,
    actionRequestId: string,
    userId: string
  ) {

    return tx.actionRequestParticipant.findUnique({

      where: {

        actionRequestId_userId: {
          actionRequestId,
          userId,
        },

      },

    });

  }

  // ==================================================
  // Update
  // ==================================================

  static async update(
    tx: Prisma.TransactionClient,
    participantId: string,
    data: Prisma.ActionRequestParticipantUpdateInput
  ): Promise<ActionRequestParticipant> {

    return tx.actionRequestParticipant.update({

      where: {
        id: participantId,
      },

      data,

    });

  }

  // ==================================================
  // Mark Expired
  // ==================================================

  static async expirePending(
    tx: Prisma.TransactionClient,
    actionRequestId: string
  ): Promise<void> {

    await tx.actionRequestParticipant.updateMany({

      where: {

        actionRequestId,

        status:
          ActionParticipantStatus.PENDING,

      },

      data: {

        status:
          ActionParticipantStatus.EXPIRED,

      },

    });

  }

}