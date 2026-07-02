import { AppError } from "../../../core/errors/AppError.js";
import { ErrorCode } from "../../../core/errors/ErrorCodes.js";

import { RegistrationCacheService } from "./registration-cache.service.js";
import { EmailService } from "./email.service.js";

import { RegistrationSessionUtil } from "../utils/registration-session.util.js";
import { RetryUtil } from "../utils/retry.util.js";
import { OtpUtil } from "../utils/otp.util.js";

import { AuthConstants } from "../constants/auth.constants.js";

export class OtpService {
  // ==================================================
  // Send Registration OTP
  // ==================================================

  static async sendRegistrationOtp(data: {
    firstName: string;
    lastName: string;
    email: string;
    passwordHash: string;
  }): Promise<void> {
    const { otp, session } =
      RegistrationSessionUtil.create(data);

    await RegistrationCacheService.create(
      session
    );

    await EmailService.sendVerificationOtp(
      session.email,
      session.firstName,
      otp
    );
  }

  // ==================================================
  // Verify Registration OTP
  // ==================================================

  static async verifyRegistrationOtp(
    email: string,
    otp: string
  ) {
    const session =
      await RegistrationCacheService.get(
        email
      );

    if (!session) {
      throw new AppError(
        "Registration session expired.",
        400,
        ErrorCode.INVALID_TOKEN
      );
    }

    // ------------------------------------------
    // Invalid OTP
    // ------------------------------------------

    if (
      !OtpUtil.verify(
        otp,
        session.otpHash
      )
    ) {
      session.attemptCount++;

      // Maximum Attempts
      if (
        session.attemptCount >=
        AuthConstants.OTP_MAX_ATTEMPTS
      ) {
        await RegistrationCacheService.delete(
          session.email
        );

        throw new AppError(
          "Maximum verification attempts exceeded. Please register again.",
          400,
          ErrorCode.INVALID_TOKEN
        );
      }

      await RegistrationCacheService.update(
        session
      );

      throw new AppError(
        "Invalid verification code.",
        400,
        ErrorCode.INVALID_TOKEN
      );
    }

    return session;
  }

  // ==================================================
  // Resend OTP
  // ==================================================

  static async resendOtp(
    email: string
  ): Promise<void> {
    const session =
      await RegistrationCacheService.get(
        email
      );

    if (!session) {
      throw new AppError(
        "Registration session expired.",
        400,
        ErrorCode.INVALID_TOKEN
      );
    }

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
        )} seconds before requesting another OTP.`,
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

    session.resendCount++;

    session.nextRetryAt =
      RetryUtil.nextRetryTime(
        session.resendCount
      ).toISOString();

    session.attemptCount = 0;

    await RegistrationCacheService.update(
      session
    );

    await EmailService.sendVerificationOtp(
      session.email,
      session.firstName,
      otp
    );
  }
}