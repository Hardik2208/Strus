import { redis } from "../../../core/cache/redis.js";

import type { MyProfileResponse } from "../interfaces/my-profile-response.interface.js";

const CACHE_PREFIX = "user:profile:";

const PROFILE_TTL = 1800; // 30 minutes

export class ProfileCache {
  static async get(
    userId: string
  ): Promise<MyProfileResponse | null> {
    const cached = await redis.get(
      `${CACHE_PREFIX}${userId}`
    );

    if (!cached) {
      return null;
    }

    return JSON.parse(cached) as MyProfileResponse;
  }

  static async set(
    userId: string,
    profile: MyProfileResponse
  ): Promise<void> {
    await redis.set(
      `${CACHE_PREFIX}${userId}`,
      JSON.stringify(profile),
      {
        EX: PROFILE_TTL,
      }
    );
  }

  static async invalidate(
    userId: string
  ): Promise<void> {
    await redis.del(
      `${CACHE_PREFIX}${userId}`
    );
  }
}