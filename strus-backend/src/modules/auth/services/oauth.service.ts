import { DevicePlatform, OAuthProvider } from "../../../generated/prisma/enums.js";

import { AuthRepository } from "../repositories/auth.repository.js";

import { SessionService } from "./session.service.js";

import type { AuthResponse } from "../types/auth-response.js";

export class OAuthService {
  // ==================================================
  // Google Login
  // ==================================================

  static async loginWithGoogle(data: {
    providerUserId: string;

    email: string;

    firstName: string;

    lastName: string;

    avatarUrl?: string;

    deviceIdentifier: string;

    deviceName?: string;

    platform: DevicePlatform;

    browser?: string;

    operatingSystem?: string;
  }): Promise<AuthResponse> {
    // ------------------------------------------
    // Existing OAuth Account
    // ------------------------------------------

    const existingOAuth =
      await AuthRepository.findOAuthAccount(
        OAuthProvider.GOOGLE,
        data.providerUserId
      );

    if (existingOAuth) {
      return SessionService.create({
        userId: existingOAuth.user.id,

        profileCompleted:
          existingOAuth.user.profileCompleted,

        deviceIdentifier:
          data.deviceIdentifier,

        deviceName:
          data.deviceName,

        platform:
          data.platform,

        browser:
          data.browser,

        operatingSystem:
          data.operatingSystem,
      });
    }

    // ------------------------------------------
    // Existing Email
    // ------------------------------------------

    let user =
      await AuthRepository.findUserByEmail(
        data.email
      );

    if (!user) {
      user =
        await AuthRepository.createUser({
          email: data.email,
          profileCompleted: false,
        });
    }

    // ------------------------------------------
    // Link OAuth Account
    // ------------------------------------------

    await AuthRepository.createOAuthAccount({
      provider:
        OAuthProvider.GOOGLE,

      providerUserId:
        data.providerUserId,

      providerEmail:
        data.email,

      user: {
        connect: {
          id: user.id,
        },
      },
    });

    // ------------------------------------------
    // Create Session
    // ------------------------------------------

    return SessionService.create({
      userId: user.id,

      profileCompleted:
        user.profileCompleted,

      deviceIdentifier:
        data.deviceIdentifier,

      deviceName:
        data.deviceName,

      platform:
        data.platform,

      browser:
        data.browser,

      operatingSystem:
        data.operatingSystem,
    });
  }
}