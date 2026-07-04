import { prisma } from "../../../core/database/prisma.js";

import { AppError } from "../../../core/errors/AppError.js";
import { ErrorCode } from "../../../core/errors/ErrorCodes.js";

import { CloudinaryService } from "../../../core/storage/cloudinary.service.js";

import { ProfileCache } from "../cache/profile.cache.js";

import { profileRepository } from "../repositories/profile.repository.js";

import { ProfileMapper } from "../mappers/profile.mapper.js";

import type { AvatarResponse } from "../interfaces/avatar-response.interface.js";

export class AvatarService {
  // ==================================================
  // Upload Avatar
  // ==================================================

  static async upload(
    userId: string,
    file?: Express.Multer.File
  ): Promise<AvatarResponse> {
    if (!file) {
      throw new AppError(
        "Avatar is required.",
        400,
        ErrorCode.AVATAR_NOT_FOUND
      );
    }

    const profile =
      await profileRepository.findByUserId(
        userId
      );

    if (!profile) {
      throw new AppError(
        "Profile not found.",
        404,
        ErrorCode.PROFILE_NOT_FOUND
      );
    }

    // ------------------------------------------
    // Delete Previous Avatar
    // ------------------------------------------

    if (profile.avatarPublicId) {
      await CloudinaryService.delete(
        profile.avatarPublicId
      );
    }

    // ------------------------------------------
    // Upload New Avatar
    // ------------------------------------------

    const uploaded =
      await CloudinaryService.upload(
        file.buffer,
        {
          folder:
            "strus/users/avatars",

          publicId: userId,
        }
      );

    // ------------------------------------------
    // Save
    // ------------------------------------------

    const updated =
      await prisma.$transaction(
        async (tx) => {
          return profileRepository.updateAvatar(
            tx,
            userId,
            uploaded.url,
            uploaded.publicId
          );
        }
      );

    // ------------------------------------------
    // Cache
    // ------------------------------------------

    await ProfileCache.invalidate(
      userId
    );

    return ProfileMapper.toAvatarResponse(
      updated
    );
  }

  // ==================================================
  // Delete Avatar
  // ==================================================

  static async remove(
    userId: string
  ): Promise<void> {
    const profile =
      await profileRepository.findByUserId(
        userId
      );

    if (!profile) {
      throw new AppError(
        "Profile not found.",
        404,
        ErrorCode.PROFILE_NOT_FOUND
      );
    }

    if (!profile.avatarPublicId) {
      throw new AppError(
        "Avatar not found.",
        404,
        ErrorCode.AVATAR_NOT_FOUND
      );
    }

    // ------------------------------------------
    // Delete Cloudinary
    // ------------------------------------------

    await CloudinaryService.delete(
      profile.avatarPublicId
    );

    // ------------------------------------------
    // Remove Database
    // ------------------------------------------

    await prisma.$transaction(
      async (tx) => {
        await profileRepository.removeAvatar(
          tx,
          userId
        );
      }
    );

    // ------------------------------------------
    // Cache
    // ------------------------------------------

    await ProfileCache.invalidate(
      userId
    );
  }
}