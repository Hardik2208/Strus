import { prisma } from "../../../core/database/prisma.js";

import type {
  Prisma,
} from "../../../generated/prisma/client.js";

export class ActionRequestHelperRepository {

  // ======================================================
  // Notification Context
  // ======================================================

  static async getNotificationContext(
    actionRequestId: string
  ) {

    return prisma.actionRequest.findUnique({

      where: {
        id: actionRequestId,
      },

      include: {

        // --------------------------------------------------
        // Negotiation Action Request
        // --------------------------------------------------

        negotiation: {

          include: {

            project: {

              select: {

                id: true,

                title: true,

                agreement: {

                  select: {

                    id: true,

                    participants: {

                      select: {

                        id: true,

                        userId: true,

                        role: true,

                        invitationStatus: true,

                      },

                    },

                  },

                },

              },

            },

            milestone: {

              select: {

                id: true,

                order: true,

                agreementParticipantId: true,

              },

            },

          },

        },

        // --------------------------------------------------
        // Dispute Continuation Action Request
        // --------------------------------------------------

        disputeResult: {

          include: {

            dispute: {

              include: {

                milestone: {

                  select: {

                    id: true,

                    order: true,

                    agreementParticipantId: true,

                    project: {

                      select: {

                        id: true,

                        title: true,

                        agreement: {

                          select: {

                            id: true,

                            participants: {

                              select: {

                                id: true,

                                userId: true,

                                role: true,

                                invitationStatus: true,

                              },

                            },

                          },

                        },

                      },

                    },

                  },

                },

              },

            },

          },

        },

        // --------------------------------------------------
        // Action Request Participants
        // --------------------------------------------------

        participants: {

          select: {

            id: true,

            userId: true,

            decision: true,

            status: true,

            respondedAt: true,

          },

        },

      },

    });

  }

}