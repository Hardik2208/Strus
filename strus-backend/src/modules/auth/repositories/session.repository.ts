import { Prisma } from "../../../generated/prisma/client.js";
import { prisma } from "../../../core/database/prisma.js";

import { SessionStatus } from "../../../generated/prisma/enums.js";
import { AppError } from "../../../core/errors/AppError.js";
import { ErrorCode } from "../../../core/errors/ErrorCodes.js";

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
  // Find Active Session
  // ==================================================

  static findActiveById(
    sessionId: string
  ) {
    return prisma.session.findFirst({
      where: {
        id: sessionId,
        status: SessionStatus.ACTIVE,
      },
    });
  }

  // ==================================================
  // Update Last Activity
  // ==================================================

  static updateLastActivity(
    sessionId: string
  ) {
    return prisma.session.update({
      where: {
        id: sessionId,
      },
      data: {
        lastActivityAt: new Date(),
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

  // ==================================================
// Revoke All Sessions
// ==================================================

static revokeAllByUserId(
  userId: string
) {
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

  static revokeAll(
    userId: string
  ) {
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

  // ==================================================
// Get Active Sessions By User
// ==================================================

static findActiveSessionsByUserId(
  userId: string
) {
  return prisma.session.findMany({
    where: {
      userId,
      status: SessionStatus.ACTIVE,
    },

    include: {
      device: true,
    },

    orderBy: {
      lastActivityAt: "desc",
    },
  });
}

// ==================================================
// Revoke One Session
// ==================================================

static async revokeSession(
  userId: string,
  sessionId: string
) {
  const session = await prisma.session.findFirst({
    where: {
      id: sessionId,
      userId,
      status: SessionStatus.ACTIVE,
    },
  });

  if (!session) {
    throw new AppError(
      "Session not found.",
      404,
      ErrorCode.SESSION_NOT_FOUND
    );
  }

  return prisma.session.update({
    where: {
      id: session.id,
    },
    data: {
      status: SessionStatus.REVOKED,
      revokedAt: new Date(),
    },
  });
}

// ==================================================
// Revoke Other Sessions
// ==================================================

static revokeOtherSessions(
  userId: string,
  currentSessionId: string
) {
  return prisma.session.updateMany({
    where: {
      userId,

      status: SessionStatus.ACTIVE,

      id: {
        not: currentSessionId,
      },
    },

    data: {
      status: SessionStatus.REVOKED,
      revokedAt: new Date(),
    },
  });
}
}

