import { prisma } from "../../../core/database/prisma.js";

export class PasswordRepository {

  // ==================================================
  // Update Password
  // ==================================================

  static updatePassword(
    userId: string,
    passwordHash: string
  ) {
    return prisma.user.update({
      where: {
        id: userId,
      },

      data: {
        passwordHash,

        passwordChangedAt:
          new Date(),
      },

      include: {
        profile: true,
      },
    });
  }
}