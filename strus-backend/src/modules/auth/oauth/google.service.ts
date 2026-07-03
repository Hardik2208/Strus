import { OAuth2Client } from "google-auth-library";

import { env } from "../../../core/config/env.js";

import { DevicePlatform } from "../../../generated/prisma/enums.js";

import { AppError } from "../../../core/errors/AppError.js";
import { ErrorCode } from "../../../core/errors/ErrorCodes.js";

import { GoogleRepository } from "./google.repository.js";

import { SessionService } from "../services/session.service.js";

import type { AuthResponse } from "../types/auth-response.js";

const client = new OAuth2Client(
  env.GOOGLE_CLIENT_ID
);

export class GoogleService {
  // ==================================================
  // Verify Google ID Token
  // ==================================================

  static async verifyIdToken(
    idToken: string
  ) {
    const ticket =
      await client.verifyIdToken({
        idToken,

        audience:
          env.GOOGLE_CLIENT_ID,
      });

    const payload =
      ticket.getPayload();

    if (
      !payload ||
      !payload.sub ||
      !payload.email
    ) {
      throw new AppError(
        "Invalid Google account.",
        401,
        ErrorCode.INVALID_TOKEN
      );
    }

    return {
      googleId: payload.sub,

      email:
        payload.email.toLowerCase(),

      firstName:
        payload.given_name ?? "",

      lastName:
        payload.family_name ?? "",

      avatarUrl:
        payload.picture,
    };
  }

  // ==================================================
  // Google Login
  // ==================================================

  static async login(
    idToken: string,
    device: {
      deviceIdentifier: string;

      deviceName?: string;

      platform: DevicePlatform;

      browser?: string;

      operatingSystem?: string;
    }
  ): Promise<AuthResponse> {
    const profile =
      await this.verifyIdToken(
        idToken
      );

    // ------------------------------------------
    // Existing Google Account
    // ------------------------------------------

    const oauth =
      await GoogleRepository.findUserByGoogleId(
        profile.googleId
      );

    if (oauth) {
      return SessionService.create({
        userId:
          oauth.user.id,

        profileCompleted:
    oauth.user.profileCompleted,

        deviceIdentifier:
          device.deviceIdentifier,

        deviceName:
          device.deviceName,

        platform:
          device.platform,

        browser:
          device.browser,

        operatingSystem:
          device.operatingSystem,
      });
    }

    // ------------------------------------------
    // Existing Email Account
    // ------------------------------------------

    let user =
      await GoogleRepository.findUserByEmail(
        profile.email
      );

    if (user) {
      await GoogleRepository.linkGoogleAccount(
        user.id,

        profile.googleId,

        profile.email
      );
    }

    // ------------------------------------------
    // New User
    // ------------------------------------------

    else {
      user =
        await GoogleRepository.createGoogleUser({
          email:
            profile.email,

          firstName:
            profile.firstName,

          lastName:
            profile.lastName,

          avatarUrl:
            profile.avatarUrl,

          providerUserId:
            profile.googleId,

          providerEmail:
            profile.email,
        });
    }

    // ------------------------------------------
    // Create Session
    // ------------------------------------------

    return SessionService.create({
      userId:
        user.id,

      profileCompleted:
        user.profileCompleted,

      deviceIdentifier:
        device.deviceIdentifier,

      deviceName:
        device.deviceName,

      platform:
        device.platform,

      browser:
        device.browser,

      operatingSystem:
        device.operatingSystem,
    });
  }
}