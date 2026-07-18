import { redis } from "../../../core/cache/redis.js";

export class ProfessionalDashboardRecentActivityCache {
  private static readonly PREFIX =
    "dashboard:professional:activity";

  private static readonly TTL =
    60 * 2;

  private static key(
    userId: string,
    limit: number
  ): string {
    return `${this.PREFIX}:${userId}:${limit}`;
  }

  static async get<T>(
    userId: string,
    limit: number
  ): Promise<T | null> {
    const value =
      await redis.get(
        this.key(
          userId,
          limit
        )
      );

    return value
      ? JSON.parse(value)
      : null;
  }

  static async set(
    userId: string,
    value: unknown,
    limit: number
  ): Promise<void> {
    await redis.set(
      this.key(
        userId,
        limit
      ),
      JSON.stringify(value),
      {
        EX: this.TTL,
      }
    );
  }

  static async invalidate(
    userId: string
  ): Promise<void> {
    const keys =
      await redis.keys(
        `${this.PREFIX}:${userId}:*`
      );

    if (keys.length) {
      await redis.del(keys);
    }
  }
}