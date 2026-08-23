import { prisma } from "../../../core/database/prisma.js";

export class DisputeRepository {

  static async getNotificationContext(
    disputeId: string
  ) {
    return prisma.dispute.findUnique({

      where: {
        id: disputeId,
      },

      include: {

        createdBy: {
          include: {
            profile: true,
          },
        },

        result: true,

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

          },

        },

      },

    });
  }

}