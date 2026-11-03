import { redis } from "../../../core/cache/redis.js";

export class ProjectAssetCache {
  private static readonly PREFIX = "execution:assets:";
  private static readonly TTL = 60 * 10; // 10 minutes

  // ==================================================
  // Cache Keys
  // ==================================================

  static key(projectId: string, participantId?: string): string {
    if (participantId) {
      return `${this.PREFIX}${projectId}:${participantId}`;
    }
    return `${this.PREFIX}${projectId}`;
  }

  // ==================================================
  // Get Cache
  // ==================================================

  static async get<T>(key: string): Promise<T | null> {
    try {
      const data = await redis.get(key);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  }

  // ==================================================
  // Set Cache
  // ==================================================

  static async set(
    key: string,
    data: unknown,
    ttlSeconds: number = this.TTL
  ): Promise<void> {
    try {
      await redis.set(key, JSON.stringify(data), {
        EX: ttlSeconds,
      });
    } catch {
      // Non-blocking cache failure
    }
  }

  // ==================================================
  // Invalidate Cache
  // ==================================================

  static async invalidate(projectId: string): Promise<void> {
    try {
      const pattern = `${this.PREFIX}${projectId}*`;
      const keys = await redis.keys(pattern);
      if (keys.length > 0) {
        await redis.del(keys);
      }
    } catch {
      // Non-blocking cache failure
    }
  }
}
