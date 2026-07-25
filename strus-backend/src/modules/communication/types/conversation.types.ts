import type { Prisma } from "../../../generated/prisma/client.js";

/*
|--------------------------------------------------------------------------
| Conversation
|--------------------------------------------------------------------------
*/

export type ConversationWithParticipants =
  Prisma.ConversationGetPayload<{
    include: {
      workspace: true;

      project: true;

      participants: {
        include: {
          user: {
            include: {
              profile: true;
            };
          };
        };
      };
    };
  }>;

/*
|--------------------------------------------------------------------------
| Message
|--------------------------------------------------------------------------
*/

export type MessageWithRelations =
  Prisma.MessageGetPayload<{
    include: {
      sender: {
        include: {
          profile: true;
        };
      };

      attachments: true;
    };
  }>;

/*
|--------------------------------------------------------------------------
| Read Receipt
|--------------------------------------------------------------------------
*/

export type ConversationParticipantWithProfile =
  Prisma.ConversationParticipantGetPayload<{
    include: {
      user: {
        include: {
          profile: true;
        };
      };
    };
  }>;