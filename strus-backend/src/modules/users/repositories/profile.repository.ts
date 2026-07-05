import type {
  Prisma,
  UserProfile,
} from "../../../generated/prisma/client.js";

import { prisma } from "../../../core/database/prisma.js";

export class ProfileRepository {
  async findByUserId(userId: string): Promise<UserProfile | null> {
    return prisma.userProfile.findUnique({
      where: {
        userId,
      },
    });
  }

  async findByUsername(username: string): Promise<UserProfile | null> {
    return prisma.userProfile.findUnique({
      where: {
        username,
      },
    });
  }

  async usernameExists(username: string): Promise<boolean> {
    const profile = await prisma.userProfile.findUnique({
      where: {
        username,
      },
      select: {
        id: true,
      },
    });

    return profile !== null;
  }

  async create(
    tx: Prisma.TransactionClient,
    data: Prisma.UserProfileCreateInput
  ): Promise<UserProfile> {
    return tx.userProfile.create({
      data,
    });
  }

  async update(
    tx: Prisma.TransactionClient,
    userId: string,
    data: Prisma.UserProfileUpdateInput
  ): Promise<UserProfile> {
    return tx.userProfile.update({
      where: {
        userId,
      },
      data,
    });
  }

  async getMyProfile(userId: string) {
  return prisma.user.findUnique({
    where: {
      id: userId,
    },

    select: {
      id: true,

      email: true,

      profileCompleted: true,

      verificationLevel: true,

      lastLoginAt: true,

      createdAt: true,

      updatedAt: true,

      profile: {
        select: {
          username: true,

          firstName: true,

          lastName: true,

          bio: true,

          avatarUrl: true,

          countryCode: true,

          timezone: true,
        },
      },
    },
  });
}

async updateProfile(
  tx: Prisma.TransactionClient,
  userId: string,
  data: Prisma.UserProfileUpdateInput
): Promise<UserProfile> {
  return tx.userProfile.update({
    where: {
      userId,
    },
    data,
  });
}

async updateUsername(
  tx: Prisma.TransactionClient,
  userId: string,
  username: string
): Promise<UserProfile> {
  return tx.userProfile.update({
    where: {
      userId,
    },
    data: {
      username,
    },
  });
}

async updateAvatar(
  tx: Prisma.TransactionClient,
  userId: string,
  avatarUrl: string,
  avatarPublicId: string
): Promise<UserProfile> {
  return tx.userProfile.update({
    where: {
      userId,
    },

    data: {
      avatarUrl,
      avatarPublicId,
    },
  });
}

async removeAvatar(
  tx: Prisma.TransactionClient,
  userId: string
): Promise<UserProfile> {
  return tx.userProfile.update({
    where: {
      userId,
    },

    data: {
      avatarUrl: null,
      avatarPublicId: null,
    },
  });
}

async searchUsers(query: string) {
  return prisma.user.findMany({
    where: {
      profileCompleted: true,

      profile: {
        is: {
          OR: [
            {
              username: {
                contains: query,
                mode: "insensitive",
              },
            },
            {
              firstName: {
                contains: query,
                mode: "insensitive",
              },
            },
            {
              lastName: {
                contains: query,
                mode: "insensitive",
              },
            },
          ],
        },
      },
    },

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

    take: 20,
  });
}

async searchProfiles(
  query: string,
  page: number,
  limit: number,
  options?: {
    excludeUserIds?: string[];
  }
): Promise<{
  items: {
    id: string;
    username: string;
    firstName: string;
    lastName: string;
    avatarUrl: string | null;
  }[];

  total: number;
}> {
  const where: Prisma.UserProfileWhereInput = {
    OR: [
      {
        username: {
          contains: query,
          mode: "insensitive",
        },
      },
      {
        firstName: {
          contains: query,
          mode: "insensitive",
        },
      },
      {
        lastName: {
          contains: query,
          mode: "insensitive",
        },
      },
    ],

    ...(options?.excludeUserIds?.length
      ? {
          userId: {
            notIn:
              options.excludeUserIds,
          },
        }
      : {}),
  };

  const [items, total] =
    await prisma.$transaction([
      prisma.userProfile.findMany({
        where,

        select: {
          id: true,
          username: true,
          firstName: true,
          lastName: true,
          avatarUrl: true,
        },

        orderBy: {
          username: "asc",
        },

        skip: (page - 1) * limit,

        take: limit,
      }),

      prisma.userProfile.count({
        where,
      }),
    ]);

  return {
    items,
    total,
  };
}
}


export const profileRepository = new ProfileRepository();