import type { UserProfile } from "../../../generated/prisma/client.js";

import type { ProfileResponse } from "../interfaces/profile-response.interface.js";
import type { UpdateProfileResponse } from "../interfaces/update-profile-response.interface.js";
import type { AvatarResponse } from "../interfaces/avatar-response.interface.js";

export class ProfileMapper {
  static toResponse(profile: UserProfile): ProfileResponse {
    return {
      id: profile.id,
      username: profile.username,
      firstName: profile.firstName,
      lastName: profile.lastName,
      bio: profile.bio,
      avatarUrl: profile.avatarUrl,
      countryCode: profile.countryCode,
      timezone: profile.timezone,
      createdAt: profile.createdAt,
      updatedAt: profile.updatedAt,
    };
  }

  static toUpdatedResponse(
    profile: UserProfile
  ): UpdateProfileResponse {
    return {
      id: profile.id,
      username: profile.username,
      firstName: profile.firstName,
      lastName: profile.lastName,
      bio: profile.bio,
      avatarUrl: profile.avatarUrl,
      countryCode: profile.countryCode,
      timezone: profile.timezone,
      createdAt: profile.createdAt,
      updatedAt: profile.updatedAt,
    };
  }

  static toAvatarResponse(
  profile: UserProfile
): AvatarResponse {
  return {
    avatarUrl: profile.avatarUrl,

    avatarPublicId: profile.avatarPublicId,
  };
}
}