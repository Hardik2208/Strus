import type { Prisma } from "../../../generated/prisma/client.js";

export type ConversationParticipantWithRelations =
  Prisma.ConversationParticipantGetPayload<{
    include: {
      user: {
        include: {
          profile: {
            select: {
              username: true;
              firstName: true;
              lastName: true;
              avatarUrl: true;
            };
          };
        };
      };

      conversation: {
        select: {
          id: true;
          type: true;
          status: true;
        };
      };
    };
  }>;