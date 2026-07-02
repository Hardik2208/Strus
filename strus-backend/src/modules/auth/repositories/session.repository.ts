import { Prisma } from "../../../generated/prisma/client.js";
import { prisma } from "../../../core/database/prisma.js";

import { SessionStatus } from "../../../generated/prisma/enums.js";

export class SessionRepository {
  // ==================================================
  // Create Session
  // ==================================================

  static create(
    data: Prisma.SessionCreateInput
  ) {
    return prisma.session.create({
      data,
    });
  }

  // ==================================================
  // Find By Refresh Token
  // ==================================================

  static findByRefreshTokenHash(
    refreshTokenHash: string
  ) {
    return prisma.session.findFirst({
      where: {
        refreshTokenHash,
        status: SessionStatus.ACTIVE,
      },
    });
  }

  // ==================================================
  // Update Refresh Token
  // ==================================================

  static updateRefreshToken(
    sessionId: string,
    refreshTokenHash: string,
    expiresAt: Date
  ) {
    return prisma.session.update({
      where: {
        id: sessionId,
      },
      data: {
        refreshTokenHash,

        expiresAt,

        lastActivityAt: new Date(),
      },
    });
  }

  // ==================================================
  // Find Session
  // ==================================================

  static findById(
    sessionId: string
  ) {
    return prisma.session.findUnique({
      where: {
        id: sessionId,
      },
    });
  }

  // ==================================================
  // Revoke Session
  // ==================================================

  static revoke(sessionId: string) {
    return prisma.session.update({
      where: {
        id: sessionId,
      },
      data: {
        status: SessionStatus.REVOKED,

        revokedAt: new Date(),
      },
    });
  }

  // ==================================================
// Delete Session
// ==================================================

static delete(
  sessionId: string
) {
  return prisma.session.delete({
    where: {
      id: sessionId,
    },
  });
}

  // ==================================================
  // Revoke All Sessions
  // ==================================================

  static revokeAll(userId: string) {
    return prisma.session.updateMany({
      where: {
        userId,

        status: SessionStatus.ACTIVE,
      },
      data: {
        status: SessionStatus.REVOKED,

        revokedAt: new Date(),
      },
    });
  }
}