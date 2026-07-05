import { OAuth2Client } from "google-auth-library";

import { env } from "../../../core/config/env.js";

import { AppError } from "../../../core/errors/AppError.js";
import { ErrorCode } from "../../../core/errors/ErrorCodes.js";

import { GoogleRepository } from "./google.repository.js";

import { SessionService } from "../services/session.service.js";

import type { AuthResponse } from "../types/auth-response.js";
import type { GoogleLoginRequest } from "../types/google-login-request.js";
import type { GoogleProfile } from "../types/google-profile.js";

const client = new OAuth2Client(
  env.GOOGLE_CLIENT_ID
);

export class GoogleService {
  // ==================================================
  // Verify Google ID Token
  // ==================================================

  static async verifyIdToken(
    idToken: string
  ): Promise<GoogleProfile> {
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
    data: GoogleLoginRequest
  ): Promise<AuthResponse> {
    const profile =
      await this.verifyIdToken(
        data.idToken
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
    } else {
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