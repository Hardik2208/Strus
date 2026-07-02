import { Prisma } from "../../../generated/prisma/client.js";
import { prisma } from "../../../core/database/prisma.js";

import { OAuthProvider } from "../../../generated/prisma/enums.js";

export class AuthRepository {
  // ==================================================
  // User
  // ==================================================

  static findUserByEmail(email: string) {
    return prisma.user.findUnique({
      where: {
        email,
      },
      include: {
        profile: true,
      },
    });
  }

  static findUserById(id: string) {
    return prisma.user.findUnique({
      where: {
        id,
      },
      include: {
        profile: true,
      },
    });
  }

  static createUser(
    data: Prisma.UserCreateInput
  ) {
    return prisma.user.create({
      data,
      include: {
        profile: true,
      },
    });
  }

  static deleteUser(userId: string) {
    return prisma.user.delete({
      where: {
        id: userId,
      },
    });
  }

  static updateLastLogin(userId: string) {
    return prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        lastLoginAt: new Date(),
      },
    });
  }

  // ==================================================
  // Device
  // ==================================================

  static findDevice(
    userId: string,
    deviceIdentifier: string
  ) {
    return prisma.device.findUnique({
      where: {
        userId_deviceIdentifier: {
          userId,
          deviceIdentifier,
        },
      },
    });
  }

  static createDevice(
    data: Prisma.DeviceCreateInput
  ) {
    return prisma.device.create({
      data,
    });
  }

  static updateDeviceLastSeen(
    deviceId: string
  ) {
    return prisma.device.update({
      where: {
        id: deviceId,
      },
      data: {
        lastSeenAt: new Date(),
      },
    });
  }

  // ==================================================
  // OAuth
  // ==================================================

  static findOAuthAccount(
    provider: OAuthProvider,
    providerUserId: string
  ) {
    return prisma.oAuthAccount.findUnique({
      where: {
        provider_providerUserId: {
          provider,
          providerUserId,
        },
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

  static createOAuthAccount(
    data: Prisma.OAuthAccountCreateInput
  ) {
    return prisma.oAuthAccount.create({
      data,
    });
  }

  // ==================================================
  // Profile
  // ==================================================

  static findProfile(userId: string) {
    return prisma.userProfile.findUnique({
      where: {
        userId,
      },
    });
  }

  static updateProfile(
    userId: string,
    data: Prisma.UserProfileUpdateInput
  ) {
    return prisma.userProfile.update({
      where: {
        userId,
      },
      data,
    });
  }
}