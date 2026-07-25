import type {
  Prisma,
  Conversation,
} from "../../../generated/prisma/client.js";

import { prisma } from "../../../core/database/prisma.js";

import { ConversationStatus } from "../../../generated/prisma/enums.js";
import { ConversationType } from "../../../generated/prisma/enums.js";
import { WorkspaceRole } from "../../../generated/prisma/enums.js";

const conversationPermissionSelect = {
  id: true,

  type: true,

  status: true,

  workspaceId: true,

  projectId: true,
} satisfies Prisma.ConversationSelect;

const conversationSummarySelect = {
  id: true,

  type: true,

  status: true,

  lastActivityAt: true,

  nextMessageSequence: true,

  workspace: {
    select: {
      id: true,
      name: true,
      workspaceType: true,
    },
  },

  project: {
    select: {
      id: true,
      title: true,
      status: true,
      setupStage: true,
    },
  },

  lastMessage: {
    select: {
      id: true,

      sequence: true,

      content: true,

      createdAt: true,

      sender: {
        select: {
          id: true,

          profile: {
            select: {
              firstName: true,
              lastName: true,
              avatarUrl: true,
            },
          },
        },
      },
    },
  },
} satisfies Prisma.ConversationSelect;

const conversationDetailsSelect = {
  id: true,

  type: true,

  status: true,

  createdAt: true,

  updatedAt: true,

  workspace: {
    select: {
      id: true,
      name: true,
      workspaceType: true,
    },
  },

  project: {
    select: {
      id: true,
      title: true,
      status: true,
      setupStage: true,
    },
  },

  participants: {
    orderBy: {
      joinedAt: "asc",
    },

    select: {
      joinedAt: true,

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
  },
} satisfies Prisma.ConversationSelect;

const conversationParticipantSelect = {
  lastReadSequence: true,

  lastReadAt: true,
} satisfies Prisma.ConversationParticipantSelect;

export class ConversationRepository {

  static async create(
    tx: Prisma.TransactionClient,
    data: Prisma.ConversationCreateInput
  ): Promise<Conversation> {
    return tx.conversation.create({
      data,
    });
  }

  static async findById(
  conversationId: string
) {
  return prisma.conversation.findUnique({
    where: {
      id: conversationId,
    },

    select: conversationDetailsSelect,
  });
}

static async findByWorkspaceId(
  workspaceId: string,
  userId: string
) {
  return prisma.conversation.findFirst({
    where: {
      workspaceId,

      participants: {
        some: {
          userId,
        },
      },
    },

    select: {
      ...conversationSummarySelect,

      participants: {
        where: {
          userId,
        },

        select: conversationParticipantSelect,

        take: 1,
      },
    },
  });
}

static async findByProjectId(
  projectId: string,
  userId: string
) {
  return prisma.conversation.findFirst({
    where: {
      projectId,

      participants: {
        some: {
          userId,
        },
      },
    },

    select: {
      ...conversationSummarySelect,

      participants: {
        where: {
          userId,
        },

        select: conversationParticipantSelect,

        take: 1,
      },
    },
  });
}

static async updateStatus(
  tx: Prisma.TransactionClient,
  conversationId: string,
  status: ConversationStatus
): Promise<Conversation> {
  return tx.conversation.update({
    where: {
      id: conversationId,
    },

    data: {
      status,
    },
  });
}

static async findAccessibleConversation(
  conversationId: string,
  userId: string
) {
  return prisma.conversation.findFirst({
    where: {
      id: conversationId,

      participants: {
        some: {
          userId,
        },
      },
    },

    select: conversationPermissionSelect,
  });
}

static async findWritableConversation(
  conversationId: string,
  userId: string
) {
  return prisma.conversation.findFirst({
    where: {
      id: conversationId,

      status: ConversationStatus.ACTIVE,

      participants: {
        some: {
          userId,
        },
      },
    },

    select: conversationPermissionSelect,
  });
}

static async findWorkspaceAdminConversation(
  conversationId: string,
  userId: string
) {
  return prisma.conversation.findFirst({
    where: {
      id: conversationId,

      type: ConversationType.WORKSPACE,

      participants: {
        some: {
          userId,
        },
      },

      workspace: {
        members: {
          some: {
            userId,

            role: {
              in: [
                WorkspaceRole.OWNER,
                WorkspaceRole.ADMIN,
              ],
            },
          },
        },
      },
    },

    select: conversationPermissionSelect,
  });
}

static async touch(
    tx: Prisma.TransactionClient,
    conversationId: string,
    messageId: string
) {
    return tx.conversation.update({
        where: {
            id: conversationId,
        },

        data: {
            lastMessageId: messageId,
            lastActivityAt: new Date(),
        },
    });
}

static async createProjectConversation(
  tx: Prisma.TransactionClient,
  projectId: string
) {
  return tx.conversation.create({
    data: {
      type: ConversationType.PROJECT,
      projectId,
    },

    select: conversationSummarySelect,
  });
}

static async findProjectConversation(
  tx: Prisma.TransactionClient,
  projectId: string
) {
  return tx.conversation.findUnique({
    where: {
      projectId,
    },

    select: conversationSummarySelect,
  });
}

static async findReadableConversation(
  conversationId: string,
  userId: string
) {
  return prisma.conversation.findFirst({
    where: {
      id: conversationId,

      status: ConversationStatus.ACTIVE,

      participants: {
        some: {
          userId,
        },
      },
    },

    select: {
      id: true,
      type: true,
      status: true,
      workspaceId: true,
      projectId: true,
    },
  });
}
}