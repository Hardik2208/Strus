import type {
  Prisma,
} from "../../../generated/prisma/client.js";

import { prisma } from "../../../core/database/prisma.js";

export class ConversationParticipantRepository {
    

static async deleteMany(
  tx: Prisma.TransactionClient,
  conversationId: string,
  userIds: string[]
) {
  if (userIds.length === 0) {
    return;
  }

  await tx.conversationParticipant.deleteMany({
    where: {
      conversationId,
      userId: {
        in: userIds,
      },
    },
  });
}

static async findByConversation(
  conversationId: string
) {
  return prisma.conversationParticipant.findMany({
    where: {
      conversationId,
    },

    orderBy: {
      joinedAt: "asc",
    },
  });
}

static async findParticipants(
  tx: Prisma.TransactionClient,
  conversationId: string
) {
  return tx.conversationParticipant.findMany({
    where: {
      conversationId,
    },
  });
}

static async updateReadState(
  tx: Prisma.TransactionClient,
  conversationId: string,
  userId: string,
  sequence: number
) {
  return tx.conversationParticipant.update({
    where: {
      conversationId_userId: {
        conversationId,
        userId,
      },
    },

    data: {
      lastReadSequence: sequence,
      lastReadAt: new Date(),
    },
  });
}

static async createMany(
  tx: Prisma.TransactionClient,
  participants: {
    conversationId: string;
    userId: string;
  }[]
) {
  if (participants.length === 0) {
    return;
  }

  await tx.conversationParticipant.createMany({
    data: participants,
    skipDuplicates: true,
  });
}

static async findParticipant(
  conversationId: string,
  userId: string
) {
  return prisma.conversationParticipant.findUnique({
    where: {
      conversationId_userId: {
        conversationId,
        userId,
      },
    },
  });
}

static async findUserIds(
  conversationId: string
): Promise<string[]> {

  const participants =
    await prisma.conversationParticipant.findMany({

      where: {
        conversationId,
      },

      select: {
        userId: true,
      },
    });

  return participants.map(
    p => p.userId
  );
}

static async updateLastRead(
  tx: Prisma.TransactionClient,
  conversationId: string,
  userId: string,
  lastReadSequence: number
) {
  return tx.conversationParticipant.updateMany({
    where: {
      conversationId,
      userId,

      OR: [
        {
          lastReadSequence: null,
        },
        {
          lastReadSequence: {
            lt: lastReadSequence,
          },
        },
      ],
    },

    data: {
      lastReadSequence,
      lastReadAt: new Date(),
    },
  });
}

}
