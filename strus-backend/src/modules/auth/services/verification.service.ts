import { DevicePlatform } from "../../../generated/prisma/enums.js";

import { AuthRepository } from "../repositories/auth.repository.js";

import { RegistrationCacheService } from "./registration-cache.service.js";
import { OtpService } from "./otp.service.js";
import { SessionService } from "./session.service.js";

import type { AuthResponse } from "../types/auth-response.js";
import type { VerifyEmailDto } from "../validators/verify-email.schema.js";

export class VerificationService {
  // ==================================================
  // Verify Registration OTP
  // ==================================================

  static async verify(
    data: VerifyEmailDto
  ): Promise<AuthResponse> {
    // ------------------------------------------
    // Verify OTP & Fetch Registration Session
    // ------------------------------------------

    const registration =
      await OtpService.verifyRegistrationOtp(
        data.email,
        data.otp
      );

    let user:
      | Awaited<
          ReturnType<
            typeof AuthRepository.createUser
          >
        >
      | null = null;

    try {
      // ------------------------------------------
      // Create User
      // ------------------------------------------

      user =
        await AuthRepository.createUser({
          email: registration.email,

          passwordHash:
            registration.passwordHash,

          profileCompleted: false,

        });

      // ------------------------------------------
      // Create Login Session
      // ------------------------------------------

      const auth =
        await SessionService.create({
          userId: user.id,

          profileCompleted:
            user.profileCompleted,

          deviceIdentifier:
            data.deviceIdentifier,

          deviceName: data.deviceName,

          platform:
            data.platform as DevicePlatform,

          browser: data.browser,

          operatingSystem:
            data.operatingSystem,
        });

      // ------------------------------------------
      // Registration Completed
      // ------------------------------------------

      await RegistrationCacheService.delete(
        registration.email
      );

      return auth;
    } catch (error) {
      // ------------------------------------------
      // Rollback User
      // ------------------------------------------

      if (user) {
        try {
          await AuthRepository.deleteUser(
            user.id
          );
        } catch {
          // Ignore rollback failure
        }
      }

      throw error;
    }
  }
}