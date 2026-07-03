import type {
  NextFunction,
  Request,
  Response,
} from "express";

import {
  UserStatus,
  SessionStatus,
} from "../../../generated/prisma/enums.js";

import { AppError } from "../../../core/errors/AppError.js";
import { ErrorCode } from "../../../core/errors/ErrorCodes.js";

import { AuthRepository } from "../repositories/auth.repository.js";
import { SessionRepository } from "../repositories/session.repository.js";

import { JwtUtil } from "../utils/jwt.util.js";

export async function authenticate(
  req: Request,
  _: Response,
  next: NextFunction
): Promise<void> {
  try {
    // ============================================
    // Authorization Header
    // ============================================

    const authorization =
      req.headers.authorization;

    if (
      !authorization ||
      !authorization.startsWith("Bearer ")
    ) {
      throw new AppError(
        "Unauthorized.",
        401,
        ErrorCode.UNAUTHORIZED
      );
    }

    const token =
      authorization.split(" ")[1]!;

    // ============================================
    // Verify JWT
    // ============================================

    const payload =
      JwtUtil.verifyAccessToken(token);

    // ============================================
    // Verify Session
    // ============================================

    const session =
      await SessionRepository.findActiveById(
        payload.sessionId
      );

    if (
  !session ||
  session.status !== SessionStatus.ACTIVE
) {
  throw new AppError(
    "Your session has ended. Please sign in again.",
    401,
    ErrorCode.SESSION_REVOKED
  );
}

    // ============================================
    // Verify User
    // ============================================

    const user =
      await AuthRepository.findUserById(
        payload.userId
      );

    if (!user) {
      throw new AppError(
        "Unauthorized.",
        401,
        ErrorCode.UNAUTHORIZED
      );
    }

    if (
      user.status !== UserStatus.ACTIVE
    ) {
      throw new AppError(
        "Account is inactive.",
        403,
        ErrorCode.FORBIDDEN
      );
    }

    // ============================================
    // Sliding Session Activity
    // ============================================

    await SessionRepository.updateLastActivity(
      session.id
    );

    // ============================================
    // Attach User
    // ============================================

    req.user = {
      id: user.id,

      sessionId: session.id,

      deviceId: session.deviceId,

      email: user.email,
    };

    next();
  } catch (error) {
    next(error);
  }
}