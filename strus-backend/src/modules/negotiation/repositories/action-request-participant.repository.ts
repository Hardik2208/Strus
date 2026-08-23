import { prisma } from "../../../core/database/prisma.js";

import type {
  Prisma,
  ActionRequestParticipant,
} from "../../../generated/prisma/client.js";

export class ActionRequestParticipantRepository {

  // ==================================================
  // Create Many
  // ==================================================

  static async createMany(
    tx: Prisma.TransactionClient,
    data: Prisma.ActionRequestParticipantCreateManyInput[]
  ) {

    return tx.actionRequestParticipant.createMany({

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

}