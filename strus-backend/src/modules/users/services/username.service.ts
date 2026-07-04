import { profileRepository } from "../repositories/profile.repository.js";

import { UsernameUtil } from "../utils/username.util.js";
import { UsernameCache } from "../cache/username.cache.js";
import { prisma } from "../../../core/database/prisma.js";

import { AppError } from "../../../core/errors/AppError.js";
import { ErrorCode } from "../../../core/errors/ErrorCodes.js";


import { ProfileCache } from "../cache/profile.cache.js";

import { ProfileValidator } from "../validators/profile.validator.js";

import type { UpdateUsernameDto } from "../dtos/update-username.dto.js";
import type { UpdateUsernameResponse } from "../interfaces/update-username-response.interface.js";
import type { CheckUsernameResponse } from "../interfaces/check-username-response.interface.js";

export class UsernameService {
  static async checkAvailability(
    username: string
  ): Promise<CheckUsernameResponse> {
    // ------------------------------------------
    // Normalize
    // ------------------------------------------

    const normalizedUsername =
      UsernameUtil.normalize(username);

    // ------------------------------------------
    // Format
    // ------------------------------------------

    if (
      !UsernameUtil.isValid(normalizedUsername)
    ) {
      return {
        available: false,
        reason: "INVALID_USERNAME",
      };
    }

    // ------------------------------------------
    // Reserved
    // ------------------------------------------

    if (
      UsernameUtil.isReserved(
        normalizedUsername
      )
    ) {
      return {
        available: false,
        reason: "USERNAME_UNAVAILABLE",
      };
    }

    // ------------------------------------------
    // Prohibited
    // ------------------------------------------

    if (
      UsernameUtil.containsProhibitedWord(
        normalizedUsername
      )
    ) {
      return {
        available: false,
        reason: "USERNAME_UNAVAILABLE",
      };
    }
// ------------------------------------------
// Redis
// ------------------------------------------

const cached =
  await UsernameCache.get(normalizedUsername);

if (cached) {
  return cached;
}

// ------------------------------------------
// Database
// ------------------------------------------

const exists =
  await profileRepository.usernameExists(
    normalizedUsername
  );

const response: CheckUsernameResponse = exists
  ? {
      available: false,
      reason: "USERNAME_UNAVAILABLE",
    }
  : {
      available: true,
    };

// ------------------------------------------
// Cache
// ------------------------------------------

await UsernameCache.set(
  normalizedUsername,
  response
);

return response;
  }

  static async update(
  userId: string,
  dto: UpdateUsernameDto
): Promise<UpdateUsernameResponse> {
  const profile =
    await profileRepository.findByUserId(userId);

  if (!profile) {
    throw new AppError(
      "Profile not found.",
      404,
      ErrorCode.PROFILE_NOT_FOUND
    );
  }

  const username =
    UsernameUtil.normalize(dto.username);

  if (!UsernameUtil.isValid(username)) {
    throw new AppError(
      "Invalid username.",
      400,
      ErrorCode.INVALID_USERNAME
    );
  }

  if (
    UsernameUtil.isReserved(username)
  ) {
    throw new AppError(
      "Username unavailable.",
      400,
      ErrorCode.USERNAME_UNAVAILABLE
    );
  }

  if (
    UsernameUtil.containsProhibitedWord(
      username
    )
  ) {
    throw new AppError(
      "Username unavailable.",
      400,
      ErrorCode.USERNAME_UNAVAILABLE
    );
  }

  if (profile.username === username) {
    return {
      username,
    };
  }

  const exists =
    await profileRepository.usernameExists(
      username
    );

  if (exists) {
    throw new AppError(
      "Username unavailable.",
      409,
      ErrorCode.USERNAME_UNAVAILABLE
    );
  }

  const updated =
    await prisma.$transaction(async (tx) => {
      return profileRepository.updateUsername(
        tx,
        userId,
        username
      );
    });

  await UsernameCache.invalidate(profile.username);

  await UsernameCache.invalidate(updated.username);

  await ProfileCache.invalidate(userId);

  return {
    username: updated.username,
  };
}
}