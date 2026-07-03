import { AppError } from "../../../core/errors/AppError.js";
import { ErrorCode } from "../../../core/errors/ErrorCodes.js";

import { AuthRepository } from "../repositories/auth.repository.js";

import { PasswordUtil } from "../utils/password.util.js";

import { OtpService } from "./otp.service.js";

import type { RegisterDto } from "../validators/register.schema.js";

export class RegistrationService {
  // ==================================================
  // Register
  // ==================================================

  static async register(
    data: RegisterDto
  ): Promise<void> {
    const email = data.email
      .trim()
      .toLowerCase();

    // ------------------------------------------
    // User already exists
    // ------------------------------------------

    const existingUser =
      await AuthRepository.findUserByEmail(
        email
      );

    if (existingUser) {
      throw new AppError(
        "Email already exists.",
        409,
        ErrorCode.EMAIL_ALREADY_EXISTS
      );
    }

    // ------------------------------------------
    // Hash Password
    // ------------------------------------------

    const passwordHash =
      await PasswordUtil.hash(
        data.password
      );

    // ------------------------------------------
    // Create Registration Session
    // ------------------------------------------

    await OtpService.sendRegistrationOtp({
      email,

      passwordHash,
    });
  }

  // ==================================================
  // Resend Registration OTP
  // ==================================================

  static async resendOtp(
    email: string
  ): Promise<void> {
    await OtpService.resendOtp(
      email.trim().toLowerCase()
    );
  }
}