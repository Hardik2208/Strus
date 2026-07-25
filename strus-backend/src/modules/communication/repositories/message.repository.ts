import  {
  Prisma,
} from "../../../generated/prisma/client.js";

import { prisma } from "../../../core/database/prisma.js";
import type {
    MessageWithRelations,
} from "../types/message.types.js";
import { MessageStatus } from "../../../generated/prisma/enums.js";
import { ConversationStatus } from "../../../generated/prisma/enums.js";
import { messageInclude } from "../types/message.include.js";

export class MessageRepository {
  static async create(
    tx: Prisma.TransactionClient,
    data: Prisma.MessageCreateInput
  ): Promise<MessageWithRelations> {
    return tx.message.create({
      data,

      include: messageInclude
    });
  }

  static async findById(
    messageId: string
  ) {
    return prisma.message.findFirst({
      where: {
        id: messageId,
        deletedAt: null,
      },

      include: messageInclude
    });
  }

static async findLatestMessage(
  conversationId: string
) {
  return prisma.message.findFirst({
    where: {
      conversationId,
      deletedAt: null,
    },

    include: {
      sender: {
        include: {
          profile: {
            select: {
              username: true,
              firstName: true,
              lastName: true,
              avatarUrl: true,
            },
          },
        },
      },

      attachments: true,
    },

    orderBy: {
      sequence: "desc",
    },
  });
}

static async findBySequence(
  conversationId: string,
  sequence: number
) {
  return prisma.message.findFirst({
    where: {
      conversationId,
      sequence,
      deletedAt: null,
    },

    include: messageInclude
  });
}

static async countConversationMessages(
  conversationId: string
): Promise<number> {
  return prisma.message.count({
    where: {
      conversationId,
      deletedAt: null,
    },
  });
}

static async getNextSequence(
  tx: Prisma.TransactionClient,
  conversationId: string
): Promise<number> {
  const conversation = await tx.conversation.update({
    where: {
      id: conversationId,
    },

    data: {
      nextMessageSequence: {
        increment: 1,
      },
    },

    select: {
      nextMessageSequence: true,
    },
  });

  return conversation.nextMessageSequence;
}

static async update(
  tx: Prisma.TransactionClient,
  messageId: string,
  data: Prisma.MessageUpdateInput
): Promise<MessageWithRelations> {
  return tx.message.update({
    where: {
      id: messageId,
    },

    data,

    include: messageInclude
  });
}

static async updateStatus(
  tx: Prisma.TransactionClient,
  messageId: string,
  status: MessageStatus
): Promise<MessageWithRelations> {
  return tx.message.update({
    where: {
      id: messageId,
    },
    data: {
      status,
    },
    include: messageInclude
  });
}

static async softDelete(
  tx: Prisma.TransactionClient,
  messageId: string
): Promise<void> {
  await tx.message.update({
    where: {
      id: messageId,
    },

    data: {
  status: MessageStatus.DELETED,
  deletedAt: new Date(),
  content: "[Message deleted]",
}
  });
}

static async createEditHistory(
  tx: Prisma.TransactionClient,
  data: Prisma.MessageEditHistoryCreateInput
) {
  return tx.messageEditHistory.create({
    data,
  });
}

static async findAccessibleMessage(
  messageId: string,
  userId: string
) {
  return prisma.message.findFirst({
    where: {
      id: messageId,
      deletedAt: null,

      conversation: {
        participants: {
          some: {
            userId,
          },
        },
      },
    },

    include: messageInclude
  });
}

static async findEditableMessage(
  messageId: string,
  userId: string
) {
  return prisma.message.findFirst({
    where: {
      id: messageId,

      senderId: userId,

      deletedAt: null,

      status: {
        not: MessageStatus.DELETED,
      },

      conversation: {
        status: ConversationStatus.ACTIVE,

        participants: {
          some: {
            userId,
          },
        },
      },
    },

    include: {
      attachments: true,

      conversation: {
  select: {
    id: true,
    status: true,
    workspaceId: true,
    projectId: true,
  },
},
    },
  });
}

static async findDeletableMessage(
  messageId: string,
  userId: string
) {
  return prisma.message.findFirst({
    where: {
      id: messageId,

      senderId: userId,

      deletedAt: null,

      status: {
        not: MessageStatus.DELETED,
      },

      conversation: {
        status: ConversationStatus.ACTIVE,

        participants: {
          some: {
            userId,
          },
        },
      },
    },

    include: {
  attachments: true,

  conversation: {
    select: {
      id: true,
      workspaceId: true,
      projectId: true,
    },
  },
},
  });
}

static async findConversationMessages(
  conversationId: string,
  cursor?: number,
  limit: number = 30
): Promise<{
  messages: MessageWithRelations[];
  hasMore: boolean;
}> {
  const results = await prisma.message.findMany({
    where: {
      conversationId,
      deletedAt: null,

      ...(cursor !== undefined && {
        sequence: {
          lt: cursor,
        },
      }),
    },

    include: messageInclude,

    orderBy: {
      sequence: "desc",
    },

    take: limit + 1,
  });

  const hasMore = results.length > limit;

  if (hasMore) {
    results.pop();
  }

  return {
    messages: results.reverse(),
    hasMore,
  };
}

// ==================================================
// Find Reply Target
// ==================================================

static async findReplyTarget(
  conversationId: string,
  messageId: string
): Promise<MessageWithRelations | null> {
  return prisma.message.findFirst({
    where: {
      id: messageId,

      conversationId,

      deletedAt: null,

      status: {
        not: MessageStatus.DELETED,
    },
    },

    include: messageInclude,
  });
}

static createAttachments(
  tx: Prisma.TransactionClient,
  data: Prisma.MessageAttachmentCreateManyInput[]
) {
  return tx.messageAttachment.createMany({
    data,
  });
}

static async findAttachments(
  messageId: string
) {
  return prisma.messageAttachment.findMany({
    where: {
      messageId,
    },
    select: {
      publicId: true,
      mimeType: true,
    },
  });
}

static async deleteAttachments(
  tx: Prisma.TransactionClient,
  messageId: string
): Promise<void> {
  await tx.messageAttachment.deleteMany({
    where: {
      messageId,
    },
  });
}

static async getLatestSequence(
  conversationId: string
): Promise<number | null> {
  const message =
    await prisma.message.findFirst({
      where: {
        conversationId,
      },

      orderBy: {
        sequence: "desc",
      },

      select: {
        sequence: true,
      },
    });

  return message?.sequence ?? null;
}

// ==================================================
// Find Read Receipts
// ==================================================

static async findReadReceipts(
  messageId: string
): Promise<ReadReceipt[] | null>{
  // -----------------------------------------------
  // Load Message
  // -----------------------------------------------

  const message = await prisma.message.findUnique({
    where: {
      id: messageId,
    },

    select: {
      conversationId: true,
      sequence: true,
    },
  });

  if (!message) {
    return null;
  }

  // -----------------------------------------------
  // Find Readers
  // -----------------------------------------------

  return prisma.conversationParticipant.findMany({
    where: {
      conversationId: message.conversationId,

      lastReadSequence: {
        gte: message.sequence,
      },
    },

    select: {
  lastReadAt: true,

  user: {
    select: {
      id: true,

      profile: {
        select: {
          username: true,
          firstName: true,
          lastName: true,
          avatarUrl: true,
        },
      },
    },
  },
},

    orderBy: {
      lastReadAt: "asc",
    },
  });
}

}

export interface ReadReceipt {
  lastReadAt: Date | null;

  user: {
    id: string;

    profile: {
      username: string;
      firstName: string;
      lastName: string;
      avatarUrl: string | null;
    } | null;
  };
}