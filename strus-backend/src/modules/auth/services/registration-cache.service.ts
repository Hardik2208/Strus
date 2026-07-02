import { redis } from "../../../core/cache/redis.js";

import { RedisKeys } from "../constants/redis.keys.js";
import { AuthConstants } from "../constants/auth.constants.js";

import type { RegistrationSession } from "../types/registration-session.js";

export class RegistrationCacheService {
  // ==================================================
  // Create Registration Session
  // ==================================================

  static async create(
    session: RegistrationSession
  ): Promise<void> {
    await redis.set(
      RedisKeys.signup(session.email),
      JSON.stringify(session),
      {
        EX: AuthConstants.REGISTRATION_TTL_SECONDS,
      }
    );
  }

  // ==================================================
  // Get Registration Session
  // ==================================================

  static async get(
    email: string
  ): Promise<RegistrationSession | null> {
    const value = await redis.get(
      RedisKeys.signup(email)
    );

    if (!value) {
      return null;
    }

    return JSON.parse(value) as RegistrationSession;
  }

  // ==================================================
  // Delete Registration Session
  // ==================================================

  static async delete(
    email: string
  ): Promise<void> {
    await redis.del(
      RedisKeys.signup(email)
    );
  }

  // ==================================================
  // Replace Registration Session
  // ==================================================

  static async update(
    session: RegistrationSession
  ): Promise<void> {
    await this.create(session);
  }

  // ==================================================
  // Check Existence
  // ==================================================

  static async exists(
    email: string
  ): Promise<boolean> {
    return (
      (await redis.exists(
        RedisKeys.signup(email)
      )) === 1
    );
  }

  // ==================================================
  // Remaining TTL
  // ==================================================

  static async ttl(
    email: string
  ): Promise<number> {
    return redis.ttl(
      RedisKeys.signup(email)
    );
  }
}