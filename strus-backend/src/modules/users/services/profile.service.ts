import { prisma } from "../../../core/database/prisma.js";

import { AppError } from "../../../core/errors/AppError.js";
import { ErrorCode } from "../../../core/errors/ErrorCodes.js";

import type { UpdateUsernameDto } from "../dtos/update-username.dto.js";
import type { UpdateUsernameResponse } from "../interfaces/update-username-response.interface.js";
import { ProfileMapper } from "../mappers/profile.mapper.js";
import { MyProfileMapper } from "../mappers/my-profile.mapper.js";
import type { UpdateProfileDto } from "../dtos/update-profile.dto.js";
import type { UpdateProfileResponse } from "../interfaces/update-profile-response.interface.js";
import { profileRepository } from "../repositories/profile.repository.js";

import { UsernameUtil } from "../utils/username.util.js";
import { ProfileValidator } from "../validators/profile.validator.js";

import { UsernameCache } from "../cache/username.cache.js";
import { ProfileCache } from "../cache/profile.cache.js";

import type { CreateProfileDto } from "../dtos/create-profile.dto.js";
import type { ProfileResponse } from "../interfaces/profile-response.interface.js";
import type { MyProfileResponse } from "../interfaces/my-profile-response.interface.js";

export class ProfileService {
  // ==================================================
  // Create Profile
  // ==================================================

  static async create(
    userId: string,
    data: CreateProfileDto
  ): Promise<ProfileResponse> {
    // ------------------------------------------
    // Already completed
    // ------------------------------------------

    const existingProfile =
      await profileRepository.findByUserId(userId);

    if (existingProfile) {
      throw new AppError(
        "Profile already completed.",
        409,
        ErrorCode.PROFILE_ALREADY_COMPLETED
      );
    }

    // ------------------------------------------
    // Normalize Username
    // ------------------------------------------

    const username =
      UsernameUtil.normalize(data.username);

    // ------------------------------------------
    // Reserved Username
    // ------------------------------------------

    if (
      ProfileValidator.isReservedUsername(
        username
      )
    ) {
      throw new AppError(
        "Username is reserved.",
        400,
        ErrorCode.USERNAME_UNAVAILABLE
      );
    }

    // ------------------------------------------
    // Prohibited Username
    // ------------------------------------------

    if (
      ProfileValidator.containsProhibitedWord(
        username
      )
    ) {
      throw new AppError(
        "Username contains prohibited words.",
        400,
        ErrorCode.USERNAME_UNAVAILABLE
      );
    }

    // ------------------------------------------
    // Username Exists
    // ------------------------------------------

    const exists =
      await profileRepository.usernameExists(
        username
      );

    if (exists) {
      throw new AppError(
        "Username already exists.",
        409,
        ErrorCode.USERNAME_ALREADY_EXISTS
      );
    }

    // ------------------------------------------
    // Country
    // ------------------------------------------

    if (
      !ProfileValidator.isValidCountryCode(
        data.countryCode
      )
    ) {
      throw new AppError(
        "Invalid country code.",
        400,
        ErrorCode.INVALID_COUNTRY_CODE
      );
    }

    // ------------------------------------------
    // Timezone
    // ------------------------------------------

    if (
      !ProfileValidator.isValidTimezone(
        data.timezone
      )
    ) {
      throw new AppError(
        "Invalid timezone.",
        400,
        ErrorCode.INVALID_TIMEZONE
      );
    }

    // ------------------------------------------
    // Transaction
    // ------------------------------------------

    const response = await prisma.$transaction(
      async (tx) => {
        const profile =
          await profileRepository.create(tx, {
            user: {
              connect: {
                id: userId,
              },
            },

            username,

            firstName: data.firstName.trim(),

            lastName: data.lastName.trim(),

            bio: data.bio?.trim(),

            countryCode:
              data.countryCode.toUpperCase(),

            timezone: data.timezone,
          });

        await tx.user.update({
          where: {
            id: userId,
          },

          data: {
            profileCompleted: true,
          },
        });

        return ProfileMapper.toResponse(profile);
      }
    );

    // ------------------------------------------
    // Cache
    // ------------------------------------------

    await UsernameCache.invalidate(username);

    await ProfileCache.invalidate(userId);

    return response;
  }

  // ==================================================
  // Get My Profile
  // ==================================================

  static async getMyProfile(
    userId: string
  ): Promise<MyProfileResponse> {
    // ------------------------------------------
    // Cache
    // ------------------------------------------

    const cached =
      await ProfileCache.get(userId);

    if (cached) {
      return cached;
    }

    // ------------------------------------------
    // Database
    // ------------------------------------------

    const user =
      await profileRepository.getMyProfile(
        userId
      );

    if (!user || !user.profile) {
      throw new AppError(
        "Profile not found.",
        404,
        ErrorCode.PROFILE_NOT_FOUND
      );
    }

    const response =
      MyProfileMapper.toResponse(user);

    // ------------------------------------------
    // Cache
    // ------------------------------------------

    await ProfileCache.set(
      userId,
      response
    );

    return response;
  }

  static async updateProfile(
  userId: string,
  data: UpdateProfileDto
): Promise<UpdateProfileResponse> {
  if (
    !ProfileValidator.isValidCountryCode(
      data.countryCode
    )
  ) {
    throw new AppError(
      "Invalid country code.",
      400,
      ErrorCode.INVALID_COUNTRY_CODE
    );
  }

  if (
    !ProfileValidator.isValidTimezone(
      data.timezone
    )
  ) {
    throw new AppError(
      "Invalid timezone.",
      400,
      ErrorCode.INVALID_TIMEZONE
    );
  }

  const existing =
    await profileRepository.findByUserId(userId);

  if (!existing) {
    throw new AppError(
      "Profile not found.",
      404,
      ErrorCode.PROFILE_NOT_FOUND
    );
  }

  const profile =
    await prisma.$transaction(async (tx) => {
      return profileRepository.updateProfile(
        tx,
        userId,
        {
          firstName: data.firstName.trim(),
          lastName: data.lastName.trim(),
          bio: data.bio?.trim() ?? null,
          countryCode:
            data.countryCode.toUpperCase(),
          timezone: data.timezone,
        }
      );
    });

  await ProfileCache.invalidate(userId);

  return ProfileMapper.toUpdatedResponse(
    profile
  );
}


}