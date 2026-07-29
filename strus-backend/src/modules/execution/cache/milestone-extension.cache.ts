import { redis } from "../../../core/cache/redis.js";
import { prisma } from "../../../core/database/prisma.js";

import {
  AgreementParticipantRole,
} from "../../../generated/prisma/client.js";

export class MilestoneExtensionCache {
  private static readonly PREFIX =
    "milestone-extension";

  private static readonly TTL =
    60 * 10;

  // ==================================================
  // Cache Key
  // ==================================================

  static extensionKey(
    extensionId: string
  ): string {
    return `${this.PREFIX}:${extensionId}`;
  }

  // ==================================================
  // Get
  // ==================================================

  static async get<T>(
    extensionId: string
  ): Promise<T | null> {
    const value = await redis.get(
      this.extensionKey(extensionId)
    );

    return value
      ? JSON.parse(value)
      : null;
  }

  // ==================================================
  // Set
  // ==================================================

  static async set(
    extensionId: string,
    value: unknown
  ): Promise<void> {
    await redis.set(
      this.extensionKey(extensionId),
      JSON.stringify(value),
      {
        EX: this.TTL,
      }
    );
  }

  // ==================================================
  // Invalidate
  // ==================================================

  static async invalidate(
    extensionId: string
  ): Promise<void> {
    await redis.del(
      this.extensionKey(extensionId)
    );
  }
}