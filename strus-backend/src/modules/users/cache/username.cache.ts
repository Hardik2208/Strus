import { redis } from "../../../core/cache/redis.js";

import type { CheckUsernameResponse } from "../interfaces/check-username-response.interface.js";

const CACHE_PREFIX = "username:";

const AVAILABLE_TTL = 120; // 2 minutes

const UNAVAILABLE_TTL = 1800; // 30 minutes

export class UsernameCache {
  static async get(
    username: string
  ): Promise<CheckUsernameResponse | null> {
    const cached = await redis.get(
      `${CACHE_PREFIX}${username}`
    );

    if (!cached) {
      return null;
    }

    return JSON.parse(cached) as CheckUsernameResponse;
  }

  static async set(
    username: string,
    response: CheckUsernameResponse
  ): Promise<void> {
    await redis.set(
      `${CACHE_PREFIX}${username}`,
      JSON.stringify(response),
      {
        EX: response.available
          ? AVAILABLE_TTL
          : UNAVAILABLE_TTL,
      }
    );
  }

  static async invalidate(
    username: string
  ): Promise<void> {
    await redis.del(
      `${CACHE_PREFIX}${username}`
    );
  }
}