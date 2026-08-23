import { prisma } from "../../../core/database/prisma.js";

export class NegotiationRepository {

  static async getNotificationContext(
    negotiationId: string
  ) {
    return prisma.negotiation.findUnique({

      where: {
        id: negotiationId,
      },

      include: {

        initiatedBy: {
          include: {
            profile: true,
          },
        },

        project: {

          include: {

            agreement: {

              include: {

                participants: {

                  include: {

                    user: {
                      include: {
                        profile: true,
                      },
                    },

                  },

                },

              },

            },

          },

        },

        milestone: {

          include: {

            agreementParticipant: {

              include: {

                user: {

                  include: {
                    profile: true,
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