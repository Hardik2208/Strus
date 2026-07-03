import { AppError } from "../../../core/errors/AppError.js";
import { ErrorCode } from "../../../core/errors/ErrorCodes.js";

import { env } from "../../../core/config/env.js";

import { AuthRepository } from "../repositories/auth.repository.js";
import { PasswordRepository } from "../repositories/password.repository.js";
import { SessionRepository } from "../repositories/session.repository.js";

import { ForgotPasswordCacheService } from "../cache/forgot-password-cache.service.js";

import { AuthEmailService } from "../email/auth-email.service.js";

import { JwtUtil } from "../utils/jwt.util.js";
import { PasswordUtil } from "../utils/password.util.js";

export class ResetPasswordService {
  // ==================================================
  // Exchange OTP For Reset Token
  // ==================================================

  static async createResetToken(
    email: string
  ) {
    const token =
      JwtUtil.signResetPasswordToken({
        email,
      });

    return {
      resetToken: token,
    };
  }

  // ==================================================
  // Reset Password
  // ==================================================

  static async resetPassword(
    resetToken: string,
    newPassword: string
  ): Promise<void> {
    const payload =
      JwtUtil.verifyResetPasswordToken(
        resetToken
      );

    const user =
      await AuthRepository.findUserByEmail(
        payload.email
      );

    if (!user || !user.passwordHash) {
      throw new AppError(
        "Invalid reset token.",
        400,
        ErrorCode.INVALID_TOKEN
      );
    }

    const passwordHash =
      await PasswordUtil.hash(
        newPassword
      );

    const updatedUser =
      await PasswordRepository.updatePassword(
        user.id,
        passwordHash
      );

    await SessionRepository.revokeAllSessions(
      user.id
    );

    await ForgotPasswordCacheService.delete(
      user.email
    );

    void AuthEmailService
      .sendPasswordResetEmail(
        updatedUser.email,
          "there"
      )
      .catch(console.error);
  }
}