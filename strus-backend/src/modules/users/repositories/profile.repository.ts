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

}


export const profileRepository = new ProfileRepository();