import { AuthConstants } from "../constants/auth.constants.js";

import { AppError } from "../../../core/errors/AppError.js";
import { ErrorCode } from "../../../core/errors/ErrorCodes.js";
import { JwtUtil } from "../utils/jwt.util.js";
import { AuthRepository } from "../repositories/auth.repository.js";

import { ForgotPasswordCacheService } from "../cache/forgot-password-cache.service.js";

import { AuthEmailService } from "../email/auth-email.service.js";

import { OtpUtil } from "../utils/otp.util.js";
import { RetryUtil } from "../utils/retry.util.js";

export class ForgotPasswordService {
  // ==================================================
  // Send Forgot Password OTP
  // ==================================================

  static async sendOtp(
    email: string
  ): Promise<void> {
    email = email
      .trim()
      .toLowerCase();

    // ------------------------------------------
    // Find User
    // ------------------------------------------

    const user =
      await AuthRepository.findUserByEmail(
        email
      );

    // Never reveal whether the email exists.
    if (!user) {
      return;
    }

    // ------------------------------------------
    // Existing Session
    // ------------------------------------------

    const session =
      await ForgotPasswordCacheService.get(
        email
      );

    if (session) {
      // ------------------------------------------
      // Cooldown
      // ------------------------------------------

      if (
        !RetryUtil.canRetry(
          session.nextRetryAt
        )
      ) {
        throw new AppError(
          `Please wait ${RetryUtil.retryAfterSeconds(
            session.nextRetryAt
          )} seconds before requesting another verification code.`,
          429,
          ErrorCode.RATE_LIMITED
        );
      }

      // ------------------------------------------
      // Generate New OTP
      // ------------------------------------------

      const otp =
        OtpUtil.generate();

      session.otpHash =
        OtpUtil.hash(otp);

      session.attemptCount = 0;

      session.resendCount++;

      session.nextRetryAt =
        RetryUtil.nextRetryTime(
          session.resendCount
        ).toISOString();

      await ForgotPasswordCacheService.update(
        session
      );

      void AuthEmailService
        .sendForgotPasswordOtp(
          user.email,
          user.profile?.firstName ??
            "there",
          otp
        )
        .catch(console.error);

      return;
    }

    // ------------------------------------------
    // Create New Session
    // ------------------------------------------

    const otp =
      OtpUtil.generate();

    await ForgotPasswordCacheService.save({
      email,

      otpHash:
        OtpUtil.hash(otp),

      attemptCount: 0,

      resendCount: 0,

      nextRetryAt:
        RetryUtil.nextRetryTime(
          0
        ).toISOString(),

      expiresAt:
        new Date(
          Date.now() +
            AuthConstants.FORGOT_PASSWORD_TTL_SECONDS *
              1000
        ).toISOString(),
    });

    void AuthEmailService
      .sendForgotPasswordOtp(
        user.email,
        user.profile?.firstName ??
          "there",
        otp
      )
      .catch(console.error);
  }

  // ==================================================
// Verify Forgot Password OTP
// ==================================================

static async verifyOtp(
  email: string,
  otp: string
) {
  email = email
    .trim()
    .toLowerCase();

  const session =
    await ForgotPasswordCacheService.get(
      email
    );

  if (!session) {
    throw new AppError(
      "Verification session expired.",
      400,
      ErrorCode.INVALID_TOKEN
    );
  }

  if (
    !OtpUtil.verify(
      otp,
      session.otpHash
    )
  ) {
    session.attemptCount++;

    if (
      session.attemptCount >=
      AuthConstants.OTP_MAX_ATTEMPTS
    ) {
      await ForgotPasswordCacheService.delete(
        email
      );

      throw new AppError(
        "Maximum verification attempts exceeded.",
        400,
        ErrorCode.INVALID_TOKEN
      );
    }

    await ForgotPasswordCacheService.update(
      session
    );

    throw new AppError(
      "Invalid verification code.",
      400,
      ErrorCode.INVALID_TOKEN
    );
  }

  return JwtUtil.signResetPasswordToken({
  email: session.email,
});
}
}

