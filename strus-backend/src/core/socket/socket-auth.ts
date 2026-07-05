import type { Socket } from "socket.io";

import {
  UserStatus,
  SessionStatus,
} from "../../generated/prisma/enums.js";

import { AuthRepository } from "../../modules/auth/repositories/auth.repository.js";
import { SessionRepository } from "../../modules/auth/repositories/session.repository.js";

import { JwtUtil } from "../../modules/auth/utils/jwt.util.js";

export async function authenticateSocket(
  socket: Socket,
  next: (error?: Error) => void
): Promise<void> {
  try {
    const authorization =
      socket.handshake.auth.token;

    if (!authorization) {
      return next(
        new Error("Unauthorized.")
      );
    }

    const payload =
      JwtUtil.verifyAccessToken(
        authorization
      );

    const session =
      await SessionRepository.findActiveById(
        payload.sessionId
      );

    if (
      !session ||
      session.status !==
        SessionStatus.ACTIVE
    ) {
      return next(
        new Error(
          "Session revoked."
        )
      );
    }

    const user =
      await AuthRepository.findUserById(
        payload.userId
      );

    if (
      !user ||
      user.status !== UserStatus.ACTIVE
    ) {
      return next(
        new Error("Unauthorized.")
      );
    }

    socket.data.user = {
      id: user.id,
      email: user.email,
      sessionId: session.id,
      deviceId: session.deviceId,
    };

    next();
  } catch {
    next(
      new Error("Unauthorized.")
    );
  }
}