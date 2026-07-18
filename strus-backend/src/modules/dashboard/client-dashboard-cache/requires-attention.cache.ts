import { redis } from "../../../core/cache/redis.js";

export class ClientDashboardRequiresAttentionCache {
  private static readonly PREFIX =
    "dashboard:client:attention";

  private static readonly TTL =
    60 * 5;

  private static key(
    userId: string
  ): string {
    return `${this.PREFIX}:${userId}`;
  }

  static async get<T>(
    userId: string
  ): Promise<T | null> {
    const value = await redis.get(
      this.key(userId)
    );

    return value
      ? JSON.parse(value)
      : null;
  }

  static async set(
    userId: string,
    value: unknown
  ) {
    await redis.set(
      this.key(userId),
      JSON.stringify(value),
      {
        EX: this.TTL,
      }
    );
  }

  static async invalidate(
    userId: string
  ) {
    await redis.del(
      this.key(userId)
    );
  }
}