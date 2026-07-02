import { SessionRepository } from "../repositories/session.repository.js";

import { JwtUtil } from "../utils/jwt.util.js";
import { TokenUtil } from "../utils/token.util.js";

export class LogoutService {
  // ==================================================
  // Logout Current Session
  // ==================================================

  static async logout(
    refreshToken: string
  ) {
    const payload =
      JwtUtil.verifyRefreshToken(
        refreshToken
      );

    const session =
      await SessionRepository.findByRefreshTokenHash(
        TokenUtil.hash(refreshToken)
      );

    if (!session) {
      return;
    }

    await SessionRepository.revoke(
      session.id
    );
  }

  // ==================================================
  // Logout All Devices
  // ==================================================

  static async logoutAll(
    userId: string
  ) {
    await SessionRepository.revokeAll(
      userId
    );
  }
}