import { AppError } from "../../../core/errors/AppError.js";
import { ErrorCode } from "../../../core/errors/ErrorCodes.js";

import { SessionRepository } from "../repositories/session.repository.js";

import { JwtUtil } from "../utils/jwt.util.js";
import { TokenUtil } from "../utils/token.util.js";

export class LogoutService {
  static async logout(
    refreshToken: string
  ): Promise<void> {
    const payload =
      JwtUtil.verifyRefreshToken(
        refreshToken
      );

    const session =
      await SessionRepository.findById(
        payload.sessionId
      );

    if (!session) {
      throw new AppError(
        "Invalid refresh token.",
        401,
        ErrorCode.INVALID_TOKEN
      );
    }

    if (
      session.refreshTokenHash !==
      TokenUtil.hash(refreshToken)
    ) {
      throw new AppError(
        "Invalid refresh token.",
        401,
        ErrorCode.INVALID_TOKEN
      );
    }

    await SessionRepository.delete(
      session.id
    );
  }

  // ==================================================
// Logout All Devices
// ==================================================

static async logoutAll(
  userId: string
): Promise<void> {

  await SessionRepository.revokeAllSessions(
    userId
  );

}
}