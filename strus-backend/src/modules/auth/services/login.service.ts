import { DevicePlatform } from "../../../generated/prisma/enums.js";

import { AppError } from "../../../core/errors/AppError.js";
import { ErrorCode } from "../../../core/errors/ErrorCodes.js";

import { AuthRepository } from "../repositories/auth.repository.js";

import { PasswordUtil } from "../utils/password.util.js";

import { SessionService } from "./session.service.js";

import type { AuthResponse } from "../types/auth-response.js";

export class LoginService {
  // ==================================================
  // Login
  // ==================================================

  static async login(data: {
    email: string;

    password: string;

    deviceIdentifier: string;

    deviceName?: string;

    platform: DevicePlatform;

    browser?: string;

    operatingSystem?: string;
  }): Promise<AuthResponse> {
    const email =
      data.email.trim().toLowerCase();

    // ------------------------------------------
    // Find User
    // ------------------------------------------

    const user =
      await AuthRepository.findUserByEmail(
        email
      );

    if (!user || !user.passwordHash) {
      throw new AppError(
        "Invalid email or password.",
        401,
        ErrorCode.INVALID_CREDENTIALS
      );
    }

    // ------------------------------------------
    // Verify Password
    // ------------------------------------------

    const valid =
      await PasswordUtil.verify(
        data.password,
        user.passwordHash
      );

    if (!valid) {
      throw new AppError(
        "Invalid email or password.",
        401,
        ErrorCode.INVALID_CREDENTIALS
      );
    }

    // ------------------------------------------
    // Create Session
    // ------------------------------------------

    return SessionService.create({
      userId: user.id,

      deviceIdentifier:
        data.deviceIdentifier,

      deviceName: data.deviceName,

      platform: data.platform,

      browser: data.browser,

      operatingSystem:
        data.operatingSystem,
    });
  }
}