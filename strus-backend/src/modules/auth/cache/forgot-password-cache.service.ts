import { redis } from "../../../core/cache/redis.js";

import { AuthConstants } from "../constants/auth.constants.js";

import type { ForgotPasswordSession } from "../types/forgot-password-session.js";

export class ForgotPasswordCacheService {
  // ==================================================
  // Key
  // ==================================================

  private static key(email: string) {
    return `forgot-password:${email}`;
  }

  // ==================================================
  // Save
  // ==================================================

  static async save(
    session: ForgotPasswordSession
  ): Promise<void> {
    await redis.set(
      this.key(session.email),
      JSON.stringify(session),
      {
        EX:
          AuthConstants.FORGOT_PASSWORD_TTL_SECONDS,
      }
    );
  }

  // ==================================================
  // Get
  // ==================================================

  static async get(
    email: string
  ): Promise<ForgotPasswordSession | null> {
    const value = await redis.get(
      this.key(email)
    );

    if (!value) {
      return null;
    }

    return JSON.parse(value);
  }

  // ==================================================
  // Exists
  // ==================================================

  static async exists(
    email: string
  ): Promise<boolean> {
    return (
      (await redis.exists(
        this.key(email)
      )) === 1
    );
  }

  // ==================================================
  // Update
  // ==================================================

  static async update(
    session: ForgotPasswordSession
  ): Promise<void> {
    const ttl = await redis.ttl(
      this.key(session.email)
    );

    await redis.set(
      this.key(session.email),
      JSON.stringify(session),
      {
        EX: ttl > 0 ? ttl : 1,
      }
    );
  }

  // ==================================================
  // Delete
  // ==================================================

  static async delete(
    email: string
  ): Promise<void> {
    await redis.del(this.key(email));
  }

  // ==================================================
  // TTL
  // ==================================================

  static async ttl(
    email: string
  ): Promise<number> {
    return redis.ttl(
      this.key(email)
    );
  }
}