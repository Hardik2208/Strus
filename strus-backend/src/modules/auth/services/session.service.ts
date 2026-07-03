import crypto from "node:crypto";

import { DevicePlatform } from "../../../generated/prisma/enums.js";

import { AuthRepository } from "../repositories/auth.repository.js";
import { SessionRepository } from "../repositories/session.repository.js";

import { JwtUtil } from "../utils/jwt.util.js";
import { TokenUtil } from "../utils/token.util.js";

import type { AuthResponse } from "../types/auth-response.js";

export class SessionService {
  // ==================================================
  // Create Authenticated Session
  // ==================================================

  static async create(data: {
    userId: string;

    profileCompleted: boolean;

    deviceIdentifier: string;

    deviceName?: string;

    platform: DevicePlatform;

    browser?: string;

    operatingSystem?: string;
  }): Promise<AuthResponse> {
    // ------------------------------------------
    // Find/Create Device
    // ------------------------------------------

    let device =
      await AuthRepository.findDevice(
        data.userId,
        data.deviceIdentifier
      );

    if (!device) {
      device =
        await AuthRepository.createDevice({
          deviceIdentifier:
            data.deviceIdentifier,

          deviceName: data.deviceName,

          platform: data.platform,

          browser: data.browser,

          operatingSystem:
            data.operatingSystem,

          lastSeenAt: new Date(),

          user: {
            connect: {
              id: data.userId,
            },
          },
        });
    } else {
      await AuthRepository.updateDeviceLastSeen(
        device.id
      );
    }

    // ------------------------------------------
    // Generate Session Id
    // ------------------------------------------

    const sessionId =
      crypto.randomUUID();

    // ------------------------------------------
    // Generate JWT Tokens
    // ------------------------------------------

    const accessToken =
      JwtUtil.signAccessToken({
        userId: data.userId,

        sessionId,

        deviceId: device.id,
      });

    const refreshToken =
      JwtUtil.signRefreshToken({
        userId: data.userId,

        sessionId,

        deviceId: device.id,
      });

    // ------------------------------------------
    // Persist Session
    // ------------------------------------------

    await SessionRepository.create({
      id: sessionId,

      refreshTokenHash:
        TokenUtil.hash(refreshToken),

      expiresAt: new Date(
        Date.now() +
          30 *
            24 *
            60 *
            60 *
            1000
      ),

      lastActivityAt: new Date(),

      user: {
        connect: {
          id: data.userId,
        },
      },

      device: {
        connect: {
          id: device.id,
        },
      },
    });

    // ------------------------------------------
    // Update Last Login
    // ------------------------------------------

    await AuthRepository.updateLastLogin(
      data.userId
    );

    const user =
      await AuthRepository.findUserById(
        data.userId
      );

    if (!user) {
      throw new Error(
        "Authenticated user not found."
      );
    }

    // ------------------------------------------
    // Return Tokens
    // ------------------------------------------

    return {
      accessToken,

      refreshToken,

      expiresIn: 900,

      profileCompleted:
        user.profileCompleted,
    };
  }

  // ==================================================
// Get Active Sessions
// ==================================================

static async getSessions(
  userId: string,
  currentSessionId: string
) {
  const sessions =
    await SessionRepository.findActiveSessionsByUserId(
      userId
    );

  return sessions.map((session) => ({
    id: session.id,

    deviceIdentifier:
      session.device.deviceIdentifier,

    deviceName:
      session.device.deviceName,

    platform:
      session.device.platform,

    browser:
      session.device.browser,

    operatingSystem:
      session.device.operatingSystem,

    createdAt:
      session.createdAt,

    lastActivityAt:
      session.lastActivityAt,

    expiresAt:
      session.expiresAt,

    isCurrent:
      session.id === currentSessionId,
  }));
}

// ==================================================
// Logout One Device
// ==================================================

static async logoutSession(
  userId: string,
  sessionId: string
) {
  await SessionRepository.revokeSession(
    userId,
    sessionId
  );
}

// ==================================================
// Logout Other Devices
// ==================================================

static async logoutOtherSessions(
  userId: string,
  currentSessionId: string
) {
  await SessionRepository.revokeOtherSessions(
    userId,
    currentSessionId
  );
}
}