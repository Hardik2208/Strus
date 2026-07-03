import { prisma } from "../../../core/database/prisma.js";

import { OAuthProvider } from "../../../generated/prisma/enums.js";

export class GoogleRepository {
  // ==================================================
  // Find User By Google Id
  // ==================================================

  static findUserByGoogleId(
    providerUserId: string
  ) {
    return prisma.oAuthAccount.findFirst({
      where: {
        provider: OAuthProvider.GOOGLE,

        providerUserId,
      },

      include: {
        user: {
          include: {
            profile: true,
          },
        },
      },
    });
  }

  // ==================================================
  // Find User By Email
  // ==================================================

  static findUserByEmail(
    email: string
  ) {
    return prisma.user.findUnique({
      where: {
        email,
      },

      include: {
        profile: true,
      },
    });
  }

  // ==================================================
  // Link Google Account
  // ==================================================

  static linkGoogleAccount(
    userId: string,
    providerUserId: string,
    providerEmail: string
  ) {
    return prisma.oAuthAccount.create({
      data: {
        provider: OAuthProvider.GOOGLE,

        providerUserId,

        providerEmail,

        user: {
          connect: {
            id: userId,
          },
        },
      },
    });
  }

  // ==================================================
  // Create Google User
  // ==================================================

  static async createGoogleUser(data: {
    email: string;

    firstName: string;

    lastName: string;

    avatarUrl?: string;

    providerUserId: string;

    providerEmail: string;
  }) {
    return prisma.$transaction(
      async (tx) => {
        const user =
          await tx.user.create({
            data: {
              email: data.email,

              profile: {
                create: {
                  firstName:
                    data.firstName,

                  lastName:
                    data.lastName,

                  displayName:
                    `${data.firstName} ${data.lastName}`.trim(),

                  avatarUrl:
                    data.avatarUrl,
                },
              },
            },

            include: {
              profile: true,
            },
          });

        await tx.oAuthAccount.create({
          data: {
            provider:
              OAuthProvider.GOOGLE,

            providerUserId:
              data.providerUserId,

            providerEmail:
              data.providerEmail,

            user: {
              connect: {
                id: user.id,
              },
            },
          },
        });

        return user;
      }
    );
  }
}