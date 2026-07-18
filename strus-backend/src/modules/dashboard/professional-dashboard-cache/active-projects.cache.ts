import { redis } from "../../../core/cache/redis.js";

export class ProfessionalDashboardActiveProjectsCache {
  private static readonly PREFIX =
    "dashboard:professional:active-projects";

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
    const value =
      await redis.get(
        this.key(userId)
      );

    return value
      ? JSON.parse(value)
      : null;
  }

  static async set(
    userId: string,
    value: unknown
  ): Promise<void> {
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
  ): Promise<void> {
    await redis.del(
      this.key(userId)
    );
  }
}