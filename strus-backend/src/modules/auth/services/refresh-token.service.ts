import { env } from "../../../core/config/env.js";

import { AppError } from "../../../core/errors/AppError.js";
import { ErrorCode } from "../../../core/errors/ErrorCodes.js";

import { SessionRepository } from "../repositories/session.repository.js";

import { JwtUtil } from "../utils/jwt.util.js";
import { TokenUtil } from "../utils/token.util.js";

import type { AuthResponse } from "../types/auth-response.js";

export class RefreshTokenService {
  // ==================================================
  // Refresh Access Token
  // ==================================================

  static async refresh(
    refreshToken: string
  ): Promise<AuthResponse> {
    // ------------------------------------------
    // Verify Refresh Token
    // ------------------------------------------

    const payload =
      JwtUtil.verifyRefreshToken(
        refreshToken
      );

    // ------------------------------------------
    // Find Session
    // ------------------------------------------

    const session =
      await SessionRepository.findByRefreshTokenHash(
        TokenUtil.hash(refreshToken)
      );

    if (!session) {
      throw new AppError(
        "Invalid refresh token.",
        401,
        ErrorCode.INVALID_TOKEN
      );
    }

    // ------------------------------------------
    // Generate New Tokens
    // ------------------------------------------

    const accessToken =
      JwtUtil.signAccessToken({
        userId: payload.userId,

        sessionId: session.id,

        deviceId: session.deviceId,
      });

    const newRefreshToken =
      JwtUtil.signRefreshToken({
        userId: payload.userId,

        sessionId: session.id,

        deviceId: session.deviceId,
      });

    // ------------------------------------------
    // Rotate Refresh Token
    // ------------------------------------------

    await SessionRepository.updateRefreshToken(
      session.id,

      TokenUtil.hash(newRefreshToken),

      new Date(
  Date.now() +
    30 * 24 * 60 * 60 * 1000
)
    );

    return {
      accessToken,

      refreshToken: newRefreshToken,

      expiresIn: 900,
    };
  }
}