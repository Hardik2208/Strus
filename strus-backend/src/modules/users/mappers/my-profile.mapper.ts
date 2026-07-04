import type { Prisma } from "../../../generated/prisma/client.js";

import type { MyProfileResponse } from "../interfaces/my-profile-response.interface.js";
import type { UpdateProfileResponse } from "../interfaces/update-profile-response.interface.js";

export type MyProfilePayload = Prisma.UserGetPayload<{
  select: {
    id: true;
    email: true;
    profileCompleted: true;
    verificationLevel: true;
    lastLoginAt: true;
    createdAt: true;
    updatedAt: true;
    profile: {
      select: {
        username: true;
        firstName: true;
        lastName: true;
        bio: true;
        avatarUrl: true;
        countryCode: true;
        timezone: true;
      };
    };
  };
}>;

export class MyProfileMapper {
  static toResponse(user: MyProfilePayload): MyProfileResponse {
    if (!user.profile) {
      throw new Error("Profile not found.");
    }

    return {
      id: user.id,
      email: user.email,
      profileCompleted: user.profileCompleted,
      verificationLevel: user.verificationLevel,
      username: user.profile.username,
      firstName: user.profile.firstName,
      lastName: user.profile.lastName,
      bio: user.profile.bio,
      avatarUrl: user.profile.avatarUrl,
      countryCode: user.profile.countryCode,
      timezone: user.profile.timezone,
      lastLoginAt: user.lastLoginAt,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}