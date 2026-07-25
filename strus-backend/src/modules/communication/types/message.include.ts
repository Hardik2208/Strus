import { Prisma } from "../../../generated/prisma/client.js";

export const messageInclude = {
  conversation: true,

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

  editHistory: {
    include: {
      editedBy: {
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
    },
  },

  replyTo: {
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
  },
} satisfies Prisma.MessageInclude;