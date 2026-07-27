import { prisma } from "../../../core/database/prisma.js";

import type {
  Event,
  Prisma,
} from "../../../generated/prisma/client.js";

import {
  EventAudience,
} from "../../../generated/prisma/enums.js";

import type {
  EventCursor,
} from "../types/event.types.js";

export class EventRepository {
  // ==================================================
  // Create Event
  // ==================================================

  static async create(
  tx: Prisma.TransactionClient,
  data: Prisma.EventCreateInput
) {
  return tx.event.create({
    data,

    include: {
      createdBy: {
        include: {
          profile: {
            select: {
              firstName: true,
              lastName: true,
              avatarUrl: true,
            },
          },
        },
      },

      recipientMappings: true,
    },
  });
}

  // ==================================================
  // Create Recipients
  // ==================================================

  static async createRecipients(
    tx: Prisma.TransactionClient,
    data: Prisma.EventRecipientCreateManyInput[]
  ): Promise<void> {
    await tx.eventRecipient.createMany({
      data,
    });
  }

  // ==================================================
  // Client Dashboard Activities
  // ==================================================

  static async findClientDashboardActivities(
    userId: string,
    limit: number,
    cursor?: EventCursor
  ) {
    return prisma.eventRecipient.findMany({
      where: {
        userId,

        event: {
          audience: {
            in: [
              EventAudience.CLIENT,
              EventAudience.BOTH,
            ],
          },

          ...(cursor && {
            OR: [
              {
                createdAt: {
                  lt: cursor.createdAt,
                },
              },
              {
                createdAt: cursor.createdAt,
                id: {
                  lt: cursor.eventId,
                },
              },
            ],
          }),
        },
      },

      take: limit + 1,

      orderBy: [
        {
          event: {
            createdAt: "desc",
          },
        },
        {
          event: {
            id: "desc",
          },
        },
      ],

      include: {
        event: {
          include: {
            createdBy: {
              include: {
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
      },
    });
  }

  // ==================================================
  // Professional Dashboard Activities
  // ==================================================

  static async findProfessionalDashboardActivities(
    userId: string,
    limit: number,
    cursor?: EventCursor
  ) {
    return prisma.eventRecipient.findMany({
      where: {
        userId,

        event: {
          audience: {
            in: [
              EventAudience.PROFESSIONAL,
              EventAudience.BOTH,
            ],
          },

          ...(cursor && {
            OR: [
              {
                createdAt: {
                  lt: cursor.createdAt,
                },
              },
              {
                createdAt: cursor.createdAt,
                id: {
                  lt: cursor.eventId,
                },
              },
            ],
          }),
        },
      },

      take: limit + 1,

      orderBy: [
        {
          event: {
            createdAt: "desc",
          },
        },
        {
          event: {
            id: "desc",
          },
        },
      ],

      include: {
        event: {
          include: {
            createdBy: {
              include: {
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
      },
    });
  }

}